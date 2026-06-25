import { defineConfig, configDefaults } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Run test files serially — integration tests share a real DB
    fileParallelism: false,
    // Skip stale git worktrees under .claude/ — they hold duplicate test copies
    exclude: [...configDefaults.exclude, '**/.claude/**'],
  },
  resolve: {
    alias: {
      '@payload-config': path.resolve('./payload.config.ts'),
      '@': path.resolve('./src'),
    },
  },
})
