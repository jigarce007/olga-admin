import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Dev-only proxy so the browser calls same-origin paths and Olga.Core needs no CORS setup.
  const target = env.CORE_API_PROXY_TARGET || 'http://localhost:5000';
  const proxy = Object.fromEntries(['/v1', '/ready', '/health'].map((p) => [p, { target, changeOrigin: true }]));

  return {
    plugins: [react()],
    server: { port: 5173, proxy },
  };
});
