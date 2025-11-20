'use server';

import { abjourTypesData } from '@/lib/abjour-data';
import { orders as mockOrders, users as mockUsers } from '@/lib/data';
import type { Order, User, Opening, AbjourTypeData } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

// This is a mock implementation. In a real app, you would use Firebase.
let orders = [...mockOrders];
let users = [...mockUsers];
let materials = [...abjourTypesData];


export async function getOrders(): Promise<Order[]> {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(JSON.parse(JSON.stringify(orders)));
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(JSON.parse(JSON.stringify(orders.find((o) => o.id === id))));
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    // In a real app, this would fetch from Firestore
    return Promise.resolve(JSON.parse(JSON.stringify(orders.filter(order => order.userId === userId))));
}

export async function getUsers(includeAdmins = false): Promise<User[]> {
  // In a real app, this would fetch from Firestore
  if (includeAdmins) {
      return Promise.resolve(JSON.parse(JSON.stringify(users)));
  }
  return Promise.resolve(JSON.parse(JSON.stringify(users.filter(u => u.role === 'user' && u.email !== 'user@abjour.com'))));
}

export async function getUserById(id: string): Promise<User | undefined> {
    const allUsers = await getAllUsers();
    return Promise.resolve(JSON.parse(JSON.stringify(allUsers.find((u) => u.id === id))));
}

export async function getAllUsers(): Promise<User[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(users)));
}


export async function addUserAndGetId(userData: Omit<User, 'id'>): Promise<string> {
    const newId = `U${users.length + 1}`;
    const newUser: User = {
        id: newId,
        ...userData
    };
    users.push(newUser);
    revalidatePath('/admin/orders/new');
    console.log("Added new user", newUser);
    return Promise.resolve(newId);
}

export async function addOrder(orderData: any) {
    const totalArea = orderData.openings.reduce(
      (acc: number, op: any) => acc + ((op.codeLength || 0) * (op.numberOfCodes || 0) * (orderData.bladeWidth || 0)) / 10000,
      0
    );
    const totalCost = totalArea * (orderData.pricePerSquareMeter || 0);

    const allUsers = await getAllUsers();
    const selectedUser = allUsers.find(u => u.id === orderData.userId);

    const newOrder: Order = {
        id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
        userId: orderData.userId,
        orderName: orderData.orderName,
        customerName: selectedUser?.name || orderData.customerName || orderData.newUserName,
        customerPhone: selectedUser?.phone || orderData.customerPhone || orderData.newUserPhone || '555-5678',
        mainAbjourType: orderData.mainAbjourType,
        mainColor: orderData.mainColor,
        bladeWidth: orderData.bladeWidth,
        pricePerSquareMeter: orderData.pricePerSquareMeter,
        status: orderData.status,
        date: new Date().toISOString().split('T')[0],
        totalArea,
        totalCost,
        openings: orderData.openings,
        isArchived: false,
    };
    orders.unshift(newOrder); // Add to the beginning of the array
    console.log("Added new order", newOrder);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return Promise.resolve(newOrder);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }
    orders[orderIndex].status = status;
    console.log(`Updated order ${orderId} status to ${status}`);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return Promise.resolve(orders[orderIndex]);
}

export async function updateOrderArchivedStatus(orderId: string, isArchived: boolean): Promise<Order> {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }
    orders[orderIndex].isArchived = isArchived;
    console.log(`Updated order ${orderId} archived status to ${isArchived}`);
    revalidatePath('/admin/orders');
    return Promise.resolve(orders[orderIndex]);
}


export async function updateOrder(orderId: string, orderData: Partial<Order>): Promise<Order> {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }

    const totalArea = (orderData.openings || orders[orderIndex].openings).reduce(
      (acc: number, op: Opening) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * (orderData.bladeWidth || orders[orderIndex].bladeWidth) / 10000,
      0
    );
    const totalCost = totalArea * (orderData.pricePerSquareMeter || orders[orderIndex].pricePerSquareMeter);

    const updatedOrder = {
        ...orders[orderIndex],
        ...orderData,
        totalArea,
        totalCost,
    };

    orders[orderIndex] = updatedOrder;

    console.log(`Updated order ${orderId}`, updatedOrder);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/edit`);
    revalidatePath('/');
    return Promise.resolve(updatedOrder);
}


export async function deleteOrder(orderId: string): Promise<{ success: boolean }> {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }
    orders.splice(orderIndex, 1);
    console.log(`Deleted order ${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return Promise.resolve({ success: true });
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found");
    }
    
    const updatedUser = {
        ...users[userIndex],
        ...userData
    };

    // a real implementation would hash the password
    // if (userData.password) { ... }
    
    users[userIndex] = updatedUser;
    
    console.log(`Updated user ${userId}`, updatedUser);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);
    return Promise.resolve(updatedUser);
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found");
    }
    
    // In a real app, you'd handle associated data like orders.
    // For this mock, we'll just remove the user.
    users.splice(userIndex, 1);
    
    // Also remove user's orders
    orders = orders.filter(o => o.userId !== userId);

    console.log(`Deleted user ${userId}`);
    revalidatePath('/admin/users');
    return Promise.resolve({ success: true });
}


// MOCK ACTIONS FOR MATERIALS
export async function getMaterials(): Promise<AbjourTypeData[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(materials)));
}

export async function getMaterialByName(name: string): Promise<AbjourTypeData | undefined> {
    return Promise.resolve(JSON.parse(JSON.stringify(materials.find(m => m.name === name))));
}

export async function addMaterial(materialData: AbjourTypeData): Promise<AbjourTypeData> {
    const existing = materials.find(m => m.name === materialData.name);
    if (existing) {
        throw new Error("مادة بهذا الاسم موجودة بالفعل.");
    }
    materials.push(materialData);
    revalidatePath('/admin/materials');
    return Promise.resolve(materialData);
}

export async function updateMaterial(materialData: AbjourTypeData): Promise<AbjourTypeData> {
    const index = materials.findIndex(m => m.name === materialData.name);
    if (index === -1) {
        throw new Error("المادة غير موجودة.");
    }
    materials[index] = materialData;
    revalidatePath('/admin/materials');
    revalidatePath(`/admin/materials/${encodeURIComponent(materialData.name)}/edit`);
    return Promise.resolve(materialData);
}

export async function deleteMaterial(materialName: string): Promise<{ success: boolean }> {
    const index = materials.findIndex(m => m.name === materialName);
    if (index === -1) {
        throw new Error("المادة غير موجودة.");
    }
    materials.splice(index, 1);
    revalidatePath('/admin/materials');
    return Promise.resolve({ success: true });
}
