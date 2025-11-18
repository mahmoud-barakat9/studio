
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = document.cookie.includes('session=user-session');
    const isAdminSession = document.cookie.includes('session=admin-session');
    
    if (isAdminSession) {
      router.replace('/admin/dashboard');
    } else if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/welcome');
    }
  }, [router]);

  return null; // Return null while redirecting
}
