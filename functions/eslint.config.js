import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'require-jsdoc': 'off',
      'valid-jsdoc': 'off',
      'max-len': 'off',  // Disable line length check
      'indent': ['error', 2],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single']
    },
  },
];
