import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Prettier як ESLint правило (щоб одразу ловити формат)
      "prettier/prettier": "error",

      // Fast Refresh правило:
      // якщо не хочеш, щоб воно сварилось на експорт констант — вимкни:
      "react-refresh/only-export-components": "off",
    },
  },
  {
    ignores: ["dist", "node_modules"],
  },
);
