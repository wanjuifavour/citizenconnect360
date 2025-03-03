export interface User {
    id: number
    username: string
    email: string
    role: string
}

export interface AuthRequest extends Request {
    user?: User
}

export interface TokenPayload {
    id: number
    role: string
    iat?: number
    exp?: number
}