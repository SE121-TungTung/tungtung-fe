import { api } from './api'

export type LoginPayload = {
    email: string
    password: string
    remember?: boolean
}
export type LoginResponse = {
    access_token: string
    refresh_token: string
    token_type: string
    is_first_login?: boolean
}

export const login = async (body: LoginPayload) => {
    const res = await api<
        { success: boolean; data: LoginResponse } | LoginResponse
    >('/api/v1/auth/login-json', {
        method: 'POST',
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            remember_me: body.remember ?? false,
        }),
    })
    return ('data' in res && 'success' in res ? res.data : res) as LoginResponse
}

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

export const refreshAccessToken = async (refreshToken: string) => {
    const API_URL =
        import.meta.env.VITE_API_URL ||
        'https://tungtung-be-production.up.railway.app'

    const response = await fetch(
        `${API_URL.replace(/\/$/, '')}/api/v1/auth/refresh`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        }
    )

    if (!response.ok) {
        throw new Error('Refresh token expired')
    }

    const result = await response.json()
    return (
        'data' in result && 'success' in result ? result.data : result
    ) as LoginResponse
}

export type PasswordResetConfirmPayload = {
    token: string
    new_password: string
}

export const confirmPasswordReset = (body: PasswordResetConfirmPayload) =>
    api<PasswordResetRequestResponse>('/api/v1/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify(body),
    })
