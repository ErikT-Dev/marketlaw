import js from "@eslint/js";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import vitest from "@vitest/eslint-plugin";
import functional from "eslint-plugin-functional";
import { importX } from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import sonarjs from "eslint-plugin-sonarjs";
import testingLibrary from "eslint-plugin-testing-library";
import tseslint from "typescript-eslint";
import { noComments } from "./eslint-rules/noComments.ts";

const TYPESCRIPT_FILES = ["**/*.ts", "**/*.tsx"];
const TEST_FILES = ["**/*.test.ts", "**/*.test.tsx", "e2e/**/*.ts"];
const FILES_THAT_NEED_A_DEFAULT_EXPORT = ["*.config.ts", "src/server/worker.ts"];
const ASCII_SENTENCE = "^[\x20-\x7E]+$";
const BOOLEAN_PREFIXES = [
  "is",
  "has",
  "can",
  "should",
  "was",
  "were",
  "did",
  "does",
  "will",
  "needs",
  "allows",
];

export default tseslint.config(
  {
    ignores: [
      "dist/",
      ".wrangler/",
      "coverage/",
      "design/",
      "harness/",
      "playwright-report/",
      "test-results/",
      "worker-configuration.d.ts",
      "eslint.config.js",
      ".dependency-cruiser.cjs",
      ".size-limit.js",
    ],
  },
  {
    files: TYPESCRIPT_FILES,
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      eslintComments.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.engine.json",
          "./tsconfig.client.json",
          "./tsconfig.server.json",
          "./tsconfig.tools.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "import-x": importX,
      sonarjs,
      project: { rules: { "no-comments": noComments } },
    },
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: "error" },
    rules: {
      "project/no-comments": "error",
      "no-warning-comments": "error",
      "no-inline-comments": "error",
      "@eslint-community/eslint-comments/no-use": ["error", { allow: [] }],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": true, "ts-ignore": true, "ts-nocheck": true },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { considerDefaultExhaustiveForUnions: false },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "default", format: ["camelCase"], leadingUnderscore: "forbid" },
        { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"] },
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: BOOLEAN_PREFIXES,
        },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "parameter", format: ["camelCase"] },
        {
          selector: "parameter",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: BOOLEAN_PREFIXES,
        },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "typeProperty", format: null },
        { selector: "objectLiteralProperty", format: null },
        { selector: "objectLiteralMethod", format: null },
        { selector: "import", format: null },
      ],
      "import-x/no-default-export": "error",
      "func-style": ["error", "declaration", { allowArrowFunctions: false }],
      "prefer-arrow-callback": "error",
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "max-lines": ["error", { max: 300, skipBlankLines: true }],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true }],
      "max-params": ["error", 6],
      complexity: ["error", 14],
      "max-depth": ["error", 3],
      "sonarjs/cognitive-complexity": ["error", 15],
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: TEST_FILES,
    plugins: { functional },
    rules: {
      "functional/immutable-data": [
        "error",
        { ignoreClasses: true, ignoreAccessorPattern: ["**.current"] },
      ],
    },
  },
  {
    files: ["src/rules/**/*.ts"],
    rules: {
      "@typescript-eslint/prefer-readonly-parameter-types": [
        "error",
        { ignoreInferredTypes: true },
      ],
      "no-restricted-globals": [
        "error",
        "Date",
        "setTimeout",
        "setInterval",
        "fetch",
        "crypto",
        "performance",
        "globalThis",
        "window",
        "console",
      ],
      "no-restricted-properties": ["error", { object: "Math", property: "random" }],
    },
  },
  {
    files: ["src/server/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", "setInterval"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='accept']",
          message: "Use ctx.acceptWebSocket() (WebSocket Hibernation API), never ws.accept().",
        },
      ],
    },
  },
  {
    files: ["src/client/**/*.tsx"],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: { "react-hooks": reactHooks },
    settings: { react: { version: "19.1" } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/no-multi-comp": "error",
    },
  },
  {
    files: TEST_FILES,
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/no-disabled-tests": "error",
      "vitest/no-focused-tests": "error",
      "vitest/valid-title": [
        "error",
        { mustMatch: { describe: ASCII_SENTENCE, test: ASCII_SENTENCE, it: ASCII_SENTENCE } },
      ],
      "max-lines-per-function": "off",
    },
  },
  {
    files: ["src/rules/**/*.test.ts", "src/server/**/*.test.ts"],
    rules: {
      "vitest/no-restricted-matchers": [
        "error",
        {
          toMatchSnapshot: "No snapshots for logic (rules/testing.md)",
          toMatchInlineSnapshot: "No snapshots for logic (rules/testing.md)",
        },
      ],
    },
  },
  {
    files: ["src/client/**/*.test.tsx"],
    extends: [testingLibrary.configs["flat/react"]],
  },
  {
    files: FILES_THAT_NEED_A_DEFAULT_EXPORT,
    rules: { "import-x/no-default-export": "off" },
  },
);
