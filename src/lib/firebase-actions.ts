

'use server';
import fs from 'fs';
import path from 'path';
import { abjourTypesData as defaultAbjourTypesData } from '@/lib/abjour-data';
import type { Order, User, Opening, AbjourTypeData, Purchase, Supplier, Notification } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const ordersFilePath = path.join(dataDir, 'orders.json');
const usersFilePath = path.join(dataDir, 'users.json');
const materialsFilePath = path.join(dataDir, 'materials.json');
const purchasesFilePath = path.join(dataDir, 'purchases.json');
const suppliersFilePath = path.join(dataDir, 'suppliers.json');
const notificationsFilePath = path.join(dataDir, 'notifications.json');


const readData = <T>(filePath: string): T[] => {
    try {
        if (!fs.existsSync(filePath)) {
            // If the file doesn't exist, create it with an empty array or default data
            let defaultData: any[] = [];
            if (filePath.includes('materials.json')) {
                defaultData = defaultAbjourTypesData;
            }
             if (filePath.includes('suppliers.json')) {
                defaultData = [{ id: '1', name: 'مورد عام' }];
            }
             if (filePath.includes('notifications.json')) {
                defaultData = [];
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
        isEditRequested: false,
    };
    
    orders.unshift(newOrder);
    writeData<Order>(ordersFilePath, orders);

    return Promise.resolve(newOrder);
};


export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
    let orders = readData<Order>(ordersFilePath);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    const order = orders[orderIndex];
    const previousStatus = order.status;
    
    orders[orderIndex].status = status;
    if (status === 'Delivered') {
        orders[orderIndex].actualDeliveryDate = new Date().toISOString().split('T')[0];
    }
    
    // Deduct stock when order moves to Processing
    if (status === 'Processing' && previousStatus !== 'Processing') {
        const materials = readData<AbjourTypeData>(materialsFilePath);
        const materialIndex = materials.findIndex(m => m.name === order.mainAbjourType);
        if (materialIndex !== -1) {
            materials[materialIndex].stock -= order.totalArea;
            writeData<AbjourTypeData>(materialsFilePath, materials);
            revalidatePath('/admin/inventory');
        }
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

export const addUser = async (userData: Partial<User> & { email: string; name: string, role: "admin" | "user" }): Promise<User> => {
    let users = readData<User>(usersFilePath);
    let existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error("مستخدم بهذا البريد الإلكتروني موجود بالفعل.");
    }
    
    const newId = `${users.length + 1}`;
    const newUser: User = {
        id: newId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
    };
    users.push(newUser);
    writeData<User>(usersFilePath, users);

    revalidatePath('/admin/users');
    revalidatePath('/admin/users/new');
    return Promise.resolve(newUser);
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

export const updateMaterial = async (materialName: string, materialData: Partial<AbjourTypeData>): Promise<AbjourTypeData> => {
    let materials = readData<AbjourTypeData>(materialsFilePath);
    const materialIndex = materials.findIndex(m => m.name === materialName);
    if (materialIndex === -1) throw new Error("Material not found");
    
    const currentStock = materials[materialIndex].stock;
    
    materials[materialIndex] = {...materials[materialIndex], ...materialData, stock: currentStock};
    writeData<AbjourTypeData>(materialsFilePath, materials);

    revalidatePath('/admin/materials');
    revalidatePath(`/admin/materials/${encodeURIComponent(materialName)}/edit`);
    return Promise.resolve(materials[materialIndex]);
};

export const deleteMaterial = async (materialName: string): Promise<{ success: boolean }> => {
    let materials = readData<AbjourTypeData>(materialsFilePath);
    materials = materials.filter(m => m.name !== materialName);
    writeData<AbjourTypeData>(materialsFilePath, materials);

    revalidatePath('/admin/materials');
    return Promise.resolve({ success: true });
};


// --- Purchases ---
export const getPurchases = async (): Promise<Purchase[]> => {
    const purchases = readData<Purchase>(purchasesFilePath);
    return Promise.resolve(purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export const getPurchaseById = async (id: string): Promise<Purchase | undefined> => {
    const purchases = readData<Purchase>(purchasesFilePath);
    return Promise.resolve(purchases.find(p => p.id === id));
};

export const getPurchasesBySupplierId = async (supplierName: string): Promise<Purchase[]> => {
    const purchases = await getPurchases();
    return purchases.filter(p => p.supplierName === supplierName);
};

export const addPurchase = async (purchaseData: Omit<Purchase, 'id' | 'date'>): Promise<Purchase> => {
    let purchases = readData<Purchase>(purchasesFilePath);
    const newPurchase: Purchase = {
        id: `PUR-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ...purchaseData
    };
    purchases.unshift(newPurchase);
    writeData<Purchase>(purchasesFilePath, purchases);

    // Update material stock
    let materials = readData<AbjourTypeData>(materialsFilePath);
    const materialIndex = materials.findIndex(m => m.name === purchaseData.materialName);
    
    if (materialIndex !== -1) {
        materials[materialIndex].stock += purchaseData.quantity;
    } else {
         console.error(`Attempted to add stock for non-existent material: ${purchaseData.materialName}`);
    }
    
    writeData<AbjourTypeData>(materialsFilePath, materials);
    
    revalidatePath('/admin/inventory');
    return Promise.resolve(newPurchase);
}

export const updatePurchase = async (purchaseId: string, purchaseData: Partial<Purchase>): Promise<Purchase> => {
    let purchases = readData<Purchase>(purchasesFilePath);
    const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
    if (purchaseIndex === -1) throw new Error("Purchase not found");
    
    const originalPurchase = purchases[purchaseIndex];
    const quantityDifference = (purchaseData.quantity ?? originalPurchase.quantity) - originalPurchase.quantity;

    purchases[purchaseIndex] = { ...originalPurchase, ...purchaseData };
    writeData<Purchase>(purchasesFilePath, purchases);

    // Update stock if quantity changed
    if (quantityDifference !== 0) {
        let materials = readData<AbjourTypeData>(materialsFilePath);
        const materialIndex = materials.findIndex(m => m.name === originalPurchase.materialName);
        if (materialIndex !== -1) {
            materials[materialIndex].stock += quantityDifference;
            writeData<AbjourTypeData>(materialsFilePath, materials);
        }
    }
    
    revalidatePath('/admin/inventory');
    return Promise.resolve(purchases[purchaseIndex]);
};

export const deletePurchase = async (purchaseId: string): Promise<{ success: boolean }> => {
    let purchases = readData<Purchase>(purchasesFilePath);
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) throw new Error("Purchase not found");

    purchases = purchases.filter(p => p.id !== purchaseId);
    writeData<Purchase>(purchasesFilePath, purchases);
    
    // Reverse the stock addition
    let materials = readData<AbjourTypeData>(materialsFilePath);
    const materialIndex = materials.findIndex(m => m.name === purchase.materialName);
    if (materialIndex !== -1) {
        materials[materialIndex].stock -= purchase.quantity;
        writeData<AbjourTypeData>(materialsFilePath, materials);
    }
    
    revalidatePath('/admin/inventory');
    return Promise.resolve({ success: true });
};


// --- Suppliers ---
export const getSuppliers = async (): Promise<Supplier[]> => {
    return Promise.resolve(readData<Supplier>(suppliersFilePath));
};

export const getSupplierById = async (id: string): Promise<Supplier | undefined> => {
    if (!id) return Promise.resolve(undefined);
    const suppliers = readData<Supplier>(suppliersFilePath);
    return Promise.resolve(suppliers.find(s => s.id === id));
};

export const addSupplier = async (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    let suppliers = readData<Supplier>(suppliersFilePath);
    const newId = `${suppliers.length + 1}`;
    const newSupplier: Supplier = {
        id: newId,
        ...supplierData,
    };
    suppliers.push(newSupplier);
    writeData<Supplier>(suppliersFilePath, suppliers);

    revalidatePath('/admin/suppliers');
    return Promise.resolve(newSupplier);
};

// --- Notifications ---
export async function addNotification(notification: Omit<Notification, 'id' | 'date' | 'isRead'>): Promise<Notification> {
    const notifications = readData<Notification>(notificationsFilePath);
    const newNotification: Notification = {
        id: `NOTIF-${Date.now()}`,
        date: new Date().toISOString(),
        isRead: false,
        ...notification,
    };
    notifications.unshift(newNotification);
    writeData<Notification>(notificationsFilePath, notifications);
    revalidatePath('/notifications'); // Revalidate user's notification page
    return newNotification;
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const notifications = readData<Notification>(notificationsFilePath);
    return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function markNotificationAsReadDB(notificationId: string): Promise<Notification | undefined> {
    const notifications = readData<Notification>(notificationsFilePath);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex > -1) {
        notifications[notificationIndex].isRead = true;
        writeData<Notification>(notificationsFilePath, notifications);
        revalidatePath('/notifications');
        return notifications[notificationIndex];
    }
    return undefined;
}

export async function markAllNotificationsAsReadDB(userId: string): Promise<{ success: boolean }> {
    let notifications = readData<Notification>(notificationsFilePath);
    notifications.forEach(n => {
        if (n.userId === userId && !n.isRead) {
            n.isRead = true;
        }
    });
    writeData<Notification>(notificationsFilePath, notifications);
    revalidatePath('/notifications');
    return { success: true };
}
    

