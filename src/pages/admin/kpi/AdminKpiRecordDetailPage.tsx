import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import kpiS from './AdminKpiOverviewPage.module.css'
import { useParams, useNavigate } from 'react-router-dom'
import { KpiBreakdownCard } from '@/components/common/card/KpiBreakdownCard'
import {
    useKpiRecordDetail,
    useCalculateRecord,
    useSubmitRecord,
    useApproveRecord,
    useRejectRecord,
    useApprovalLog,
} from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { Modal } from '@/components/core/Modal'
import Card from '@/components/common/card/Card'

export default function AdminKpiRecordDetailPage() {
    const { recordId } = useParams()
    const navigate = useNavigate()

    const { data: record, isLoading } = useKpiRecordDetail(recordId)
    const { data: approvalLogs } = useApprovalLog(recordId)

    const calcMutation = useCalculateRecord()
    const submitMutation = useSubmitRecord()
    const approveMutation = useApproveRecord()
    const rejectMutation = useRejectRecord()

    const [isRejectOpen, setIsRejectOpen] = useState(false)
    const [rejectComment, setRejectComment] = useState('')

    const handleCalculate = () => {
        if (!recordId) return
        calcMutation.mutate(recordId)
    }

    const handleSubmit = () => {
        if (!recordId) return
        submitMutation.mutate(recordId)
    }

    const handleApprove = () => {
        if (!recordId) return
        approveMutation.mutate(recordId)
    }

    const handleReject = () => {
        if (!recordId || !rejectComment.trim()) return
        rejectMutation.mutate(
            { recordId, comment: rejectComment },
            {
                onSuccess: () => {
                    setIsRejectOpen(false)
                    setRejectComment('')
                },
            }
        )
    }

    const status = record?.approval_status
    const isPending =
        calcMutation.isPending ||
        submitMutation.isPending ||
        approveMutation.isPending ||
        rejectMutation.isPending

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                    }}
                >
                    <ButtonGhost onClick={() => navigate('/admin/kpi')}>
                        ← Quay lại
                    </ButtonGhost>
                    <h1
                        className={s.pageTitle}
                        style={{ marginBottom: 0, flex: 1 }}
                    >
                        Chi tiết bản ghi KPI
                    </h1>
                </div>

                {isLoading ? (
                    <div>Đang tải thông tin KPI...</div>
                ) : record ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '24px',
                        }}
                    >
                        <KpiBreakdownCard data={record} readOnly={false} />

                        {/* Action Buttons */}
                        <Card
                            variant="outline"
                            style={{
                                padding: '20px 24px',
                                display: 'flex',
                                gap: 12,
                                flexWrap: 'wrap',
                                alignItems: 'center',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    marginRight: 'auto',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Hành động:
                            </span>

                            {/* Calculate — available for DRAFT and SUBMITTED */}
                            {(status === 'DRAFT' || status === 'SUBMITTED') && (
                                <ButtonPrimary
                                    onClick={handleCalculate}
                                    disabled={isPending}
                                    style={{
                                        background: '#6366f1',
                                        borderColor: '#6366f1',
                                    }}
                                >
                                    {calcMutation.isPending
                                        ? 'Đang tính...'
                                        : 'Tính lại điểm'}
                                </ButtonPrimary>
                            )}

                            {/* Submit — available for DRAFT or REJECTED */}
                            {(status === 'DRAFT' || status === 'REJECTED') && (
                                <ButtonPrimary
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    style={{
                                        background: '#2563eb',
                                        borderColor: '#2563eb',
                                    }}
                                >
                                    {submitMutation.isPending
                                        ? 'Đang gửi...'
                                        : 'Submit duyệt'}
                                </ButtonPrimary>
                            )}

                            {/* Approve — available for SUBMITTED */}
                            {status === 'SUBMITTED' && (
                                <ButtonPrimary
                                    onClick={handleApprove}
                                    disabled={isPending}
                                    style={{
                                        background: '#16a34a',
                                        borderColor: '#16a34a',
                                    }}
                                >
                                    {approveMutation.isPending
                                        ? 'Đang duyệt...'
                                        : '✓ Duyệt'}
                                </ButtonPrimary>
                            )}

                            {/* Reject — available for SUBMITTED */}
                            {status === 'SUBMITTED' && (
                                <ButtonPrimary
                                    onClick={() => setIsRejectOpen(true)}
                                    disabled={isPending}
                                    style={{
                                        background: '#dc2626',
                                        borderColor: '#dc2626',
                                    }}
                                >
                                    ✕ Từ chối
                                </ButtonPrimary>
                            )}

                            {status === 'APPROVED' && (
                                <span
                                    style={{
                                        fontSize: 14,
                                        color: '#16a34a',
                                        fontWeight: 600,
                                    }}
                                >
                                    ✓ Bản ghi đã được duyệt
                                </span>
                            )}
                        </Card>

                        {/* Approval Log */}
                        {approvalLogs && approvalLogs.length > 0 && (
                            <Card
                                variant="outline"
                                style={{ padding: '20px 24px' }}
                            >
                                <h4 style={{ margin: '0 0 12px' }}>
                                    Lịch sử duyệt
                                </h4>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    {approvalLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            style={{
                                                display: 'flex',
                                                gap: 12,
                                                alignItems: 'center',
                                                padding: '8px 12px',
                                                borderRadius: 6,
                                                background:
                                                    'var(--color-surface-raised)',
                                                fontSize: 13,
                                            }}
                                        >
                                            <span
                                                className={kpiS.statusChip}
                                                style={{
                                                    fontSize: 11,
                                                    padding: '2px 8px',
                                                }}
                                            >
                                                {log.action}
                                            </span>
                                            {log.comment && (
                                                <span
                                                    style={{
                                                        flex: 1,
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    {log.comment}
                                                </span>
                                            )}
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: 'var(--color-text-secondary)',
                                                    opacity: 0.6,
                                                }}
                                            >
                                                {log.created_at
                                                    ? new Date(
                                                          log.created_at
                                                      ).toLocaleString('vi-VN')
                                                    : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title="Không tìm thấy"
                        description="Bản ghi KPI không tồn tại hoặc bạn không có quyền truy cập."
                    />
                )}
            </main>

            {/* Reject Modal */}
            <Modal
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                title="Từ chối bản ghi KPI"
                footer={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                            width: '100%',
                        }}
                    >
                        <ButtonGhost onClick={() => setIsRejectOpen(false)}>
                            Hủy
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleReject}
                            disabled={
                                rejectMutation.isPending ||
                                rejectComment.trim().length < 5
                            }
                            style={{
                                background: '#dc2626',
                                borderColor: '#dc2626',
                            }}
                        >
                            {rejectMutation.isPending
                                ? 'Đang xử lý...'
                                : 'Xác nhận từ chối'}
                        </ButtonPrimary>
                    </div>
                }
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: 14,
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự):
                    </p>
                    <textarea
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        rows={4}
                        placeholder="VD: Dữ liệu A1 chưa chính xác, cần kiểm tra lại..."
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: '1.5px solid var(--color-border-soft)',
                            fontFamily: 'inherit',
                            fontSize: 14,
                            resize: 'vertical',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                </div>
            </Modal>
        </div>
    )
}
