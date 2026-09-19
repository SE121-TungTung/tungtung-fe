import React from 'react'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import { type CertificateEligibility } from '@/lib/certificates'
import s from '../ClassDetailModal.module.css'

interface ClassCertificatesTabProps {
    isLoadingEligibility: boolean
    eligibilityList?: CertificateEligibility[]
    issuingIds: Record<string, boolean>
    onIssueCertificate: (
        studentId: string,
        finalGrade: number,
        attendanceRate: number
    ) => void
}

export const ClassCertificatesTab: React.FC<ClassCertificatesTabProps> = ({
    isLoadingEligibility,
    eligibilityList,
    issuingIds,
    onIssueCertificate,
}) => {
    return (
        <div className={s.enrollmentContainer}>
            <div className={s.studentsListSection}>
                <h3 className={s.sectionTitle}>
                    Danh sách điều kiện cấp chứng chỉ & Quản lý cấp
                </h3>
                {isLoadingEligibility ? (
                    <p className={s.loadingText}>
                        Đang kiểm tra điều kiện nhận chứng chỉ của học viên...
                    </p>
                ) : !eligibilityList || eligibilityList.length === 0 ? (
                    <p className={s.emptyText}>
                        Không tìm thấy học viên nào trong lớp này.
                    </p>
                ) : (
                    <div className={s.tableContainer}>
                        <table className={s.studentTable}>
                            <thead>
                                <tr>
                                    <th>Họ và Tên</th>
                                    <th>Tỷ lệ chuyên cần</th>
                                    <th>Điểm cuối kỳ</th>
                                    <th>
                                        Điều kiện (Chuyên cần ≥ 80%, Điểm ≥ 7.0)
                                    </th>
                                    <th>Trạng thái chứng chỉ</th>
                                    <th style={{ width: '150px' }}>
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {eligibilityList.map((e) => {
                                    const ratePercent =
                                        Math.round(e.attendance_rate * 100) /
                                        100
                                    const isRateOk =
                                        ratePercent >=
                                        (e.min_rate_required || 80)
                                    const finalScore =
                                        e.final_grade !== null
                                            ? Number(e.final_grade)
                                            : null
                                    const isScoreOk =
                                        finalScore !== null &&
                                        finalScore >=
                                            (e.min_grade_required || 7.0)
                                    const isEligible = isRateOk && isScoreOk

                                    return (
                                        <tr key={e.enrollment_id}>
                                            <td className={s.studentNameCol}>
                                                {e.student_name}
                                            </td>
                                            <td>
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        color: isRateOk
                                                            ? '#16a34a'
                                                            : '#dc2626',
                                                    }}
                                                >
                                                    {ratePercent}%
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                        marginLeft: '4px',
                                                    }}
                                                >
                                                    (Yêu cầu ≥{' '}
                                                    {e.min_rate_required || 80}
                                                    %)
                                                </span>
                                            </td>
                                            <td>
                                                {finalScore !== null ? (
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color: isScoreOk
                                                                ? '#16a34a'
                                                                : '#dc2626',
                                                        }}
                                                    >
                                                        {finalScore.toFixed(1)}{' '}
                                                        / 10
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: '#64748b',
                                                            fontStyle: 'italic',
                                                        }}
                                                    >
                                                        Chưa có điểm
                                                    </span>
                                                )}
                                                <span
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                        marginLeft: '4px',
                                                    }}
                                                >
                                                    (Yêu cầu ≥{' '}
                                                    {e.min_grade_required ||
                                                        7.0}
                                                    )
                                                </span>
                                            </td>
                                            <td>
                                                {isEligible ? (
                                                    <StatusBadge
                                                        variant="success"
                                                        label="Đạt điều kiện"
                                                    />
                                                ) : (
                                                    <StatusBadge
                                                        variant="danger"
                                                        label="Không đạt điều kiện"
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                {e.is_issued ? (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        <StatusBadge
                                                            variant="neutral"
                                                            label="ĐÃ CẤP"
                                                        />
                                                        {e.certificate_code && (
                                                            <code
                                                                style={{
                                                                    fontSize:
                                                                        '11px',
                                                                    color: '#475569',
                                                                }}
                                                            >
                                                                Mã số:{' '}
                                                                {
                                                                    e.certificate_code
                                                                }
                                                            </code>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <StatusBadge
                                                        variant="warning"
                                                        label="CHƯA CẤP"
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {!e.is_issued ? (
                                                        <ButtonPrimary
                                                            size="sm"
                                                            tone="brand"
                                                            disabled={
                                                                !isEligible ||
                                                                !!issuingIds[
                                                                    e.student_id
                                                                ]
                                                            }
                                                            loading={
                                                                !!issuingIds[
                                                                    e.student_id
                                                                ]
                                                            }
                                                            onClick={() =>
                                                                onIssueCertificate(
                                                                    e.student_id,
                                                                    finalScore ||
                                                                        0,
                                                                    ratePercent
                                                                )
                                                            }
                                                        >
                                                            Cấp CC
                                                        </ButtonPrimary>
                                                    ) : e.certificate_url ? (
                                                        <ButtonPrimary
                                                            size="sm"
                                                            variant="outline"
                                                            tone="success"
                                                            onClick={() => {
                                                                const fullUrl =
                                                                    e.certificate_url?.startsWith(
                                                                        'http'
                                                                    )
                                                                        ? e.certificate_url
                                                                        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${e.certificate_url}`
                                                                window.open(
                                                                    fullUrl,
                                                                    '_blank'
                                                                )
                                                            }}
                                                        >
                                                            Xem PDF
                                                        </ButtonPrimary>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: '#64748b',
                                                                fontSize:
                                                                    '13px',
                                                            }}
                                                        >
                                                            Đã cấp
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClassCertificatesTab
