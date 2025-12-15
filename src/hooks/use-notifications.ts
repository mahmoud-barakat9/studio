'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/lib/definitions';
import { getNotificationsByUserId } from '@/lib/firebase-actions';

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!userId) {
            setNotifications([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const notificationsData = await getNotificationsByUserId(userId);
            setNotifications(notificationsData);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
        // Optional: Set up a polling mechanism if real-time updates are needed without websockets
        const interval = setInterval(fetchData, 60000); // Poll every 60 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    return { notifications, loading, mutate: fetchData };
}
