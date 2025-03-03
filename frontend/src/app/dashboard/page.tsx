"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
    const [aiQuery, setAiQuery] = useState("")

    const handleAiQuery = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement AI query logic
        console.log("AI Query:", aiQuery)
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Bills</CardTitle>
                        <CardDescription>Active bills in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">25</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Polls</CardTitle>
                        <CardDescription>Ongoing public opinion polls</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">8</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Reported Incidents</CardTitle>
                        <CardDescription>Issues reported by citizens</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">42</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <Tabs defaultValue="bills">
                    <TabsList>
                        <TabsTrigger value="bills">Bills</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="incidents">Incidents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bills">
                        {/* TODO: Implement bills list */}
                        <p>Recent bills activity will be displayed here.</p>
                    </TabsContent>
                    <TabsContent value="projects">
                        {/* TODO: Implement projects list */}
                        <p>Recent projects activity will be displayed here.</p>
                    </TabsContent>
                    <TabsContent value="incidents">
                        {/* TODO: Implement incidents list */}
                        <p>Recent incidents activity will be displayed here.</p>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/bills/create">
                        <Button className="w-full">Create New Bill</Button>
                    </Link>
                    <Link href="/projects/create">
                        <Button className="w-full">Start New Project</Button>
                    </Link>
                    <Link href="/incidents/report">
                        <Button className="w-full">Report an Incident</Button>
                    </Link>
                </div>
            </div>

            {/* <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">AI Assistant</h2>
                <form onSubmit={handleAiQuery} className="flex gap-2">
                    <Input
                        placeholder="Ask questions about bills, projects, or incidents..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        className="flex-grow"
                    />
                    <Button type="submit">Ask AI</Button>
                </form>
            </div> */}

        </div>
    )
}