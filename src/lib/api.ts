import { refreshAccessToken } from './auth'

const API =
    import.meta.env.VITE_API_URL ||
    'https://tungtung-be-production.up.railway.app'

const getAccessToken = () => localStorage.getItem('access_token')
const getRefreshToken = () => localStorage.getItem('refresh_token')

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token))
    refreshSubscribers = []
}

async function parseBody<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) return (await res.json()) as T
    const text = await res.text()
    try {
        return JSON.parse(text) as T
    } catch {
        return text as unknown as T
    }
}

async function parseError(res: Response): Promise<never> {
    let msg = 'Đã có lỗi, vui lòng thử lại'
    try {
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
            const data = await res.json()
            console.error('Backend error:', data)

            if (Array.isArray(data?.detail)) {
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
    const error = new Error(msg) as Error & { status?: number }
    error.status = res.status
    throw error
}

interface ExtendedRequestInit extends RequestInit {
    _retry?: boolean
}

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

    if (res.status === 401) {
        if (!init._retry) {
            if (isRefreshing) {
                return new Promise<T>((resolve) => {
                    refreshSubscribers.push((newToken) => {
                        const newHeaders = new Headers(headers)
                        newHeaders.set('Authorization', `Bearer ${newToken}`)
                        resolve(
                            api<T>(path, {
                                ...init,
                                headers: newHeaders,
                                _retry: true,
                            })
                        )
                    })
                })
            }

            init._retry = true
            isRefreshing = true

            try {
                const refreshToken = getRefreshToken()
                if (!refreshToken) throw new Error('No refresh token')

                const data = await refreshAccessToken(refreshToken)

                localStorage.setItem('access_token', data.access_token)
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token)
                }

                onRefreshed(data.access_token)

                const newHeaders = new Headers(headers)
                newHeaders.set('Authorization', `Bearer ${data.access_token}`)
                return api<T>(path, { ...init, headers: newHeaders })
            } catch (error) {
                console.error('Refresh token failed', error)
                localStorage.removeItem('token')
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
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
