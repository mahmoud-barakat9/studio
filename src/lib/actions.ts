

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { addOrder, updateUser as updateUserDB, deleteUser as deleteUserDB, updateOrderArchivedStatus, addMaterial, updateMaterial as updateMaterialDB, deleteMaterial as deleteMaterialDB, getAllUsers, updateOrder as updateOrderDB, getOrderById, deleteOrder as deleteOrderDB, updateOrderStatus, addUserAndGetId, getUserById, ensureUserExistsInFirestore } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { AbjourTypeData, User, Order } from './definitions';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';


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
  
  const {name, email, password} = validatedFields.data;
  
  try {
    // This part runs on the server, but Firebase Auth SDK is client-side.
    // This will not work as expected on the server.
    // We will simulate it and the real creation will happen on the client.
    // The proper way is to use Firebase Admin SDK for server-side auth actions.
    
    // Simulate check if user exists
    const allUsers = await getAllUsers();
    if (allUsers.find(u => u.email === email)) {
      return {
        message: 'هذا البريد الإلكتروني مسجل بالفعل.',
      };
    }

    // In a real app, you would create user with Admin SDK.
    // For this mock-up, we redirect and let client-side handle it.
    // The action here is mostly for validation.
    
    // The `addUserAndGetId` should be called after client-side creation.
    // We can't do it here directly.

  } catch (error: any) {
    return {
      message: error.message || 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
    };
  }
  
  // Redirect to login, maybe with a success message.
  redirect('/login?registered=true');
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

  const { email, password } = validatedFields.data;
  
  // This is a mock authentication. We can't use Firebase client SDK on the server.
  // We'll just check against our known test users and users in DB.

  try {
     const user = await ensureUserExistsInFirestore({ email, password });

    if (!user) {
        return { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    // Set mock session cookie
    cookies().set('session-id', user.id);
    cookies().set('session-role', user.role);

    if (user.role === 'admin') {
        redirect('/admin/dashboard');
    } else {
        redirect('/dashboard');
    }
  } catch (error: any) {
      console.error("Login error:", error);
      return { message: error.message || 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.' };
  }
}


export async function logout() {
  cookies().delete('session-id');
  cookies().delete('session-role');
  redirect('/welcome');
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
  let userId;
  let finalCustomerData: Partial<User> = {};
  
  const sessionUserId = cookies().get('session-id')?.value;

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
     finalCustomerData = { name: currentUser?.name, phone: currentUser?.phone };
  }
  
  if(!userId){
    throw new Error("User not authenticated");
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


  const orderData = {
    ...formData,
    userId,
    customerName: finalCustomerData.name,
    customerPhone: finalCustomerData.phone,
    status: asAdmin ? 'FactoryOrdered' : 'Pending',
    date: new Date().toISOString().split('T')[0],
    deliveryCost,
  };

  await addOrder(orderData);

  if (asAdmin) {
    revalidatePath('/admin/orders');
    redirect('/admin/orders');
  } else {
    revalidatePath('/dashboard');
    revalidatePath('/admin/orders');
    redirect('/dashboard');
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

    // In a real app, you would use Firebase Admin SDK to update the password
    
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
