

'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // A real app would check for roles/claims here
        if (user.email === 'admin@abjour.com') { 
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      } else {
        // No session, go to welcome page
        router.replace('/welcome');
      }
    }
  }, [user, loading, router]);

  // You can show a loading spinner here while the redirect happens
  return <div>Loading...</div>;
}

    