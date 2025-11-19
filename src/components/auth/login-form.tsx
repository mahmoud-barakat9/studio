
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
          {state?.errors?.email && (
            <p className="text-sm text-destructive">{state.errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">كلمة المرور</Label>
            <Link
              href="#"
              className="mr-auto inline-block text-sm underline"
            >
              هل نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
              <span className="sr-only">{showPassword ? 'إخفاء' : 'إظهار'} كلمة المرور</span>
            </Button>
          </div>
           {state?.errors?.password && (
            <p className="text-sm text-destructive">{state.errors.password}</p>
          )}
        </div>
        <LoginButton />
        {state?.message && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}
         <div className="text-xs text-muted-foreground text-center">
            لأغراض العرض، استخدم <code className="font-bold">admin@abjour.com</code> للدخول كمسؤول.
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
    )
}
