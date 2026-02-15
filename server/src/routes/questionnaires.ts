///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: REST API routes for questionnaire templates, sessions, and responses
// Outcome: Full CRUD operations for questionnaire management via Express router
// Short Description: API endpoints for fetching templates, managing sessions, and saving responses
/////////////////////////////////////////////////////////////

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/questionnaires/templates
// List all questionnaire templates (with domain/question counts)
router.get('/templates', async (_req: Request, res: Response) => {
    try {
        const templates = await prisma.questionnaireTemplate.findMany({
            include: {
                domains: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        _count: { select: { questions: true } },
                    },
                },
            },
        });

        const result = templates.map((t) => ({
            id: t.id,
            assessmentType: t.assessmentType,
            title: t.title,
            description: t.description,
            totalQuestions: t.domains.reduce((acc, d) => acc + d._count.questions, 0),
            domains: t.domains.map((d) => ({
                id: d.id,
                name: d.name,
                questionCount: d._count.questions,
            })),
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// GET /api/questionnaires/templates/:assessmentType
// Get a full template with all domains and questions
router.get('/templates/:assessmentType', async (req: Request, res: Response) => {
    try {
        const assessmentType = req.params.assessmentType as string;

        const template = await prisma.questionnaireTemplate.findUnique({
            where: { assessmentType },
            include: {
                domains: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        questions: {
                            orderBy: { sortOrder: 'asc' },
                        },
                    },
                },
            },
        });

        if (!template) {
            res.status(404).json({ error: `Template not found for type: ${assessmentType}` });
            return;
        }

        res.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// POST /api/questionnaires/sessions
// Start a new questionnaire session for a child
router.post('/sessions', async (req: Request, res: Response) => {
    try {
        const { assessmentType, childId, respondentId } = req.body;

        if (!assessmentType || !childId || !respondentId) {
            res.status(400).json({ error: 'assessmentType, childId, and respondentId are required' });
            return;
        }

        // Check if there's already an in-progress session
        const existing = await prisma.questionnaireSession.findFirst({
            where: {
                assessmentType,
                childId,
                status: 'in-progress',
            },
            include: {
                responses: true,
            },
        });

        if (existing) {
            res.json(existing);
            return;
        }

        const session = await prisma.questionnaireSession.create({
            data: {
                assessmentType,
                childId,
                respondentId,
            },
            include: {
                responses: true,
            },
        });

        res.status(201).json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// GET /api/questionnaires/sessions/:sessionId
// Get a session with all saved responses
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId as string;

        const session = await prisma.questionnaireSession.findUnique({
            where: { id: sessionId },
            include: {
                responses: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        res.json(session);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// GET /api/questionnaires/sessions?childId=X&assessmentType=Y
// List sessions for a child, optionally filtered by assessment type
router.get('/sessions', async (req: Request, res: Response) => {
    try {
        const childId = req.query.childId as string | undefined;
        const assessmentType = req.query.assessmentType as string | undefined;

        const where: any = {};
        if (childId) where.childId = childId;
        if (assessmentType) where.assessmentType = assessmentType;

        const sessions = await prisma.questionnaireSession.findMany({
            where,
            include: {
                _count: { select: { responses: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// PUT /api/questionnaires/sessions/:sessionId/responses
// Save or update a response (called on each "Confirm")
router.put('/sessions/:sessionId/responses', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId as string;
        const { questionId, answer } = req.body;

        if (!questionId || answer === undefined) {
            res.status(400).json({ error: 'questionId and answer are required' });
            return;
        }

        const response = await prisma.response.upsert({
            where: {
                sessionId_questionId: {
                    sessionId,
                    questionId,
                },
            },
            update: { answer: String(answer) },
            create: {
                sessionId,
                questionId,
                answer: String(answer),
            },
        });

        res.json(response);
    } catch (error) {
        console.error('Error saving response:', error);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

// PATCH /api/questionnaires/sessions/:sessionId/complete
// Mark a session as completed
router.patch('/sessions/:sessionId/complete', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId as string;

        const session = await prisma.questionnaireSession.update({
            where: { id: sessionId },
            data: {
                status: 'completed',
                completedAt: new Date(),
            },
        });

        res.json(session);
    } catch (error) {
        console.error('Error completing session:', error);
        res.status(500).json({ error: 'Failed to complete session' });
    }
});

export { router as questionnaireRoutes };
