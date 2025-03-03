"use client"

import { useState } from "react"
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

const mockIncidents = [
    {
        id: 1,
        title: "Road Damage",
        category: "Infrastructure",
        reportedBy: "John Doe",
        description: "Large pothole on Main Street causing traffic issues.",
        status: "Open",
        date: "2023-06-15",
    },
    {
        id: 2,
        title: "Power Outage",
        category: "Utilities",
        reportedBy: "Jane Smith",
        description: "Widespread power outage in downtown area.",
        status: "In Progress",
        date: "2023-06-14",
    },
    {
        id: 3,
        title: "Water Shortage",
        category: "Utilities",
        reportedBy: "Mike Johnson",
        description: "Low water pressure reported in residential areas.",
        status: "Resolved",
        date: "2023-06-13",
    },
]

export default function IncidentsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIncident, setSelectedIncident] = useState<(typeof mockIncidents)[0] | null>(null)

    const filteredIncidents = mockIncidents.filter(
        (incident) =>
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">All Incidents</h1>
                <Link href="/incidents/report">
                    <Button>Report an Incident</Button>
                </Link>
            </div>
            <Input
                placeholder="Search for incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                            <TableCell>{incident.title}</TableCell>
                            <TableCell>{incident.category}</TableCell>
                            <TableCell>{incident.reportedBy}</TableCell>
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
                                                <strong>Reported By:</strong> {selectedIncident?.reportedBy}
                                            </p>
                                            <p>
                                                <strong>Date:</strong> {selectedIncident?.date}
                                            </p>
                                            <p>
                                                <strong>Status:</strong> {selectedIncident?.status}
                                            </p>
                                            <p>
                                                <strong>Description:</strong> {selectedIncident?.description}
                                            </p>
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
        </div>
    )
}