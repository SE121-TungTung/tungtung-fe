import { api } from './api'
import type {
    KpiTier,
    KpiTierUpdate,
    TeacherPayrollConfig,
    TeacherPayrollConfigUpdate,
    KpiCalculationJob,
    TeacherMonthlyKpi,
    KpiDispute,
    KpiDisputeCreate,
    KpiDisputeResolveRequest,
    Salary,
    SalaryAdjustmentCreate,
    SalaryAdjustment,
    PayrollRun,
    PaginatedResponse,
    KpiSummaryResponse,
} from '@/types/kpi.types'

const API_V1 = '/api/v1'

// Tiers
export const getKpiTiers = async (): Promise<KpiTier[]> => {
    const res = await api<KpiTier[]>(`${API_V1}/settings/kpi-tiers`)
    return res
}

export const updateKpiTiers = async (
    payload: KpiTierUpdate[]
): Promise<KpiTier[]> => {
    const res = await api<KpiTier[]>(`${API_V1}/settings/kpi-tiers`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
    return res
}

// KPI Job
export const createKpiCalculationJob = async (
    period: string,
    force = false
): Promise<KpiCalculationJob> => {
    const res = await api<KpiCalculationJob>(`${API_V1}/kpi/calculation-jobs`, {
        method: 'POST',
        body: JSON.stringify({ period, force }),
    })
    return res
}

export const getKpiCalculationJob = async (
    jobId: string
): Promise<KpiCalculationJob> => {
    const res = await api<KpiCalculationJob>(
        `${API_V1}/kpi/calculation-jobs/${jobId}`
    )
    return res
}

// Teacher KPI
export const getMyKpi = async (
    period: string
): Promise<TeacherMonthlyKpi | null> => {
    try {
        const res = await api<TeacherMonthlyKpi>(
            `${API_V1}/teachers/me/kpi?period=${period}`
        )
        return res
    } catch {
        return null // 404 or empty
    }
}

export const getTeacherMonthlyKpi = async (
    teacherId: string,
    period: string
): Promise<TeacherMonthlyKpi | null> => {
    try {
        const res = await api<TeacherMonthlyKpi>(
            `${API_V1}/teachers/${teacherId}/kpi?period=${period}`
        )
        return res
    } catch {
        return null
    }
}

// Payroll config
export const updateTeacherPayrollConfig = async (
    teacherId: string,
    payload: TeacherPayrollConfigUpdate
): Promise<TeacherPayrollConfig> => {
    const res = await api<TeacherPayrollConfig>(
        `${API_V1}/teachers/${teacherId}/payroll-config`,
        {
            method: 'PUT',
            body: JSON.stringify(payload),
        }
    )
    return res
}

// Dispute
export const createKpiDispute = async (
    payload: KpiDisputeCreate
): Promise<KpiDispute> => {
    const res = await api<KpiDispute>(`${API_V1}/kpi/dispute`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    return res
}

export const resolveKpiDispute = async (
    id: string,
    payload: KpiDisputeResolveRequest
): Promise<KpiDispute> => {
    const res = await api<KpiDispute>(`${API_V1}/kpi/dispute/${id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
    return res
}

// Salaries
export const getSalaries = async (params: {
    period?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Salary>> => {
    const query = new URLSearchParams()
    if (params.period) query.append('period', params.period)
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())

    const API_BASE = (
        import.meta.env.VITE_API_URL ||
        'https://tungtung-be-production.up.railway.app'
    ).replace(/\/$/, '')
    const url = `${API_BASE}${API_V1}/salaries?${query.toString()}`

    const token =
        sessionStorage.getItem('access_token') ||
        localStorage.getItem('access_token')
    const headers: HeadersInit = { Accept: 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(
            errBody?.message || errBody?.detail || `HTTP ${res.status}`
        )
    }
    return res.json() as Promise<PaginatedResponse<Salary>>
}

export const getMySalaryHistory = async (params: {
    page?: number
    limit?: number
    period?: string
}): Promise<PaginatedResponse<Salary>> => {
    const query = new URLSearchParams()
    if (params.period) query.append('period', params.period)
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())

    return api<PaginatedResponse<Salary>>(
        `${API_V1}/teachers/me/salary-history?${query.toString()}`
    )
}

export const getSalaryDetail = async (id: string): Promise<Salary> => {
    const res = await api<Salary>(`${API_V1}/salaries/${id}`)
    return res
}

export const approveSalary = async (id: string): Promise<Salary> => {
    const res = await api<Salary>(`${API_V1}/salaries/${id}/approve`, {
        method: 'POST',
    })
    return res
}

export const addSalaryAdjustment = async (
    salaryId: string,
    payload: SalaryAdjustmentCreate
): Promise<SalaryAdjustment> => {
    const res = await api<SalaryAdjustment>(
        `${API_V1}/salaries/${salaryId}/adjustments`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }
    )
    return res
}

// Payroll run job
export const createPayrollRun = async (period: string): Promise<PayrollRun> => {
    const res = await api<PayrollRun>(`${API_V1}/payroll-runs`, {
        method: 'POST',
        body: JSON.stringify({ period }),
    })
    return res
}

// KPI Summary (Admin: all teachers overview for a period)
// NOTE: Uses raw fetch instead of api() wrapper because api() auto-unwraps
// json.data, stripping out the `meta` field needed for pagination.
export const getKpiSummary = async (params: {
    period: string
    page?: number
    limit?: number
}): Promise<KpiSummaryResponse> => {
    const query = new URLSearchParams({ period: params.period })
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())

    const API_BASE = (
        import.meta.env.VITE_API_URL ||
        'https://tungtung-be-production.up.railway.app'
    ).replace(/\/$/, '')
    const url = `${API_BASE}${API_V1}/kpi/summary?${query.toString()}`

    const token =
        sessionStorage.getItem('access_token') ||
        localStorage.getItem('access_token')
    const headers: HeadersInit = { Accept: 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(
            errBody?.message || errBody?.detail || `HTTP ${res.status}`
        )
    }
    return res.json() as Promise<KpiSummaryResponse>
}
