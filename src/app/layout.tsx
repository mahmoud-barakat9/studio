"use client";

import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SplashScreen } from '@/components/splash-screen';
import { usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { PageTransitionLoader } from '@/components/page-transition-loader';
import { OnlineStatusIndicator } from '@/components/online-status-indicator';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/providers/auth-provider';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-body' });

// Since we're using 'use client', we can't export metadata directly.
// We can define it here to be used in the head.
const metadata: Metadata = {
  title: 'طلب أباجور',
  description: 'أنشئ وتتبع طلبات الأباجور الخاصة بك بكل سهولة.',
  manifest: '/manifest.json',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on initial load to hide the splash screen.
    const timer = setTimeout(() => setIsLoading(false), 2000); // Adjust duration as needed
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
       <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
        <meta name="application-name" content="طلب أباجور" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="طلب أباجور" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#E3E0F3" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFFFF" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111827" />


        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#f97316" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={cn('antialiased', cairo.variable)}>
        <AuthProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <OnlineStatusIndicator />
                <PageTransitionLoader />
                <SplashScreen isVisible={isLoading} />
                {!isLoading && children}
                <Toaster />
            </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
