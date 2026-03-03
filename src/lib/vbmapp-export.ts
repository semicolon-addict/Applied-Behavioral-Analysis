///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: VB-MAPP assessment template + in-progress answer selections
// Outcome: Backend-compatible VB-MAPP JSON maps for answers and score limits
// Short Description: Builds numeric answer and score-map exports for VB-MAPP milestones (0/0.5/1), barriers (0-4), and transitions (1-5)
/////////////////////////////////////////////////////////////

import { AssessmentQuestion, AssessmentQuestionnaire } from '@/types';

export type VBMAPPAnswerMap = Record<string, number>;
export type VBMAPPScoreMap = Record<string, number>;

export type VBMAPPExportState = {
    answers: VBMAPPAnswerMap;
    scoreMap: VBMAPPScoreMap;
    answeredCount: number;
    totalCount: number;
};

function parseLeadingNumber(value: string | null | undefined): number | null {
    if (!value) return null;
    const match = value.trim().match(/^([\d.]+)/);
    if (!match) return null;
    const num = Number.parseFloat(match[1]);
    return Number.isFinite(num) ? num : null;
}

function getQuestionKey(question: AssessmentQuestion): string {
    return (question.skillCode || question.id || '').trim();
}

function getQuestionMaxScore(question: AssessmentQuestion): number {
    // Check scoreType field first (e.g., "0-1", "0-4", "1-5")
    const scoreType = question.scoreType?.match(/(\d+)-(\d+)/);
    if (scoreType) {
        const maxVal = Number.parseInt(scoreType[2], 10);
        if (Number.isFinite(maxVal) && maxVal > 0) {
            return maxVal;
        }
    }

    // Infer from options
    let maxFromOptions = 0;
    for (const option of question.options || []) {
        const value = parseLeadingNumber(option);
        if (value !== null) {
            maxFromOptions = Math.max(maxFromOptions, value);
        }
    }
    if (maxFromOptions > 0) return maxFromOptions;

    // Default for VB-MAPP milestones is 0-1 scale
    return 1;
}

function parseSelectedScore(question: AssessmentQuestion, selectedValue: string): number {
    const parsed = parseLeadingNumber(selectedValue);
    if (parsed !== null) return parsed;

    const optionIndex = (question.options || []).findIndex((option) => option === selectedValue);
    if (optionIndex >= 0) return optionIndex;

    return 0;
}

export function buildVBMAPPExportState(
    template: AssessmentQuestionnaire,
    answersByQuestionId: Record<string, string>
): VBMAPPExportState {
    const answers: VBMAPPAnswerMap = {};
    const scoreMap: VBMAPPScoreMap = {};
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
