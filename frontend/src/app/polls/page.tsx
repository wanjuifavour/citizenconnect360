"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalFooter,
    ModalTrigger,
} from "@/components/ui/modal"

const mockPolls = [
    {
        id: 1,
        title: "City Budget Allocation",
        category: "Finance",
        reactions: 150,
        description: "How should we allocate the city budget for the next fiscal year?",
        options: ["Infrastructure", "Education", "Healthcare", "Public Safety"],
        endDate: "2023-07-15",
    },
    {
        id: 2,
        title: "New Park Location",
        category: "Urban Planning",
        reactions: 89,
        description: "Where should we build the new city park?",
        options: ["Downtown", "Suburbs", "Near the river"],
        endDate: "2023-07-20",
    },
    {
        id: 3,
        title: "Public Transportation Improvement",
        category: "Infrastructure",
        reactions: 203,
        description: "Which aspect of public transportation needs the most improvement?",
        options: ["Bus routes", "Subway system", "Bike lanes"],
        endDate: "2023-07-25",
    },
]

export default function PollsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPoll, setSelectedPoll] = useState<(typeof mockPolls)[0] | null>(null)

    const filteredPolls = mockPolls.filter(
        (poll) =>
            poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            poll.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">All Polls</h1>
                <Link href="/polls/create">
                    <Button>Create Opinion Poll</Button>
                </Link>
            </div>
            <Input
                placeholder="Search for polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reactions</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPolls.map((poll) => (
                        <TableRow key={poll.id}>
                            <TableCell>{poll.title}</TableCell>
                            <TableCell>{poll.category}</TableCell>
                            <TableCell>{poll.reactions}</TableCell>
                            <TableCell>
                                <Modal>
                                    <ModalTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedPoll(poll)}>
                                            View More
                                        </Button>
                                    </ModalTrigger>
                                    <ModalContent>
                                        <ModalHeader>
                                            <ModalTitle>{selectedPoll?.title}</ModalTitle>
                                            <ModalDescription>Poll Details</ModalDescription>
                                        </ModalHeader>
                                        <div className="py-4">
                                            <p>
                                                <strong>Category:</strong> {selectedPoll?.category}
                                            </p>
                                            <p>
                                                <strong>Reactions:</strong> {selectedPoll?.reactions}
                                            </p>
                                            <p>
                                                <strong>End Date:</strong> {selectedPoll?.endDate}
                                            </p>
                                            <p>
                                                <strong>Description:</strong> {selectedPoll?.description}
                                            </p>
                                            <p>
                                                <strong>Options:</strong>
                                            </p>
                                            <ul className="list-disc pl-5">
                                                {selectedPoll?.options.map((option, index) => (
                                                    <li key={index}>{option}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <ModalFooter>
                                            <Button variant="outline">Close</Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}