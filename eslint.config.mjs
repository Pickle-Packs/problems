import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import functional from 'eslint-plugin-functional';
import pluginN from 'eslint-plugin-n';

const singleExitRule = {
    meta: {
        type: 'suggestion',
        docs: { description: 'Enforce a single return statement per function' },
        messages: {
            tooMany: 'Function has {{count}} return statements. Only one is allowed.',
            extraReturn: 'Additional return not allowed here.',
        },
        schema: [],
    },
    create(context) {
        const stack = [];
        function enter() {
            stack.push(0);
        }
        function exit(node) {
            const count = stack.pop() || 0;
            if (count > 1) context.report({ node, messageId: 'tooMany', data: { count } });
        }
        return {
            ':function': enter,
            ':function:exit': exit,
            'ReturnStatement'(node) {
                if (stack.length === 0) return; // ignore top-level
                const i = stack.length - 1;
                stack[i] += 1;
                if (stack[i] > 1) context.report({ node, messageId: 'extraReturn' });
            },
        };
    },
};

const noBareReturnVoid = {
    meta: {
        type: 'problem',
        docs: { description: 'Disallow bare `return;` in void-returning functions' },
        messages: { noBare: 'Do not use `return;` in a void-returning function.' },
        schema: [],
    },
    create(context) {
        const stack = [];
        function isVoidFn(fn) {
            if (fn.parent?.type === 'MethodDefinition' && fn.parent.kind === 'constructor') return true;
            const ann = fn.returnType && fn.returnType.typeAnnotation;
            return !!ann && ann.type === 'TSVoidKeyword';
        }
        return {
            ':function'(node) {
                stack.push(isVoidFn(node));
            },
            ':function:exit'() {
                stack.pop();
            },
            'ReturnStatement'(node) {
                if (stack.length && stack[stack.length - 1] && !node.argument) {
                    context.report({ node, messageId: 'noBare' });
                }
            },
        };
    },
};

const noBooleanParameters = {
    meta: {
        type: 'problem',
        docs: { description: 'Disallow boolean-typed parameters' },
        messages: { booleanParam: 'Boolean parameter "{{name}}" is not allowed.' },
        schema: [],
    },
    create(ctx) {
        const sc = ctx.sourceCode;
        const isBool = (t) =>
            t?.type === 'TSBooleanKeyword' ||
            (t?.type === 'TSUnionType' &&
                t.types.every(
                    (u) =>
                        u.type === 'TSBooleanKeyword' ||
                        (u.type === 'TSLiteralType' && (u.literal.raw === 'true' || u.literal.raw === 'false')),
                ));

        const checkFn = (fn) => {
            for (const p of fn.params) {
                let id = p;
                if (p.type === 'AssignmentPattern') id = p.left;
                if (p.type === 'RestElement') id = p.argument;
                const ann = id.typeAnnotation?.typeAnnotation;
                if (ann && isBool(ann)) {
                    const name = id.name ?? sc.getText(id);
                    ctx.report({ node: id, messageId: 'booleanParam', data: { name } });
                }
            }
        };

        return {
            FunctionDeclaration: checkFn,
            FunctionExpression: checkFn,
            ArrowFunctionExpression: checkFn,
            MethodDefinition(node) {
                checkFn(node.value);
            },
            TSMethodSignature: checkFn,
        };
    },
};

const noUnderscoreAccessRule = {
    meta: {
        type: 'problem',
        docs: { description: 'Warn on access to underscore-prefixed members' },
        schema: [],
        messages: { deny: 'Accessing underscore-prefixed member is prohibited: {{display}}' },
    },
    create(context) {
        function checkMember(node) {
            // obj._foo
            if (!node.computed && node.property?.type === 'Identifier') {
                const name = node.property.name;
                if (name?.startsWith('_')) {
                    context.report({ node, messageId: 'deny', data: { display: `.${name}` } });
                }
                return;
            }

            // obj['_foo']
            if (node.computed && node.property?.type === 'Literal') {
                const v = node.property.value;
                if (typeof v === 'string' && v.startsWith('_')) {
                    context.report({ node, messageId: 'deny', data: { display: `['${v}']` } });
                }
                return;
            }

            // obj[`_foo`] with no expressions
            if (node.computed && node.property?.type === 'TemplateLiteral' && node.property.expressions.length === 0) {
                const cooked = node.property.quasis[0]?.value?.cooked ?? '';
                if (typeof cooked === 'string' && cooked.startsWith('_')) {
                    context.report({ node, messageId: 'deny', data: { display: `[\`${cooked}\`]` } });
                }
            }
        }

        return {
            MemberExpression(node) {
                checkMember(node);
            },
            // Handle optional chaining: obj?._foo or obj?['_foo']
            ChainExpression(node) {
                const expr = node.expression;
                if (expr?.type === 'MemberExpression') checkMember(expr);
            },
        };
    },
};

