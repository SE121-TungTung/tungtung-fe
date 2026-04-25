import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '@/lib/kpi'
import type {
    KpiTierUpdate,
    TeacherPayrollConfigUpdate,
    KpiDisputeCreate,
    KpiDisputeResolveRequest,
    SalaryAdjustmentCreate,
} from '@/types/kpi.types'

// -- TIERS --
export const useKpiTiers = () => {
    return useQuery({
        queryKey: ['kpi-tiers'],
        queryFn: api.getKpiTiers,
    })
}

export const useUpdateKpiTiers = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: KpiTierUpdate[]) => api.updateKpiTiers(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['kpi-tiers'] })
        },
    })
}

// -- CALCULATION JOB --
export const useCreateKpiJob = () => {
    return useMutation({
        mutationFn: ({ period, force }: { period: string; force?: boolean }) =>
            api.createKpiCalculationJob(period, force),
    })
}

// useAsyncJob is an abstraction that acts generically. I provide a specific hook just for polling if needed, but typically useAsyncJob will handle polling internally based on jobId.
export const useKpiJobStatus = (jobId: string | null) => {
    return useQuery({
        queryKey: ['kpi-job-status', jobId],
        queryFn: () => api.getKpiCalculationJob(jobId!),
        enabled: !!jobId,
        refetchInterval: (query) => {
            const status = query.state.data?.status
            return status === 'PENDING' || status === 'PROCESSING'
                ? 2000
                : false
        },
    })
}

// -- TEACHER KPI --
export const useTeacherMonthlyKpi = (teacherId: string, period: string) => {
    return useQuery({
        queryKey: ['teacher-kpi', teacherId, period],
        queryFn: () => api.getTeacherMonthlyKpi(teacherId, period),
        enabled: !!teacherId && !!period,
    })
}

export const useMyKpi = (period: string) => {
    return useQuery({
        queryKey: ['my-kpi', period],
        queryFn: () => api.getMyKpi(period),
        enabled: !!period,
    })
}

// -- DISPUTE --
export const useCreateKpiDispute = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: KpiDisputeCreate) =>
            api.createKpiDispute(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-kpi'] })
            qc.invalidateQueries({ queryKey: ['teacher-kpi'] })
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
            qc.invalidateQueries({ queryKey: ['teacher-kpi'] })
        },
    })
}

// -- PAYROLL CONFIG --
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

// -- SALARY LIST --
export const useSalaries = (params: {
    period?: string
    page?: number
    limit?: number
}) => {
    return useQuery({
        queryKey: ['salaries', params],
        queryFn: () => api.getSalaries(params),
        placeholderData: keepPreviousData,
    })
}

export const useMySalaryHistory = (params: {
    period?: string
    page?: number
    limit?: number
}) => {
    return useQuery({
        queryKey: ['my-salary-history', params],
        queryFn: () => api.getMySalaryHistory(params),
        placeholderData: keepPreviousData,
    })
}

export const useSalaryDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['salary-detail', id],
        queryFn: () => api.getSalaryDetail(id!),
        enabled: !!id,
    })
}

// -- SALARY ACTIONS --
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

// -- PAYROLL RUN --
export const useCreatePayrollRun = () => {
    return useMutation({
        mutationFn: (period: string) => api.createPayrollRun(period),
    })
}

// -- KPI SUMMARY (Admin overview) --
export const useKpiSummary = (params: {
    period: string
    page?: number
    limit?: number
}) => {
    return useQuery({
        queryKey: ['kpi-summary', params],
        queryFn: () => api.getKpiSummary(params),
        enabled: !!params.period,
        placeholderData: keepPreviousData,
    })
}
