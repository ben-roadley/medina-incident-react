import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.MEDINA_API_BASE_URL
  const proxyAuthToken = env.MEDINA_API_AUTH_TOKEN

  return {
    plugins: [react()],
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (proxyAuthToken) {
                    proxyReq.setHeader('Authorization', `Bearer ${proxyAuthToken}`)
                  }
                })
              },
            },
          },
        }
      : undefined,
  }
})
