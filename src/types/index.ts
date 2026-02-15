

export type UserRole = 'Admin' | 'Clinician' | 'Parent';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'Active' | 'Inactive' | 'Pending';
};

export type Child = {
  id: string;
  name: string;
  dob: string;
  diagnosis: string;
  parentId: string;
  clinicianId: string;
};

///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: New assessment questionnaire types for PostgreSQL integration
// Outcome: TypeScript types for questionnaire templates, sessions, and responses
// Short Description: Added questionnaire-related types and Behavior-Therapy to AssessmentType
/////////////////////////////////////////////////////////////

export type AssessmentType = 'ABLLS-R' | 'AFLLS' | 'DAYC-2' | 'Behavior-Therapy';

// Assessment question (from parsed PDF, stored in PostgreSQL)
export type AssessmentQuestion = {
  id: string;
  questionText: string;
  responseType: 'dropdown' | 'text' | 'scale';
  options: string[];
  sortOrder: number;
};

// Domain with its questions
export type QuestionnaireDomain = {
  id: string;
  name: string;
  sortOrder: number;
  questions: AssessmentQuestion[];
};

// Full questionnaire template (per assessment type)
export type AssessmentQuestionnaire = {
  id: string;
  assessmentType: string;
  title: string;
  description: string | null;
  domains: QuestionnaireDomain[];
};

// Template summary (for selector cards)
export type QuestionnaireTemplateSummary = {
  id: string;
  assessmentType: string;
  title: string;
  description: string | null;
  totalQuestions: number;
  domains: { id: string; name: string; questionCount: number }[];
};

// User's questionnaire session
export type QuestionnaireSession = {
  id: string;
  assessmentType: string;
  childId: string;
  respondentId: string;
  status: 'in-progress' | 'completed';
  createdAt: string;
  completedAt: string | null;
  responses: QuestionnaireResponseEntry[];
};

// Individual response entry
export type QuestionnaireResponseEntry = {
  id: string;
  questionId: string;
  answer: string;
};

export type AssessmentScore = {
  domain: string;
  task: string;
  score: number;
};

export type Assessment = {
  id: string;
  childId: string;
  type: AssessmentType;
  date: string;
  scores: AssessmentScore[];
  progress: number;
};

export type Message = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
};

export type Task = {
  name: string;
  question: string;
  objective: string;
};

export type Domain = {
  name: string;
  tasks: Task[];
};

export type AfllsProtocol = {
  protocolName: string;
  domains: Domain[];
};

export type Questionnaire = {
  id: string;
  childId: string;
  parentId: string;
  childName: string;
  childAge: number;
  childDob: string;
  guardian1: string;
  guardian2?: string;
  medicalCond: string;
  commStyle: string;
  behavior: string;
  settings: string;
  goals: string;
  comments?: string;
  createdAt: string;
};
