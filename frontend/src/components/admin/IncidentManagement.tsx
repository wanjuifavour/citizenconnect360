"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
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
import { toast } from "sonner"
import { useLoading } from "@/app/ClientLayout"
import { getAllIncidents, verifyIncident, deleteIncident, updateIncident } from "@/services/api"

interface Media {
    id: number;
    type: string;
    url: string;
}

interface Incident {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    reportedBy: number;
    createdAt: string;
    updatedAt: string;
    media?: Media[];
}

export default function IncidentManagement() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const { isLoading, setIsLoading } = useLoading()
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editableIncident, setEditableIncident] = useState<{
        title: string;
        description: string;
        category: string;
    }>({
        title: "",
        description: "",
        category: ""
    })
    
    useEffect(() => {
        fetchIncidents()
    }, [])
    
    const fetchIncidents = async () => {
        setIsLoading(true)
        try {
            const data = await getAllIncidents()
            setIncidents(Array.isArray(data) ? data : (data?.data || []))
        } catch (error) {
            console.error("Error fetching incidents:", error)
            toast.error("Failed to load incidents")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleDeleteIncident = async (incidentId: number) => {
        if (!confirm("Are you sure you want to delete this incident?")) return
        
        setIsLoading(true)
        try {
            await deleteIncident(incidentId)
            toast.success("Incident deleted successfully")
            fetchIncidents()
            setShowDetailsDialog(false)
            setShowEditDialog(false)
        } catch (error) {
            console.error("Error deleting incident:", error)
            toast.error("Failed to delete incident")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleVerifyIncident = async (incidentId: number) => {
        setIsLoading(true)
        try {
            await verifyIncident(incidentId)
            toast.success("Incident verified successfully")
            fetchIncidents()
            
            // Update the local selected incident too
            if (selectedIncident && selectedIncident.id === incidentId) {
                setSelectedIncident({...selectedIncident, status: 'Verified'})
            }
        } catch (error) {
            console.error("Error verifying incident:", error)
            toast.error("Failed to verify incident")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleRowClick = (incident: Incident) => {
        setSelectedIncident(incident)
        setShowDetailsDialog(true)
    }

    const openEditDialog = (incident: Incident) => {
        setSelectedIncident(incident)
        setEditableIncident({
            title: incident.title,
            description: incident.description,
            category: incident.category
        })
        setShowEditDialog(true)
        setShowDetailsDialog(false)
    }

    const handleSaveIncidentChanges = async () => {
        if (!selectedIncident) return
        
        // Validate inputs
        if (!editableIncident.title.trim()) {
            toast.error("Title is required")
            return
        }
        
        if (!editableIncident.description.trim()) {
            toast.error("Description is required")
            return
        }
        
        if (!editableIncident.category) {
            toast.error("Category is required")
            return
        }
        
        setIsLoading(true)
        try {
            await updateIncident(selectedIncident.id, editableIncident)
            toast.success("Incident updated successfully")
            fetchIncidents()
            setShowEditDialog(false)
        } catch (error) {
            console.error("Error updating incident:", error)
            toast.error("Failed to update incident")
        } finally {
            setIsLoading(false)
        }
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }
    
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Incident Management</h2>
            
            {isLoading ? (
                <p>Loading incidents...</p>
            ) : incidents && incidents.length > 0 ? (
                <Table className="cursor-pointer">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reported By</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {incidents.map((incident) => (
                            <TableRow 
                                key={incident.id}
                                onClick={() => handleRowClick(incident)}
                                className="hover:bg-muted/50"
                            >
                                <TableCell>{incident.title}</TableCell>
                                <TableCell>{incident.category}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        incident.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {incident.status}
                                    </span>
                                </TableCell>
                                <TableCell>{incident.reportedBy}</TableCell>
                                <TableCell>{formatDate(incident.createdAt)}</TableCell>
                                <TableCell className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditDialog(incident);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    {incident.status !== "Verified" && (
                                        <Button 
                                            size="sm" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVerifyIncident(incident.id);
                                            }}
                                        >
                                            Verify
                                        </Button>
                                    )}
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteIncident(incident.id);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No incidents found.</p>
            )}

            {/* Incident Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Incident Details</DialogTitle>
                    </DialogHeader>
                    {selectedIncident && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedIncident.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            selectedIncident.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {selectedIncident.status}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {selectedIncident.category}
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium">Description</h4>
                                    <p className="mt-1">{selectedIncident.description}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium">Reported By</h4>
                                    <p className="mt-1">User ID: {selectedIncident.reportedBy}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium">Dates</h4>
                                    <p className="mt-1">Created: {formatDate(selectedIncident.createdAt)}</p>
                                    <p className="mt-1">Last Updated: {formatDate(selectedIncident.updatedAt)}</p>
                                </div>

                                {selectedIncident.media && selectedIncident.media.length > 0 && (
                                    <div>
                                        <h4 className="font-medium">Media</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                            {selectedIncident.media.map((item) => (
                                                <div key={item.id} className="rounded overflow-hidden">
                                                    {item.type === 'PHOTO' ? (
                                                        <img 
                                                            src={`http://localhost:8085${item.url}`}
                                                            alt="Incident" 
                                                            className="w-full h-40 object-cover"
                                                        />
                                                    ) : (
                                                        <video 
                                                            src={`http://localhost:8085${item.url}`}
                                                            controls
                                                            className="w-full h-40 object-cover"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        onClick={() => openEditDialog(selectedIncident)}
                                    >
                                        Edit
                                    </Button>
                                    {selectedIncident.status !== "Verified" && (
                                        <Button 
                                            onClick={() => handleVerifyIncident(selectedIncident.id)}
                                        >
                                            Verify
                                        </Button>
                                    )}
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => handleDeleteIncident(selectedIncident.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Incident Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Incident</DialogTitle>
                        <DialogDescription>
                            Make changes to the incident details below.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit-title">Incident Title</Label>
                            <Input 
                                id="edit-title" 
                                value={editableIncident.title} 
                                onChange={(e) => setEditableIncident({...editableIncident, title: e.target.value})} 
                                required 
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea 
                                id="edit-description" 
                                value={editableIncident.description} 
                                onChange={(e) => setEditableIncident({...editableIncident, description: e.target.value})} 
                                required 
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="edit-category">Category</Label>
                            <Select 
                                value={editableIncident.category} 
                                onValueChange={(value) => setEditableIncident({...editableIncident, category: value})}
                            >
                                <SelectTrigger id="edit-category">
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
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveIncidentChanges}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}