
'use client';

import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const session = document.cookie.includes('session=user-session');
    const isAdminSession = document.cookie.includes('session=admin-session');
    if (isAdminSession) {
      router.replace('/admin/dashboard');
    } else if (!session) {
      router.replace('/welcome');
    }
  }, [router]);

  if (!isClient) {
    return null; // Render nothing on the server to avoid hydration mismatch
  }
  
  // Only render for logged-in users, handled by useEffect redirect
  if (!document.cookie.includes('session=user-session')) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        <Dashboard />
      </main>
      <MainFooter />
    </div>
  );
}
