import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Workspace-пакеты резолвятся на исходники, чтобы тесты шли без предварительной сборки.
export default defineConfig({
  resolve: {
    alias: {
      "@dark-factory/contracts": fileURLToPath(
        new URL("./packages/contracts/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["packages/**/test/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
