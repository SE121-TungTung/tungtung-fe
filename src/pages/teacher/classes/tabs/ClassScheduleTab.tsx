import React from 'react'
import { SlotSelectionMatrix } from '@/components/feature/schedule/SlotSelectionMatrix'
import Pagination from '@/components/common/menu/Pagination'
import s from '../TeacherClassDetail.module.css'

interface ClassScheduleTabProps {
    subTab: 'schedule' | 'sessions'
    classDetail: any
    sessions: any[]
    filteredSessions: any[]
    paginatedSessions: any[]
    attendanceFilter: string
    setAttendanceFilter: (val: string) => void
    timeFilter: string
    setTimeFilter: (val: string) => void
    currentPage: number
    setCurrentPage: (page: number) => void
    totalPages: number
    isGeneratingQr: boolean
    onGenerateQr: (sessionId: string) => void
    onOpenQrModal: (session: any) => void
    onOpenSubstitutionModal: (session: any) => void
    onOpenAttendanceModal: (sessionId: string) => void
}

export const ClassScheduleTab: React.FC<ClassScheduleTabProps> = ({
    subTab,
    classDetail,
    sessions,
    filteredSessions,
    paginatedSessions,
    attendanceFilter,
    setAttendanceFilter,
    timeFilter,
    setTimeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    isGeneratingQr,
    onGenerateQr,
    onOpenQrModal,
    onOpenSubstitutionModal,
    onOpenAttendanceModal,
}) => {
    if (subTab === 'schedule') {
        return (
            <div style={{ maxWidth: 800, width: '100%', textAlign: 'left' }}>
                <div className={s.card}>
                    <p style={{ fontWeight: 600, marginBottom: 12 }}>
                        Lịch học mong muốn:
                    </p>
                    <div style={{ marginBottom: 24 }}>
                        <SlotSelectionMatrix
                            value={classDetail?.preferredSlots || []}
                            readOnly
                        />
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 12 }}>
                        Lịch bận cố định:
                    </p>
                    <div>
                        <SlotSelectionMatrix
                            value={classDetail?.unavailableSlots || []}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ width: '100%', maxWidth: 800, textAlign: 'left' }}>
            <div className={s.card}>
                {/* Header & Filter Row */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        gap: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: 0,
                        }}
                    >
                        Danh sách buổi học ({filteredSessions.length}/
                        {sessions.length})
                    </h3>

                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Filter 1: Attendance */}
                        <select
                            value={attendanceFilter}
                            onChange={(e) =>
                                setAttendanceFilter(e.target.value)
                            }
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#fff',
                                color: '#1e293b',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            <option value="all">Tất cả điểm danh</option>
                            <option value="taken">Đã điểm danh</option>
                            <option value="not_taken">Chưa điểm danh</option>
                        </select>

                        {/* Filter 2: Time / Status */}
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#fff',
                                color: '#1e293b',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="ongoing">Đang diễn ra</option>
                            <option value="ended_unattended">
                                Đã kết thúc & Chưa điểm danh
                            </option>
                            <option value="not_started">Chưa bắt đầu</option>
                        </select>
                    </div>
                </div>

                {sessions.length === 0 ? (
                    <p className={s.emptyText}>
                        Không có thông tin buổi học nào cho lớp học này.
                    </p>
                ) : filteredSessions.length === 0 ? (
                    <p className={s.emptyText}>
                        Không tìm thấy buổi học nào phù hợp với bộ lọc đã chọn.
                    </p>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        {paginatedSessions.map((session: any) => {
                            const sessionDate = new Date(session.session_date)
                            const now = new Date()
                            const isCompleted =
                                session.status === 'completed' ||
                                session.attendance_taken
                            const isQrActive =
                                session.qr_token &&
                                session.qr_expires_at &&
                                new Date(session.qr_expires_at).getTime() >
                                    now.getTime()

                            return (
                                <div
                                    key={session.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#f8fafc',
                                        flexWrap: 'wrap',
                                        gap: '12px',
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#1e293b',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            {session.topic ||
                                                session.title ||
                                                'Buổi học'}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                color: '#64748b',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span>
                                                📅{' '}
                                                {sessionDate.toLocaleDateString(
                                                    'vi-VN'
                                                )}
                                            </span>
                                            <span>
                                                ⏰{' '}
                                                {session.start_time?.slice(
                                                    0,
                                                    5
                                                )}{' '}
                                                -{' '}
                                                {session.end_time?.slice(0, 5)}
                                            </span>
                                            {isCompleted && (
                                                <span
                                                    style={{
                                                        color: '#16a34a',
                                                        fontWeight: '600',
                                                        backgroundColor:
                                                            '#dcfce7',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    Đã điểm danh
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '8px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {/* QR Code Actions */}
                                        {isQrActive ? (
                                            <button
                                                onClick={() =>
                                                    onOpenQrModal(session)
                                                }
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #10b981',
                                                    backgroundColor: '#ecfdf5',
                                                    color: '#047857',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Xem mã QR
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    onGenerateQr(session.id)
                                                }
                                                disabled={isGeneratingQr}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1',
                                                    backgroundColor: '#fff',
                                                    color: '#334155',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Tạo mã QR
                                            </button>
                                        )}

                                        {/* Substitution Action */}
                                        {!isCompleted && (
                                            <button
                                                onClick={() =>
                                                    onOpenSubstitutionModal(
                                                        session
                                                    )
                                                }
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1',
                                                    backgroundColor: '#fff',
                                                    color: '#475569',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Dạy thế
                                            </button>
                                        )}

                                        <button
                                            onClick={() =>
                                                onOpenAttendanceModal(
                                                    session.id
                                                )
                                            }
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: '#4f46e5',
                                                color: '#fff',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Điểm danh
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ marginTop: '24px' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClassScheduleTab
