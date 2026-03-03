///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: DAYC-2 assessment template + in-progress answer selections
// Outcome: Backend-compatible DAYC-2 JSON maps for answers and score limits
// Short Description: Builds numeric answer and score-map exports for DAYC-2 VB grid consumption (0-1 Yes/No scale)
/////////////////////////////////////////////////////////////

import { AssessmentQuestion, AssessmentQuestionnaire } from '@/types';

export type DAYC2AnswerMap = Record<string, number>;
export type DAYC2ScoreMap = Record<string, number>;

export type DAYC2ExportState = {
    answers: DAYC2AnswerMap;
    scoreMap: DAYC2ScoreMap;
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
    // Check scoreType field first (e.g., "0-1")
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

    // Default for DAYC-2 is 0-1 scale (Yes/No)
    return 1;
}

function parseSelectedScore(question: AssessmentQuestion, selectedValue: string): number {
    const parsed = parseLeadingInteger(selectedValue);
    if (parsed !== null) return parsed;

    const optionIndex = (question.options || []).findIndex((option) => option === selectedValue);
    if (optionIndex >= 0) return optionIndex;

    return 0;
}

export function buildDAYC2ExportState(
    template: AssessmentQuestionnaire,
    answersByQuestionId: Record<string, string>
): DAYC2ExportState {
    const answers: DAYC2AnswerMap = {};
    const scoreMap: DAYC2ScoreMap = {};
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
