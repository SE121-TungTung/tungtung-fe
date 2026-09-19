import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getSessionAttendance,
    markAttendance,
    type AttendanceStatus,
} from '@/lib/attendance'
import { type ClassMember } from '@/components/common/card/MemberCard'
import { useDialog } from '@/hooks/useDialog'

interface AttendanceModalProps {
    sessionId: string
    students: ClassMember[]
    onClose: () => void
}

export function AttendanceModal({
    sessionId,
    students,
    onClose,
}: AttendanceModalProps) {
    const { alert } = useDialog()
    const queryClient = useQueryClient()

    const { data: attendanceRecords, isLoading } = useQuery({
        queryKey: ['session-attendance', sessionId],
        queryFn: () => getSessionAttendance(sessionId),
        enabled: !!sessionId,
    })

    const [records, setRecords] = useState<
        Record<string, { status: AttendanceStatus; notes: string }>
    >({})

    useEffect(() => {
        if (!students) return
        const initialRecords: Record<
            string,
            { status: AttendanceStatus; notes: string }
        > = {}
        students.forEach((student) => {
            const matchedRecord = attendanceRecords?.find(
                (r: any) => r.student_id === student.id
            )
            initialRecords[student.id] = {
                status: matchedRecord
                    ? (matchedRecord.status as AttendanceStatus)
                    : 'present',
                notes: matchedRecord?.remarks || '',
            }
        })
        setRecords(initialRecords)
    }, [attendanceRecords, students])

    const submitMutation = useMutation({
        mutationFn: (items: any[]) => markAttendance(sessionId, items),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            alert(res.message || 'Lưu điểm danh thành công!', 'Thành công')
            onClose()
        },
        onError: (err: any) => {
            alert(
                err?.message || 'Có lỗi xảy ra khi lưu điểm danh.',
                'Thất bại'
            )
        },
    })

    const handleStatusChange = (
        studentId: string,
        status: AttendanceStatus
    ) => {
        setRecords((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }))
    }

    const handleNotesChange = (studentId: string, notes: string) => {
        setRecords((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                notes,
            },
        }))
    }

    const handleSave = () => {
        const payload = Object.entries(records).map(([studentId, data]) => ({
            student_id: studentId,
            status: data.status,
            notes: data.notes,
        }))
        submitMutation.mutate(payload)
    }

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '12px' }}>
                    Đang tải danh sách điểm danh...
                </p>
            </div>
        )
    }

    return (
        <div style={{ textAlign: 'left' }}>
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '20px',
                    color: '#1e293b',
                }}
            >
                Chi tiết điểm danh buổi học
            </h2>

            <div
                style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    marginBottom: '24px',
                    paddingRight: '8px',
                }}
            >
                {students.map((student) => {
                    const rec = records[student.id] || {
                        status: 'present',
                        notes: '',
                    }
                    return (
                        <div
                            key={student.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                padding: '16px',
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: '#fff',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '600',
                                            color: '#475569',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {student.avatarUrl ? (
                                            <img
                                                src={student.avatarUrl}
                                                alt=""
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        ) : (
                                            `${student.lastName[0] || ''}${student.firstName[0] || ''}`
                                        )}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: '600',
                                                color: '#1e293b',
                                            }}
                                        >
                                            {student.lastName}{' '}
                                            {student.firstName}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#64748b',
                                            }}
                                        >
                                            {student.email}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {(
                                        [
                                            'present',
                                            'late',
                                            'absent',
                                            'excused',
                                        ] as AttendanceStatus[]
                                    ).map((status) => {
                                        const isSelected = rec.status === status
                                        let label = 'Có mặt'
                                        let activeBg = '#d1fae5'
                                        let activeColor = '#065f46'
                                        if (status === 'late') {
                                            label = 'Muộn'
                                            activeBg = '#fef3c7'
                                            activeColor = '#92400e'
                                        } else if (status === 'absent') {
                                            label = 'Vắng'
                                            activeBg = '#fee2e2'
                                            activeColor = '#991b1b'
                                        } else if (status === 'excused') {
                                            label = 'Phép'
                                            activeBg = '#dbeafe'
                                            activeColor = '#1e40af'
                                        }

                                        return (
                                            <button
                                                key={status}
                                                onClick={() =>
                                                    handleStatusChange(
                                                        student.id,
                                                        status
                                                    )
                                                }
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: isSelected
                                                        ? 'none'
                                                        : '1px solid #cbd5e1',
                                                    backgroundColor: isSelected
                                                        ? activeBg
                                                        : '#fff',
                                                    color: isSelected
                                                        ? activeColor
                                                        : '#64748b',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#64748b',
                                        minWidth: '60px',
                                    }}
                                >
                                    Ghi chú:
                                </span>
                                <input
                                    type="text"
                                    placeholder="Lý do vắng, đi muộn..."
                                    value={rec.notes}
                                    onChange={(e) =>
                                        handleNotesChange(
                                            student.id,
                                            e.target.value
                                        )
                                    }
                                    style={{
                                        flex: 1,
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '13px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        color: '#475569',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Hủy
                </button>
                <button
                    onClick={handleSave}
                    disabled={submitMutation.isPending}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: submitMutation.isPending ? 0.7 : 1,
                    }}
                >
                    {submitMutation.isPending ? 'Đang lưu...' : 'Lưu điểm danh'}
                </button>
            </div>
        </div>
    )
}

export default AttendanceModal
