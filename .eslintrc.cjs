module.exports = {
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/export': 'error'
  },
  overrides: [
    {
      files: ['vite.config.ts', 'vitest.config.ts', 'src/vite.config.ts'],
      parserOptions: { project: './tsconfig.node.json' }
    }
  ],
  ignorePatterns: [
    'dist',
    'node_modules',
    'vite.config.ts.timestamp-*.mjs',
    'supabase/functions/**/*',
    'src/tempobook/**/*'
  ]
};
