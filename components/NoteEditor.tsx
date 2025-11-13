
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Note, SpecialFolder } from '../types';
import { PinIcon, StarIcon, ArchiveIcon, TrashIcon, SparklesIcon, LoaderIcon, XIcon, MoreVerticalIcon } from './icons';
import IconButton from './IconButton';
import * as geminiService from '../services/geminiService';
import ConfirmationModal from './ConfirmationModal';

const NoteEditor: React.FC = () => {
  const { activeNoteId, notes, updateNote, deleteNote, toggleNoteProperty, restoreNote } = useAppContext();
  const activeNote = notes.find(n => n.id === activeNoteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setTags(activeNote.tags);
    }
  }, [activeNote]);

  const handleAutoSave = useCallback(() => {
    if (!activeNote) return;
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = window.setTimeout(() => {
      if (activeNote.title !== title || activeNote.content !== content || JSON.stringify(activeNote.tags) !== JSON.stringify(tags)) {
        updateNote({ id: activeNote.id, title, content, tags });
      }
    }, 1000);
  }, [activeNote, title, content, tags, updateNote]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleAutoSave();
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [title, content, tags, handleAutoSave]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentTag.trim() && !tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAiAction = async (action: 'summarize' | 'improve' | 'title' | 'tags') => {
    if (!content || !activeNote) return;
    setIsAiLoading(action);
    setIsAiMenuOpen(false);
    
    try {
        let result;
        switch (action) {
            case 'summarize':
                result = await geminiService.summarizeNote(content);
                setContent(content + `\n\n---\n**Summary:**\n${result}`);
                break;
            case 'improve':
                result = await geminiService.improveWriting(content);
                setContent(result);
                break;
            case 'title':
                result = await geminiService.generateTitle(content);
                setTitle(result.replace(/["']/g, ''));
                break;
            case 'tags':
                result = await geminiService.suggestTags(content);
                const newTags = result.split(',').map(t => t.trim()).filter(Boolean);
                setTags(prev => [...new Set([...prev, ...newTags])]);
                break;
        }
    } catch(e) {
        console.error("AI Action failed", e);
    } finally {
        setIsAiLoading(null);
    }
  };
  
  const exportAsTxt = () => {
    if (!activeNote) return;
    const blob = new Blob([`Title: ${title}\nTags: ${tags.join(', ')}\n\n---\n\n${content}`], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/ /g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    setIsMoreMenuOpen(false);
  }

  if (!activeNote) {
    return null;
  }

  const isReadOnly = activeNote.isTrashed;

  return (
    <div className="flex-1 flex flex-col bg-light-surface dark:bg-dark-surface">
      {isReadOnly && (
        <div className="bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 p-2 text-center text-sm flex justify-center items-center gap-4">
          This note is in the trash. 
          <button onClick={() => restoreNote(activeNote.id)} className="font-bold underline">Restore Note</button>
          <button onClick={() => setShowDeleteModal(true)} className="font-bold underline text-red-500">Delete Permanently</button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-light-container dark:border-dark-container flex-shrink-0">
          <div className="flex items-center gap-2">
            <IconButton 
              tooltip={activeNote.isPinned ? "Unpin" : "Pin"} 
              onClick={() => toggleNoteProperty(activeNote.id, 'isPinned')}
              disabled={isReadOnly}
            >
              <PinIcon className={`h-5 w-5 ${activeNote.isPinned ? 'text-light-primary dark:text-dark-primary' : ''}`} fill={activeNote.isPinned ? 'currentColor' : 'none'} />
            </IconButton>
            <IconButton 
              tooltip={activeNote.isFavorite ? "Unfavorite" : "Favorite"} 
              onClick={() => toggleNoteProperty(activeNote.id, 'isFavorite')}
              disabled={isReadOnly}
            >
              <StarIcon className={`h-5 w-5 ${activeNote.isFavorite ? 'text-yellow-500' : ''}`} fill={activeNote.isFavorite ? 'currentColor' : 'none'} />
            </IconButton>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative">
                <button
                    onClick={() => setIsAiMenuOpen(prev => !prev)}
                    disabled={isReadOnly || !!isAiLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary rounded-md hover:bg-light-primary/20 dark:hover:bg-dark-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAiLoading ? <LoaderIcon className="h-4 w-4 animate-spin"/> : <SparklesIcon className="h-4 w-4" />}
                    <span>{isAiLoading ? `Improving ${isAiLoading}...` : 'AI Actions'}</span>
                </button>
                {isAiMenuOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-light-surface dark:bg-dark-container rounded-md shadow-lg z-10 animate-fade-in">
                        <a onClick={() => handleAiAction('summarize')} className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">Summarize Note</a>
                        <a onClick={() => handleAiAction('improve')} className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">Improve Writing</a>
                        <a onClick={() => handleAiAction('title')} className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">Generate Title</a>
                        <a onClick={() => handleAiAction('tags')} className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">Suggest Tags</a>
                    </div>
                )}
            </div>
             <div className="relative">
                <IconButton onClick={() => setIsMoreMenuOpen(prev => !prev)} tooltip="More actions">
                  <MoreVerticalIcon className="h-5 w-5" />
                </IconButton>
                {isMoreMenuOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-light-surface dark:bg-dark-container rounded-md shadow-lg z-10 animate-fade-in">
                         <a onClick={() => toggleNoteProperty(activeNote.id, 'isArchived')} className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">{activeNote.isArchived ? 'Unarchive' : 'Archive'} Note</a>
                         <a onClick={exportAsTxt} className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">Export as .txt</a>
                         <a onClick={() => deleteNote(activeNote.id)} className="block px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 cursor-pointer">Move to Trash</a>
                    </div>
                )}
            </div>
          </div>
      </header>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          readOnly={isReadOnly}
          className="w-full bg-transparent text-3xl font-bold focus:outline-none mb-4"
        />
        
        <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
                {tags.map(tag => (
                    <div key={tag} className="flex items-center bg-light-container dark:bg-dark-container rounded-full px-3 py-1 text-sm">
                        <span>{tag}</span>
                        {!isReadOnly && <XIcon onClick={() => removeTag(tag)} className="h-3 w-3 ml-2 cursor-pointer hover:text-red-500" />}
                    </div>
                ))}
                {!isReadOnly && (
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag..."
                      className="bg-transparent focus:outline-none"
                    />
                )}
            </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          readOnly={isReadOnly}
          className="w-full h-full bg-transparent focus:outline-none resize-none text-base leading-relaxed"
          rows={20}
        />
      </div>

      <ConfirmationModal 
        isOpen={showDeleteModal}
        title="Delete Note Permanently?"
        message="This action cannot be undone. The note will be permanently erased."
        onConfirm={() => {
            deleteNote(activeNote.id, true);
            setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Delete"
      />
    </div>
  );
};

export default NoteEditor;
   