import { defineConfig } from 'vitest/config';

/**
 * The Angular `unit-test` builder discovers specs under src/ and runs them in a
 * browser-like environment. The Worker is plain TypeScript running on the edge
 * runtime, so it gets its own Node-environment config rather than being forced
 * through the Angular harness.
 *
 * Run with `npm run test:worker`.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['worker/**/*.spec.ts'],
  },
});
