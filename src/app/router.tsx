import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout } from './layouts/MainLayout'
import FirstLoginGuard from '@/components/feature/auth/FirstLoginGuard'
import LoadingPage from '@/components/core/LoadingPage'
import { useSession } from '@/stores/session.store'

// Helper for standalone routes that need Suspense fallback
const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<LoadingPage title="Đang tải trang..." />}>
        <Component />
    </Suspense>
)

// ============================================================================
// Lazy Loaded Pages (Code-Splitting)
// ============================================================================

// Auth Pages
const LoginPage = lazy(() =>
    import('@/pages/auth/Login').then((m) => ({ default: m.LoginPage }))
)
const ForgotPasswordPage = lazy(() =>
    import('@/pages/auth/ForgotPassword').then((m) => ({
        default: m.ForgotPasswordPage,
    }))
)
const ResetPasswordPage = lazy(() =>
    import('@/pages/auth/ResetPassword').then((m) => ({
        default: m.ResetPasswordPage,
    }))
)
const OtpPage = lazy(() => import('@/pages/auth/OtpPage'))
const LogoutPage = lazy(() => import('@/pages/auth/Logout'))

// Core / Common Pages
const GeneralDashboard = lazy(() => import('@/pages/Dashboard'))
const ComingSoon = lazy(() => import('@/components/core/ComingSoon'))
const NotificationPage = lazy(
    () => import('@/pages/notifications/NotificationPage')
)
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const MessagesPage = lazy(() => import('@/pages/messages/MessagesPage'))
const WalletPage = lazy(() => import('@/pages/finance/WalletPage'))

// Student Pages
const ClassPage = lazy(() => import('@/pages/student/class/Class'))
const RoadmapPage = lazy(() => import('@/pages/student/roadmap/RoadmapPage'))
const ExamPracticePage = lazy(
    () => import('@/pages/student/exam/ExamPracticePage')
)
const TestResultPage = lazy(() => import('@/pages/student/exam/TestResultPage'))
const TestDetailPage = lazy(() => import('@/pages/student/exam/TestDetailPage'))
const CreateTestPage = lazy(() => import('@/pages/student/exam/CreateTestPage'))
const EditTestPage = lazy(() => import('@/pages/student/exam/EditTestPage'))
const TestTakerWrapper = lazy(
    () => import('@/pages/student/exam/do/TestTakerWrapper')
)
const StudentInvoicePage = lazy(
    () => import('@/pages/student/finance/StudentInvoicePage')
)
const PaymentCallbackPage = lazy(
    () => import('@/pages/student/finance/PaymentCallbackPage')
)

// Teacher Pages
const TeacherClassPage = lazy(
    () => import('@/pages/teacher/classes/TeacherClassPage')
)
const TeacherClassDetailPage = lazy(
    () => import('@/pages/teacher/classes/TeacherClassDetailPage')
)
const TeacherSchedulePage = lazy(
    () => import('@/pages/teacher/schedule/TeacherSchedulePage')
)
const TeacherGradingPage = lazy(
    () => import('@/pages/teacher/grading/TeacherGradingPage')
)
const GradeAttemptPage = lazy(
    () => import('@/pages/teacher/grading/GradeAttemptPage')
)
const TeacherKpiDashboard = lazy(
    () => import('@/pages/teacher/kpi/TeacherKpiDashboard')
)
const TeacherSalaryHistoryPage = lazy(
    () => import('@/pages/teacher/salary/TeacherSalaryHistoryPage')
)
const TeacherSalaryDetailPage = lazy(
    () => import('@/pages/teacher/salary/TeacherSalaryDetailPage')
)

