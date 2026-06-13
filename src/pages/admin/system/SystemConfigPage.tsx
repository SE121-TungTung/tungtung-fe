import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAttendanceConfig, updateAttendanceConfig } from '@/lib/attendance'
import type { AttendanceConfig } from '@/lib/attendance'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'
import { useDialog } from '@/hooks/useDialog'
import { broadcastNotification } from '@/lib/notifications'
import s from './SystemConfigPage.module.css'

export default function SystemConfigPage() {
    const { alert: showAlert } = useDialog()
    const queryClient = useQueryClient()

    // States for system broadcast
    const [targetType, setTargetType] = useState<'all' | 'role'>('all')
    const [targetRole, setTargetRole] = useState<
        'student' | 'teacher' | 'admin' | 'center_admin'
    >('student')
    const [broadcastTitle, setBroadcastTitle] = useState('')
    const [broadcastContent, setBroadcastContent] = useState('')
    const [broadcastPriority, setBroadcastPriority] = useState<
        'low' | 'normal' | 'high' | 'urgent'
    >('normal')
    const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)

    const handleSendBroadcast = async () => {
        if (!broadcastTitle.trim()) {
            showAlert('Vui lòng nhập tiêu đề thông báo.', 'Lỗi')
            return
        }
        if (!broadcastContent.trim()) {
            showAlert('Vui lòng nhập nội dung thông báo.', 'Lỗi')
            return
        }

        setIsSendingBroadcast(true)
        try {
            await broadcastNotification({
                target_type: targetType,
                target_role: targetType === 'role' ? targetRole : undefined,
                title: broadcastTitle,
                content: broadcastContent,
                priority: broadcastPriority,
            })
            showAlert('Gửi thông báo hệ thống thành công!', 'Thành công')
            setBroadcastTitle('')
            setBroadcastContent('')
        } catch (err: any) {
            showAlert(
                err.message ||
                    'Không thể gửi thông báo hệ thống. Vui lòng thử lại!',
                'Thất bại'
            )
        } finally {
            setIsSendingBroadcast(false)
        }
    }

    // Fetch config
    const {
        data: configData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['attendanceConfig'],
        queryFn: getAttendanceConfig,
    })

    // Local form states
    const [minRatePercent, setMinRatePercent] = useState<number>(80)
    const [gracePeriodMin, setGracePeriodMin] = useState<number>(15)
    const [earlyCheckinMin, setEarlyCheckinMin] = useState<number>(30)
    const [alertAbsenceCount, setAlertAbsenceCount] = useState<number>(3)

    // Sync state when data is loaded
    useEffect(() => {
        if (configData) {
            setMinRatePercent(configData.min_rate_percent)
            setGracePeriodMin(configData.grace_period_min)
            setEarlyCheckinMin(configData.early_checkin_min)
            setAlertAbsenceCount(configData.alert_absence_count)
        }
    }, [configData])

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (updatedData: AttendanceConfig) =>
            updateAttendanceConfig(updatedData),
        onSuccess: () => {
            showAlert(
                'Cấu hình tham số hệ thống đã được cập nhật thành công.',
                'Thành công'
            )
            queryClient.invalidateQueries({ queryKey: ['attendanceConfig'] })
        },
        onError: (error: any) => {
            console.error('Update config failed:', error)
            showAlert(
                error.message || 'Có lỗi xảy ra khi cập nhật cấu hình.',
                'Lỗi'
            )
        },
    })

    const handleSave = () => {
        // Validate inputs
        if (minRatePercent < 0 || minRatePercent > 100) {
            showAlert(
                'Tỷ lệ chuyên cần tối thiểu phải nằm trong khoảng từ 0% đến 100%',
                'Lỗi nhập liệu'
            )
            return
        }
        if (gracePeriodMin < 0) {
            showAlert(
                'Thời gian đi muộn cho phép không được là số âm',
                'Lỗi nhập liệu'
            )
            return
        }
        if (earlyCheckinMin < 0) {
            showAlert(
                'Thời gian điểm danh sớm tối đa không được là số âm',
                'Lỗi nhập liệu'
            )
            return
        }
        if (alertAbsenceCount < 0) {
            showAlert(
                'Ngưỡng số buổi vắng mặt cảnh báo không được là số âm',
                'Lỗi nhập liệu'
            )
            return
        }

        const payload: AttendanceConfig = {
            min_rate_percent: minRatePercent,
            grace_period_min: gracePeriodMin,
            early_checkin_min: earlyCheckinMin,
            alert_absence_count: alertAbsenceCount,
        }

        updateMutation.mutate(payload)
    }

    const handleReset = () => {
        if (configData) {
            setMinRatePercent(configData.min_rate_percent)
            setGracePeriodMin(configData.grace_period_min)
            setEarlyCheckinMin(configData.early_checkin_min)
            setAlertAbsenceCount(configData.alert_absence_count)
        }
    }

    if (isLoading) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <div
                        style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Đang tải cấu hình hệ thống...
                    </div>
                </main>
            </div>
        )
    }

    if (isError) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <div
                        style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#ef4444',
                        }}
                    >
                        Có lỗi xảy ra khi lấy cấu hình hệ thống. Vui lòng tải
                        lại trang hoặc kiểm tra kết nối.
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Cấu hình hệ thống</h1>

                <Card className={s.configCard}>
                    <div className={s.cardHeader}>
                        <h2 className={s.cardTitle}>
                            Tham số điểm danh & học tập
                        </h2>
                        <p className={s.cardDescription}>
                            Thiết lập các quy định chung về thời gian, chuyên
                            cần và cảnh báo áp dụng cho toàn bộ trung tâm.
                        </p>
                    </div>

                    {/* 1. Tỷ lệ chuyên cần tối thiểu */}
                    <div className={s.formGroup}>
                        <div className={s.labelWrapper}>
                            <span className={s.fieldLabel}>
                                Tỷ lệ chuyên cần tối thiểu để nhận chứng chỉ
                            </span>
                            <div className={s.inputWrapper}>
                                <input
                                    type="number"
                                    className={s.textInput}
                                    value={minRatePercent}
                                    onChange={(e) =>
                                        setMinRatePercent(
                                            Number(e.target.value)
                                        )
                                    }
                                    min={0}
                                    max={100}
                                />
                                <span className={s.inputUnit}>%</span>
                            </div>
                        </div>
                        <p className={s.fieldDescription}>
                            Tỷ lệ buổi học tối thiểu mà học viên phải tham gia
                            đầy đủ để được hệ thống cấp chứng chỉ ảo hoàn thành
                            khóa học.
                        </p>
                    </div>

                    {/* 2. Thời gian đi muộn cho phép */}
                    <div className={s.formGroup}>
                        <div className={s.labelWrapper}>
                            <span className={s.fieldLabel}>
                                Thời gian đi muộn cho phép (Grace Period)
                            </span>
                            <div className={s.inputWrapper}>
                                <input
                                    type="number"
                                    className={s.textInput}
                                    value={gracePeriodMin}
                                    onChange={(e) =>
                                        setGracePeriodMin(
                                            Number(e.target.value)
                                        )
                                    }
                                    min={0}
                                />
                                <span className={s.inputUnit}>phút</span>
                            </div>
                        </div>
                        <p className={s.fieldDescription}>
                            Số phút cho phép học viên đến muộn sau khi lớp học
                            bắt đầu mà vẫn được tính là "Đúng giờ". Vượt quá
                            thời gian này sẽ tự động chuyển trạng thái thành "Đi
                            muộn".
                        </p>
                    </div>

                    {/* 3. Thời gian điểm danh sớm */}
                    <div className={s.formGroup}>
                        <div className={s.labelWrapper}>
                            <span className={s.fieldLabel}>
                                Thời gian điểm danh sớm tối đa
                            </span>
                            <div className={s.inputWrapper}>
                                <input
                                    type="number"
                                    className={s.textInput}
                                    value={earlyCheckinMin}
                                    onChange={(e) =>
                                        setEarlyCheckinMin(
                                            Number(e.target.value)
                                        )
                                    }
                                    min={0}
                                />
                                <span className={s.inputUnit}>phút</span>
                            </div>
                        </div>
                        <p className={s.fieldDescription}>
                            Khoảng thời gian tối đa trước giờ bắt đầu buổi học
                            mà cổng tự điểm danh/mã QR điểm danh mở để học viên
                            bắt đầu quét mã/tự điểm danh.
                        </p>
                    </div>

                    {/* 4. Ngưỡng số buổi vắng cảnh báo */}
                    <div className={s.formGroup}>
                        <div className={s.labelWrapper}>
                            <span className={s.fieldLabel}>
                                Ngưỡng số buổi vắng để cảnh báo (At-Risk)
                            </span>
                            <div className={s.inputWrapper}>
                                <input
                                    type="number"
                                    className={s.textInput}
                                    value={alertAbsenceCount}
                                    onChange={(e) =>
                                        setAlertAbsenceCount(
                                            Number(e.target.value)
                                        )
                                    }
                                    min={0}
                                />
                                <span className={s.inputUnit}>buổi</span>
                            </div>
                        </div>
                        <p className={s.fieldDescription}>
                            Số buổi vắng tối đa cho phép. Khi một học viên vắng
                            vượt quá ngưỡng này, hệ thống sẽ đưa ra cảnh báo
                            "Học viên có nguy cơ" trong danh sách quản lý.
                        </p>
                    </div>

                    <div className={s.actions}>
                        <ButtonGhost
                            onClick={handleReset}
                            disabled={updateMutation.isPending}
                        >
                            Khôi phục ban đầu
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <span className={s.loadingSpinner} />
                                    Đang lưu...
                                </div>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </ButtonPrimary>
                    </div>
                </Card>

                <Card className={s.configCard} style={{ marginTop: '24px' }}>
                    <div className={s.cardHeader}>
                        <h2 className={s.cardTitle}>
                            Gửi thông báo hệ thống (Broadcast)
                        </h2>
                        <p className={s.cardDescription}>
                            Gửi thông báo tức thì đến toàn bộ người dùng hoặc
                            các nhóm vai trò cụ thể trong toàn bộ hệ thống.
                        </p>
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.fieldLabel}>
                            Đối tượng nhận thông báo
                        </label>
                        <div
                            style={{
                                display: 'flex',
                                gap: '16px',
                                marginTop: '8px',
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="all"
                                    checked={targetType === 'all'}
                                    onChange={() => setTargetType('all')}
                                />
                                Toàn bộ người dùng
                            </label>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="role"
                                    checked={targetType === 'role'}
                                    onChange={() => setTargetType('role')}
                                />
                                Theo vai trò (Role)
                            </label>
                        </div>
                    </div>

                    {targetType === 'role' && (
                        <div className={s.formGroup}>
                            <label className={s.fieldLabel}>
                                Chọn vai trò nhận
                            </label>
                            <select
                                value={targetRole}
                                onChange={(e) =>
                                    setTargetRole(e.target.value as any)
                                }
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border-default)',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor:
                                        'var(--color-surface-page)',
                                    color: 'var(--color-text-primary)',
                                }}
                            >
                                <option value="student">
                                    Học viên (Student)
                                </option>
                                <option value="teacher">
                                    Giảng viên (Teacher)
                                </option>
                                <option value="admin">
                                    Quản trị hệ thống (Admin)
                                </option>
                                <option value="center_admin">
                                    Quản trị trung tâm (Center Admin)
                                </option>
                            </select>
                        </div>
                    )}

                    <div className={s.formGroup}>
                        <label className={s.fieldLabel}>
                            Tiêu đề thông báo
                        </label>
                        <input
                            type="text"
                            className={s.textInput}
                            value={broadcastTitle}
                            onChange={(e) => setBroadcastTitle(e.target.value)}
                            placeholder="Ví dụ: Bảo trì hệ thống định kỳ..."
                            style={{ width: '100%', marginTop: '4px' }}
                            required
                        />
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.fieldLabel}>
                            Nội dung thông báo
                        </label>
                        <textarea
                            value={broadcastContent}
                            onChange={(e) =>
                                setBroadcastContent(e.target.value)
                            }
                            placeholder="Nhập nội dung thông báo chi tiết..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border-default)',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
                                marginTop: '4px',
                                backgroundColor: 'var(--color-surface-page)',
                                color: 'var(--color-text-primary)',
                            }}
                            required
                        />
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.fieldLabel}>Độ ưu tiên</label>
                        <select
                            value={broadcastPriority}
                            onChange={(e) =>
                                setBroadcastPriority(e.target.value as any)
                            }
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border-default)',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'var(--color-surface-page)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <option value="low">Thấp</option>
                            <option value="normal">Bình thường</option>
                            <option value="high">Cao</option>
                            <option value="urgent">Khẩn cấp</option>
                        </select>
                    </div>

                    <div className={s.actions}>
                        <ButtonPrimary
                            onClick={handleSendBroadcast}
                            disabled={isSendingBroadcast}
                            style={{
                                background:
                                    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                border: 'none',
                                color: '#fff',
                            }}
                        >
                            {isSendingBroadcast
                                ? 'Đang gửi...'
                                : 'Gửi thông báo hệ thống'}
                        </ButtonPrimary>
                    </div>
                </Card>
            </main>
        </div>
    )
}
