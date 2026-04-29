import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['w3c-design-tokens-standard-schema'],
  // Pin workspace root when multiple lockfiles exist on the machine (e.g. parent dirs).
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
