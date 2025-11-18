"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions";

export function LoginForm() {
  const [state, action] = useFormState(login, undefined);

  return (
    <form action={action}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <Link
              href="#"
              className="ml-auto inline-block text-sm underline"
            >
              Forgot your password?
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
            <p>Use <code className="font-bold">user@abjour.com</code> to login as a user.</p>
            <p>Use <code className="font-bold">admin@abjour.com</code> to login as an admin.</p>
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Login"}
        </Button>
    )
}
