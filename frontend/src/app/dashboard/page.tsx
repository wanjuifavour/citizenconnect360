"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useLoading } from "@/app/ClientLayout"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth"

// Import API services
import * as api from "@/services/api"

interface DashboardCounts {
  totalBills: number;
  activePolls: number;
  reportedIncidents: number;
}

interface RecentActivity {
  incidents: any[];
  polls: any[];
}

export default function DashboardPage() {
    const [counts, setCounts] = useState<DashboardCounts>({
        totalBills: 0,
        activePolls: 0,
        reportedIncidents: 0
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity>({
        incidents: [],
        polls: []
    })
    const { isLoading, setIsLoading } = useLoading()
    const { user } = useAuth()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setIsLoading(true)
        try {
            // Fetch polls data
            const pollsData = await api.getPolls();
            const activePollsCount = pollsData.filter((poll: any) => poll.status === 'open').length;
            
            // Fetch incidents data
            const incidentsData = await api.getAllIncidents();
            const incidents = Array.isArray(incidentsData) ? incidentsData : (incidentsData?.data || []);

            // Set counts directly from API data
            setCounts({
                totalBills: 0, // Update this when you add bills API
                activePolls: activePollsCount,
                reportedIncidents: incidents.length
            })

            // Fetch recent activity
            const recentIncidents = await api.getRecentIncidents();
            const recentPolls = await api.getRecentPolls();

            setRecentActivity({
                incidents: recentIncidents,
                polls: recentPolls
            })
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Polls</CardTitle>
                        <CardDescription>Ongoing public opinion polls</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-3xl font-bold">{counts.activePolls}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Reported Incidents</CardTitle>
                        <CardDescription>Issues reported by citizens</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-3xl font-bold">{counts.reportedIncidents}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <Tabs defaultValue="incidents">
                    <TabsList>
                        <TabsTrigger value="incidents">Incidents</TabsTrigger>
                        <TabsTrigger value="polls">Polls</TabsTrigger>
                    </TabsList>

                    <TabsContent value="incidents">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        ) : recentActivity.incidents.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.incidents.map((incident) => (
                                    <Card key={incident.id}>
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                            incident.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {incident.status}
                                                        </span>
                                                        <CardDescription>
                                                            {incident.category} • {format(new Date(incident.createdAt), 'MMM d, yyyy')}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Link href={`/incidents`}>
                                                    <Button variant="outline" size="sm">View</Button>
                                                </Link>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p>No recent incidents activity.</p>
                        )}
                    </TabsContent>

                    <TabsContent value="polls">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        ) : recentActivity.polls.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.polls.map((poll) => (
                                    <Card key={poll.id}>
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-lg">{poll.title}</CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                            poll.status === 'open' ? 'bg-green-100 text-green-800' :
                                                            poll.status === 'unverified' ? 'bg-yellow-100 text-yellow-800' :
                                                            poll.status === 'suspended' ? 'bg-orange-100 text-orange-800' : 
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {poll.status}
                                                        </span>
                                                        <CardDescription>
                                                            {poll.category} • {format(new Date(poll.createdAt), 'MMM d, yyyy')}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Link href={`/polls`}>
                                                    <Button variant="outline" size="sm">View</Button>
                                                </Link>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p>No recent poll activity.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/bills-chat">
                        <Button className="w-full">Discuss a Bill</Button>
                    </Link>
                    <Link href="/polls">
                        <Button className="w-full">Vote in Polls</Button>
                    </Link>
                    <Link href="/incidents/report">
                        <Button className="w-full">Report an Incident</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}