import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/Login'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import OtpPage from '@/pages/auth/OtpPage'
// import ResetPasswordPage from '@/pages/auth/ResetPassword'
import { pageVariants, sharedLayoutTransition } from './animationVariants'

/**
 * AnimatedAuthRoutes Component
 *
 * Wraps auth routes with Framer Motion AnimatePresence
 * for smooth page transitions
 *
 * Requirements:
 * npm install framer-motion
 *
 * Usage:
 * Replace your auth routes with this component
 *
 * Note: Animation variants are in separate file (animationVariants.ts)
 * to comply with react-refresh/only-export-components ESLint rule
 */

export default function AnimatedAuthRoutes() {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/login"
                    element={
                        <AnimatedPage>
                            <LoginPage />
                        </AnimatedPage>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <AnimatedPage>
                            <ForgotPasswordPage />
                        </AnimatedPage>
                    }
                />
                <Route
                    path="/otp"
                    element={
                        <AnimatedPage>
                            <OtpPage />
                        </AnimatedPage>
                    }
                />
                {/* <Route
                    path="/reset-password"
                    element={
                        <AnimatedPage>
                            <ResetPasswordPage />
                        </AnimatedPage>
                    }
                /> */}
            </Routes>
        </AnimatePresence>
    )
}

// Wrapper component for animated pages
function AnimatedPage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
                width: '100%',
                height: '100%',
            }}
        >
            {children}
        </motion.div>
    )
}

// FormCard specific animation wrapper
export function AnimatedFormCard({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            layout
            transition={sharedLayoutTransition}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
                width: '100%',
            }}
        >
            {children}
        </motion.div>
    )
}
