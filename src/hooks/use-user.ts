
"use client";
import { useFirebase } from "@/firebase/provider";

export const useUser = () => {
  const { user, loading } = useFirebase();
  return { user, loading };
};

    