import { api } from './api'
import type {
    // Templates
    KPITemplate,
    KPITemplateListItem,
    KPITemplateCreate,
    KPITemplateUpdate,
    KPITemplateMetric,
    // Periods
    KPIPeriod,
    KPIPeriodDetail,
    KPIPeriodCreate,
    // Records
    KPIRecordListItem,
    KPIRecordDetail,
    UpdateMetricsRequest,
    // Dashboard
    KPIDashboardSummary,
    KPIRankingItem,
    StaffKPIHistoryItem,
    // Support Calculator
    SupportCalcRequest,
    SupportCalcResponse,
    SupportCalcSaveRequest,
    SupportCalcEntryResponse,
    // Approval
    KPIApprovalLog,
    // Dispute
    KpiDispute,
    KpiDisputeCreate,
    KpiDisputeResolveRequest,

    // Payroll
    TeacherPayrollConfig,
    TeacherPayrollConfigUpdate,
    Salary,
    SalaryAdjustmentCreate,
    SalaryAdjustment,
    PayrollRun,
    PaginatedResponse,
} from '@/types/kpi.types'

const API_V1 = '/api/v1'

// ============================================================================
// 1. KPI Templates
// ============================================================================

export const getKpiTemplates = async (): Promise<KPITemplateListItem[]> =>
    api<KPITemplateListItem[]>(`${API_V1}/kpi/templates`)

export const getKpiTemplate = async (id: string): Promise<KPITemplate> =>
    api<KPITemplate>(`${API_V1}/kpi/templates/${id}`)

export const createKpiTemplate = async (
    payload: KPITemplateCreate
): Promise<KPITemplate> =>
    api<KPITemplate>(`${API_V1}/kpi/templates`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const updateKpiTemplate = async (
    id: string,
    payload: KPITemplateUpdate
): Promise<KPITemplate> =>
    api<KPITemplate>(`${API_V1}/kpi/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })

export const getKpiTemplateMetrics = async (
    templateId: string
): Promise<KPITemplateMetric[]> =>
    api<KPITemplateMetric[]>(`${API_V1}/kpi/templates/${templateId}/metrics`)

// ============================================================================
// 2. KPI Periods
// ============================================================================

export const getKpiPeriods = async (): Promise<KPIPeriod[]> =>
    api<KPIPeriod[]>(`${API_V1}/kpi/periods`)

export const createKpiPeriod = async (
    payload: KPIPeriodCreate
): Promise<{
    period: KPIPeriod
    records_created: number
    skipped: string[]
}> =>
    api(`${API_V1}/kpi/periods`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const getKpiPeriodDetail = async (
    periodId: string
): Promise<KPIPeriodDetail> =>
    api<KPIPeriodDetail>(`${API_V1}/kpi/periods/${periodId}`)

export const closeKpiPeriod = async (periodId: string): Promise<KPIPeriod> =>
    api<KPIPeriod>(`${API_V1}/kpi/periods/${periodId}/close`, {
        method: 'PUT',
    })

// ============================================================================
// 3. KPI Records
// ============================================================================

export const getKpiRecords = async (params: {
    period_id?: string
    staff_id?: string
    status?: string
    contract_type?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<KPIRecordListItem>> => {
    const query = new URLSearchParams()
    if (params.period_id) query.append('period_id', params.period_id)
    if (params.staff_id) query.append('staff_id', params.staff_id)
    if (params.status) query.append('status', params.status)
    if (params.contract_type)
        query.append('contract_type', params.contract_type)
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())

    // Use raw fetch to preserve meta (api() auto-unwraps data)
    const API_BASE = (
        import.meta.env.VITE_API_URL ||
        'https://tungtung-be-production.up.railway.app'
    ).replace(/\/$/, '')
    const url = `${API_BASE}${API_V1}/kpi/records?${query.toString()}`

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
    return res.json() as Promise<PaginatedResponse<KPIRecordListItem>>
}

export const getKpiRecordDetail = async (
    recordId: string
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/${recordId}`)

export const getMyKpiRecord = async (
    periodId: string
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/me?period_id=${periodId}`)

export const updateRecordMetrics = async (
    recordId: string,
    payload: UpdateMetricsRequest
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/${recordId}/metrics`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })

export const updateTeachingHours = async (
    recordId: string,
    teachingHours: number
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/${recordId}/teaching-hours`, {
        method: 'PUT',
        body: JSON.stringify({ teaching_hours: teachingHours }),
    })

export const calculateRecord = async (
    recordId: string
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/${recordId}/calculate`, {
        method: 'POST',
    })

export const submitRecord = async (
    recordId: string
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/${recordId}/submit`, {
        method: 'POST',
    })

export const approveRecord = async (
    recordId: string
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/${recordId}/approve`, {
        method: 'POST',
    })

