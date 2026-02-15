///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: API client for questionnaire backend endpoints
// Outcome: Frontend can fetch templates, manage sessions, and save responses via Express API
// Short Description: Fetch wrapper for PostgreSQL-backed questionnaire REST API
/////////////////////////////////////////////////////////////

import type {
    QuestionnaireTemplateSummary,
    AssessmentQuestionnaire,
    QuestionnaireSession,
    QuestionnaireResponseEntry,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
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
    });
}

// Get a session with all saved responses
export async function getSession(sessionId: string): Promise<QuestionnaireSession> {
    return fetchApi<QuestionnaireSession>(`/api/questionnaires/sessions/${sessionId}`);
}

// Save a single response (called on each "Confirm")
export async function saveResponse(
    sessionId: string,
    questionId: string,
    answer: string
): Promise<QuestionnaireResponseEntry> {
    return fetchApi<QuestionnaireResponseEntry>(
        `/api/questionnaires/sessions/${sessionId}/responses`,
        {
            method: 'PUT',
            body: JSON.stringify({ questionId, answer }),
        }
    );
}

// Mark session as completed
export async function completeSession(sessionId: string): Promise<QuestionnaireSession> {
    return fetchApi<QuestionnaireSession>(
        `/api/questionnaires/sessions/${sessionId}/complete`,
        { method: 'PATCH' }
    );
}

// Get sessions for a specific child
export async function getSessionsForChild(
    childId: string,
    assessmentType?: string
): Promise<QuestionnaireSession[]> {
    const params = new URLSearchParams({ childId });
    if (assessmentType) params.append('assessmentType', assessmentType);
    return fetchApi<QuestionnaireSession[]>(`/api/questionnaires/sessions?${params}`);
}
