import { useState, useEffect } from 'react'
import s from '../users/UserManagementPage.module.css'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { PeriodSelector } from '@/components/common/input/PeriodSelector'
import { KpiBreakdownCard } from '@/components/common/card/KpiBreakdownCard'
import { useTeacherMonthlyKpi } from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'
import ButtonGhost from '@/components/common/button/ButtonGhost'

export default function AdminTeacherKpiPage() {
    const { teacherId } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [period, setPeriod] = useState(() => {
        const urlPeriod = searchParams.get('period')
        if (urlPeriod) return urlPeriod
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })

    // Update query params when period changes
    useEffect(() => {
        setSearchParams({ period }, { replace: true })
    }, [period, setSearchParams])

    const { data: kpiData, isLoading } = useTeacherMonthlyKpi(
        teacherId || '',
        period
    )

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                    }}
                >
                    <ButtonGhost
                        onClick={() => navigate(`/admin/kpi?period=${period}`)}
                    >
                        ← Quay lại
                    </ButtonGhost>
                    <h1
                        className={s.pageTitle}
                        style={{ marginBottom: 0, flex: 1 }}
                    >
                        Chi tiết KPI Giáo viên
                    </h1>
                    <PeriodSelector
                        value={period}
                        onChange={setPeriod}
                        label="Chọn kỳ đánh giá"
                    />
                </div>

                {isLoading ? (
                    <div>Đang tải thông tin KPI...</div>
                ) : kpiData ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '24px',
                        }}
                    >
                        <KpiBreakdownCard data={kpiData} readOnly={false} />

                        {/* Giả lập KpiHistoryChart và DisputeList cho tới khi có API */}
                        <EmptyState
                            title="Lịch sử KPI"
                            description="Biểu đồ lịch sử KPI sẽ được cập nhật sau khi tích luỹ đủ dữ liệu."
                        />
                    </div>
                ) : (
                    <EmptyState
                        title="Không có KPI kỳ này"
                        description={`Giáo viên chưa có dữ liệu KPI cho tháng ${period}.`}
                    />
                )}
            </main>
        </div>
    )
}
