import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'

export function AppRouter() {
    useNotificationSocket()

    return <RouterProvider router={router} />
}
