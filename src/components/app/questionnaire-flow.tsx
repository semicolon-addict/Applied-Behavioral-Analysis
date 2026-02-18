///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: QuestionnaireFlow component with domain-scroll view
// Outcome: Domain-based questionnaire flow with exportable VB JSON pipeline and grid handoff
// Short Description: Interactive questionnaire with top-to-bottom question flow per domain, PostgreSQL persistence, JSON export, and Excel export
/////////////////////////////////////////////////////////////

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, Check, Loader2, ChevronLeft, Download, Save } from 'lucide-react';
import { AssessmentQuestionnaire, AssessmentQuestion, QuestionnaireDomain } from '@/types';
import { getTemplate, startSession, saveResponse, completeSession, downloadExcelReport } from '@/lib/questionnaire-api';
import { buildABLLSExportState } from '@/lib/ablls-export';
import { useToast } from '@/hooks/use-toast';

interface QuestionnaireFlowProps {
    assessmentType: string;
    childId: string;
    respondentId: string;
    onBack: () => void;
    onComplete: () => void;
}

function resolveDomainCode(domain: QuestionnaireDomain, fallbackIndex: number): string {
    const firstQuestionWithCode = domain.questions.find((question) => question.skillCode && question.skillCode.trim().length > 0);
    if (firstQuestionWithCode?.skillCode) {
        return firstQuestionWithCode.skillCode.trim().charAt(0).toUpperCase();
    }
    return String.fromCharCode(65 + fallbackIndex);
}

function isGenericResponseOption(option: string): boolean {
    return /^\s*\d+\s*-\s*response\b/i.test(option.trim());
}

function resolveQuestionMaxScore(question: AssessmentQuestion): number {
    const scoreTypeMatch = question.scoreType?.match(/0-(\d+)/i);
    if (scoreTypeMatch) {
        const maxFromScoreType = Number.parseInt(scoreTypeMatch[1], 10);
        if (Number.isFinite(maxFromScoreType) && maxFromScoreType > 0) {
            return maxFromScoreType;
        }
    }

    let maxFromOptions = 0;
    for (const option of question.options || []) {
        const match = option.trim().match(/^(\d+)/);
        if (!match) continue;
        const parsed = Number.parseInt(match[1], 10);
        if (Number.isFinite(parsed)) {
            maxFromOptions = Math.max(maxFromOptions, parsed);
        }
    }
    return maxFromOptions > 0 ? maxFromOptions : 2;
}

