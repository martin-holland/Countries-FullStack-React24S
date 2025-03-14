import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
    server: {
      deps: {
        inline: [/^(?!.*node_modules).*$/],
      },
    },
    threads: false,
    isolate: false,
    coverage: {
      provider: 'v8',
      enabled: false, // Only enable when explicitly running coverage
    },
    pool: 'forks', // Try different pool strategies
    maxWorkers: 1,
    minWorkers: 1,
  },
});
