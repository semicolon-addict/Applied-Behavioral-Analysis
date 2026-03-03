///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: VB-MAPP protocol selection with tabbed navigation for Levels 1-3, Barriers, and Transitions
// Outcome: When VB-MAPP is selected, shows protocol tabs before entering questionnaire flow
// Short Description: VB-MAPP protocol tab selector with domain grouping by level/component
/////////////////////////////////////////////////////////////

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, Star, Zap, Award, ShieldAlert, ArrowRightLeft, Layers, ChevronLeft, Loader2 } from 'lucide-react';
import { AssessmentQuestionnaire, QuestionnaireDomain } from '@/types';
import { getTemplate } from '@/lib/questionnaire-api';

export interface VBMAPPProtocol {
    id: string;
    name: string;
    shortName: string;
    icon: React.ElementType;
    color: string;
    domainPrefix: string;
    description: string;
}

export const VBMAPP_PROTOCOLS: VBMAPPProtocol[] = [
    {
        id: 'level-1',
        name: 'Level 1 - Milestones (0-18 months)',
        shortName: 'Level 1',
        icon: Star,
        color: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
        domainPrefix: '[L1]',
        description: 'Mand, Tact, Listener, VP/MTS, Play, Social, Imitation, Echoic, and Vocal skills for developmental age 0-18 months.',
    },
    {
        id: 'level-2',
        name: 'Level 2 - Milestones (18-30 months)',
        shortName: 'Level 2',
        icon: Zap,
        color: 'border-l-green-500 bg-green-50 dark:bg-green-950/20',
        domainPrefix: '[L2]',
        description: 'Mand, Tact, Listener, VP/MTS, Play, Social, Imitation, Echoic, LRFFC, IV, Group, and Linguistics skills for developmental age 18-30 months.',
    },
    {
        id: 'level-3',
        name: 'Level 3 - Milestones (30-48 months)',
        shortName: 'Level 3',
        icon: Award,
        color: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20',
        domainPrefix: '[L3]',
        description: 'Mand, Tact, Listener, VP/MTS, Play, Social, LRFFC, IV, Group, Linguistics, Reading, Writing, and Math skills for developmental age 30-48 months.',
    },
    {
        id: 'barriers',
        name: 'Barriers Assessment',
        shortName: 'Barriers',
        icon: ShieldAlert,
        color: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
        domainPrefix: '[Barriers]',
        description: '24 barriers to learning and language acquisition, rated 0-4, identifying negative behaviors, instructional control issues, and other impediments.',
    },
    {
        id: 'transitions',
        name: 'Transition Assessment',
        shortName: 'Transitions',
        icon: ArrowRightLeft,
        color: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20',
        domainPrefix: '[Transitions]',
        description: '18 transition areas rated 1-5, assessing readiness for less restrictive educational settings.',
    },
];

interface VBMAPPProtocolSelectorProps {
    onSelectProtocol: (protocol: VBMAPPProtocol | null, filteredDomains: QuestionnaireDomain[] | null) => void;
    onBack: () => void;
}

export function VBMAPPProtocolSelector({ onSelectProtocol, onBack }: VBMAPPProtocolSelectorProps) {
    const [template, setTemplate] = useState<AssessmentQuestionnaire | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('overview');

    useEffect(() => {
        async function loadTemplate() {
            try {
                setLoading(true);
                const tmpl = await getTemplate('VB-MAPP');
                setTemplate(tmpl);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load VB-MAPP template');
            } finally {
                setLoading(false);
            }
        }
        loadTemplate();
    }, []);

    const getProtocolDomains = (protocol: VBMAPPProtocol): QuestionnaireDomain[] => {
        if (!template) return [];
        return template.domains.filter(d => d.name.startsWith(protocol.domainPrefix));
    };

    const getProtocolQuestionCount = (protocol: VBMAPPProtocol): number => {
        return getProtocolDomains(protocol).reduce((sum, d) => sum + d.questions.length, 0);
    };

    const handleStartProtocol = (protocol: VBMAPPProtocol) => {
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
                <span className="ml-2 text-muted-foreground">Loading VB-MAPP protocols...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading VB-MAPP</CardTitle>
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
                        <h2 className="text-2xl font-bold">VB-MAPP Assessment</h2>
                        <p className="text-sm text-muted-foreground">
                            Verbal Behavior Milestones Assessment and Placement Program - {totalDomains} domains | {totalQuestions} questions
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="text-base px-3 py-1">VB-MAPP</Badge>
            </div>

            {/* Protocol Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview" className="gap-1">
                        <Layers className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    {VBMAPP_PROTOCOLS.map(protocol => {
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
                            <CardTitle>Select a Component to Begin</CardTitle>
                            <CardDescription>
                                VB-MAPP contains 3 milestone levels plus Barriers and Transitions assessments. You can complete each component independently or start all at once.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {VBMAPP_PROTOCOLS.map(protocol => {
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
                                                        {domainCount} domains | {questionCount} questions
                                                    </span>
                                                    <Button variant="outline" size="sm">
                                                        Start {'->'}
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
                                    Start All Components ({totalQuestions} questions)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Individual Protocol Tabs */}
                {VBMAPP_PROTOCOLS.map(protocol => {
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
                                            Start Component {'->'}
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
                                            // Strip the level/component prefix from domain name for cleaner display
                                            const displayName = domain.name.replace(/^\[.*?\]\s*/, '');
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

