module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["google"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["*.js"],
  rules: {
    indent: ["error", 2],
    "require-jsdoc": 0,
    "max-len": ["error", { code: 240 }],
    "object-curly-spacing": ["error", "always"],
  },
};
