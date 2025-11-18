
'use client';

import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Contact } from "@/components/landing/contact";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
    // Check for cookie on the client side
    const session = document.cookie.includes('session');
    setIsLoggedIn(session);
  }, [searchParams]); // Re-run effect if URL params change

  if (!isClient) {
    // Render a placeholder or nothing on the server to avoid mismatch
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        {isLoggedIn ? (
          <Dashboard />
        ) : (
          <>
            <Hero />
            <Features />
            <Contact />
          </>
        )}
      </main>
      <MainFooter />
    </div>
  );
}
