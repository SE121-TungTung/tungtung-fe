import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { ForgotPassword } from '@/pages/ForgotPassword'

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    {
        path: '/student',
        element: (
            <ProtectedRoute>
                <Dashboard label="Student" />
            </ProtectedRoute>
        ),
    },
    // route cho teacher/admin
])
