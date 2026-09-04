import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/apiClient';
import { INITIAL_USERS } from '../services/mockData';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  isAdmin: boolean;
  isSwitcherOpen: boolean;
  setSwitcherOpen: (open: boolean) => void;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const CURRENT_USER_KEY = 'f1_pred_current_user_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default Harsh
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);

  const refreshUsers = async () => {
    try {
      const users = await api.getAllUsers();
      if (users && users.length > 0) {
        setAllUsers(users);
        const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
        const match = users.find(u => u.userId === savedUserId) || users[0];
        setCurrentUser(match);
      }
    } catch (e) {
      console.warn('Failed to refresh users:', e);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = async (userId: string) => {
    const match = allUsers.find(u => u.userId === userId);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem(CURRENT_USER_KEY, userId);
    }
  };

  const updateProfile = async (updated: Partial<User>) => {
    const newUser = { ...currentUser, ...updated };
    setCurrentUser(newUser);
    setAllUsers(prev => prev.map(u => (u.userId === newUser.userId ? newUser : u)));
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAdmin,
        isSwitcherOpen,
        setSwitcherOpen,
        switchUser,
        updateProfile,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
