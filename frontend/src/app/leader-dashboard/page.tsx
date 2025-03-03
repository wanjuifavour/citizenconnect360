"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Mock data for the charts
const incidentData = [
    { name: "Infrastructure", count: 65 },
    { name: "Public Safety", count: 45 },
    { name: "Environment", count: 30 },
    { name: "Education", count: 25 },
    { name: "Healthcare", count: 20 },
]

const feedbackData = [
    { name: "Positive", count: 120 },
    { name: "Neutral", count: 80 },
    { name: "Negative", count: 40 },
]

export default function LeaderDashboardPage() {
    const [aiQuery, setAiQuery] = useState("")

    const handleAiQuery = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement AI query logic
        toast.success("AI Analysis Complete", {
            description: "The AI has processed your query and generated insights.",
        })
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Leader Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Incidents</CardTitle>
                        <CardDescription>Reported in the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">185</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Citizen Feedback</CardTitle>
                        <CardDescription>Submissions this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">240</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Polls</CardTitle>
                        <CardDescription>Currently running polls</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">8</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="incidents" className="mb-6">
                <TabsList>
                    <TabsTrigger value="incidents">Incidents Overview</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="incidents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Incidents by Category</CardTitle>
                            <CardDescription>Distribution of reported incidents in the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={incidentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="feedback">
                    <Card>
                        <CardHeader>
                            <CardTitle>Citizen Feedback Sentiment</CardTitle>
                            <CardDescription>Overview of citizen feedback sentiment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={feedbackData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Insights</CardTitle>
                    <CardDescription>Ask questions to gain deeper insights from citizen data</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAiQuery} className="space-y-4">
                        <div>
                            <Label htmlFor="ai-query">Your Question</Label>
                            <Input
                                id="ai-query"
                                placeholder="E.g., What are the top concerns in the education sector?"
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit">Generate Insights</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}