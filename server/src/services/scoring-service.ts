///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Session ID with completed responses
// Outcome: VB-MAPP aligned scoring with domain breakdowns and proficiency levels
// Short Description: Calculates domain scores, percentages, and proficiency levels from ABLLS assessment responses
/////////////////////////////////////////////////////////////

import { PrismaClient } from '@prisma/client';
import { VBExportRow, VBMappingResult, mapQuestionToVB, renderVBBar, toVBExportRows } from './vb-mapping-service';

const prisma = new PrismaClient();

// Domain score structure
export interface DomainScore {
    domain: string;
    domainName: string;
    rawScore: number;
    maxPossible: number;
    percentage: number;
    proficiency: 'Emerging' | 'Developing' | 'Proficient' | 'Mastered';
    questionCount: number;
    questions: QuestionResponse[];
}

export interface QuestionResponse {
    questionId: string;
    skillCode: string;
    taskName: string;
    questionText: string;
    selectedAnswer: string;
    numericScore: number;
    maxScore: number;
    normalizedScore: number;
    vbFilledCells: number[];
    vbBar: string;
}

export interface VBGradingResult {
    sessionId: string;
    childId: string;
    childName?: string;
    assessmentType: string;
    completedAt: Date;
    domainScores: DomainScore[];
    overallScore: number;
    overallMaxPossible: number;
    overallPercentage: number;
    overallProficiency: string;
    vbExport: VBExportRow[];
}

/**
 * Extract numeric score from answer string
 * Examples: "2 - Independent" -> 2, "0 - Not observed" -> 0
 */
function extractNumericScore(answerString: string): number {
    const match = answerString.match(/^(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    const parsed = Number.parseFloat(match[1]);
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Determine proficiency level based on percentage
 */
function getProficiencyLevel(percentage: number): 'Emerging' | 'Developing' | 'Proficient' | 'Mastered' {
    if (percentage >= 86) return 'Mastered';
    if (percentage >= 61) return 'Proficient';
    if (percentage >= 26) return 'Developing';
    return 'Emerging';
}

/**
 * Get maximum possible score for a question based on scoreType or options length
 */
function getMaxScore(scoreType: string | null | undefined, options?: string[]): number {
    // Parse scoreType patterns such as 0-2, 0-4, 1-5, etc.
    if (scoreType && scoreType.trim().length > 0) {
        const normalized = scoreType.trim();
        const rangeMatch = normalized.match(/(\d+)\s*-\s*(\d+)/);
        if (rangeMatch) {
            const min = Number.parseFloat(rangeMatch[1]);
            const max = Number.parseFloat(rangeMatch[2]);
            if (Number.isFinite(min) && Number.isFinite(max) && max >= min) {
                return max;
            }
        }

        const maxOnlyMatch = normalized.match(/max\s*:?\s*(\d+(?:\.\d+)?)/i);
        if (maxOnlyMatch) {
            const parsed = Number.parseFloat(maxOnlyMatch[1]);
            if (Number.isFinite(parsed) && parsed > 0) {
                return parsed;
            }
        }
    }

    // Infer from explicit option labels first (e.g., "1 - ..." to "5 - ..." => max 5).
    if (options && options.length > 0) {
        let maxFromOptions = 0;
        for (const option of options) {
            const match = option.trim().match(/^(\d+(?:\.\d+)?)/);
            if (!match) continue;
            const parsed = Number.parseFloat(match[1]);
            if (Number.isFinite(parsed)) {
                maxFromOptions = Math.max(maxFromOptions, parsed);
            }
        }
        if (maxFromOptions > 0) {
            return maxFromOptions;
        }

        // Last resort when options are unlabeled.
        return Math.max(1, options.length - 1);
    }

    // Default to 4 if neither is provided.
    return 4;
}

/**
 * Calculate VB-MAPP scoring for a completed assessment session
 */
export async function calculateVBScoring(sessionId: string): Promise<VBGradingResult> {
    // Fetch session with all responses
    const session = await prisma.questionnaireSession.findUnique({
        where: { id: sessionId },
        include: {
            responses: true,
        },
    });

    if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'completed') {
        throw new Error(`Session is not completed: ${session.status}`);
    }

    // Fetch the template for this assessment type
    const template = await prisma.questionnaireTemplate.findUnique({
        where: { assessmentType: session.assessmentType },
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
        throw new Error(`Template not found for assessment type: ${session.assessmentType}`);
    }

    // Create a map of questionId -> response
    const responseMap = new Map<string, string>();
    session.responses.forEach((response) => {
        responseMap.set(response.questionId, response.answer);
    });

    // Calculate domain scores
    const domainScores: DomainScore[] = [];
    const vbMappings: VBMappingResult[] = [];

    for (const domain of template.domains) {
        const questionResponses: QuestionResponse[] = [];
        let domainRawScore = 0;
        let domainMaxPossible = 0;

        for (const question of domain.questions) {
            const answer = responseMap.get(question.id);
            const scoreType = question.scoreType; // Now a proper field in Prisma schema
            const maxScore = getMaxScore(scoreType, question.options);
            const rawNumericScore = answer ? extractNumericScore(answer) : 0;
            const clampedNumericScore = Math.max(0, Math.min(rawNumericScore, Math.max(0, maxScore)));
            const vbMapping = mapQuestionToVB(question.skillCode || question.id, rawNumericScore, maxScore);
            vbMappings.push(vbMapping);

            questionResponses.push({
                questionId: question.id,
                skillCode: question.skillCode || '',
                taskName: question.taskName || '',
                questionText: question.questionText || '',
                selectedAnswer: answer || 'Not answered',
                numericScore: clampedNumericScore,
                maxScore,
                normalizedScore: vbMapping.normalized,
                vbFilledCells: vbMapping.filledUnits,
                vbBar: renderVBBar(vbMapping.filledMap),
            });

            domainRawScore += clampedNumericScore;
            domainMaxPossible += Math.max(0, maxScore);
        }

        const domainPercentage = domainMaxPossible > 0 
            ? (domainRawScore / domainMaxPossible) * 100 
            : 0;

        domainScores.push({
            domain: domain.name.charAt(0), // First letter as domain code (A, B, C, etc.)
            domainName: domain.name,
            rawScore: domainRawScore,
            maxPossible: domainMaxPossible,
            percentage: Math.round(domainPercentage * 100) / 100, // Round to 2 decimals
            proficiency: getProficiencyLevel(domainPercentage),
            questionCount: domain.questions.length,
            questions: questionResponses,
        });
    }

    // Calculate overall scores
    const overallScore = domainScores.reduce((sum, ds) => sum + ds.rawScore, 0);
    const overallMaxPossible = domainScores.reduce((sum, ds) => sum + ds.maxPossible, 0);
    const overallPercentage = overallMaxPossible > 0 
        ? Math.round((overallScore / overallMaxPossible) * 100 * 100) / 100 
        : 0;

    return {
        sessionId: session.id,
        childId: session.childId,
        childName: undefined, // Will be populated from separate Child table if exists
        assessmentType: template.assessmentType,
        completedAt: session.completedAt || new Date(),
        domainScores,
        overallScore,
        overallMaxPossible,
        overallPercentage,
        overallProficiency: getProficiencyLevel(overallPercentage),
        vbExport: toVBExportRows(vbMappings),
    };
}

