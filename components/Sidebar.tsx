
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Folder, ActiveFolder, SpecialFolder } from '../types';
import { PlusIcon, FolderIcon, StarIcon, ArchiveIcon, TrashIcon, FileTextIcon, XIcon } from './icons';
import IconButton from './IconButton';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  count?: number;
  onClick: () => void;
  onDelete?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, count, onClick, onDelete }) => {
    return (
        <div className={`group flex items-center justify-between w-full text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors
            ${isActive
                ? 'bg-light-primary/20 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary font-semibold'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
             onClick={onClick}
            >
            <div className="flex items-center gap-3">
                {icon}
                <span className="truncate">{label}</span>
            </div>
            <div className="flex items-center gap-1">
                 {typeof count !== 'undefined' && <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>}
                 {onDelete && (
                    <IconButton
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <TrashIcon className="h-4 w-4 text-red-500"/>
                    </IconButton>
                 )}
            </div>
        </div>
    );
};


const Sidebar: React.FC = () => {
    const { 
      notes, folders, activeFolder, setActiveFolder, createFolder, deleteFolder, createNote 
    } = useAppContext();
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const counts = {
        all: notes.filter(n => !n.isArchived && !n.isTrashed).length,
        favorites: notes.filter(n => n.isFavorite && !n.isTrashed).length,
        archived: notes.filter(n => n.isArchived && !n.isTrashed).length,
        trash: notes.filter(n => n.isTrashed).length,
    };
    
    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            createFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    return (
        <div className="w-64 bg-light-surface dark:bg-dark-surface border-r border-light-container dark:border-dark-container flex flex-col p-3">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Gemini Notes</h1>
            </div>
            <button
              onClick={() => createNote(activeFolder.type === 'folder' ? activeFolder.id : null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
                <PlusIcon className="h-5 w-5" />
                New Note
            </button>
            <nav className="flex-1 space-y-1 overflow-y-auto">
                <SidebarItem icon={<FileTextIcon className="h-5 w-5" />} label="All Notes" count={counts.all} isActive={activeFolder.id === SpecialFolder.All} onClick={() => setActiveFolder({id: SpecialFolder.All, type: 'special'})} />
                <SidebarItem icon={<StarIcon className="h-5 w-5" />} label="Favorites" count={counts.favorites} isActive={activeFolder.id === SpecialFolder.Favorites} onClick={() => setActiveFolder({id: SpecialFolder.Favorites, type: 'special'})} />
                <SidebarItem icon={<ArchiveIcon className="h-5 w-5" />} label="Archived" count={counts.archived} isActive={activeFolder.id === SpecialFolder.Archived} onClick={() => setActiveFolder({id: SpecialFolder.Archived, type: 'special'})} />
                <SidebarItem icon={<TrashIcon className="h-5 w-5" />} label="Trash" count={counts.trash} isActive={activeFolder.id === SpecialFolder.Trash} onClick={() => setActiveFolder({id: SpecialFolder.Trash, type: 'special'})} />

                <div className="pt-4 mt-2 border-t border-light-container dark:border-dark-container">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Folders</h2>
                        <IconButton onClick={() => setIsCreatingFolder(true)} tooltip="New Folder">
                            <PlusIcon className="h-4 w-4" />
                        </IconButton>
                    </div>
                    {isCreatingFolder && (
                         <div className="flex items-center gap-2 mb-2">
                             <input
                                 type="text"
                                 value={newFolderName}
                                 onChange={(e) => setNewFolderName(e.target.value)}
                                 placeholder="Folder name"
                                 className="flex-1 text-sm bg-light-bg dark:bg-dark-bg border border-light-container dark:border-dark-container rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary"
                                 autoFocus
                                 onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                             />
                             <IconButton onClick={() => setIsCreatingFolder(false)}>
                                 <XIcon className="h-4 w-4" />
                             </IconButton>
                         </div>
                    )}

                    {folders.map(folder => {
                        const folderNoteCount = notes.filter(n => n.folderId === folder.id && !n.isTrashed).length;
                        return (
                            <SidebarItem 
                                key={folder.id} 
                                icon={<FolderIcon className="h-5 w-5" />} 
                                label={folder.name}
                                count={folderNoteCount}
                                isActive={activeFolder.id === folder.id} 
                                onClick={() => setActiveFolder({id: folder.id, type: 'folder'})}
                                onDelete={() => {
                                    if(window.confirm(`Are you sure you want to delete the "${folder.name}" folder? Notes inside will not be deleted.`)){
                                        deleteFolder(folder.id);
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
   