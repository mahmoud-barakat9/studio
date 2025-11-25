
'use client';

import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SplashScreen } from '@/components/splash-screen';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageTransitionLoader } from '@/components/page-transition-loader';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-body' });

// Since we're using 'use client', we can't export metadata directly.
// We can define it here to be used in the head.
const metadata: Metadata = {
  title: 'طلب أباجور',
  description: 'أنشئ وتتبع طلبات الأباجور الخاصة بك بكل سهولة.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine if the splash screen should be shown
    const shouldShowSplash = !sessionStorage.getItem('splashShown');
    
    if (shouldShowSplash) {
      sessionStorage.setItem('splashShown', 'true');
      const timer = setTimeout(() => setIsLoading(false), 3000); // Splash screen duration
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
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
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#E3E0F3" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#E3E0F3" />

        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={cn('antialiased', cairo.variable)}>
        <PageTransitionLoader />
        <SplashScreen isVisible={isLoading} />
        {!isLoading && children}
        <Toaster />
      </body>
    </html>
  );
}
