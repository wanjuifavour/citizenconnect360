"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"


export default function CreatePollPage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [options, setOptions] = useState(["", ""])

    const handleAddOption = () => {
        setOptions([...options, ""])
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement poll creation logic
        toast("Poll Created", {
            description: "Your poll has been successfully created.",
        })
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Create New Opinion Poll</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div>
                    <Label htmlFor="title">Poll Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="urban_planning">Urban Planning</SelectItem>
                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Poll Options</Label>
                    {options.map((option, index) => (
                        <Input
                            key={index}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="mt-2"
                            required
                        />
                    ))}
                    <Button type="button" onClick={handleAddOption} className="mt-2" variant="outline">
                        Add Option
                    </Button>
                </div>
                <Button type="submit">Create Poll</Button>
            </form>
        </div>
    )
}