import React, { useState } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { useCreateKpiPeriod } from '@/hooks/domain/useKpi'
import type { PeriodType } from '@/types/kpi.types'
import { createPortal } from 'react-dom'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (id: string) => void
}

export function CreateKpiPeriodModal({ isOpen, onClose, onSuccess }: Props) {
    const { mutate: createPeriod, isPending } = useCreateKpiPeriod()

    const [name, setName] = useState('')
    const [periodType, setPeriodType] = useState<PeriodType>('MONTHLY')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!name || !startDate || !endDate) {
            setError('Vui lòng điền đầy đủ thông tin.')
            return
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('Ngày bắt đầu không được lớn hơn ngày kết thúc.')
            return
        }

        createPeriod(
            {
                name,
                period_type: periodType,
                start_date: startDate,
                end_date: endDate,
            },
            {
                onSuccess: (data: any) => {
                    const newId = data?.data?.id
                    if (onSuccess && newId) onSuccess(newId)
                    onClose()
                },
                onError: (err: any) => {
                    setError(
                        err.response?.data?.message ||
                            'Có lỗi xảy ra khi tạo kỳ đánh giá.'
                    )
                },
            }
        )
    }

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()}>
                <Card
                    variant="glass"
                    style={{ width: '400px', padding: '24px' }}
                >
                    <h2
                        style={{
                            marginTop: 0,
                            marginBottom: '20px',
                            fontSize: '18px',
                        }}
                    >
                        Tạo kỳ đánh giá mới
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        <InputField
                            label="Tên kỳ (VD: Tháng 5/2026)"
                            value={name}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setName(e.target.value)}
                            placeholder="Nhập tên kỳ..."
                            required
                        />

                        <SelectField
                            label="Loại kỳ"
                            value={periodType}
                            onChange={(
                                e: React.ChangeEvent<HTMLSelectElement>
                            ) => setPeriodType(e.target.value as PeriodType)}
                            options={[
                                { value: 'MONTHLY', label: 'Hàng tháng' },
                                { value: 'QUARTERLY', label: 'Hàng quý' },
                                { value: 'SEMESTER', label: 'Học kỳ' },
                            ]}
                        />

                        <InputField
                            label="Ngày bắt đầu"
                            type="date"
                            value={startDate}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setStartDate(e.target.value)}
                            required
                        />

                        <InputField
                            label="Ngày kết thúc"
                            type="date"
                            value={endDate}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setEndDate(e.target.value)}
                            required
                        />

                        {error && (
                            <div
                                style={{
                                    color: 'var(--color-status-danger)',
                                    fontSize: '14px',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                marginTop: '8px',
                            }}
                        >
                            <ButtonPrimary
                                type="button"
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    color: 'var(--color-text-secondary)',
                                    border: '1px solid var(--color-border-soft)',
                                }}
                            >
                                Hủy
                            </ButtonPrimary>
                            <ButtonPrimary type="submit" disabled={isPending}>
                                {isPending ? 'Đang tạo...' : 'Tạo kỳ'}
                            </ButtonPrimary>
                        </div>
                    </form>
                </Card>
            </div>
        </div>,
        document.body
    )
}
