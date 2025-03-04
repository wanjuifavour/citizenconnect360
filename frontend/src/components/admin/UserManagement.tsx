"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { useLoading } from "@/app/ClientLayout"
import { getAllUsers, updateUserRole, deleteUser } from "@/services/api"

interface User {
    id: number
    name: string
    email: string
    role: string
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const { isLoading, setIsLoading } = useLoading()
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [newRole, setNewRole] = useState("")
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    
    useEffect(() => {
        fetchUsers()
    }, [])
    
    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const data = await getAllUsers()
            // If the API returns an object with a data property, use that
            // Otherwise, assume it returns the array directly
            setUsers(Array.isArray(data) ? data : (data?.data || []))
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Failed to load users")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return
        
        setIsLoading(true)
        try {
            await deleteUser(userId)
            toast.success("User deleted successfully")
            fetchUsers()
        } catch (error) {
            console.error("Error deleting user:", error)
            toast.error("Failed to delete user")
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleRoleChange = async () => {
        if (!selectedUser) return
        
        setIsLoading(true)
        try {
            await updateUserRole(selectedUser.id, newRole)
            toast.success(`User role updated to ${newRole}`)
            fetchUsers()
        } catch (error) {
            console.error("Error updating role:", error)
            toast.error("Failed to update user role")
        } finally {
            setIsLoading(false)
            setShowRoleDialog(false)
            // Update the user details in the details dialog
            const updatedUser = {...selectedUser, role: newRole}
            setSelectedUser(updatedUser)
        }
    }

    const handleRowClick = (user: User) => {
        setSelectedUser(user)
        setShowDetailsDialog(true)
    }
    
    const openRoleDialog = (user: User) => {
        setSelectedUser(user)
        setNewRole(user.role)
        setShowRoleDialog(true)
        setShowDetailsDialog(false) // Close the details dialog
    }
    
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            
            {isLoading ? (
                <p>Loading users...</p>
            ) : users && users.length > 0 ? (
                <Table className="cursor-pointer">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow 
                                key={user.id} 
                                onClick={() => handleRowClick(user)}
                                className="hover:bg-muted/50"
                            >
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                    <Button 
                                        size="sm" 
                                        onClick={() => openRoleDialog(user)}
                                    >
                                        Edit Role
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No users found.</p>
            )}

            {/* User Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <div className="font-medium">ID:</div>
                                <div>{selectedUser.id}</div>
                                
                                <div className="font-medium">Name:</div>
                                <div>{selectedUser.name}</div>
                                
                                <div className="font-medium">Email:</div>
                                <div>{selectedUser.email}</div>
                                
                                <div className="font-medium">Role:</div>
                                <div>{selectedUser.role}</div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <Button 
                                    onClick={() => openRoleDialog(selectedUser)}
                                >
                                    Edit Role
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={() => {
                                        setShowDetailsDialog(false)
                                        handleDeleteUser(selectedUser.id)
                                    }}
                                >
                                    Delete User
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>User: {selectedUser?.name}</p>
                        <p>Current Role: {selectedUser?.role}</p>
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select new role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="citizen">Citizen</SelectItem>
                                <SelectItem value="leader">Leader</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleRoleChange}>
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}