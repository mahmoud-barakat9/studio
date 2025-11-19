
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from 'cookies-next';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This is a simplified check. A real app would verify the session server-side.
    const sessionId = getCookie('session-id');
    
    if (sessionId) {
      // In a real app, you'd fetch user role based on sessionId
      // For this mock, we'll assume a specific ID for the admin.
      if (sessionId === '4') { // Assuming '4' is the admin ID from data
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } else {
      router.replace('/welcome');
    }
  }, [router]);

  return null; // Return null while redirecting
}
