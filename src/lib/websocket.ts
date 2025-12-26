export type WebSocketMessageType =
    | 'connected'
    | 'new_message'
    | 'system_message'
    | 'group_created'
    | 'typing'
    | 'error'
    | 'pong'
    | 'member_added'
    | 'member_removed'
    | 'group_updated'
    | 'you_were_removed'

export interface WebSocketMessage {
    type: WebSocketMessageType
    code?: string
    message?: string
    [key: string]: any
}

const getAuthToken = (): string | null => {
    return localStorage.getItem('access_token') || localStorage.getItem('token')
}

export class WebSocketManager {
    private ws: WebSocket | null = null
    private url: string
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 2000
    private pingInterval: number | null = null
    private messageHandlers: Set<(message: WebSocketMessage) => void> =
        new Set()
    private errorHandlers: Set<(error: Error) => void> = new Set()
    private statusHandlers: Set<(connected: boolean) => void> = new Set()
    private authErrorHandlers: Set<(error: string) => void> = new Set()
    private isIntentionalClose = false
    private connectionPromise: Promise<void> | null = null

    constructor(baseUrl: string) {
        const cleanUrl = baseUrl.replace(/([^:]\/)\/+/g, '$1')
        this.url = cleanUrl
    }

    connect(): Promise<void> {
        // 1. Nếu socket đang mở, không làm gì cả
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve()
        }

        // 2. Nếu đang trong quá trình kết nối, trả về promise hiện tại (Chặn StrictMode gọi 2 lần)
        if (this.connectionPromise) {
            return this.connectionPromise
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                this.isIntentionalClose = false
                const token = getAuthToken()

                if (!token) {
                    this.connectionPromise = null
                    const error = new Error(
                        'No authentication token found. Please login.'
                    )
                    this.handleError(error)
                    reject(error)
                    return
                }

                // 3. CLEANUP SOCKET CŨ
                if (this.ws) {
                    this.ws.onclose = null
                    this.ws.onerror = null
                    this.ws.onmessage = null
                    this.ws.onopen = null

                    this.ws.close()
                    this.ws = null
                }

                const wsUrl = `${this.url}?token=${token}`
                console.log('🔌 Connecting to WebSocket:', wsUrl)

                this.ws = new WebSocket(wsUrl)

                // Timeout safety
                const connectionTimeout = setTimeout(() => {
                    if (this.ws?.readyState !== WebSocket.OPEN) {
                        console.error('Connection timeout')
                        this.ws?.close()
                    }
                }, 10000)

                this.ws.onopen = () => {
                    clearTimeout(connectionTimeout)
                    console.log('WebSocket connected successfully')
                    this.reconnectAttempts = 0
                    this.notifyStatusHandlers(true)
                    this.startPingInterval()
                    this.connectionPromise = null
                    resolve()
                }

                this.ws.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data)
                        if (message.type === 'error') {
                            if (message.code === 'AUTH_FAILED') {
                                console.error('Auth Failed:', message)
                                this.notifyAuthErrorHandlers(
                                    message.message || 'Authentication failed'
                                )
                                this.disconnect()
                                return
                            }
                        }

