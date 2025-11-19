
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from 'cookies-next';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This is a mock authentication check
    const sessionId = getCookie('session-id');
    
    if (sessionId) {
      // For this mock, we assume any session ID means logged in.
      // A real app would validate the session with a backend.
      // We check if it's the mock admin ID.
      if (sessionId === '4') { // Mock Admin ID
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } else {
      // No session, go to welcome page
      router.replace('/welcome');
    }
  }, [router]);

  // You can show a loading spinner here while the redirect happens
  return <div>Loading...</div>;
}
