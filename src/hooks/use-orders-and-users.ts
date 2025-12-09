
'use client';
import { useState, useEffect } from 'react';
import type { Order, User, Purchase, AbjourTypeData, Supplier } from '@/lib/definitions';
import { getOrders, getUsers, getPurchases, getMaterials, getSuppliers, initializeTestUsers } from '@/lib/firebase-actions';

export function useOrdersAndUsers(userId?: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [materials, setMaterials] = useState<AbjourTypeData[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                await initializeTestUsers();
                
                const [ordersData, usersData, purchasesData, materialsData, suppliersData] = await Promise.all([
                    getOrders(),
                    getUsers(true), // Fetch all users including admins
                    getPurchases(),
                    getMaterials(),
                    getSuppliers(),
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
                setSuppliers(suppliersData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId]);

    return { orders, users, purchases, materials, suppliers, loading };
}
