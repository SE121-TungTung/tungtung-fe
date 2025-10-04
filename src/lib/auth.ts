import { api } from './api'
import type { User } from '@/types/auth'

export type LoginPayload = {
    email: string
    password: string
    remember?: boolean
}
export type LoginResponse = {
    access_token: string
}

export const login = (body: LoginPayload) =>
    api<LoginResponse>('/api/v1/auth/login-json', {
        method: 'POST',
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            remember_me: body.remember ?? false,
        }),
    })

export const me = () => api<User>('/api/v1/users/me', { method: 'GET' })

export const logout = () => api<void>('/api/v1/auth/logout', { method: 'POST' })
