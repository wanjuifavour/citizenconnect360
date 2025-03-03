"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"


export default function ReportIncidentPage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [media, setMedia] = useState<File | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('reportedBy', '1'); // Replace with actual user ID from context/state
            
            if (media) {
                formData.append('media', media);
            }
            
            const response = await fetch('http://localhost:YOUR_PORT/api/incidents', {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header, it will be set automatically with boundaries
                headers: {
                    // Include authorization if needed
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                toast.success(
                    "Incident Reported", {
                    description: "Your incident has been successfully reported.",
                });
                // Reset form or redirect
            } else {
                throw new Error('Failed to report incident');
            }
        } catch (error) {
            toast.error(
                "Error", {
                description: "Failed to report incident. Please try again.",
            });
            console.error(error);
        }
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Report an Incident</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div>
                    <Label htmlFor="title">Incident Title</Label>
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
                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="public_safety">Public Safety</SelectItem>
                            <SelectItem value="environment">Environment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="media">Media Upload</Label>
                    <Input id="media" type="file" onChange={(e) => setMedia(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit">Submit Report</Button>
            </form>
        </div>
    )
}