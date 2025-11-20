

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { addOrder, updateUser as updateUserDB, deleteUser as deleteUserDB, updateOrderArchivedStatus, addMaterial, updateMaterial as updateMaterialDB, deleteMaterial as deleteMaterialDB, getAllUsers, updateOrder as updateOrderDB, getOrderById, deleteOrder as deleteOrderDB, updateOrderStatus, addUserAndGetId, getUserById } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { AbjourTypeData, User } from './definitions';

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
  const allUsers = await getAllUsers();
  
  if (allUsers.find(u => u.email === email)) {
    return {
      message: 'هذا البريد الإلكتروني مسجل بالفعل.',
    };
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: 'user' as const,
    phone: ''
  };

  await addUserAndGetId(newUser);
  
  // Mock session cookie
  cookies().set('session-id', newUser.id);
  cookies().set('session-role', newUser.role);
  
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

  const { email, password } = validatedFields.data;
  
  // This is a mock authentication. In a real app, you'd verify against a database.
  const testUsers = [
      { email: 'admin@abjour.com', password: '123456', role: 'admin', id: 'admin-id' },
      { email: 'user@abjour.com', password: '123456', role: 'user', id: 'user-id' }
  ];

  const matchedUser = testUsers.find(u => u.email === email);
  
  if (!matchedUser || (matchedUser.password !== password)) {
    // If not a test user, let's check our dynamically created users
    const allUsers = await getAllUsers();
    const dynamicUser = allUsers.find(u => u.email === email);
    if(dynamicUser){
        // In a real app, you would check the password here. For this mock, we assume it's correct.
        cookies().set('session-id', dynamicUser.id);
        cookies().set('session-role', dynamicUser.role);
        if (dynamicUser.role === 'admin') {
            redirect('/admin/dashboard');
        } else {
            redirect('/dashboard');
        }
        return; // exit
    }

    return { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  }
  
  // Set mock session cookie
  cookies().set('session-id', matchedUser.id);
  cookies().set('session-role', matchedUser.role);

  if (matchedUser.role === 'admin') {
    redirect('/admin/dashboard');
  } else {
    redirect('/dashboard');
  }
}


export async function logout() {
  cookies().delete('session-id');
  cookies().delete('session-role');
  redirect('/login');
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
        id: `user-${Date.now()}`,
        name: formData.newUserName,
        email: formData.newUserEmail,
        phone: formData.newUserPhone,
        role: 'user' as const,
      };
      userId = await addUserAndGetId(newUserData);
      finalCustomerData = newUserData;

    } else {
      userId = formData.userId;
      const allUsers = await getAllUsers();
      const existingUser = allUsers.find(u => u.id === userId);
      if (existingUser) {
        finalCustomerData = { name: existingUser.name, phone: existingUser.phone };
      }
    }
  } else {
     userId = sessionUserId;
     finalCustomerData = { name: formData.customerName, phone: formData.customerPhone };
  }
  
  if(!userId){
    throw new Error("User not authenticated");
  }

  const orderData = {
    ...formData,
    userId,
    customerName: finalCustomerData.name,
    customerPhone: finalCustomerData.phone,
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
