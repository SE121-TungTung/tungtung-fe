import { api } from './api'

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

export const logout = () => api<void>('/api/v1/auth/logout', { method: 'POST' })

export type PasswordResetRequestPayload = { email: string }
export type PasswordResetRequestResponse = { message: string; detail: string }

export const requestPasswordReset = (body: PasswordResetRequestPayload) =>
    api<PasswordResetRequestResponse>('/api/v1/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify(body),
    })

export type ValidateTokenResponse = { valid: boolean; email: string }

export const validatePasswordResetOtp = (otp: string) =>
    api<ValidateTokenResponse>(
        `/api/v1/auth/password-reset/validate-token?token=${encodeURIComponent(otp)}`,
        { method: 'POST', credentials: 'omit' }
    )
