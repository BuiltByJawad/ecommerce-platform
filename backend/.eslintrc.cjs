module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    jest: false,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:security/recommended-legacy',
    'prettier',
  ],
  plugins: ['import', 'security'],
  rules: {
    'no-console': 'off',
    'import/no-unresolved': 'off',
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};
