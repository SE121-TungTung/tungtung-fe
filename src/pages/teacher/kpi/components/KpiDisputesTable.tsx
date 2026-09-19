import type { KpiDispute } from '@/types/kpi.types'
import s from './KpiDisputesTable.module.css'

interface KpiDisputesTableProps {
    disputes: KpiDispute[]
}

export default function KpiDisputesTable({ disputes }: KpiDisputesTableProps) {
    if (!disputes || disputes.length === 0) return null

    return (
        <div className={s.tableContainer}>
            <h2 className={s.tableTitle}>Lịch sử khiếu nại KPI</h2>
            <div className={s.tableWrapper}>
                <table className={s.disputesTable}>
                    <thead>
                        <tr className={s.tableHeaderRow}>
                            <th className={s.thCell}>Ngày gửi</th>
                            <th className={s.thCell}>Kỳ KPI</th>
                            <th className={s.thCell}>Nội dung khiếu nại</th>
                            <th className={s.thCell}>Trạng thái</th>
                            <th className={s.thCell}>Phản hồi từ Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disputes.map((disp) => (
                            <tr key={disp.id} className={s.tableBodyRow}>
                                <td className={s.tdDate}>
                                    {new Date(
                                        disp.created_at
                                    ).toLocaleDateString('vi-VN')}
                                </td>
                                <td className={s.tdPeriod}>
                                    {disp.period_name || '—'}
                                </td>
                                <td className={s.tdReason}>{disp.reason}</td>
                                <td className={s.tdCell}>
                                    <span
                                        className={`${s.badge} ${
                                            disp.status === 'RESOLVED'
                                                ? s.badgeResolved
                                                : disp.status === 'REJECTED'
                                                  ? s.badgeRejected
                                                  : s.badgePending
                                        }`}
                                    >
                                        {disp.status === 'RESOLVED'
                                            ? 'Đồng ý'
                                            : disp.status === 'REJECTED'
                                              ? 'Từ chối'
                                              : 'Đang xử lý'}
                                    </span>
                                </td>
                                <td className={s.tdResolution}>
                                    {disp.resolution_note || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
