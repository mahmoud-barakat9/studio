'use server';

import { setCookie, deleteCookie } from 'cookies-next/headers';
import { redirect } from 'next/navigation';
import { getUsers } from './firebase-actions';

// This is a simplified, non-secure way to handle login for this prototype.
// In a real application, you would use Firebase Auth SDK for sign-in and password verification.

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    // const password = formData.get('password') as string; // Password ignored for this prototype

    if (!email) {
        return { success: false, error: 'البريد الإلكتروني مطلوب.' };
    }

    const users = await getUsers(true); // Get all users including admins
    const user = users.find(u => u.email === email);

    if (!user) {
        return { success: false, error: 'المستخدم غير موجود. الرجاء التحقق من البريد الإلكتروني.' };
    }

    // Set cookies to simulate a logged-in session
    setCookie('user_id', user.id, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    setCookie('user_role', user.role, { maxAge: 60 * 60 * 24 * 7 });

    if (user.role === 'admin') {
        redirect('/admin/dashboard');
    } else {
        redirect('/dashboard');
    }

    // This part is effectively unreachable due to redirect, but good for type safety
    return { success: true };
}


export async function logout() {
    deleteCookie('user_id');
    deleteCookie('user_role');
    redirect('/login');
}
