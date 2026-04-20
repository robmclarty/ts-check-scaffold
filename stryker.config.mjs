/**
 * Stryker mutation testing config.
 * Run via `pnpm check:mutation`. Slower than unit tests, so runs on demand or scheduled.
 */
export default {
  packageManager: 'pnpm',
  testRunner: 'vitest',
  reporters: ['clear-text', 'html', 'json'],
  htmlReporter: { fileName: '.check/mutation/report.html' },
  jsonReporter: { fileName: '.check/mutation/report.json' },
  mutate: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,
};
