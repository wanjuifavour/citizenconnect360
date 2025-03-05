"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchAIResponse, getBillsList } from "@/services/api"
import { Bill } from "@/types/types"
import { toast } from "sonner"
import { Loader2, Send, User, Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

const mockBills = [
    { id: 1, name: "ICT Practitioners bill", filename: "ICT_Bill_2024.pdf" },
    { id: 2, name: "Public Finance Management Bill", filename: "TheFinanceBill_2024.pdf" },
    { id: 3, name: "Test File", filename: "citizenConnect.pdf" },
]

interface Message {
    id: string;
    type: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

export default function BillsChatPage() {
    const [bills, setBills] = useState<Bill[]>(mockBills);
    const [selectedBill, setSelectedBill] = useState("")
    const [query, setQuery] = useState("")
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingBills, setIsFetchingBills] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

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
            } finally {
                setIsFetchingBills(false);
            }
        }

        loadBills();
    }, []);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add welcome message when a bill is selected
    useEffect(() => {
        if (selectedBill && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    type: 'bot',
                    text: `Hi there I'm an AI powered chatbot to help you answer any questions you might have about the ${selectedBill}. What would you like to know?`,
                    timestamp: new Date()
                }
            ]);
        }
    }, [selectedBill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBill || !query) {
            toast.error("Please select a bill and ask a question.");
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: query,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setQuery("");

        try {
            const response = await fetchAIResponse(selectedBill, query);

            // Check if response has fromCache information
            const fromCache = response.fromCache ? true : false;

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                text: fromCache
                    ? `${response.response}\n\n_(Response from cache)_`
                    : response.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error: any) {
            console.error("Error getting AI response:", error);

            let errorMessage = "Sorry, there was an error processing your request.";
            if (error.response?.status === 429) {
                errorMessage = "The bill document is too large to process in its entirety. Please try asking a more specific question.";
            }

            const errorBotMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                text: errorMessage,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorBotMessage]);
            toast.error("Error processing request");
        } finally {
            setIsLoading(false);
        }
    }

    const handleBillChange = (value: string) => {
        setSelectedBill(value);
        // Clear messages when changing bills
        setMessages([]);
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Understand Bills</h1>
            <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-3">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Select a Bill</CardTitle>
                            <CardDescription>
                                Choose a government bill to discuss
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select
                                value={selectedBill}
                                onValueChange={handleBillChange}
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

                            {selectedBill && (
                                <div className="pt-4 space-y-4">
                                    <h3 className="font-medium">Suggested Questions</h3>
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
                                        <li>
                                            <button
                                                onClick={() => setQuery("How does this bill affect citizens?")}
                                                className="text-blue-600 hover:underline text-left w-full"
                                            >
                                                How does this bill affect citizens?
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => setQuery("What are the penalties for non-compliance?")}
                                                className="text-blue-600 hover:underline text-left w-full"
                                            >
                                                What are the penalties for non-compliance?
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-9">
                    <Card className="h-[80vh] flex flex-col">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center">
                                <Bot className="h-5 w-5 mr-2" />
                                Bills Assistant
                            </CardTitle>
                            <CardDescription>
                                Ask questions about legislation and get AI-powered answers
                            </CardDescription>
                        </CardHeader>

                        <ScrollArea className="flex-grow p-4" ref={chatContainerRef}>
                            {selectedBill ? (
                                messages.length > 0 ? (
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`flex gap-3 max-w-[80%] ${message.type === 'user'
                                                        ? 'flex-row-reverse'
                                                        : 'flex-row'
                                                        }`}
                                                >
                                                    <Avatar className={`h-8 w-8 ${message.type === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        <AvatarFallback>
                                                            {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div
                                                        className={`rounded-lg p-3 ${message.type === 'user'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted'
                                                            }`}
                                                    >
                                                        <p className="whitespace-pre-line">{message.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">
                                        <p>Ask a question about {selectedBill}</p>
                                    </div>
                                )
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <p>Select a bill to start chatting</p>
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-4 border-t mt-auto">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input
                                    placeholder={selectedBill ? "Type your question..." : "Select a bill first"}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={isLoading || !selectedBill}
                                    className="flex-grow"
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || !selectedBill || !query}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Send</span>
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}