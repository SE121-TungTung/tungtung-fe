import { useState, useEffect } from 'react'
import { leadsApi, type Lead, type PaginationResponse } from '@/lib/leads'
import s from './AdminLeadsPage.module.css'
import { useDialog } from '@/hooks/useDialog'

export function AdminLeadsPage() {
    const [leadsData, setLeadsData] = useState<PaginationResponse<Lead> | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const { alert } = useDialog()

    useEffect(() => {
        fetchLeads()
    }, [page, statusFilter, searchTerm])

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const data = await leadsApi.getLeads({
                page,
                limit: 10,
                status: statusFilter || undefined,
                search: searchTerm || undefined
            })
            setLeadsData(data)
            setErrorMsg(null)
        } catch (error: any) {
            if (error.message === 'FORBIDDEN') {
                setErrorMsg('Bạn không có quyền truy cập vào danh sách Leads. Vui lòng liên hệ quản trị viên hệ thống để được cấp quyền.')
            } else {
                alert('Lỗi tải danh sách leads')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await leadsApi.updateLeadStatus(id, newStatus)
            alert('Đã cập nhật trạng thái lead thành công')
            fetchLeads()
        } catch (error) {
            alert('Lỗi cập nhật trạng thái')
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN')
    }

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h1>Quản lý Leads</h1>
            </div>

            {errorMsg ? (
                <div className={s.errorBox}>
                    <h3>❌ Truy cập bị từ chối</h3>
                    <p>{errorMsg}</p>
                </div>
            ) : (
                <>
                    <div className={s.filters}>
                <input 
                    type="text" 
                    placeholder="Tìm theo tên, email, sđt..." 
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(1)
                    }}
                    className={s.searchInput}
                />
                <select 
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setPage(1)
                    }}
                    className={s.statusFilter}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="new">Mới (New)</option>
                    <option value="contacted">Đã liên hệ (Contacted)</option>
                    <option value="converted">Đã chuyển đổi (Converted)</option>
                    <option value="lost">Bỏ lỡ (Lost)</option>
                </select>
            </div>

            <div className={s.tableContainer}>
                {loading && !leadsData ? (
                    <div className={s.loading}>Đang tải dữ liệu...</div>
                ) : (
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Liên hệ</th>
                                <th>Ngày đăng ký</th>
                                <th>Nguồn</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leadsData?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                        Không tìm thấy dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                leadsData?.data.map(lead => (
                                    <tr key={lead.id}>
                                        <td>
                                            <strong>{lead.full_name}</strong>
                                            {lead.target_band && (
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                    Mục tiêu: {lead.target_band}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div>{lead.email}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{lead.phone || 'N/A'}</div>
                                        </td>
                                        <td>{formatDate(lead.created_at)}</td>
                                        <td>{lead.source}</td>
                                        <td>
                                            <span className={`${s.statusBadge} ${s[`status_${lead.status}`]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select 
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                className={s.actionSelect}
                                            >
                                                <option value="new">Mới</option>
                                                <option value="contacted">Đã liên hệ</option>
                                                <option value="converted">Đã chuyển đổi</option>
                                                <option value="lost">Bỏ lỡ</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {leadsData && leadsData.meta.total_pages > 1 && (
                <div className={s.pagination}>
                    <span>
                        Hiển thị {((leadsData.meta.page - 1) * leadsData.meta.limit) + 1} - {Math.min(leadsData.meta.page * leadsData.meta.limit, leadsData.meta.total)} trong số {leadsData.meta.total}
                    </span>
                    <div className={s.pageControls}>
                        <button 
                            disabled={leadsData.meta.page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className={s.pageBtn}
                        >
                            Trước
                        </button>
                        <button 
                            disabled={leadsData.meta.page >= leadsData.meta.total_pages}
                            onClick={() => setPage(p => p + 1)}
                            className={s.pageBtn}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
                </>
            )}
        </div>
    )
}
