"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement forgot password logic
        toast.success("Reset Email Sent", {
            description: "If an account exists with this email, you will receive a password reset link.",
        })
    }

    return (
        <div className="container flex flex-col items-center justify-center min-h-screen py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold">Forgot Password</h2>
                    <p className="mt-2 text-sm">Enter your email to receive a password reset link</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Send Reset Link
                    </Button>
                </form>
                <div className="text-center">
                    <p className="text-sm">
                        Remember your password?{" "}
                        <Link href="/login" className="font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}