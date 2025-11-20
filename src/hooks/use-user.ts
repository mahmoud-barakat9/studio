

"use client";

import { useEffect, useState } from "react";
import { getUserById } from "@/lib/firebase-actions";
import type { User } from "@/lib/definitions";
import { getCookie } from 'cookies-next';

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const userId = getCookie('session-id');

            if (userId) {
                const dbUser = await getUserById(userId as string);
                if (dbUser) {
                    setUser(dbUser);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        fetchUser();
        // Listen for changes in cookies (e.g., on login/logout)
        window.addEventListener('storage', fetchUser);
        return () => {
            window.removeEventListener('storage', fetchUser);
        }

    }, []);

    return { user, loading };
};
