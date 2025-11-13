
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Note, SpecialFolder } from '../types';
import NoteCard from './NoteCard';

const NoteList: React.FC = () => {
    const { notes, activeFolder, activeNoteId, setActiveNoteId, searchTerm } = useAppContext();

    const filteredNotes = useMemo(() => {
        let folderNotes: Note[];

        switch(activeFolder.id) {
            case SpecialFolder.All:
                folderNotes = notes.filter(n => !n.isArchived && !n.isTrashed);
                break;
            case SpecialFolder.Favorites:
                folderNotes = notes.filter(n => n.isFavorite && !n.isTrashed);
                break;
            case SpecialFolder.Archived:
                folderNotes = notes.filter(n => n.isArchived && !n.isTrashed);
                break;
            case SpecialFolder.Trash:
                folderNotes = notes.filter(n => n.isTrashed);
                break;
            default: // Custom folder
                folderNotes = notes.filter(n => n.folderId === activeFolder.id && !n.isTrashed);
        }

        const searchLower = searchTerm.toLowerCase();
        if (searchLower) {
            folderNotes = folderNotes.filter(n =>
                n.title.toLowerCase().includes(searchLower) ||
                n.content.toLowerCase().includes(searchLower) ||
                n.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Sort by pinned, then by last updated
        return folderNotes.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

    }, [notes, activeFolder, searchTerm]);

    return (
        <div className="w-80 border-r border-light-container dark:border-dark-container flex-shrink-0 flex flex-col">
            <div className="p-3 border-b border-light-container dark:border-dark-container">
                <h2 className="text-lg font-semibold">
                    {activeFolder.type === 'special' ? activeFolder.id.charAt(0).toUpperCase() + activeFolder.id.slice(1) : 'Folder'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{filteredNotes.length} notes</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map(note => (
                        <NoteCard 
                            key={note.id}
                            note={note}
                            isActive={note.id === activeNoteId}
                            onClick={() => setActiveNoteId(note.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>No notes here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteList;
   