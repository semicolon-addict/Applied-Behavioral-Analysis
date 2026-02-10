'use client';

import { doc, getDoc, Firestore } from 'firebase/firestore';
import { UserRole } from '@/types';

export async function getUserRole(firestore: Firestore, uid: string): Promise<UserRole | null> {
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        // If the user document has a role, return it immediately.
        if (userData.role) {
            return userData.role as UserRole;
        }
    }

    // If the user document doesn't exist or doesn't have a role, check the admin collection.
    const adminDocRef = doc(firestore, 'roles_admin', uid);
    const adminDoc = await getDoc(adminDocRef);
    if (adminDoc.exists()) {
        return 'Admin';
    }
    
    // If no role is found in either place, return null.
    return null;
}
