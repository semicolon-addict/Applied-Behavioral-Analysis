///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Google Apps Script web app URL integration for authentication
// Outcome: Client-side API wrapper for register, login, getUser, logout via Google Sheets backend
// Short Description: Sheets-based auth service with session management and role-based access
/////////////////////////////////////////////////////////////

'use client';

import { UserRole } from '@/types';

// ========== CONFIGURATION ==========
// Calls the Next.js API proxy (/api/auth) which forwards to Apps Script server-side.
// This avoids browser CORS/redirect issues with Google Apps Script POST requests.
const APPS_SCRIPT_URL = '/api/auth';

const SESSION_KEY = 'aba_session';

// ========== TYPES ==========
export interface SheetUser {
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    status: string;
    sessionToken?: string;
    createdAt?: string;
    lastLogin?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    error?: string;
    user?: SheetUser;
}

export interface ListUsersResponse {
    success: boolean;
    users?: SheetUser[];
    total?: number;
    error?: string;
}

// ========== SESSION MANAGEMENT ==========

/**
 * Store user session in localStorage
 */
function saveSession(user: SheetUser): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
}

/**
 * Get stored session from localStorage
 */
export function getSession(): SheetUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored) as SheetUser;
    } catch {
        return null;
    }
}

/**
 * Clear session from localStorage
 */
function clearSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getSession() !== null;
}

// ========== API CALLS ==========

/**
 * Call the Apps Script web app
 */
async function callAppsScript(payload: Record<string, unknown>): Promise<any> {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Apps Script requires text/plain for CORS
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
}

/**
 * Register a new user via Google Sheets
 */
export async function registerUser(
    email: string,
    password: string,
    role: string,
    firstName: string,
    lastName: string
): Promise<AuthResponse> {
    const result = await callAppsScript({
        action: 'register',
        email,
        password,
        role,
        firstName,
        lastName,
    });
    return result as AuthResponse;
}

/**
 * Login user via Google Sheets
 * On success, stores session in localStorage
 */
export async function loginUser(
    email: string,
    password: string
): Promise<AuthResponse> {
    const result = await callAppsScript({
        action: 'login',
        email,
        password,
    });

    if (result.success && result.user) {
        saveSession(result.user);
    }

    return result as AuthResponse;
}

/**
 * Get current user by session token
 */
export async function getCurrentUser(): Promise<AuthResponse> {
    const session = getSession();
    if (!session || !session.sessionToken) {
        return { success: false, error: 'No active session' };
    }

    const result = await callAppsScript({
        action: 'getUser',
        sessionToken: session.sessionToken,
    });

    return result as AuthResponse;
}

/**
 * List all users (Super Admin only)
 */
export async function listUsers(): Promise<ListUsersResponse> {
    const session = getSession();
    if (!session || !session.sessionToken) {
        return { success: false, error: 'No active session' };
    }

    const result = await callAppsScript({
        action: 'listUsers',
        sessionToken: session.sessionToken,
    });

    return result as ListUsersResponse;
}

/**
 * Logout user — clears local session
 */
export function logoutUser(): void {
    clearSession();
}

/**
 * Get the dashboard URL for a given role
 */
export function getDashboardUrl(role: UserRole | string): string {
    switch (role) {
        case 'Super Admin':
        case 'Admin':
            return '/admin/dashboard';
        case 'Clinician':
            return '/clinician/dashboard';
        case 'Parent':
            return '/parent/dashboard';
        default:
            return '/login';
    }
}

/**
 * Validate password strength on the client side
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character' };
    }
    return { valid: true, message: 'Password is strong' };
}
