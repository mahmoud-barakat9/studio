
'use client';
import { useState, useEffect } from 'react';
import type { Order, User, Purchase } from '@/lib/definitions';
import { getOrders, getUsers, getPurchases, initializeTestUsers } from '@/lib/firebase-actions';

export function useOrdersAndUsers(userId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Ensure test users are initialized, especially for dev environment
                await initializeTestUsers();
                
                const [ordersData, usersData, purchasesData] = await Promise.all([
                    getOrders(),
                    getUsers(true), // Fetch all users including admins
                    getPurchases(),
                ]);

                if (userId) {
                    const userOrders = ordersData.filter(order => order.userId === userId);
                    setOrders(userOrders);
                } else {
                    setOrders(ordersData);
                }
                setUsers(usersData);
                setPurchases(purchasesData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId]);

    return { orders, users, purchases, loading };
}

    