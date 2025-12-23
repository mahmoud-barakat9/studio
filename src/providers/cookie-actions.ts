'use server';

import { cookies } from 'next/headers';
import { getUserById } from '@/lib/firebase-actions';

export async function getUserFromCookie() {
    const cookieStore = cookies();
    const userId = cookieStore.get('user_id')?.value;
    
    if (userId) {
        return await getUserById(userId);
    }
    return null;
}
