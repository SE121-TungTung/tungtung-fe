import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import FieldMessage from '@/components/common/typography/FieldMessage'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import { useKpiTiers, useUpdateKpiTiers } from '@/hooks/domain/useKpi'
import { useDialog } from '@/hooks/useDialog'

export const KpiTierConfigTable: React.FC = () => {
    const { data: tiers, isLoading } = useKpiTiers()
    const updateMutation = useUpdateKpiTiers()
    const { alert } = useDialog()

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: { tiers: [] as any[] },
    })

    const { fields } = useFieldArray({
        control,
        name: 'tiers',
    })

    useEffect(() => {
        if (tiers && tiers.length > 0) {
            reset({
                tiers: [...tiers].sort((a, b) =>
                    a.tier_name.localeCompare(b.tier_name)
                ),
            })
        } else if (tiers && tiers.length === 0) {
            // Default setup if nothing is back from API
            reset({
                tiers: [
                    {
                        id: 1,
                        tier_name: 'A',
                        min_score: 90,
                        max_score: 100,
                        reward_percentage: 10,
                        reward_per_lesson: 0,
                        status: 'ACTIVE',
                    },
                    {
                        id: 2,
                        tier_name: 'B',
                        min_score: 80,
                        max_score: 89,
                        reward_percentage: 5,
                        reward_per_lesson: 0,
                        status: 'ACTIVE',
                    },
                    {
                        id: 3,
                        tier_name: 'C',
                        min_score: 60,
                        max_score: 79,
                        reward_percentage: 0,
                        reward_per_lesson: 0,
                        status: 'ACTIVE',
                    },
                    {
                        id: 4,
                        tier_name: 'D',
                        min_score: 0,
                        max_score: 59,
                        reward_percentage: -5,
                        reward_per_lesson: 0,
                        status: 'ACTIVE',
                    },
                ],
            })
        }
    }, [tiers, reset])

    const onSubmit = (formData: any) => {
        // Prepare payload correctly by excluding unmodified arrays or IDs correctly if needed.
        // Assuming BE takes array of updates
        updateMutation.mutate(formData.tiers, {
            onSuccess: () => alert('Đã lưu cấu hình hạng KPI'),
            onError: (err: any) => alert(err?.message || 'Có lỗi xảy ra'),
        })
    }

    if (isLoading) return <div>Đang tải cấu hình...</div>

    return (
        <Card variant="glass" title="Cấu hình bậc thưởng KPI">
            <div style={{ marginBottom: '16px' }}>
                <FieldMessage tone="info">
                    Thay đổi này sẽ chỉ áp dụng từ kỳ đánh giá tiếp theo và
                    không ảnh hưởng tới kết quả đã tính.
                </FieldMessage>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left',
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                style={{
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Hạng thưởng
                            </th>
                            <th
                                style={{
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Điểm tối thiểu
                            </th>
                            <th
                                style={{
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Điểm tối đa
                            </th>
                            <th
                                style={{
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Thưởng (%)
                            </th>
                            <th
                                style={{
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Trạng thái
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => {
                            const fp = `tiers.${index}` as const
                            const tName = (field as any).tier_name
                            const style: React.CSSProperties = {
                                padding: '12px',
                                borderBottom:
                                    '1px solid var(--color-border-soft)',
                            }
                            const inputCls = {
                                width: '80px',
                                padding: '6px',
                                borderRadius: '4px',
                                border: '1px solid var(--input-border)',
                                background: 'var(--input-bg)',
                                color: 'var(--input-text)',
                            }

                            // A green badge, B yellow, C orange, D red
                            const statusColor =
                                tName === 'A'
                                    ? 'success'
                                    : tName === 'B'
                                      ? 'warning'
                                      : tName === 'C'
                                        ? 'neutral'
                                        : 'danger'

                            return (
                                <tr
                                    key={field.id}
                                    style={{
                                        transition: 'background-color 0.2s',
                                    }}
                                >
                                    <td style={style}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: `var(--color-status-${statusColor}-bg)`,
                                                    color: `var(--color-status-${statusColor}-text)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {tName}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={style}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            style={inputCls}
                                            {...register(`${fp}.min_score`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </td>
                                    <td style={style}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            style={inputCls}
                                            {...register(`${fp}.max_score`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </td>
                                    <td style={style}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}
                                        >
                                            <input
                                                type="number"
                                                step="0.1"
                                                style={inputCls}
                                                {...register(
                                                    `${fp}.reward_percentage`,
                                                    { valueAsNumber: true }
                                                )}
                                            />{' '}
                                            %
                                        </div>
                                    </td>
                                    <td style={style}>
                                        <StatusBadge
                                            variant={
                                                (field as any).status ===
                                                'ACTIVE'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                            label={
                                                (field as any).status ===
                                                'ACTIVE'
                                                    ? 'Đang áp dụng'
                                                    : 'Khóa'
                                            }
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div
                    style={{
                        marginTop: '24px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <ButtonPrimary
                        disabled={isSubmitting || updateMutation.isPending}
                        type="submit"
                    >
                        Lưu toàn bộ thay đổi
                    </ButtonPrimary>
                </div>
            </form>
        </Card>
    )
}
