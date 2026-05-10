import React, { useState } from 'react'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import Skeleton from '@/components/effect/Skeleton'
import type { User } from '@/types/user.types'
import { useUserEnrollments } from '@/hooks/domain/useEnrollments'
import { TransferClassModal } from './TransferClassModal'

interface UserEnrollmentsModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
}

const statusMap: Record<string, any> = {
    active: { label: 'Đang học', variant: 'success' },
    completed: { label: 'Đã hoàn thành', variant: 'neutral' },
    dropped: { label: 'Đã nghỉ', variant: 'danger' },
    suspended: { label: 'Đình chỉ', variant: 'danger' },
    transferred: { label: 'Đã chuyển', variant: 'warning' },
}

export const UserEnrollmentsModal: React.FC<UserEnrollmentsModalProps> = ({
    isOpen,
    onClose,
    user,
}) => {
    const { data, isLoading } = useUserEnrollments(
        isOpen ? user?.id : undefined
    )
    const enrollments = data?.data || []

    const [transferringEnrollment, setTransferringEnrollment] =
        useState<any>(null)

    if (!user) return null

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Lớp học của ${user.lastName} ${user.firstName}`}
            >
                <div style={{ padding: '20px' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            textAlign: 'left',
                            fontSize: '14px',
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                <th
                                    style={{
                                        padding: '12px',
                                        color: 'var(--color-text-secondary)',
                                        fontWeight: 600,
                                    }}
                                >
                                    Tên lớp
                                </th>
                                <th
                                    style={{
                                        padding: '12px',
                                        color: 'var(--color-text-secondary)',
                                        fontWeight: 600,
                                    }}
                                >
                                    Trạng thái
                                </th>
                                <th
                                    style={{
                                        padding: '12px',
                                        color: 'var(--color-text-secondary)',
                                        fontWeight: 600,
                                    }}
                                >
                                    Ngày ghi danh
                                </th>
                                <th
                                    style={{
                                        padding: '12px',
                                        color: 'var(--color-text-secondary)',
                                        fontWeight: 600,
                                    }}
                                >
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '20px' }}>
                                        <Skeleton width="100%" height={120} />
                                    </td>
                                </tr>
                            ) : enrollments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{
                                            padding: '40px 20px',
                                            textAlign: 'center',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Học sinh này chưa tham gia lớp học nào.
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((e) => {
                                    const st = statusMap[e.status] || {
                                        label: e.status,
                                        variant: 'neutral',
                                    }
                                    const isActive = e.status === 'active'

                                    return (
                                        <tr
                                            key={e.id}
                                            style={{
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {e.class_name || e.class_id}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <StatusBadge
                                                    variant={st.variant}
                                                    label={st.label}
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    color: 'var(--color-text-secondary)',
                                                }}
                                            >
                                                {new Date(
                                                    e.enrollment_date
                                                ).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {isActive && (
                                                    <ButtonPrimary
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setTransferringEnrollment(
                                                                e
                                                            )
                                                        }
                                                    >
                                                        Đổi lớp
                                                    </ButtonPrimary>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
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
                            variant="outline"
                            tone="neutral"
                            onClick={onClose}
                        >
                            Đóng
                        </ButtonPrimary>
                    </div>
                </div>
            </Modal>

            {transferringEnrollment && (
                <TransferClassModal
                    isOpen={!!transferringEnrollment}
                    onClose={() => setTransferringEnrollment(null)}
                    enrollment={transferringEnrollment}
                    user={user}
                />
            )}
        </>
    )
}
