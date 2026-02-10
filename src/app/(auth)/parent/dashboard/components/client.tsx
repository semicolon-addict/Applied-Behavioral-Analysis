
"use client";

import { Child, Assessment, Message, Questionnaire } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProgressChart } from "./progress-chart";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QuestionnaireForm } from "./questionnaire-form";

export function ParentDashboardClient({ 
    child, 
    assessments, 
    messages, 
    questionnaires,
    onQuestionnaireSubmit
}: { 
    child?: Child, 
    assessments: Assessment[], 
    messages: Message[], 
    questionnaires: Questionnaire[],
    onQuestionnaireSubmit: () => void;
}) {

    if (!child) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md text-center p-8">
                    <CardHeader>
                        <CardTitle>Welcome!</CardTitle>
                        <CardDescription>
                            It looks like you don't have a child linked to your account yet. Please contact your clinician or administrator to get set up.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button>Contact Support</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (questionnaires.length === 0) {
        return <QuestionnaireForm child={child} onFormSubmit={onQuestionnaireSubmit} />;
    }
    
    return (
        <>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card id="progress">
                        <CardHeader>
                            <CardTitle>Progress for {child.name}</CardTitle>
                            <CardDescription>A summary of recent assessment progress.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ProgressChart />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assessments.map(assessment => (
                                <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{assessment.type}</span>
                                        <span className="text-sm text-muted-foreground">
                                            Completed on {new Date(assessment.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={assessment.progress} className="w-24" />
                                        <Badge variant="secondary">{assessment.progress}%</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card id="profile">
                        <CardHeader>
                            <CardTitle>Child Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {child.name}</p>
                            <p><strong>Date of Birth:</strong> {new Date(child.dob).toLocaleDateString()}</p>
                            <p><strong>Diagnosis:</strong> {child.diagnosis}</p>
                             <p><strong>Assigned Clinician:</strong> Dr. Evelyn Reed</p>
                             <Button variant="outline" className="mt-4 w-full">Update Information</Button>
                        </CardContent>
                    </Card>
                    <Card id="feedback">
                         <CardHeader>
                            <CardTitle>Clinician Feedback</CardTitle>
                            <CardDescription>Recent messages from your clinician.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {messages.filter(m => m.from !== 'user-2').map(message => (
                                 <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg bg-accent/50">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={'https://picsum.photos/seed/avatar1/100/100'} />
                                        <AvatarFallback>CR</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-0.5">
                                        <p className="font-semibold text-sm">Dr. Evelyn Reed</p>
                                        <p className="text-xs text-muted-foreground">{message.body}</p>
                                    </div>
                                 </div>
                           ))}
                           <Button className="w-full">View All Messages</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
