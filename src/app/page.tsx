
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from 'cookies-next';
import { getUserById } from "@/lib/firebase-actions";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

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
          } else {
            // User ID in cookie is invalid, treat as logged out
            router.replace('/welcome');
          }
        } catch (error) {
          console.error("Auth check failed", error);
          router.replace('/welcome');
        }
      } else {
        // No session, go to welcome page
        router.replace('/welcome');
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
