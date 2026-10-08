import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/lib/users'
import { useSession } from '@/stores/session.store'
import StudentDashboard from '@/pages/student/dashboard/Dashboard'
import TeacherDashboard from '@/pages/teacher/dashboard/TeacherDashboard'
import AdminDashboard from '@/pages/admin/dashboard/AdminDashboard'
import GuestStudentDashboard from '@/pages/student/dashboard/GuestStudentDashboard'
import PageSkeleton from '@/components/core/PageSkeleton'

export default function GeneralDashboard() {
    const sessionUser = useSession((state) => state.user)
    const { data: userData, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
        initialData: sessionUser ?? undefined,
    })

    const role = (userData?.role ?? sessionUser?.role)?.toLowerCase()

    if (isLoading && !role) {
        return <PageSkeleton />
    }

    if (!role) return null

    switch (role) {
        case 'guest_student':
            return <GuestStudentDashboard />

        case 'student':
            return <StudentDashboard />

        case 'teacher':
        case 'ta':
            return <TeacherDashboard />

        case 'office_admin':
        case 'center_admin':
        case 'system_admin':
            return <AdminDashboard />

        default:
            return <div>Unauthorized Role: {role}</div>
    }
}
