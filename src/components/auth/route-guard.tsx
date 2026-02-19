///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Client-side route guard for authenticated and role-based access
// Outcome: Unauthenticated users are redirected to login, unauthorized roles to their own dashboard
// Short Description: RouteGuard component enforcing auth and RBAC on protected pages
/////////////////////////////////////////////////////////////

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { getUserRole } from '@/lib/auth';
import { getDashboardUrl } from '@/lib/sheets-auth';
import { UserRole } from '@/types';

interface RouteGuardProps {
    children: React.ReactNode;
}

/**
 * RouteGuard checks:
 * 1. User is authenticated (Firebase Auth)
 * 2. User's role matches the current route section (admin/clinician/parent)
 * 
 * Redirects:
 * - Not authenticated → /login
 * - Wrong role → correct dashboard for their role
 */
export function RouteGuard({ children }: RouteGuardProps) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            // Wait for Firebase auth to initialize
            if (isUserLoading) return;

            // If not authenticated, redirect to login
            if (!user) {
                setIsChecking(false);
                router.push('/login');
                return;
            }

            try {
                // Get user's role from Firestore
                const role = await getUserRole(firestore, user.uid);

                if (!role) {
                    // No role found — redirect to login
                    router.push('/login');
                    setIsChecking(false);
                    return;
                }

                // Determine what role is required for the current route
                const requiredRole = getRequiredRole(pathname);

                if (requiredRole && !isRoleAllowed(role, requiredRole)) {
                    // User doesn't have permission for this route — redirect to their dashboard
                    const correctDashboard = getDashboardUrl(role);
                    router.push(correctDashboard);
                    setIsChecking(false);
                    return;
                }

                // User is authenticated and authorized
                setIsAuthorized(true);
                setIsChecking(false);
            } catch (error) {
                console.error('RouteGuard: Auth check failed', error);
                router.push('/login');
                setIsChecking(false);
            }
        }

        checkAuth();
    }, [user, isUserLoading, firestore, router, pathname]);

    // Show loading state while checking auth
    if (isChecking || isUserLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Only render children if authorized
    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Determine the required role based on the URL path
 */
function getRequiredRole(pathname: string): string | null {
    if (pathname.startsWith('/admin')) return 'Admin';
    if (pathname.startsWith('/clinician')) return 'Clinician';
    if (pathname.startsWith('/parent')) return 'Parent';
    return null;
}

/**
 * Check if the user's role is allowed for the required route role
 * Super Admin and Admin can both access /admin routes
 */
function isRoleAllowed(userRole: UserRole, requiredRole: string): boolean {
    // Super Admin has access to Admin routes
    if (userRole === 'Super Admin' && requiredRole === 'Admin') return true;
    // Admin has access to Admin routes
    if (userRole === 'Admin' && requiredRole === 'Admin') return true;
    // Direct role match
    if (userRole === requiredRole) return true;
    return false;
}
