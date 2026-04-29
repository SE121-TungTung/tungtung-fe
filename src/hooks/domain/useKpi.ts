import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import * as api from '@/lib/kpi'
import type {
    TeacherPayrollConfigUpdate,
    KpiDisputeCreate,
    KpiDisputeResolveRequest,
    SalaryAdjustmentCreate,
    KPITemplateCreate,
    KPITemplateUpdate,
    KPIPeriodCreate,
    UpdateMetricsRequest,
    SupportCalcRequest,
    SupportCalcSaveRequest,
} from '@/types/kpi.types'

// ============================================================================
// KPI Templates
// ============================================================================

export const useKpiTemplates = () =>
    useQuery({
        queryKey: ['kpi-templates'],
        queryFn: api.getKpiTemplates,
    })

export const useKpiTemplate = (id: string | undefined) =>
    useQuery({
        queryKey: ['kpi-template', id],
        queryFn: () => api.getKpiTemplate(id!),
        enabled: !!id,
    })

export const useCreateKpiTemplate = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: KPITemplateCreate) =>
            api.createKpiTemplate(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['kpi-templates'] })
        },
    })
}

export const useUpdateKpiTemplate = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: KPITemplateUpdate
        }) => api.updateKpiTemplate(id, payload),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['kpi-templates'] })
            qc.invalidateQueries({ queryKey: ['kpi-template', id] })
        },
    })
}

// ============================================================================
// KPI Periods
// ============================================================================

export const useKpiPeriods = () =>
    useQuery({
        queryKey: ['kpi-periods'],
        queryFn: api.getKpiPeriods,
    })

export const useKpiPeriodDetail = (periodId: string | undefined) =>
    useQuery({
        queryKey: ['kpi-period-detail', periodId],
        queryFn: () => api.getKpiPeriodDetail(periodId!),
        enabled: !!periodId,
    })

export const useCreateKpiPeriod = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: KPIPeriodCreate) => api.createKpiPeriod(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['kpi-periods'] })
        },
    })
}

export const useCloseKpiPeriod = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (periodId: string) => api.closeKpiPeriod(periodId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['kpi-periods'] })
        },
    })
}

// ============================================================================
// KPI Records
// ============================================================================

export const useKpiRecords = (params: {
    period_id?: string
    staff_id?: string
    status?: string
    contract_type?: string
    page?: number
    limit?: number
}) =>
    useQuery({
        queryKey: ['kpi-records', params],
        queryFn: () => api.getKpiRecords(params),
        enabled: !!params.period_id,
        placeholderData: keepPreviousData,
    })

export const useKpiRecordDetail = (recordId: string | undefined) =>
    useQuery({
        queryKey: ['kpi-record-detail', recordId],
        queryFn: () => api.getKpiRecordDetail(recordId!),
        enabled: !!recordId,
    })

export const useMyKpiRecord = (periodId: string | undefined) =>
    useQuery({
        queryKey: ['my-kpi-record', periodId],
        queryFn: () => api.getMyKpiRecord(periodId!),
        enabled: !!periodId,
    })

export const useUpdateRecordMetrics = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            recordId,
            payload,
        }: {
            recordId: string
            payload: UpdateMetricsRequest
        }) => api.updateRecordMetrics(recordId, payload),
        onSuccess: (_, { recordId }) => {
            qc.invalidateQueries({
                queryKey: ['kpi-record-detail', recordId],
            })
            qc.invalidateQueries({ queryKey: ['kpi-records'] })
        },
    })
}

export const useUpdateTeachingHours = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            recordId,
            hours,
        }: {
            recordId: string
            hours: number
        }) => api.updateTeachingHours(recordId, hours),
        onSuccess: (_, { recordId }) => {
            qc.invalidateQueries({
                queryKey: ['kpi-record-detail', recordId],
            })
        },
    })
}

export const useCalculateRecord = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (recordId: string) => api.calculateRecord(recordId),
        onSuccess: (_, recordId) => {
            qc.invalidateQueries({
                queryKey: ['kpi-record-detail', recordId],
            })
            qc.invalidateQueries({ queryKey: ['kpi-records'] })
        },
    })
}

export const useSubmitRecord = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (recordId: string) => api.submitRecord(recordId),
        onSuccess: (_, recordId) => {
            qc.invalidateQueries({
                queryKey: ['kpi-record-detail', recordId],
            })
            qc.invalidateQueries({ queryKey: ['kpi-records'] })
        },
    })
}

export const useApproveRecord = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (recordId: string) => api.approveRecord(recordId),
        onSuccess: (_, recordId) => {
            qc.invalidateQueries({
                queryKey: ['kpi-record-detail', recordId],
            })
            qc.invalidateQueries({ queryKey: ['kpi-records'] })
            qc.invalidateQueries({ queryKey: ['kpi-dashboard'] })
        },
    })
}

export const useRejectRecord = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            recordId,
            comment,
        }: {
            recordId: string
            comment: string
        }) => api.rejectRecord(recordId, comment),
        onSuccess: (_, { recordId }) => {
            qc.invalidateQueries({
                queryKey: ['kpi-record-detail', recordId],
            })
            qc.invalidateQueries({ queryKey: ['kpi-records'] })
        },
    })
}

export const useApprovalLog = (recordId: string | undefined) =>
    useQuery({
        queryKey: ['kpi-approval-log', recordId],
        queryFn: () => api.getApprovalLog(recordId!),
        enabled: !!recordId,
    })

// ============================================================================
// Bulk Calculation
// ============================================================================

