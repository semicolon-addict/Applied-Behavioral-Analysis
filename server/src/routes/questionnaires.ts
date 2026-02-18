///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: REST API routes for questionnaire templates, sessions, and responses
// Outcome: Full CRUD operations for questionnaire management via Express router, including Excel export
// Short Description: API endpoints for fetching templates, managing sessions, saving responses, and generating VB-mapped Excel reports
/////////////////////////////////////////////////////////////

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { calculateVBScoring } from '../services/scoring-service';
import { generateABLLSExcel } from '../services/excel-export-service';

const router = Router();
const prisma = new PrismaClient();

const exampleImageBySkillCode = new Map<string, string>();

function initializeExampleImageMap() {
    try {
        const candidateDirs = [
            path.resolve(__dirname, '..', '..', '..', 'public', 'examples'),
            path.resolve(process.cwd(), '..', 'public', 'examples'),
            path.resolve(process.cwd(), 'public', 'examples'),
        ];
        const examplesDir = candidateDirs.find((dir) => fs.existsSync(dir));
        if (!examplesDir) return;

        if (!fs.existsSync(examplesDir)) return;

        const files = fs.readdirSync(examplesDir).filter((file) => file.toLowerCase().endsWith('.png'));
        files.forEach((file) => {
            const baseName = path.parse(file).name;
            const isCriteria = baseName.toLowerCase().endsWith('-criteria');
            const skillCode = isCriteria ? baseName.slice(0, -'-criteria'.length) : baseName;
            if (!skillCode) return;

            const imagePath = `/examples/${file}`;
            if (!exampleImageBySkillCode.has(skillCode) || !isCriteria) {
                exampleImageBySkillCode.set(skillCode, imagePath);
            }
        });
    } catch (error) {
        console.warn('Failed to initialize example image map:', error);
    }
}

initializeExampleImageMap();

function resolveExampleImage(skillCode?: string | null, existingImage?: string | null): string | null {
    if (existingImage) return existingImage;
    if (!skillCode) return null;
    const normalizedSkillCode = skillCode.trim();
    if (!normalizedSkillCode) return null;
    return exampleImageBySkillCode.get(normalizedSkillCode) || null;
}

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

        const templateWithExampleImages = {
            ...template,
            domains: template.domains.map((domain) => ({
                ...domain,
                questions: domain.questions.map((question) => ({
                    ...question,
                    exampleImage: resolveExampleImage(question.skillCode, question.exampleImage),
                })),
            })),
        };

        res.json(templateWithExampleImages);
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

// GET /api/questionnaires/sessions/:sessionId/vb-export
// Return normalized VB export rows for validation/debugging
router.get('/sessions/:sessionId/vb-export', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId as string;
        const gradingResult = await calculateVBScoring(sessionId);
        res.json(gradingResult.vbExport);
    } catch (error) {
        console.error('Error generating VB export JSON:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate VB export JSON' });
    }
});

// GET /api/questionnaires/sessions/:sessionId/export
// Generate and download VB-mapped Excel report for a completed session
router.get('/sessions/:sessionId/export', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId as string;
        const gradingResult = await calculateVBScoring(sessionId);
        const workbook = await generateABLLSExcel(gradingResult);
        const excelBuffer = await workbook.xlsx.writeBuffer();
        const output = Buffer.isBuffer(excelBuffer) ? excelBuffer : Buffer.from(excelBuffer as ArrayBuffer);

        const safeAssessmentType = gradingResult.assessmentType.replace(/[^a-zA-Z0-9_-]/g, '_');
        const datePart = gradingResult.completedAt.toISOString().slice(0, 10);
        const fileName = `${safeAssessmentType}_${gradingResult.childId}_${datePart}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(output);
    } catch (error) {
        console.error('Error generating Excel export:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate Excel export' });
    }
});

export { router as questionnaireRoutes };
