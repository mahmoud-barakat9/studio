
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <Label htmlFor="theme-switch" className="flex-grow ml-2">
        {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
      </Label>
      <Switch
        id="theme-switch"
        checked={theme === 'dark'}
        onCheckedChange={handleThemeChange}
      />
      <span className="sr-only">تبديل الوضع</span>
    </div>
  );
}