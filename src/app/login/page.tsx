
'use client';

import Link from "next/link";
import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/lib/auth-actions';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BrandLogo } from "@/components/icons";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            تسجيل الدخول
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useFormState(login, undefined);
    const loginImage = PlaceHolderImages.find(img => img.id === 'login-background');

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4">
                <div className="mx-auto grid w-[350px] gap-6">
                     <div className="grid gap-2 text-center">
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <BrandLogo />
                            <h1 className="text-3xl font-bold">طلب أباجور</h1>
                        </div>
                        <p className="text-balance text-muted-foreground">
                            أدخل بريدك الإلكتروني أدناه للدخول إلى حسابك
                        </p>
                    </div>

                    <form action={formAction} className="grid gap-4">
                        {state?.error && (
                             <Alert variant="destructive">
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
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
                            <div className="flex items-center">
                                <Label htmlFor="password">كلمة المرور</Label>
                            </div>
                            <Input id="password" type="password" name="password" required defaultValue="123456" />
                             <p className="text-xs text-muted-foreground text-center pt-1">(ملاحظة: كلمة المرور يتم تجاهلها في هذا العرض التوضيحي)</p>
                        </div>
                        <SubmitButton />
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ليس لديك حساب؟{" "}
                        <Link href="/welcome#contact" className="underline">
                            تواصل معنا
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative">
                 {loginImage && (
                    <Image
                        src={loginImage.imageUrl}
                        alt={loginImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={loginImage.imageHint}
                    />
                 )}
            </div>
        </div>
    )
}
