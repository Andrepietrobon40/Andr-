export interface Chapter {
  title: string;
  description: string;
  content: string;
  imageUrls: string[];
}

export interface Book {
  title: string;
  author: string;
  topic: string;
  audience: string;
  tone: string;
  bookLength: string;
  chapters: Chapter[];
  coverImageUrl: string;
  coverPrompt: string;
  bookType: 'standard' | 'coloring';
  fontFamily?: string;
  fontSize?: number;
}
