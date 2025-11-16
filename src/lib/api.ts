const API =
    import.meta.env.VITE_API_URL ||
    'https://tungtung-be-production.up.railway.app'

const getToken = () =>
    localStorage.getItem('token') ?? sessionStorage.getItem('token')

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

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getToken()
    const url = path.startsWith('http')
        ? path
        : `${API.replace(/\/$/, '')}${path}`

    const isFormData = init.body instanceof FormData
    const { headers: initHeaders, ...restOfInit } = init

    const finalHeaders = new Headers({
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(initHeaders as Record<string, string>),
    })

    if (init.body && !isFormData) {
        if (!finalHeaders.has('Content-Type')) {
            finalHeaders.set('Content-Type', 'application/json')
        }
    }

    if (isFormData) {
        finalHeaders.delete('Content-Type')
    }

    const res = await fetch(url, {
        credentials: 'include',
        ...restOfInit,
        headers: finalHeaders,
    })

    if (!res.ok) {
        return parseError(res)
    }
    return parseBody<T>(res)
}
