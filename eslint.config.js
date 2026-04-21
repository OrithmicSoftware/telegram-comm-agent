module.exports = [
  {
    files: ['**/*.js'],
    extends: ['eslint:recommended'],
    env: { node: true, es2021: true },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'semi': ['error', 'always'],
    },
  },
];
