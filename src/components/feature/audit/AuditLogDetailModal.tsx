// @/components/audit/AuditLogDetailModal.tsx
import s from './AuditLogDetailModal.module.css'
import type { AuditLogResponse } from '@/types/audit_log.types'
import ButtonGhost from '@/components/common/button/ButtonGhost'

interface AuditLogDetailModalProps {
    log: AuditLogResponse | null
    onClose: () => void
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
    log,
    onClose,
}) => {
    if (!log) return null

    const renderJSON = (data: Record<string, any> | null, title: string) => {
        if (!data || Object.keys(data).length === 0) {
            return (
                <div className={s.section}>
                    <h4 className={s.sectionTitle}>{title}</h4>
                    <p className={s.emptyText}>Không có dữ liệu</p>
                </div>
            )
        }

        return (
            <div className={s.section}>
                <h4 className={s.sectionTitle}>{title}</h4>
                <pre className={s.jsonView}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        )
    }

    return (
        <div className={s.overlay} onClick={onClose}>
            <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                <div className={s.header}>
                    <h3 className={s.title}>Chi tiết Audit Log</h3>
                    <button className={s.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={s.content}>
                    {/* Basic Info */}
                    <div className={s.section}>
                        <h4 className={s.sectionTitle}>Thông tin cơ bản</h4>
                        <div className={s.infoGrid}>
                            <div className={s.infoItem}>
                                <span className={s.infoLabel}>ID:</span>
                                <span className={s.infoValue}>{log.id}</span>
                            </div>
                            <div className={s.infoItem}>
                                <span className={s.infoLabel}>User ID:</span>
                                <span className={s.infoValue}>
                                    {log.user_id || 'N/A'}
                                </span>
                            </div>
                            <div className={s.infoItem}>
                                <span className={s.infoLabel}>Bảng:</span>
                                <span className={s.infoValue}>
                                    {log.table_name}
                                </span>
                            </div>
                            <div className={s.infoItem}>
                                <span className={s.infoLabel}>Record ID:</span>
                                <span className={s.infoValue}>
                                    {log.record_id || 'N/A'}
                                </span>
                            </div>
                            <div className={s.infoItem}>
                                <span className={s.infoLabel}>IP:</span>
                                <span className={s.infoValue}>
                                    {log.ip_address || 'N/A'}
                                </span>
                            </div>
                            <div className={s.infoItem}>
                                <span className={s.infoLabel}>Session:</span>
                                <span className={s.infoValue}>
                                    {log.session_id || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Agent */}
                    {log.user_agent && (
                        <div className={s.section}>
                            <h4 className={s.sectionTitle}>User Agent</h4>
                            <p className={s.userAgent}>{log.user_agent}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {!log.success && log.error_message && (
                        <div className={s.section}>
                            <h4 className={s.sectionTitle}>Lỗi</h4>
                            <p className={s.errorText}>{log.error_message}</p>
                        </div>
                    )}

                    {/* Old Values */}
                    {renderJSON(log.old_values, 'Giá trị cũ')}

                    {/* New Values */}
                    {renderJSON(log.new_values, 'Giá trị mới')}
                </div>

                <div className={s.footer}>
                    <ButtonGhost size="md" mode="light" onClick={onClose}>
                        Đóng
                    </ButtonGhost>
                </div>
            </div>
        </div>
    )
}
