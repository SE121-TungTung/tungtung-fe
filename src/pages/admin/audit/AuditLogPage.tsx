import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import s from './AuditLogPage.module.css'

import { getAuditLogs } from '@/lib/audit_log'
import type {
    AuditLogFilters,
    AuditLogResponse,
    AuditLogUI,
} from '@/types/audit_log.types'
import { AuditActionLabels, AuditActionColors } from '@/types/audit_log.types'

import TextType from '@/components/common/text/TextType'
import Card from '@/components/common/card/Card'
import Pagination from '@/components/common/menu/Pagination'
import { AuditLogFilters as FilterPanel } from '@/components/feature/audit/AuditLogFilters'
import { AuditLogDetailModal } from '@/components/feature/audit/AuditLogDetailModal'
import { queryClient } from '@/lib/query'

const ITEMS_PER_PAGE = 20

export default function AuditLogPage() {
    const [showGradientText, setShowGradientText] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [filters, setFilters] = useState<AuditLogFilters>({
        skip: 0,
        limit: ITEMS_PER_PAGE,
    })
    const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(
        null
    )

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    }, [queryClient])

    // Fetch audit logs
    const { data, isLoading, error } = useQuery({
        queryKey: ['auditLogs', filters],
        queryFn: () => getAuditLogs(filters),
        placeholderData: (previousData) => previousData,
    })

    const logs = data?.items || []
    const totalCount = data?.total || 0
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    // Handle filter changes
    const handleFiltersChange = (newFilters: AuditLogFilters) => {
        setFilters({
            ...newFilters,
            skip: 0,
            limit: ITEMS_PER_PAGE,
        })
        setCurrentPage(0)
    }

    const handleResetFilters = () => {
        const resetFilters: AuditLogFilters = {
            skip: 0,
            limit: ITEMS_PER_PAGE,
        }
        setFilters(resetFilters)
        setCurrentPage(0)
    }

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setFilters((prev) => ({
            ...prev,
            skip: page * ITEMS_PER_PAGE,
        }))
    }

    // Map logs to UI format
    const mappedLogs = useMemo((): AuditLogUI[] => {
        return logs.map((log: AuditLogResponse) => ({
            ...log,
            formattedTimestamp: formatTimestamp(log.timestamp),
            actionLabel: AuditActionLabels[log.action] || log.action,
            statusLabel: log.success ? 'Thành công' : 'Thất bại',
        }))
    }, [logs])

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                {/* Title */}
                <h1 className={s.pageTitle}>
                    <TextType
                        text="Audit "
                        typingSpeed={50}
                        loop={false}
                        showCursor={!showGradientText}
                        onSentenceComplete={() => setShowGradientText(true)}
                    />
                    {showGradientText && (
                        <TextType
                            as="span"
                            className={s.gradientText}
                            text="Logs"
                            typingSpeed={70}
                            loop={false}
                        />
                    )}
                </h1>

                {/* Filters */}
                <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                />

                {/* Main Card */}
                <Card
                    title={`Nhật ký hệ thống (${totalCount} bản ghi)`}
                    variant="outline"
                    mode="light"
                    className={s.logCard}
                >
                    {isLoading ? (
                        <div className={s.emptyState}>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className={s.emptyState}>
                            <p className={s.errorText}>
                                Không thể tải dữ liệu. Vui lòng thử lại sau.
                            </p>
                        </div>
                    ) : mappedLogs.length === 0 ? (
                        <div className={s.emptyState}>
                            <p>Không tìm thấy audit log nào.</p>
                        </div>
                    ) : (
                        <div className={s.tableWrapper}>
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Hành động</th>
                                        <th>Bảng</th>
                                        <th>User ID</th>
                                        <th>IP Address</th>
                                        <th>Trạng thái</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mappedLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className={s.timestampCell}>
                                                {log.formattedTimestamp}
                                            </td>
                                            <td>
                                                <span
                                                    className={s.actionBadge}
                                                    style={{
                                                        backgroundColor:
                                                            AuditActionColors[
                                                                log.action
                                                            ],
                                                    }}
                                                >
                                                    {log.actionLabel}
                                                </span>
                                            </td>
                                            <td className={s.tableName}>
                                                {log.table_name}
                                            </td>
                                            <td className={s.userId}>
                                                {log.user_id
                                                    ? truncateId(log.user_id)
                                                    : 'N/A'}
                                            </td>
                                            <td className={s.ipAddress}>
                                                {log.ip_address || 'N/A'}
                                            </td>
                                            <td>
                                                <span
                                                    className={`${s.statusBadge} ${
                                                        log.success
                                                            ? s.success
                                                            : s.error
                                                    }`}
                                                >
                                                    {log.statusLabel}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={s.detailBtn}
                                                    onClick={() =>
                                                        setSelectedLog(log)
                                                    }
                                                >
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={s.pagination}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </main>

            {/* Detail Modal */}
            <AuditLogDetailModal
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
            />
        </div>
    )
}

// Helper functions
function formatTimestamp(timestamp: string): string {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

function truncateId(id: string, length = 8): string {
    if (id.length <= length) return id
    return `${id.slice(0, length)}...`
}
