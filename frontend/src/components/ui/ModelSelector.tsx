import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ModelInfo } from '../../types/apiKeys';

interface ModelSelectorProps {
  models: ModelInfo[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ModelSelector = ({ 
  models, 
  value, 
  onChange, 
  placeholder = "Select a model...",
  disabled = false 
}: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModel = models.find(m => m.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {selectedModel ? (
              <div>
                <div className="font-medium text-gray-900 truncate">
                  {selectedModel.displayName || selectedModel.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {selectedModel.id}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">{placeholder}</div>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
          {models.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No models available
            </div>
          ) : (
            <ul className="py-1">
              {models.map((model) => (
                <li key={model.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                      ${value === model.id ? 'bg-primary-50' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {model.displayName || model.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {model.id}
                        </div>
                        {model.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {model.description}
                          </div>
                        )}
                      </div>
                      {value === model.id && (
                        <Check className="w-4 h-4 text-primary-600 ml-2 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};