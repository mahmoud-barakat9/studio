'use client';

import Link from "next/link";
import { useActionState, useFormStatus } from 'react';
import { signup } from '@/lib/auth-actions';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Home } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BrandLogo } from "@/components/icons";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            إنشاء حساب
        </Button>
    );
}

export default function RegisterPage() {
    const [errorMessage, formAction] = useActionState(signup, undefined);
    const registerImage = PlaceHolderImages.find(img => img.id === 'login-background');

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 relative">
             <div className="absolute top-4 right-4 z-10">
                <Button asChild variant="outline">
                    <Link href="/welcome">
                        <Home className="ml-2 h-4 w-4" />
                        العودة للرئيسية
                    </Link>
                </Button>
            </div>
            <div className="flex items-center justify-center py-12 px-4">
                <Card className="mx-auto w-full max-w-sm">
                    <CardHeader className="text-center">
                         <div className="flex justify-center items-center gap-2 mb-4">
                            <BrandLogo />
                            <CardTitle className="text-3xl">إنشاء حساب جديد</CardTitle>
                        </div>
                        <CardDescription>
                            أدخل معلوماتك أدناه لإنشاء حساب في طلب أباجور
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="grid gap-4">
                            {errorMessage && (
                                <Alert variant="destructive">
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}
                             <div className="grid gap-2">
                                <Label htmlFor="name">الاسم الكامل</Label>
                                <Input id="name" name="name" placeholder="مثال: أحمد علي" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="09xxxxxxxx" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <Input id="password" type="password" name="password" required />
                            </div>
                            <SubmitButton />
                        </form>
                    </CardContent>
                    <CardFooter>
                         <div className="text-center text-sm w-full">
                            لديك حساب بالفعل؟{" "}
                            <Link href="/login" className="underline">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
             <div className="hidden bg-muted lg:block relative">
                {registerImage && (
                    <Image
                        src={registerImage.imageUrl}
                        alt={registerImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={registerImage.imageHint}
                    />
                 )}
                 <div className="absolute inset-0 bg-black/30" />
            </div>
        </div>
    )
}
