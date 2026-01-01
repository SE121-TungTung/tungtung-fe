import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query'
import { DialogProvider } from '@/context/DialogContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <DialogProvider>{children}</DialogProvider>
        </QueryClientProvider>
    )
}
