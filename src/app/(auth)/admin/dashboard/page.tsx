import { Metadata } from "next";
import { AdminDashboardClient } from "./components/client";
import { mockUsers, mockQuestionnaires } from "@/lib/mock-data";
import { Questionnaire } from "@/types";

export const metadata: Metadata = {
  title: "Admin Dashboard - ABA Assessments",
  description: "Manage users, view analytics, and oversee the platform.",
};

export default function AdminDashboardPage() {
  // In a real app, you'd fetch this data from your database
  const users = mockUsers;
  const questionnaires: Questionnaire[] = mockQuestionnaires;

  return <AdminDashboardClient users={users} questionnaires={questionnaires} />;
}
