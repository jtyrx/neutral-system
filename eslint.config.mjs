import {defineConfig, globalIgnores} from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Bypass eslint-plugin-react auto-detection (uses removed RuleContext APIs on ESLint 10).
  {
    settings: {
      react: {version: '19'},
    },
  },
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts']),
])
