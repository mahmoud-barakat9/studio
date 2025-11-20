

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "./config";
import type { User as FirebaseAuthUser } from "firebase/auth";

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
