import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_URL = 'https://github.com/microsoft/PowerPlatformConnectors.git';
const BRANCH = 'dev';
const CONNECTOR_TYPES = [
  { dir: 'certified-connectors', type: 'certified' },
  { dir: 'independent-publisher-connectors', type: 'independent' },
  { dir: 'custom-connectors', type: 'custom' }
];

/**
 * Clone the PowerPlatformConnectors repository
 */
function cloneRepo(tempDir) {
  console.log('Cloning PowerPlatformConnectors repository...');
  execSync(`git clone --filter=blob:none --branch ${BRANCH} ${REPO_URL} ${tempDir}`, {
    stdio: 'inherit'
  });
  console.log('Repository cloned successfully.');
}

/**
 * Extract first-added and last-updated dates for each connector from git history
 * Returns a Map keyed by connector directory path (e.g. "certified-connectors/Salesforce")
 */
function getConnectorDates(tempDir) {
  console.log('Extracting connector dates from git history...');
  const gitLog = execSync(
    'git log --format="COMMIT %aI" --name-only --diff-filter=ACMR',
    { cwd: tempDir, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 }
  );

  const dateMap = new Map();
  let currentDate = null;

  for (const line of gitLog.split('\n')) {
    if (line.startsWith('COMMIT ')) {
      currentDate = line.slice(7).trim();
    } else if (line.trim() && currentDate) {
      const parts = line.trim().split('/');
      if (parts.length >= 2) {
        const connectorDir = `${parts[0]}/${parts[1]}`;
        const existing = dateMap.get(connectorDir);
        if (!existing) {
          dateMap.set(connectorDir, { firstDate: currentDate, lastDate: currentDate });
        } else {
          // git log outputs newest commits first, so currentDate gets older over time
          existing.firstDate = currentDate;
        }
      }
    }
  }

  console.log(`Extracted dates for ${dateMap.size} connector directories.`);
  return dateMap;
}

/**
 * Parse JSON file with BOM handling
 */
function parseJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const content = raw.replace(/^\uFEFF/, ''); // Remove BOM
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Failed to parse ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract metadata value from x-ms-connector-metadata array
 * Handles both {name, value} and {propertyName, propertyValue} formats
 */
function getMetadataValue(metadata, propertyName) {
  if (!Array.isArray(metadata)) return null;
  const item = metadata.find(
    m => m.name === propertyName || m.propertyName === propertyName
  );
  if (!item) return null;
  return item.value ?? item.propertyValue ?? null;
}

/**
 * Process a single connector directory
 */
function processConnector(connectorPath, connectorId, type, dateMap) {
  const swaggerPath = path.join(connectorPath, 'apiDefinition.swagger.json');
  const propertiesPath = path.join(connectorPath, 'apiProperties.json');

  if (!fs.existsSync(swaggerPath)) {
    return null;
  }

  const swagger = parseJsonFile(swaggerPath);
  if (!swagger) return null;

  const properties = fs.existsSync(propertiesPath) ? parseJsonFile(propertiesPath) : {};

  // Extract basic information
  const displayName = swagger.info?.title || connectorId;
  const description = swagger.info?.description || '';

  // Extract metadata (can be at root level or inside info)
  const metadata = swagger['x-ms-connector-metadata'] || swagger.info?.['x-ms-connector-metadata'];
  const categories = getMetadataValue(metadata, 'Categories');
  const website = getMetadataValue(metadata, 'Website');

  // Extract contact information
  const contactUrl = swagger.info?.contact?.url || null;
  const contactName = swagger.info?.contact?.name || null;

  // Extract publisher
  const publisher = properties?.properties?.publisher || swagger.info?.['x-ms-api-annotation']?.family || 'Unknown';

  // Extract brand color
  const brandColor = properties?.properties?.iconBrandColor || null;

  // API version from swagger
  const apiVersion = swagger.info?.version || null;

  // Privacy policy from connector metadata
  const rawPrivacyPolicy = getMetadataValue(metadata, 'Privacy policy') || 
                           getMetadataValue(metadata, 'Privacy Policy') || null;
  let privacyPolicy = null;
  if (rawPrivacyPolicy) {
    try {
      const urlStr = rawPrivacyPolicy.startsWith('www.') ? `https://${rawPrivacyPolicy}` : rawPrivacyPolicy;
      const parsed = new URL(urlStr);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        privacyPolicy = rawPrivacyPolicy;
      }
    } catch {
      // Not a valid URL, skip
    }
  }

  // Capabilities from apiProperties (e.g., ["cloud"], ["onPremiseGateway"])
  const rawCapabilities = properties?.properties?.capabilities || [];
  const capabilities = rawCapabilities.map(c => String(c).toLowerCase());

  // Extract auth type
  let authType = 'none';
  if (swagger.securityDefinitions) {
    const authTypes = Object.keys(swagger.securityDefinitions);
    if (authTypes.length > 0) {
      const firstAuth = swagger.securityDefinitions[authTypes[0]];
      authType = firstAuth.type || 'unknown';
    }
  }

  // Count operations, actions, and triggers
  let operationCount = 0;
  let actionCount = 0;
  let triggerCount = 0;

  if (swagger.paths) {
    for (const pathKey of Object.keys(swagger.paths)) {
      const pathItem = swagger.paths[pathKey];
      for (const method of Object.keys(pathItem)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
          operationCount++;
          const operation = pathItem[method];
          const operationType = operation?.['x-ms-trigger'];
          if (operationType === 'single' || operationType === 'batch') {
            triggerCount++;
          } else {
            actionCount++;
          }
        }
      }
    }
  }

  // Look up dates from the date map
  const typeDir = CONNECTOR_TYPES.find(t => t.type === type)?.dir;
  const dateKey = typeDir ? `${typeDir}/${connectorId}` : null;
  const dates = dateKey ? dateMap.get(dateKey) : null;

  return {
    id: connectorId,
    displayName,
    description,
    publisher,
    type,
    brandColor,
    authType,
    operationCount,
    actionCount,
    triggerCount,
    hasTriggers: triggerCount > 0,
    categories,
    website,
    contactUrl,
    contactName,
    firstCommitDate: dates?.firstDate ?? null,
    lastCommitDate: dates?.lastDate ?? null,
    apiVersion,
    privacyPolicy,
    capabilities
  };
}

