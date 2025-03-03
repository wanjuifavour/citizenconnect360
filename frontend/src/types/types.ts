export interface User {
    id: string
    name: string
    email: string
    role: string
}

export interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    register: (username: string, email: string, password: string) => Promise<void>
    logout: () => void
}