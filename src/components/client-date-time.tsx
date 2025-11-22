
'use client';

import { useEffect, useState } from "react";

export function ClientDateTime() {
  const [date, setDate] = useState('');

  useEffect(() => {
    // This will only run on the client, preventing hydration mismatch
    setDate(new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }));
  }, []);

  return <>{date}</>;
}
