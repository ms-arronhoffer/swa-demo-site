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
  created_at: string;
}

export interface Category {
  name: string;
  icon?: string;
}

export interface Config {
  title: string;
  subtitle: string;
  passwordHash: string;
  categories: Category[];
  demos: Demo[];
}
