
"use client"

import { User, Questionnaire } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewChart } from "./overview-chart";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Users, Activity, BarChart, FileQuestion } from "lucide-react";
import { QuestionnaireView } from "@/components/app/questionnaire-view";

export function AdminDashboardClient({ users, questionnaires }: { users: User[], questionnaires: Questionnaire[] }) {
    const totalUsers = users.length;
    const totalClinicians = users.filter(u => u.role === 'Clinician').length;
    const totalParents = users.filter(u => u.role === 'Parent').length;

    return (
        <>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        Download Reports
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">
                        <Activity className="mr-2 h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="users">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                    </TabsTrigger>
                     <TabsTrigger value="questionnaires">
                         <FileQuestion className="mr-2 h-4 w-4" />
                        Questionnaires
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                        <BarChart className="mr-2 h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers}</div>
                                <p className="text-xs text-muted-foreground">+2 since last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clinicians</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalClinicians}</div>
                                <p className="text-xs text-muted-foreground">+1 since last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Parents</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalParents}</div>
                                <p className="text-xs text-muted-foreground">+1 since last month</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                         <OverviewChart />
                    </div>
                </TabsContent>
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>View and manage all user accounts.</CardDescription>
                            </div>
                            <Button size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add User
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={columns} data={users} />
                        </CardContent>
                    </Card>
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
                 <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                                <CardTitle>Advanced Analytics</CardTitle>
                                <CardDescription>In-depth platform analytics will be displayed here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">More charts and graphs coming soon.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}
