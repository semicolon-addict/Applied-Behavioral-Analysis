
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Assessment, AssessmentScore, AssessmentType, Domain, Task, Child, AfllsProtocol, Questionnaire } from "@/types";
import { abllsDomains, afllsProtocols, dayc2Domains } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useFirestore, setDocumentNonBlocking, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { TaskDialog } from "./task-dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { jsPDF } from "jspdf";

type AssessmentGridProps = {
    assessment: Assessment;
    child?: Child;
    questionnaire?: Questionnaire;
    onViewQuestionnaire?: (assessmentType: string) => void;
};

const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-200 text-green-900";
    if (score >= 4) return "bg-yellow-100 text-yellow-900";
    if (score >= 0) return "bg-red-100 text-red-900";
    return "bg-gray-50";
};

const getDomainsForType = (type: AssessmentType): Domain[] | AfllsProtocol[] => {
    switch (type) {
        case 'ABLLS-R': return abllsDomains;
        case 'AFLLS': return afllsProtocols;
        case 'DAYC-2': return dayc2Domains;
        default: return [];
    }
}

const isAfllsProtocol = (data: any[]): data is AfllsProtocol[] => {
    return data.length > 0 && 'protocolName' in data[0];
}


export function AssessmentGrid({ assessment, child, questionnaire, onViewQuestionnaire }: AssessmentGridProps) {
    const firestore = useFirestore();
    const { user } = useUser();
    const assessmentData = getDomainsForType(assessment.type);

    const [scores, setScores] = useState<Map<string, number | null>>(new Map());
    const [selectedTask, setSelectedTask] = useState<{ domain: Domain, task: Task, score: number | null } | null>(null);

    useEffect(() => {
        const newScoresMap = new Map<string, number | null>();
        assessment.scores.forEach(s => newScoresMap.set(`${s.domain}-${s.task}`, s.score));
        setScores(newScoresMap);
    }, [assessment]);

    const handleScoreChange = (domainName: string, taskName: string, newScore: number | null) => {
        const validatedScore = newScore !== null ? Math.max(0, Math.min(10, newScore)) : null;

        const newScores = new Map(scores);
        const key = `${domainName}-${taskName}`;
        newScores.set(key, validatedScore);
        setScores(newScores);

        const updatedScoresArray: AssessmentScore[] = [...assessment.scores];
        const scoreIndex = updatedScoresArray.findIndex(s => s.domain === domainName && s.task === taskName);

        if (scoreIndex > -1) {
            if (validatedScore !== null) {
                updatedScoresArray[scoreIndex] = { ...updatedScoresArray[scoreIndex], score: validatedScore };
            } else {
                updatedScoresArray.splice(scoreIndex, 1);
            }
        } else if (validatedScore !== null) {
            updatedScoresArray.push({ domain: domainName, task: taskName, score: validatedScore });
        }

        if (!firestore || !child || !assessment.id || !user) return;

        const assessmentRef = doc(firestore, `users/${child.parentId}/children/${child.id}/assessments/${assessment.id}`);

        setDocumentNonBlocking(assessmentRef, { scores: updatedScoresArray }, { merge: true });
        setSelectedTask(null);
    };

    const openTaskDialog = (domain: Domain, task: Task) => {
        const score = scores.get(`${domain.name}-${task.name}`) ?? null;
        setSelectedTask({ domain, task, score });
    }

    const handleGenerateReport = () => {
        if (!child) return;
        const doc = new jsPDF();
        let y = 20;

        doc.setFontSize(22);
        doc.text("Assessment Report", 105, y, { align: "center" });
        y += 20;

        doc.setFontSize(16);
        doc.text(`Child: ${child.name}`, 15, y);
        y += 10;
        doc.setFontSize(12);
        doc.text(`Date of Birth: ${new Date(child.dob).toLocaleDateString()}`, 15, y);
        y += 7;
        doc.text(`Diagnosis: ${child.diagnosis}`, 15, y);
        y += 15;

        doc.text(`Assessment: ${assessment.type}`, 15, y);
        y += 7;
        doc.text(`Date: ${new Date(assessment.date).toLocaleDateString()}`, 15, y);
        y += 15;

        // Questionnaire Section
        if (questionnaire) {
            doc.setFontSize(16);
            doc.text("Intake Questionnaire Summary", 15, y);
            y += 10;
            doc.setFontSize(10);
            const addQuestionnaireField = (label: string, value: string | number | undefined) => {
                if (value) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(label, 15, y);
                    y += 5;
                    doc.setFont('helvetica', 'normal');
                    const lines = doc.splitTextToSize(String(value), 180);
                    if (y + (lines.length * 5) > 280) { // check for page break
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(lines, 15, y);
                    y += (lines.length * 5) + 5;
                }
            };
            addQuestionnaireField("Medical Conditions", questionnaire.medicalCond);
            addQuestionnaireField("Communication Style", questionnaire.commStyle);
            addQuestionnaireField("Behavior Profile", questionnaire.behavior);
            addQuestionnaireField("Family’s Top Goals", questionnaire.goals);
            y += 5;
        }

        // Scores Section
        doc.setFontSize(16);
        doc.text("Assessment Scores", 15, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const tableHeaders = ["Domain", "Task", "Score"];
        const tableColumnWidths = [70, 80, 20];
        doc.text(tableHeaders[0], 15, y);
        doc.text(tableHeaders[1], 15 + tableColumnWidths[0], y);
        doc.text(tableHeaders[2], 15 + tableColumnWidths[0] + tableColumnWidths[1], y);
        y += 2;
        doc.line(15, y, 195, y); // horizontal line
        doc.setFont('helvetica', 'normal');
        y += 5;

        assessment.scores.sort((a, b) => a.domain.localeCompare(b.domain) || a.task.localeCompare(b.task)).forEach(score => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                doc.setFont('helvetica', 'bold');
                doc.text(tableHeaders[0], 15, y);
                doc.text(tableHeaders[1], 15 + tableColumnWidths[0], y);
                doc.text(tableHeaders[2], 15 + tableColumnWidths[0] + tableColumnWidths[1], y);
                y += 2;
                doc.line(15, y, 195, y);
                doc.setFont('helvetica', 'normal');
                y += 5;
            }
            const domainLines = doc.splitTextToSize(score.domain, tableColumnWidths[0] - 5);
            const taskLines = doc.splitTextToSize(score.task, tableColumnWidths[1] - 5);
            const scoreText = String(score.score);

            const maxLines = Math.max(domainLines.length, taskLines.length);

            doc.text(domainLines, 15, y);
            doc.text(taskLines, 15 + tableColumnWidths[0], y);
            doc.text(scoreText, 15 + tableColumnWidths[0] + tableColumnWidths[1], y);

            y += maxLines * 5 + 3;
        });

        doc.save(`${child.name.replace(/\s+/g, "_")}_${assessment.type}_Report.pdf`);
    };

    const renderGrid = (domains: Domain[], gridTitle?: string) => {
        const maxTasks = Math.max(1, ...domains.map(d => d.tasks.length));
        return (
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            {gridTitle ? (
                                <CardTitle>{gridTitle}</CardTitle>
                            ) : (
                                <CardTitle>{assessment.type} Assessment Grid</CardTitle>
                            )}
                            <CardDescription>
                                Child: {child?.name} | Date: {new Date(assessment.date).toLocaleDateString()}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {onViewQuestionnaire && (
                                <Button onClick={() => onViewQuestionnaire(assessment.type)} variant="outline" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Questionnaire
                                </Button>
                            )}
                            <Button onClick={handleGenerateReport} variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="border">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold border-r min-w-[200px]">Domain</TableHead>
                                    {Array.from({ length: maxTasks }, (_, i) => (
                                        <TableHead key={i} className="text-center min-w-[60px]">{i + 1}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {domains.map((domain) => (
                                    <TableRow key={domain.name}>
                                        <TableCell className="font-medium border-r">{domain.name}</TableCell>
                                        {Array.from({ length: maxTasks }, (_, i) => {
                                            const task = domain.tasks[i];
                                            if (!task) {
                                                return <TableCell key={i} className="bg-muted/50"></TableCell>
                                            }

                                            const score = scores.get(`${domain.name}-${task.name}`);

                                            return (
                                                <TableCell
                                                    key={i}
                                                    className={cn(
                                                        "p-1 text-center font-bold cursor-pointer hover:bg-muted-foreground/20",
                                                        score !== undefined && score !== null ? getScoreColor(score) : 'bg-gray-50'
                                                    )}
                                                    onClick={() => openTaskDialog(domain, task)}
                                                >
                                                    <div className="w-14 h-10 flex items-center justify-center">
                                                        {score ?? ''}
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            {isAfllsProtocol(assessmentData)
                ? (assessmentData as AfllsProtocol[]).map(protocol => React.cloneElement(renderGrid(protocol.domains, `${assessment.type} - ${protocol.protocolName}`), { key: protocol.protocolName }))
                : renderGrid(assessmentData as Domain[])
            }
            {selectedTask && (
                <TaskDialog
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    domain={selectedTask.domain}
                    task={selectedTask.task}
                    score={selectedTask.score}
                    onSave={handleScoreChange}
                />
            )}
        </>
    );
}
