import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import { AsyncJobCard } from '@/components/common/async/AsyncJobCard'
import { PeriodSelector } from '@/components/common/input/PeriodSelector'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import type { KpiCalculationJob } from '@/types/kpi.types'

export default function AdminKpiCalculationPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [period, setPeriod] = useState(() => {
        const p = searchParams.get('period')
        if (p) return p
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })

    const handleStartJob = async () => {
        const res = await api<KpiCalculationJob>(
            '/api/v1/kpi/calculation-jobs',
            {
                method: 'POST',
                body: JSON.stringify({ period, force: false }),
            }
        )
        return res.job_id
    }

    const handlePollJob = async (jobId: string) => {
        const res = await api<KpiCalculationJob>(
            `/api/v1/kpi/calculation-jobs/${jobId}`
        )
        return {
            status: res.status,
            processed: res.processed_count,
            total: res.total_teachers,
            error: res.error_log,
        }
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Tiến trình tính KPI</h1>

                <div style={{ marginBottom: '16px' }}>
                    <button
                        onClick={() => navigate('/admin/kpi')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '14px',
                            padding: 0,
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Quay lại
                    </button>
                </div>

                <div
                    style={{
                        marginTop: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            marginBottom: '32px',
                            width: '100%',
                            maxWidth: '300px',
                        }}
                    >
                        <PeriodSelector
                            value={period}
                            onChange={setPeriod}
                            label="Chọn kỳ cần tính"
                        />
                    </div>

                    <div style={{ width: '100%' }}>
                        <AsyncJobCard
                            title={`Tính điểm KPI cho tháng ${period}`}
                            description="Hệ thống sẽ tổng hợp điểm danh, đánh giá, điểm số để chấm KPI cho toàn bộ giáo viên."
                            onStart={handleStartJob}
                            pollJob={handlePollJob}
                            onSuccess={() => navigate('/admin/kpi')}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
