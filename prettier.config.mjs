/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  bracketSpacing: false,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './app/globals.css',
  tailwindFunctions: ['cn', 'clsx', 'cva'],
}

export default config
