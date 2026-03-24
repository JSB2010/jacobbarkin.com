import tseslint from "typescript-eslint";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = [
  {
    // Ignore patterns for build artifacts and generated files
    ignores: [
      ".next/**",
      ".open-next/**",
      "out/**",
      "node_modules/**",
      ".wrangler/**",
      "**/*.d.ts",
    ],
  },
  // TypeScript configuration
  ...tseslint.configs.recommended,
  // React configuration
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow empty interfaces for Next.js page props
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow namespaces for legacy code
      "@typescript-eslint/no-namespace": "warn",
      // Allow require imports for compatibility
      "@typescript-eslint/no-require-imports": "warn",
      // Allow @ts-ignore in tests
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
];

export default eslintConfig;
