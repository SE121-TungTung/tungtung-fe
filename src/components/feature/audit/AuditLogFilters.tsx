import { useState } from 'react'
import s from './AuditLogFilters.module.css'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { AuditActionLabels } from '@/types/audit_log.types'
import type { AuditLogFilters as Filters } from '@/types/audit_log.types'

interface AuditLogFiltersProps {
    filters: Filters
    onFiltersChange: (filters: Filters) => void
    onReset: () => void
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
    filters,
    onFiltersChange,
    onReset,
}) => {
    const [localFilters, setLocalFilters] = useState<Filters>(filters)

    const handleFilterChange = (key: keyof Filters, value: any) => {
        const updated = { ...localFilters, [key]: value || undefined }
        setLocalFilters(updated)
    }

    const handleApply = () => {
        onFiltersChange(localFilters)
    }

    const handleReset = () => {
        const resetFilters: Filters = {
            skip: 0,
            limit: 20,
        }
        setLocalFilters(resetFilters)
        onReset()
    }

    return (
        <div className={s.container}>
            <div className={s.row}>
                {/* Search */}
                <div className={s.field}>
                    <label className={s.label}>Tìm kiếm</label>
                    <input
                        type="text"
                        className={s.input}
                        placeholder="Tìm trong table, error, user agent..."
                        value={localFilters.search || ''}
                        onChange={(e) =>
                            handleFilterChange('search', e.target.value)
                        }
                    />
                </div>

                {/* Action */}
                <div className={s.field}>
                    <label className={s.label}>Hành động</label>
                    <select
                        className={s.select}
                        value={localFilters.action || ''}
                        onChange={(e) =>
                            handleFilterChange('action', e.target.value)
                        }
                    >
                        <option value="">Tất cả</option>
                        {Object.entries(AuditActionLabels).map(
                            ([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Table Name */}
                <div className={s.field}>
                    <label className={s.label}>Bảng</label>
                    <input
                        type="text"
                        className={s.input}
                        placeholder="users, classes, tests..."
                        value={localFilters.table_name || ''}
                        onChange={(e) =>
                            handleFilterChange('table_name', e.target.value)
                        }
                    />
                </div>

                {/* Success Status */}
                <div className={s.field}>
                    <label className={s.label}>Trạng thái</label>
                    <select
                        className={s.select}
                        value={
                            localFilters.success === undefined
                                ? ''
                                : String(localFilters.success)
                        }
                        onChange={(e) =>
                            handleFilterChange(
                                'success',
                                e.target.value === ''
                                    ? undefined
                                    : e.target.value === 'true'
                            )
                        }
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Thành công</option>
                        <option value="false">Thất bại</option>
                    </select>
                </div>
            </div>

            <div className={s.actions}>
                <ButtonGhost size="sm" mode="light" onClick={handleReset}>
                    Đặt lại
                </ButtonGhost>
                <ButtonGhost size="sm" mode="light" onClick={handleApply}>
                    Áp dụng
                </ButtonGhost>
            </div>
        </div>
    )
}
