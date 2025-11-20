

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { addOrder, addUserAndGetId, updateOrderStatus, getOrderById, updateOrder as updateOrderDB, deleteOrder as deleteOrderDB, updateUser as updateUserDB, deleteUser as deleteUserDB, updateOrderArchivedStatus, addMaterial, updateMaterial as updateMaterialDB, deleteMaterial as deleteMaterialDB, getAllUsers, getUserById, ensureUserExistsInFirestore } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { AbjourTypeData, User } from './definitions';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/firebase/config';

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
    }
    
    await addUserAndGetId({
      id: userCredential.user.uid,
      name: name,
      email: email,
      role: 'user',
      phone: '', // Phone can be added later
    });

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
        return { message: 'هذا البريد الإلكتروني مسجل بالفعل.' };
    }
    console.error("Registration Error:", error);
    return {
      message: "حدث خطأ أثناء إنشاء الحساب. " + error.message,
    };
  }

  redirect('/dashboard');
}

async function ensureTestUsers() {
    const testUsers = [
        {
            email: 'admin@abjour.com',
            password: '123456',
            name: 'Adminstrator',
            phone: '555-4444',
            role: 'admin' as const,
        },
        {
            email: 'user@abjour.com',
            password: '123456',
            name: 'User',
            phone: '555-5555',
            role: 'user' as const,
        }
    ];

    for (const testUser of testUsers) {
        try {
            // Check if user exists in Auth, if not, create it
            const userCredential = await createUserWithEmailAndPassword(auth, testUser.email, testUser.password);
            await updateProfile(userCredential.user, { displayName: testUser.name });
            await ensureUserExistsInFirestore({
                id: userCredential.user.uid,
                ...testUser
            });
             console.log(`Test user ${testUser.email} created successfully.`);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                // User already exists in Auth, ensure they exist in Firestore
                const userSnap = await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
                await ensureUserExistsInFirestore({
                    id: userSnap.user.uid,
                    ...testUser
                });
            } else {
                console.error(`Failed to ensure test user ${testUser.email}:`, error);
            }
        }
    }
     // Sign out after ensuring users to not affect the current login flow
    await signOut(auth);
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
  
  try {
     // Ensure test users exist before attempting login
    if (email === 'admin@abjour.com' || email === 'user@abjour.com') {
      await ensureTestUsers();
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await getUserById(userCredential.user.uid);

    if (!user) {
        // This can happen if auth succeeds but firestore doc is missing
        const firestoreUser = await ensureUserExistsInFirestore({
            id: userCredential.user.uid,
            name: userCredential.user.displayName || email,
            email: email,
            role: 'user',
            phone: userCredential.user.phoneNumber || ''
        });

        if (firestoreUser.role === 'admin') {
            redirect('/admin/dashboard');
        } else {
            redirect('/dashboard');
        }
        return;
    }

    if (user.role === 'admin') {
      redirect('/admin/dashboard');
    } else {
      redirect('/dashboard');
    }
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }
    console.error("Login Error:", error);
    return { message: 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.' };
  }
}

export async function logout() {
  await signOut(auth);
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
  
  const user = auth.currentUser;

  if (asAdmin) {
    if (formData.userId === 'new') {
      if (!formData.newUserName || !formData.newUserEmail) {
        throw new Error("New user name and email are required.");
      }
       const newUserCredential = await createUserWithEmailAndPassword(auth, formData.newUserEmail, '123456');
      const newUserData = {
        id: newUserCredential.user.uid,
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
     userId = user?.uid;
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

    