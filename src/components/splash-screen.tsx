
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BrandLogo } from './icons';

export function SplashScreen({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="text-2xl font-bold text-foreground">طلب أباجور</span>
          </div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
