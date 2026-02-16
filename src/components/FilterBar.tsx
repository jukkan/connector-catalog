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

  const FilterChip = ({
    label,
    active,
    onClick,
    color = 'blue'
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    color?: 'green' | 'blue' | 'gray' | 'purple' | 'yellow';
  }) => {
    const colorClasses = {
      green: active ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
      blue: active ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
      gray: active ? 'bg-gray-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
      purple: active ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
      yellow: active ? 'bg-yellow-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
    };

    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${colorClasses[color]}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Type Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Certified"
            active={selectedTypes.includes('certified')}
            onClick={() => toggleType('certified')}
            color="green"
          />
          <FilterChip
            label="Independent Publisher"
            active={selectedTypes.includes('independent')}
            onClick={() => toggleType('independent')}
            color="blue"
          />
          <FilterChip
            label="Custom"
            active={selectedTypes.includes('custom')}
            onClick={() => toggleType('custom')}
            color="gray"
          />
        </div>
      </div>

      {/* Auth Type Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Authentication</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="OAuth2"
            active={selectedAuthTypes.includes('oauth2')}
            onClick={() => toggleAuthType('oauth2')}
            color="purple"
          />
          <FilterChip
            label="API Key"
            active={selectedAuthTypes.includes('apiKey')}
            onClick={() => toggleAuthType('apiKey')}
            color="blue"
          />
          <FilterChip
            label="Basic"
            active={selectedAuthTypes.includes('basic')}
            onClick={() => toggleAuthType('basic')}
            color="yellow"
          />
          <FilterChip
            label="None"
            active={selectedAuthTypes.includes('none')}
            onClick={() => toggleAuthType('none')}
            color="gray"
          />
        </div>
      </div>

      {/* Triggers Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Has Triggers</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Yes"
            active={hasTriggers === true}
            onClick={() => onTriggersChange(hasTriggers === true ? null : true)}
            color="green"
          />
          <FilterChip
            label="No"
            active={hasTriggers === false}
            onClick={() => onTriggersChange(hasTriggers === false ? null : false)}
            color="gray"
          />
        </div>
      </div>

      {/* Categories Filter */}
      {allCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.slice(0, 15).map(category => (
              <FilterChip
                key={category}
                label={category}
                active={selectedCategories.includes(category)}
                onClick={() => toggleCategory(category)}
                color="blue"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