export const rejectRecord = async (
    recordId: string,
    comment: string
): Promise<KPIRecordDetail> =>
    api<KPIRecordDetail>(`${API_V1}/kpi/records/${recordId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
    })

export const getApprovalLog = async (
    recordId: string
): Promise<KPIApprovalLog[]> =>
    api<KPIApprovalLog[]>(`${API_V1}/kpi/records/${recordId}/approval-log`)

// ============================================================================
// 4. Bulk Calculation
// ============================================================================

export const bulkCalculatePeriod = async (
    periodId: string
): Promise<{ total: number; processed: number; errors: string[] }> =>
    api(`${API_V1}/kpi/periods/${periodId}/calculate-all`, {
        method: 'POST',
    })

// ============================================================================
// 5. Support Calculator
// ============================================================================

export const calculateSupportScore = async (
    payload: SupportCalcRequest
): Promise<SupportCalcResponse> =>
    api<SupportCalcResponse>(`${API_V1}/kpi/support/score-calculator`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const saveAndApplySupportCalc = async (
    recordId: string,
    payload: SupportCalcSaveRequest
): Promise<unknown> =>
    api(`${API_V1}/kpi/records/${recordId}/support-calc`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const getSupportCalcEntries = async (
    recordId: string
): Promise<SupportCalcEntryResponse[]> =>
    api<SupportCalcEntryResponse[]>(
        `${API_V1}/kpi/records/${recordId}/support-calcs`
    )

// ============================================================================
// 6. Dashboard & Reports
// ============================================================================

export const getKpiDashboard = async (
    periodId: string
): Promise<KPIDashboardSummary> =>
    api<KPIDashboardSummary>(`${API_V1}/kpi/dashboard?period_id=${periodId}`)

export const getKpiRanking = async (
    periodId: string,
    contractType?: string
): Promise<KPIRankingItem[]> => {
    const query = new URLSearchParams()
    if (contractType) query.append('contract_type', contractType)
    return api<KPIRankingItem[]>(
        `${API_V1}/kpi/reports/period/${periodId}/ranking?${query.toString()}`
    )
}

export const getStaffKpiHistory = async (
    staffId: string
): Promise<StaffKPIHistoryItem[]> =>
    api<StaffKPIHistoryItem[]>(`${API_V1}/kpi/reports/staff/${staffId}/history`)

export const getTeacherKpiHistory = async (
    teacherId: string
): Promise<StaffKPIHistoryItem[]> =>
    api<StaffKPIHistoryItem[]>(`${API_V1}/teachers/${teacherId}/kpi-history`)

// ============================================================================
// 7. Disputes
// ============================================================================

export const createKpiDispute = async (
    payload: KpiDisputeCreate
): Promise<KpiDispute> =>
    api<KpiDispute>(`${API_V1}/kpi/dispute`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const resolveKpiDispute = async (
    id: string,
    payload: KpiDisputeResolveRequest
): Promise<KpiDispute> =>
    api<KpiDispute>(`${API_V1}/kpi/dispute/${id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })

// ============================================================================
// 9. Payroll Config
// ============================================================================

export const getTeacherPayrollConfig = async (
    teacherId: string
): Promise<TeacherPayrollConfig> =>
    api<TeacherPayrollConfig>(`${API_V1}/teachers/${teacherId}/payroll-config`)

export const updateTeacherPayrollConfig = async (
    teacherId: string,
    payload: TeacherPayrollConfigUpdate
): Promise<TeacherPayrollConfig> =>
    api<TeacherPayrollConfig>(
        `${API_V1}/teachers/${teacherId}/payroll-config`,
        {
            method: 'PUT',
            body: JSON.stringify(payload),
        }
    )

// ============================================================================
// 10. Salaries
// ============================================================================

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

export const getTeacherSalaryHistory = async (
    teacherId: string,
    params: {
        page?: number
        limit?: number
        period?: string
    }
): Promise<PaginatedResponse<Salary>> => {
    const query = new URLSearchParams()
    if (params.period) query.append('period', params.period)
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())

    return api<PaginatedResponse<Salary>>(
        `${API_V1}/teachers/${teacherId}/salary-history?${query.toString()}`
    )
}

export const getSalaryDetail = async (id: string): Promise<Salary> =>
    api<Salary>(`${API_V1}/salaries/${id}`)

export const approveSalary = async (id: string): Promise<Salary> =>
    api<Salary>(`${API_V1}/salaries/${id}/approve`, { method: 'POST' })

export const addSalaryAdjustment = async (
    salaryId: string,
    payload: SalaryAdjustmentCreate
): Promise<SalaryAdjustment> =>
    api<SalaryAdjustment>(`${API_V1}/salaries/${salaryId}/adjustments`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    })

// ============================================================================
// 11. Payroll Runs
// ============================================================================

export const createPayrollRun = async (period: string): Promise<PayrollRun> =>
    api<PayrollRun>(`${API_V1}/payroll-runs`, {
        method: 'POST',
        body: JSON.stringify({ period }),
    })

export const getPayrollRuns = async (): Promise<PayrollRun[]> =>
    api<PayrollRun[]>(`${API_V1}/payroll-runs`)

export const getPayrollRunDetail = async (runId: string): Promise<PayrollRun> =>
    api<PayrollRun>(`${API_V1}/payroll-runs/${runId}`)
