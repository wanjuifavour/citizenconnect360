"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { createPoll } from "@/services/api"
import { useLoading } from "@/app/ClientLayout"

export default function CreatePollPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { isLoading, setIsLoading } = useLoading()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [options, setOptions] = useState(["", ""])
    const [deadlineDate, setDeadlineDate] = useState("")
    const [allowMultipleSelections, setAllowMultipleSelections] = useState(false)

    // Redirect to login if not authenticated
    if (!user) {
        typeof window !== 'undefined' && router.push('/login')
        return null
    }

    const handleAddOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""])
        } else {
            toast.error("Maximum 10 options allowed")
        }
    }

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index)
            setOptions(newOptions)
        } else {
            toast.error("Minimum 2 options required")
        }
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Filter out empty options
        const filteredOptions = options.filter(option => option.trim() !== "")
        
        if (filteredOptions.length < 2) {
            toast.error("At least 2 non-empty options are required")
            return
        }

        try {
            setIsLoading(true)
            
            const pollData = {
                title,
                description,
                category,
                options: filteredOptions,
                createdBy: Number(user.id),
                deadline: deadlineDate || null,
                allowMultipleSelections
            }
            
            await createPoll(pollData)
            
            toast.success(
                "Poll Created", {
                description: "Your poll has been successfully created.",
            })
            router.push('/polls')
        } catch (error) {
            console.error('Error creating poll:', error)
            toast.error(
                "Error", {
                description: "Failed to create poll. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }
    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Create New Opinion Poll</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div>
                    <Label htmlFor="title">Poll Title</Label>
                    <Input 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                    />
                </div>
                
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                    />
                </div>
                
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger id="category">
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
                    <Label htmlFor="deadline">Poll Deadline (Optional)</Label>
                    <Input 
                        id="deadline" 
                        type="date" 
                        min={today}
                        value={deadlineDate} 
                        onChange={(e) => setDeadlineDate(e.target.value)} 
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                        Leave blank if the poll has no deadline
                    </p>
                </div>
                
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="allowMultiple" 
                        checked={allowMultipleSelections}
                        onCheckedChange={(checked) => setAllowMultipleSelections(checked as boolean)} 
                    />
                    <Label htmlFor="allowMultiple">Allow users to select multiple options</Label>
                </div>
                
                <div>
                    <Label className="mb-2 block">Poll Options</Label>
                    {options.map((option, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <Input
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                                required
                            />
                            {options.length > 2 && (
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
                    
                    {options.length < 10 && (
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
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Poll"}
                </Button>
            </form>
        </div>
    )
}