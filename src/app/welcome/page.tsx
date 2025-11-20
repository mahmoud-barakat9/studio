
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Contact } from "@/components/landing/contact";
import { WelcomeFooter } from "@/components/landing/welcome-footer";
import { WelcomeHeader } from "@/components/landing/welcome-header";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <WelcomeHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Contact />
      </main>
      <WelcomeFooter />
    </div>
  );
}
