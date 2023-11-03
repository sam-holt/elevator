import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    base: '',
    server:
    {
        host: true,
        open: true,
        watch: {
            include: ['src//*', 'assets//*'],
        },
        fs: {
            allow: ['..'],
        },
    },
    build: {
        outDir: './dist',
        assetsDir: './',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },
        },
    }
})