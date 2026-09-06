import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/apiClient';
import { INITIAL_USERS } from '../services/mockData';
import { authService, RegisterParams } from '../services/authService';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  isAdmin: boolean;
  isSwitcherOpen: boolean;
  setSwitcherOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  openLoginModal: () => void;
  openRegisterModal: () => void;
  login: (identifier: string, password?: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<User>;
  logout: () => void;
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
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

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

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const login = async (identifier: string, password?: string) => {
    const user = await authService.login(identifier, password);
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.userId);
    setAuthModalOpen(false);
    await refreshUsers();
  };

  const register = async (params: RegisterParams) => {
    const newUser = await authService.register(params);
    setCurrentUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, newUser.userId);
    setAuthModalOpen(false);
    await refreshUsers();
    return newUser;
  };

  const logout = () => {
    // Revert to demo racer if logged out
    const defaultUser = allUsers[0] || INITIAL_USERS[0];
    setCurrentUser(defaultUser);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const switchUser = async (userId: string) => {
    const match = allUsers.find(u => u.userId === userId);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem(CURRENT_USER_KEY, userId);
    }
  };

  const updateProfile = async (updated: Partial<User>) => {
    const safeUpdates = { ...updated };
    delete safeUpdates.role;
    delete safeUpdates.userId;

    const saved = await api.updateUser(currentUser.userId, safeUpdates);
    setCurrentUser(saved);
    setAllUsers(prev => prev.map(u => (u.userId === saved.userId ? saved : u)));
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
        isAuthModalOpen,
        setAuthModalOpen,
        authModalMode,
        openLoginModal,
        openRegisterModal,
        login,
        register,
        logout,
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
