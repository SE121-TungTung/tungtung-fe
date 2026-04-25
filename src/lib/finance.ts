import { api } from './api'
import type {
    InvoiceResponse,
    InvoiceCreate,
    PaymentResponse,
    PaymentCreate,
    ReceiptResponse,
    RefundCalculationResponse,
    RefundResponse,
    RefundCreate,
    RefundStatusUpdate,
    RevenueReportResponse,
    ExpensesReportResponse,
    ProfitReportResponse,
    DebtListResponse,
    ExportJobCreate,
    ExportJobResponse,
    PaginatedResult,
} from '@/types/finance.types'

const API_V1 = '/api/v1'

// Helper for raw fetch with auth to preserve meta data
async function rawFetch<T>(urlStr: string): Promise<PaginatedResult<T>> {
    const API_BASE = (
        import.meta.env.VITE_API_URL ||
        'https://tungtung-be-production.up.railway.app'
    ).replace(/\/$/, '')
    const url = `${API_BASE}${urlStr}`

    const token =
        sessionStorage.getItem('access_token') ||
        localStorage.getItem('access_token')
    const headers: HeadersInit = { Accept: 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(url, { headers })
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || 'Lỗi khi gọi API')
    }
    const result = await response.json()
    // Giả định backend trả về { success: true, data: [...], meta: {...} }
    return {
        data: result.data || [],
        meta: result.meta || { page: 1, limit: 20, total: 0, total_pages: 0 },
    }
}

// ============================================================================
// Invoices
// ============================================================================

export const createInvoice = async (
    payload: InvoiceCreate
): Promise<InvoiceResponse> =>
    api<InvoiceResponse>(`${API_V1}/invoices`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const getMyInvoices = async (
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResult<InvoiceResponse>> => {
    return rawFetch<InvoiceResponse>(
        `${API_V1}/invoices/me?page=${page}&limit=${limit}`
    )
}

export const getInvoiceDetail = async (id: string): Promise<InvoiceResponse> =>
    api<InvoiceResponse>(`${API_V1}/invoices/${id}`)

// ============================================================================
// Payments
// ============================================================================

export const processPayment = async (
    payload: PaymentCreate,
    idempotencyKey: string
): Promise<PaymentResponse> => {
    return api<PaymentResponse>(`${API_V1}/payments`, {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
    })
}

export const getPaymentReceipt = async (
    paymentId: string
): Promise<ReceiptResponse> =>
    api<ReceiptResponse>(`${API_V1}/payments/${paymentId}/receipt`)

export const listPayments = async (params: {
    student_id?: string
    status?: string
    page?: number
    limit?: number
}): Promise<PaginatedResult<PaymentResponse>> => {
    const query = new URLSearchParams()
    if (params.student_id) query.append('student_id', params.student_id)
    if (params.status) query.append('status', params.status)
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())

    return rawFetch<PaymentResponse>(`${API_V1}/payments?${query.toString()}`)
}

// ============================================================================
// Refunds
// ============================================================================

export const calculateRefund = async (
    enrollmentId: string
): Promise<RefundCalculationResponse> =>
    api<RefundCalculationResponse>(
        `${API_V1}/refunds/calculate?enrollment_id=${enrollmentId}`
    )

export const createRefund = async (
    payload: RefundCreate
): Promise<RefundResponse> =>
    api<RefundResponse>(`${API_V1}/refunds`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const updateRefundStatus = async (
    refundId: string,
    payload: RefundStatusUpdate
): Promise<RefundResponse> =>
    api<RefundResponse>(`${API_V1}/refunds/${refundId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    })

// ============================================================================
// Reports
// ============================================================================

export const getRevenueReport = async (
    dateFrom?: string,
    dateTo?: string,
    groupByCourse?: boolean
): Promise<RevenueReportResponse> => {
    const query = new URLSearchParams()
    if (dateFrom) query.append('date_from', dateFrom)
    if (dateTo) query.append('date_to', dateTo)
    if (groupByCourse) query.append('group_by_course', 'true')
    return api<RevenueReportResponse>(
        `${API_V1}/reports/revenue?${query.toString()}`
    )
}

export const getExpensesReport = async (
    dateFrom?: string,
    dateTo?: string,
    costType?: string
): Promise<ExpensesReportResponse> => {
    const query = new URLSearchParams()
    if (dateFrom) query.append('date_from', dateFrom)
    if (dateTo) query.append('date_to', dateTo)
    if (costType) query.append('cost_type', costType)
    return api<ExpensesReportResponse>(
        `${API_V1}/reports/expenses?${query.toString()}`
    )
}

export const getProfitReport = async (
    dateFrom?: string,
    dateTo?: string
): Promise<ProfitReportResponse> => {
    const query = new URLSearchParams()
    if (dateFrom) query.append('date_from', dateFrom)
    if (dateTo) query.append('date_to', dateTo)
    return api<ProfitReportResponse>(
        `${API_V1}/reports/profit?${query.toString()}`
    )
}

export const getDebtReport = async (
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResult<DebtListResponse>> => {
    return rawFetch<DebtListResponse>(
        `${API_V1}/reports/debts?page=${page}&limit=${limit}`
    )
}

export const createExportJob = async (
    payload: ExportJobCreate
): Promise<ExportJobResponse> =>
    api<ExportJobResponse>(`${API_V1}/reports/export-jobs`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
