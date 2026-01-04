export const AuditAction = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    PUBLISH: 'PUBLISH',
    UNPUBLISH: 'UNPUBLISH',
    SUBMIT: 'SUBMIT',
    GRADE: 'GRADE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
} as const

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

export interface AuditLogResponse {
    id: string
    user_id: string | null
    action: AuditAction
    table_name: string
    record_id: string | null
    old_values: Record<string, any> | null
    new_values: Record<string, any> | null
    ip_address: string | null
    user_agent: string | null
    session_id: string | null
    success: boolean
    error_message: string | null
    timestamp: string
}

export interface AuditLogListResponse {
    total: number
    skip: number
    limit: number
    items: AuditLogResponse[]
}

export interface AuditLogFilters {
    skip?: number
    limit?: number
    user_id?: string
    action?: AuditAction
    table_name?: string
    record_id?: string
    success?: boolean
    search?: string
}

// Helper type for UI display
export interface AuditLogUI extends AuditLogResponse {
    formattedTimestamp: string
    actionLabel: string
    statusLabel: string
}

// Action labels for Vietnamese
export const AuditActionLabels: Record<AuditAction, string> = {
    CREATE: 'Tạo mới',
    UPDATE: 'Cập nhật',
    DELETE: 'Xóa',
    PUBLISH: 'Xuất bản',
    UNPUBLISH: 'Hủy xuất bản',
    SUBMIT: 'Nộp bài',
    GRADE: 'Chấm điểm',
    LOGIN: 'Đăng nhập',
    LOGOUT: 'Đăng xuất',
}

// Action colors for badge styling
export const AuditActionColors: Record<AuditAction, string> = {
    CREATE: 'var(--status-success-500-light)',
    UPDATE: 'var(--brand-primary-500-light)',
    DELETE: 'var(--status-danger-500-light)',
    PUBLISH: 'var(--status-success-500-dark)',
    UNPUBLISH: 'var(--status-warning-500-light)',
    SUBMIT: 'var(--brand-primary-500-light)',
    GRADE: 'var(--brand-primary-600-light)',
    LOGIN: 'var(--status-success-500-light)',
    LOGOUT: 'var(--text-secondary-light)',
}
