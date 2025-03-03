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
import { useAuth } from "@/lib/auth"
import { getAllIncidents } from "@/services/api"
import { toast } from "sonner"

interface Incident {
    id: number;
    title: string;
    category: string;
    description: string;
    status: string;
    reportedBy: number | string;
    createdAt: string;
    media?: Array<{ id: number, type: string, url: string }>;
}

export default function IncidentsPage() {
    const { user } = useAuth()
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const data = await getAllIncidents()
                setIncidents(data)
            } catch (error) {
                console.error('Error fetching incidents:', error)
                toast.error("Failed to load incidents")
            } finally {
                setLoading(false)
            }
        }

        fetchIncidents()
    }, [])

    const filteredIncidents = incidents.filter(
        (incident) =>
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return <div className="container py-10">Loading incidents...</div>
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">All Incidents</h1>
                {user && (
                    <Link href="/incidents/report">
                        <Button>Report an Incident</Button>
                    </Link>
                )}
            </div>
            <Input
                placeholder="Search for incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
            />
            {filteredIncidents.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredIncidents.map((incident) => (
                            <TableRow key={incident.id}>
                                <TableCell>{incident.title}</TableCell>
                                <TableCell>{incident.category}</TableCell>
                                <TableCell>{incident.status}</TableCell>
                                <TableCell>{new Date(incident.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Modal>
                                        <ModalTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident)}>
                                                View More
                                            </Button>
                                        </ModalTrigger>
                                        <ModalContent>
                                            <ModalHeader>
                                                <ModalTitle>{selectedIncident?.title}</ModalTitle>
                                                <ModalDescription>Incident Details</ModalDescription>
                                            </ModalHeader>
                                            <div className="py-4">
                                                <p>
                                                    <strong>Category:</strong> {selectedIncident?.category}
                                                </p>
                                                <p>
                                                    <strong>Date:</strong> {selectedIncident?.createdAt && 
                                                        new Date(selectedIncident.createdAt).toLocaleDateString()}
                                                </p>
                                                <p>
                                                    <strong>Status:</strong> {selectedIncident?.status}
                                                </p>
                                                <p>
                                                    <strong>Description:</strong> {selectedIncident?.description}
                                                </p>
                                                {selectedIncident?.media && selectedIncident.media.length > 0 && (
                                                    <div className="mt-4">
                                                        <strong>Media:</strong>
                                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                                            {selectedIncident.media.map((item) => (
                                                                <div key={item.id}>
                                                                    {item.type === 'PHOTO' ? (
                                                                        <img 
                                                                            src={`http://localhost:8085${item.url}`} 
                                                                            alt="Incident" 
                                                                            className="rounded-md max-h-48"
                                                                        />
                                                                    ) : (
                                                                        <video 
                                                                            src={`http://localhost:8085${item.url}`} 
                                                                            controls 
                                                                            className="rounded-md max-h-48"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
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
            ) : (
                <p className="text-center py-4">No incidents found matching your search.</p>
            )}
        </div>
    )
}