function buildOptionsFromCriteria(criteria: string | undefined, maxScore: number): string[] {
    if (!criteria || maxScore <= 0) return [];

    const normalized = criteria.replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    const scoreDescriptions = new Map<number, string>();
    const regex = /(\d+)\s*=\s*([\s\S]*?)(?=(?:,\s*\d+\s*=)|$)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(normalized)) !== null) {
        const score = Number.parseInt(match[1], 10);
        if (!Number.isFinite(score) || score < 1 || score > maxScore) continue;

        const description = match[2].trim().replace(/^[,;:\-\s]+|[,;:\-\s]+$/g, '');
        if (!description) continue;

        scoreDescriptions.set(score, description);
    }

    if (scoreDescriptions.size === 0) return [];

    const criteriaOptions: string[] = [];
    for (let score = 1; score <= maxScore; score++) {
        const description = scoreDescriptions.get(score);
        criteriaOptions.push(description ? `${score} - ${description}` : `${score}`);
    }
    return criteriaOptions;
}

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

    // Domain flow state (not question-by-question)
    const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportState, setExportState] = useState(() => ({
        answers: {} as Record<string, number>,
        scoreMap: {} as Record<string, number>,
        answeredCount: 0,
        totalCount: 0,
    }));

    // Load template and start/resume session
    useEffect(() => {
        async function init() {
            try {
                setLoading(true);

                // Fetch template
                const tmpl = await getTemplate(assessmentType);
                const sortedDomains = [...tmpl.domains].sort((a, b) => {
                    const codeA = resolveDomainCode(a, 0);
                    const codeB = resolveDomainCode(b, 0);
                    return codeA.localeCompare(codeB, undefined, { numeric: true });
                });
                const normalizedTemplate: AssessmentQuestionnaire = {
                    ...tmpl,
                    domains: sortedDomains,
                };
                setTemplate(normalizedTemplate);

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

                    // Find the first incomplete domain to resume from
                    let firstIncompleteDomain = 0;
                    for (let i = 0; i < normalizedTemplate.domains.length; i++) {
                        const domain = normalizedTemplate.domains[i];
                        const allAnswered = domain.questions.every((q) => savedAnswers[q.id]);
                        if (!allAnswered) {
                            firstIncompleteDomain = i;
                            break;
                        }
                    }
                    setCurrentDomainIndex(firstIncompleteDomain);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load questionnaire');
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [assessmentType, childId, respondentId]);

    useEffect(() => {
        if (!template) return;
        setExportState(buildABLLSExportState(template, answers));
    }, [template, answers]);

    // Helper: Filter out 0th option (starts with "0 -" or "0-")
    const filterOptions = (options: string[]): string[] => {
        return options.filter((opt) => !opt.trim().match(/^0\s*[-–—]/));
    };

    const ablls02FallbackOptions = [
        '1 - Emerging or prompted / Inconsistent',
        '2 - Independent / Mastered',
    ];

    const ablls04FallbackOptions = [
        '1 - Performs with full prompts / Minimal response',
        '2 - Performs with partial prompts / Inconsistent',
        '3 - Performs with minimal prompts / Usually independent',
        '4 - Performs independently / Mastered & generalized',
    ];

    const getDisplayOptions = (question: AssessmentQuestion): string[] => {
        const rawOptions = question.options || [];
        const filtered = filterOptions(rawOptions);
        const maxScore = resolveQuestionMaxScore(question);
        const criteriaOptions = buildOptionsFromCriteria(question.criteria, maxScore);
        const hasOnlyGenericOptions = filtered.length > 0 && filtered.every(isGenericResponseOption);
        const fallbackByScore =
            maxScore === 2
                ? ablls02FallbackOptions
                : maxScore === 4
                    ? ablls04FallbackOptions
                    : [];

        if (criteriaOptions.length > 0 && (hasOnlyGenericOptions || filtered.length === 0)) {
            return criteriaOptions.map((option, idx) => {
                if (option.includes(' - ')) return option;
                return fallbackByScore[idx] || option;
            });
        }

        if (hasOnlyGenericOptions) {
            if (maxScore === 2) return ablls02FallbackOptions;
            if (maxScore === 4) return ablls04FallbackOptions;
        }

        if (filtered.length > 0) {
            return filtered;
        }

        const scoreType = question.scoreType?.toLowerCase() || '';
        if (scoreType.includes('0-2')) {
            return ablls02FallbackOptions;
        }
        if (scoreType.includes('0-4')) {
            return ablls04FallbackOptions;
        }

        if (rawOptions.length > 0) {
            return rawOptions;
        }

        return ['1', '2'];
    };

    // Helper: Calculate progress
    const getTotalQuestions = () => {
        if (!template) return 0;
        return template.domains.reduce((sum, domain) => sum + domain.questions.length, 0);
    };

    const getAnsweredCount = () => Object.keys(answers).length;

    const currentDomain = template?.domains[currentDomainIndex];
    const currentDomainCode = currentDomain ? resolveDomainCode(currentDomain, currentDomainIndex) : '';
    const isLastDomain = currentDomainIndex === (template?.domains.length || 0) - 1;
    
    // Check if all questions in current domain are answered
    const isDomainComplete = currentDomain?.questions.every((q) => answers[q.id]) || false;

    // Handle answer change for a question
    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const persistDomainResponses = useCallback(async (domain: QuestionnaireDomain) => {
        if (!sessionId) return;
        for (const question of domain.questions) {
            const answer = answers[question.id];
            if (answer) {
                await saveResponse(sessionId, question.id, answer);
            }
        }
    }, [sessionId, answers]);

    // Handle "Next Domain" button
    const handleNextDomain = useCallback(async () => {
        if (!sessionId || !currentDomain) return;

        try {
            setSaving(true);

            // Save all answers in the current domain
            await persistDomainResponses(currentDomain);

            // Move to next domain
            setCurrentDomainIndex((prev) => prev + 1);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            toast({
                title: 'Progress Saved',
                description: `Domain "${currentDomain.name}" completed!`,
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save responses. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    }, [sessionId, currentDomain, toast, persistDomainResponses]);

    const downloadJson = (filename: string, payload: object) => {
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleSaveAndExport = useCallback(() => {
        if (!template) return;

        try {
            setExporting(true);

            const exportSnapshot = buildABLLSExportState(template, answers);
            const generatedAt = new Date().toISOString();
            const safeAssessmentType = assessmentType.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
            const timestamp = generatedAt.replace(/[:.]/g, '-');
            const answersFileName = `${safeAssessmentType}-responses-${timestamp}.json`;
            const scoreMapFileName = `${safeAssessmentType}-score-map-${timestamp}.json`;

            // Save latest export for grid autoload
            window.localStorage.setItem(
                'ablls_grid_payload',
                JSON.stringify({
                    version: 1,
                    assessmentType,
                    generatedAt,
                    answers: exportSnapshot.answers,
                    scoreMap: exportSnapshot.scoreMap,
                })
            );

            downloadJson(answersFileName, exportSnapshot.answers);
            downloadJson(scoreMapFileName, exportSnapshot.scoreMap);

            // Open ABLLS VB grid with autoload enabled
            const gridWindow = window.open('/ablls/grid.html?autoload=latest', '_blank', 'noopener,noreferrer');

            toast({
                title: 'Saved & Exported',
                description: gridWindow
                    ? `${exportSnapshot.answeredCount} responses exported and grid opened.`
                    : `${exportSnapshot.answeredCount} responses exported. Allow popups to open the VB grid automatically.`,
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Export Error',
                description: err instanceof Error ? err.message : 'Failed to export JSON files.',
            });
        } finally {
            setExporting(false);
        }
    }, [template, answers, assessmentType, toast]);

    // Handle final submission and Excel download
    const handleSubmitAndExport = useCallback(async () => {
        if (!sessionId || !currentDomain) return;

        try {
            setCompleting(true);

            // Save all answers in the final domain
            await persistDomainResponses(currentDomain);

            // Complete the session
            await completeSession(sessionId);

            toast({
                title: 'Assessment Complete!',
                description: 'Preparing VB-mapped Excel report...',
            });

            // Trigger Excel download
            await downloadExcelReport(sessionId);

            toast({
                title: 'Success!',
                description: 'Excel report downloaded successfully.',
            });

            onComplete();
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to complete questionnaire.',
            });
        } finally {
            setCompleting(false);
        }
    }, [sessionId, currentDomain, toast, onComplete, persistDomainResponses]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading questionnaire...</span>
            </div>
        );
    }

    // Error state
    if (error || !template || !currentDomain) {
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

    const totalQuestions = getTotalQuestions();
    const answeredCount = getAnsweredCount();
    const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    return (
        <div className="space-y-6 pb-8">
            {/* Header with back button and badge */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-3 px-1 border-b">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back to Questionnaires
                </Button>
                <Badge variant="outline">{assessmentType}</Badge>
            </div>

            {/* Domain header card */}
            <Card>
                <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold">
                            {currentDomainCode}. {currentDomain.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Domain {currentDomainIndex + 1} of {template.domains.length}
                        </span>
                    </div>
                    <Badge variant="secondary">
                        {currentDomain.questions.length} Questions
                    </Badge>
                </CardContent>
            </Card>

            {/* Progress indicator */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-semibold">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </Progress>
                    <p className="text-xs text-muted-foreground mt-2">
                        {answeredCount} of {totalQuestions} questions answered
                    </p>
                </CardContent>
            </Card>

            {/* All questions in current domain (top-to-bottom scroll) */}
            <div className="space-y-6">
                {currentDomain.questions.map((question, qIndex) => {
                    const displayOptions = getDisplayOptions(question);
                    const currentAnswer = answers[question.id];

                    return (
                        <Card key={question.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <CardDescription className="text-base">
                                        Question {qIndex + 1} of {currentDomain.questions.length}
                                    </CardDescription>
                                    {question.skillCode && (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {question.skillCode}
                                        </Badge>
                                    )}
                                </div>
                                
                                {question.taskName && (
                                    <p className="text-sm font-semibold mb-2">
                                        {question.taskName}
                                    </p>
                                )}
                                
                                <CardTitle className="text-lg leading-relaxed">
                                    {question.questionText}
                                </CardTitle>

                                {/* Additional question details */}
                                {(question.taskObjective || question.examples || question.exampleImage) && (
                                    <div className="mt-3 space-y-3 rounded-md bg-muted/50 p-4 text-sm">
                                        {question.taskObjective && (
                                            <div>
                                                <span className="font-medium text-muted-foreground">Objective: </span>
                                                <span className="text-foreground">{question.taskObjective}</span>
                                            </div>
                                        )}
                                        
                                        {(question.examples || question.exampleImage) && (
                                            <div className="rounded-md bg-muted/50 p-3 border">
                                                <div className="font-medium mb-2">Examples:</div>
                                                {question.exampleImage && (
                                                    <div className="mb-2">
                                                        <img 
                                                            src={question.exampleImage} 
                                                            alt="Example" 
                                                            className="w-full max-w-xs sm:max-w-sm h-auto rounded border object-contain"
                                                        />
                                                    </div>
                                                )}
                                                {question.examples && (
                                                    <div>
                                                        {question.examples}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="pt-0">
                                {/* Radio button options (0th option filtered out) */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                                        Select your response:
                                    </Label>
                                    {displayOptions.length > 0 ? (
                                        <RadioGroup
                                            value={currentAnswer || ''}
                                            onValueChange={(value) => handleAnswerChange(question.id, value)}
                                            className="space-y-3"
                                        >
                                            {displayOptions.map((option) => (
                                                <div key={option} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                                                    <RadioGroupItem 
                                                        value={option} 
                                                        id={`${question.id}-${option}`}
                                                        className="mt-0.5"
                                                    />
                                                    <Label
                                                        htmlFor={`${question.id}-${option}`}
                                                        className="flex-1 text-base cursor-pointer leading-relaxed"
                                                    >
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                No options available for this question. Please check the data.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Answer indicator */}
                                {currentAnswer && (
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-700 dark:text-green-400 font-medium">Answered</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Navigation footer - Next Domain or Submit */}
            <Card className="sticky bottom-4 shadow-lg">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            {isDomainComplete ? (
                                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    All questions answered in this domain
                                </span>
                            ) : (
                                <span className="text-muted-foreground">
                                    {currentDomain.questions.filter((q) => answers[q.id]).length} of {currentDomain.questions.length} answered
                                </span>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                                Export state: {exportState.answeredCount} of {exportState.totalCount} scored responses
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={handleSaveAndExport}
                                disabled={exporting || completing || saving}
                                className="gap-2"
                            >
                                {exporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save & Export
                                    </>
                                )}
                            </Button>

                            {/* Previous Domain Button (if not first domain) */}
                            {currentDomainIndex > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setCurrentDomainIndex((prev) => prev - 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={saving || completing}
                                >
                                    Previous Domain
                                </Button>
                            )}

                            {/* Next Domain or Submit Button */}
                            {isLastDomain ? (
                                <Button
                                    onClick={handleSubmitAndExport}
                                    disabled={!isDomainComplete || completing}
                                    className="gap-2"
                                >
                                    {completing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Submit & Download Excel
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNextDomain}
                                    disabled={!isDomainComplete || saving}
                                    className="gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Next Domain
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
