

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { proposeAccessories as proposeAccessoriesAI } from '@/ai/flows/propose-accessories';
import { addOrder, updateUser as updateUserDB, deleteUser as deleteUserDB, updateOrderArchivedStatus, addMaterial, updateMaterial as updateMaterialDB, deleteMaterial as deleteMaterialDB, getAllUsers, updateOrder as updateOrderDB, getOrderById, deleteOrder as deleteOrderDB, updateOrderStatus as updateOrderStatusDB, addUserAndGetId, getUserById, initializeTestUsers, addPurchase as addPurchaseDB, addSupplier as addSupplierDB, getPurchaseById, updatePurchase as updatePurchaseDB, deletePurchase as deletePurchaseDB, addUser, addNotification, markNotificationAsReadDB, markAllNotificationsAsReadDB } from './firebase-actions';
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

export async function proposeAccessories(
  prevState: any,
  formData: {
    mainAbjourType: string;
    openings: Order['openings'];
    hasDelivery: boolean;
  }
) {
    if (!formData.mainAbjourType || !formData.openings || formData.openings.length === 0) {
        return { data: null, error: 'Please select abjour type and add at least one opening.' };
    }
  try {
    const result = await proposeAccessoriesAI(formData);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: 'Failed to propose accessories.' };
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
  const originalOrder = await getOrderById(orderId);
  if (!originalOrder) throw new Error("Order not found");

  const orderData = {
    ...formData,
    isEditRequested: false, // Reset the flag after editing
    status: formData.status, 
    scheduledDeliveryDate: formData.scheduledDeliveryDate,
  };

  await updateOrderDB(orderId, orderData);

  // Create notification for user
    await addNotification({
        userId: originalOrder.userId,
        orderId: orderId,
        message: `تم تعديل طلبك "${originalOrder.orderName}" من قبل الإدارة.`,
        type: 'order_edited',
    });


  if (asAdmin) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    redirect(`/admin/orders/${orderId}`);
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

    // Create notification for user
    await addNotification({
        userId: order.userId,
        orderId: order.id,
        message: `تمت الموافقة على طلبك "${order.orderName}" وهو الآن قيد المراجعة النهائية.`,
        type: 'order_approved',
    });

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

    // Create notification for user
    await addNotification({
        userId: order.userId,
        orderId: order.id,
        message: `نأسف، تم رفض طلبك "${order.orderName}".`,
        type: 'order_rejected',
    });

  revalidatePath('/admin/orders');
  revalidatePath('/orders');
  
  const customerPhone = order.customerPhone?.replace(/\D/g, '');
  const message = encodeURIComponent(`مرحبًا ${order.customerName}, نأسف لإبلاغك بأنه تم رفض طلبك "${order.orderName}". الرجاء التواصل معنا للمزيد من التفاصيل.`);
  const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;

  return { success: true, whatsappUrl };
}

const editRequestSchema = z.object({
  notes: z.string().min(10, 'الرجاء كتابة ملاحظات التعديل (10 أحرف على الأقل).'),
});

export async function requestOrderEdit(orderId: string, formData: z.infer<typeof editRequestSchema>) {
    const validatedFields = editRequestSchema.safeParse(formData);

    if (!validatedFields.success) {
      const errorMessages = validatedFields.error.issues.map(issue => issue.message).join(', ');
      return { success: false, error: errorMessages };
    }

  try {
    await updateOrderDB(orderId, { 
      isEditRequested: true,
      editRequestNotes: validatedFields.data.notes,
    });
    revalidatePath('/orders');
    revalidatePath('/admin/notifications');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'فشل إرسال طلب التعديل.' };
  }
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

        await addNotification({
            userId: order.userId,
            orderId: order.id,
            message: `طلبك "${order.orderName}" دخل مرحلة التجهيز! التاريخ المتوقع للتسليم هو ${deliveryDate.toISOString().split('T')[0]}.`,
            type: 'order_status_update',
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
    const order = await getOrderById(orderId);
    if (!order) return;
    
    await updateOrderStatusDB(orderId, status);

    const statusTranslations: Record<Order['status'], string> = {
        "Pending": "بانتظار الموافقة",
        "Approved": "تمت الموافقة",
        "FactoryOrdered": "تم الطلب من المعمل",
        "Processing": "قيد التجهيز",
        "FactoryShipped": "تم الشحن من المعمل",
        "ReadyForDelivery": "جاهز للتسليم",
        "Delivered": "تم التوصيل",
        "Rejected": "مرفوض",
    };

    if (status !== 'Pending' && status !== 'Approved') { // Avoid redundant notifications
        await addNotification({
            userId: order.userId,
            orderId: order.id,
            message: `تم تحديث حالة طلبك "${order.orderName}" إلى: ${statusTranslations[status]}.`,
            type: 'order_status_update',
        });
    }

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/orders');
}


export async function deleteOrder(orderId: string) {
  await deleteOrderDB(orderId);
  revalidatePath('/admin/orders');
  revalidatePath('/orders');
}

const userSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب.'),
  email: z.string().email('بريد إلكتروني غير صالح.'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user'], { required_error: 'الدور مطلوب.' }),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'),
});

