export type ContractType = 'FULL_TIME' | 'PART_TIME' | 'NATIVE'
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type ActiveStatus = 'ACTIVE' | 'INACTIVE'
export type DisputeStatus = 'PENDING' | 'RESOLVED' | 'REJECTED'
export type SalaryStatus = 'DRAFT' | 'APPROVED' | 'PAID'
export type AdjustmentType = 'ALLOWANCE' | 'DEDUCTION'

export interface KpiTier {
    id: number
    tier_name: string
    min_score: number
    max_score: number
    reward_percentage: number
    reward_per_lesson: number
    status: ActiveStatus
}

export type KpiTierUpdate = Partial<KpiTier> & Omit<KpiTier, 'id'>

export interface TeacherPayrollConfig {
    teacher_id: string
    contract_type: ContractType
    base_salary: number
    lesson_rate: number
    max_kpi_bonus: number
    fixed_allowance: number
    updated_at: string
}

export interface TeacherPayrollConfigUpdate {
    contract_type: ContractType
    base_salary: number
    lesson_rate: number
    max_kpi_bonus: number
    fixed_allowance: number
}

export interface KpiCalculationJob {
    job_id: string
    period: string
    status: JobStatus
    total_teachers: number
    processed_count: number
    error_log?: string
    started_at: string
    finished_at?: string
}

export interface KpiCriteriaScoreItem {
    code: string
    score: number
    max_score: number
}

export interface KpiDetails {
    criteria_scores: KpiCriteriaScoreItem[]
}

export interface TeacherMonthlyKpi {
    id: string
    teacher_id: string
    period: string
    total_score: number
    kpi_tier_id?: number
    kpi_details: KpiDetails
    calculated_bonus: number
    created_at: string
}

export interface KpiDispute {
    id: string
    kpi_id: string
    teacher_id: string
    reason: string
    status: DisputeStatus
    resolved_by?: string
    resolution_note?: string
    created_at: string
    resolved_at?: string
}

export interface KpiDisputeCreate {
    kpi_id: string
    reason: string
}

export interface KpiDisputeResolveRequest {
    status: 'RESOLVED' | 'REJECTED'
    resolution_note: string
}

export interface Salary {
    id: string
    teacher_id: string
    period: string
    contract_type: ContractType
    lesson_count: number
    base_salary_calc: number
    kpi_bonus_calc: number
    fixed_allowance: number
    total_adjustments: number
    net_salary: number
    status: SalaryStatus
    approved_by?: string
    approved_at?: string
}

export interface SalaryAdjustmentCreate {
    adjustment_type: AdjustmentType
    amount: number
    reason: string
}

export interface SalaryAdjustment extends SalaryAdjustmentCreate {
    id: string
    salary_id: string
    created_at: string
}

export interface PayrollRun {
    id: string
    period: string
    status: JobStatus
    total_processed: number
    error_log?: string
    finished_at?: string
    created_at: string
}

// Wrapper for paginated API responses
export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
    success: boolean
    message?: string
}

export interface ApiResponse<T> {
    data: T
    success: boolean
    message?: string
}

// -- KPI Summary (Admin overview of all teachers for a period) --
export interface KpiSummaryMetrics {
    attendance: number
    feedback: number
    learning_outcome: number
    academic_audit: number
}

export interface KpiSummaryItem {
    teacher_id: string
    teacher_name: string
    total_kpi_score: number
    tier: string
    metrics: KpiSummaryMetrics
    status: string
}

export interface KpiSummaryMeta {
    page: number
    limit: number
    total: number
    total_pages: number
    period_status: string
}

export interface KpiSummaryResponse {
    data: KpiSummaryItem[]
    meta: KpiSummaryMeta
    success: boolean
    message?: string
}