// Admin Pages
const UserManagementPage = lazy(() =>
    import('@/pages/admin/users/UserManagementPage').then((m) => ({
        default: m.UserManagementPage,
    }))
)
const RoomManagementPage = lazy(
    () => import('@/pages/admin/rooms/RoomManagementPage')
)
const CourseManagementPage = lazy(
    () => import('@/pages/admin/courses/CourseManagementPage')
)
const ClassManagementPage = lazy(
    () => import('@/pages/admin/classes/ClassManagementPage')
)
const ScheduleManagementPage = lazy(
    () => import('@/pages/admin/schedule/ScheduleManagementPage')
)
const ScheduleGeneratorPage = lazy(
    () => import('@/pages/admin/schedule/ScheduleGeneratorPage')
)
const GASchedulePage = lazy(
    () => import('@/pages/admin/schedule/GASchedulePage')
)
const AuditLogPage = lazy(() => import('@/pages/admin/audit/AuditLogPage'))
const SystemConfigPage = lazy(
    () => import('@/pages/admin/system/SystemConfigPage')
)
const ChatbotUploadPage = lazy(
    () => import('@/pages/admin/system/ChatbotUploadPage')
)
const AdminInvoicePage = lazy(
    () => import('@/pages/admin/finance/AdminInvoicePage')
)
const AdminFinanceReportPage = lazy(
    () => import('@/pages/admin/finance/AdminFinanceReportPage')
)
const AdminKpiOverviewPage = lazy(
    () => import('@/pages/admin/kpi/AdminKpiOverviewPage')
)
const AdminKpiCalculationPage = lazy(
    () => import('@/pages/admin/kpi/AdminKpiCalculationPage')
)
const AdminKpiRecordDetailPage = lazy(
    () => import('@/pages/admin/kpi/AdminKpiRecordDetailPage')
)
const AdminKpiTemplatePage = lazy(
    () => import('@/pages/admin/kpi/AdminKpiTemplatePage')
)
const AdminSupportCalcPage = lazy(
    () => import('@/pages/admin/kpi/AdminSupportCalcPage')
)
const AdminKpiDisputesPage = lazy(
    () => import('@/pages/admin/kpi/AdminKpiDisputesPage')
)
const AdminPayrollListPage = lazy(
    () => import('@/pages/admin/salary/AdminPayrollListPage')
)
const AdminPayrollRunPage = lazy(
    () => import('@/pages/admin/salary/AdminPayrollRunPage')
)
const AdminPayrollRunDetailPage = lazy(
    () => import('@/pages/admin/salary/AdminPayrollRunDetailPage')
)
const AdminSalaryDetailPage = lazy(
    () => import('@/pages/admin/salary/AdminSalaryDetailPage')
)

// ============================================================================
// Router Configuration
// ============================================================================

