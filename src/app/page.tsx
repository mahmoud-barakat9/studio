import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Contact } from "@/components/landing/contact";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Contact />
      </main>
      <MainFooter />
    </div>
  );
}
