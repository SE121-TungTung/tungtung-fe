import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/AppProviders.tsx'
import { AppBootstrap } from '@/app/AppBootstrap.tsx'
import { AppRouter } from '@/app/AppRouter.tsx'
import '@/styles/globals.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppProviders>
            <AppBootstrap>
                <AppRouter />
            </AppBootstrap>
        </AppProviders>
    </StrictMode>
)
