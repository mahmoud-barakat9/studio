'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const {t} = useTranslation('common');

  const onSelectChange = (locale: string) => {
    const newPath = pathname.replace(/^\/(en|ar)/, `/${locale}`);
    startTransition(() => {
      router.replace(newPath);
    });
  };

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('change-language')}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelectChange('en')}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectChange('ar')}>العربية</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
