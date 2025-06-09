import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron';

export default defineConfig(({ command }) => ({
    base: './',
    plugins: [
        react(),
        tailwindcss(),
        command === 'build' && electron({
            entry: 'electron/main.js',
        }),
    ],
    build: {
        target: 'esnext',
        outDir: 'dist',
        minify: 'esbuild',
        sourcemap: false,
    },
}));
