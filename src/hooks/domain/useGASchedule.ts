import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as gaApi from '@/lib/ga-schedule'
import type {
    GAScheduleRequest,
    TeacherUnavailabilityCreate,
} from '@/types/ga-schedule.types'

// ============================================================================
// GA Runs
// ============================================================================

/** Mutation: Khởi chạy GA optimizer */
export const useRunGA = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (request: GAScheduleRequest) => gaApi.runGA(request),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ga-runs'] })
        },
    })
}

/** Query: Lịch sử chạy GA (phân trang) */
export const useGARunHistory = (page: number = 1, limit: number = 20) =>
    useQuery({
        queryKey: ['ga-runs', page, limit],
        queryFn: () => gaApi.getRunHistory(page, limit),
        placeholderData: keepPreviousData,
    })

/**
 * Query: Chi tiết GA run.
 * Auto-polls every 3s khi status = pending | running.
 */
export const useGARunDetail = (runId: string | undefined) =>
    useQuery({
        queryKey: ['ga-run', runId],
        queryFn: () => gaApi.getRunDetail(runId!),
        enabled: !!runId,
        refetchInterval: (query) => {
            const status = query.state.data?.status
            if (status === 'pending' || status === 'running') return 3000
            return false
        },
    })

/** Mutation: Apply GA proposal → tạo ClassSession thật */
export const useApplyGAProposal = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (runId: string) => gaApi.applyProposal(runId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ga-runs'] })
            qc.invalidateQueries({ queryKey: ['ga-run'] })
            qc.invalidateQueries({ queryKey: ['schedule'] })
        },
    })
}

/** Mutation: Xóa GA run */
export const useDeleteGARun = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (runId: string) => gaApi.deleteRun(runId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ga-runs'] })
        },
    })
}

// ============================================================================
// Teacher Unavailability
// ============================================================================

/** Query: Danh sách lịch bận GV */
export const useTeacherUnavailability = (
    teacherId?: string,
    page: number = 1,
    limit: number = 50
) =>
    useQuery({
        queryKey: ['teacher-unavailability', teacherId, page, limit],
        queryFn: () => gaApi.getTeacherUnavailability(teacherId, page, limit),
        placeholderData: keepPreviousData,
    })

/** Mutation: Thêm lịch bận */
export const useCreateTeacherUnavailability = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: TeacherUnavailabilityCreate) =>
            gaApi.createTeacherUnavailability(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['teacher-unavailability'] })
        },
    })
}

/** Mutation: Xóa lịch bận */
export const useDeleteTeacherUnavailability = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (recordId: string) =>
            gaApi.deleteTeacherUnavailability(recordId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['teacher-unavailability'] })
        },
    })
}
