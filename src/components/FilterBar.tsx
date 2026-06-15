function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-block group align-middle ml-1">
      <svg
        className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 bottom-full mb-2 z-10 w-56 rounded-md bg-gray-900 dark:bg-gray-700 px-2.5 py-1.5 text-xs leading-relaxed text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {text}
      </span>
    </span>
  );
}

interface FilterBarProps {
  selectedTypes: string[];
  selectedAuthTypes: string[];
  hasTriggers: boolean | null;
  selectedCategories: string[];
  allCategories: string[];
  onTypeChange: (types: string[]) => void;
  onAuthTypeChange: (authTypes: string[]) => void;
  onTriggersChange: (value: boolean | null) => void;
  onCategoryChange: (categories: string[]) => void;
}

export default function FilterBar({
  selectedTypes,
  selectedAuthTypes,
  hasTriggers,
  selectedCategories,
  allCategories,
  onTypeChange,
  onAuthTypeChange,
  onTriggersChange,
  onCategoryChange,
}: FilterBarProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const toggleAuthType = (authType: string) => {
    if (selectedAuthTypes.includes(authType)) {
      onAuthTypeChange(selectedAuthTypes.filter(t => t !== authType));
    } else {
      onAuthTypeChange([...selectedAuthTypes, authType]);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearAllFilters = () => {
    onTypeChange([]);
    onAuthTypeChange([]);
    onTriggersChange(null);
    onCategoryChange([]);
  };

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedAuthTypes.length > 0 ||
    hasTriggers !== null ||
    selectedCategories.length > 0;

  const FilterChip = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Type Filters */}
      <div className="space-y-2">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</h3>
          <InfoTip text="Independent Publisher connectors are all Premium tier and require a Power Platform Premium license to use." />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Certified"
            active={selectedTypes.includes('certified')}
            onClick={() => toggleType('certified')}
          />
          <FilterChip
            label="Independent"
            active={selectedTypes.includes('independent')}
            onClick={() => toggleType('independent')}
          />
          <FilterChip
            label="Custom"
            active={selectedTypes.includes('custom')}
            onClick={() => toggleType('custom')}
          />
        </div>
      </div>

      {/* Auth Type Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Auth</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="OAuth2"
            active={selectedAuthTypes.includes('oauth2')}
            onClick={() => toggleAuthType('oauth2')}
          />
          <FilterChip
            label="API Key"
            active={selectedAuthTypes.includes('apiKey')}
            onClick={() => toggleAuthType('apiKey')}
          />
          <FilterChip
            label="Basic"
            active={selectedAuthTypes.includes('basic')}
            onClick={() => toggleAuthType('basic')}
          />
          <FilterChip
            label="None"
            active={selectedAuthTypes.includes('none')}
            onClick={() => toggleAuthType('none')}
          />
        </div>
      </div>

      {/* Triggers Filter */}
      <div className="space-y-2">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Triggers</h3>
          <InfoTip text="Triggers respond to events in an external service (e.g. a new email, a form submission) and can start a Power Automate flow automatically." />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Has triggers"
            active={hasTriggers === true}
            onClick={() => onTriggersChange(hasTriggers === true ? null : true)}
          />
          <FilterChip
            label="Actions only"
            active={hasTriggers === false}
            onClick={() => onTriggersChange(hasTriggers === false ? null : false)}
          />
        </div>
      </div>

      {/* Categories Filter */}
      {allCategories.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</h3>
          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-0.5">
            {allCategories.map(category => (
              <FilterChip
                key={category}
                label={category}
                active={selectedCategories.includes(category)}
                onClick={() => toggleCategory(category)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="pt-1">
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
