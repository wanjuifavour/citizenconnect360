import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { User } from '@/types/types'

interface AuthState {
    user: User | null
    setUser: (user: User | null) => void
    token: string | null
    setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
        }),
        {
            name: 'auth-storage',
        }
    )
)