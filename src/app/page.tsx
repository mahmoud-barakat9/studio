import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Contact } from "@/components/landing/contact";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";
import { OrderForm } from "@/components/orders/order-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";


export default function Home() {
  const isLoggedIn = cookies().has('session');

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        <Hero />
        <section id="create-order" className="py-20 bg-muted/40">
            <div className="container mx-auto">
                {isLoggedIn ? (
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold">إنشاء طلب جديد</h2>
                            <p className="text-muted-foreground mt-2">املأ التفاصيل أدناه لتقديم طلبك.</p>
                        </div>
                        <OrderForm />
                    </div>
                ) : (
                    <Card className="max-w-3xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-center">قم بتسجيل الدخول للبدء</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-center">
                                يرجى تسجيل الدخول إلى حسابك لتتمكن من إنشاء طلب جديد.
                            </CardDescription>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
        <Features />
        <Contact />
      </main>
      <MainFooter />
    </div>
  );
}
