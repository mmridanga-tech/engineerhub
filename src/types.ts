export type ThemeMode = 'dark' | 'light';

export type AccentColor = 'indigo' | 'violet' | 'emerald' | 'cyan' | 'rose';

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  toolCount: number;
  popularTag: string;
  color: string;
}

export interface ToolItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  fullDetails?: string;
  category: 'Electrical' | 'Civil' | 'Mechanical' | 'Construction' | 'PDF Tools' | 'AI Tools' | 'Electronics' | 'Solar' | 'General';
  iconName: string;
  badge?: string;
  isPopular?: boolean;
  tags: string[];
  specs?: { label: string; value: string }[];
}

export interface WhyPillar {
  id: string;
  title: 'Fast' | 'Free' | 'Professional' | 'Accurate' | 'Mobile Friendly' | string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badgeText: string;
  metrics: string;
}

export interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: 'General Inquiry' | 'Feature Request' | 'Bug Report' | 'Enterprise';
  message: string;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error';
}

