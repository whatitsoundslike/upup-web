'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => { },
  logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // If on superpet page, save game state and clear local data
    const firstSegment = pathname.split('/')[1] || '';
    if (firstSegment === 'superpet') {
      try {
        // Dynamically import to avoid loading on non-superpet pages
        const { saveToServer } = await import('@/app/(main)/superpet/gameSync');
        const { clearGameData, getItem } = await import('@/app/(main)/superpet/storage');

        // Save current game state to server only if characters exist
        const characters = getItem('characters');
        if (characters && JSON.parse(characters).length > 0) {
          await saveToServer();
        }

        // Clear local game data
        clearGameData();
      } catch (error) {
        console.error('Failed to save game data during logout:', error);
      }
    }

    // Proceed with logout
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);

    // Force full page reload to home
    window.location.href = firstSegment ? `/${firstSegment}` : '/';
  }, [pathname]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
