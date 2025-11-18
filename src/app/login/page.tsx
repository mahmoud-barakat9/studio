import Image from "next/image";
import Link from "next/link";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/icons";

export default function LoginPage() {
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-background");

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <BrandLogo />
              <h1 className="text-3xl font-bold">طلب أباجور</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            ليس لديك حساب؟{" "}
            <Link href="#" className="underline">
              اشتراك
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            width="1920"
            height="1080"
            data-ai-hint={bgImage.imageHint}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
