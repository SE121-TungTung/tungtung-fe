import React from 'react'
import Card from '@/components/common/card/Card'
import type { TeacherMonthlyKpi } from '@/types/kpi.types'

interface KpiBreakdownCardProps {
    data?: TeacherMonthlyKpi
    readOnly?: boolean
}

export const KpiBreakdownCard: React.FC<KpiBreakdownCardProps> = ({
    data,
    readOnly = true,
}) => {
    if (!data) return null

    const criteriaNames: Record<string, string> = {
        C_ATTENDANCE: 'Chuyên cần',
        C_REVIEWS: 'Đánh giá học viên',
        C_TEST_SCORES: 'Điểm số học viên',
        C_RETENTION: 'Tỉ lệ tái đăng ký',
    }

    return (
        <Card variant="glass" style={{ padding: '24px' }}>
            <h3>Chi tiết điểm KPI ({data.period})</h3>

            <div style={{ marginTop: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th
                                style={{
                                    textAlign: 'left',
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Tiêu chí
                            </th>
                            <th
                                style={{
                                    textAlign: 'right',
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Điểm đạt
                            </th>
                            <th
                                style={{
                                    textAlign: 'right',
                                    padding: '12px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                Tối đa
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.kpi_details.criteria_scores.map((item) => (
                            <tr key={item.code}>
                                <td
                                    style={{
                                        padding: '12px',
                                        borderBottom:
                                            '1px solid var(--color-border-soft)',
                                    }}
                                >
                                    {criteriaNames[item.code] || item.code}
                                </td>
                                <td
                                    style={{
                                        textAlign: 'right',
                                        padding: '12px',
                                        borderBottom:
                                            '1px solid var(--color-border-soft)',
                                    }}
                                >
                                    <strong>{item.score}</strong>
                                </td>
                                <td
                                    style={{
                                        textAlign: 'right',
                                        padding: '12px',
                                        borderBottom:
                                            '1px solid var(--color-border-soft)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    {item.max_score}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div
                style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div>
                    <h4 style={{ margin: 0 }}>Tổng điểm KPI</h4>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Phân loại bậc hiện tại:{' '}
                        <strong>
                            {data.kpi_tier_id
                                ? `Bậc ${data.kpi_tier_id}`
                                : 'Chưa đạt'}
                        </strong>
                    </p>
                </div>
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: 'var(--color-brand-primary)',
                    }}
                >
                    {data.total_score}
                </div>
            </div>
            {!readOnly && (
                <p
                    style={{
                        marginTop: '16px',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    * Việc sửa đổi điểm thành phần hiện chưa được hỗ trợ trên
                    giao diện. Quản trị viên vui lòng xử lý ngoại lệ theo form
                    điều chỉnh lương.
                </p>
            )}
        </Card>
    )
}
