module.exports = {
  root: true,
  env: {
    node: true,
    es2024: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist', '.next', 'node_modules'],
};
