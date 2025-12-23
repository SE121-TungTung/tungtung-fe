import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

import { LoginPage } from '@/pages/auth/Login'
import StudentDashboard from '@/pages/student/dashboard/Dashboard'
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

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/otp', element: <OtpPage /> },
    { path: '/logout', element: <LogoutPage /> },
    { path: '/test', element: <ExamPracticePage /> },
    { path: '/notifications', element: <NotificationPage /> },

    {
        path: '/coming-soon',
        element: <ComingSoon />,
    },

    // Profile (accessible to all authenticated users)
    {
        path: '/profile',
        element: (
            <ProtectedRoute>
                <ProfilePage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/messages',
        element: (
            <ProtectedRoute>
                <MessagesPage />
            </ProtectedRoute>
        ),
    },

    // Student routes
    {
        path: '/student',
        element: (
            <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: '/student/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
            </ProtectedRoute>
        ),
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
        path: '/student/exams',
        element: (
            <ProtectedRoute allowedRoles={['student']}>
                <ExamPracticePage />
            </ProtectedRoute>
        ),
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

    // Admin routes
    {
        path: '/admin',
        element: (
            <ProtectedRoute
                allowedRoles={['office_admin', 'center_admin', 'system_admin']}
            >
                <Navigate to="/admin/users" replace />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/users',
        element: (
            <ProtectedRoute
                allowedRoles={['office_admin', 'center_admin', 'system_admin']}
            >
                <UserManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/rooms',
        element: (
            <ProtectedRoute
                allowedRoles={['office_admin', 'center_admin', 'system_admin']}
            >
                <RoomManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/courses',
        element: (
            <ProtectedRoute
                allowedRoles={['office_admin', 'center_admin', 'system_admin']}
            >
                <CourseManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/classes',
        element: (
            <ProtectedRoute
                allowedRoles={['office_admin', 'center_admin', 'system_admin']}
            >
                <ClassManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/schedule',
        element: (
            <ProtectedRoute
                allowedRoles={['office_admin', 'center_admin', 'system_admin']}
            >
                <ScheduleManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/schedule/generate',
        element: (
            <ProtectedRoute
                allowedRoles={['office_admin', 'center_admin', 'system_admin']}
            >
                <ScheduleGeneratorPage />
            </ProtectedRoute>
        ),
    },
])
