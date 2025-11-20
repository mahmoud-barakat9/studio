

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { addOrder, updateUser as updateUserDB, deleteUser as deleteUserDB, updateOrderArchivedStatus, addMaterial, updateMaterial as updateMaterialDB, deleteMaterial as deleteMaterialDB, getAllUsers, updateOrder as updateOrderDB, getOrderById, deleteOrder as deleteOrderDB, updateOrderStatus as updateOrderStatusDB, addUserAndGetId, getUserById, initializeTestUsers } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import type { AbjourTypeData, User, Order } from './definitions';

export async function calculateAbjourDimensions(
  prevState: any,
  formData: { width: number; abjourType: string }
) {
  try {
    const result = await calculateAbjourDimensionsAI({
      width: formData.width,
      abjourType: formData.abjourType,
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: 'Failed to calculate dimensions.' };
  }
}

export async function generateOrderName(
  prevState: any,
  formData: {
    abjourType: string;
    color: string;
    codeLength: number;
    numberOfCodes: number;
  }
) {
  try {
    const result = await generateOrderNameAI(formData);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: 'Failed to generate name.' };
  }
}

export async function createOrder(formData: any, asAdmin: boolean) {
  let userId;
  let finalCustomerData: Partial<User> = {};
  
  const DUMMY_USER_ID = '5';
  const sessionUserId = DUMMY_USER_ID;
  
  await initializeTestUsers(); // Ensure users exist before we do anything

  if (asAdmin) {
    if (formData.userId === 'new') {
      if (!formData.newUserName || !formData.newUserEmail) {
        throw new Error("New user name and email are required.");
      }
      const newUserData = {
        name: formData.newUserName,
        email: formData.newUserEmail,
        phone: formData.newUserPhone,
        role: 'user' as const,
      };
      const createdUserId = await addUserAndGetId(newUserData);
      userId = createdUserId;
      finalCustomerData = newUserData;

    } else {
      userId = formData.userId;
      const existingUser = await getUserById(userId);
      if (existingUser) {
        finalCustomerData = { name: existingUser.name, phone: existingUser.phone };
      }
    }
  } else {
     userId = sessionUserId;
     const currentUser = await getUserById(userId!);
     if(currentUser) {
        finalCustomerData = { name: currentUser.name, phone: formData.customerPhone || currentUser.phone };
     }
  }
  
  if(!userId){
    throw new Error("User not found");
  }
  
  const totalArea = formData.openings.reduce(
      (acc: number, op: any) => acc + ((op.codeLength || 0) * (op.numberOfCodes || 0) * (formData.bladeWidth || 0)) / 10000,
      0
    );

  let deliveryCost = 0;
  if (formData.hasDelivery) {
    const baseDeliveryFee = 5; // Base fee
    const perMeterFee = 0.5; // $0.5 per square meter
    deliveryCost = baseDeliveryFee + (totalArea * perMeterFee);
  }

  const productsCost = totalArea * (formData.pricePerSquareMeter || 0);

  const orderData = {
    ...formData,
    userId,
    customerName: finalCustomerData.name,
    customerPhone: finalCustomerData.phone,
    status: asAdmin ? 'FactoryOrdered' : 'Pending',
    date: new Date().toISOString().split('T')[0],
    totalArea,
    totalCost: productsCost,
    deliveryCost,
    attachments: {},
  };
  
  const newOrder = await addOrder(orderData);

  if (asAdmin) {
    revalidatePath('/admin/orders');
    redirect('/admin/orders');
  } else {
    revalidatePath('/dashboard');
    revalidatePath('/admin/orders'); // also revalidate admin page so they see the new order
    redirect(`/admin/orders/${newOrder.id}/view`);
  }
  
  return { success: true };
}


export async function updateOrder(orderId: string, formData: any, asAdmin: boolean) {
  const orderData = {
    ...formData,
    status: formData.status, 
  };

  await updateOrderDB(orderId, orderData);

  if (asAdmin) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    redirect('/admin/orders');
  } else {
    // non-admin updates not implemented
  }
  
  return { success: true };
}


export async function approveOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  await updateOrderStatusDB(orderId, 'FactoryOrdered');
  revalidatePath('/admin/orders');

  const customerPhone = order.customerPhone?.replace(/\D/g, '');
  const message = encodeURIComponent(`مرحبًا ${order.customerName}, تم قبول طلبك "${order.orderName}" وتم إرساله إلى المعمل.`);
  const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;
  redirect(whatsappUrl);
}

export async function rejectOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  await updateOrderStatusDB(orderId, 'Rejected');
  revalidatePath('/admin/orders');
  
  const customerPhone = order.customerPhone?.replace(/\D/g, '');
  const message = encodeURIComponent(`مرحبًا ${order.customerName}, نأسف لإبلاغك بأنه تم رفض طلبك "${order.orderName}". الرجاء التواصل معنا للمزيد من التفاصيل.`);
  const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;
  redirect(whatsappUrl);
}

// The formData parameter is kept for compatibility with form actions, even if not used.
export async function updateOrderStatus(orderId: string, status: Order['status'], attachmentUrl?: string, formData?: FormData) {
    await updateOrderStatusDB(orderId, status, attachmentUrl);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
}


export async function deleteOrder(orderId: string) {
  await deleteOrderDB(orderId);
  revalidatePath('/admin/orders');
  revalidatePath('/dashboard');
}


export async function updateUser(userId: string, formData: any) {
    const dataToUpdate: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
    };

    await updateUserDB(userId, dataToUpdate);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);
    redirect('/admin/users');

    return { success: true };
}

export async function deleteUser(userId: string) {
    await deleteUserDB(userId);
    revalidatePath('/admin/users');
}


export async function archiveOrder(orderId: string) {
    await updateOrderArchivedStatus(orderId, true);
    revalidatePath('/admin/orders');
  }
  
  export async function restoreOrder(orderId: string) {
    await updateOrderArchivedStatus(orderId, false);
    revalidatePath('/admin/orders');
  }

const materialSchema = z.object({
  name: z.string().min(2),
  bladeWidth: z.coerce.number().min(0.1),
  pricePerSquareMeter: z.coerce.number().min(0.1),
  colors: z.string().min(1),
});

export async function createMaterial(formData: z.infer<typeof materialSchema>) {
    const validatedFields = materialSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }
    
    const materialData: AbjourTypeData = {
        ...validatedFields.data,
        colors: validatedFields.data.colors.split(',').map(c => c.trim()).filter(Boolean)
    };

    try {
        await addMaterial(materialData);
        revalidatePath('/admin/materials');
        redirect('/admin/materials');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateMaterial(formData: z.infer<typeof materialSchema>) {
     const validatedFields = materialSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }

    const materialData: AbjourTypeData = {
        ...validatedFields.data,
        colors: validatedFields.data.colors.split(',').map(c => c.trim()).filter(Boolean)
    };
    
    try {
        await updateMaterialDB(materialData);
        revalidatePath('/admin/materials');
        revalidatePath(`/admin/materials/${encodeURIComponent(materialData.name)}/edit`);
        redirect('/admin/materials');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteMaterial(materialName: string) {
    try {
        await deleteMaterialDB(materialName);
        revalidatePath('/admin/materials');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
