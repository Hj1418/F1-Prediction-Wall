import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/apiClient';
import { INITIAL_USERS } from '../services/mockData';
import { authService, RegisterParams } from '../services/authService';

import { signInWithGoogle } from '../services/googleAuth';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoadingAuth: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  intendedRoute: string | null;
  setIntendedRoute: (route: string | null) => void;
  openLoginModal: (redirectRoute?: string) => void;
  openRegisterModal: (redirectRoute?: string) => void;
  login: (identifier: string, password?: string) => Promise<void>;
  loginWithGoogle: (googleUser?: { email?: string; displayName?: string; photoUrl?: string; accessToken?: string }) => Promise<User>;
  register: (params: RegisterParams) => Promise<User>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const CURRENT_USER_KEY = 'f1_pred_current_user_id';
const AUTH_STATUS_KEY = 'f1_pred_auth_status';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(import.meta.env.PROD ? [] : INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [intendedRoute, setIntendedRoute] = useState<string | null>(null);

  const refreshUsers = async () => {
    try {
      const authStatus = localStorage.getItem(AUTH_STATUS_KEY);
      const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
      if (authStatus === 'authenticated' && savedUserId) {
        try {
          const profile = await api.getUserProfile(savedUserId);
          if (profile) {
            setCurrentUser(profile);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.warn('Failed to fetch user profile in refreshUsers:', err);
        }
      }

      const users = await api.getAllUsers();
      if (users && users.length > 0) {
        setAllUsers(users);
      }
    } catch (e) {
      console.warn('Failed to refresh users:', e);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        setIsLoadingAuth(true);
        const authStatus = localStorage.getItem(AUTH_STATUS_KEY);
        const savedUserId = localStorage.getItem(CURRENT_USER_KEY);

        if (authStatus === 'authenticated' && savedUserId) {
          try {
            const profile = await api.getUserProfile(savedUserId);
            if (profile) {
              setCurrentUser(profile);
              setIsAuthenticated(true);
              const users = await api.getAllUsers();
              if (users && users.length > 0) setAllUsers(users);
              return;
            }
          } catch (profileErr) {
            console.warn('Could not fetch user profile from live database:', profileErr);
          }
        }

        const users = await api.getAllUsers();
        if (users && users.length > 0) {
          setAllUsers(users);
        }

        // Strict session restoration:
        // A session is VALID if and only if auth status is explicitly 'authenticated'
        // and savedUserId corresponds to an active registered user account.
        if (authStatus === 'authenticated' && savedUserId) {
          const userList = users && users.length > 0 ? users : (import.meta.env.PROD ? [] : INITIAL_USERS);
          const match = userList.find(u => u.userId === savedUserId);
          if (match) {
            setCurrentUser(match);
            setIsAuthenticated(true);
            return;
          }
        }

        // NO SESSION: clean up and ensure unauthenticated state
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_STATUS_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
      } catch (e) {
        console.warn('Failed to restore auth session:', e);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    restoreSession();
  }, []);

  const openLoginModal = (redirectRoute?: string) => {
    if (redirectRoute) {
      setIntendedRoute(redirectRoute);
    }
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = (redirectRoute?: string) => {
    if (redirectRoute) {
      setIntendedRoute(redirectRoute);
    }
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const login = async (identifier: string, password?: string) => {
    const user = await authService.login(identifier, password);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STATUS_KEY, 'authenticated');
    localStorage.setItem(CURRENT_USER_KEY, user.userId);
    setAuthModalOpen(false);
    await refreshUsers();
  };

  const register = async (params: RegisterParams) => {
    const newUser = await authService.register(params);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STATUS_KEY, 'authenticated');
    localStorage.setItem(CURRENT_USER_KEY, newUser.userId);
    setAuthModalOpen(false);
    await refreshUsers();
    return newUser;
  };

  const loginWithGoogle = async (googleUser?: { email?: string; displayName?: string; photoUrl?: string; accessToken?: string }) => {
    let email = googleUser?.email;
    let displayName = googleUser?.displayName;
    let photoUrl = googleUser?.photoUrl;
    let accessToken = googleUser?.accessToken;

    if (!accessToken) {
      // Initiate official Google Identity Services OAuth popup flow
      const profile = await signInWithGoogle();
      email = profile.email;
      displayName = profile.displayName;
      photoUrl = profile.photoUrl;
      accessToken = profile.accessToken;
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanDisplayName = displayName || cleanEmail.split('@')[0];

    // Authenticate and persist the Google user via API to backend database
    const user = await api.googleLogin({
      email: cleanEmail,
      displayName: cleanDisplayName,
      photoUrl,
      accessToken,
    });

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STATUS_KEY, 'authenticated');
    localStorage.setItem(CURRENT_USER_KEY, user.userId);
    setAuthModalOpen(false);
    await refreshUsers();
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STATUS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!currentUser) throw new Error('Not authenticated');
    const safeUpdates = { ...updated };
    delete safeUpdates.role;
    delete safeUpdates.userId;

    const saved = await api.updateUser(currentUser.userId, safeUpdates);
    setCurrentUser(saved);
    setAllUsers(prev => prev.map(u => (u.userId === saved.userId ? saved : u)));
  };

  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        isAdmin,
        isLoadingAuth,
        isAuthModalOpen,
        setAuthModalOpen,
        authModalMode,
        intendedRoute,
        setIntendedRoute,
        openLoginModal,
        openRegisterModal,
        login,
        loginWithGoogle,
        register,
        logout,
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
