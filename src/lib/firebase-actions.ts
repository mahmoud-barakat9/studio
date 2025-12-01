

'use server';
import fs from 'fs';
import path from 'path';
import { abjourTypesData as defaultAbjourTypesData } from '@/lib/abjour-data';
import type { Order, User, Opening, AbjourTypeData } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const ordersFilePath = path.join(dataDir, 'orders.json');
const usersFilePath = path.join(dataDir, 'users.json');
const materialsFilePath = path.join(dataDir, 'materials.json');


const readData = <T>(filePath: string): T[] => {
    try {
        if (!fs.existsSync(filePath)) {
            // If the file doesn't exist, create it with an empty array or default data
            let defaultData: any[] = [];
            if (filePath.includes('materials.json')) {
                defaultData = defaultAbjourTypesData;
            }
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData as T[];
        }
        const jsonData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonData) as T[];
    } catch (error) {
        console.error(`Error reading from ${filePath}:`, error);
        if (filePath.includes('materials.json')) return defaultAbjourTypesData as T[];
        return [];
    }
};

const writeData = <T>(filePath: string, data: T[]): void => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
    }
};


let testUsersInitialized = false;

export async function initializeTestUsers() {
    if (testUsersInitialized) return;

    let users = readData<User>(usersFilePath);
    let changed = false;

    const testUser = users.find(u => u.id === '5');
    if (!testUser) {
        users.push({ id: '5', name: 'User', email: 'user@abjour.com', phone: '555-5555', role: 'user' });
        changed = true;
    }

    const adminUser = users.find(u => u.id === '4');
    if (!adminUser) {
        users.push({ id: '4', name: 'Adminstrator', email: 'admin@abjour.com', phone: '555-4444', role: 'admin' });
        changed = true;
    }
    
    if (changed) {
        writeData<User>(usersFilePath, users);
    }
    
    testUsersInitialized = true;
}


// --- Orders ---
export const getOrders = async (): Promise<Order[]> => {
  const orders = readData<Order>(ordersFilePath);
  return Promise.resolve(orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const orders = readData<Order>(ordersFilePath);
  return Promise.resolve(orders.find(o => o.id === id));
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    if(!userId) return Promise.resolve([]);
    const orders = readData<Order>(ordersFilePath);
    const userOrders = orders.filter(o => o.userId === userId);
    return Promise.resolve(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};


export const addOrder = async (orderData: Omit<Order, 'id' | 'isArchived'> & { id?: string }) => {
    let orders = readData<Order>(ordersFilePath);
    const newId = orderData.id || `ORD${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`;
    
    const totalArea = orderData.openings.reduce(
      (acc: number, op: any) => acc + ((op.codeLength || 0) * (op.numberOfCodes || 0) * (orderData.bladeWidth || 0)) / 10000,
      0
    );

    const finalPricePerMeter = orderData.overriddenPricePerSquareMeter || orderData.pricePerSquareMeter;
    const productsCost = totalArea * finalPricePerMeter;

    let deliveryCost = 0;
    if (orderData.hasDelivery) {
        const baseDeliveryFee = 5; // Base fee
        const perMeterFee = 0.5; // $0.5 per square meter
        deliveryCost = baseDeliveryFee + (totalArea * perMeterFee);
    }
    
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
        overriddenPricePerSquareMeter: orderData.overriddenPricePerSquareMeter,
        status: orderData.status,
        date: orderData.date,
        totalArea,
        totalCost: productsCost,
        openings: orderData.openings,
        isArchived: false,
        hasDelivery: orderData.hasDelivery,
        deliveryCost: deliveryCost,
        deliveryAddress: orderData.deliveryAddress,
    };
    
    orders.unshift(newOrder);
    writeData<Order>(ordersFilePath, orders);

    return Promise.resolve(newOrder);
};


export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
    let orders = readData<Order>(ordersFilePath);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    orders[orderIndex].status = status;
    if (status === 'Delivered') {
        orders[orderIndex].actualDeliveryDate = new Date().toISOString().split('T')[0];
    }
    
    writeData<Order>(ordersFilePath, orders);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return Promise.resolve(orders[orderIndex]);
};

export const updateOrderArchivedStatus = async (orderId: string, isArchived: boolean): Promise<Order> => {
    let orders = readData<Order>(ordersFilePath);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    orders[orderIndex].isArchived = isArchived;
    writeData<Order>(ordersFilePath, orders);
    revalidatePath('/admin/orders');
    return Promise.resolve(orders[orderIndex]);
};


