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
        'no-console': 'off'
    }
};
