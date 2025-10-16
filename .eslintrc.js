module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended'
    ],
    env: {
        node: true,
        es6: true
    },
    rules: {
        'prettier/prettier': [
            'warn',
            {
                trailingComma: 'none',
                printWidth: 140,
                tabWidth: 4,
                singleQuote: true,
                bracketSpacing: false,
                arrowParens: 'always'
            }
        ],
        'eqeqeq': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
        '@typescript-eslint/no-non-null-assertion': 'warn',
        'no-console': 'off',
        
        // Relax some strict rules for library/framework code
        '@typescript-eslint/no-unsafe-function-type': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        '@typescript-eslint/no-redundant-type-constituents': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/await-thenable': 'warn',
        '@typescript-eslint/unbound-method': 'warn',
        '@typescript-eslint/no-for-in-array': 'warn',
        '@typescript-eslint/no-require-imports': 'warn'
    },
    overrides: [
        {
            // Allow 'any' in certain files that deal with AWS event processing
            files: ['src/common/event.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'warn'
            }
        }
    ]
};
