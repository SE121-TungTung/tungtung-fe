import React from 'react'
import s from '../TeacherClassDetail.module.css'

interface ClassOverviewTabProps {
    classDetail: any
}

export const ClassOverviewTab: React.FC<ClassOverviewTabProps> = ({
    classDetail,
}) => {
    return (
        <div style={{ maxWidth: 800, width: '100%', textAlign: 'left' }}>
            <div className={s.card}>
                <h3 className={s.sectionTitle}>Thông tin lớp học</h3>
                <div className={s.infoGrid}>
                    <div>
                        <label
                            style={{
                                fontSize: '12px',
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            Khóa học
                        </label>
                        <p
                            style={{
                                fontWeight: 600,
                                margin: 0,
                                color: '#1e293b',
                            }}
                        >
                            {classDetail?.course?.name}
                        </p>
                    </div>
                    <div>
                        <label
                            style={{
                                fontSize: '12px',
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            Phòng học
                        </label>
                        <p
                            style={{
                                fontWeight: 600,
                                margin: 0,
                                color: '#1e293b',
                            }}
                        >
                            {classDetail?.room?.name}
                        </p>
                    </div>
                    <div>
                        <label
                            style={{
                                fontSize: '12px',
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            Thời gian
                        </label>
                        <p style={{ margin: 0, color: '#1e293b' }}>
                            {new Date(
                                classDetail?.startDate || ''
                            ).toLocaleDateString('vi-VN')}{' '}
                            -{' '}
                            {new Date(
                                classDetail?.endDate || ''
                            ).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    <div>
                        <label
                            style={{
                                fontSize: '12px',
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            Sĩ số
                        </label>
                        <p style={{ margin: 0, color: '#1e293b' }}>
                            {classDetail?.currentStudents} /{' '}
                            {classDetail?.maxStudents}
                        </p>
                    </div>
                </div>
                {classDetail?.notes && (
                    <div style={{ marginTop: '20px' }}>
                        <label
                            style={{
                                fontSize: '12px',
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            Ghi chú
                        </label>
                        <p style={{ margin: 0, color: '#334155' }}>
                            {classDetail.notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClassOverviewTab
