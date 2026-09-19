/**
 * Animation Variants for Framer Motion
 *
 * Separate file to comply with react-refresh/only-export-components rule
 */

// Default page transition
export const pageVariants = {
    initial: {
        opacity: 0,
        x: 20,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
    exit: {
        opacity: 0,
        x: -20,
        scale: 0.98,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
}

// Slide transition with direction
export const slideVariants = {
    initial: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -100 : 100,
        opacity: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    }),
}

// Scale fade transition
export const scaleFadeVariants = {
    initial: {
        opacity: 0,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
    exit: {
        opacity: 0,
        scale: 1.05,
        transition: {
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
}

// Shared layout transition
export const sharedLayoutTransition = {
    type: 'spring' as const,
    stiffness: 350,
    damping: 35,
}

// Fade only (subtle)
export const fadeVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
}

// Slide up
export const slideUpVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
}
