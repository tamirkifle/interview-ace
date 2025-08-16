import React from 'react';
import { cn } from '../../utils/cn';

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