/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
      includeSource: ['src/**/*.{js,ts}'],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      coverage: {
        reporter: ['text', 'json', 'html', 'lcov', 'cobertura' ],
      },
  },
});
