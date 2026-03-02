///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: API client for questionnaire backend endpoints
// Outcome: Frontend can fetch templates, manage sessions, save responses, and download VB-mapped Excel reports
// Short Description: Fetch wrapper for PostgreSQL-backed questionnaire REST API with Excel export
/////////////////////////////////////////////////////////////

import type {
    QuestionnaireTemplateSummary,
    AssessmentQuestionnaire,
    QuestionnaireSession,
    QuestionnaireResponseEntry,
} from '@/types';
import { getSession as getSheetSession } from '@/lib/sheets-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function buildHeaders(respondentId?: string, options?: RequestInit): HeadersInit {
    const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string> | undefined),
    };

    if (options?.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (respondentId) {
        headers['x-respondent-id'] = respondentId;
    }

    if (typeof window !== 'undefined') {
        const session = getSheetSession();
        if (session?.role) {
            headers['x-user-role'] = session.role;
        }
    }

    return headers;
}

async function fetchApi<T>(url: string, options?: RequestInit, respondentId?: string): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: buildHeaders(respondentId, options),
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API error: ${res.status}`);
    }

    return res.json();
}

// Get all questionnaire templates (summary with question counts)
export async function getTemplates(): Promise<QuestionnaireTemplateSummary[]> {
    return fetchApi<QuestionnaireTemplateSummary[]>('/api/questionnaires/templates');
}

// Get a full template with all domains and questions
export async function getTemplate(assessmentType: string): Promise<AssessmentQuestionnaire> {
    return fetchApi<AssessmentQuestionnaire>(`/api/questionnaires/templates/${assessmentType}`);
}

// Start a new session or resume an existing in-progress session
export async function startSession(
    assessmentType: string,
    childId: string,
    respondentId: string
): Promise<QuestionnaireSession> {
    return fetchApi<QuestionnaireSession>('/api/questionnaires/sessions', {
        method: 'POST',
        body: JSON.stringify({ assessmentType, childId, respondentId }),
    }, respondentId);
}

// Get a session with all saved responses
export async function getSession(sessionId: string, respondentId: string): Promise<QuestionnaireSession> {
    return fetchApi<QuestionnaireSession>(`/api/questionnaires/sessions/${sessionId}`, undefined, respondentId);
}

// Save a single response (called on each "Confirm")
export async function saveResponse(
    sessionId: string,
    questionId: string,
    answer: string,
    respondentId: string
): Promise<QuestionnaireResponseEntry> {
    return fetchApi<QuestionnaireResponseEntry>(
        `/api/questionnaires/sessions/${sessionId}/responses`,
        {
            method: 'PUT',
            body: JSON.stringify({ questionId, answer }),
        },
        respondentId
    );
}

// Mark session as completed
export async function completeSession(
    sessionId: string,
    respondentId: string,
    requiredQuestionIds: string[] = []
): Promise<QuestionnaireSession> {
    return fetchApi<QuestionnaireSession>(
        `/api/questionnaires/sessions/${sessionId}/complete`,
        {
            method: 'PATCH',
            body: JSON.stringify({ requiredQuestionIds }),
        },
        respondentId
    );
}

// Get sessions for a specific child
export async function getSessionsForChild(
    childId: string,
    respondentId: string,
    assessmentType?: string
): Promise<QuestionnaireSession[]> {
    const params = new URLSearchParams({ childId });
    if (assessmentType) params.append('assessmentType', assessmentType);
    params.append('respondentId', respondentId);
    return fetchApi<QuestionnaireSession[]>(`/api/questionnaires/sessions?${params}`, undefined, respondentId);
}

// Download VB-mapped Excel report for a completed session
export async function downloadExcelReport(sessionId: string, respondentId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/questionnaires/sessions/${sessionId}/export`, {
        headers: buildHeaders(respondentId),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to generate Excel report' }));
        throw new Error(error.error || `Export failed: ${response.status}`);
    }

    // Get filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `ABLLS_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches && matches[1]) {
            filename = matches[1];
        }
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Fetch normalized VB mapping rows for validation/debugging
export async function getVBExport(
    sessionId: string,
    respondentId: string
): Promise<Array<{ question: string; score: number; max: number; normalized: number }>> {
    return fetchApi<Array<{ question: string; score: number; max: number; normalized: number }>>(
        `/api/questionnaires/sessions/${sessionId}/vb-export`,
        undefined,
        respondentId
    );
}
