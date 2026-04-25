import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useUpdateTeacherPayrollConfig } from '@/hooks/domain/useKpi'
import { useDialog } from '@/hooks/useDialog'
import type { TeacherPayrollConfigUpdate } from '@/types/kpi.types'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Hook to fetch config directly since we haven't defined it in useKpi yet
const useGetPayrollConfig = (teacherId: string) => {
    return useQuery({
        queryKey: ['teacher-payroll-config', teacherId],
        queryFn: async () => {
            const res = await api<any>(
                `/api/v1/teachers/${teacherId}/payroll-config`
            )
            return res.data
        },
        enabled: !!teacherId,
    })
}

export const TeacherPayrollConfigPanel: React.FC<{ teacherId: string }> = ({
    teacherId,
}) => {
    const { data, isLoading } = useGetPayrollConfig(teacherId)
    const updateMutation = useUpdateTeacherPayrollConfig()
    const { alert } = useDialog()

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<TeacherPayrollConfigUpdate>({
        defaultValues: {
            contract_type: 'PART_TIME',
            base_salary: 0,
            lesson_rate: 0,
            max_kpi_bonus: 0,
            fixed_allowance: 0,
        },
    })

    useEffect(() => {
        if (data) {
            reset({
                contract_type: data.contract_type || 'PART_TIME',
                base_salary: data.base_salary || 0,
                lesson_rate: data.lesson_rate || 0,
                max_kpi_bonus: data.max_kpi_bonus || 0,
                fixed_allowance: data.fixed_allowance || 0,
            })
        }
    }, [data, reset])

    const onSubmit = (formData: TeacherPayrollConfigUpdate) => {
        updateMutation.mutate(
            { teacherId, payload: formData },
            {
                onSuccess: () => {
                    alert('Cấu hình lương thành công!')
                },
                onError: (err: any) => {
                    alert(err?.message || 'Có lỗi xảy ra')
                },
            }
        )
    }

    if (isLoading) return <div>Đang tải cấu hình...</div>

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
            <SelectField
                label="Loại hợp đồng"
                registration={register('contract_type')}
                options={[
                    { label: 'Thỉnh giảng (Part-time)', value: 'PART_TIME' },
                    { label: 'Cơ hữu (Full-time)', value: 'FULL_TIME' },
                    { label: 'Giáo viên Bản ngữ', value: 'NATIVE' },
                ]}
            />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                }}
            >
                <InputField
                    label="Lương cơ bản / Cố định"
                    type="number"
                    {...register('base_salary', { valueAsNumber: true })}
                />
                <InputField
                    label="Đơn giá tiết dạy"
                    type="number"
                    {...register('lesson_rate', { valueAsNumber: true })}
                />
                <InputField
                    label="Thưởng KPI tối đa (%)"
                    type="number"
                    {...register('max_kpi_bonus', { valueAsNumber: true })}
                />
                <InputField
                    label="Phụ cấp cố định"
                    type="number"
                    {...register('fixed_allowance', { valueAsNumber: true })}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ButtonPrimary
                    type="submit"
                    disabled={isSubmitting || updateMutation.isPending}
                >
                    Lưu cấu hình lương
                </ButtonPrimary>
            </div>
        </form>
    )
}
