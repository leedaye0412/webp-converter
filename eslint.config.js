import { FlatCompat } from "@eslint/eslintrc"
import eslint from "@eslint/js"
import importPlugin from "eslint-plugin-import"
import prettierConfig from "eslint-config-prettier"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const tsConfigs = compat.config({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: import.meta.dirname,
  },
  extends: [
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
}).map((config) => ({
  ...config,
  files: ["**/*.ts"],
}))

export default [
  eslint.configs.recommended,
  ...tsConfigs,
  prettierConfig,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],
      "import/no-duplicates": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/", "*.config.js"],
  },
]
