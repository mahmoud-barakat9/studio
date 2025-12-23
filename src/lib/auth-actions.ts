
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUsers, addUser } from './firebase-actions';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

// This is a simplified, non-secure way to handle login for this prototype.
// In a real application, you would use Firebase Auth SDK for sign-in and password verification.

export async function login(prevState: string | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    // const password = formData.get('password') as string; // Password ignored for this prototype

    if (!email) {
        return 'البريد الإلكتروني مطلوب.';
    }

    const users = await getUsers(true); // Get all users including admins
    const user = users.find(u => u.email === email);

    if (!user) {
        return 'المستخدم غير موجود. الرجاء التحقق من البريد الإلكتروني.';
    }

    // Set cookies to simulate a logged-in session
    cookies().set('user_id', user.id, { maxAge: 60 * 60 * 24 * 7, httpOnly: true, path: '/' }); // 7 days
    cookies().set('user_role', user.role, { maxAge: 60 * 60 * 24 * 7, httpOnly: true, path: '/' });
    
    // We don't redirect from here, the page component will do it.
    // This allows the useFormState hook to work correctly.
    // However, to ensure the root layout updates, we need to revalidate.
    revalidatePath('/', 'layout');
    
    if (user.role === 'admin') {
        redirect('/admin/dashboard');
    } else {
        redirect('/dashboard');
    }
}

const signupSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب.'),
  email: z.string().email('بريد إلكتروني غير صالح.'),
  phone: z.string().optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'),
});


export async function signup(prevState: string | undefined, formData: FormData) {
    const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors.name?.[0] ||
               validatedFields.error.flatten().fieldErrors.email?.[0] ||
               validatedFields.error.flatten().fieldErrors.password?.[0] ||
               "البيانات المدخلة غير صالحة.";
    }

    const { name, email, phone, password } = validatedFields.data;

    try {
        await addUser({
            name,
            email,
            phone,
            password, // In a real app, this should be hashed
            role: 'user',
        });
    } catch (error: any) {
        return error.message;
    }

    revalidatePath('/admin/users');
    redirect('/login?registered=true');
}


export async function logout() {
    cookies().delete('user_id');
    cookies().delete('user_role');

    // Revalidate the entire application layout to clear user state
    revalidatePath('/', 'layout');

    redirect('/login');
}
