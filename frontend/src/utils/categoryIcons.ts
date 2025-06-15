import {
  LayoutDashboard,
  BookOpen,
  Mic,
  BarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export const navigationIcons: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Stories: BookOpen,
  Practice: Mic,
  Analytics: BarChart,
  Settings: Settings,
};

export const getIcon = (name: string): LucideIcon => {
  return navigationIcons[name] || LayoutDashboard;
};