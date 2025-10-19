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
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:8787',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
