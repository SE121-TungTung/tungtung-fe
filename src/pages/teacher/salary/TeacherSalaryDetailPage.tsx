import s from '../../admin/users/UserManagementPage.module.css'
import { useParams } from 'react-router-dom'
import { SalaryBreakdownPanel } from '@/components/common/card/SalaryBreakdownPanel'
import { useSalaryDetail } from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'

export default function TeacherSalaryDetailPage() {
    const { salaryId } = useParams()

    // Fetches the specific salary slip
    const { data: salary, isLoading } = useSalaryDetail(salaryId || '')

    if (isLoading)
        return <div style={{ padding: '24px' }}>Đang tải phiếu lương...</div>

    return (
        <div
            className={s.pageWrapperWithoutHeader}
            style={{ maxWidth: '800px', margin: '0 auto' }}
        >
            <main className={s.mainContent}>
                {salary ? (
                    <SalaryBreakdownPanel data={salary} readOnly={true} />
                ) : (
                    <EmptyState
                        title="Không tìm thấy"
                        description="Phiếu lương này không tồn tại hoặc bạn không có quyền truy cập."
                    />
                )}
            </main>
        </div>
    )
}
