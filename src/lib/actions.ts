'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import {
  calculateAbjourDimensions as calculateAbjourDimensionsAI,
} from '@/ai/flows/calculate-abjour-dimensions';
import { generateOrderName as generateOrderNameAI } from '@/ai/flows/generate-order-name';
import { addOrder, addUserAndGetId } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

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
    redirect('/dashboard');
  } else {
    return {
      message: 'Invalid email or password.',
    };
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
        role: 'user',
      });
    } else {
      userId = formData.userId;
    }
  }

  const orderData = {
    ...formData,
    userId,
    status: 'Order Placed',
    date: new Date().toISOString().split('T')[0],
  };

  await addOrder(orderData);

  if (asAdmin) {
    revalidatePath('/admin/orders');
    redirect('/admin/orders');
  } else {
    // We don't redirect here anymore, so the toast can be seen
    revalidatePath('/dashboard');
  }
  
  return { success: true };
}
