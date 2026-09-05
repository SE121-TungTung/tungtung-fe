import { useSession } from '@/stores/session.store'
import { refreshAccessToken } from './auth'

export const API =
    import.meta.env.VITE_API_URL ||
    'https://tungtung-be-production.up.railway.app'

const getStorage = () => {
    if (sessionStorage.getItem('access_token')) return sessionStorage
    return localStorage
}

export const getAccessToken = () => {
    const storage = getStorage()
    const token = storage.getItem('access_token')
    if (!token) return null

    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = payload.exp * 1000

        if (Date.now() >= exp) {
            console.warn('⚠️ Access Token expired, needs refresh...')
            storage.removeItem('access_token')
            // Keep refresh_token intact for refresh flow!
            return null
        }

        return token
    } catch (error) {
        console.error('Invalid token format:', error)
        return null
    }
}
const getRefreshToken = () => getStorage().getItem('refresh_token')

let isRefreshing = false
let refreshSubscribers: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((sub) => sub.resolve(token))
    refreshSubscribers = []
}

const onRefreshFailed = (error: any) => {
    refreshSubscribers.forEach((sub) => sub.reject(error))
    refreshSubscribers = []
}

async function parseBody<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
        const json = await res.json()
        if (
            json &&
            typeof json === 'object' &&
            'data' in json &&
            'success' in json
        ) {
            if ('meta' in json) return json as T
            return json.data as T
        }
        return json as T
    }
    const text = await res.text()
    try {
        const json = JSON.parse(text)
        if (
            json &&
            typeof json === 'object' &&
            'data' in json &&
            'success' in json
        ) {
            if ('meta' in json) return json as T
            return json.data as T
        }
        return json as T
    } catch {
        return text as unknown as T
    }
}

export class ApiError extends Error {
    status: number
    code?: string
    details?: any

    constructor(message: string, status: number, code?: string, details?: any) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.details = details
    }
}

async function parseError(res: Response): Promise<never> {
    let msg = 'Đã có lỗi, vui lòng thử lại'
    let code: string | undefined
    let details: any = null

    try {
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
            const data = await res.json()
            console.error('Backend error:', data)

            // TungTung BE standard ErrorResponse: { success: false, error: { code, message, details } }
            if (data?.error && typeof data.error === 'object') {
                code = data.error.code
                msg = data.error.message || msg
                details = data.error.details ?? null
            } else if (Array.isArray(data?.detail)) {
                // FastAPI validation error fallback: { detail: [{ loc, msg }] }
                code = 'VALIDATION_ERROR'
                details = data.detail
                msg = data.detail
                    .map((d: any) => `${(d.loc || []).join('.')} → ${d.msg}`)
                    .join('\n')
            } else {
                msg = data?.message || data?.detail || msg
            }
        } else {
            const text = await res.text()
            console.error('Backend error:', text)
            msg = text || msg
        }
    } catch {
        /* ignore */
    }

    throw new ApiError(msg, res.status, code, details)
}

interface ExtendedRequestInit extends RequestInit {
    _retry?: boolean
    _skipRefresh?: boolean // ← NEW: Flag to skip auto-refresh
}

// Auth endpoints that should NOT trigger auto-refresh
const AUTH_ENDPOINTS = [
    '/api/v1/auth/login',
    '/api/v1/auth/login-json',
    '/api/v1/auth/refresh',
    '/api/v1/auth/password-reset/request',
    '/api/v1/auth/password-reset/confirm',
    '/api/v1/auth/password-reset/validate-token',
]

export async function api<T>(
    path: string,
    init: ExtendedRequestInit = {}
): Promise<T> {
    const accessToken = getAccessToken()
    const url = path.startsWith('http')
        ? path
        : `${API.replace(/\/$/, '')}${path}`

    const headers = new Headers(init.headers || {})
    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json, text/plain;q=0.9, */*;q=0.8')
    }

    if (accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const isFormData = init.body instanceof FormData
    if (init.body && !isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const res = await fetch(url, { ...init, headers })

    // Check if this is an auth endpoint that should not trigger refresh
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
        path.includes(endpoint)
    )
    const shouldSkipRefresh = init._skipRefresh || isAuthEndpoint

    if (res.status === 401) {
        // Don't try to refresh for auth endpoints or if explicitly skipped
        if (shouldSkipRefresh) {
            return parseError(res)
        }

        if (!init._retry) {
            if (isRefreshing) {
                return new Promise<T>((resolve, reject) => {
                    refreshSubscribers.push({
                        resolve: (newToken: string) => {
                            const newHeaders = new Headers(headers)
                            newHeaders.set(
                                'Authorization',
                                `Bearer ${newToken}`
                            )
                            resolve(
                                api<T>(path, {
                                    ...init,
                                    headers: newHeaders,
                                    _retry: true,
                                })
                            )
                        },
                        reject: (err: any) => {
                            reject(err)
                        },
                    })
                })
            }

            init._retry = true
            isRefreshing = true

            try {
                const refreshToken = getRefreshToken()
                if (!refreshToken) throw new Error('No refresh token')

                const data = await refreshAccessToken(refreshToken)
                const storage = getStorage()

                storage.setItem('access_token', data.access_token)
                if (data.refresh_token) {
                    storage.setItem('refresh_token', data.refresh_token)
                }

                onRefreshed(data.access_token)

                const newHeaders = new Headers(headers)
                newHeaders.set('Authorization', `Bearer ${data.access_token}`)
                return api<T>(path, { ...init, headers: newHeaders })
            } catch (error) {
                console.error('Refresh token failed', error)
                onRefreshFailed(error)
                useSession.getState().clear()
                if (
                    typeof window !== 'undefined' &&
                    !window.location.pathname.includes('/login')
                ) {
                    window.location.href = '/login'
                }
                throw error
            } finally {
                isRefreshing = false
            }
        }
    }

    if (!res.ok) {
        return parseError(res)
    }
    return parseBody<T>(res)
}
