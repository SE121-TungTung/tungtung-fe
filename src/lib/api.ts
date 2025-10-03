const API = import.meta.env.VITE_API_URL || ''

async function parseError(res: Response) {
    let msg = 'Đã có lỗi, vui lòng thử lại'
    try {
        const data = await res.json()
        msg = data?.message || msg
    } catch {
        // ignore
    }
    const error = new Error(msg) as Error & { status?: number }
    error.status = res.status
    throw error
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = path.startsWith('http')
        ? path
        : `${API.replace(/\/$/, '')}${path}`
    const res = await fetch(url, {
        credentials: 'include', // nhận/gửi cookie httpOnly
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
        ...init,
    })
    if (!res.ok) return parseError(res) as T
    // BE có thể trả 204
    return res.status === 204 ? (undefined as T) : await res.json()
}
