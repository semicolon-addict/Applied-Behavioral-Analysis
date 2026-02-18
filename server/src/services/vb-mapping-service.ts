///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Per-question numeric score + score max
// Outcome: Deterministic 4-unit VB mapping (right-aligned), plus export-ready rows
// Short Description: Pure mapping layer for ABLLS VB rendering, validation, and export
/////////////////////////////////////////////////////////////

export const VB_BASE_UNITS = 4;
export const VB_FILLED_CHAR = 'X';
export const VB_EMPTY_CHAR = '_';

export type VBSupportedMax = 2 | 4;

export type VBExportRow = {
    question: string;
    score: number;
    max: VBSupportedMax;
    normalized: number;
};

export type VBMappingResult = VBExportRow & {
    threshold: number;
    filledUnits: number[];
    filledMap: [boolean, boolean, boolean, boolean];
    pairedFillMap: [boolean, boolean];
};

export function resolveVBMax(rawMax?: number | null): VBSupportedMax {
    return rawMax === 2 ? 2 : 4;
}

export function clampVBScore(rawScore: number | null | undefined, max: VBSupportedMax): number {
    const numeric = Number.isFinite(rawScore as number) ? Number(rawScore) : 0;
    if (numeric < 0) return 0;
    if (numeric > max) return max;
    return numeric;
}

export function normalizeVBScore(score: number, max: VBSupportedMax): number {
    return max === 2 ? score * 2 : score;
}

export function mapQuestionToVB(question: string, rawScore: number | null | undefined, rawMax?: number | null): VBMappingResult {
    const max = resolveVBMax(rawMax);
    const score = clampVBScore(rawScore, max);
    const normalized = normalizeVBScore(score, max);
    const threshold = VB_BASE_UNITS - normalized + 1;

    const filledMap: [boolean, boolean, boolean, boolean] = [false, false, false, false];
    const filledUnits: number[] = [];
    for (let cellIndex = 1; cellIndex <= VB_BASE_UNITS; cellIndex++) {
        if (cellIndex >= threshold) {
            filledMap[cellIndex - 1] = true;
            filledUnits.push(cellIndex);
        }
    }

    const pairedFillMap: [boolean, boolean] = [
        filledMap[0] || filledMap[1],
        filledMap[2] || filledMap[3],
    ];

    return {
        question,
        score,
        max,
        normalized,
        threshold,
        filledUnits,
        filledMap,
        pairedFillMap,
    };
}

export function mapAnswersToVB(
    answers: Record<string, number | null | undefined>,
    scoreMap: Record<string, number | null | undefined> = {}
): VBMappingResult[] {
    const questionSet = new Set<string>([
        ...Object.keys(scoreMap),
        ...Object.keys(answers),
    ]);

    return Array.from(questionSet)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((question) => mapQuestionToVB(question, answers[question], scoreMap[question]));
}

export function toVBExportRows(results: VBMappingResult[]): VBExportRow[] {
    return results.map((result) => ({
        question: result.question,
        score: result.score,
        max: result.max,
        normalized: result.normalized,
    }));
}

export function renderVBBar(filledMap: [boolean, boolean, boolean, boolean]): string {
    return filledMap.map((isFilled) => (isFilled ? VB_FILLED_CHAR : VB_EMPTY_CHAR)).join(' ');
}
