// ============================================================================
// Enums
// ============================================================================

export type ContractType = 'FULL_TIME' | 'PART_TIME' | 'NATIVE'
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type ActiveStatus = 'ACTIVE' | 'INACTIVE'
export type DisputeStatus = 'PENDING' | 'RESOLVED' | 'REJECTED'
export type SalaryStatus = 'DRAFT' | 'APPROVED' | 'PAID'
export type AdjustmentType = 'ALLOWANCE' | 'DEDUCTION'
export type MetricUnit = '%' | 'score' | 'count' | 'student'
export type ApprovalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
export type DataSource = 'MANUAL' | 'AUTO_SYNC' | 'CALCULATED'
export type PeriodType = 'SEMESTER' | 'MONTHLY' | 'QUARTERLY'
export type BonusType = 'FIXED_PER_PERIOD' | 'PER_HOUR'
export type ApprovalAction =
    | 'SUBMIT'
    | 'APPROVE'
    | 'REJECT'
    | 'REQUEST_REVISION'

// ============================================================================
// KPI Template
// ============================================================================

export interface KPITemplateMetric {
    id: string
    template_id: string
    metric_code: string
    metric_name: string
    is_group_header: boolean
    unit?: MetricUnit | null
    target_min?: number | null
    target_max?: number | null
    weight?: number | null
    group_weight?: number | null
    sort_order: number
    description?: string | null
}

export interface KPITemplate {
    id: string
    name: string
    contract_type: ContractType
    max_bonus_amount: number
    bonus_type: BonusType
    version: number
    effective_from?: string | null
    is_active: boolean
    description?: string | null
    created_at?: string | null
    metrics: KPITemplateMetric[]
}

export interface KPITemplateListItem {
    id: string
    name: string
    contract_type: ContractType
    max_bonus_amount: number
    bonus_type: BonusType
    version: number
    is_active: boolean
    created_at?: string | null
}

export interface KPITemplateMetricCreate {
    metric_code: string
    metric_name: string
    is_group_header: boolean
    unit?: MetricUnit | null
    target_min?: number | null
    target_max?: number | null
    weight?: number | null
    group_weight?: number | null
    sort_order: number
    description?: string | null
}

export interface KPITemplateCreate {
    name: string
    contract_type: ContractType
    max_bonus_amount: number
    bonus_type: BonusType
    effective_from?: string | null
    description?: string | null
    metrics: KPITemplateMetricCreate[]
}

export interface KPITemplateUpdate {
    name?: string
    max_bonus_amount?: number
    bonus_type?: BonusType
    effective_from?: string | null
    description?: string | null
    is_active?: boolean
    metrics?: (KPITemplateMetricCreate & { id?: string })[]
}

// ============================================================================
// KPI Period
// ============================================================================

export interface KPIPeriod {
    id: string
    name: string
    period_type: PeriodType
    start_date: string
    end_date: string
    is_active: boolean
    created_at?: string | null
}

export interface KPIPeriodDetail extends KPIPeriod {
    total_records: number
    submitted_count: number
    approved_count: number
    draft_count: number
    rejected_count: number
}

export interface KPIPeriodCreate {
    name: string
    period_type: PeriodType
    start_date: string
    end_date: string
}

// ============================================================================
// KPI Record
// ============================================================================

export interface MetricResultResponse {
    id: string
    metric_code: string
    metric_name: string
    is_group_header: boolean
    unit?: MetricUnit | null
    target_min?: number | null
    target_max?: number | null
    weight?: number | null
    group_weight?: number | null
    actual_value?: number | null
    converted_score?: number | null
    data_source?: DataSource | null
    note?: string | null
}

export interface KPIRecordListItem {
    id: string
    staff_id: string
    staff_name?: string | null
    staff_contract?: ContractType | null
    period_id: string
    period_name?: string | null
    total_score?: number | null
    bonus_amount?: number | null
    teaching_hours?: number | null
    approval_status: ApprovalStatus
    submitted_at?: string | null
    approved_at?: string | null
}

export interface KPIRecordDetail {
    id: string
    staff_id: string
    staff_name?: string | null
    staff_contract?: ContractType | null
    period: KPIPeriod
    template: KPITemplateListItem
    total_score?: number | null
    bonus_amount?: number | null
    teaching_hours?: number | null
    approval_status: ApprovalStatus
    submitted_at?: string | null
    approved_by?: string | null
    approved_at?: string | null
    rejection_note?: string | null
    metrics: MetricResultResponse[]
}

export interface MetricActualValueInput {
    metric_code: string
    actual_value: number
}

export interface UpdateMetricsRequest {
    metrics: MetricActualValueInput[]
}

// ============================================================================
// Dashboard & Reports
// ============================================================================

export interface KPIDashboardSummary {
    period_id: string
    period_name: string
    total_staff: number
    total_teachers: number
    total_ta: number
    approved_count: number
    submitted_count: number
    draft_count: number
    rejected_count: number
    avg_score?: number | null
    total_bonus_amount?: number | null
    top_performers: Array<{
        staff_id: string
        staff_name: string
        total_score: number
        bonus_amount: number
    }>
    alerts: Array<{
        type: string
        staff_name: string
        message: string
        record_id: string
    }>
}

export interface KPIRankingItem {
    rank: number
    staff_id: string
    staff_name: string
    contract_type?: ContractType | null
    total_score: number
    bonus_amount: number
    approval_status: ApprovalStatus
}

export interface StaffKPIHistoryItem {
    period_id: string
    period_name: string
    total_score?: number | null
    bonus_amount?: number | null
    approval_status: ApprovalStatus
}

// ============================================================================
// Approval Log
// ============================================================================

export interface KPIApprovalLog {
    id: string
    kpi_record_id: string
    action: ApprovalAction
    actor_id: string
    comment?: string | null
    created_at?: string | null
}

// ============================================================================
// Support Calculator
// ============================================================================

export interface SupportCalcRequest {
    class_size: number
    max_score: number
    avg_threshold: number
    above_avg_count: number
    high_threshold: number
    above_high_count: number
    class_name?: string | null
}

export interface SupportCalcResponse {
    rate_above_avg: number
    rate_above_high: number
    breakdown: Record<string, unknown>
}

export type SupportCalcSaveRequest = SupportCalcRequest

export interface SupportCalcEntryResponse {
    id: string
    kpi_record_id: string
    class_name?: string | null
    class_size: number
    max_score: number
    avg_threshold: number
    above_avg_count: number
    high_threshold: number
    above_high_count: number
    rate_above_avg: number
    rate_above_high: number
    created_at?: string | null
}

// ============================================================================
// Dispute
// ============================================================================

export interface KpiDispute {
    id: string
    kpi_record_id?: string | null
    kpi_id?: string | null
    teacher_id: string
    reason: string
    status: DisputeStatus
    resolved_by?: string | null
    resolution_note?: string | null
    created_at: string
    resolved_at?: string | null
}

export interface KpiDisputeCreate {
    kpi_record_id: string
    reason: string
}

export interface KpiDisputeResolveRequest {
    status: 'RESOLVED' | 'REJECTED'
    resolution_note: string
}

// ============================================================================
// KPI Tiers (deprecated — kept for backward compat)
// ============================================================================

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

// ============================================================================
// Payroll Config
// ============================================================================

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

// ============================================================================
// Salary
// ============================================================================

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

// ============================================================================
// Pagination wrappers
// ============================================================================

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
