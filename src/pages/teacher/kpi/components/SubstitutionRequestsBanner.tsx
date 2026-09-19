import s from './SubstitutionRequestsBanner.module.css'
import type { SubstitutionRequest } from '@/lib/substitutions'

interface SubstitutionRequestsBannerProps {
    requests: SubstitutionRequest[]
    onAccept: (id: string) => void
    onDecline: (id: string) => void
    isActionPending?: boolean
}

export default function SubstitutionRequestsBanner({
    requests,
    onAccept,
    onDecline,
    isActionPending = false,
}: SubstitutionRequestsBannerProps) {
    if (!requests || requests.length === 0) return null

    return (
        <div className={s.bannerContainer}>
            <h2 className={s.bannerTitle}>
                <span>🔔</span> Yêu cầu dạy thế chờ bạn xác nhận (
                {requests.length})
            </h2>
            <div className={s.requestsList}>
                {requests.map((req) => {
                    const reqDate = req.class_session?.session_date
                        ? new Date(
                              req.class_session.session_date
                          ).toLocaleDateString('vi-VN')
                        : ''
                    return (
                        <div key={req.id} className={s.requestCard}>
                            <div className={s.infoCol}>
                                <div className={s.requesterText}>
                                    Người yêu cầu:{' '}
                                    <strong>
                                        {req.requesting_teacher_name}
                                    </strong>
                                </div>
                                <h4 className={s.classTitle}>
                                    Lớp: {req.class_session?.class_name}
                                </h4>
                                <div className={s.timeInfo}>
                                    <span>📅 Ngày: {reqDate}</span>
                                    <span>
                                        ⏰ Giờ:{' '}
                                        {req.class_session?.start_time?.slice(
                                            0,
                                            5
                                        )}{' '}
                                        -{' '}
                                        {req.class_session?.end_time?.slice(
                                            0,
                                            5
                                        )}
                                    </span>
                                </div>
                                {req.reason && (
                                    <p className={s.reasonText}>
                                        <strong>Lý do vắng:</strong>{' '}
                                        {req.reason}
                                    </p>
                                )}
                            </div>
                            <div className={s.actionsCol}>
                                <button
                                    disabled={isActionPending}
                                    onClick={() => onDecline(req.id)}
                                    className={s.btnDecline}
                                >
                                    Từ chối
                                </button>
                                <button
                                    disabled={isActionPending}
                                    onClick={() => onAccept(req.id)}
                                    className={s.btnAccept}
                                >
                                    Đồng ý nhận dạy
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
