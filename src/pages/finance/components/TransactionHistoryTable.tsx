import Card from '@/components/common/card/Card'
import { EmptyState } from '@/components/common/state/EmptyState'
import type { WalletTransaction } from '@/types/finance.types'
import s from '../Wallet.module.css'

interface TransactionHistoryTableProps {
    transactions: WalletTransaction[] | undefined
    isLoading: boolean
    currentPage: number
    totalPages: number | undefined
    onPageChange: (page: number) => void
}

const formatRefType = (ref: string) => {
    switch (ref) {
        case 'tuition':
            return 'Học phí'
        case 'salary':
            return 'Lương nhận'
        case 'refund':
            return 'Hoàn tiền'
        case 'top_up':
            return 'Nạp tiền'
        case 'withdrawal':
            return 'Rút tiền'
        default:
            return ref
    }
}

export function TransactionHistoryTable({
    transactions,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
}: TransactionHistoryTableProps) {
    return (
        <Card variant="outline" style={{ height: '100%', padding: 0 }}>
            <div className={s.cardHeader}>
                <h3 className={s.formTitle}>Lịch sử giao dịch ví</h3>
            </div>

            {isLoading ? (
                <div>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={s.skeletonRow} />
                    ))}
                </div>
            ) : !transactions || transactions.length === 0 ? (
                <EmptyState
                    title="Chưa có giao dịch"
                    description="Lịch sử nạp, rút, thanh toán sẽ xuất hiện ở đây."
                />
            ) : (
                <div className={s.tableWrapper}>
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Loại</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => {
                                const isCredit = tx.type === 'credit'
                                let statusClass = s.badgePending
                                if (tx.status === 'approved') {
                                    statusClass = s.badgeSuccess
                                } else if (tx.status === 'rejected') {
                                    statusClass = s.badgeRejected
                                }

                                return (
                                    <tr key={tx.id} className={s.tableRow}>
                                        <td className={s.dateCell}>
                                            {new Date(
                                                tx.created_at
                                            ).toLocaleString('vi-VN', {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {formatRefType(tx.reference_type)}
                                        </td>
                                        <td
                                            className={
                                                isCredit
                                                    ? s.amountCredit
                                                    : s.amountDebit
                                            }
                                        >
                                            {isCredit ? '+' : '-'}
                                            {tx.amount.toLocaleString()} đ
                                        </td>
                                        <td>
                                            <span
                                                className={`${s.badge} ${statusClass}`}
                                            >
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className={s.noteCell}>
                                            {tx.note || '—'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages !== undefined && totalPages > 1 && (
                <div className={s.pagination}>
                    <button
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className={s.paginationBtn}
                    >
                        Trước
                    </button>
                    <span className={s.paginationText}>
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className={s.paginationBtn}
                    >
                        Sau
                    </button>
                </div>
            )}
        </Card>
    )
}
