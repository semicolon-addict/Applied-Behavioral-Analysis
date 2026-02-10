"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { analyticsData } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OverviewChart() {
  return (
     <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Average Domain Scores</CardTitle>
        <CardDescription>
          Average scores per domain across all children.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analyticsData.averageScores}>
                <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                    }}
                />
                <Legend />
                <Bar dataKey="ABLLS-R" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AFLLS" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="DAYC-2" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
