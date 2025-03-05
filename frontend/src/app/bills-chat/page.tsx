"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchAIResponse, getBillsList } from "@/services/api"
import { Bill } from "@/types/types"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const mockBills = [
    { id: 1, name: "ICT Practitioners bill", filename: "ICT_Bill_2024.pdf" },
    { id: 2, name: "Public Finance Management Bill", filename: "TheFinanceBill_2024.pdf" },
    { id: 3, name: "Test File", filename: "citizenConnect.pdf" },
]

export default function BillsChatPage() {
    const [bills, setBills] = useState<Bill[]>(mockBills);
    const [selectedBill, setSelectedBill] = useState("")
    const [query, setQuery] = useState("")
    const [response, setResponse] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingBills, setIsFetchingBills] = useState(true);
    const [chatHistory, setChatHistory] = useState<{ question: string, answer: string }[]>([]);

    useEffect(() => {
        async function loadBills() {
            try {
                const data = await getBillsList();
                if (data && data.bills) {
                    setBills(data.bills);
                }
            } catch (error) {
                console.error("Error loading bills:", error);
                toast.error("Failed to load bills");
                // Keep using the mockBills as fallback
            } finally {
                setIsFetchingBills(false);
            }
        }

        loadBills();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBill || !query) {
            setResponse("Please select a bill and ask a question.");
            return;
        }

        setIsLoading(true);
        setResponse("");

        try {
            const aiResponse = await fetchAIResponse(selectedBill, query);
            setResponse(aiResponse);

            // Add to chat history
            setChatHistory(prev => [...prev, {
                question: query,
                answer: aiResponse
            }]);

            // Clear query input
            setQuery("");
        } catch (error: any) {
            console.error("Error getting AI response:", error);
            if (error.response?.status === 429) {
                setResponse(
                    "The bill document is too large to process in its entirety. Please try asking a more specific question."
                );
            } else {
                setResponse("Sorry, there was an error processing your request.");
            }
            toast.error("Error processing request");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Understand Bills</h1>
            <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ask about Government Bills</CardTitle>
                            <CardDescription>
                                Select a bill and ask questions to better understand its contents and implications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Select
                                    value={selectedBill}
                                    onValueChange={setSelectedBill}
                                    disabled={isFetchingBills}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isFetchingBills ? "Loading bills..." : "Select a bill"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bills.map((bill) => (
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
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || !selectedBill || !query}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : "Ask AI"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {selectedBill && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Suggested Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={() => setQuery("What is the main purpose of this bill?")}
                                            className="text-blue-600 hover:underline text-left w-full"
                                        >
                                            What is the main purpose of this bill?
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => setQuery("When does this bill come into effect?")}
                                            className="text-blue-600 hover:underline text-left w-full"
                                        >
                                            When does this bill come into effect?
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => setQuery("What are the key provisions of this bill?")}
                                            className="text-blue-600 hover:underline text-left w-full"
                                        >
                                            What are the key provisions of this bill?
                                        </button>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="md:col-span-7">
                    {response && (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Response</CardTitle>
                            </CardHeader>
                            <CardContent className="prose max-w-none">
                                <p className="whitespace-pre-line">{response}</p>
                            </CardContent>
                        </Card>
                    )}

                    {chatHistory.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-3">Chat History</h2>
                            <div className="space-y-4">
                                {chatHistory.map((item, index) => (
                                    <Card key={index}>
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-sm font-medium">Question</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-2">
                                            <p>{item.question}</p>
                                        </CardContent>
                                        <CardHeader className="py-3 border-t">
                                            <CardTitle className="text-sm font-medium">Answer</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-2">
                                            <p className="whitespace-pre-line">{item.answer}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}