import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  // server: {
  //   proxy: {
  //     '/api': process.env.VITE_API_URL,
  //     '/socket.io': {
  //       target: process.env.VITE_API_URL,
  //       ws: true,
  //       changeOrigin: true,
  //     },
  //   },
  // },
})
