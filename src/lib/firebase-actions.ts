

'use server';

import { abjourTypesData } from '@/lib/abjour-data';
import type { Order, User, Opening, AbjourTypeData } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import { db } from '@/firebase/config';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, setDoc } from 'firebase/firestore';
import type { User as FirebaseAuthUser } from 'firebase/auth';


const testUsers = [
    { id: "4", name: "Adminstrator", email: "admin@abjour.com", phone: "555-4444", role: "admin" as const },
    { id: "5", name: "User", email: "user@abjour.com", phone: "555-5555", role: "user" as const },
];

export async function initializeTestUsers() {
    const usersRef = collection(db, "users");
    const batch = writeBatch(db);
    let usersCreated = false;

    for (const user of testUsers) {
        const userQuery = query(usersRef, where("email", "==", user.email));
        const userSnapshot = await getDocs(userQuery);
        if (userSnapshot.empty) {
            const userDocRef = doc(usersRef, user.id);
            batch.set(userDocRef, user);
            usersCreated = true;
            console.log(`Creating test user: ${user.email}`);
        }
    }

    if (usersCreated) {
        await batch.commit();
        console.log("Test users initialization complete.");
    }
}



// --- Orders ---
export const getOrders = async (): Promise<Order[]> => {
  const ordersSnapshot = await getDocs(collection(db, "orders"));
  return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const docRef = doc(db, "orders", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Order;
  }
  return undefined;
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    if(!userId) return [];
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const addOrder = async (orderData: any) => {
    const totalArea = orderData.openings.reduce(
      (acc: number, op: any) => acc + ((op.codeLength || 0) * (op.numberOfCodes || 0) * (orderData.bladeWidth || 0)) / 10000,
      0
    );
    const totalCost = totalArea * (orderData.pricePerSquareMeter || 0);

    const newOrderData = {
        ...orderData,
        totalArea,
        totalCost,
        isArchived: false,
    };
    
    const docRef = await addDoc(collection(db, "orders"), newOrderData);
    console.log("Added new order", {id: docRef.id, ...newOrderData});
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return {id: docRef.id, ...newOrderData};
};


export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
    console.log(`Updated order ${orderId} status to ${status}`);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    const updatedOrder = await getOrderById(orderId);
    if (!updatedOrder) throw new Error("Order not found after update");
    return updatedOrder;
};

export const updateOrderArchivedStatus = async (orderId: string, isArchived: boolean): Promise<Order> => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { isArchived });
    console.log(`Updated order ${orderId} archived status to ${isArchived}`);
    revalidatePath('/admin/orders');
    const updatedOrder = await getOrderById(orderId);
    if (!updatedOrder) throw new Error("Order not found after update");
    return updatedOrder;
};


export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<Order> => {
    const orderRef = doc(db, "orders", orderId);
    const originalOrder = await getOrderById(orderId);
    if (!originalOrder) throw new Error("Order not found");

    const totalArea = (orderData.openings || originalOrder.openings).reduce(
      (acc: number, op: Opening) => acc + (op.codeLength || 0) * (op.numberOfCodes || 0) * (orderData.bladeWidth || originalOrder.bladeWidth) / 10000,
      0
    );
    const totalCost = totalArea * (orderData.pricePerSquareMeter || originalOrder.pricePerSquareMeter);

    const updatedData = {
        ...orderData,
        totalArea,
        totalCost,
    };
    
    await updateDoc(orderRef, updatedData);

    console.log(`Updated order ${orderId}`, updatedData);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/edit`);
    revalidatePath('/');
    
    const updatedOrder = await getOrderById(orderId);
    if (!updatedOrder) throw new Error("Order not found after update");
    return updatedOrder;
};


export const deleteOrder = async (orderId: string): Promise<{ success: boolean }> => {
    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);
    console.log(`Deleted order ${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/');
    return { success: true };
};


// --- Users ---
export const getUsers = async (includeAdmins = false): Promise<User[]> => {
  let q = query(collection(db, "users"));
  if (!includeAdmins) {
      q = query(q, where("role", "==", "user"));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    if (!id) return undefined;
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return undefined;
};

export const getAllUsers = async (includeAdmins = false): Promise<User[]> => {
    let q = query(collection(db, "users"));
    if (!includeAdmins) {
        q = query(q, where("role", "==", "user"));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const addUserAndGetId = async (userData: Partial<User> & { email: string }): Promise<string> => {
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userData.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }
    
    // if an id is provided, use it, otherwise generate one
    const userRef = userData.id ? doc(db, 'users', userData.id) : doc(collection(db, 'users'));
    const finalUserData = { ...userData, id: userRef.id };
    await setDoc(userRef, finalUserData, { merge: true });

    revalidatePath('/admin/orders/new');
    console.log("Added/updated user", userData);
    return userRef.id;
};


export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    const userRef = doc(db, "users", userId);
    
    const dataToUpdate = { ...userData };
    delete (dataToUpdate as any).password; // Never save password to Firestore
    
    await setDoc(userRef, dataToUpdate, { merge: true });
    
    console.log(`Updated user ${userId}`, dataToUpdate);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);

    const updatedUser = await getUserById(userId);
    if (!updatedUser) throw new Error("User not found after update");
    return updatedUser;
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);

    const ordersQuery = query(collection(db, "orders"), where("userId", "==", userId));
    const ordersSnapshot = await getDocs(ordersQuery);
    const batch = writeBatch(db);
    ordersSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`Deleted user ${userId} and their orders`);
    revalidatePath('/admin/users');
    return { success: true };
};


// --- Materials ---
export const getMaterials = async (): Promise<AbjourTypeData[]> => {
    const materialsSnapshot = await getDocs(collection(db, "materials"));
    if (materialsSnapshot.empty) {
        console.log("No materials found, populating from default data...");
        const batch = writeBatch(db);
        abjourTypesData.forEach(material => {
            const materialRef = doc(db, "materials", material.name);
            batch.set(materialRef, material);
        });
        await batch.commit();
        return abjourTypesData;
    }
    return materialsSnapshot.docs.map(doc => doc.data() as AbjourTypeData);
};

export const getMaterialByName = async (name: string): Promise<AbjourTypeData | undefined> => {
    const q = query(collection(db, "materials"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as AbjourTypeData;
    }
    return undefined;
};

export const addMaterial = async (materialData: AbjourTypeData): Promise<AbjourTypeData> => {
    const existing = await getMaterialByName(materialData.name);
    if (existing) {
        throw new Error("مادة بهذا الاسم موجودة بالفعل.");
    }
    const materialRef = doc(db, "materials", materialData.name);
    await setDoc(materialRef, materialData);
    revalidatePath('/admin/materials');
    return materialData;
};

export const updateMaterial = async (materialData: AbjourTypeData): Promise<AbjourTypeData> => {
    const materialRef = doc(db, "materials", materialData.name);
    await updateDoc(materialRef, materialData);
    revalidatePath('/admin/materials');
    revalidatePath(`/admin/materials/${encodeURIComponent(materialData.name)}/edit`);
    return materialData;
};

export const deleteMaterial = async (materialName: string): Promise<{ success: boolean }> => {
    const materialRef = doc(db, "materials", materialName);
    await deleteDoc(materialRef);
    revalidatePath('/admin/materials');
    return { success: true };
};

