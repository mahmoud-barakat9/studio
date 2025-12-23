
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { SplashScreen } from "@/components/splash-screen";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
        if (user) {
            router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        } else {
            router.replace('/welcome');
        }
    }
  }, [router, user, loading]);

  // Show a splash screen while the auth status is being determined.
  return <SplashScreen isVisible={true} />;
}
