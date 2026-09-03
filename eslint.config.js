// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

/**
 * Flat config, mirroring the one in cloudora-weather-app so both repos fail on
 * the same things. Written as ESM because this package is `"type": "module"`.
 *
 * `worker/` is linted as plain TypeScript: it runs on the Cloudflare edge
 * runtime, not in Angular, so the Angular rule sets would only produce noise
 * there (see frontend-rules.md, "Note on `worker/`").
 */
export default tseslint.config(
  {
    ignores: ['dist/**', '.angular/**', 'coverage/**', 'lighthouse-reports/**', '.wrangler/**'],
  },
  {
    files: ['src/**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      // Pages are named without a suffix here (Home, Features, Contact), which
      // is the established convention — don't rename every page to satisfy it.
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      // frontend-rules.md § 3: `any` is prohibited.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
  {
    // Edge-runtime code: no Angular rules, and `any` still prohibited.
    files: ['worker/**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
  {
    // Specs mock third-party payloads, where a narrow `any` is the honest type.
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
