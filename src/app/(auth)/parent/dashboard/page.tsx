
'use client';
import { ParentDashboardClient } from "./components/client";
import { mockMessages } from "@/lib/mock-data";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { Child, Assessment, Message, Questionnaire } from "@/types";
import { useState } from "react";

export default function ParentDashboardPage() {
  const { user, isUserLoading: isUserLoadingAuth } = useUser();
  const firestore = useFirestore();
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);

  const childrenQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/children`));
  }, [firestore, user]);
  const { data: childrenData, isLoading: isLoadingChildren } = useCollection<Child>(childrenQuery);
  const child = childrenData?.[0]; // Assuming one child per parent for now

  const assessmentsQuery = useMemoFirebase(() => {
    if (!user || !child) return null;
    return query(collection(firestore, `users/${user.uid}/children/${child.id}/assessments`));
  }, [firestore, user, child]);
  const { data: assessments, isLoading: isLoadingAssessments } = useCollection<Assessment>(assessmentsQuery);
  
  const questionnairesQuery = useMemoFirebase(() => {
    if (!user || !child) return null;
    return query(collection(firestore, `users/${user.uid}/children/${child.id}/questionnaires`));
  }, [firestore, user, child, questionnaireSubmitted]);
  const { data: questionnaires, isLoading: isLoadingQuestionnaires } = useCollection<Questionnaire>(questionnairesQuery);

  const messages = mockMessages.filter(m => m.to === 'user-2' || m.from === 'user-2');

  const isLoading = isUserLoadingAuth || isLoadingChildren || (childrenData && childrenData.length > 0 && (isLoadingAssessments || isLoadingQuestionnaires));

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  return <ParentDashboardClient 
            child={child} 
            assessments={assessments ?? []} 
            messages={messages} 
            questionnaires={questionnaires ?? []}
            onQuestionnaireSubmit={() => setQuestionnaireSubmitted(true)}
        />;
}
