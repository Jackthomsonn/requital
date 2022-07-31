module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "google"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  ignorePatterns: ["*.js"],
  rules: {
    indent: ["error", 2],
    "require-jsdoc": 0,
    "max-len": ["error", { code: 500 }],
    "object-curly-spacing": ["error", "always"],
  },
};
