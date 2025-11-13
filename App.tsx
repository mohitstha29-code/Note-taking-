
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

const MainApp: React.FC = () => {
  const { activeNoteId } = useAppContext();

  return (
    <div className="flex h-screen w-full bg-light-bg dark:bg-dark-bg text-light-on-bg dark:text-dark-on-bg font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex flex-1 overflow-hidden">
          <NoteList />
          {activeNoteId ? (
            <NoteEditor key={activeNoteId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Select a note to start</h2>
                <p className="text-gray-500 dark:text-gray-400">or create a new one!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
   