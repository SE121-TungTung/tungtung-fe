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
import TestDetailPage from '@/pages/student/exam/TestDetailPage'
import ChatbotUploadPage from '@/pages/admin/system/ChatbotUploadPage'
import { MainLayout } from './layouts/MainLayout'
import TeacherClassPage from '@/pages/teacher/classes/TeacherClassPage'
import TestTakerWrapper from '@/pages/student/exam/do/TestTakerWrapper'
import AuditLogPage from '@/pages/admin/audit/AuditLogPage'
import TeacherClassDetailPage from '@/pages/teacher/classes/TeacherClassDetailPage'
import EditTestPage from '@/pages/student/exam/EditTestPage'
import TeacherGradingPage from '@/pages/teacher/grading/TeacherGradingPage'
import GradeAttemptPage from '@/pages/teacher/grading/GradeAttemptPage'

export const router = createBrowserRouter([
    {
        element: (
            <>
                <FirstLoginGuard />
                <Outlet />
            </>
        ),
        children: [
            { path: '/', element: <Navigate to="/login" replace /> },
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
                ],
            },
        ],
    },
])
