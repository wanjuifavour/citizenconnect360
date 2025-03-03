"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { reportIncident } from "@/services/api"

export default function ReportIncidentPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [media, setMedia] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Redirect to login if not authenticated
    if (!user) {
        typeof window !== 'undefined' && router.push('/login')
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            setIsLoading(true)
            const formData = new FormData()
            formData.append('title', title)
            formData.append('description', description)
            formData.append('category', category)
            
            if (user && user.id) {
                formData.append('reportedBy', user.id.toString())
            }
            
            if (media) {
                formData.append('media', media)
            }
            
            await reportIncident(formData)

            toast.success(
                "Incident Reported", {
                description: "Your incident has been successfully reported.",
            })
            
            setTitle("")
            setDescription("")
            setCategory("")
            setMedia(null)
            router.push('/incidents')
            
        } catch (error) {
            console.error('Error reporting incident:', error)
            toast.error(
                "Error", {
                description: "Failed to report incident. Please try again.",
            })
        } finally {
            setIsLoading(false)
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
                    <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Corruption">Corruption</SelectItem>
                            <SelectItem value="Crime">Crime</SelectItem>
                            <SelectItem value="Human Rights Violation">Human Rights Violation</SelectItem>
                            <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                            <SelectItem value="Insecurity">Insecurity</SelectItem>
                            <SelectItem value="Power Outage">Power Outage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="media">Media Upload (Optional)</Label>
                    <Input id="media" type="file" onChange={(e) => setMedia(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Report"}
                </Button>
            </form>
        </div>
    )
}