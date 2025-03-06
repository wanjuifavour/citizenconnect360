"use client"

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { useLoading } from "@/app/ClientLayout"
import { getPolls, getPollById, voteOnPoll, getUserVotes } from "@/services/api"

interface Poll {
    id: number;
    title: string;
    description: string;
    category: string;
    options: string[];
    status: string;
    createdBy: number;
    participantCount: number;
    deadline: string | null;
    allowMultipleSelections: boolean;
    createdAt: string;
    updatedAt: string;
}

interface UserVoteData {
    hasVoted: boolean;
    selectedOptions: number[];
}

export default function PollsPage() {
    const { user } = useAuth()
    const { isLoading, setIsLoading } = useLoading()
    const [polls, setPolls] = useState<Poll[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
    const [userVotes, setUserVotes] = useState<UserVoteData>({ hasVoted: false, selectedOptions: [] })
    const [votingOptions, setVotingOptions] = useState<number[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isVoting, setIsVoting] = useState(false)

    useEffect(() => {
        const fetchPolls = async () => {
            setIsLoading(true)
            try {
                const data = await getPolls()
                setPolls(data)
            } catch (error) {
                console.error('Error fetching polls:', error)
                toast.error("Failed to load polls")
            } finally {
                setIsLoading(false)
            }
        }

        fetchPolls()
    }, [setIsLoading])

    const handlePollSelect = async (poll: Poll) => {
        setSelectedPoll(poll)
        setVotingOptions([])
        setIsModalOpen(true)
        
        if (user) {
            try {
                const voteData = await getUserVotes(poll.id, parseInt(user.id))
                setUserVotes(voteData)
                
                if (voteData.hasVoted) {
                    setVotingOptions(voteData.selectedOptions)
                }
            } catch (error) {
                console.error('Error fetching user votes:', error)
                setUserVotes({ hasVoted: false, selectedOptions: [] })
            }
        }
    }

    const handleVoteChange = (index: number) => {
        if (selectedPoll?.allowMultipleSelections) {
            // For multi-select polls
            if (votingOptions.includes(index)) {
                setVotingOptions(votingOptions.filter(i => i !== index))
            } else {
                setVotingOptions([...votingOptions, index])
            }
        } else {
            // For single-select polls
            setVotingOptions([index])
        }
    }

    const handleVoteSubmit = async () => {
        if (!user) {
            toast.error("Please log in to vote")
            return
        }

        if (!selectedPoll) return
        
        if (votingOptions.length === 0) {
            toast.error("Please select at least one option")
            return
        }

        setIsVoting(true)
        
        try {
            // Vote on each selected option
            for (const optionIndex of votingOptions) {
                await voteOnPoll(selectedPoll.id, {
                    userId: parseInt(user.id),
                    optionIndex
                })
            }
            
            toast.success("Vote submitted successfully")
            
            // Update user votes
            const voteData = await getUserVotes(selectedPoll.id, parseInt(user.id))
            setUserVotes(voteData)
            
            // Refresh poll data to update participant count
            const updatedPoll = await getPollById(selectedPoll.id)
            setSelectedPoll(updatedPoll)
            
            // Update the poll in the polls list
            setPolls(polls.map(p => p.id === selectedPoll.id ? updatedPoll : p))
        } catch (error: any) {
            console.error('Error submitting vote:', error)
            toast.error(error.message || "Failed to submit vote")
        } finally {
            setIsVoting(false)
        }
    }

    const filteredPolls = polls.filter(
        (poll) =>
            poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            poll.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Format deadline date for display
    const formatDeadline = (deadline: string | null) => {
        if (!deadline) return "No deadline"
        return new Date(deadline).toLocaleDateString()
    }

    // Check if poll is still open
    const isPollOpen = (poll: Poll) => {
        if (poll.status !== 'open') return false
        if (!poll.deadline) return true
        return new Date(poll.deadline) > new Date()
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">All Polls</h1>
                {user && (
                    <Link href="/polls/create">
                        <Button>Create Opinion Poll</Button>
                    </Link>
                )}
            </div>
            
            <Input
                placeholder="Search for polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
            />
            
            {filteredPolls.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPolls.map((poll) => (
                            <TableRow key={poll.id}>
                                <TableCell>{poll.title}</TableCell>
                                <TableCell>{poll.category}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${isPollOpen(poll) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {isPollOpen(poll) ? 'Open' : 'Closed'}
                                    </span>
                                </TableCell>
                                <TableCell>{formatDeadline(poll.deadline)}</TableCell>
                                <TableCell>{poll.participantCount}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handlePollSelect(poll)}
                                    >
                                        View More
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-center py-4">No polls found matching your search.</p>
            )}
            
            <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
                {selectedPoll && (
                    <ModalContent className="max-w-lg">
                        <ModalHeader>
                            <ModalTitle>{selectedPoll.title}</ModalTitle>
                            <ModalDescription>Poll Details</ModalDescription>
                        </ModalHeader>
                        
                        <div className="py-4">
                            <p className="mb-2">
                                <strong>Category:</strong> {selectedPoll.category}
                            </p>
                            <p className="mb-2">
                                <strong>Status:</strong>{" "}
                                <span className={`px-2 py-1 rounded-full text-xs ${isPollOpen(selectedPoll) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {isPollOpen(selectedPoll) ? 'Open' : 'Closed'}
                                </span>
                            </p>
                            <p className="mb-2">
                                <strong>Deadline:</strong> {formatDeadline(selectedPoll.deadline)}
                            </p>
                            <p className="mb-2">
                                <strong>Participants:</strong> {selectedPoll.participantCount}
                            </p>
                            <p className="mb-4">
                                <strong>Description:</strong> {selectedPoll.description}
                            </p>
                            
                            <div className="mb-4">
                                <strong>Options:</strong>
                                {user ? (
                                    isPollOpen(selectedPoll) ? (
                                        userVotes.hasVoted ? (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-green-600 mb-2">
                                                    You've already voted on this poll. Your selection:
                                                </p>
                                                <ul className="list-disc pl-5">
                                                    {userVotes.selectedOptions.map((optionIndex) => (
                                                        <li key={optionIndex}>
                                                            {selectedPoll.options[optionIndex]}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : selectedPoll.allowMultipleSelections ? (
                                            <div className="mt-2 space-y-2">
                                                {selectedPoll.options.map((option, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`option-${index}`}
                                                            checked={votingOptions.includes(index)}
                                                            onCheckedChange={() => handleVoteChange(index)}
                                                        />
                                                        <Label htmlFor={`option-${index}`}>
                                                            {option}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <RadioGroup 
                                                value={votingOptions[0]?.toString()} 
                                                className="mt-2 space-y-2"
                                                onValueChange={(value) => handleVoteChange(parseInt(value))}
                                            >
                                                {selectedPoll.options.map((option, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                                        <Label htmlFor={`option-${index}`}>
                                                            {option}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        )
                                    ) : (
                                        <ul className="list-disc pl-5 mt-2">
                                            {selectedPoll.options.map((option, index) => (
                                                <li key={index}>{option}</li>
                                            ))}
                                        </ul>
                                    )
                                ) : (
                                    <div className="mt-2">
                                        <ul className="list-disc pl-5">
                                            {selectedPoll.options.map((option, index) => (
                                                <li key={index}>{option}</li>
                                            ))}
                                        </ul>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Please log in to vote on this poll
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <ModalFooter>
                            {user && isPollOpen(selectedPoll) && !userVotes.hasVoted && (
                                <Button 
                                    onClick={handleVoteSubmit} 
                                    disabled={isVoting || votingOptions.length === 0}
                                    className="mr-2"
                                >
                                    {isVoting ? "Submitting..." : "Submit Vote"}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                )}
            </Modal>
        </div>
    )
}