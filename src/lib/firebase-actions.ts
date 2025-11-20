

'use server';

import { abjourTypesData as defaultAbjourTypesData } from '@/lib/abjour-data';
import type { Order, User, Opening, AbjourTypeData } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import { users as mockUsers, orders as mockOrders } from './data';

let orders: Order[] = [...mockOrders];
let users: User[] = [...mockUsers];
let abjourTypesData: AbjourTypeData[] = [...defaultAbjourTypesData];

let testUsersInitialized = false;

export async function initializeTestUsers() {
    if (testUsersInitialized) return;

    const testUser = users.find(u => u.id === '5');
    if (!testUser) {
        users.push({ id: '5', name: 'User', email: 'user@abjour.com', phone: '555-5555', role: 'user' });
    }

    const adminUser = users.find(u => u.id === '4');
    if (!adminUser) {
        users.push({ id: '4', name: 'Adminstrator', email: 'admin@abjour.com', phone: '555-4444', role: 'admin' });
    }
    
    testUsersInitialized = true;
    console.log("Mock test users initialized.");
}


// --- Orders ---
export const getOrders = async (): Promise<Order[]> => {
  return Promise.resolve(orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  return Promise.resolve(orders.find(o => o.id === id));
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    if(!userId) return Promise.resolve([]);
    const userOrders = orders.filter(o => o.userId === userId);
    return Promise.resolve(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};


export const addOrder = async (orderData: Omit<Order, 'id' | 'isArchived'> & { id?: string }) => {
    const newId = orderData.id || `ORD${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`;
    
    const newOrder: Order = {
        id: newId,
        orderName: orderData.orderName,
        userId: orderData.userId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        mainAbjourType: orderData.mainAbjourType,
        mainColor: orderData.mainColor,
        bladeWidth: orderData.bladeWidth,
        pricePerSquareMeter: orderData.pricePerSquareMeter,
        status: orderData.status,
        date: orderData.date,
        totalArea: orderData.totalArea,
        totalCost: orderData.totalCost,
        openings: orderData.openings,
        isArchived: false,
        hasDelivery: orderData.hasDelivery,
        deliveryCost: orderData.deliveryCost,
        deliveryAddress: orderData.deliveryAddress,
    };
    
    orders.unshift(newOrder); // Add to the beginning of the array
    console.log("Added new order (mock)", newOrder);
    return Promise.resolve(newOrder);
};


export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    orders[orderIndex].status = status;
    
    console.log(`Updated order ${orderId} status to ${status} (mock)`);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return Promise.resolve(orders[orderIndex]);
};

export const updateOrderArchivedStatus = async (orderId: string, isArchived: boolean): Promise<Order> => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    orders[orderIndex].isArchived = isArchived;
    console.log(`Updated order ${orderId} archived status to ${isArchived} (mock)`);
    revalidatePath('/admin/orders');
    return Promise.resolve(orders[orderIndex]);
};


export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<Order> => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");

    const originalOrder = orders[orderIndex];

    const totalArea = (orderData.openings || originalOrder.openings).reduce(
      (acc: number, op: Opening) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * (orderData.bladeWidth || originalOrder.bladeWidth) / 10000,
      0
    );
    
    let deliveryCost = originalOrder.deliveryCost;
    if (orderData.hasDelivery) {
        const baseDeliveryFee = 5;
        const perMeterFee = 0.5;
        deliveryCost = baseDeliveryFee + (totalArea * perMeterFee);
    } else if (orderData.hasDelivery === false) {
        deliveryCost = 0;
    }


    const productsCost = totalArea * (orderData.pricePerSquareMeter || originalOrder.pricePerSquareMeter);

    const updatedData: Order = {
        ...originalOrder,
        ...orderData,
        totalArea,
        totalCost: productsCost,
        deliveryCost: deliveryCost,
    };
    
    orders[orderIndex] = updatedData;

    console.log(`Updated order ${orderId} (mock)`, updatedData);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/edit`);
    revalidatePath('/');
    
    return Promise.resolve(updatedData);
};


export const deleteOrder = async (orderId: string): Promise<{ success: boolean }> => {
    orders = orders.filter(o => o.id !== orderId);
    console.log(`Deleted order ${orderId} (mock)`);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return Promise.resolve({ success: true });
};


// --- Users ---
export const getUsers = async (includeAdmins = false): Promise<User[]> => {
  if (includeAdmins) {
      return Promise.resolve(users);
  }
  return Promise.resolve(users.filter(u => u.role === 'user'));
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    if (!id) return Promise.resolve(undefined);
    return Promise.resolve(users.find(u => u.id === id));
};

export const getAllUsers = async (includeAdmins = false): Promise<User[]> => {
    return getUsers(includeAdmins);
};

export const addUserAndGetId = async (userData: Partial<User> & { email: string }): Promise<string> => {
    let existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        return Promise.resolve(existingUser.id);
    }
    
    const newId = `${users.length + 1}`;
    const newUser: User = {
        id: newId,
        name: userData.name || 'New User',
        email: userData.email,
        phone: userData.phone || '',
        role: 'user',
    };
    users.push(newUser);

    revalidatePath('/admin/orders/new');
    console.log("Added new user (mock)", newUser);
    return Promise.resolve(newId);
};


export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    
    console.log(`Updated user ${userId} (mock)`, updatedUser);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);

    return Promise.resolve(updatedUser);
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    users = users.filter(u => u.id !== userId);
    orders = orders.filter(o => o.userId !== userId);

    console.log(`Deleted user ${userId} and their orders (mock)`);
    revalidatePath('/admin/users');
    return Promise.resolve({ success: true });
};


// --- Materials ---
export const getMaterials = async (): Promise<AbjourTypeData[]> => {
    return Promise.resolve(abjourTypesData);
};

export const getMaterialByName = async (name: string): Promise<AbjourTypeData | undefined> => {
    return Promise.resolve(abjourTypesData.find(m => m.name === name));
};

export const addMaterial = async (materialData: AbjourTypeData): Promise<AbjourTypeData> => {
    const existing = abjourTypesData.find(m => m.name === materialData.name);
    if (existing) {
        throw new Error("مادة بهذا الاسم موجودة بالفعل.");
    }
    abjourTypesData.push(materialData);
    revalidatePath('/admin/materials');
    return Promise.resolve(materialData);
};

export const updateMaterial = async (materialData: AbjourTypeData): Promise<AbjourTypeData> => {
    const materialIndex = abjourTypesData.findIndex(m => m.name === materialData.name);
    if (materialIndex === -1) throw new Error("Material not found");
    
    abjourTypesData[materialIndex] = materialData;
    revalidatePath('/admin/materials');
    revalidatePath(`/admin/materials/${encodeURIComponent(materialData.name)}/edit`);
    return Promise.resolve(materialData);
};

export const deleteMaterial = async (materialName: string): Promise<{ success: boolean }> => {
    abjourTypesData = abjourTypesData.filter(m => m.name !== materialName);
    revalidatePath('/admin/materials');
    return Promise.resolve({ success: true });
};
