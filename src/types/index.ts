

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

export type AssessmentType = 'ABLLS-R' | 'AFLLS' | 'DAYC-2';

export type AssessmentScore = {
  domain: string;
  task: string;
  score: number;
};

export type Assessment = {
  id:string;
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
