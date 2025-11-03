import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/auth/Login'
import StudentDashboard from '@/pages/student/dashboard/Dashboard'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import OtpPage from '@/pages/auth/OtpPage'
import ReadingTestPage from '@/pages/student/exam/do/ReadingTestPage'
import MessagesPage from '@/pages/messages/MessagesPage'
import NotificationPage from '@/pages/notifications/NotificationPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import RoadmapPage from '@/pages/student/roadmap/RoadmapPage'

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/otp', element: <OtpPage /> },
    { path: '/testd', element: <ReadingTestPage /> },
    { path: '/test', element: <MessagesPage /> },
    { path: '/notifications', element: <NotificationPage /> },
    { path: '/profile', element: <ProfilePage /> },
    {
        path: '/student',
        element: (
            <ProtectedRoute>
                <StudentDashboard />
            </ProtectedRoute>
        ),
    },
    { path: '/student/roadmap', element: <RoadmapPage /> },
    // route cho teacher/admin
])
