'use client';

import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SplashScreen } from '@/components/splash-screen';
import { usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { PageTransitionLoader } from '@/components/page-transition-loader';
import { OnlineStatusIndicator } from '@/components/online-status-indicator';
import { Providers } from './providers';
import { useMessages } from 'next-intl';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-body' });

const metadata: Metadata = {
  title: 'طلب أباجور',
  description: 'أنشئ وتتبع طلبات الأباجور الخاصة بك بكل سهولة.',
  manifest: '/manifest.json',
};

interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<RootLayoutProps>) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const messages = useMessages();

  useEffect(() => {
    const shouldShowSplash = !sessionStorage.getItem('splashShown');
    
    if (shouldShowSplash) {
      sessionStorage.setItem('splashShown', 'true');
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
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
        <Providers locale={locale} messages={messages}>
          <OnlineStatusIndicator />
          <PageTransitionLoader />
          <SplashScreen isVisible={isLoading} />
          {!isLoading && children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
