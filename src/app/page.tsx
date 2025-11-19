
'use client';

import { useEffect, useState } from "react";
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
          // It's important to await the user data
          const user = await getUserById(sessionId as string);
          if (user) {
            // Check user role and redirect
            if (user.role === 'admin') {
              router.replace('/admin/dashboard');
            } else {
              router.replace('/dashboard');
            }
          } else {
            // User ID in cookie is invalid
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

  // Display a loading indicator while checking authentication.
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
