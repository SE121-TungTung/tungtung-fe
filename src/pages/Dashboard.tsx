import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/lib/users'
import StudentDashboard from '@/pages/student/dashboard/Dashboard'
import TeacherDashboard from '@/pages/teacher/dashboard/TeacherDashboard'
import AdminDashboard from '@/pages/admin/dashboard/AdminDashboard'
import LoadingPage from '@/components/core/LoadingPage'

export default function GeneralDashboard() {
    const { data: userData, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    if (isLoading) {
        return <LoadingPage title="Đang tải thông tin người dùng..." />
    }

    if (!userData) return null

    switch (userData.role) {
        case 'student':
            return <StudentDashboard />

        case 'teacher':
            return <TeacherDashboard />

        case 'office_admin':
        case 'center_admin':
        case 'system_admin':
            return <AdminDashboard />

        default:
            return <div className="p-8">Unauthorized Role: {userData.role}</div>
    }
}