export const router = createBrowserRouter([
    {
        element: (
            <Suspense fallback={<LoadingPage title="Đang khởi tạo..." />}>
                <FirstLoginGuard />
                <Outlet />
            </Suspense>
        ),
        children: [
            {
                path: '/',
                element: (() => {
                    const isAuthenticated =
                        useSession.getState().isAuthenticated
                    return isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                })(),
            },
            { path: '/login', element: withSuspense(LoginPage) },
            {
                path: '/forgot-password',
                element: withSuspense(ForgotPasswordPage),
            },
            { path: '/otp', element: withSuspense(OtpPage) },
            { path: '/logout', element: withSuspense(LogoutPage) },
            {
                path: '/reset-password',
                element: withSuspense(ResetPasswordPage),
            },

            // General routes
            { path: '/test', element: withSuspense(ExamPracticePage) },
            {
                path: '/coming-soon',
                element: withSuspense(ComingSoon),
            },

            // Standalone test taker routes (no MainLayout)
            {
                path: '/student/tests/:testId/take/:attemptId',
                element: withSuspense(TestTakerWrapper),
            },
            {
                path: '/test/:testId/attempt/:attemptId',
                element: withSuspense(TestTakerWrapper),
            },

            // Authenticated routes with MainLayout
            {
                element: (
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: '/profile',
                        element: <ProfilePage />,
                    },
                    {
                        path: '/settings',
                        element: <SettingsPage />,
                    },
                    {
                        path: '/finance/wallet',
                        element: <WalletPage />,
                    },
                    {
                        path: '/messages',
                        element: <MessagesPage />,
                    },
                    {
                        path: '/notifications',
                        element: <NotificationPage />,
                    },
                    {
                        path: '/dashboard',
                        element: <GeneralDashboard />,
                    },
                    {
                        path: '/',
                        element: <Navigate to="/dashboard" replace />,
                    },

                    // Student routes
                    {
                        path: '/student',
                        element: <Navigate to="/dashboard" replace />,
                    },
                    {
                        path: '/student/class',
                        element: (
                            <ProtectedRoute allowedRoles={['student']}>
                                <ClassPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/student/tests',
                        element: <ExamPracticePage />,
                    },
                    {
                        path: '/student/exams/:testId/take/:attemptId/results',
                        element: <TestResultPage />,
                    },
                    {
                        path: '/student/tests/results/:attemptId',
                        element: <TestResultPage />,
                    },
                    {
                        path: '/student/tests/attempts/:attemptId',
                        element: <TestResultPage />,
                    },
                    {
                        path: '/student/notifications',
                        element: (
                            <ProtectedRoute allowedRoles={['student']}>
                                <NotificationPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/student/messages',
                        element: (
                            <ProtectedRoute allowedRoles={['student']}>
                                <MessagesPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/student/roadmap',
                        element: (
                            <ProtectedRoute allowedRoles={['student']}>
                                <RoadmapPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/student/finance/invoices',
                        element: (
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentInvoicePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/student/finance/callback',
                        element: (
                            <ProtectedRoute allowedRoles={['student']}>
                                <PaymentCallbackPage />
                            </ProtectedRoute>
                        ),
                    },

                    // Teacher routes
                    {
                        path: '/teacher',
                        element: <Navigate to="/dashboard" replace />,
                    },
                    {
                        path: '/teacher/classes',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherClassPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/classes/:classId',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherClassDetailPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/schedule',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherSchedulePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/tests',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <ExamPracticePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/tests/create',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <CreateTestPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/tests/:testId/view',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TestDetailPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/tests/:testId/edit',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <EditTestPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/grading/:testId',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherGradingPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/grading/:testId/attempts/:attemptId',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <GradeAttemptPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/kpi',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherKpiDashboard />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/salary',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherSalaryHistoryPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/salary/:salaryId',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherSalaryDetailPage />
                            </ProtectedRoute>
                        ),
                    },

                    // Admin routes
                    {
                        path: '/admin',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/users',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <UserManagementPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/rooms',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <RoomManagementPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/courses',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <CourseManagementPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/classes',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <ClassManagementPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/schedule',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <ScheduleManagementPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/schedule/generate',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <ScheduleGeneratorPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/schedule/ga',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'office_admin',
                                    'center_admin',
                                    'system_admin',
                                ]}
                            >
                                <GASchedulePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/audit-logs',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <AuditLogPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/system',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <SystemConfigPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/system/chatbot-documents',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <ChatbotUploadPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/kpi',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'system_admin',
                                    'center_admin',
                                    'office_admin',
                                ]}
                            >
                                <AdminKpiOverviewPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/kpi/calculation',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <AdminKpiCalculationPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/kpi/records/:recordId',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'system_admin',
                                    'center_admin',
                                    'office_admin',
                                ]}
                            >
                                <AdminKpiRecordDetailPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/kpi/disputes',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'system_admin',
                                    'center_admin',
                                    'office_admin',
                                ]}
                            >
                                <AdminKpiDisputesPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/kpi/templates',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <AdminKpiTemplatePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/finance/invoices',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'system_admin',
                                    'center_admin',
                                    'office_admin',
                                ]}
                            >
                                <AdminInvoicePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/finance/reports',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <AdminFinanceReportPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/kpi/support-calc',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'system_admin',
                                    'center_admin',
                                    'office_admin',
                                ]}
                            >
                                <AdminSupportCalcPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/payroll',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'system_admin',
                                    'center_admin',
                                    'office_admin',
                                ]}
                            >
                                <AdminPayrollListPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/payroll/run',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <AdminPayrollRunPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/payroll-runs/:runId',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <AdminPayrollRunDetailPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/admin/payroll/:salaryId',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    'system_admin',
                                    'center_admin',
                                    'office_admin',
                                ]}
                            >
                                <AdminSalaryDetailPage />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
        ],
    },
])
