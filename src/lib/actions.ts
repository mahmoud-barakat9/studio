

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { addOrder, updateUser as updateUserDB, deleteUser as deleteUserDB, updateOrderArchivedStatus, addMaterial, updateMaterial as updateMaterialDB, deleteMaterial as deleteMaterialDB, getAllUsers, updateOrder as updateOrderDB, getOrderById, deleteOrder as deleteOrderDB, updateOrderStatus as updateOrderStatusDB, addUserAndGetId, getUserById, initializeTestUsers, addPurchase as addPurchaseDB } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import type { AbjourTypeData, User, Order } from './definitions';

const ADMIN_WHATSAPP_NUMBER = "963123456789"; // Replace with the actual admin WhatsApp number

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
  
  const orderData = {
    ...formData,
    userId,
    customerName: finalCustomerData.name,
    customerPhone: finalCustomerData.phone,
    status: 'Pending', // All new orders start as Pending
    date: new Date().toISOString().split('T')[0],
  };
  
  const newOrder = await addOrder(orderData);

  revalidatePath('/dashboard');
  revalidatePath('/orders');
  revalidatePath('/admin/orders');
  revalidatePath('/admin/inventory');

  if (asAdmin) {
    redirect('/admin/orders');
  } 
  
  return { success: true, orderId: newOrder.id };
}


export async function updateOrder(orderId: string, formData: any, asAdmin: boolean) {
  const orderData = {
    ...formData,
    status: formData.status, 
    scheduledDeliveryDate: formData.scheduledDeliveryDate,
  };

  await updateOrderDB(orderId, orderData);

  if (asAdmin) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    redirect('/admin/orders');
  } else {
    // non-admin updates
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/orders');
    redirect(`/orders/${orderId}`);
  }
  
  return { success: true };
}


export async function approveOrder(orderId: string) {
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: 'لم يتم العثور على الطلب' };

    await updateOrderStatusDB(orderId, 'Approved');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/orders');

    const customerPhone = order.customerPhone?.replace(/\D/g, '');
    const message = encodeURIComponent(`مرحبًا ${order.customerName}, تمت الموافقة على طلبك "${order.orderName}" وهو الآن قيد المراجعة النهائية قبل إرساله للمعمل.`);
    const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;
    
    return { success: true, whatsappUrl };
}

export async function sendToFactory(orderId: string) {
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: 'لم يتم العثور على الطلب' };

    await updateOrderStatusDB(orderId, 'FactoryOrdered');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    
    const factoryWhatsAppNumber = ADMIN_WHATSAPP_NUMBER; 

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const factoryInvoiceUrl = `${appBaseUrl}/admin/orders/${orderId}/view?type=factory`; 

    const message = encodeURIComponent(`طلب تصنيع جديد: ${order.orderName}\nرقم الطلب: ${order.id}\nالرجاء مراجعة التفاصيل وبدء الإنتاج.\n\nرابط الفاتورة الفنية: ${factoryInvoiceUrl}`);
    const whatsappUrl = `https://wa.me/${factoryWhatsAppNumber}?text=${message}`;
    
    return { success: true, whatsappUrl };
}

export async function rejectOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return { success: false, error: 'لم يتم العثور على الطلب' };

  await updateOrderStatusDB(orderId, 'Rejected');
  revalidatePath('/admin/orders');
  revalidatePath('/orders');
  
  const customerPhone = order.customerPhone?.replace(/\D/g, '');
  const message = encodeURIComponent(`مرحبًا ${order.customerName}, نأسف لإبلاغك بأنه تم رفض طلبك "${order.orderName}". الرجاء التواصل معنا للمزيد من التفاصيل.`);
  const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;

  return { success: true, whatsappUrl };
}

export async function generateWhatsAppEditRequest(orderId: string, orderName: string) {
  const message = encodeURIComponent(
    `مرحبًا، أود طلب تعديل على الطلب رقم ${orderId} (الاسم: ${orderName}). الرجاء التواصل معي لمناقشة التغييرات المطلوبة.`
  );
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${message}`;
  redirect(whatsappUrl);
}

export async function scheduleOrder(orderId: string, days: number) {
    try {
        const order = await getOrderById(orderId);
        if (!order) {
            throw new Error("Order not found.");
        }

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + days);

        await updateOrderStatusDB(orderId, 'Processing');
        const updatedOrder = await updateOrderDB(orderId, { 
            scheduledDeliveryDate: deliveryDate.toISOString().split('T')[0],
        });

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');

        return { success: true, updatedOrder };
    } catch (error) {
        // console.error("Failed to schedule order:", error);
        return { success: false, error: (error as Error).message };
    }
}


// The formData parameter is kept for compatibility with form actions, even if not used.
export async function updateOrderStatus(orderId: string, status: Order['status'], formData?: FormData) {
    await updateOrderStatusDB(orderId, status);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/orders');
}


export async function deleteOrder(orderId: string) {
  await deleteOrderDB(orderId);
  revalidatePath('/admin/orders');
  revalidatePath('/orders');
}


export async function updateUser(userId: string, formData: any) {
    const dataToUpdate: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
    };

    if (formData.password) {
        // In a real app, you would hash the password here
        // For this mock, we'll just ignore it if it's not provided
    }

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
    revalidatePath('/orders');
  }
  
  export async function restoreOrder(orderId: string) {
    await updateOrderArchivedStatus(orderId, false);
    revalidatePath('/admin/orders');
    revalidatePath('/orders');
  }

const materialSchema = z.object({
  name: z.string().min(2),
  bladeWidth: z.coerce.number().min(0.1),
  pricePerSquareMeter: z.coerce.number().min(0.1),
  colors: z.string().min(1),
  stock: z.coerce.number().optional(), // Stock is managed internally
});

export async function createMaterial(formData: z.infer<typeof materialSchema>) {
    const validatedFields = materialSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }
    
    const materialData: Omit<AbjourTypeData, 'stock'> & {stock?: number} = {
        ...validatedFields.data,
        colors: validatedFields.data.colors.split(',').map(c => c.trim()).filter(Boolean)
    };
    
    const finalMaterialData: AbjourTypeData = {
        ...materialData,
        stock: materialData.stock || 0
    };

    try {
        await addMaterial(finalMaterialData);
        revalidatePath('/admin/materials');
        revalidatePath('/admin/inventory');
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
        colors: validatedFields.data.colors.split(',').map(c => c.trim()).filter(Boolean),
        stock: validatedFields.data.stock || 0,
    };
    
    try {
        await updateMaterialDB(materialData);
        revalidatePath('/admin/materials');
        revalidatePath(`/admin/materials/${encodeURIComponent(materialData.name)}/edit`);
        revalidatePath('/admin/inventory');
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
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateOrderPrice(orderId: string, newPrice: number | null) {
  try {
    const updatedOrder = await updateOrderDB(orderId, {
      overriddenPricePerSquareMeter: newPrice === null ? undefined : newPrice,
    });
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, updatedOrder };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

const purchaseSchema = z.object({
    materialName: z.string().min(1, 'اسم المادة مطلوب.'),
    quantity: z.coerce.number().min(0.1, 'الكمية مطلوبة.'),
    purchasePricePerMeter: z.coerce.number().min(0.1, 'سعر الشراء مطلوب.'),
});

export async function createPurchase(formData: z.infer<typeof purchaseSchema>) {
    const validatedFields = purchaseSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }

    const purchaseData = {
        ...validatedFields.data,
        date: new Date().toISOString().split('T')[0],
    };

    try {
        await addPurchaseDB(purchaseData);
        revalidatePath('/admin/inventory');
        redirect('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
