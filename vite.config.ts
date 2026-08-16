import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works at a domain root (Vercel/Netlify)
  // AND inside a subfolder (GitHub Pages project sites).
  base: './',
});
