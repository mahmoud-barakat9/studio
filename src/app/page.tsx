
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from 'cookies-next';
import { getUserById } from "@/lib/firebase-actions";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const sessionId = getCookie('session-id');
      
      if (sessionId) {
        try {
          const user = await getUserById(sessionId as string);
          if (user) {
            if (user.role === 'admin') {
              router.replace('/admin/dashboard');
            } else {
              router.replace('/dashboard');
            }
            return; 
          }
        } catch (error) {
          console.error("Auth check failed", error);
        }
      }
      
      // If no session, no user, or an error occurred, go to welcome
      router.replace('/welcome');
    }

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
