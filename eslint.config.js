// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'app-example/**'],
  },
  {
    files: ['server/**/*.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
      },
    },
  },
]);
