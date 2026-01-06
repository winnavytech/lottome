
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // หากชื่อ Repo ของคุณไม่ใช่ username.github.io ให้เปลี่ยน base เป็น '/ชื่อ-repo/'
  base: './',
  define: {
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  }
});