export async function createUser(formData: z.infer<typeof userSchema>) {
    const validatedFields = userSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }

    try {
        await addUser(validatedFields.data);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
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
  name: z.string().min(2, 'الاسم مطلوب ويجب أن يكون حرفين على الأقل.'),
  bladeWidth: z.coerce.number().min(0.1, 'عرض الشفرة مطلوب.'),
  pricePerSquareMeter: z.coerce.number().min(0.1, 'السعر مطلوب.'),
  colors: z.array(z.string()).min(1, 'يجب إضافة لون واحد على الأقل.'),
  stock: z.coerce.number().optional(),
});

export async function createMaterial(formData: z.infer<typeof materialSchema>) {
    const validatedFields = materialSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }
    
    const materialData: AbjourTypeData = {
        ...validatedFields.data,
        stock: validatedFields.data.stock || 0,
    };

    try {
        await addMaterial(materialData);
        revalidatePath('/admin/materials');
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateMaterial(originalMaterialName: string, formData: z.infer<typeof materialSchema>) {
     const validatedFields = materialSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }
    
    try {
        await updateMaterialDB(originalMaterialName, validatedFields.data);
        revalidatePath('/admin/materials');
        revalidatePath(`/admin/materials/${encodeURIComponent(originalMaterialName)}/edit`);
        revalidatePath('/admin/inventory');
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
    const originalOrder = await getOrderById(orderId);
    if (!originalOrder) throw new Error("Order not found");

    const updatedOrder = await updateOrderDB(orderId, {
      overriddenPricePerSquareMeter: newPrice === null ? undefined : newPrice,
    });

    const priceUpdateMessage = newPrice !== null 
        ? `تم تحديث سعر المتر في طلبك "${originalOrder.orderName}" إلى $${newPrice.toFixed(2)}.`
        : `تم استعادة السعر الافتراضي للمتر في طلبك "${originalOrder.orderName}".`;

    await addNotification({
        userId: originalOrder.userId,
        orderId: orderId,
        message: priceUpdateMessage,
        type: 'order_price_updated',
    });
    
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, updatedOrder };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

const purchaseSchema = z.object({
    materialName: z.string().min(1, 'اسم المادة مطلوب.'),
    color: z.string().min(1, 'اللون مطلوب.'),
    supplierName: z.string().min(1, 'اسم المورد مطلوب.'),
    quantity: z.coerce.number().min(0.1, 'الكمية مطلوبة.'),
    purchasePricePerMeter: z.coerce.number().min(0.1, 'سعر الشراء مطلوب.'),
});

export async function createPurchase(formData: z.infer<typeof purchaseSchema>) {
    const validatedFields = purchaseSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }

    try {
        await addPurchaseDB(validatedFields.data);
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}


const supplierSchema = z.object({
    name: z.string().min(2, 'اسم المورد مطلوب.'),
});

export async function createSupplier(formData: z.infer<typeof supplierSchema>) {
    const validatedFields = supplierSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }
    
    try {
        await addSupplierDB(validatedFields.data);
        revalidatePath('/admin/suppliers');
        revalidatePath('/admin/inventory/new');
        redirect('/admin/suppliers');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updatePurchase(purchaseId: string, formData: z.infer<typeof purchaseSchema>) {
    const validatedFields = purchaseSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "البيانات المدخلة غير صالحة." };
    }

    try {
        await updatePurchaseDB(purchaseId, validatedFields.data);
        revalidatePath('/admin/inventory');
        redirect('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}


export async function deletePurchase(purchaseId: string) {
    try {
        await deletePurchaseDB(purchaseId);
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().min(10).max(500),
});

export async function submitOrderReview(orderId: string, formData: z.infer<typeof reviewSchema>) {
  const validatedFields = reviewSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { success: false, error: 'البيانات المدخلة غير صالحة.' };
  }

  try {
    await updateOrderDB(orderId, {
      rating: validatedFields.data.rating,
      review: validatedFields.data.review,
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/reviews');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'فشل إرسال التقييم.' };
  }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        await markNotificationAsReadDB(notificationId);
        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to mark notification as read.' };
    }
}

export async function markAllNotificationsAsRead(userId: string) {
    try {
        await markAllNotificationsAsReadDB(userId);
        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to mark all notifications as read.' };
    }
}
