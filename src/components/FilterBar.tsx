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
  }) => {
    return (
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
  };

  return (
    <div className="space-y-3">
      {/* Type Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
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

      {/* Auth Type Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auth:</span>
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

      {/* Triggers Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Triggers:</span>
        <FilterChip
          label="Yes"
          active={hasTriggers === true}
          onClick={() => onTriggersChange(hasTriggers === true ? null : true)}
        />
        <FilterChip
          label="No"
          active={hasTriggers === false}
          onClick={() => onTriggersChange(hasTriggers === false ? null : false)}
        />
      </div>

      {/* Categories Filter */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap items-start gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-1">Category:</span>
          <div className="flex-1">
            <select
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  toggleCategory(e.target.value);
                }
              }}
            >
              <option value="">Select a category...</option>
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCategories.map(category => (
                  <FilterChip
                    key={category}
                    label={category}
                    active={true}
                    onClick={() => toggleCategory(category)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="pt-2">
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
