
'use client';
import { useState, useEffect } from 'react';
import type { Order, User, Purchase, AbjourTypeData } from '@/lib/definitions';
import { getOrders, getUsers, getPurchases, getMaterials, initializeTestUsers } from '@/lib/firebase-actions';

export function useOrdersAndUsers(userId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [materials, setMaterials] = useState<AbjourTypeData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Ensure test users are initialized, especially for dev environment
                await initializeTestUsers();
                
                const [ordersData, usersData, purchasesData, materialsData] = await Promise.all([
                    getOrders(),
                    getUsers(true), // Fetch all users including admins
                    getPurchases(),
                    getMaterials(),
                ]);

                if (userId) {
                    const userOrders = ordersData.filter(order => order.userId === userId);
                    setOrders(userOrders);
                } else {
                    setOrders(ordersData);
                }
                setUsers(usersData);
                setPurchases(purchasesData);
                setMaterials(materialsData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId]);

    return { orders, users, purchases, materials, loading };
}
