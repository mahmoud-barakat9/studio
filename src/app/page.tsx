
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
          const user = await getUserById(sessionId);
          if (user) {
            if (user.role === 'admin') {
              router.replace('/admin/dashboard');
            } else {
              router.replace('/dashboard');
            }
          } else {
            // Invalid session, clear cookie and go to welcome
            router.replace('/welcome');
          }
        } catch (error) {
          console.error("Auth check failed", error);
          router.replace('/welcome');
        }
      } else {
        router.replace('/welcome');
      }
      // Note: setLoading(false) might not be reached due to router.replace, which is fine.
    }

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
