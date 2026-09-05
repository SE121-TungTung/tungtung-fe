/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
    base: '/',
    plugins: [
        react(),
        svgr({
            include: '**/*.svg?react',
        }),
    ],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
        port: 3000,
        watch: {
            usePolling: true,
        },
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:8787',
                changeOrigin: true,
                secure: false,
            },
            '/receipts': {
                target: process.env.VITE_API_URL || 'http://localhost:8787',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalizedId = id.replace(/\\/g, '/')
                    if (normalizedId.includes('node_modules/')) {
                        if (normalizedId.includes('/three/')) {
                            return 'vendor-three'
                        }
                        if (
                            normalizedId.includes('/framer-motion/') ||
                            normalizedId.includes('/gsap/')
                        ) {
                            return 'vendor-animation'
                        }
                        if (
                            normalizedId.includes('/react/') ||
                            normalizedId.includes('/react-dom/') ||
                            normalizedId.includes('/react-router/') ||
                            normalizedId.includes('/react-router-dom/')
                        ) {
                            return 'vendor-react'
                        }
                        if (normalizedId.includes('/@tanstack/')) {
                            return 'vendor-query'
                        }
                    }
                },
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test-setup.ts'],
    },
})
