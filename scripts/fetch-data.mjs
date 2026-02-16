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
  execSync(`git clone --depth 1 --branch ${BRANCH} ${REPO_URL} ${tempDir}`, {
    stdio: 'inherit'
  });
  console.log('Repository cloned successfully.');
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
 */
function getMetadataValue(metadata, propertyName) {
  if (!Array.isArray(metadata)) return null;
  const item = metadata.find(m => m.name === propertyName);
  return item ? item.value : null;
}

/**
 * Process a single connector directory
 */
function processConnector(connectorPath, connectorId, type) {
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
  let description = swagger.info?.description || '';
  if (description.length > 200) {
    description = description.substring(0, 200);
  }

  // Extract metadata
  const metadata = swagger.info?.['x-ms-connector-metadata'];
  const categories = getMetadataValue(metadata, 'Categories');
  const website = getMetadataValue(metadata, 'Website');

  // Extract publisher
  const publisher = properties?.properties?.publisher || swagger.info?.['x-ms-api-annotation']?.family || 'Unknown';

  // Extract brand color
  const brandColor = properties?.properties?.iconBrandColor || null;

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
    website
  };
}

/**
 * Scan all connector directories
 */
function scanConnectors(tempDir) {
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
        const connector = processConnector(connectorPath, entry.name, type);
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
      const categories = connector.categories.split(',').map(c => c.trim());
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

    // Scan and process connectors
    const connectors = scanConnectors(tempDir);
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
