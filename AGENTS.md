# AGENTS.md

Instructions for Cursor Agent and Composer. **`CLAUDE.md` is authoritative** — read it for the full stack, architecture, token rules, and styling guide. This file contains only Cursor/CI-specific additions.

## Commands

Use `pnpm`. Run `pnpm type-check` before claiming done. Run `pnpm test` after engine changes.

**Before `type-check` or `build` in CI/agent environments**, clear the Next.js cache first:

```bash
rm -rf .next && pnpm type-check
rm -rf .next && pnpm build
```

Production builds must be network-independent. Vendor required runtime assets (fonts) instead of relying on build-time fetches.

## Change Discipline

Keep diffs focused and preserve existing patterns. Do not reformat or refactor unrelated files.
