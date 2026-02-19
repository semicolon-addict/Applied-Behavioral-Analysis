///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Next.js server-side proxy to forward requests to Google Apps Script
// Outcome: Bypasses browser CORS/redirect issue with Apps Script POST requests
// Short Description: API proxy route that forwards auth actions to Google Apps Script web app
/////////////////////////////////////////////////////////////

import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0OIkwXG9UnZ6LL8R9ePZuakIQqxHM-UXfewe7QVD_6aP9fpK1d4k0apVb1IsXRfl64A/exec';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward the request to Apps Script server-side (no CORS issues)
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(body),
            redirect: 'follow',
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `Apps Script error: ${response.status}` },
                { status: 502 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'ABA Auth Proxy is running' });
}
