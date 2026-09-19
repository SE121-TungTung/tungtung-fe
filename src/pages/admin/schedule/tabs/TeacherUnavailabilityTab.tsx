import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDialog } from '@/hooks/useDialog'
import { listUsers } from '@/lib/users'
import {
    useTeacherUnavailability,
    useCreateTeacherUnavailability,
    useDeleteTeacherUnavailability,
} from '@/hooks/domain/useGASchedule'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import s from '../Schedule.module.css'

const DAYS_OF_WEEK = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
]

const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
}

const tdStyle: React.CSSProperties = { padding: '10px 12px' }

export default function TeacherUnavailabilityTab() {
    const { alert } = useDialog()

    const [filterTeacherId, setFilterTeacherId] = useState<string>('')
    const [showForm, setShowForm] = useState(false)

    const { data: unavailData, isLoading } = useTeacherUnavailability(
        filterTeacherId || undefined
    )
    const createMutation = useCreateTeacherUnavailability()
    const deleteMutation = useDeleteTeacherUnavailability()

    const { data: teachersData } = useQuery({
        queryKey: ['users', 'teachers', 'unavail-list'],
        queryFn: () => listUsers({ role: 'teacher', limit: 100 }),
        staleTime: 5 * 60_000,
    })

    const [newRecord, setNewRecord] = useState({
        teacher_id: '',
        is_recurring: false,
        unavailable_date: '',
        day_of_week: null as number | null,
        time_slots: null as number[] | null,
        reason: '',
        whole_day: true,
    })

    const handleCreate = () => {
        if (!newRecord.teacher_id) return alert('Chọn giáo viên')
        if (!newRecord.is_recurring && !newRecord.unavailable_date)
            return alert('Chọn ngày bận')
        if (newRecord.is_recurring && newRecord.day_of_week == null)
            return alert('Chọn ngày trong tuần')

        createMutation.mutate(
            {
                teacher_id: newRecord.teacher_id,
                unavailable_date: newRecord.is_recurring
                    ? undefined
                    : newRecord.unavailable_date,
                time_slots: newRecord.whole_day ? null : newRecord.time_slots,
                reason: newRecord.reason,
                is_recurring: newRecord.is_recurring,
                day_of_week: newRecord.is_recurring
                    ? newRecord.day_of_week
                    : undefined,
            },
            {
                onSuccess: () => {
                    setShowForm(false)
                    setNewRecord({
                        teacher_id: '',
                        is_recurring: false,
                        unavailable_date: '',
                        day_of_week: null,
                        time_slots: null,
                        reason: '',
                        whole_day: true,
                    })
                },
                onError: (err: any) => alert('Lỗi: ' + err.message),
            }
        )
    }

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id)
    }

    const records = unavailData?.data || []

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
            }}
        >
            {/* Top bar */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>
                        Lọc GV:
                    </label>
                    <select
                        value={filterTeacherId}
                        onChange={(e) => setFilterTeacherId(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--primitive-radius-sm)',
                            border: '1px solid var(--color-border-soft)',
                            fontSize: 13,
                            background: 'var(--color-surface-card)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        <option value="">Tất cả</option>
                        {teachersData?.users?.map((t: any) => (
                            <option key={t.id} value={t.id}>
                                {t.firstName} {t.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <ButtonPrimary size="sm" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Đóng' : '+ Thêm lịch bận'}
                </ButtonPrimary>
            </div>

            {/* Create form */}
            {showForm && (
                <Card title="Thêm lịch bận mới" mode="light">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16,
                        }}
                    >
                        {/* Teacher select */}
                        <div>
                            <label
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    display: 'block',
                                    marginBottom: 6,
                                }}
                            >
                                Giáo viên *
                            </label>
                            <select
                                value={newRecord.teacher_id}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        teacher_id: e.target.value,
                                    })
                                }
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 'var(--primitive-radius-sm)',
                                    border: '1px solid var(--color-border-soft)',
                                    fontSize: 13,
                                    background: 'var(--color-surface-card)',
                                    color: 'var(--color-text-primary)',
                                }}
                            >
                                <option value="">-- Chọn --</option>
                                {teachersData?.users?.map((t: any) => (
                                    <option key={t.id} value={t.id}>
                                        {t.firstName} {t.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Recurring toggle */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={newRecord.is_recurring}
                                    onChange={(e) =>
                                        setNewRecord({
                                            ...newRecord,
                                            is_recurring: e.target.checked,
                                        })
                                    }
                                />
                                Lặp hàng tuần
                            </label>
                        </div>

                        {/* Date or Day-of-week */}
                        {newRecord.is_recurring ? (
                            <div>
                                <label
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        display: 'block',
                                        marginBottom: 6,
                                    }}
                                >
                                    Ngày trong tuần *
                                </label>
                                <select
                                    value={newRecord.day_of_week ?? ''}
                                    onChange={(e) =>
                                        setNewRecord({
                                            ...newRecord,
                                            day_of_week:
                                                e.target.value === ''
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius:
                                            'var(--primitive-radius-sm)',
                                        border: '1px solid var(--color-border-soft)',
                                        fontSize: 13,
                                        background: 'var(--color-surface-card)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    <option value="">-- Chọn --</option>
                                    {DAYS_OF_WEEK.map((d, i) => (
                                        <option key={i} value={i}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <InputField
                                label="Ngày bận *"
                                type="date"
                                value={newRecord.unavailable_date}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        unavailable_date: e.target.value,
                                    })
                                }
                            />
                        )}

                        {/* Whole day toggle */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={newRecord.whole_day}
                                    onChange={(e) =>
                                        setNewRecord({
                                            ...newRecord,
                                            whole_day: e.target.checked,
                                            time_slots: e.target.checked
                                                ? null
                                                : [1],
                                        })
                                    }
                                />
                                Cả ngày
                            </label>

                            {!newRecord.whole_day && (
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6].map((slot) => (
                                        <label
                                            key={slot}
                                            style={{
                                                display: 'flex',
                                                gap: 4,
                                                fontSize: 12,
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                borderRadius: 4,
                                                background: (
                                                    newRecord.time_slots || []
                                                ).includes(slot)
                                                    ? 'var(--color-brand-primary)'
                                                    : 'var(--color-surface-raised)',
                                                color: (
                                                    newRecord.time_slots || []
                                                ).includes(slot)
                                                    ? '#fff'
                                                    : 'var(--color-text-primary)',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={(
                                                    newRecord.time_slots || []
                                                ).includes(slot)}
                                                onChange={() => {
                                                    const current =
                                                        newRecord.time_slots ||
                                                        []
                                                    const next =
                                                        current.includes(slot)
                                                            ? current.filter(
                                                                  (s) =>
                                                                      s !== slot
                                                              )
                                                            : [...current, slot]
                                                    setNewRecord({
                                                        ...newRecord,
                                                        time_slots: next.length
                                                            ? next
                                                            : null,
                                                    })
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            Tiết {slot}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reason */}
                        <InputField
                            label="Lý do"
                            value={newRecord.reason}
                            onChange={(e) =>
                                setNewRecord({
                                    ...newRecord,
                                    reason: e.target.value,
                                })
                            }
                            placeholder="VD: Họp hội đồng, nghỉ phép..."
                        />
                    </div>

                    <div className={s.actions} style={{ marginTop: 16 }}>
                        <ButtonPrimary
                            variant="outline"
                            onClick={() => setShowForm(false)}
                        >
                            Hủy
                        </ButtonPrimary>
                        <ButtonPrimary
                            onClick={handleCreate}
                            loading={createMutation.isPending}
                        >
                            Lưu
                        </ButtonPrimary>
                    </div>
                </Card>
            )}

            {/* Table */}
            <Card mode="light">
                {isLoading ? (
                    <div
                        style={{
                            padding: 32,
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        Đang tải...
                    </div>
                ) : records.length === 0 ? (
                    <div
                        style={{
                            padding: 32,
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        Chưa có lịch bận nào
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        borderBottom:
                                            '2px solid var(--color-border-soft)',
                                        textAlign: 'left',
                                    }}
                                >
                                    <th style={thStyle}>Giáo viên</th>
                                    <th style={thStyle}>Loại</th>
                                    <th style={thStyle}>Ngày / Thứ</th>
                                    <th style={thStyle}>Tiết</th>
                                    <th style={thStyle}>Lý do</th>
                                    <th style={thStyle}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((rec) => {
                                    const teacher = teachersData?.users?.find(
                                        (t: any) => t.id === rec.teacher_id
                                    )
                                    const teacherName = teacher
                                        ? `${teacher.firstName} ${teacher.lastName}`
                                        : rec.teacher_id.slice(0, 8) + '...'

                                    return (
                                        <tr
                                            key={rec.id}
                                            style={{
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            <td style={tdStyle}>
                                                {teacherName}
                                            </td>
                                            <td style={tdStyle}>
                                                <span
                                                    style={{
                                                        padding: '2px 8px',
                                                        borderRadius: 99,
                                                        fontSize: 11,
                                                        background:
                                                            rec.is_recurring
                                                                ? 'var(--color-status-info-bg)'
                                                                : 'var(--color-status-warning-bg)',
                                                        color: rec.is_recurring
                                                            ? 'var(--color-status-info)'
                                                            : 'var(--color-status-warning)',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {rec.is_recurring
                                                        ? 'Hàng tuần'
                                                        : 'Một lần'}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                {rec.is_recurring
                                                    ? DAYS_OF_WEEK[
                                                          rec.day_of_week ?? 0
                                                      ]
                                                    : rec.unavailable_date ||
                                                      '—'}
                                            </td>
                                            <td style={tdStyle}>
                                                {rec.time_slots
                                                    ? `Tiết ${rec.time_slots.join(', ')}`
                                                    : 'Cả ngày'}
                                            </td>
                                            <td style={tdStyle}>
                                                {rec.reason || '—'}
                                            </td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(rec.id)
                                                    }
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--color-status-danger)',
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}
