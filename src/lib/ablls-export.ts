///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Assessment template + in-progress answer selections
// Outcome: Backend-compatible ABLLS JSON maps for answers and score limits
// Short Description: Builds numeric answer and score-map exports that match existing mock JSON formats for VB grid consumption
/////////////////////////////////////////////////////////////

import { AssessmentQuestion, AssessmentQuestionnaire } from '@/types';

export type ABLLSAnswerMap = Record<string, number>;
export type ABLLSScoreMap = Record<string, number>;

export type ABLLSExportState = {
    answers: ABLLSAnswerMap;
    scoreMap: ABLLSScoreMap;
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
    const scoreType = question.scoreType?.match(/0-(\d+)/);
    if (scoreType) {
        const fromScoreType = Number.parseInt(scoreType[1], 10);
        if (Number.isFinite(fromScoreType) && fromScoreType > 0) {
            return fromScoreType;
        }
    }

    let maxFromOptions = 0;
    for (const option of question.options || []) {
        const value = parseLeadingInteger(option);
        if (value !== null) {
            maxFromOptions = Math.max(maxFromOptions, value);
        }
    }
    if (maxFromOptions > 0) return maxFromOptions;

    if (question.options && question.options.length > 0) {
        return Math.max(1, question.options.length - 1);
    }

    return 4;
}

function parseSelectedScore(question: AssessmentQuestion, selectedValue: string): number {
    const parsed = parseLeadingInteger(selectedValue);
    if (parsed !== null) return parsed;

    const optionIndex = (question.options || []).findIndex((option) => option === selectedValue);
    if (optionIndex >= 0) return optionIndex;

    return 0;
}

export function buildABLLSExportState(
    template: AssessmentQuestionnaire,
    answersByQuestionId: Record<string, string>
): ABLLSExportState {
    const answers: ABLLSAnswerMap = {};
    const scoreMap: ABLLSScoreMap = {};
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

