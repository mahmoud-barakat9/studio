

"use client";

import { useFirebase } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { getUserById } from "@/lib/firebase-actions";
import type { User } from "@/lib/definitions";
import { usePathname } from "next/navigation";


export const useUser = () => {
    const { user: authUser, loading: authLoading } = useFirebase();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (authLoading) {
                setLoading(true);
                return;
            }

            if (authUser) {
                const dbUser = await getUserById(authUser.uid);
                if (dbUser) {
                    setUser(dbUser);
                } else {
                    // This might happen if user exists in Auth but not in Firestore DB yet.
                    // For now, we set it to null, but you might want to handle this case.
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        fetchUser();
    }, [authUser, authLoading]);

    return { user, loading };
};
