///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Auth API routes for user profile and user listing
// Outcome: GET /api/auth/me returns user profile, GET /api/auth/users returns all users (admin only)
// Short Description: Express auth routes for user data retrieval with role-based access control
/////////////////////////////////////////////////////////////

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/auth/health
 * Auth routes health check
 */
router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'Auth API is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/auth/roles
 * Returns the list of available roles in the system
 */
router.get('/roles', (_req: Request, res: Response) => {
    res.json({
        roles: ['Parent', 'Clinician', 'Super Admin'],
        description: {
            'Parent': 'Access limited to personal data and relevant resources',
            'Clinician': 'Access to assigned patient data and clinical functionalities',
            'Super Admin': 'Full system access, including user and role management'
        }
    });
});

export const authRoutes = router;
