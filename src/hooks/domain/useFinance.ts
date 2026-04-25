import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as financeApi from '@/lib/finance'
import type {
    InvoiceCreate,
    PaymentCreate,
    RefundCreate,
    RefundStatusUpdate,
    ExportJobCreate,
} from '@/types/finance.types'

// ============================================================================
// Invoices
// ============================================================================

export const useCreateInvoice = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: InvoiceCreate) =>
            financeApi.createInvoice(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['invoices'] })
        },
    })
}

export const useMyInvoices = (page: number = 1, limit: number = 20) =>
    useQuery({
        queryKey: ['my-invoices', page, limit],
        queryFn: () => financeApi.getMyInvoices(page, limit),
        placeholderData: keepPreviousData,
    })

export const useInvoiceDetail = (id: string | undefined) =>
    useQuery({
        queryKey: ['invoice', id],
        queryFn: () => financeApi.getInvoiceDetail(id!),
        enabled: !!id,
    })

// ============================================================================
// Payments
// ============================================================================

export const useProcessPayment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            payload,
            idempotencyKey,
        }: {
            payload: PaymentCreate
            idempotencyKey: string
        }) => financeApi.processPayment(payload, idempotencyKey),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['payments'] })
            qc.invalidateQueries({ queryKey: ['my-invoices'] })
            qc.invalidateQueries({ queryKey: ['invoices'] })
        },
    })
}

export const usePaymentReceipt = (paymentId: string | undefined) =>
    useQuery({
        queryKey: ['payment-receipt', paymentId],
        queryFn: () => financeApi.getPaymentReceipt(paymentId!),
        enabled: !!paymentId,
    })

export const usePayments = (params: {
    student_id?: string
    status?: string
    page?: number
    limit?: number
}) =>
    useQuery({
        queryKey: ['payments', params],
        queryFn: () => financeApi.listPayments(params),
        placeholderData: keepPreviousData,
    })

// ============================================================================
// Refunds
// ============================================================================

export const useCalculateRefund = (enrollmentId: string | undefined) =>
    useQuery({
        queryKey: ['refund-calculation', enrollmentId],
        queryFn: () => financeApi.calculateRefund(enrollmentId!),
        enabled: !!enrollmentId,
    })

export const useCreateRefund = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: RefundCreate) => financeApi.createRefund(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['refunds'] })
        },
    })
}

export const useUpdateRefundStatus = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            refundId,
            payload,
        }: {
            refundId: string
            payload: RefundStatusUpdate
        }) => financeApi.updateRefundStatus(refundId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['refunds'] })
        },
    })
}

// ============================================================================
// Reports
// ============================================================================

export const useRevenueReport = (
    dateFrom?: string,
    dateTo?: string,
    groupByCourse?: boolean
) =>
    useQuery({
        queryKey: ['report-revenue', dateFrom, dateTo, groupByCourse],
        queryFn: () =>
            financeApi.getRevenueReport(dateFrom, dateTo, groupByCourse),
    })

export const useExpensesReport = (
    dateFrom?: string,
    dateTo?: string,
    costType?: string
) =>
    useQuery({
        queryKey: ['report-expenses', dateFrom, dateTo, costType],
        queryFn: () => financeApi.getExpensesReport(dateFrom, dateTo, costType),
    })

export const useProfitReport = (dateFrom?: string, dateTo?: string) =>
    useQuery({
        queryKey: ['report-profit', dateFrom, dateTo],
        queryFn: () => financeApi.getProfitReport(dateFrom, dateTo),
    })

export const useDebtsReport = (page: number = 1, limit: number = 20) =>
    useQuery({
        queryKey: ['report-debts', page, limit],
        queryFn: () => financeApi.getDebtReport(page, limit),
        placeholderData: keepPreviousData,
    })

export const useCreateExportJob = () =>
    useMutation({
        mutationFn: (payload: ExportJobCreate) =>
            financeApi.createExportJob(payload),
    })
