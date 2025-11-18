import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandLogo } from "@/components/icons";
import { MainHeader } from "@/components/layout/main-header";

export default function RegisterPage() {
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-background");

  return (
    <>
      <MainHeader />
      <div className="w-full lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <BrandLogo />
                    <h1 className="text-3xl font-bold">إنشاء حساب جديد</h1>
                </div>
              <p className="text-balance text-muted-foreground">
                أدخل معلوماتك أدناه لإنشاء حساب
              </p>
            </div>
            <RegisterForm />
            <div className="mt-4 text-center text-sm">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="underline">
                تسجيل الدخول
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
    </>
  );
}