export const useBulkCalculatePeriod = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (periodId: string) => api.bulkCalculatePeriod(periodId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['kpi-records'] })
            qc.invalidateQueries({ queryKey: ['kpi-dashboard'] })
        },
    })
}

// ============================================================================
// Support Calculator
// ============================================================================

export const useCalculateSupportScore = () =>
    useMutation({
        mutationFn: (payload: SupportCalcRequest) =>
            api.calculateSupportScore(payload),
    })

export const useSaveAndApplySupportCalc = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            recordId,
            payload,
        }: {
            recordId: string
            payload: SupportCalcSaveRequest
        }) => api.saveAndApplySupportCalc(recordId, payload),
        onSuccess: (_, { recordId }) => {
            qc.invalidateQueries({
                queryKey: ['kpi-record-detail', recordId],
            })
            qc.invalidateQueries({
                queryKey: ['kpi-support-calcs', recordId],
            })
        },
    })
}

export const useSupportCalcEntries = (recordId: string | undefined) =>
    useQuery({
        queryKey: ['kpi-support-calcs', recordId],
        queryFn: () => api.getSupportCalcEntries(recordId!),
        enabled: !!recordId,
    })

// ============================================================================
// Dashboard & Reports
// ============================================================================

export const useKpiDashboard = (periodId: string | undefined) =>
    useQuery({
        queryKey: ['kpi-dashboard', periodId],
        queryFn: () => api.getKpiDashboard(periodId!),
        enabled: !!periodId,
    })

export const useKpiRanking = (
    periodId: string | undefined,
    contractType?: string
) =>
    useQuery({
        queryKey: ['kpi-ranking', periodId, contractType],
        queryFn: () => api.getKpiRanking(periodId!, contractType),
        enabled: !!periodId,
    })

export const useStaffKpiHistory = (staffId: string | undefined) =>
    useQuery({
        queryKey: ['staff-kpi-history', staffId],
        queryFn: () => api.getStaffKpiHistory(staffId!),
        enabled: !!staffId,
    })

// ============================================================================
// Disputes
// ============================================================================

export const useCreateKpiDispute = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: KpiDisputeCreate) =>
            api.createKpiDispute(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-kpi-record'] })
            qc.invalidateQueries({ queryKey: ['kpi-record-detail'] })
        },
    })
}

export const useResolveKpiDispute = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: KpiDisputeResolveRequest
        }) => api.resolveKpiDispute(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['kpi-record-detail'] })
        },
    })
}

// ============================================================================
// Payroll Config
// ============================================================================

export const useTeacherPayrollConfig = (teacherId: string | undefined) =>
    useQuery({
        queryKey: ['teacher-payroll-config', teacherId],
        queryFn: () => api.getTeacherPayrollConfig(teacherId!),
        enabled: !!teacherId,
    })

export const useUpdateTeacherPayrollConfig = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            teacherId,
            payload,
        }: {
            teacherId: string
            payload: TeacherPayrollConfigUpdate
        }) => api.updateTeacherPayrollConfig(teacherId, payload),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['users'] })
            qc.invalidateQueries({
                queryKey: ['teacher-payroll-config', variables.teacherId],
            })
        },
    })
}

// ============================================================================
// Salaries
// ============================================================================

export const useSalaries = (
    params: {
        period?: string
        page?: number
        limit?: number
    },
    options?: Omit<UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'>
) =>
    useQuery({
        queryKey: ['salaries', params],
        queryFn: () => api.getSalaries(params),
        placeholderData: keepPreviousData,
        ...options,
    })

export const useMySalaryHistory = (params: {
    period?: string
    page?: number
    limit?: number
}) =>
    useQuery({
        queryKey: ['my-salary-history', params],
        queryFn: () => api.getMySalaryHistory(params),
        placeholderData: keepPreviousData,
    })

export const useTeacherSalaryHistory = (
    teacherId: string | undefined,
    params: {
        period?: string
        page?: number
        limit?: number
    }
) =>
    useQuery({
        queryKey: ['teacher-salary-history', teacherId, params],
        queryFn: () => api.getTeacherSalaryHistory(teacherId!, params),
        enabled: !!teacherId,
        placeholderData: keepPreviousData,
    })

export const useSalaryDetail = (id: string | undefined) =>
    useQuery({
        queryKey: ['salary-detail', id],
        queryFn: () => api.getSalaryDetail(id!),
        enabled: !!id,
    })

export const useApproveSalary = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => api.approveSalary(id),
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: ['salary-detail', id] })
            qc.invalidateQueries({ queryKey: ['salaries'] })
        },
    })
}

export const useAddSalaryAdjustment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            salaryId,
            payload,
        }: {
            salaryId: string
            payload: SalaryAdjustmentCreate
        }) => api.addSalaryAdjustment(salaryId, payload),
        onSuccess: (_, { salaryId }) => {
            qc.invalidateQueries({ queryKey: ['salary-detail', salaryId] })
            qc.invalidateQueries({ queryKey: ['salaries'] })
        },
    })
}

export const useCreatePayrollRun = () =>
    useMutation({
        mutationFn: (period: string) => api.createPayrollRun(period),
    })

export const usePayrollRuns = () =>
    useQuery({
        queryKey: ['payroll-runs'],
        queryFn: () => api.getPayrollRuns(),
    })

export const usePayrollRunDetail = (runId: string | undefined) =>
    useQuery({
        queryKey: ['payroll-run-detail', runId],
        queryFn: () => api.getPayrollRunDetail(runId!),
        enabled: !!runId,
    })
