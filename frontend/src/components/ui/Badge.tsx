import React from 'react';
import { cn } from '../../utils/cn';
import { Briefcase, Code, Building2 } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'colored' | 'outline' | 'square';
  size?: 'xs' | 'sm' | 'md';
  color?: string;
  className?: string;
}

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

const variantClasses = {
  default: 'bg-gray-100 text-gray-800',
  outline: 'border border-gray-300 text-gray-700 bg-white',
  colored: '', // Will be set dynamically
  square: 'border border-gray-300 text-gray-700 bg-white rounded-0 py-1 px-1'
};

export const getSourceBadge = (question: any) => {
  const sourceInfo = question.sourceInfo;
  if (!sourceInfo) return null;

  const getSourceConfig = () => {
    switch (sourceInfo.type) {
      case 'job':
        return {
          icon: <Building2 className="w-3 h-3" />,
          color: '#3B82F6',
          label: sourceInfo.displayName
        };
      case 'experience':
        return {
          icon: <Briefcase className="w-3 h-3" />,
          color: '#8B5CF6',
          label: sourceInfo.displayName
        };
      case 'project':
        return {
          icon: <Code className="w-3 h-3" />,
          color: '#10B981',
          label: sourceInfo.displayName
        };
      case 'custom':
        return {
          icon: null,
          color: '#F59E0B',
          label: 'Custom'
        };
      default:
        return {
          icon: null,
          color: '#6B7280',
          label: 'Generated'
        };
    }
  };

  const config = getSourceConfig();
  
  return (
    <Badge
      variant="square"
      color={config.color}
      size="xs"
      className="flex items-center gap-1"
    >
      {config.icon}
      <span className="max-w-[120px]">{config.label}</span>
    </Badge>
  );
};

export const getDifficultyBadge = (difficulty: string) => {
  const colors: { [key: string]: string } = {
    easy: '#059669',
    medium: '#EA580C',
    hard: '#DC2626'
  };
  return (
    <Badge
      variant="colored"
      color={colors[difficulty]}
      size="xs"
    >
      {difficulty}
    </Badge>
  );
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  color, 
  className 
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  // Handle colored variant with custom color
  const getCustomStyles = (): React.CSSProperties | undefined => {
    if (variant === 'colored' && color) {
      return {
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      };
    }
    else if (variant === 'square') {
      return {
        borderRadius: 0,
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      };
    }
    return undefined;
  };

  const customStyles = getCustomStyles();
  const isCustomColor = variant === 'colored' && color;

  return (
    <span
      className={cn(
        baseClasses,
        sizeClasses[size],
        !isCustomColor && variantClasses[variant],
        className
      )}
      style={customStyles}
    >
      {children}
    </span>
  );
};