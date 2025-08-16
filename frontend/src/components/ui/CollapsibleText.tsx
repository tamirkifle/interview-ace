import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CollapsibleTextProps {
  text: string;
  wordLimit?: number;
  className?: string;
}

export const CollapsibleText = ({ text, wordLimit = 50, className }: CollapsibleTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = text.split(/\s+/);
  const isCollapsible = words.length > wordLimit;

  if (!isCollapsible) {
    return <p className={cn("text-sm text-gray-600 whitespace-pre-wrap", className)}>{text}</p>;
  }

  const previewText = words.slice(0, wordLimit).join(' ') + '...';
  const fullText = text;

  return (
    <div className={cn("text-sm", className)}>
      <p className="text-gray-600 whitespace-pre-wrap">
        {isExpanded ? fullText : previewText}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-xs flex items-center"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4 mr-1" />
            Hide details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-1" />
            Show details
          </>
        )}
      </button>
    </div>
  );
};