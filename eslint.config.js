import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import testingLibrary from 'eslint-plugin-testing-library'
import unusedImports from 'eslint-plugin-unused-imports'

import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        browser: 'readonly',
        chrome: 'readonly',
        console: 'readonly',
        process: 'readonly',
        document: 'readonly',
        window: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        defineBackground: 'readonly',
        defineContentScript: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      react,
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      'testing-library': testingLibrary,
      'unused-imports': unusedImports,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // React specific rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/no-danger': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unused-state': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'off', // Requires type info
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Requires type info
      '@typescript-eslint/no-unnecessary-condition': 'off', // Requires type info
      '@typescript-eslint/no-unnecessary-type-assertion': 'off', // Requires type info
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],

      // Import/Export rules
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // External packages
            ['^\\w'],
            // Internal packages
            ['^@/'],
            // Relative imports
            ['^\\.'],
            // Type imports
            ['^.*\\u0000$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/order': 'off', // Using simple-import-sort instead
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-default-export': 'off',

      // General best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unused-expressions': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',
      'prefer-destructuring': [
        'error',
        {
          array: false,
          object: true,
        },
      ],

      // Code quality
      complexity: ['warn', 15],
      'max-depth': ['warn', 4],
      'max-lines': ['warn', 500],
      'max-lines-per-function': ['warn', 200],
      'max-params': ['warn', 4],

      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // JavaScript files configuration (without TypeScript parser)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: 'readonly',
        chrome: 'readonly',
        console: 'readonly',
        process: 'readonly',
        document: 'readonly',
        window: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // Import/Export rules
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\w'], ['^@/'], ['^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',

      // General best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',
    },
  },
  // Extension scripts configuration
  {
    files: ['entrypoints/background.ts', 'entrypoints/content.ts'],
    rules: {
      'no-console': 'off', // Console logging is useful for extension debugging
    },
  },
  // Test files configuration
  {
    files: ['src/**/*.test.{js,jsx,ts,tsx}', 'src/**/*.spec.{js,jsx,ts,tsx}', 'src/**/test/**/*'],
    plugins: {
      'testing-library': testingLibrary,
    },
    rules: {
      ...testingLibrary.configs['flat/react']?.rules,
      // Relax some rules for test files
      'testing-library/no-node-access': 'warn', // Allow some direct node access in tests
      'testing-library/no-container': 'warn', // Allow container usage in some test scenarios
      'testing-library/no-manual-cleanup': 'warn', // Allow manual cleanup when needed

      'no-console': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
    },
  },
  // Playwright E2E test files configuration
  {
    files: ['e2e/**/*.{js,ts}', 'playwright.config.ts'],
    languageOptions: {
      globals: {
        // Playwright globals
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        // Browser globals for E2E tests
        page: 'readonly',
        context: 'readonly',
        browser: 'readonly',
        chromium: 'readonly',
        firefox: 'readonly',
        webkit: 'readonly',
        // Node.js globals for E2E setup
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      // Relax rules for E2E tests
      'no-console': 'off', // Console logging is useful for E2E debugging
      'max-lines': 'off', // E2E tests can be longer
      'max-lines-per-function': 'off', // E2E test functions can be longer
      complexity: 'off', // E2E tests can be more complex
      'max-depth': 'off', // E2E tests may have deeper nesting
      '@typescript-eslint/no-explicit-any': 'off', // E2E tests may use any for flexibility
      '@typescript-eslint/no-non-null-assertion': 'off', // E2E tests may use non-null assertions
      'prefer-const': 'warn', // Prefer const but not strict in E2E
      'no-unused-expressions': 'off', // E2E tests may have expressions for waiting
      'no-await-in-loop': 'off', // E2E tests often need sequential async operations
      '@typescript-eslint/no-unused-vars': 'off', // May have unused vars in E2E setup
      'unused-imports/no-unused-vars': 'off', // May have unused imports for types
      // Allow dynamic imports for E2E utilities
      'import/no-dynamic-require': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.wxt/', 'coverage/', '.output/', 'src/templates/*.ejs'],
  },
  prettier,
]
