import React, { useState } from 'react'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { SelectField } from '@/components/common/input/SelectField'
import { useClasses } from '@/hooks/domain/useClasses'
import { useTransferClass } from '@/hooks/domain/useEnrollments'
import { useDialog } from '@/hooks/useDialog'
import type { User } from '@/types/user.types'

interface TransferClassModalProps {
    isOpen: boolean
    onClose: () => void
    enrollment: any
    user: User
}

export const TransferClassModal: React.FC<TransferClassModalProps> = ({
    isOpen,
    onClose,
    enrollment,
    user,
}) => {
    const { alert } = useDialog()
    const [selectedClassId, setSelectedClassId] = useState<string>('')

    // Fetch classes (Active & Scheduled)
    const { data: classesData, isLoading } = useClasses({
        // Depending on BE capabilities, we might not be able to filter by courseId directly via generic search,
        // so we fetch a large list or just standard active ones.
        status: 'active', // Only transfer to active classes? Let's assume active or scheduled.
        limit: 100, // fetch up to 100 classes
    })

    const { mutateAsync: transferClass, isPending } = useTransferClass()

    // Filter available classes
    const availableClasses = (classesData?.items || []).filter(
        (c) =>
            // Different from current class
            c.id !== enrollment.class_id &&
            // Not full (assuming c.currentStudents < c.maxStudents)
            c.currentStudents < c.maxStudents
    )

    const handleTransfer = async () => {
        if (!selectedClassId) {
            alert('Vui lòng chọn lớp học mới', 'Lỗi')
            return
        }

        try {
            await transferClass({
                oldEnrollmentId: enrollment.id,
                studentId: user.id,
                newClassId: selectedClassId,
                feePaid: 0, // Mặc định là 0 như yêu cầu
            })
            alert('Đổi lớp thành công!', 'Thành công')
            onClose()
        } catch (err: any) {
            alert(`Lỗi khi đổi lớp: ${err.message}`, 'Lỗi')
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Đổi lớp học">
            <div
                style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                <p
                    style={{
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    Học sinh{' '}
                    <strong>
                        {user.lastName} {user.firstName}
                    </strong>{' '}
                    đang học lớp <strong>{enrollment.class_name}</strong>. Chọn
                    lớp học mới bên dưới:
                </p>

                {isLoading ? (
                    <div
                        style={{
                            padding: '10px 0',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Đang tải danh sách lớp...
                    </div>
                ) : (
                    <SelectField
                        id="newClass"
                        label="Lớp học mới"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        options={[
                            { label: '-- Chọn lớp học mới --', value: '' },
                            ...availableClasses.map((c) => ({
                                label: `${c.name} (${c.course.name}) - Sĩ số: ${c.currentStudents}/${c.maxStudents}`,
                                value: c.id,
                            })),
                        ]}
                        registration={{ name: 'newClass' } as any}
                    />
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '12px',
                    }}
                >
                    <ButtonPrimary
                        variant="outline"
                        tone="neutral"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Hủy
                    </ButtonPrimary>
                    <ButtonPrimary
                        onClick={handleTransfer}
                        disabled={!selectedClassId || isPending}
                        loading={isPending}
                    >
                        Xác nhận chuyển
                    </ButtonPrimary>
                </div>
            </div>
        </Modal>
    )
}
