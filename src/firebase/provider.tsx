

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "./config";
import type { User as FirebaseAuthUser } from "firebase/auth";
import { usePathname } from "next/navigation";
import { getCookie, hasCookie, deleteCookie } from 'cookies-next';

// Create the context
export const FirebaseContext = createContext<{
  user: FirebaseAuthUser | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

// Create the provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // This is a mock implementation based on cookies.
      // In a real Firebase app, you would just use the `user` object from the callback.
      const hasSessionCookie = hasCookie('session-id');

      if (user && !hasSessionCookie) {
         // If firebase has a user but our mock cookie doesn't, sign them out of firebase
         // to keep them in sync.
         auth.signOut();
         setUser(null);
      } else if (!user && hasSessionCookie) {
        // If our cookie thinks there's a user but firebase doesn't, clear the cookie
        deleteCookie('session-id');
        deleteCookie('session-role');
        setUser(null);
      } else {
        setUser(user);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [pathname]);

  return (
    <FirebaseContext.Provider value={{ user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Create a hook to use the context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
