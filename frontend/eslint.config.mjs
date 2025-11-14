import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import security from 'eslint-plugin-security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      'jsx-a11y': jsxA11y,
      security: security,
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'build/**', 'dist/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ISO 25010 - Maintainability & Reliability (Enhanced)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-misused-promises': 'error',

      // ISO 27001 - Security (Enhanced)
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',

      // ISO 9241 - Accessibility (WCAG 2.2 AA alignment)
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/lang': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',

      // Performance & Best Practices
      'react/no-array-index-key': 'error',
      'react/jsx-no-bind': 'error',
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      '@next/next/no-img-element': 'error', // Use Next.js Image instead
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'error',

      // Code Quality (Stricter)
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      complexity: ['error', { max: 8 }],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true }],
      'max-params': ['error', { max: 4 }],
      'no-duplicate-imports': 'error',

      // Next.js specific
      'react/no-unescaped-entities': 'error',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-sync-scripts': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.config.{js,ts,mjs}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];

export default eslintConfig;
