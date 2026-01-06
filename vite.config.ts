
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages deployment - ชื่อ repo คือ 'lottome'
  base: '/lottome/',
  define: {
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  }
});
