///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Integration of assessment questionnaires into clinician dashboard
// Outcome: Questionnaires tab now shows assessment questionnaires and parent intake forms as sub-tabs
// Short Description: Added QuestionnaireSelector and QuestionnaireFlow under Questionnaires tab with sub-navigation
/////////////////////////////////////////////////////////////

"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Child, Assessment, Questionnaire, QuestionnaireDomain } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, MessageSquare, Activity, FileQuestion, ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AssessmentGrid } from "./assessment-grid";
import { mockMessages } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuestionnaireView } from "@/components/app/questionnaire-view";
import { QuestionnaireSelector } from "@/components/app/questionnaire-selector";
import { QuestionnaireFlow } from "@/components/app/questionnaire-flow";
import { AFLSProtocolSelector, AFLSProtocol } from "@/components/app/afls-protocol-selector";
import { DAYC2ProtocolSelector, DAYC2Protocol } from "@/components/app/dayc2-protocol-selector";
import { VBMAPPProtocolSelector, VBMAPPProtocol } from '@/components/app/vbmapp-protocol-selector';
import { BehaviorTherapyFormsList } from "@/components/app/behavior-therapy-forms-list";
import { BehaviorTherapyForm } from "@/components/app/behavior-therapy-form";
import { useUser } from "@/firebase";

