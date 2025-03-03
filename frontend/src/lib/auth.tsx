"use client"

import { createContext, useContext, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import Cookies from 'js-cookie'
import * as api from '@/services/api'
import { AuthContextType } from '@/types/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, setUser, token, setToken } = useAuthStore()

    useEffect(() => {
        const validateToken = async () => {
            const storedToken = Cookies.get('token')
            if (storedToken && !user) {
                try {
                    const response = await api.validateToken()
                    setUser(response.user)
                } catch (error) {
                    Cookies.remove('token')
                    setToken(null)
                    setUser(null)
                }
            }
        }

        validateToken()
    }, [user, setUser, setToken])

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password)
            const { token, user } = response
            
            Cookies.set('token', token, { 
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            
            setToken(token)
            setUser(user)
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const register = async (username: string, email: string, password: string) => {
        try {
            const response = await api.register(username, email, password)
            const { token, user } = response
            
            Cookies.set('token', token, { 
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            
            setToken(token)
            setUser(user)
        } catch (error) {
            console.error('Registration error:', error)
            throw error
        }
    }

    const handleLogout = () => {
        Cookies.remove('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout: handleLogout 
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}