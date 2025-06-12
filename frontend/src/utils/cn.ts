import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  const merged = clsx(inputs);
  
  // If the string contains ring classes, don't use twMerge (it removes ring colors)
  if (merged.includes('ring-') && (merged.includes('ring-yellow') || merged.includes('ring-red') || merged.includes('ring-blue') || merged.includes('ring-green'))) {
    return merged;
  }
  
  return twMerge(merged);
}