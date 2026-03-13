import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@stealth/shared';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('stealth_token', token);
      },
      clearAuth: () => {
        set({ user: null, token: null });
        localStorage.removeItem('stealth_token');
      },
    }),
    { name: 'stealth-auth', skipHydration: true }
  )
);
