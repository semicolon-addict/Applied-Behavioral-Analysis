///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: AFLS assessment template + in-progress answer selections
// Outcome: Backend-compatible AFLS JSON maps for answers and score limits
// Short Description: Builds numeric answer and score-map exports for AFLS VB grid consumption (same format as ABLLS export)
/////////////////////////////////////////////////////////////

import { AssessmentQuestion, AssessmentQuestionnaire } from '@/types';

export type AFLSAnswerMap = Record<string, number>;
export type AFLSScoreMap = Record<string, number>;

export type AFLSExportState = {
    answers: AFLSAnswerMap;
    scoreMap: AFLSScoreMap;
    answeredCount: number;
    totalCount: number;
};

function parseLeadingInteger(value: string | null | undefined): number | null {
    if (!value) return null;
    const match = value.trim().match(/^(\d+)/);
    if (!match) return null;
    return Number.parseInt(match[1], 10);
}

function getQuestionKey(question: AssessmentQuestion): string {
    return (question.skillCode || question.id || '').trim();
}

function getQuestionMaxScore(question: AssessmentQuestion): number {
    // Check scoreType field first (e.g., "0-2", "0-4")
    const scoreType = question.scoreType?.match(/0-(\d+)/);
    if (scoreType) {
        const fromScoreType = Number.parseInt(scoreType[1], 10);
        if (Number.isFinite(fromScoreType) && fromScoreType > 0) {
            return fromScoreType;
        }
    }

    // Infer from options
    let maxFromOptions = 0;
    for (const option of question.options || []) {
        const value = parseLeadingInteger(option);
        if (value !== null) {
            maxFromOptions = Math.max(maxFromOptions, value);
        }
    }
    if (maxFromOptions > 0) return maxFromOptions;

    // Default for AFLS is 0-2 scale
    return 2;
}

function parseSelectedScore(question: AssessmentQuestion, selectedValue: string): number {
    const parsed = parseLeadingInteger(selectedValue);
    if (parsed !== null) return parsed;

    const optionIndex = (question.options || []).findIndex((option) => option === selectedValue);
    if (optionIndex >= 0) return optionIndex;

    return 0;
}

export function buildAFLSExportState(
    template: AssessmentQuestionnaire,
    answersByQuestionId: Record<string, string>
): AFLSExportState {
    const answers: AFLSAnswerMap = {};
    const scoreMap: AFLSScoreMap = {};
    let totalCount = 0;

    for (const domain of template.domains) {
        for (const question of domain.questions) {
            totalCount += 1;
            const key = getQuestionKey(question);
            if (!key) continue;

            scoreMap[key] = getQuestionMaxScore(question);

            const selected = answersByQuestionId[question.id];
            if (!selected) continue;
            answers[key] = parseSelectedScore(question, selected);
        }
    }

    return {
        answers,
        scoreMap,
        answeredCount: Object.keys(answers).length,
        totalCount,
    };
}
