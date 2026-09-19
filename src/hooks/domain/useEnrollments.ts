import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/enrollments'

export const useUserEnrollments = (studentId: string | undefined) => {
    return useQuery({
        queryKey: ['enrollments', 'student', studentId],
        queryFn: () => api.getEnrollments({ student_id: studentId }),
        enabled: !!studentId,
    })
}

export const useCreateEnrollment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: api.CreateEnrollmentDto) =>
            api.createEnrollment(payload),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({
                queryKey: ['enrollments'],
            })
            qc.invalidateQueries({
                queryKey: ['class-enrollments', variables.class_id],
            })
            qc.invalidateQueries({
                queryKey: ['classes'],
            })
        },
    })
}

export const useUpdateEnrollment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: api.UpdateEnrollmentDto
        }) => api.updateEnrollment(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['enrollments'] })
        },
    })
}

export const useTransferClass = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({
            oldEnrollmentId,
            studentId,
            newClassId,
            feePaid = 0,
        }: {
            oldEnrollmentId: string
            studentId: string
            newClassId: string
            feePaid?: number
        }) => {
            // 1. Update old enrollment to 'transferred'
            await api.updateEnrollment(oldEnrollmentId, {
                status: 'transferred',
            })

            // 2. Create new enrollment
            return await api.createEnrollment({
                class_id: newClassId,
                student_id: studentId,
                fee_paid: feePaid,
                payment_status: 'pending',
                status: 'active',
            })
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({
                queryKey: ['enrollments', 'student', variables.studentId],
            })
            qc.invalidateQueries({ queryKey: ['classes'] })
        },
    })
}
