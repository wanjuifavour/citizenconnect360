"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockProjects = [
    { id: 1, name: "Project 1" },
    { id: 2, name: "Project 2" },
    { id: 3, name: "Project 3" },
    { id: 4, name: "Project 4" },
    { id: 5, name: "Project 5" },
    { id: 6, name: "Project 6" },
]

export default function ProjectsChatPage() {
    const [selectedProject, setSelectedProject] = useState("")
    const [query, setQuery] = useState("")
    const [response, setResponse] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement AI query logic for projects
        setResponse(`This is a mock response about ${selectedProject} for the query: "${query}"`)
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Understand Projects</h1>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Ask about Government Projects</CardTitle>
                    <CardDescription>
                        Select a project and ask questions to better understand its goals, progress, and impact.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockProjects.map((project) => (
                                    <SelectItem key={project.id} value={project.name}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Ask a question about the selected project..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Button type="submit">Ask AI</Button>
                    </form>
                </CardContent>
            </Card>
            {response && (
                <Card>
                    <CardHeader>
                        <CardTitle>AI Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{response}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}