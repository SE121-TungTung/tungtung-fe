import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/auth/Login'
import StudentDashboard from '@/pages/student/dashboard/Dashboard'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import OtpPage from '@/pages/auth/OtpPage'

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/otp', element: <OtpPage /> },
    { path: '/test', element: <StudentDashboard /> },
    {
        path: '/student',
        element: (
            <ProtectedRoute>
                <StudentDashboard />
            </ProtectedRoute>
        ),
    },
    // route cho teacher/admin
])
