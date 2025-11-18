'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { addOrder, addUserAndGetId, updateOrderStatus, getOrderById, updateOrder as updateOrderDB, deleteOrder as deleteOrderDB, updateUser as updateUserDB, deleteUser as deleteUserDB, updateOrderArchivedStatus } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(3, "يجب أن يكون الاسم 3 أحرف على الأقل"),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل"),
});

export async function register(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  // In a real app, you would also check if the user already exists.
  // For this mock, we'll just create a new user.
  const newUserId = await addUserAndGetId({
    name: validatedFields.data.name,
    email: validatedFields.data.email,
    role: 'user',
  });
  
  cookies().set('session', 'user-session', { httpOnly: true });
  cookies().set('userId', newUserId, { httpOnly: true });
  redirect('/dashboard');
}

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  if (email === 'admin@abjour.com') {
    cookies().set('session', 'admin-session', { httpOnly: true });
    redirect('/admin/dashboard');
  } else if (email === 'user@abjour.com') {
    cookies().set('session', 'user-session', { httpOnly: true });
    redirect('/dashboard?tab=overview');
  } else {
    // This part is a mock. In a real app you'd query your users DB.
    // For now we'll treat any other valid email as a new user session.
    cookies().set('session', 'user-session', { httpOnly: true });
    redirect('/dashboard');
  }
}

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
  let userId = '2'; // Mock user Fatima Zahra
  if (asAdmin) {
    if (formData.userId === 'new') {
      if (!formData.newUserName || !formData.newUserEmail) {
        // This case should be prevented by frontend validation, but as a safeguard:
        throw new Error("New user name and email are required.");
      }
      userId = await addUserAndGetId({
        name: formData.newUserName,
        email: formData.newUserEmail,
        phone: formData.newUserPhone,
        role: 'user',
      });
    } else {
      userId = formData.userId;
    }
  }

  const orderData = {
    ...formData,
    userId,
    status: asAdmin ? 'FactoryOrdered' : 'Pending',
    date: new Date().toISOString().split('T')[0],
  };

  await addOrder(orderData);

  if (asAdmin) {
    revalidatePath('/admin/orders');
    redirect('/admin/orders');
  } else {
    revalidatePath('/dashboard');
    revalidatePath('/admin/orders');
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

  await updateOrderStatus(orderId, 'FactoryOrdered');
  revalidatePath('/admin/orders');

  const message = encodeURIComponent(`مرحبًا ${order.customerName}, تم قبول طلبك "${order.orderName}" وتم إرساله إلى المعمل.`);
  const whatsappUrl = `https://wa.me/${order.customerPhone}?text=${message}`;
  redirect(whatsappUrl);
}

export async function rejectOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  await updateOrderStatus(orderId, 'Rejected');
  revalidatePath('/admin/orders');
  
  const message = encodeURIComponent(`مرحبًا ${order.customerName}, نأسف لإبلاغك بأنه تم رفض طلبك "${order.orderName}". الرجاء التواصل معنا للمزيد من التفاصيل.`);
  const whatsappUrl = `https://wa.me/${order.customerPhone}?text=${message}`;
  redirect(whatsappUrl);
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

    if (formData.password) {
        // In a real app, you would hash this password
        dataToUpdate.password = formData.password;
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
  }
  
  export async function restoreOrder(orderId: string) {
    await updateOrderArchivedStatus(orderId, false);
    revalidatePath('/admin/orders');
  }