export function ClinicianDashboardClient({
    children,
    assessments,
    questionnaires
}: {
    children: Child[],
    assessments: Assessment[],
    questionnaires: Questionnaire[]
}) {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const [mainTab, setMainTab] = useState<string>('dashboard');

    useEffect(() => {
        const tab = searchParams.get('tab');
        const allowedTabs = new Set(['dashboard', 'ablls-r', 'aflls', 'dayc-2', 'questionnaires', 'messages']);
        if (tab && allowedTabs.has(tab)) {
            setMainTab(tab);
        }
    }, [searchParams]);

    const activeChildId = children[0]?.id || null;
    const respondentId = user?.uid || null;

    // State for assessment questionnaire flow
    const [activeQuestionnaireType, setActiveQuestionnaireType] = useState<string | null>(null);
    const [preSelectedType, setPreSelectedType] = useState<string | null>(null);
    // AFLS protocol selection state
    const [showAFLSProtocols, setShowAFLSProtocols] = useState(false);
    const [selectedAFLSProtocol, setSelectedAFLSProtocol] = useState<AFLSProtocol | null>(null);
    const [aflsFilteredDomains, setAflsFilteredDomains] = useState<QuestionnaireDomain[] | null>(null);
    // DAYC-2 protocol selection state
    const [showDAYC2Protocols, setShowDAYC2Protocols] = useState(false);
    const [selectedDAYC2Protocol, setSelectedDAYC2Protocol] = useState<DAYC2Protocol | null>(null);
    const [dayc2FilteredDomains, setDayc2FilteredDomains] = useState<QuestionnaireDomain[] | null>(null);
    // VB-MAPP protocol selection state
    const [showVBMAPPProtocols, setShowVBMAPPProtocols] = useState(false);
    const [selectedVBMAPPProtocol, setSelectedVBMAPPProtocol] = useState<VBMAPPProtocol | null>(null);
    const [vbmappFilteredDomains, setVbmappFilteredDomains] = useState<QuestionnaireDomain[] | null>(null);
    // Behavior Therapy forms state
    const [showBehaviorTherapyForms, setShowBehaviorTherapyForms] = useState(false);
    const [selectedBehaviorTherapyForm, setSelectedBehaviorTherapyForm] = useState<string | null>(null);

    const handleSelectQuestionnaire = useCallback((assessmentType: string) => {
        if (assessmentType === 'AFLLS') {
            // Show AFLS protocol selector instead of jumping directly to flow
            setShowAFLSProtocols(true);
            setActiveQuestionnaireType(null);
        } else if (assessmentType === 'DAYC-2') {
            // Show DAYC-2 protocol selector instead of jumping directly to flow
            setShowDAYC2Protocols(true);
            setActiveQuestionnaireType(null);
        } else if (assessmentType === 'VB-MAPP') {
            // Show VB-MAPP protocol selector instead of jumping directly to flow
            setShowVBMAPPProtocols(true);
            setActiveQuestionnaireType(null);
        } else if (assessmentType === 'Behavior-Therapy') {
            // Show Behavior Therapy forms list inside this tab
            setShowBehaviorTherapyForms(true);
            setSelectedBehaviorTherapyForm(null);
            setActiveQuestionnaireType(null);
        } else {
            setActiveQuestionnaireType(assessmentType);
            setShowAFLSProtocols(false);
            setShowDAYC2Protocols(false);
            setShowVBMAPPProtocols(false);
        }
    }, []);

    const handleAFLSProtocolSelect = useCallback((protocol: AFLSProtocol | null, filteredDomains: QuestionnaireDomain[] | null) => {
        setSelectedAFLSProtocol(protocol);
        setAflsFilteredDomains(filteredDomains);
        setActiveQuestionnaireType('AFLLS');
        setShowAFLSProtocols(false);
    }, []);

    const handleBackFromAFLSProtocols = useCallback(() => {
        setShowAFLSProtocols(false);
        setActiveQuestionnaireType(null);
    }, []);

    const handleDAYC2ProtocolSelect = useCallback((protocol: DAYC2Protocol | null, filteredDomains: QuestionnaireDomain[] | null) => {
        setSelectedDAYC2Protocol(protocol);
        setDayc2FilteredDomains(filteredDomains);
        setActiveQuestionnaireType('DAYC-2');
        setShowDAYC2Protocols(false);
    }, []);

    const handleBackFromDAYC2Protocols = useCallback(() => {
        setShowDAYC2Protocols(false);
        setActiveQuestionnaireType(null);
    }, []);

    const handleVBMAPPProtocolSelect = useCallback((protocol: VBMAPPProtocol | null, filteredDomains: QuestionnaireDomain[] | null) => {
        setSelectedVBMAPPProtocol(protocol);
        setVbmappFilteredDomains(filteredDomains);
        setActiveQuestionnaireType('VB-MAPP');
        setShowVBMAPPProtocols(false);
    }, []);

    const handleBackFromVBMAPPProtocols = useCallback(() => {
        setShowVBMAPPProtocols(false);
        setActiveQuestionnaireType(null);
    }, []);

    const handleBackFromBehaviorTherapyForms = useCallback(() => {
        setShowBehaviorTherapyForms(false);
        setSelectedBehaviorTherapyForm(null);
    }, []);

    const handleBackToSelector = useCallback(() => {
        if (activeQuestionnaireType === 'AFLLS' && selectedAFLSProtocol !== null) {
            // Go back to AFLS protocol selector, not main selector
            setActiveQuestionnaireType(null);
            setShowAFLSProtocols(true);
            setSelectedAFLSProtocol(null);
            setAflsFilteredDomains(null);
        } else if (activeQuestionnaireType === 'DAYC-2' && selectedDAYC2Protocol !== null) {
            // Go back to DAYC-2 protocol selector, not main selector
            setActiveQuestionnaireType(null);
            setShowDAYC2Protocols(true);
            setSelectedDAYC2Protocol(null);
            setDayc2FilteredDomains(null);
        } else if (activeQuestionnaireType === 'VB-MAPP' && selectedVBMAPPProtocol !== null) {
            // Go back to VB-MAPP protocol selector, not main selector
            setActiveQuestionnaireType(null);
            setShowVBMAPPProtocols(true);
            setSelectedVBMAPPProtocol(null);
            setVbmappFilteredDomains(null);
        } else {
            setActiveQuestionnaireType(null);
            setPreSelectedType(null);
            setShowAFLSProtocols(false);
            setShowDAYC2Protocols(false);
            setShowVBMAPPProtocols(false);
        }
    }, [activeQuestionnaireType, selectedAFLSProtocol, selectedDAYC2Protocol, selectedVBMAPPProtocol]);

    const handleQuestionnaireComplete = useCallback(() => {
        setActiveQuestionnaireType(null);
        setPreSelectedType(null);
        setShowAFLSProtocols(false);
        setSelectedAFLSProtocol(null);
        setAflsFilteredDomains(null);
        setShowDAYC2Protocols(false);
        setSelectedDAYC2Protocol(null);
        setDayc2FilteredDomains(null);
        setShowVBMAPPProtocols(false);
        setSelectedVBMAPPProtocol(null);
        setVbmappFilteredDomains(null);
        setShowBehaviorTherapyForms(false);
        setSelectedBehaviorTherapyForm(null);
    }, []);

    // Called from assessment grid "View Questionnaire" button
    const handleViewQuestionnaire = useCallback((assessmentType: string) => {
        setPreSelectedType(assessmentType);
        setActiveQuestionnaireType(assessmentType);
        setMainTab('questionnaires');
    }, []);

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
            <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4" id="main-tabs">
                <TabsList>
                    <TabsTrigger value="dashboard">
                        <Activity className="mr-2 h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="ablls-r">ABLLS-R</TabsTrigger>
                    <TabsTrigger value="aflls">AFLS</TabsTrigger>
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
                        return <AssessmentGrid key={a.id} assessment={a} child={child} questionnaire={questionnaire} onViewQuestionnaire={handleViewQuestionnaire} />
                    })}
                </TabsContent>
                <TabsContent value="aflls">
                    {assessments.filter(a => a.type === 'AFLLS').map(a => {
                        const child = children.find(c => c.id === a.childId);
                        const questionnaire = questionnaires.find(q => q.childId === a.childId);
                        return <AssessmentGrid key={a.id} assessment={a} child={child} questionnaire={questionnaire} onViewQuestionnaire={handleViewQuestionnaire} />
                    })}
                </TabsContent>
                <TabsContent value="dayc-2">
                    {assessments.filter(a => a.type === 'DAYC-2').map(a => {
                        const child = children.find(c => c.id === a.childId);
                        const questionnaire = questionnaires.find(q => q.childId === a.childId);
                        return <AssessmentGrid key={a.id} assessment={a} child={child} questionnaire={questionnaire} onViewQuestionnaire={handleViewQuestionnaire} />
                    })}
                </TabsContent>

                {/* Questionnaires Tab - Assessment Questionnaires + Parent Intake Forms */}
                <TabsContent value="questionnaires" className="space-y-4">
                    <Tabs defaultValue="assessment-questionnaires" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="assessment-questionnaires">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Assessment Questionnaires
                            </TabsTrigger>
                            <TabsTrigger value="parent-intake">
                                <FileQuestion className="mr-2 h-4 w-4" />
                                Parent Intake Forms
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="assessment-questionnaires">
                            {activeQuestionnaireType ? (
                                !activeChildId || !respondentId ? (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Unable to Start Questionnaire</CardTitle>
                                            <CardDescription>
                                                A valid child and authenticated clinician session are required.
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ) : (
                                    <QuestionnaireFlow
                                        assessmentType={activeQuestionnaireType}
                                        childId={activeChildId}
                                        respondentId={respondentId}
                                        onBack={handleBackToSelector}
                                        onComplete={handleQuestionnaireComplete}
                                        filteredDomains={activeQuestionnaireType === 'DAYC-2' ? (dayc2FilteredDomains || undefined) : activeQuestionnaireType === 'VB-MAPP' ? (vbmappFilteredDomains || undefined) : (aflsFilteredDomains || undefined)}
                                        protocolName={activeQuestionnaireType === 'DAYC-2' ? selectedDAYC2Protocol?.name : activeQuestionnaireType === 'VB-MAPP' ? selectedVBMAPPProtocol?.name : selectedAFLSProtocol?.name}
                                    />
                                )
                            ) : showAFLSProtocols ? (
                                <AFLSProtocolSelector
                                    onSelectProtocol={handleAFLSProtocolSelect}
                                    onBack={handleBackFromAFLSProtocols}
                                />
                            ) : showDAYC2Protocols ? (
                                <DAYC2ProtocolSelector
                                    onSelectProtocol={handleDAYC2ProtocolSelect}
                                    onBack={handleBackFromDAYC2Protocols}
                                />
                            ) : showVBMAPPProtocols ? (
                                <VBMAPPProtocolSelector
                                    onSelectProtocol={handleVBMAPPProtocolSelect}
                                    onBack={handleBackFromVBMAPPProtocols}
                                />
                            ) : showBehaviorTherapyForms ? (
                                selectedBehaviorTherapyForm ? (
                                    <BehaviorTherapyForm
                                        formId={selectedBehaviorTherapyForm}
                                        onBack={() => setSelectedBehaviorTherapyForm(null)}
                                    />
                                ) : (
                                    <BehaviorTherapyFormsList
                                        onSelectForm={(formId) => setSelectedBehaviorTherapyForm(formId)}
                                        onBack={handleBackFromBehaviorTherapyForms}
                                    />
                                )
                            ) : (
                                <QuestionnaireSelector
                                    onSelect={handleSelectQuestionnaire}
                                    preSelectedType={preSelectedType}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="parent-intake" className="space-y-4">
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
                    </Tabs>
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
                                            <AvatarImage src={message.from === user?.uid ? 'https://picsum.photos/seed/avatar1/100/100' : 'https://picsum.photos/seed/avatar2/100/100'} />
                                            <AvatarFallback>{message.from === user?.uid ? 'ME' : 'P'}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold">{message.from === user?.uid ? "You" : `Parent (${message.from})`}</p>
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
