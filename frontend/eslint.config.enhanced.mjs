import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended-legacy"
  ),
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ISO 25010 - Maintainability & Reliability
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      
      // ISO 9241 - Accessibility (WCAG 2.2 AA alignment)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error", 
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/lang": "error",
      
      // ISO 27001 - Security
      "security/detect-object-injection": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      
      // Performance & Best Practices
      "react/no-array-index-key": "error",
      "react/jsx-no-bind": "error",
      "react/no-multi-comp": ["error", { "ignoreStateless": true }],
      "@next/next/no-img-element": "error", // Use Next.js Image instead
      
      // Code Quality
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      "no-debugger": "error",
      "complexity": ["error", { "max": 10 }],
      "max-lines-per-function": ["error", { "max": 50, "skipBlankLines": true }],
      
      // Documentation (JSDoc)
      "valid-jsdoc": ["error", {
        "requireReturn": false,
        "requireParamDescription": false,
        "requireReturnDescription": false
      }],
      
      // Next.js specific
      "react/no-unescaped-entities": "error",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "max-lines-per-function": "off",
    },
  },
];

export default eslintConfig;