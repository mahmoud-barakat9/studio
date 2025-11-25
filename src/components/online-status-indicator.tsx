
'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { AnimatePresence, motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();
  const [showStatus, setShowStatus] = useState(false);
  const [wasOffline, setWasOffline] = useState(!isOnline);

  useEffect(() => {
    // If we come online after being offline, show the "Back online" message
    if (isOnline && wasOffline) {
      setShowStatus(true);
      setWasOffline(false);
      // Hide the "Back online" message after 3 seconds
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    // If we go offline, show the "You are offline" message indefinitely
    if (!isOnline) {
      setShowStatus(true);
      setWasOffline(true);
    }

  }, [isOnline, wasOffline]);
  
  const isCurrentlyOffline = !isOnline;

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed bottom-4 right-4 z-[101] flex items-center gap-3 rounded-lg border p-4 shadow-lg',
            isCurrentlyOffline
              ? 'bg-destructive/90 text-destructive-foreground border-destructive'
              : 'bg-green-600/90 text-white border-green-700'
          )}
          style={{ backdropFilter: 'blur(10px)' }}
        >
          {isCurrentlyOffline ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <Wifi className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {isCurrentlyOffline ? 'أنت غير متصل بالإنترنت حاليًا' : 'تمت إعادة الاتصال'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
