module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      rules: {
        'linebreak-style': ['error', 'unix'],
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'linebreak-style': ['error', 'windows'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-underscore-dangle': 'off',

    'import/order': ['error', {
      pathGroups: [
        {
          pattern: '~/**',
          group: 'external',
        },
      ],
    }],

  },
};
