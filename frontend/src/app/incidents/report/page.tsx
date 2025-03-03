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
import { X } from "lucide-react"

export default function ReportIncidentPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [isLoading, setIsLoading] = useState(false)

    if (!user) {
        typeof window !== 'undefined' && router.push('/login')
        return null
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])

        if (selectedFiles.length === 0) return

        // Check if adding would exceed the 5 file limit
        if (mediaFiles.length + selectedFiles.length > 5) {
            toast.error("Maximum 5 files allowed")
            return
        }

        // Check file sizes
        const oversizedFiles = selectedFiles.filter(file => file.size > 30 * 1024 * 1024)
        if (oversizedFiles.length > 0) {
            toast.error(
                "Files too large", {
                description: `${oversizedFiles.length} file(s) exceed the 30MB size limit.`
            })
            return
        }

        // Add the new files to the existing ones
        setMediaFiles([...mediaFiles, ...selectedFiles])

        e.target.value = ''
    }

    const removeFile = (index: number) => {
        setMediaFiles(mediaFiles.filter((_, i) => i !== index))
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

            // Append all media files
            mediaFiles.forEach(file => {
                formData.append('media', file)
            })

            await reportIncident(formData)

            toast.success(
                "Incident Reported", {
                description: "Your incident has been successfully reported.",
            })

            setTitle("")
            setDescription("")
            setCategory("")
            setMediaFiles([])
            router.push('/incidents')

        } catch (error) {
            console.error('Error reporting incident:', error)
            toast.error(
                "Error", {
                description: error.message || "Failed to report incident. Please try again.",
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
                    <Label htmlFor="media">Media Upload (Optional, Max 5 files)</Label>
                    <Input
                        id="media"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        disabled={mediaFiles.length >= 5}
                    />

                    {mediaFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {mediaFiles.length} of 5 files selected
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {mediaFiles.map((file, index) => (
                                    <div key={index} className="relative group border rounded-md p-2 bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 truncate text-sm">
                                                {file.name}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-destructive hover:text-destructive/80 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Report"}
                </Button>
            </form>
        </div>
    )
}