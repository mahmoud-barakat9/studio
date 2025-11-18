import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Contact } from "@/components/landing/contact";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { cookies } from "next/headers";


export default function Home() {
  const isLoggedIn = cookies().has('session');

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
