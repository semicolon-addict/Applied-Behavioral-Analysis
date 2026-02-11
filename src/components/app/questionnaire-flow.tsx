///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: QuestionnaireFlow component implementing Question → Dropdown → Options → Confirm → Next Question
// Outcome: Step-by-step wizard for answering assessment questionnaires with PostgreSQL persistence
// Short Description: Interactive questionnaire wizard with progress tracking, domain grouping, and per-question save
/////////////////////////////////////////////////////////////

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Loader2, X, ChevronLeft } from 'lucide-react';
import { AssessmentQuestionnaire, AssessmentQuestion, QuestionnaireDomain } from '@/types';
import { getTemplate, startSession, saveResponse, completeSession } from '@/lib/questionnaire-api';
import { useToast } from '@/hooks/use-toast';

interface QuestionnaireFlowProps {
    assessmentType: string;
    childId: string;
    respondentId: string;
    onBack: () => void;
    onComplete: () => void;
}

type FlatQuestion = {
    question: AssessmentQuestion;
    domainName: string;
    domainIndex: number;
    questionIndexInDomain: number;
    totalInDomain: number;
    globalIndex: number;
};

export function QuestionnaireFlow({
    assessmentType,
    childId,
    respondentId,
    onBack,
    onComplete,
}: QuestionnaireFlowProps) {
    const { toast } = useToast();

    // Data state
    const [template, setTemplate] = useState<AssessmentQuestionnaire | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Question flow state
    const [flatQuestions, setFlatQuestions] = useState<FlatQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);

    // Load template and start/resume session
    useEffect(() => {
        async function init() {
            try {
                setLoading(true);

                // Fetch template
                const tmpl = await getTemplate(assessmentType);
                setTemplate(tmpl);

                // Flatten questions for step-by-step navigation
                const flat: FlatQuestion[] = [];
                tmpl.domains.forEach((domain, domainIdx) => {
                    domain.questions.forEach((question, qIdx) => {
                        flat.push({
                            question,
                            domainName: domain.name,
                            domainIndex: domainIdx,
                            questionIndexInDomain: qIdx,
                            totalInDomain: domain.questions.length,
                            globalIndex: flat.length,
                        });
                    });
                });
                setFlatQuestions(flat);

                // Start or resume session
                const session = await startSession(assessmentType, childId, respondentId);
                setSessionId(session.id);

                // Restore saved answers
                if (session.responses && session.responses.length > 0) {
                    const savedAnswers: Record<string, string> = {};
                    session.responses.forEach((r) => {
                        savedAnswers[r.questionId] = r.answer;
                    });
                    setAnswers(savedAnswers);

                    // Find the first unanswered question to resume from
                    const firstUnanswered = flat.findIndex(
                        (fq) => !savedAnswers[fq.question.id]
                    );
                    if (firstUnanswered > 0) {
                        setCurrentIndex(firstUnanswered);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load questionnaire');
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [assessmentType, childId, respondentId]);

    // Set selected answer when navigating to a question
    useEffect(() => {
        if (flatQuestions.length > 0) {
            const currentQ = flatQuestions[currentIndex];
            setSelectedAnswer(answers[currentQ.question.id] || '');
        }
    }, [currentIndex, flatQuestions, answers]);

    const currentQuestion = flatQuestions[currentIndex];
    const totalQuestions = flatQuestions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    const isLastQuestion = currentIndex === totalQuestions - 1;

    // Handle "Confirm & Next"
    const handleConfirm = useCallback(async () => {
        if (!selectedAnswer || !sessionId || !currentQuestion) return;

        try {
            setSaving(true);

            // Save response to PostgreSQL via API
            await saveResponse(sessionId, currentQuestion.question.id, selectedAnswer);

            // Update local answers
            setAnswers((prev) => ({
                ...prev,
                [currentQuestion.question.id]: selectedAnswer,
            }));

            // Move to next question
            if (!isLastQuestion) {
                setCurrentIndex((prev) => prev + 1);
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save response. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    }, [selectedAnswer, sessionId, currentQuestion, isLastQuestion, toast]);

    // Handle "Submit" (complete session)
    const handleSubmit = useCallback(async () => {
        if (!sessionId) return;

        // Save the last answer first if needed
        if (selectedAnswer && currentQuestion) {
            try {
                await saveResponse(sessionId, currentQuestion.question.id, selectedAnswer);
                setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.question.id]: selectedAnswer,
                }));
            } catch (err) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to save final response.',
                });
                return;
            }
        }

        try {
            setCompleting(true);
            await completeSession(sessionId);
            toast({
                title: 'Success!',
                description: 'Questionnaire completed and saved successfully.',
            });
            onComplete();
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to complete questionnaire.',
            });
        } finally {
            setCompleting(false);
        }
    }, [sessionId, selectedAnswer, currentQuestion, toast, onComplete]);

    // Handle "Back"
    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading questionnaire...</span>
            </div>
        );
    }

    // Error state
    if (error || !template || !currentQuestion) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>{error || 'Questionnaire could not be loaded.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={onBack}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Selection
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Check if current domain changed from previous question
    const isNewDomain =
        currentIndex === 0 ||
        flatQuestions[currentIndex].domainName !== flatQuestions[currentIndex - 1]?.domainName;

    return (
        <div className="space-y-4">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back to Questionnaires
                </Button>
                <Badge variant="outline">{assessmentType}</Badge>
            </div>

            {/* Domain header */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                            Domain: {currentQuestion.domainName}
                        </span>
                    </div>
                    <Badge variant="secondary">
                        Domain {currentQuestion.domainIndex + 1} of {template.domains.length}
                    </Badge>
                </CardContent>
            </Card>

            {/* Domain transition notification */}
            {isNewDomain && currentIndex > 0 && (
                <div className="rounded-lg bg-accent/50 p-3 text-sm text-center">
                    New domain: <strong>{currentQuestion.domainName}</strong>
                </div>
            )}

            {/* Question card */}
            <Card className="shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <CardDescription>
                            Question {currentIndex + 1} of {totalQuestions}
                            {' · '}
                            (Q{currentQuestion.questionIndexInDomain + 1}/{currentQuestion.totalInDomain} in this domain)
                        </CardDescription>
                    </div>
                    <CardTitle className="text-xl leading-relaxed">
                        {currentQuestion.question.questionText}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Dropdown for selecting response */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Select your response:
                        </label>
                        <Select value={selectedAnswer} onValueChange={setSelectedAnswer}>
                            <SelectTrigger className="w-full text-base py-6">
                                <SelectValue placeholder="Select response..." />
                            </SelectTrigger>
                            <SelectContent>
                                {currentQuestion.question.options.map((option, idx) => (
                                    <SelectItem key={idx} value={option} className="py-3 text-base">
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentIndex === 0 || saving}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>

                        <div className="flex gap-2">
                            {isLastQuestion ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!selectedAnswer || completing}
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                >
                                    {completing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    Submit Questionnaire
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleConfirm}
                                    disabled={!selectedAnswer || saving}
                                    className="gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowRight className="h-4 w-4" />
                                    )}
                                    Confirm & Next
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress bar */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-semibold">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {answeredCount} of {totalQuestions} questions answered
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
