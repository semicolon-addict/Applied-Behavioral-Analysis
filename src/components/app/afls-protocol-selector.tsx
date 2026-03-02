///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: AFLS protocol selection with tabbed sub-protocol navigation
// Outcome: When AFLS is selected, shows protocol tabs (Basic Living, Home, Community, School) before entering questionnaire flow
// Short Description: AFLS protocol tab selector with domain grouping by protocol
/////////////////////////////////////////////////////////////

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Home, Users, GraduationCap, Layers, ChevronLeft, Loader2 } from 'lucide-react';
import { AssessmentQuestionnaire, QuestionnaireDomain } from '@/types';
import { getTemplate } from '@/lib/questionnaire-api';

export interface AFLSProtocol {
    id: string;
    name: string;
    shortName: string;
    icon: React.ElementType;
    color: string;
    domainPrefix: string;
    description: string;
}

export const AFLS_PROTOCOLS: AFLSProtocol[] = [
    {
        id: 'basic-living',
        name: 'Basic Living Skills',
        shortName: 'Basic Living',
        icon: BookOpen,
        color: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
        domainPrefix: 'Basic Living Skills',
        description: 'Self management, communication, toileting, dressing, grooming, health & safety, and nutrition skills.',
    },
    {
        id: 'home',
        name: 'Home Skills',
        shortName: 'Home',
        icon: Home,
        color: 'border-l-green-500 bg-green-50 dark:bg-green-950/20',
        domainPrefix: 'Home Skills',
        description: 'Meal handling, clothing & laundry, household chores, domestic skills, home maintenance, and kitchen skills.',
    },
    {
        id: 'community',
        name: 'Community Participation Skills',
        shortName: 'Community',
        icon: Users,
        color: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20',
        domainPrefix: 'Community Participation Skills',
        description: 'Mobility, community knowledge, emergency preparedness, money, phone, shopping, and transportation skills.',
    },
    {
        id: 'school',
        name: 'School Skills',
        shortName: 'School',
        icon: GraduationCap,
        color: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20',
        domainPrefix: 'School Skills',
        description: 'Classroom materials, school skills, math, technology, reading, comprehension, and academic activities.',
    },
];

interface AFLSProtocolSelectorProps {
    onSelectProtocol: (protocol: AFLSProtocol | null, filteredDomains: QuestionnaireDomain[] | null) => void;
    onBack: () => void;
}

export function AFLSProtocolSelector({ onSelectProtocol, onBack }: AFLSProtocolSelectorProps) {
    const [template, setTemplate] = useState<AssessmentQuestionnaire | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('overview');

    useEffect(() => {
        async function loadTemplate() {
            try {
                setLoading(true);
                const tmpl = await getTemplate('AFLLS');
                setTemplate(tmpl);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load AFLS template');
            } finally {
                setLoading(false);
            }
        }
        loadTemplate();
    }, []);

    const getProtocolDomains = (protocol: AFLSProtocol): QuestionnaireDomain[] => {
        if (!template) return [];
        return template.domains.filter(d => d.name.startsWith(protocol.domainPrefix));
    };

    const getProtocolQuestionCount = (protocol: AFLSProtocol): number => {
        return getProtocolDomains(protocol).reduce((sum, d) => sum + d.questions.length, 0);
    };

    const handleStartProtocol = (protocol: AFLSProtocol) => {
        const domains = getProtocolDomains(protocol);
        onSelectProtocol(protocol, domains);
    };

    const handleStartAll = () => {
        onSelectProtocol(null, null); // null means all protocols
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading AFLS protocols...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading AFLS</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={onBack}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const totalQuestions = template?.domains.reduce((sum, d) => sum + d.questions.length, 0) || 0;
    const totalDomains = template?.domains.length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">AFLS Assessment</h2>
                        <p className="text-sm text-muted-foreground">
                            Assessment of Functional Living Skills — {totalDomains} domains · {totalQuestions} questions
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="text-base px-3 py-1">AFLS</Badge>
            </div>

            {/* Protocol Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview" className="gap-1">
                        <Layers className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    {AFLS_PROTOCOLS.map(protocol => {
                        const Icon = protocol.icon;
                        return (
                            <TabsTrigger key={protocol.id} value={protocol.id} className="gap-1">
                                <Icon className="h-4 w-4" />
                                {protocol.shortName}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select a Protocol to Begin</CardTitle>
                            <CardDescription>
                                AFLS is divided into 4 protocols. You can complete each protocol independently or start all at once.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {AFLS_PROTOCOLS.map(protocol => {
                                    const Icon = protocol.icon;
                                    const questionCount = getProtocolQuestionCount(protocol);
                                    const domainCount = getProtocolDomains(protocol).length;

                                    return (
                                        <Card
                                            key={protocol.id}
                                            className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${protocol.color} hover:scale-[1.02]`}
                                            onClick={() => handleStartProtocol(protocol)}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <Icon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <CardTitle className="text-base">{protocol.name}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {protocol.description}
                                                </p>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {domainCount} domains · {questionCount} questions
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

                            {/* Start All button */}
                            <div className="mt-6 flex justify-center">
                                <Button size="lg" onClick={handleStartAll} className="gap-2">
                                    <Layers className="h-5 w-5" />
                                    Start All Protocols ({totalQuestions} questions)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Individual Protocol Tabs */}
                {AFLS_PROTOCOLS.map(protocol => {
                    const domains = getProtocolDomains(protocol);
                    const questionCount = domains.reduce((sum, d) => sum + d.questions.length, 0);
                    const Icon = protocol.icon;

                    return (
                        <TabsContent key={protocol.id} value={protocol.id} className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle>{protocol.name}</CardTitle>
                                                <CardDescription>{protocol.description}</CardDescription>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleStartProtocol(protocol)} className="gap-2">
                                            Start Protocol →
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground border-b pb-2">
                                            <span>Domain</span>
                                            <span>Questions</span>
                                        </div>
                                        {domains.map((domain, idx) => {
                                            // Strip the protocol prefix from domain name for cleaner display
                                            const displayName = domain.name.replace(`${protocol.domainPrefix} - `, '');
                                            return (
                                                <div
                                                    key={domain.id}
                                                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-muted-foreground w-6">
                                                            {idx + 1}.
                                                        </span>
                                                        <span className="text-sm font-medium">{displayName}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {domain.questions.length}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                        <div className="flex items-center justify-between pt-2 border-t font-medium">
                                            <span>Total</span>
                                            <Badge variant="default">{questionCount} questions</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
