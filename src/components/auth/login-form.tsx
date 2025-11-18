"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions";

export function LoginForm() {
  const [state, action] = useFormState(login, undefined);

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
            defaultValue="user@abjour.com"
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
          <Input id="password" name="password" type="password" required defaultValue="password" />
           {state?.errors?.password && (
            <p className="text-sm text-destructive">{state.errors.password}</p>
          )}
        </div>
        <LoginButton />
        {state?.message && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}
        <div className="text-xs text-muted-foreground text-center">
            <p>استخدم <code className="font-bold">user@abjour.com</code> لتسجيل الدخول كمستخدم.</p>
            <p>استخدم <code className="font-bold">admin@abjour.com</code> لتسجيل الدخول كمسؤول.</p>
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
