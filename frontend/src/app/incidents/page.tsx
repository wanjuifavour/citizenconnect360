"use client"

import { useState, useEffect, useRef } from "react"
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
    ModalTrigger,
} from "@/components/ui/modal"
import { useAuth } from "@/lib/auth"
import { getAllIncidents } from "@/services/api"
import { toast } from "sonner"
import { MediaViewer } from "@/components/MediaViewer"
import { useLoading } from "@/app/ClientLayout"

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
    const { user } = useAuth();
    const { isLoading, setIsLoading } = useLoading(); // Use the global loading state
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    
    const modalTriggerRef = useRef<HTMLButtonElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [mediaViewerState, setMediaViewerState] = useState<{
        isOpen: boolean;
        mediaItems: Array<{ id: number, url: string, type: string }>;
        initialIndex: number;
    } | null>(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            setIsLoading(true);
            try {
                const data = await getAllIncidents();
                setIncidents(data);
            } catch (error) {
                console.error('Error fetching incidents:', error);
                toast.error("Failed to load incidents");
            } finally {
                setIsLoading(false);
            }
        };

        fetchIncidents();
    }, [setIsLoading]);

    const openMediaViewer = (mediaItems: Array<{ id: number, url: string, type: string }>, initialIndex: number) => {
        setMediaViewerState({
            isOpen: true,
            mediaItems,
            initialIndex
        })
        setIsModalOpen(false)
    }

    const closeMediaViewer = () => {
        setMediaViewerState(null)
    }

    const filteredIncidents = incidents.filter(
        (incident) =>
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="container py-10 relative">
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
                                    <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
                                        <ModalTrigger asChild>
                                            <Button 
                                                ref={modalTriggerRef}
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setSelectedIncident(incident)}
                                            >
                                                View More
                                            </Button>
                                        </ModalTrigger>
                                        {selectedIncident && (
                                            <ModalContent>
                                                <ModalHeader className="mb-0">
                                                    <ModalTitle>{selectedIncident.title}</ModalTitle>
                                                    <ModalDescription>Incident Details</ModalDescription>
                                                </ModalHeader>
                                                <div className="items-center justify-items-center py-4">
                                                    <div className="my-2">
                                                        <strong>Media:</strong>
                                                        {selectedIncident?.media && selectedIncident.media.length > 0 ? (
                                                            <div className="mt-2 overflow-x-auto">
                                                                <div className="flex gap-4 pb-2" style={{ minWidth: "min-content" }}>
                                                                    {selectedIncident.media.map((item, index) => (
                                                                        <div 
                                                                            key={item.id} 
                                                                            className="min-w-[200px] max-w-[300px] cursor-pointer" 
                                                                            onClick={() => openMediaViewer(selectedIncident.media || [], index)}
                                                                        >
                                                                            {item.type === 'PHOTO' ? (
                                                                                <div className="relative group">
                                                                                    <img 
                                                                                        src={`http://localhost:8085${item.url}`} 
                                                                                        alt="Incident" 
                                                                                        className="rounded-md w-full h-auto object-cover transition-opacity group-hover:opacity-90"
                                                                                        style={{ maxHeight: "200px" }}
                                                                                    />
                                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                                                                            View
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="relative group">
                                                                                    <video 
                                                                                        src={`http://localhost:8085${item.url}`}
                                                                                        className="rounded-md w-full transition-opacity group-hover:opacity-90"
                                                                                        style={{ maxHeight: "200px" }}
                                                                                    />
                                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                                                                            Play
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="mt-2 text-muted-foreground italic">No media uploaded</p>
                                                        )}
                                                    </div>
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
                                                </div>
                                            </ModalContent>
                                        )}
                                    </Modal>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-center py-4">No incidents found matching your search.</p>
            )}

            {/* Media viewer */}
            {mediaViewerState && (
                <MediaViewer 
                    mediaItems={mediaViewerState.mediaItems}
                    initialIndex={mediaViewerState.initialIndex}
                    isOpen={mediaViewerState.isOpen}
                    onClose={closeMediaViewer}
                />
            )}
        </div>
    );
}