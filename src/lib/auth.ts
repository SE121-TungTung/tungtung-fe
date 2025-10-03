import { api } from './api'
import type { User } from '@/types/auth'

export type LoginPayload = {
    email: string
    password: string
    remember?: boolean
}
export type LoginResponse = { user: User }

export const login = (body: LoginPayload) =>
    api<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
    })

export const me = () => api<{ user: User }>('/api/auth/me', { method: 'GET' })

export const logout = () => api<void>('/api/auth/logout', { method: 'POST' })