export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<Order> => {
    let orders = readData<Order>(ordersFilePath);
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
    
    const finalPricePerMeter = orderData.overriddenPricePerSquareMeter !== undefined ? orderData.overriddenPricePerSquareMeter : orderData.pricePerSquareMeter !== undefined ? orderData.pricePerSquareMeter : originalOrder.pricePerSquareMeter;
    const productsCost = totalArea * finalPricePerMeter;

    const updatedData: Order = {
        ...originalOrder,
        ...orderData,
        totalArea,
        totalCost: productsCost,
        deliveryCost: deliveryCost,
    };
    
    orders[orderIndex] = updatedData;
    writeData<Order>(ordersFilePath, orders);

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/edit`);
    revalidatePath('/');
    
    return Promise.resolve(updatedData);
};


export const deleteOrder = async (orderId: string): Promise<{ success: boolean }> => {
    let orders = readData<Order>(ordersFilePath);
    orders = orders.filter(o => o.id !== orderId);
    writeData<Order>(ordersFilePath, orders);

    revalidatePath('/admin/orders');
    revalidatePath('/');
    return Promise.resolve({ success: true });
};


// --- Users ---
export const getUsers = async (includeAdmins = false): Promise<User[]> => {
  const users = readData<User>(usersFilePath);
  if (includeAdmins) {
      return Promise.resolve(users);
  }
  return Promise.resolve(users.filter(u => u.role === 'user'));
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    if (!id) return Promise.resolve(undefined);
    const users = readData<User>(usersFilePath);
    return Promise.resolve(users.find(u => u.id === id));
};

export const getAllUsers = async (includeAdmins = false): Promise<User[]> => {
    return getUsers(includeAdmins);
};

export const addUserAndGetId = async (userData: Partial<User> & { email: string }): Promise<string> => {
    let users = readData<User>(usersFilePath);
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
    writeData<User>(usersFilePath, users);

    revalidatePath('/admin/orders/new');
    return Promise.resolve(newId);
};


export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    let users = readData<User>(usersFilePath);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    writeData<User>(usersFilePath, users);
    
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);

    return Promise.resolve(updatedUser);
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    let users = readData<User>(usersFilePath);
    let orders = readData<Order>(ordersFilePath);

    users = users.filter(u => u.id !== userId);
    orders = orders.filter(o => o.userId !== userId);
    
    writeData<User>(usersFilePath, users);
    writeData<Order>(ordersFilePath, orders);

    revalidatePath('/admin/users');
    return Promise.resolve({ success: true });
};


// --- Materials ---
export const getMaterials = async (): Promise<AbjourTypeData[]> => {
    return Promise.resolve(readData<AbjourTypeData>(materialsFilePath));
};

export const getMaterialByName = async (name: string): Promise<AbjourTypeData | undefined> => {
    const materials = readData<AbjourTypeData>(materialsFilePath);
    return Promise.resolve(materials.find(m => m.name === name));
};

export const addMaterial = async (materialData: AbjourTypeData): Promise<AbjourTypeData> => {
    let materials = readData<AbjourTypeData>(materialsFilePath);
    const existing = materials.find(m => m.name === materialData.name);
    if (existing) {
        throw new Error("مادة بهذا الاسم موجودة بالفعل.");
    }
    materials.push(materialData);
    writeData<AbjourTypeData>(materialsFilePath, materials);

    revalidatePath('/admin/materials');
    return Promise.resolve(materialData);
};

export const updateMaterial = async (materialData: AbjourTypeData): Promise<AbjourTypeData> => {
    let materials = readData<AbjourTypeData>(materialsFilePath);
    const materialIndex = materials.findIndex(m => m.name === materialData.name);
    if (materialIndex === -1) throw new Error("Material not found");
    
    materials[materialIndex] = materialData;
    writeData<AbjourTypeData>(materialsFilePath, materials);

    revalidatePath('/admin/materials');
    revalidatePath(`/admin/materials/${encodeURIComponent(materialData.name)}/edit`);
    return Promise.resolve(materialData);
};

export const deleteMaterial = async (materialName: string): Promise<{ success: boolean }> => {
    let materials = readData<AbjourTypeData>(materialsFilePath);
    materials = materials.filter(m => m.name !== materialName);
    writeData<AbjourTypeData>(materialsFilePath, materials);

    revalidatePath('/admin/materials');
    return Promise.resolve({ success: true });
};
