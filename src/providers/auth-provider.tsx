
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@/lib/definitions';
import { getUserFromCookie } from './cookie-actions';
import { SplashScreen } from '@/components/splash-screen';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const userData = await getUserFromCookie();
      setUser(userData);
      setLoading(false);
    }
    loadUser();
  }, [pathname]);
  
  if (loading) {
    return <SplashScreen isVisible={true} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