/**
 * Scan all connector directories
 */
function scanConnectors(tempDir, dateMap) {
  const connectors = [];

  for (const { dir, type } of CONNECTOR_TYPES) {
    const connectorDir = path.join(tempDir, dir);

    if (!fs.existsSync(connectorDir)) {
      console.warn(`Warning: Directory ${dir} not found`);
      continue;
    }

    console.log(`Scanning ${dir}...`);
    const entries = fs.readdirSync(connectorDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const connectorPath = path.join(connectorDir, entry.name);
        const connector = processConnector(connectorPath, entry.name, type, dateMap);
        if (connector) {
          connectors.push(connector);
        }
      }
    }
    console.log(`Found ${connectors.filter(c => c.type === type).length} connectors in ${dir}`);
  }

  return connectors;
}

/**
 * Generate statistics from connectors
 */
function generateStats(connectors) {
  const stats = {
    total: connectors.length,
    byType: {},
    byCategory: {},
    byAuthType: {},
    timestamp: new Date().toISOString()
  };

  // Count by type
  for (const connector of connectors) {
    stats.byType[connector.type] = (stats.byType[connector.type] || 0) + 1;
  }

  // Count by category
  for (const connector of connectors) {
    if (connector.categories) {
      const categories = connector.categories.split(';').map(c => c.trim());
      for (const category of categories) {
        if (category) {
          stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        }
      }
    }
  }

  // Count by auth type
  for (const connector of connectors) {
    stats.byAuthType[connector.authType] = (stats.byAuthType[connector.authType] || 0) + 1;
  }

  // Count recently updated and recently added (within last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  stats.recentlyUpdated = connectors.filter(
    c => c.lastCommitDate && c.lastCommitDate >= ninetyDaysAgo
  ).length;
  stats.recentlyAdded = connectors.filter(
    c => c.firstCommitDate && c.firstCommitDate >= ninetyDaysAgo
  ).length;

  // Count by capability
  stats.byCapability = {};
  for (const connector of connectors) {
    if (connector.capabilities && connector.capabilities.length > 0) {
      for (const cap of connector.capabilities) {
        stats.byCapability[cap] = (stats.byCapability[cap] || 0) + 1;
      }
    }
  }

  // Count connectors with privacy policy
  stats.withPrivacyPolicy = connectors.filter(c => c.privacyPolicy).length;

  return stats;
}

/**
 * Clean up temp directory
 */
function cleanupTempDir(tempDir) {
  console.log('Cleaning up temporary directory...');
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Cleanup complete.');
}

/**
 * Main execution
 */
async function main() {
  const tempDir = path.join('/tmp', `PowerPlatformConnectors-${Date.now()}`);
  const projectRoot = path.resolve(__dirname, '..');
  const outputDir = path.join(projectRoot, 'src', 'data');

  try {
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Clone repository
    cloneRepo(tempDir);

    // Extract connector dates from git history
    const dateMap = getConnectorDates(tempDir);

    // Scan and process connectors
    const connectors = scanConnectors(tempDir, dateMap);
    console.log(`\nTotal connectors processed: ${connectors.length}`);

    // Generate statistics
    const stats = generateStats(connectors);

    // Write output files
    const connectorsPath = path.join(outputDir, 'connectors.json');
    const statsPath = path.join(outputDir, 'stats.json');

    fs.writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2));
    console.log(`\nConnectors data written to: ${connectorsPath}`);

    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`Statistics written to: ${statsPath}`);

    // Clean up
    cleanupTempDir(tempDir);

    console.log('\nData fetch completed successfully!');
  } catch (error) {
    console.error('Error during data fetch:', error);
    // Attempt cleanup even on error
    if (fs.existsSync(tempDir)) {
      cleanupTempDir(tempDir);
    }
    process.exit(1);
  }
}

main();
