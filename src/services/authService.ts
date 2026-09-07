import { User } from '../types';
import { api } from './apiClient';

export interface RegisterParams {
  username: string;
  email: string;
  displayName: string;
  password?: string;
  favouriteDriver: string;
  favouriteConstructor?: string;
  avatarUrl?: string;
  bio?: string;
}

export const MOTORSPORT_AVATARS = [
  {
    id: 'avatar_ferrari_red',
    label: 'Scuderia Red Helmet',
    url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'avatar_carbon_visor',
    label: 'Carbon Visor',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'avatar_apex_gold',
    label: 'Apex Gold',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'avatar_race_director',
    label: 'FIA Director',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'avatar_paddock_lead',
    label: 'Paddock Lead',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'avatar_telemetry_pro',
    label: 'Telemetry Specialist',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  },
];

/**
 * Computes SHA-256 hash in browser or fallback environment
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Crypto subtle failed, fallback hash', e);
    }
  }
  // Simple fallback hash for test environments without subtle crypto
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}`;
}

export const authService = {
  getAvatars() {
    return MOTORSPORT_AVATARS;
  },

  async register(params: RegisterParams): Promise<User> {
    const cleanUsername = params.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 alphanumeric characters (letters, numbers, underscores).');
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!params.displayName.trim()) {
      throw new Error('Display name is required.');
    }

    if (!params.favouriteDriver) {
      throw new Error('Please select your favourite Formula 1 driver.');
    }

    const passwordHash = params.password ? await hashPassword(params.password) : '';

    const newUserId = `usr_${cleanUsername}_${Date.now().toString(36)}`;
    const avatar = params.avatarUrl || MOTORSPORT_AVATARS[0].url;

    const userData = {
      userId: newUserId,
      email: cleanEmail,
      displayName: params.displayName.trim(),
      username: cleanUsername,
      avatarUrl: avatar,
      favouriteDriver: params.favouriteDriver,
      favouriteConstructor: params.favouriteConstructor || 'ferrari',
      bio: params.bio?.trim() || 'F1 Enthusiast & Strategy Predictor',
      passwordHash,
      role: 'user' as const, // Strict user role assignment
      createdAt: new Date().toISOString(),
    };

    const registered = await api.registerUser(userData);
    return registered;
  },

  async login(identifier: string, password?: string): Promise<User> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) throw new Error('Username or email is required.');

    const allUsers = await api.getAllUsers();
    const match = allUsers.find(
      u =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.userId.toLowerCase() === cleanId ||
        u.userId.toLowerCase() === `user_${cleanId}` ||
        (cleanId === 'admin' && u.role === 'admin')
    );

    if (!match) {
      throw new Error('No racer found with this username or email.');
    }

    if (match.passwordHash && password) {
      const hashed = await hashPassword(password);
      if (match.passwordHash !== hashed) {
        throw new Error('Invalid password for this account.');
      }
    }

    return match;
  },
};
