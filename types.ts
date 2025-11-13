
export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: string;
};

export enum SpecialFolder {
  All = 'all',
  Favorites = 'favorites',
  Archived = 'archived',
  Trash = 'trash',
}

export type ActiveFolder = {
  id: string;
  type: 'folder' | 'special';
};

export type Theme = 'light' | 'dark';
   