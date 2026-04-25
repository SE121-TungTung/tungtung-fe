export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'
export type PaymentGateway = 'VNPAY' | 'MOMO' | 'CASH' | 'BANK_TRANSFER'
export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// ============================================================================
// Invoices
// ============================================================================
export interface InvoiceResponse {
    id: string
    student_id: string
    student_name?: string
    enrollment_id: string
    course_id?: string
    course_name?: string
    original_amount: number
    discount_amount: number
    final_amount: number
    status: InvoiceStatus
    due_date: string | null
    note: string | null
    created_at: string
    updated_at: string
}

export interface InvoiceCreate {
    enrollment_id: string
    discount_amount?: number
    note?: string
}

// ============================================================================
// Payments
// ============================================================================
export interface PaymentResponse {
    id: string
    invoice_id: string
    student_id: string
    amount: number
    payment_method: PaymentGateway
    gateway: PaymentGateway
    gateway_transaction_id: string | null
    status: PaymentStatus
    payment_url: string | null
    created_at: string
    updated_at: string
}

export interface PaymentCreate {
    invoice_id: string
    gateway: PaymentGateway
    return_url?: string // Dùng cho web redirect
}

export interface ReceiptResponse {
    receipt_url: string
    generated_at: string
}

// ============================================================================
// Refunds
// ============================================================================
export interface RefundCalculationResponse {
    total_sessions: number
    attended_sessions: number
    remaining_sessions: number
    total_fee: number
    refundable_amount: number
}

export interface RefundResponse {
    id: string
    enrollment_id: string
    student_name?: string
    course_name?: string
    status: RefundStatus
    requested_amount: number
    approved_amount: number | null
    reason: string
    rejection_reason: string | null
    requested_by: string
    created_at: string
}

export interface RefundCreate {
    enrollment_id: string
    requested_amount: number
    reason: string
}

export interface RefundStatusUpdate {
    status: 'APPROVED' | 'REJECTED'
    approved_amount?: number
    rejection_reason?: string
}

// ============================================================================
// Reports
// ============================================================================
export interface RevenueReportBreakdown {
    course_id: string
    course_name: string
    revenue: number
}

export interface RevenueReportResponse {
    total_revenue: number
    total_invoices: number
    avg_payment_value: number
    breakdown: RevenueReportBreakdown[]
}

export interface ExpensesReportResponse {
    total_salary: number
    total_operations: number
    total_expenses: number
    breakdown: Record<string, number>
}

export interface ProfitReportResponse {
    total_revenue: number
    total_expenses: number
    net_profit: number
    profit_margin: number
}

export interface DebtListResponse {
    invoice_id: string
    student_id: string
    student_name: string
    phone: string | null
    course_name: string | null
    debt_amount: number
    due_date: string | null
    days_overdue: number
}

export interface ExportJobCreate {
    report_type: 'REVENUE' | 'EXPENSE' | 'PROFIT' | 'DEBT'
    date_from?: string
    date_to?: string
}

export interface ExportJobResponse {
    job_id: string
    status: 'PENDING' | 'COMPLETED' | 'FAILED'
    file_url?: string
}

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    total_pages: number
}

export interface PaginatedResult<T> {
    data: T[]
    meta: PaginationMeta
}
