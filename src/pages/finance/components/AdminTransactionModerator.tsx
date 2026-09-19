import { useRef } from 'react'
import Card from '@/components/common/card/Card'
import { EmptyState } from '@/components/common/state/EmptyState'
import {
    useAdminWalletTransactions,
    useAdminApproveWalletTransaction,
    useAdminRejectWalletTransaction,
} from '@/hooks/domain/useFinance'
import { useDialog } from '@/hooks/useDialog'
import s from '../Wallet.module.css'

interface AdminTransactionModeratorProps {
    filterStatus: string
    page: number
    onFilterChange: (status: string) => void
    onPageChange: (page: number) => void
}

const FILTER_TABS = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Bị từ chối' },
    { key: 'all', label: 'Tất cả' },
]

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

export function AdminTransactionModerator({
    filterStatus,
    page,
    onFilterChange,
    onPageChange,
}: AdminTransactionModeratorProps) {
    const noteRef = useRef('')
    const { alert, confirm } = useDialog()

    const { data: adminTxRes, isLoading } = useAdminWalletTransactions({
        status: filterStatus,
        page,
        limit: 10,
    })

    const approveTx = useAdminApproveWalletTransaction()
    const rejectTx = useAdminRejectWalletTransaction()

    const handleAdminApprove = async (txId: string) => {
        noteRef.current = 'Đã duyệt qua hệ thống quản lý'
        const confirmApprove = await confirm({
            title: 'Duyệt giao dịch',
            message: '',
            confirmText: 'Phê duyệt',
            cancelText: 'Hủy',
            renderConfirm: () => (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '4px 0',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}
                    >
                        Bạn có chắc chắn muốn PHÊ DUYỆT giao dịch này không?
                    </p>
                    <label
                        htmlFor="approveNoteInput"
                        style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        Nhập ghi chú phê duyệt (tùy chọn):
                    </label>
                    <input
                        id="approveNoteInput"
                        type="text"
                        defaultValue={noteRef.current}
                        onChange={(e) => {
                            noteRef.current = e.target.value
                        }}
                        className={s.inputField}
                    />
                </div>
            ),
        })
        if (!confirmApprove) return

        approveTx.mutate(
            {
                txId,
                payload: { note: noteRef.current || undefined },
            },
            {
                onSuccess: () => {
                    alert('Giao dịch đã được duyệt thành công!', 'Thành công')
                },
                onError: (err: any) => {
                    alert(err.message || 'Lỗi phê duyệt', 'Lỗi')
                },
            }
        )
    }

    const handleAdminReject = async (txId: string) => {
        noteRef.current = 'Không đúng thông tin giao dịch'
        const confirmReject = await confirm({
            title: 'Từ chối giao dịch',
            message: '',
            confirmText: 'Từ chối',
            cancelText: 'Hủy',
            type: 'danger',
            renderConfirm: () => (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '4px 0',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}
                    >
                        Bạn có chắc chắn muốn TỪ CHỐI giao dịch này không? Số
                        tiền (nếu là rút tiền) sẽ được hoàn trả.
                    </p>
                    <label
                        htmlFor="rejectNoteInput"
                        style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        Nhập lý do từ chối (bắt buộc):
                    </label>
                    <input
                        id="rejectNoteInput"
                        type="text"
                        defaultValue={noteRef.current}
                        onChange={(e) => {
                            noteRef.current = e.target.value
                        }}
                        className={s.inputField}
                    />
                </div>
            ),
        })
        if (!confirmReject) return
        if (!noteRef.current.trim()) {
            alert('Vui lòng nhập lý do từ chối', 'Lỗi')
            return
        }

        rejectTx.mutate(
            {
                txId,
                payload: { note: noteRef.current },
            },
            {
                onSuccess: () => {
                    alert('Giao dịch đã bị từ chối!', 'Thành công')
                },
                onError: (err: any) => {
                    alert(err.message || 'Lỗi từ chối', 'Lỗi')
                },
            }
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Filter selector */}
            <div className={s.adminFilterBar}>
                <div className={s.filterBtnGroup}>
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onFilterChange(tab.key)}
                            className={`${s.filterBtn} ${filterStatus === tab.key ? s.filterBtnActive : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    Danh sách giao dịch nạp/rút cần Office Admin xử lý.
                </div>
            </div>

            <Card variant="outline" style={{ padding: 0 }}>
                {isLoading ? (
                    <div>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={s.skeletonRow} />
                        ))}
                    </div>
                ) : !adminTxRes?.data || adminTxRes.data.length === 0 ? (
                    <EmptyState
                        title="Không tìm thấy giao dịch nào"
                        description="Không có yêu cầu nạp/rút tiền nào khớp với bộ lọc."
                    />
                ) : (
                    <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    <th>Người yêu cầu</th>
                                    <th>Thời gian</th>
                                    <th>Loại giao dịch</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Chi tiết</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminTxRes.data.map((tx) => {
                                    const isCredit = tx.type === 'credit'
                                    let statusClass = s.badgePending
                                    if (tx.status === 'approved') {
                                        statusClass = s.badgeSuccess
                                    } else if (tx.status === 'rejected') {
                                        statusClass = s.badgeRejected
                                    }

                                    return (
                                        <tr key={tx.id} className={s.tableRow}>
                                            <td>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {tx.user_fullname ||
                                                            'Người dùng ẩn'}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '11px',
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                    >
                                                        {tx.user_email || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={s.dateCell}>
                                                {new Date(
                                                    tx.created_at
                                                ).toLocaleString('vi-VN')}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                {formatRefType(
                                                    tx.reference_type
                                                )}
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
                                                {tx.reference_type ===
                                                    'withdrawal' &&
                                                    tx.extra_metadata
                                                        ?.bank_name && (
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    '10px',
                                                                marginTop:
                                                                    '4px',
                                                                padding: '4px',
                                                                background:
                                                                    'rgba(255,255,255,0.05)',
                                                                borderRadius:
                                                                    '4px',
                                                            }}
                                                        >
                                                            Bank:{' '}
                                                            {
                                                                tx
                                                                    .extra_metadata
                                                                    .bank_name
                                                            }{' '}
                                                            | A/C:{' '}
                                                            {
                                                                tx
                                                                    .extra_metadata
                                                                    .account_number
                                                            }{' '}
                                                            | Name:{' '}
                                                            {
                                                                tx
                                                                    .extra_metadata
                                                                    .account_name
                                                            }
                                                        </div>
                                                    )}
                                            </td>
                                            <td>
                                                {tx.status === 'pending' ? (
                                                    <div
                                                        className={s.actionCell}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleAdminApprove(
                                                                    tx.id
                                                                )
                                                            }
                                                            className={`${s.actionBtn} ${s.actionBtnApprove}`}
                                                            title="Duyệt giao dịch"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleAdminReject(
                                                                    tx.id
                                                                )
                                                            }
                                                            className={`${s.actionBtn} ${s.actionBtnReject}`}
                                                            title="Từ chối"
                                                        >
                                                            ✗
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        style={{
                                                            fontSize: '12px',
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                    >
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Admin Pagination */}
                {adminTxRes?.meta && adminTxRes.meta.total_pages > 1 && (
                    <div className={s.pagination}>
                        <button
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                            className={s.paginationBtn}
                        >
                            Trước
                        </button>
                        <span className={s.paginationText}>
                            {page} / {adminTxRes.meta.total_pages}
                        </span>
                        <button
                            disabled={page === adminTxRes.meta.total_pages}
                            onClick={() => onPageChange(page + 1)}
                            className={s.paginationBtn}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </Card>
        </div>
    )
}
