"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useLoading } from "@/app/ClientLayout"
import { getPolls, getPollById, getPollStatistics, updatePoll, deletePoll } from "@/services/api"

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

interface PollStatistics {
    totalParticipants: number;
    optionVotes: Array<{
        optionIndex: number;
        voteCount: number;
    }>;
}

export default function PollManagement() {
    const [polls, setPolls] = useState<Poll[]>([])
    const { isLoading, setIsLoading } = useLoading()
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
    const [pollStats, setPollStats] = useState<PollStatistics | null>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editablePoll, setEditablePoll] = useState<{
        title: string;
        description: string;
        category: string;
        status: string;
        deadline: string | null;
        allowMultipleSelections: boolean;
        options: string[];
    }>({
        title: "",
        description: "",
        category: "",
        status: "unverified",
        deadline: null,
        allowMultipleSelections: false,
        options: []
    })
    
    useEffect(() => {
        fetchPolls()
    }, [])
    
    const fetchPolls = async () => {
        setIsLoading(true)
        try {
            const data = await getPolls()
            setPolls(data)
        } catch (error) {
            console.error("Error fetching polls:", error)
            toast.error("Failed to load polls")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleDeletePoll = async (pollId: number) => {
        if (!confirm("Are you sure you want to delete this poll?")) return
        
        setIsLoading(true)
        try {
            await deletePoll(pollId)
            toast.success("Poll deleted successfully")
            fetchPolls()
            setShowDetailsDialog(false)
            setShowEditDialog(false)
        } catch (error) {
            console.error("Error deleting poll:", error)
            toast.error("Failed to delete poll")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleUpdatePollStatus = async (pollId: number, newStatus: string) => {
        setIsLoading(true)
        try {
            const poll = await getPollById(pollId)
            await updatePoll(pollId, { ...poll, status: newStatus })
            toast.success(`Poll status updated to ${newStatus}`)
            fetchPolls()
            
            // Update local selected poll state
            if (selectedPoll && selectedPoll.id === pollId) {
                setSelectedPoll({...selectedPoll, status: newStatus})
            }
        } catch (error) {
            console.error("Error updating poll:", error)
            toast.error("Failed to update poll status")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleRowClick = async (poll: Poll) => {
        setSelectedPoll(poll)
        setShowDetailsDialog(true)
        
        // Fetch statistics when poll details are opened
        try {
            const stats = await getPollStatistics(poll.id)
            setPollStats(stats)
        } catch (error) {
            console.error("Error fetching poll statistics:", error)
            setPollStats(null)
        }
    }

    const openEditDialog = (poll: Poll) => {
        setSelectedPoll(poll)
        setEditablePoll({
            title: poll.title,
            description: poll.description,
            category: poll.category,
            status: poll.status,
            deadline: poll.deadline,
            allowMultipleSelections: poll.allowMultipleSelections,
            options: [...poll.options]
        })
        setShowEditDialog(true)
        setShowDetailsDialog(false)
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...editablePoll.options]
        newOptions[index] = value
        setEditablePoll({ ...editablePoll, options: newOptions })
    }

    const handleAddOption = () => {
        if (editablePoll.options.length < 10) {
            setEditablePoll({ 
                ...editablePoll, 
                options: [...editablePoll.options, ""] 
            })
        } else {
            toast.error("Maximum 10 options allowed")
        }
    }

    const handleRemoveOption = (index: number) => {
        if (editablePoll.options.length > 2) {
            const newOptions = editablePoll.options.filter((_, i) => i !== index)
            setEditablePoll({ ...editablePoll, options: newOptions })
        } else {
            toast.error("Minimum 2 options required")
        }
    }

    const handleSavePollChanges = async () => {
        if (!selectedPoll) return
        
        // Validate inputs
        if (!editablePoll.title.trim()) {
            toast.error("Title is required")
            return
        }
        
        if (!editablePoll.description.trim()) {
            toast.error("Description is required")
            return
        }
        
        if (!editablePoll.category) {
            toast.error("Category is required")
            return
        }

        const filteredOptions = editablePoll.options.filter(option => option.trim() !== "")
        if (filteredOptions.length < 2) {
            toast.error("At least 2 non-empty options are required")
            return
        }
        
        setIsLoading(true)
        try {
            await updatePoll(selectedPoll.id, {
                ...editablePoll,
                options: filteredOptions
            })
            toast.success("Poll updated successfully")
            fetchPolls()
            setShowEditDialog(false)
        } catch (error) {
            console.error("Error updating poll:", error)
            toast.error("Failed to update poll")
        } finally {
            setIsLoading(false)
        }
    }
    
    // Format deadline date for display
    const formatDate = (date: string | null) => {
        if (!date) return "No deadline"
        return new Date(date).toLocaleDateString()
    }

    // Format date for input field
    const formatDateForInput = (date: string | null) => {
        if (!date) return ""
        return new Date(date).toISOString().split('T')[0]
    }
    
    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch(status) {
            case 'open':
                return 'bg-green-100 text-green-800'
            case 'unverified':
                return 'bg-yellow-100 text-yellow-800'
            case 'suspended':
                return 'bg-orange-100 text-orange-800'
            case 'closed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }
    
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Poll Management</h2>
            
            {isLoading ? (
                <p>Loading polls...</p>
            ) : polls.length > 0 ? (
                <Table className="cursor-pointer">
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
                        {polls.map((poll) => (
                            <TableRow 
                                key={poll.id}
                                onClick={() => handleRowClick(poll)}
                                className="hover:bg-muted/50"
                            >
                                <TableCell>{poll.title}</TableCell>
                                <TableCell>{poll.category}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(poll.status)}`}>
                                        {poll.status}
                                    </span>
                                </TableCell>
                                <TableCell>{formatDate(poll.deadline)}</TableCell>
                                <TableCell>{poll.participantCount}</TableCell>
                                <TableCell className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                    <Button 
                                        size="sm"
                                        variant="outline" 
                                        onClick={() => openEditDialog(poll)}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleDeletePoll(poll.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No polls found.</p>
            )}

            {/* Poll Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Poll Details</DialogTitle>
                    </DialogHeader>
                    {selectedPoll && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">{selectedPoll.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedPoll.status)}`}>
                                        {selectedPoll.status}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {selectedPoll.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="mt-1">{selectedPoll.description}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium">Options</h4>
                                <ul className="list-disc pl-5 mt-1">
                                    {selectedPoll.options.map((option, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{option}</span>
                                            {pollStats && (
                                                <span className="text-sm">
                                                    {pollStats.optionVotes.find(v => v.optionIndex === index)?.voteCount || 0} votes
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium">Details</h4>
                                    <p className="mt-1">Created by: User ID {selectedPoll.createdBy}</p>
                                    <p>Participants: {selectedPoll.participantCount}</p>
                                    <p>Multiple selections: {selectedPoll.allowMultipleSelections ? "Yes" : "No"}</p>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium">Dates</h4>
                                    <p className="mt-1">Created: {formatDate(selectedPoll.createdAt)}</p>
                                    <p>Updated: {formatDate(selectedPoll.updatedAt)}</p>
                                    <p>Deadline: {formatDate(selectedPoll.deadline)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Change Status</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPoll.status !== 'open' && (
                                        <Button 
                                            size="sm"
                                            onClick={() => handleUpdatePollStatus(selectedPoll.id, 'open')}
                                        >
                                            Open Poll
                                        </Button>
                                    )}
                                    
                                    {selectedPoll.status !== 'closed' && (
                                        <Button 
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleUpdatePollStatus(selectedPoll.id, 'closed')}
                                        >
                                            Close Poll
                                        </Button>
                                    )}
                                    
                                    {selectedPoll.status !== 'suspended' && (
                                        <Button 
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleUpdatePollStatus(selectedPoll.id, 'suspended')}
                                        >
                                            Suspend Poll
                                        </Button>
                                    )}
                                    
                                    {selectedPoll.status !== 'unverified' && (
                                        <Button 
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdatePollStatus(selectedPoll.id, 'unverified')}
                                        >
                                            Mark Unverified
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <Button 
                                    onClick={() => openEditDialog(selectedPoll)}
                                >
                                    Edit Poll
                                </Button>
                                
                                <Button 
                                    variant="destructive" 
                                    onClick={() => handleDeletePoll(selectedPoll.id)}
                                >
                                    Delete Poll
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Poll Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Poll</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit-title">Poll Title</Label>
                            <Input 
                                id="edit-title" 
                                value={editablePoll.title} 
                                onChange={(e) => setEditablePoll({...editablePoll, title: e.target.value})} 
                                required 
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea 
                                id="edit-description" 
                                value={editablePoll.description} 
                                onChange={(e) => setEditablePoll({...editablePoll, description: e.target.value})} 
                                required 
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="edit-category">Category</Label>
                            <Select 
                                value={editablePoll.category} 
                                onValueChange={(value) => setEditablePoll({...editablePoll, category: value})}
                            >
                                <SelectTrigger id="edit-category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Finance">Finance</SelectItem>
                                    <SelectItem value="Urban Planning">Urban Planning</SelectItem>
                                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Environment">Environment</SelectItem>
                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="edit-status">Status</Label>
                            <Select 
                                value={editablePoll.status} 
                                onValueChange={(value) => setEditablePoll({...editablePoll, status: value})}
                            >
                                <SelectTrigger id="edit-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unverified">Unverified</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="edit-deadline">Poll Deadline (Optional)</Label>
                            <Input 
                                id="edit-deadline" 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                value={formatDateForInput(editablePoll.deadline)} 
                                onChange={(e) => setEditablePoll({...editablePoll, deadline: e.target.value || null})} 
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Leave blank if the poll has no deadline
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="edit-allowMultiple" 
                                checked={editablePoll.allowMultipleSelections}
                                onCheckedChange={(checked) => setEditablePoll({...editablePoll, allowMultipleSelections: !!checked})} 
                            />
                            <Label htmlFor="edit-allowMultiple">Allow users to select multiple options</Label>
                        </div>
                        
                        <div>
                            <Label className="mb-2 block">Poll Options</Label>
                            {editablePoll.options.map((option, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        className="flex-1"
                                        required
                                    />
                                    {editablePoll.options.length > 2 && (
                                        <Button 
                                            type="button" 
                                            variant="destructive" 
                                            size="icon"
                                            onClick={() => handleRemoveOption(index)}
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            ))}
                            
                            {editablePoll.options.length < 10 && (
                                <Button 
                                    type="button" 
                                    onClick={handleAddOption} 
                                    className="mt-2" 
                                    variant="outline"
                                >
                                    Add Option
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePollChanges}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}