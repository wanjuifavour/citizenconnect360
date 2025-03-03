"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockBills = [
    { id: 1, name: "Bill 1" },
    { id: 2, name: "Bill 2" },
    { id: 3, name: "Bill 3" },
    { id: 4, name: "Bill 4" },
    { id: 5, name: "Bill 5" },
    { id: 6, name: "Bill 6" },
]

export default function BillsChatPage() {
    const [selectedBill, setSelectedBill] = useState("")
    const [query, setQuery] = useState("")
    const [response, setResponse] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement AI query logic for bills
        setResponse(`This is a mock response about ${selectedBill} for the query: "${query}"`)
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Understand Bills</h1>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Ask about Government Bills</CardTitle>
                    <CardDescription>
                        Select a bill and ask questions to better understand its contents and implications.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select value={selectedBill} onValueChange={setSelectedBill}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a bill" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockBills.map((bill) => (
                                    <SelectItem key={bill.id} value={bill.name}>
                                        {bill.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Ask a question about the selected bill..."
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