                        this.notifyMessageHandlers(message)
                    } catch (error) {
                        console.error(
                            'Failed to parse WebSocket message:',
                            error
                        )
                    }
                }

                this.ws.onerror = (event) => {
                    console.error('WebSocket error event:', event)
                }

                this.ws.onclose = (event) => {
                    clearTimeout(connectionTimeout)
                    this.connectionPromise = null

                    console.log(
                        `🔌 WebSocket closed - Code: ${event.code}, Reason: ${event.reason || 'No reason'}`
                    )
                    this.stopPingInterval()
                    this.notifyStatusHandlers(false)

                    if (!this.isIntentionalClose) {
                        if (event.code === 1006) {
                            const error = new Error(
                                'Connection failed (Abnormal Closure).'
                            )
                            this.handleError(error)
                        } else if (event.code === 1008 || event.code === 4001) {
                            console.error(
                                'Authentication failed (Code 1008/4001)'
                            )
                            this.notifyAuthErrorHandlers(
                                'Authentication failed'
                            )
                            return
                        }

                        this.attemptReconnect()
                    }
                }
            } catch (error) {
                console.error('Failed to create WebSocket:', error)
                this.connectionPromise = null
                const err =
                    error instanceof Error
                        ? error
                        : new Error('Failed to create WebSocket')
                this.handleError(err)
                reject(err)
            }
        })

        return this.connectionPromise
    }

    disconnect(): void {
        console.log('🔌 Disconnecting WebSocket...')
        this.isIntentionalClose = true
        this.stopPingInterval()
        this.connectionPromise = null

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect')
            this.ws = null
        }

        this.notifyStatusHandlers(false)
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached.')
            this.handleError(new Error('Max reconnection attempts reached'))
            return
        }

        this.reconnectAttempts++
        const delay =
            this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1)

        console.log(
            `🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        )

        setTimeout(() => {
            if (!this.isIntentionalClose) {
                // Gọi connect() lại, logic Clean Socket cũ ở đầu hàm connect sẽ xử lý an toàn
                this.connect().catch(() => {
                    // Error đã được handle trong connect, không cần log thêm để tránh spam
                })
            }
        }, delay)
    }

    private startPingInterval(): void {
        this.pingInterval = setInterval(() => {
            if (this.isConnected()) {
                this.send({ type: 'ping' })
            }
        }, 30000) as unknown as number
    }

    private stopPingInterval(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval)
            this.pingInterval = null
        }
    }

    send(message: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        } else {
            console.warn('⚠️ WebSocket is not connected. Cannot send message.')
        }
    }

    onMessage(handler: (message: WebSocketMessage) => void): () => void {
        this.messageHandlers.add(handler)
        return () => this.messageHandlers.delete(handler)
    }

    onError(handler: (error: Error) => void): () => void {
        this.errorHandlers.add(handler)
        return () => this.errorHandlers.delete(handler)
    }

    onStatusChange(handler: (connected: boolean) => void): () => void {
        this.statusHandlers.add(handler)
        return () => this.statusHandlers.delete(handler)
    }

    onAuthError(handler: (error: string) => void): () => void {
        this.authErrorHandlers.add(handler)
        return () => this.authErrorHandlers.delete(handler)
    }

    private notifyMessageHandlers(message: WebSocketMessage): void {
        this.messageHandlers.forEach((handler) => {
            try {
                handler(message)
            } catch (error) {
                console.error('Error in message handler:', error)
            }
        })
    }

    private handleError(error: Error): void {
        // Chỉ log nếu không phải lỗi đóng thông thường
        this.errorHandlers.forEach((handler) => {
            try {
                handler(error)
            } catch (err) {
                console.error('Error in error handler:', err)
            }
        })
    }

    private notifyStatusHandlers(connected: boolean): void {
        this.statusHandlers.forEach((handler) => {
            try {
                handler(connected)
            } catch (error) {
                console.error('Error in status handler:', error)
            }
        })
    }

    private notifyAuthErrorHandlers(error: string): void {
        this.authErrorHandlers.forEach((handler) => {
            try {
                handler(error)
            } catch (err) {
                console.error('Error in auth error handler:', err)
            }
        })
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN
    }

    getConnectionState(): string {
        if (!this.ws) return 'NOT_INITIALIZED'
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING'
            case WebSocket.OPEN:
                return 'OPEN'
            case WebSocket.CLOSING:
                return 'CLOSING'
            case WebSocket.CLOSED:
                return 'CLOSED'
            default:
                return 'UNKNOWN'
        }
    }
}

const WS_BASE_URL =
    import.meta.env.VITE_WS_URL ||
    'wss://tungtung-be-production.up.railway.app/api/v1/messaging/ws'
export const wsManager = new WebSocketManager(WS_BASE_URL)