export default [
    { ignores: ['dist/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    perfectionist.configs['recommended-alphabetical'],
    perfectionist.configs['recommended-natural'],
    {
        plugins: {
            '@stylistic': stylistic,
            '@functional': functional,
            'n': pluginN,
            'custom': {
                rules: {
                    'single-exit': singleExitRule,
                    'no-bare-return-void': noBareReturnVoid,
                    'no-accessing-throwaway': noUnderscoreAccessRule,
                },
            },
        },
        files: ['src/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'array-callback-return': 'error',
            'block-scoped-var': 'error',
            'camelcase': 'error',
            'complexity': ['error', { max: 15, variant: 'modified' }],
            'consistent-this': ['error', 'self'],
            'curly': ['error', 'all'],
            'default-case': 'error',
            'default-case-last': 'error',
            'eqeqeq': ['error', 'always'],
            'func-name-matching': 'error',
            'func-names': ['error', 'always'],
            'func-style': ['error', 'declaration'],
            'guard-for-in': 'error',
            'id-length': ['error', { min: 3, exceptions: ['x', '_'] }],
            'max-classes-per-file': ['error', 1],
            'max-depth': ['warn', { max: 3 }],
            'max-nested-callbacks': ['warn', { max: 3 }],
            'max-statements': ['warn', { max: 25 }],
            'max-statements-per-line': ['error', { max: 1 }],
            'multiline-ternary': ['error', 'always'],
            'new-cap': 'error',
            'no-await-in-loop': 'error',
            'no-bitwise': 'warn',
            'no-caller': 'error',
            'no-case-declarations': 'error',
            'no-constructor-return': 'error',
            'no-div-regex': 'error',
            'no-duplicate-imports': 'error',
            'no-else-return': 'off',
            'no-empty': 'error',
            'no-eq-null': 'error',
            'no-eval': 'error',
            'no-extend-native': 'error',
            'no-extra-bind': 'error',
            'no-extra-label': 'error',
            'no-implicit-coercion': ['error', { disallowTemplateShorthand: true }],
            'no-implicit-globals': 'error',
            'no-inline-comments': 'error',
            'no-inner-declarations': 'error',
            'no-invalid-this': 'error',
            'no-iterator': 'error',
            'no-label-var': 'error',
            'no-labels': 'error',
            'no-lone-blocks': 'error',
            'no-lonely-if': 'warn',
            'no-multi-assign': 'error',
            'no-multi-str': 'error',
            'no-negated-condition': 'error',
            'no-nested-ternary': 'error',
            'no-new': 'error',
            'no-new-func': 'error',
            'no-new-wrappers': 'error',
            'no-object-constructor': 'error',
            'no-octal-escape': 'error',
            'no-param-reassign': 'error',
            'no-promise-executor-return': 'error',
            'no-proto': 'error',
            'no-return-assign': 'error',
            'no-self-compare': 'error',
            'no-sequences': 'error',
            'no-template-curly-in-string': 'warn',
            'no-undef-init': 'error',
            'no-unassigned-vars': 'error',
            'no-unmodified-loop-condition': 'error',
            'no-unreachable-loop': 'error',
            'no-unused-expressions': 'warn',
            'no-use-before-define': 'off',
            'no-useless-assignment': 'error',
            'no-useless-call': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-rename': 'error',
            'no-useless-return': 'error',
            'no-var': 'error',
            'object-shorthand': ['error', 'never'],
            'one-var': ['error', 'never'],
            'operator-linebreak': ['error', 'before', { overrides: { '?': 'before', ':': 'before' } }],
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-object-has-own': 'warn',
            'prefer-object-spread': 'error',
            'prefer-regex-literals': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'prefer-template': 'warn',
            'radix': 'error',
            'require-atomic-updates': 'error',
            'yoda': ['error', 'always'],
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/array-type': ['error', { default: 'generic', readonly: 'generic' }],
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/ban-tslint-comment': 'error',
            'class-methods-use-this': 'off',
            '@typescript-eslint/class-methods-use-this': 'error',
            '@typescript-eslint/consistent-generic-constructors': ['error', 'type-annotation'],
            '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
            ],
            'default-param-last': 'off',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            'init-declarations': 'off',
            '@typescript-eslint/init-declarations': ['error', 'never', { ignoreForLoopInit: true }],
            'max-params': 'off',
            '@typescript-eslint/max-params': ['warn', { max: 6 }],
            '@typescript-eslint/member-ordering': [
                'error',
                {
                    default: {
                        memberTypes: [
                            'public-static-field',
                            'protected-static-field',
                            'private-static-field',
                            'public-instance-field',
                            'protected-instance-field',
                            'private-instance-field',
                            'constructor',
                            'public-instance-method',
                            'protected-instance-method',
                            'private-instance-method',
                        ],
                        order: 'as-written',
                    },
                },
            ],
            '@typescript-eslint/method-signature-style': ['error', 'method'],
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'default', format: ['camelCase'] },
                { selector: 'variable', format: ['camelCase'], leadingUnderscore: 'allow' },
                { selector: 'variable', modifiers: ['destructured'], format: null },
                { selector: 'function', format: ['camelCase'] },
                { selector: 'class', format: ['PascalCase'] },
                { selector: 'interface', format: ['StrictPascalCase'], prefix: ['I'] },
                { selector: 'typeAlias', format: ['PascalCase'] },
                { selector: 'typeParameter', format: ['PascalCase'], prefix: ['T'] },
                { selector: 'enum', format: ['PascalCase'] },
                { selector: 'enumMember', format: ['PascalCase'] },
                { selector: 'import', format: ['camelCase', 'PascalCase'] },
                {
                    selector: [
                        'classProperty',
                        'objectLiteralProperty',
                        'typeProperty',
                        'classMethod',
                        'objectLiteralMethod',
                        'typeMethod',
                        'accessor',
                        'enumMember',
                    ],
                    modifiers: ['requiresQuotes'],
                    format: null,
                },
                { selector: 'default', filter: { regex: '^_', match: true }, format: null },
                { selector: 'default', format: ['camelCase'] },
            ],
            'no-array-constructor': 'off',
            '@typescript-eslint/no-array-constructor': 'error',
            '@typescript-eslint/no-array-delete': 'error',
            '@typescript-eslint/no-confusing-non-null-assertion': 'error',
            '@typescript-eslint/no-confusing-void-expression': 'error',
            '@typescript-eslint/no-deprecated': 'warn',
            '@typescript-eslint/no-duplicate-enum-values': 'error',
            '@typescript-eslint/no-duplicate-type-constituents': 'error',
            '@typescript-eslint/no-dynamic-delete': 'error',
            'no-empty-function': 'off',
            '@typescript-eslint/no-empty-function': 'error',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            '@typescript-eslint/no-extraneous-class': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-for-in-array': 'error',
            'no-implied-eval': 'off',
            '@typescript-eslint/no-implied-eval': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-invalid-void-type': 'error',
            'no-loop-func': 'off',
            '@typescript-eslint/no-loop-func': 'error',
            'no-magic-numbers': 'off',
            '@typescript-eslint/no-magic-numbers': [
                'warn',
                { ignore: [-1, 0, 1, 100, 1_000], ignoreArrayIndexes: true },
            ],
            '@typescript-eslint/no-meaningless-void-operator': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/no-misused-spread': 'error',
            '@typescript-eslint/no-mixed-enums': 'error',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-redundant-type-constituents': 'error',
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': ['error', 'fs'],
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unnecessary-qualifier': 'warn',
            '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            '@typescript-eslint/no-unnecessary-type-conversion': 'error',
            '@typescript-eslint/no-unsafe-type-assertion': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-throw-literal': 'off',
            '@typescript-eslint/only-throw-error': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/prefer-enum-initializers': 'error',
            '@typescript-eslint/prefer-find': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-includes': 'error',
            '@typescript-eslint/prefer-literal-enum-member': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',
            'prefer-promise-reject-errors': 'off',
            '@typescript-eslint/prefer-promise-reject-errors': 'error',
            '@typescript-eslint/prefer-readonly': 'warn',
            // '@typescript-eslint/prefer-readonly-parameter-types': 'error',
            '@typescript-eslint/prefer-reduce-type-parameter': 'error',
            '@typescript-eslint/prefer-regexp-exec': 'error',
            '@typescript-eslint/prefer-return-this-type': 'warn',
            '@typescript-eslint/prefer-string-starts-ends-with': 'error',
            '@typescript-eslint/promise-function-async': 'warn',
            '@typescript-eslint/require-array-sort-compare': 'error',
            'require-await': 'off',
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/restrict-plus-operands': 'error',
            '@typescript-eslint/restrict-template-expressions': 'error',
            '@typescript-eslint/return-await': ['error', 'error-handling-correctness-only'],
            '@typescript-eslint/strict-boolean-expressions': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/triple-slash-reference': 'error',
            '@typescript-eslint/unbound-method': 'error',
            '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/max-len': ['error', { code: 200, tabWidth: 4, ignoreUrls: true, ignoreRegExpLiterals: true }],
            '@stylistic/comma-dangle': [
                'error',
                {
                    arrays: 'always-multiline',
                    objects: 'always-multiline',
                    imports: 'always-multiline',
                    exports: 'always-multiline',
                    functions: 'always-multiline',
                },
            ],
            '@stylistic/indent': [
                'error',
                4,
                {
                    FunctionDeclaration: { parameters: 1, body: 1 },
                    FunctionExpression: { parameters: 1, body: 1 },
                    CallExpression: { arguments: 1 },
                },
            ],
            '@stylistic/no-confusing-arrow': 'error',
            '@stylistic/no-whitespace-before-property': 'error',
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/curly-newline': ['error', 'always'],
            '@stylistic/object-property-newline': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/no-floating-decimal': 'error',
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
            '@stylistic/no-multi-spaces': 'error',
            '@stylistic/object-curly-newline': ['error', { minProperties: 2 }],
            '@stylistic/operator-linebreak': ['error', 'before'],
            '@stylistic/no-mixed-operators': 'error',
            '@stylistic/padded-blocks': ['error', 'never'],
            '@stylistic/no-extra-semi': 'error',
            '@stylistic/dot-location': ['error', 'property'],
            '@stylistic/member-delimiter-style': 'error',
            '@stylistic/lines-between-class-members': ['error', 'always'],
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/brace-style': 'error',
            '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
            '@stylistic/generator-star-spacing': ['error', { before: true, after: false }],
            '@stylistic/computed-property-spacing': ['error', 'never'],
            '@stylistic/yield-star-spacing': ['error', 'before'],
            '@stylistic/function-call-spacing': ['error', 'never'],
            '@stylistic/comma-spacing': 'error',
            '@stylistic/type-annotation-spacing': 'error',
            '@stylistic/multiline-ternary': ['error', 'always'],
            '@stylistic/function-paren-newline': ['error', { minItems: 2 }],
            '@stylistic/function-call-argument-newline': ['error', 'always'],
            '@stylistic/newline-per-chained-call': ['error', { ignoreChainWithDepth: 1 }],
            '@stylistic/array-element-newline': ['error', { minItems: 2 }],
            '@stylistic/array-bracket-newline': ['error', { multiline: true }],
            '@stylistic/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: ['block', 'block-like'], next: '*' },
                {
                    blankLine: 'always',
                    prev: ['class', 'interface', 'function', 'enum', 'type'],
                    next: ['class', 'interface', 'function', 'enum', 'type'],
                },
                { blankLine: 'always', prev: ['class', 'interface', 'enum', 'type'], next: 'export' },
                { blankLine: 'never', prev: 'function-overload', next: ['function-overload', 'function', 'export'] },
                { blankLine: 'always', prev: '*', next: 'export' },
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                { blankLine: 'always', prev: '*', next: 'continue' },
                { blankLine: 'always', prev: '*', next: ['do', 'while', 'for'] },
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: ['case', 'default'], next: '*' },
            ],
            '@stylistic/rest-spread-spacing': ['error', 'never'],
            '@stylistic/indent-binary-ops': 'error',
            '@stylistic/semi-style': ['error', 'last'],
            '@stylistic/space-before-blocks': 'error',
            '@stylistic/space-before-function-paren': ['error', 'never'],
            '@stylistic/space-in-parens': ['error', 'never'],
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/space-unary-ops': 'error',
            '@stylistic/spaced-comment': ['error', 'always'],
            '@stylistic/switch-colon-spacing': 'error',
            '@stylistic/template-curly-spacing': ['error', 'always'],
            '@stylistic/template-tag-spacing': 'error',
            '@stylistic/type-generic-spacing': ['error'],
            '@stylistic/type-named-tuple-spacing': ['error'],
            '@stylistic/wrap-iife': [2, 'inside', { functionPrototypeMethods: true }],
            '@stylistic/wrap-regex': 'error',

            '@functional/no-promise-reject': 'error',
            '@functional/no-throw-statements': 'warn',
            '@functional/no-try-statements': 'warn',
            '@functional/immutable-data': 'error',
            '@functional/no-let': 'error',
            '@functional/no-class-inheritance': 'error',
            '@functional/no-classes': 'warn',
            '@functional/no-mixed-types': 'error',
            '@functional/no-this-expressions': 'warn',
            '@functional/no-conditional-statements': 'warn',
            '@functional/no-expression-statements': ['warn', { ignoreVoid: true }],
            '@functional/no-loop-statements': 'warn',
            '@functional/prefer-tacit': 'warn',
            '@functional/readonly-type': ['error', 'generic'],
            '@functional/no-return-void': 'warn',

            'custom/no-bare-return-void': 'error',
            'custom/single-exit': 'error',
            'custom/no-accessing-throwaway': 'error',
        },
    },
];
