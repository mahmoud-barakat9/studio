
'use client';
import { useState, useEffect } from 'react';
import type { Order, User } from '@/lib/definitions';
import { getOrders, getUsers, initializeTestUsers } from '@/lib/firebase-actions';

export function useOrdersAndUsers(userId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                await initializeTestUsers();
                
                const [ordersData, usersData] = await Promise.all([
                    getOrders(),
                    getUsers(true), // Fetch all users including admins
                ]);

                if (userId) {
                    const userOrders = ordersData.filter(order => order.userId === userId);
                    setOrders(userOrders);
                } else {
                    setOrders(ordersData);
                }
                setUsers(usersData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId]);

    return { orders, users, loading };
}
