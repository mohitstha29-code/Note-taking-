
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Note, Folder, Theme, ActiveFolder, SpecialFolder } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- Sample Data ---
const getInitialNotes = (): Note[] => [
  {
    id: 'note-1',
    title: 'Welcome to Gemini Notes!',
    content: '## Welcome! \n\nThis is a feature-rich, AI-powered note-taking app. You can use **Markdown** to format your notes. \n\n* Create new notes\n* Organize them into folders\n* Use AI to summarize, improve writing, and more!',
    tags: ['welcome', 'guide'],
    folderId: null,
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Project Ideas',
    content: '### Brainstorming Session\n\n1.  **AI-driven recipe generator:** Input ingredients, get recipes.\n2.  **Personal finance tracker:** With budgeting and expense analysis.\n3.  **Interactive learning platform:** For coding tutorials with live feedback.',
    tags: ['projects', 'ideas', 'brainstorm'],
    folderId: 'folder-1',
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
    {
    id: 'note-3',
    title: 'Archived Meeting Notes',
    content: 'Q3 planning meeting summary.',
    tags: ['meeting', 'planning'],
    folderId: null,
    isPinned: false,
    isFavorite: false,
    isArchived: true,
    isTrashed: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
    {
    id: 'note-4',
    title: 'Deleted Item',
    content: 'This note was moved to the trash.',
    tags: [],
    folderId: null,
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrashed: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const getInitialFolders = (): Folder[] => [
  { id: 'folder-1', name: 'Work Projects', createdAt: new Date().toISOString() },
  { id: 'folder-2', name: 'Personal', createdAt: new Date().toISOString() },
];


interface AppContextType {
  notes: Note[];
  folders: Folder[];
  theme: Theme;
  activeFolder: ActiveFolder;
  activeNoteId: string | null;
  searchTerm: string;
  createNote: (folderId: string | null) => void;
  updateNote: (note: Partial<Note> & { id: string }) => void;
  deleteNote: (id: string, permanent?: boolean) => void;
  toggleNoteProperty: (id: string, prop: 'isPinned' | 'isFavorite' | 'isArchived') => void;
  restoreNote: (id: string) => void;
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  setTheme: (theme: Theme) => void;
  setActiveFolder: (folder: ActiveFolder) => void;
  setActiveNoteId: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  emptyTrash: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', getInitialNotes());
  const [folders, setFolders] = useLocalStorage<Folder[]>('folders', getInitialFolders());
  const [theme, setThemeState] = useLocalStorage<Theme>('theme', 'dark');
  const [activeFolder, setActiveFolder] = useState<ActiveFolder>({ id: SpecialFolder.All, type: 'special' });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const createNote = (folderId: string | null) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      tags: [],
      folderId: folderId,
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // FIX: Add explicit type for 'prev' to resolve type inference issue.
    setNotes((prev: Note[]) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (updatedNote: Partial<Note> & { id: string }) => {
    // FIX: Add explicit type for 'prev' to resolve type inference issue.
    setNotes((prev: Note[]) =>
      prev.map(note =>
        note.id === updatedNote.id ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  const deleteNote = (id: string, permanent: boolean = false) => {
    if (permanent) {
      // FIX: Add explicit type for 'prev' to resolve type inference issue.
      setNotes((prev: Note[]) => prev.filter(note => note.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
    } else {
      updateNote({ id, isTrashed: true, isPinned: false });
    }
  };
  
  const restoreNote = (id: string) => {
    updateNote({ id, isTrashed: false });
  };
  
  const emptyTrash = () => {
    // FIX: Add explicit type for 'prev' to resolve type inference issue.
    setNotes((prev: Note[]) => prev.filter(note => !note.isTrashed));
  };
  
  const toggleNoteProperty = (id: string, prop: 'isPinned' | 'isFavorite' | 'isArchived') => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote({ id, [prop]: !note[prop] });
    }
  };

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
    // FIX: Add explicit type for 'prev' to resolve type inference issue.
    setFolders((prev: Folder[]) => [...prev, newFolder]);
  };
  
  const deleteFolder = (id: string) => {
    // FIX: Add explicit type for 'prev' to resolve type inference issue.
    setFolders((prev: Folder[]) => prev.filter(f => f.id !== id));
    // Un-assign notes from the deleted folder
    // FIX: Add explicit type for 'prev' to resolve type inference issue.
    setNotes((prev: Note[]) => prev.map(note => note.folderId === id ? {...note, folderId: null} : note));
    if (activeFolder.id === id) {
        setActiveFolder({ id: SpecialFolder.All, type: 'special'});
    }
  };
  
  const value = useMemo(() => ({
    notes,
    folders,
    theme,
    activeFolder,
    activeNoteId,
    searchTerm,
    createNote,
    updateNote,
    deleteNote,
    toggleNoteProperty,
    restoreNote,
    createFolder,
    deleteFolder,
    setTheme,
    setActiveFolder,
    setActiveNoteId,
    setSearchTerm,
    emptyTrash,
  }), [notes, folders, theme, activeFolder, activeNoteId, searchTerm]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
