'use server';

import { orders, users } from '@/lib/data';
import type { Order, User, Opening } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

// This is a mock implementation. In a real app, you would use Firebase.

export async function getOrders(): Promise<Order[]> {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(orders);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(orders.find((o) => o.id === id));
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    // In a real app, this would fetch from Firestore
    return Promise.resolve(orders.filter(order => order.userId === userId));
}

export async function getUsers(includeAdmins = false): Promise<User[]> {
  // In a real app, this would fetch from Firestore
  if (includeAdmins) {
      return Promise.resolve(users);
  }
  return Promise.resolve(users.filter(u => u.role === 'user' && u.email !== 'user@abjour.com'));
}

export async function getAllUsers(): Promise<User[]> {
    return Promise.resolve(users);
}

export async function getUserById(id: string): Promise<User | undefined> {
    return Promise.resolve(users.find((u) => u.id === id));
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
      (acc: number, op: any) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * 0.05,
      0
    );
    const totalCost = totalArea * 120;

    const selectedUser = users.find(u => u.id === orderData.userId);

    const newOrder: Order = {
        id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
        userId: orderData.userId,
        orderName: orderData.orderName,
        customerName: selectedUser?.name || orderData.customerName,
        customerPhone: selectedUser?.phone || orderData.customerPhone || '555-5678',
        status: orderData.status,
        date: new Date().toISOString().split('T')[0],
        totalArea,
        totalCost,
        openings: orderData.openings,
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


export async function updateOrder(orderId: string, orderData: Partial<Order>): Promise<Order> {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }

    const totalArea = (orderData.openings || orders[orderIndex].openings).reduce(
      (acc: number, op: Opening) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * 0.05,
      0
    );
    const totalCost = totalArea * 120;

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
    
    console.log(`Deleted user ${userId}`);
    revalidatePath('/admin/users');
    return Promise.resolve({ success: true });
}
