import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  season: number;
  setSeason: (season: number) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  dataVersion: number;
  triggerDataRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [season, setSeason] = useState(2026);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const triggerDataRefresh = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{
        season,
        setSeason,
        toasts,
        showToast,
        removeToast,
        dataVersion,
        triggerDataRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
