import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // server: {
  //   proxy: {
  //     // 配置代理规则
  //     '/config': {
  //       target: 'http://127.0.0.1:9872', // 目标服务器地址
  //       changeOrigin: true, // 允许跨域
  //       secure: false, // 如果是 https 协议，需要设置为 false
  //       withCredentials: true, // 允许携带凭证
  //       rewrite: (path) => path.replace(/^\/config/, '') // 重写路径
  //     }
  //   }
  // }
})
