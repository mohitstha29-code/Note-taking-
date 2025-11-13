
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { SearchIcon, SunIcon, MoonIcon } from './icons';
import IconButton from './IconButton';

const Header: React.FC = () => {
  const { theme, setTheme, searchTerm, setSearchTerm } = useAppContext();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="flex items-center justify-between p-2 border-b border-light-container dark:border-dark-container bg-light-surface dark:bg-dark-surface flex-shrink-0">
      <div className="flex items-center flex-1 max-w-md">
        <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute ml-3" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-container dark:border-dark-container rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors"
        />
      </div>
      <div className="flex items-center">
        <IconButton onClick={toggleTheme} tooltip={theme === 'light' ? "Dark Mode" : "Light Mode"}>
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </IconButton>
      </div>
    </header>
  );
};

export default Header;
   