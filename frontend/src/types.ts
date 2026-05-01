export interface Demo {
  id: string;
  title: string;
  description: string;
  category: string;
  demo_url: string;
  repo_url: string | null;
  thumbnail_url: string | null;
  featured: boolean;
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface DemoCreate {
  title: string;
  description: string;
  category: string;
  demo_url: string;
  repo_url?: string;
  thumbnail_url?: string;
  featured: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface UserInfo {
  name: string;
  id: string | null;
  roles: string[];
}
