
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Contact } from "@/components/landing/contact";
import { WelcomeFooter } from "@/components/landing/welcome-footer";
import { WelcomeHeader } from "@/components/landing/welcome-header";
import { Projects } from "@/components/landing/projects";
import { ProductTypes } from "@/components/landing/product-types";
import { Testimonials } from "@/components/landing/testimonials";
import { Trust } from "@/components/landing/trust";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WelcomeHeader />
      <main className="flex-1 px-4 md:px-0">
        <Hero />
        <Features />
        <Projects />
        <ProductTypes />
        <Testimonials />
        <Trust />
        <Contact />
      </main>
      <WelcomeFooter />
    </div>
  );
}
