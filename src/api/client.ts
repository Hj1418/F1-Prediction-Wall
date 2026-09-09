import { ApiResponse } from '../types';

const PRODUCTION_API_URL =
  'https://script.google.com/macros/s/AKfycbz_TmSvhPNdrTT9HCiCnViVY9dG-5ypZMfyWtp0d4XcjP25mJc7yW8VyawKaSI6LTF9/exec';

const API_BASE_URL = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;

export const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http'));

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  if (!isLiveBackend) {
    return {
      success: false,
      data: null,
      message: 'No live backend URL configured. Using local service layer.',
    };
  }

  const { timeoutMs = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const separator = API_BASE_URL.includes('?') ? '&' : '?';
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${separator}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    return json;
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      data: null,
      message: err.message || 'API request failed',
    };
  }
}
