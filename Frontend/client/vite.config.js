import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: '/Campus-Sphere/'
  // server:{
  //   proxy:{
  //     '/api': 'http://localhost:3000'
  //   }
  // }
  // base:"/Campus-Sphere/"
})
