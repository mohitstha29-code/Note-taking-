
import React from 'react';
import { Note } from '../types';
import { PinIcon } from './icons';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isActive, onClick }) => {
  const contentSnippet = note.content.replace(/#+\s/g, '').substring(0, 100) + (note.content.length > 100 ? '...' : '');
  const date = new Date(note.updatedAt);
  const formattedDate = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg mb-2 cursor-pointer border-2 transition-all duration-200
        ${isActive
          ? 'bg-light-primary/10 dark:bg-dark-primary/10 border-light-primary dark:border-dark-primary'
          : 'bg-light-surface dark:bg-dark-surface border-transparent hover:border-light-container dark:hover:border-dark-container'
        }
      `}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-md mb-1 truncate pr-2">{note.title}</h3>
        {note.isPinned && <PinIcon className="h-4 w-4 text-light-primary dark:text-dark-primary flex-shrink-0" fill="currentColor"/>}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{contentSnippet || 'No content'}</p>
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
        <span>{formattedDate}</span>
        <div className="flex gap-1">
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-light-container dark:bg-dark-container px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
   