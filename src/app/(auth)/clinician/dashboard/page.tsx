
import { Metadata } from "next";
import { ClinicianDashboardClient } from "./components/client";
import { mockChildren, mockAssessments, mockQuestionnaires } from "@/lib/mock-data";
import { Questionnaire } from "@/types";

export const metadata: Metadata = {
  title: "Clinician Dashboard - ABA Assessments",
  description: "Manage your assigned children and track assessment progress.",
};

export default function ClinicianDashboardPage() {
  const assignedChildren = mockChildren.filter(c => c.clinicianId === 'user-1');
  const questionnaires: Questionnaire[] = mockQuestionnaires;
  
  return <ClinicianDashboardClient children={assignedChildren} assessments={mockAssessments} questionnaires={questionnaires} />;
}
