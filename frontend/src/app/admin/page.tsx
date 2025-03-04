"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLoading } from "@/app/ClientLayout"
import UserManagement from "@/components/admin/UserManagement"
import IncidentManagement from "@/components/admin/IncidentManagement"
import PollManagement from "@/components/admin/PollManagement"

export default function AdminPage() {
    const { user } = useAuth()
    const router = useRouter()
    
    if (!user || user.role !== "admin") {
        return null
    }
    
    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            
            <Tabs defaultValue="users">
                <TabsList className="mb-6">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="incidents">Incidents</TabsTrigger>
                    <TabsTrigger value="polls">Polls</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users">
                    <UserManagement />
                </TabsContent>
                
                <TabsContent value="incidents">
                    <IncidentManagement />
                </TabsContent>
                
                <TabsContent value="polls">
                    <PollManagement />
                </TabsContent>
            </Tabs>
        </div>
    )
}