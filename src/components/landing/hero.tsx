import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'login-background');
  return (
    <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-white text-center bg-gray-900">
      <div className="absolute inset-0">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 p-4 container mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">
          أباجورك المثالي، بخطوات بسيطة
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 drop-shadow">
          نظام متكامل وسهل لإدارة طلبات الأباجور، من التصميم إلى التسليم. احصل على دقة في الأبعاد، وسرعة في التنفيذ، وتجربة فريدة لعملائك.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/?create_order=true" passHref>
            <Button size="lg" className="w-full sm:w-auto">
              ابدأ طلبك الآن <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features" passHref>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary">
              اكتشف المميزات
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
