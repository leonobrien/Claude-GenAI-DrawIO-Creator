import tseslint from 'typescript-eslint';
import security from 'eslint-plugin-security';
import secureCoding from 'eslint-plugin-secure-coding';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.js', '**/*.mjs'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    plugins: {
      security,
      'secure-coding': secureCoding,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- eslint-plugin-security rules ---
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'warn',
      'security/detect-new-buffer': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-child-process': 'error',

      // --- eslint-plugin-secure-coding rules ---
      'secure-coding/no-hardcoded-credentials': 'error',
      'secure-coding/no-unsafe-deserialization': 'warn',
      'secure-coding/no-xxe-injection': 'warn',
      'secure-coding/no-redos-vulnerable-regex': 'warn',
      'secure-coding/no-unsafe-regex-construction': 'warn',
      'secure-coding/detect-object-injection': 'warn',
      'secure-coding/no-sensitive-data-exposure': 'warn',
      'secure-coding/no-unlimited-resource-allocation': 'warn',
      'secure-coding/no-unchecked-loop-condition': 'warn',
      'secure-coding/detect-non-literal-regexp': 'warn',

      // --- typescript-eslint quality rules ---
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // --- built-in complexity rules ---
      'complexity': ['warn', { max: 10 }],
      'max-depth': ['warn', { max: 4 }],
      'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', { max: 4 }],
      'max-nested-callbacks': ['warn', { max: 3 }],
    },
  }
);
