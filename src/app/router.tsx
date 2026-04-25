import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

import { LoginPage } from '@/pages/auth/Login'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import OtpPage from '@/pages/auth/OtpPage'
import NotificationPage from '@/pages/notifications/NotificationPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import RoadmapPage from '@/pages/student/roadmap/RoadmapPage'
import { UserManagementPage } from '@/pages/admin/users/UserManagementPage'

import RoomManagementPage from '@/pages/admin/rooms/RoomManagementPage'
import CourseManagementPage from '@/pages/admin/courses/CourseManagementPage'
import ClassPage from '@/pages/student/class/Class'
import LogoutPage from '@/pages/auth/Logout'
import ClassManagementPage from '@/pages/admin/classes/ClassManagementPage'
import MessagesPage from '@/pages/messages/MessagesPage'
import ExamPracticePage from '@/pages/student/exam/ExamPracticePage'
import ScheduleManagementPage from '@/pages/admin/schedule/ScheduleManagementPage'
import ScheduleGeneratorPage from '@/pages/admin/schedule/ScheduleGeneratorPage'
import ComingSoon from '@/components/core/ComingSoon'
import { ResetPasswordPage } from '@/pages/auth/ResetPassword'
import TestResultPage from '@/pages/student/exam/TestResultPage'
import CreateTestPage from '@/pages/student/exam/CreateTestPage'
import FirstLoginGuard from '@/components/feature/auth/FirstLoginGuard'
import GeneralDashboard from '@/pages/Dashboard'
import SettingsPage from '@/pages/settings/SettingsPage'
import TestDetailPage from '@/pages/student/exam/TestDetailPage'
import ChatbotUploadPage from '@/pages/admin/system/ChatbotUploadPage'
import { MainLayout } from './layouts/MainLayout'
import AdminInvoicePage from '@/pages/admin/finance/AdminInvoicePage'
import AdminFinanceReportPage from '@/pages/admin/finance/AdminFinanceReportPage'
import StudentInvoicePage from '@/pages/student/finance/StudentInvoicePage'
import PaymentCallbackPage from '@/pages/student/finance/PaymentCallbackPage'
import TeacherClassPage from '@/pages/teacher/classes/TeacherClassPage'
import TestTakerWrapper from '@/pages/student/exam/do/TestTakerWrapper'
import AuditLogPage from '@/pages/admin/audit/AuditLogPage'
import TeacherClassDetailPage from '@/pages/teacher/classes/TeacherClassDetailPage'
import EditTestPage from '@/pages/student/exam/EditTestPage'
import TeacherGradingPage from '@/pages/teacher/grading/TeacherGradingPage'
import GradeAttemptPage from '@/pages/teacher/grading/GradeAttemptPage'
import { useSession } from '@/stores/session.store'

// KPI & Salary
import KpiTiersSettingsPage from '@/pages/admin/kpi/KpiTiersSettingsPage'
import AdminKpiOverviewPage from '@/pages/admin/kpi/AdminKpiOverviewPage'
import AdminKpiCalculationPage from '@/pages/admin/kpi/AdminKpiCalculationPage'
import AdminKpiRecordDetailPage from '@/pages/admin/kpi/AdminKpiRecordDetailPage'
import AdminKpiTemplatePage from '@/pages/admin/kpi/AdminKpiTemplatePage'
import AdminSupportCalcPage from '@/pages/admin/kpi/AdminSupportCalcPage'
import AdminPayrollListPage from '@/pages/admin/salary/AdminPayrollListPage'
import AdminPayrollRunPage from '@/pages/admin/salary/AdminPayrollRunPage'
import AdminSalaryDetailPage from '@/pages/admin/salary/AdminSalaryDetailPage'

import TeacherKpiDashboard from '@/pages/teacher/kpi/TeacherKpiDashboard'
import TeacherSalaryHistoryPage from '@/pages/teacher/salary/TeacherSalaryHistoryPage'
import TeacherSalaryDetailPage from '@/pages/teacher/salary/TeacherSalaryDetailPage'

export const router = createBrowserRouter([
    {
        element: (
            <>
                <FirstLoginGuard />
                <Outlet />
            </>
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
            { path: '/login', element: <LoginPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/otp', element: <OtpPage /> },
            { path: '/logout', element: <LogoutPage /> },
            {
                path: '/reset-password',
                element: <ResetPasswordPage />,
            },

            // General routes
            { path: '/test', element: <ExamPracticePage /> },
            {
                path: '/coming-soon',
                element: <ComingSoon />,
            },

            // No Nav
            {
                // Main test taking route
                path: '/student/tests/:testId/take/:attemptId',
                element: <TestTakerWrapper />,
            },
            {
                // Alternative route for backward compatibility
                path: '/test/:testId/attempt/:attemptId',
                element: <TestTakerWrapper />,
            },

            // Profile (accessible to all authenticated users)
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
                        path: '/teacher/tests',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <ExamPracticePage />,
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/tests/create',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <CreateTestPage />,
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/tests/:testId/view',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TestDetailPage />,
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/teacher/tests/:testId/edit',
                        element: (
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <EditTestPage />,
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
                                <Navigate to="/dashboard" replace />{' '}
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
                        path: '/admin/settings/kpi-tiers',
                        element: (
                            <ProtectedRoute
                                allowedRoles={['system_admin', 'center_admin']}
                            >
                                <KpiTiersSettingsPage />
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
