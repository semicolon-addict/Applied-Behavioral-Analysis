'use client';

import { Questionnaire } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { jsPDF } from "jspdf";
import { Button } from '../ui/button';
import { FileDown } from 'lucide-react';

interface QuestionnaireViewProps {
  questionnaire: Questionnaire;
}

export function QuestionnaireView({ questionnaire }: QuestionnaireViewProps) {

  const handleSavePdf = () => {
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      let y = 40;

      doc.setFontSize(18);
      doc.text("Parent Intake & Behavioral Questionnaire", 40, y);
      y += 30;

      doc.setFontSize(12);
      
      const addField = (label: string, value: string | number | undefined) => {
        if (value) {
            const text = `${label}: ${value}`;
            const lines = doc.splitTextToSize(text, 500);
            if (y + (lines.length * 16) > 780) {
                doc.addPage();
                y = 40;
            }
            doc.text(lines, 40, y);
            y += lines.length * 16;
        }
      }

      addField("Child Name", questionnaire.childName);
      addField("Age", questionnaire.childAge);
      addField("Date of Birth", new Date(questionnaire.childDob).toLocaleDateString());
      addField("Parent / Guardian 1", questionnaire.guardian1);
      addField("Parent / Guardian 2", questionnaire.guardian2);
      addField("Medical Conditions", questionnaire.medicalCond);
      addField("Communication Style", questionnaire.commStyle);
      addField("Behavior Profile", questionnaire.behavior);
      addField("Settings Most Impacted", questionnaire.settings);
      addField("Family’s Top Goals", questionnaire.goals);
      addField("Additional Comments", questionnaire.comments);
      addField("Submitted On", new Date(questionnaire.createdAt).toLocaleDateString());

      const childName = questionnaire.childName ? questionnaire.childName.replace(/\s+/g, "_") : "Parent_Questionnaire";
      doc.save(`${childName}.pdf`);
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Parent Intake Questionnaire</CardTitle>
            <CardDescription>
            Submitted for {questionnaire.childName} on {new Date(questionnaire.createdAt).toLocaleDateString()}
            </CardDescription>
        </div>
         <Button onClick={handleSavePdf} variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Save as PDF
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div>
          <h3 className="font-semibold text-lg mb-4 text-accent-foreground border-b pb-2">Identifiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <p><strong>Child Name:</strong> {questionnaire.childName}</p>
            <p><strong>Age:</strong> {questionnaire.childAge}</p>
            <p><strong>Date of Birth:</strong> {new Date(questionnaire.childDob).toLocaleDateString()}</p>
          </div>
        </div>
         <div>
          <h3 className="font-semibold text-lg mb-4 text-accent-foreground border-b pb-2">Caregivers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Parent / Guardian 1:</strong> {questionnaire.guardian1}</p>
            <p><strong>Parent / Guardian 2:</strong> {questionnaire.guardian2 || 'N/A'}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4 text-accent-foreground border-b pb-2">Medical & Development</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold mb-1">Medical Conditions</p>
                    <p className="text-muted-foreground">{questionnaire.medicalCond}</p>
                </div>
                <div>
                    <p className="font-semibold mb-1">Communication Style</p>
                    <p className="text-muted-foreground">{questionnaire.commStyle}</p>
                </div>
           </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4 text-accent-foreground border-b pb-2">Behavior Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold mb-1">Describe behavior</p>
                    <p className="text-muted-foreground">{questionnaire.behavior}</p>
                </div>
                <div>
                    <p className="font-semibold mb-1">Settings most impacted</p>
                    <p className="text-muted-foreground">{questionnaire.settings}</p>
                </div>
           </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4 text-accent-foreground border-b pb-2">Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold mb-1">Family’s Top Goals</p>
                    <p className="text-muted-foreground">{questionnaire.goals}</p>
                </div>
                <div>
                    <p className="font-semibold mb-1">Additional Comments</p>
                    <p className="text-muted-foreground">{questionnaire.comments || 'N/A'}</p>
                </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
