///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: QuestionnaireSelector component for displaying assessment questionnaire cards
// Outcome: Card grid showing available questionnaires with question counts and completion status
// Short Description: Assessment questionnaire selector with cards for ABLLS-R, AFLLS, DAYC-2, and Behavior Therapy
/////////////////////////////////////////////////////////////

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileQuestion, ClipboardList, Brain, Heart, BookOpen, Loader2 } from 'lucide-react';
import { QuestionnaireTemplateSummary } from '@/types';
import { getTemplates } from '@/lib/questionnaire-api';

interface QuestionnaireSelectorProps {
    onSelect: (assessmentType: string) => void;
    preSelectedType?: string | null;
}

const assessmentIcons: Record<string, React.ElementType> = {
    'ABLLS-R': Brain,
    'AFLLS': BookOpen,
    'DAYC-2': ClipboardList,
    'Behavior-Therapy': Heart,
};

const assessmentColors: Record<string, string> = {
    'ABLLS-R': 'border-l-blue-500',
    'AFLLS': 'border-l-green-500',
    'DAYC-2': 'border-l-purple-500',
    'Behavior-Therapy': 'border-l-rose-500',
};

export function QuestionnaireSelector({ onSelect, preSelectedType }: QuestionnaireSelectorProps) {
    const [templates, setTemplates] = useState<QuestionnaireTemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTemplates() {
            try {
                setLoading(true);
                const data = await getTemplates();
                setTemplates(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load questionnaires');
            } finally {
                setLoading(false);
            }
        }
        loadTemplates();
    }, []);

    // Auto-select if a type is pre-selected
    useEffect(() => {
        if (preSelectedType && templates.length > 0) {
            const found = templates.find(t => t.assessmentType === preSelectedType);
            if (found) {
                onSelect(preSelectedType);
            }
        }
    }, [preSelectedType, templates, onSelect]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading questionnaires...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Questionnaires</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Make sure the backend server is running on port 3001.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (templates.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Questionnaires Available</CardTitle>
                    <CardDescription>
                        Questionnaire templates have not been set up yet. Please run the database seed script.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <FileQuestion className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Select an Assessment Questionnaire</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => {
                    const Icon = assessmentIcons[template.assessmentType] || FileQuestion;
                    const borderColor = assessmentColors[template.assessmentType] || 'border-l-gray-500';

                    return (
                        <Card
                            key={template.id}
                            className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${borderColor} hover:scale-[1.02]`}
                            onClick={() => onSelect(template.assessmentType)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{template.title}</CardTitle>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{template.assessmentType}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {template.description && (
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {template.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {template.domains.length} domains · {template.totalQuestions} questions
                                    </span>
                                    <Button variant="outline" size="sm">
                                        Start →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
