
"use client";

import { useFirebase } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { getUserById } from "@/lib/firebase-actions";
import type { User } from "@/lib/definitions";
import { usePathname } from "next/navigation";
import { getCookie, hasCookie } from 'cookies-next';


export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            if (hasCookie('session-id')) {
                const userId = getCookie('session-id') as string;
                const userRole = getCookie('session-role') as string;
                
                // This is a mock user object based on cookie
                // In a real app, you might fetch full user details from an API
                const fetchedUser = await getUserById(userId);
                if (fetchedUser) {
                    setUser(fetchedUser);
                } else {
                     setUser({
                        id: userId,
                        role: userRole as "admin" | "user",
                        name: userRole === 'admin' ? 'Admin' : 'User',
                        email: userRole === 'admin' ? 'admin@abjour.com' : 'user@abjour.com'
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        fetchUser();
    }, [pathname]); // Refetch on path change to ensure session is fresh

    return { user, loading };
};
