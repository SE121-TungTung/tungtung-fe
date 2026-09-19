import React from 'react'
import s from '../TeacherClassDetail.module.css'

interface ClassReportsTabProps {
    attendanceStats: any
    eligibilityList: any[]
    studentStats: any[]
    totalStudents: number
}

export const ClassReportsTab: React.FC<ClassReportsTabProps> = ({
    attendanceStats,
    eligibilityList,
    studentStats,
    totalStudents,
}) => {
    let excellentCount = 0
    let goodCount = 0
    let averageCount = 0
    let weakCount = 0

    const attendanceLookup = (studentStats || []).reduce(
        (acc: any, st: any) => {
            acc[st.student_id] = st
            return acc
        },
        {}
    )

    const studentReports = (eligibilityList || []).map((e: any) => {
        const att = attendanceLookup[e.student_id] || {}
        const finalScore = e.final_grade !== null ? Number(e.final_grade) : null

        let academicStatus = 'Chưa có điểm'
        if (finalScore !== null) {
            if (finalScore >= 8.5) {
                excellentCount++
                academicStatus = 'Xuất sắc'
            } else if (finalScore >= 7.0) {
                goodCount++
                academicStatus = 'Khá'
            } else if (finalScore >= 5.0) {
                averageCount++
                academicStatus = 'Trung bình'
            } else {
                weakCount++
                academicStatus = 'Yếu'
            }
        }

        const isLowAttendance = e.attendance_rate < 80
        const isLowGrade = finalScore !== null && finalScore < 7.0
        const isAtRisk = isLowAttendance || isLowGrade

        return {
            ...e,
            present: att.present_count ?? 0,
            absent: att.absent_count ?? 0,
            late: att.late_count ?? 0,
            excused: att.excused_count ?? 0,
            total_sessions: att.total_sessions ?? 0,
            finalScore,
            academicStatus,
            isAtRisk,
            isLowAttendance,
            isLowGrade,
        }
    })

    const atRiskStudents = studentReports.filter((st) => st.isAtRisk)
    const scoredStudentsCount = studentReports.filter(
        (st) => st.finalScore !== null
    ).length

    const getPercent = (count: number) => {
        if (scoredStudentsCount === 0) return 0
        return Math.round((count / scoredStudentsCount) * 100)
    }

    return (
        <div
            style={{
                width: '100%',
                maxWidth: 1000,
                margin: '0 auto',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            {/* Summary Widgets Row */}
            <div className={s.statsGrid}>
                {/* Avg Attendance Widget */}
                <div className={s.statCard}>
                    <div className={s.statLabel}>Chuyên cần trung bình</div>
                    <div className={s.statValue} style={{ color: '#4f46e5' }}>
                        {attendanceStats?.average_attendance_rate
                            ? `${attendanceStats.average_attendance_rate.toFixed(1)}%`
                            : '---'}
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginTop: '6px',
                        }}
                    >
                        Trên tổng số {attendanceStats?.total_sessions_held || 0}{' '}
                        buổi học đã diễn ra
                    </div>
                </div>

                {/* Scored Students Widget */}
                <div className={s.statCard}>
                    <div className={s.statLabel}>Điểm trung bình lớp</div>
                    <div className={s.statValue} style={{ color: '#10b981' }}>
                        {scoredStudentsCount > 0
                            ? `${(
                                  studentReports.reduce(
                                      (sum, st) => sum + (st.finalScore || 0),
                                      0
                                  ) / scoredStudentsCount
                              ).toFixed(1)} / 10`
                            : '---'}
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginTop: '6px',
                        }}
                    >
                        {scoredStudentsCount} / {totalStudents} học viên đã có
                        điểm
                    </div>
                </div>

                {/* At-Risk Widget */}
                <div
                    className={s.statCard}
                    style={{
                        borderColor: '#fee2e2',
                        background: '#fffefc',
                    }}
                >
                    <div className={s.statLabel} style={{ color: '#991b1b' }}>
                        Học viên cần lưu ý (At-Risk)
                    </div>
                    <div className={s.statValue} style={{ color: '#ef4444' }}>
                        {atRiskStudents.length} / {totalStudents}
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#ef4444',
                            marginTop: '6px',
                            fontWeight: '500',
                        }}
                    >
                        Tỷ lệ chuyên cần dưới 80% hoặc điểm dưới 7.0
                    </div>
                </div>
            </div>

            {/* Grade Distribution & Risk Explanation */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '24px',
                    flexWrap: 'wrap',
                }}
            >
                {/* Grade Chart */}
                <div className={s.card}>
                    <h4
                        style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '20px',
                            margin: 0,
                        }}
                    >
                        Phân phối điểm số cuối kỳ của lớp
                    </h4>
                    {scoredStudentsCount === 0 ? (
                        <div
                            style={{
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748b',
                                fontSize: '14px',
                                fontStyle: 'italic',
                            }}
                        >
                            Chưa có học viên nào được nhập điểm cuối kỳ.
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                marginTop: '16px',
                            }}
                        >
                            {/* Bar 1: Excellent */}
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '13px',
                                        marginBottom: '6px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: '500',
                                            color: '#1e293b',
                                        }}
                                    >
                                        🏆 Xuất sắc (≥ 8.5)
                                    </span>
                                    <span style={{ color: '#64748b' }}>
                                        {excellentCount} học viên (
                                        {getPercent(excellentCount)}%)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '8px',
                                        background: '#f1f5f9',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${getPercent(excellentCount)}%`,
                                            height: '100%',
                                            background: '#10b981',
                                            borderRadius: '4px',
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bar 2: Good */}
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '13px',
                                        marginBottom: '6px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: '500',
                                            color: '#1e293b',
                                        }}
                                    >
                                        📈 Khá (7.0 - 8.4)
                                    </span>
                                    <span style={{ color: '#64748b' }}>
                                        {goodCount} học viên (
                                        {getPercent(goodCount)}%)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '8px',
                                        background: '#f1f5f9',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${getPercent(goodCount)}%`,
                                            height: '100%',
                                            background: '#3b82f6',
                                            borderRadius: '4px',
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bar 3: Average */}
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '13px',
                                        marginBottom: '6px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: '500',
                                            color: '#1e293b',
                                        }}
                                    >
                                        ⚖️ Trung bình (5.0 - 6.9)
                                    </span>
                                    <span style={{ color: '#64748b' }}>
                                        {averageCount} học viên (
                                        {getPercent(averageCount)}%)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '8px',
                                        background: '#f1f5f9',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${getPercent(averageCount)}%`,
                                            height: '100%',
                                            background: '#f59e0b',
                                            borderRadius: '4px',
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bar 4: Weak */}
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '13px',
                                        marginBottom: '6px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: '500',
                                            color: '#1e293b',
                                        }}
                                    >
                                        ⚠️ Yếu (&lt; 5.0)
                                    </span>
                                    <span style={{ color: '#64748b' }}>
                                        {weakCount} học viên (
                                        {getPercent(weakCount)}%)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '8px',
                                        background: '#f1f5f9',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${getPercent(weakCount)}%`,
                                            height: '100%',
                                            background: '#ef4444',
                                            borderRadius: '4px',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Risk Alert Side Panel */}
                <div
                    className={s.card}
                    style={{
                        background: '#fffefc',
                        border: '1px solid #fef3c7',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <h4
                        style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#b45309',
                            marginBottom: '16px',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        ⚠️ Học viên có nguy cơ (At-Risk)
                    </h4>
                    {atRiskStudents.length === 0 ? (
                        <p
                            style={{
                                fontSize: '13px',
                                color: '#15803d',
                                fontStyle: 'italic',
                                margin: 0,
                            }}
                        >
                            Tuyệt vời! Không có học viên nào thuộc diện cảnh báo
                            học tập hoặc chuyên cần thấp.
                        </p>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                maxHeight: '220px',
                                overflowY: 'auto',
                            }}
                        >
                            {atRiskStudents.map((student) => (
                                <div
                                    key={student.student_id}
                                    style={{
                                        padding: '10px 12px',
                                        background: '#fff',
                                        border: '1px solid #fee2e2',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: '600',
                                            color: '#1e293b',
                                        }}
                                    >
                                        {student.student_name}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '8px',
                                            marginTop: '4px',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {student.isLowAttendance && (
                                            <span
                                                style={{
                                                    padding: '2px 6px',
                                                    background: '#fee2e2',
                                                    color: '#991b1b',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                Chuyên cần thấp (
                                                {student.attendance_rate.toFixed(
                                                    1
                                                )}
                                                %)
                                            </span>
                                        )}
                                        {student.isLowGrade && (
                                            <span
                                                style={{
                                                    padding: '2px 6px',
                                                    background: '#ffedd5',
                                                    color: '#c2410c',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                Điểm thấp (
                                                {student.finalScore?.toFixed(1)}
                                                )
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Full Table Report */}
            <div className={s.card}>
                <h4
                    style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '16px',
                        margin: 0,
                    }}
                >
                    Thống kê chi tiết toàn bộ học viên lớp học
                </h4>
                <div className={s.tableContainer}>
                    <table className={s.studentTable}>
                        <thead>
                            <tr>
                                <th>Học viên</th>
                                <th>Tỉ lệ chuyên cần</th>
                                <th>Chi tiết đi học</th>
                                <th>Điểm số</th>
                                <th>Xếp loại</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentReports.map((student) => (
                                <tr key={student.student_id}>
                                    <td className={s.studentNameCol}>
                                        {student.student_name}
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color:
                                                    student.attendance_rate >=
                                                    80
                                                        ? '#16a34a'
                                                        : '#dc2626',
                                            }}
                                        >
                                            {student.attendance_rate.toFixed(1)}
                                            %
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            fontSize: '12px',
                                            color: '#64748b',
                                        }}
                                    >
                                        🟢 {student.present} đi học | 🟡{' '}
                                        {student.late} muộn | 🔴{' '}
                                        {student.absent} vắng | 🔵{' '}
                                        {student.excused} có phép
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        {student.finalScore !== null ? (
                                            <span
                                                style={{
                                                    color:
                                                        student.finalScore >=
                                                        7.0
                                                            ? '#16a34a'
                                                            : '#c2410c',
                                                }}
                                            >
                                                {student.finalScore.toFixed(1)}{' '}
                                                / 10
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color: '#94a3b8',
                                                    fontStyle: 'italic',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Chưa có
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor:
                                                    student.academicStatus ===
                                                    'Xuất sắc'
                                                        ? '#d1fae5'
                                                        : student.academicStatus ===
                                                            'Khá'
                                                          ? '#dbeafe'
                                                          : student.academicStatus ===
                                                              'Trung bình'
                                                            ? '#fef3c7'
                                                            : student.academicStatus ===
                                                                'Yếu'
                                                              ? '#fee2e2'
                                                              : '#f1f5f9',
                                                color:
                                                    student.academicStatus ===
                                                    'Xuất sắc'
                                                        ? '#065f46'
                                                        : student.academicStatus ===
                                                            'Khá'
                                                          ? '#1e40af'
                                                          : student.academicStatus ===
                                                              'Trung bình'
                                                            ? '#92400e'
                                                            : student.academicStatus ===
                                                                'Yếu'
                                                              ? '#991b1b'
                                                              : '#475569',
                                            }}
                                        >
                                            {student.academicStatus}
                                        </span>
                                    </td>
                                    <td>
                                        {student.isAtRisk ? (
                                            <span
                                                style={{
                                                    color: '#dc2626',
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                Cảnh báo
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color: '#16a34a',
                                                    fontWeight: '500',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Bình thường
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ClassReportsTab
