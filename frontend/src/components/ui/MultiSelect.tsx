import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from './Badge';
import { Category } from '../../types';
import { cn } from '../../utils/cn';

interface MultiSelectProps {
  categories: Category[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect = ({
  categories,
  selectedIds,
  onChange,
  placeholder = "Search categories...",
  className
}: MultiSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategories = categories.filter(cat => selectedIds.includes(cat.id));

  const handleToggleCategory = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      onChange(selectedIds.filter(id => id !== categoryId));
    } else {
      onChange([...selectedIds, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    onChange(selectedIds.filter(id => id !== categoryId));
  };

  return (
    <div className={cn("relative", className)}>
      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCategories.map((category) => (
            <Badge
              key={category.id}
              variant="colored"
              color={category.color}
              size="sm"
              className="flex items-center gap-1"
            >
              {category.name}
              <button
                type="button"
                onClick={() => handleRemoveCategory(category.id)}
                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? 'No categories match your search' : 'No categories available'}
            </div>
          ) : (
            filteredCategories.map((category) => {
              const isSelected = selectedIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleToggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors",
                    isSelected && "bg-primary-50"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <div
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <div className={cn(
                      "w-4 h-4 border-2 rounded flex items-center justify-center",
                      isSelected
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "border-gray-300"
                    )}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};