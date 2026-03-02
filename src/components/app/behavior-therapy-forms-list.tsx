///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Behavior Therapy form schema data
// Outcome: 6 form cards for selecting a clinical form to fill out
// Short Description: Grid of cards for the 6 Behavior Therapy .docx forms
/////////////////////////////////////////////////////////////

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, FileCheck, ShieldAlert, School, Building2, RotateCcw, ChevronLeft } from 'lucide-react';
import formsData from '@/data/behavior-therapy-forms.json';

interface FormMeta {
    formId: string;
    title: string;
    fileName: string;
    icon: React.ElementType;
    color: string;
    description: string;
    sectionCount: number;
}

const FORM_META: Record<string, Partial<FormMeta>> = {
    'aba-assessment': {
        icon: FileText,
        color: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
        description: 'Initial ABA assessment covering referral, background, maladaptive behaviors, present levels, and treatment goals.',
    },
    'aba-re-assessment': {
        icon: RotateCcw,
        color: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20',
        description: 'Re-assessment form for ongoing ABA cases with updated progress, goals, and service recommendations.',
    },
    'behavior-intervention-plan': {
        icon: ShieldAlert,
        color: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
        description: 'Behavior Intervention Plan (BIP) with target behaviors, hypotheses, antecedent modifications, and crisis plan.',
    },
    'school-plan': {
        icon: School,
        color: 'border-l-green-500 bg-green-50 dark:bg-green-950/20',
        description: 'ABA School Intervention Plan with patient summary, maladaptive behaviors, goals, and reduction targets.',
    },
    'tricare-aba-assessment': {
        icon: Building2,
        color: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20',
        description: 'Tricare-specific initial ABA assessment with insurance-compliant documentation requirements.',
    },
    'tricare-aba-re-assessment': {
        icon: Building2,
        color: 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
        description: 'Tricare-specific re-assessment form with updated progress and continued service justification.',
    },
};

interface BehaviorTherapyFormsListProps {
    onSelectForm: (formId: string) => void;
    onBack: () => void;
}

export function BehaviorTherapyFormsList({ onSelectForm, onBack }: BehaviorTherapyFormsListProps) {
    const forms: FormMeta[] = formsData.map((form: any) => {
        const meta = FORM_META[form.formId] || {};
        return {
            formId: form.formId,
            title: form.title,
            fileName: form.fileName,
            icon: meta.icon || FileText,
            color: meta.color || 'border-l-gray-500',
            description: meta.description || '',
            sectionCount: form.sections.length,
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">Behavior Therapy Forms</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Select a form to fill out. All fields are optional. Download as PDF when ready.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms.map((form) => {
                    const Icon = form.icon;
                    return (
                        <Card
                            key={form.formId}
                            className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${form.color} hover:scale-[1.02]`}
                            onClick={() => onSelectForm(form.formId)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-base">{form.title}</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">{form.fileName}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground mb-3">{form.description}</p>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-xs">
                                        {form.sectionCount} {form.sectionCount === 1 ? 'section' : 'sections'}
                                    </Badge>
                                    <span className="text-xs text-primary font-medium">Open →</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
