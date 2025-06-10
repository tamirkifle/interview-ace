export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
}

export interface Recording {
  id: string;
  filename: string;
  duration: number;
  minio_key: string;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  traits: Trait[];
  recordings: Recording[];
}

export interface Question {
  id: string;
  text: string;
  difficulty: string;
  commonality: number;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  traits: Trait[];
} 