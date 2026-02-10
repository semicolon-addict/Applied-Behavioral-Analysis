
"use client";

import { Child, Assessment, Questionnaire } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Baby, Stethoscope, MessageSquare, Activity, FileQuestion } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AssessmentGrid } from "./assessment-grid";
import { mockMessages } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuestionnaireView } from "@/components/app/questionnaire-view";

export function ClinicianDashboardClient({ 
    children, 
    assessments,
    questionnaires
}: { 
    children: Child[], 
    assessments: Assessment[],
    questionnaires: Questionnaire[]
 }) {
    
    return (
        <>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Clinician Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="dashboard" className="space-y-4" id="main-tabs">
                <TabsList>
                    <TabsTrigger value="dashboard">
                        <Activity className="mr-2 h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="ablls-r">ABLLS-R</TabsTrigger>
                    <TabsTrigger value="aflls">AFLLS</TabsTrigger>
                    <TabsTrigger value="dayc-2">DAYC-2</TabsTrigger>
                     <TabsTrigger value="questionnaires">
                         <FileQuestion className="mr-2 h-4 w-4" />
                        Questionnaires
                    </TabsTrigger>
                     <TabsTrigger value="messages">
                         <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Assigned Children</CardTitle>
                                <CardDescription>Manage and track progress for your assigned children.</CardDescription>
                            </div>
                             <Button size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" /> Assign Child
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Diagnosis</TableHead>
                                        <TableHead>Overall Progress</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {children.map(child => {
                                        const childAssessments = assessments.filter(a => a.childId === child.id);
                                        const avgProgress = childAssessments.reduce((acc, a) => acc + a.progress, 0) / (childAssessments.length || 1);
                                        return (
                                            <TableRow key={child.id}>
                                                <TableCell className="font-medium">{child.name}</TableCell>
                                                <TableCell>{child.diagnosis}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={avgProgress} className="w-40" />
                                                        <span>{avgProgress.toFixed(0)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm">View</Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ablls-r">
                    {assessments.filter(a => a.type === 'ABLLS-R').map(a => {
                        const child = children.find(c => c.id === a.childId);
                        const questionnaire = questionnaires.find(q => q.childId === a.childId);
                        return <AssessmentGrid key={a.id} assessment={a} child={child} questionnaire={questionnaire} />
                    })}
                </TabsContent>
                <TabsContent value="aflls">
                     {assessments.filter(a => a.type === 'AFLLS').map(a => {
                        const child = children.find(c => c.id === a.childId);
                        const questionnaire = questionnaires.find(q => q.childId === a.childId);
                        return <AssessmentGrid key={a.id} assessment={a} child={child} questionnaire={questionnaire} />
                    })}
                </TabsContent>
                <TabsContent value="dayc-2">
                     {assessments.filter(a => a.type === 'DAYC-2').map(a => {
                        const child = children.find(c => c.id === a.childId);
                        const questionnaire = questionnaires.find(q => q.childId === a.childId);
                        return <AssessmentGrid key={a.id} assessment={a} child={child} questionnaire={questionnaire} />
                    })}
                </TabsContent>
                <TabsContent value="questionnaires" className="space-y-4">
                    {questionnaires.length > 0 ? (
                        questionnaires.map(q => <QuestionnaireView key={q.id} questionnaire={q} />)
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>No Questionnaires Found</CardTitle>
                                <CardDescription>Parents will fill out an intake questionnaire for their children.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Once a parent submits a questionnaire, it will appear here.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="messages" className="space-y-4">
                    <Card>
                         <CardHeader>
                            <CardTitle>Parent Communication</CardTitle>
                            <CardDescription>View and respond to messages from parents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                {mockMessages.map(message => (
                                     <div key={message.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                        <Avatar>
                                            <AvatarImage src={message.from === 'user-1' ? 'https://picsum.photos/seed/avatar1/100/100' : 'https://picsum.photos/seed/avatar2/100/100'} />
                                            <AvatarFallback>{message.from === 'user-1' ? 'CR' : 'P'}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold">{message.from === 'user-1' ? "You" : "Mark Johnson (Parent)"}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleString()}</p>
                                            </div>
                                            <p className="font-semibold">{message.subject}</p>
                                            <p className="text-sm text-muted-foreground">{message.body}</p>
                                        </div>
                                     </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}
