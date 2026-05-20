/**
 * Spacing migration: converts all numeric Tailwind spacing classes by ×4
 * to preserve visual parity when switching from --spacing: 0.25rem → 0.0625rem.
 *
 * Usage:
 *   node scripts/migrate-spacing.mjs --dry-run   # preview changes
 *   node scripts/migrate-spacing.mjs             # apply changes
 */

import { readFileSync, writeFileSync, globSync } from 'node:fs'
import { resolve } from 'node:path'

// Prefixes ordered longest-first to prevent partial prefix matches
// (e.g. 'space-x' must come before 'space', 'min-w' before 'w')
const PREFIXES = [
  // Space utilities
  'space-x', 'space-y',
  // Inset directional
  'inset-x', 'inset-y',
  // Sizing with direction qualifiers
  'min-w', 'max-w', 'min-h', 'max-h',
  // Translate
  'translate-x', 'translate-y',
  '-translate-x', '-translate-y',
  // Directional margin/padding
  'mx', 'my', 'mt', 'mr', 'mb', 'ml',
  'px', 'py', 'pt', 'pr', 'pb', 'pl',
  // Negative directional margin
  '-mx', '-my', '-mt', '-mr', '-mb', '-ml',
  // Negative positional
  '-top', '-right', '-bottom', '-left', '-inset',
  // Base utilities
  'm', 'p', 'gap', 'inset',
  'top', 'right', 'bottom', 'left',
  'w', 'h', 'size',
]

// Ensure stable longest-first ordering
const sortedPrefixes = [...new Set(PREFIXES)].sort((a, b) => b.length - a.length)

// Escape hyphens for regex alternation
const prefixAlt = sortedPrefixes.map(p => p.replace(/-/g, '\\-')).join('|')

/**
 * Pattern explanation:
 *   (?<![\[\w])    — negative lookbehind: not preceded by [ or word char
 *                    (avoids matching inside arbitrary values like w-[gap-2])
 *   (PREFIX)       — one of the spacing prefixes
 *   -              — literal dash separator
 *   (\d+(?:\.\d+)?) — numeric value, optionally decimal (e.g. 0.5, 1.5, 2)
 *   (?![/\w\[])    — negative lookahead: not followed by / (fractions w-1/2),
 *                    word char (keywords like w-full, w-screen), or [ (arbitrary)
 */
const REGEX = new RegExp(
  `(?<![\\[\\w])(${prefixAlt})-(\\d+(?:\\.\\d+)?)(?![/\\w\\[])`,
  'g',
)

function convertNum(n) {
  const raw = parseFloat(n) * 4
  // Emit integer when possible, otherwise keep decimal precision
  return Number.isInteger(raw) ? String(raw) : String(raw)
}

function processFile(filePath, dryRun) {
  const original = readFileSync(filePath, 'utf8')
  const changes = []

  const updated = original.replace(REGEX, (match, prefix, num) => {
    if (num === '0') return match  // 0 × 4 = 0, skip to avoid churn
    const newNum = convertNum(num)
    if (newNum === num) return match  // shouldn't happen but guard anyway
    changes.push(`  ${prefix}-${num} → ${prefix}-${newNum}`)
    return `${prefix}-${newNum}`
  })

  if (updated === original) return false

  if (dryRun) {
    console.log(`[dry] ${filePath}`)
    changes.slice(0, 6).forEach(c => console.log(c))
    if (changes.length > 6) console.log(`  ... and ${changes.length - 6} more`)
  } else {
    writeFileSync(filePath, updated, 'utf8')
    console.log(`[changed] ${filePath} (${changes.length} substitutions)`)
  }

  return true
}

const dryRun = process.argv.includes('--dry-run')
const root = resolve(import.meta.dirname, '..')

const files = globSync('**/*.{tsx,ts,css}', {
  cwd: root,
  ignore: ['node_modules/**', '.next/**', 'scripts/**', 'dist/**'],
})

console.log(`Scanning ${files.length} files${dryRun ? ' (dry run)' : ''}...\n`)

let changed = 0
for (const f of files) {
  if (processFile(resolve(root, f), dryRun)) changed++
}

console.log(`\n${changed} files ${dryRun ? 'would be' : 'were'} modified.`)
