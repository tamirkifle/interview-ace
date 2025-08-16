import {
  LayoutDashboard,
  BookOpen,
  Mic,
  BarChart,
  Settings,
  type LucideIcon,
  MessageCircleQuestion,
  Target,
  Video,
} from 'lucide-react';

export const navigationIcons: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Questions: MessageCircleQuestion,
  Practice: Target,
  Stories: BookOpen,
  Recordings: Video,
  Analytics: BarChart,
  Settings: Settings,
};

export const getIcon = (name: string): LucideIcon => {
  return navigationIcons[name] || LayoutDashboard;
};