# AGENTS.md

Instructions for any coding agent (Claude Code, Codex, Cursor, Windsurf, Amp) operating in this repository.

## The contract

**`pnpm check` is the single source of truth for "done".** If it exits 0, your work is complete. If it exits non-zero, it is not. No other signal counts.

Before declaring a task finished:

1. Run `pnpm check`.
2. If it fails, read `.check/summary.json` to find which check failed.
3. Read the corresponding per-tool JSON (`.check/lint.json`, `.check/dead.json`, etc) for structured diagnostics.
4. Fix the root cause, not the symptom.
5. Re-run `pnpm check`.

## Tight feedback loops

During iteration, use narrower commands for faster turnaround:

```bash
pnpm check --bail              # stop at first failure
pnpm check --only types,lint   # just the fast checks
pnpm test:watch                # watch-mode tests while implementing
pnpm exec tsc --noEmit         # just types
```

`pnpm check` in full (all checks, no bail) is for the final verification before declaring done.

## Conventions

- **TypeScript strict mode.** Everything. No `any`, no `!` non-null assertions without justification.
- **Functional/procedural.** No classes. Use modules, closures, and plain data. This is enforced by `rules/no-class.yml`.
- **Named exports.** No default exports. Enforced by `rules/no-default-export.yml`.
- **Naming:** `snake_case` for variables and functions, `PascalCase` for types and interfaces, `SCREAMING_SNAKE_CASE` for constants.
- **File extensions:** import with `.js` even from `.ts` files (NodeNext resolution).
- **Tests colocated:** `foo.ts` and `foo.test.ts` live in the same directory.
- **Coverage floor:** 70% lines/functions/branches/statements. Raise it as the codebase matures.

## Monorepo layout

This is a pnpm workspace. Source lives under `packages/<name>/src/`, never at the repo root.

- **Cross-package imports go through workspace names**, not relative paths. Use `import { x } from '@repo/other'`, never `import { x } from '../../other/src/x.js'`. The boundary rule in `fallow.toml` is ready to enforce this once uncommented.
- **Runtime dependencies live in the package that imports them.** Declare them in `packages/<name>/package.json`. Inter-package deps use `"workspace:*"`.
- **Tooling dependencies live at the root.** Everything in `scripts/check.mjs` (oxlint, ast-grep, cspell, vitest, fallow, stryker, markdownlint, tsc) is a root devDependency. A devDependency inside a package is a smell.
- **Adding a package:** create `packages/<name>/package.json` (name `@repo/<name>`, `type: module`, `private: true`, `exports`) and `packages/<name>/src/index.ts`. No other files required. `pnpm check` must still exit 0 after adding it.
- **No per-package configs yet.** Root `tsconfig.json`, `vitest.config.ts`, `fallow.toml`, `cspell.json`, `stryker.config.mjs`, and `rules/` glob across `packages/*/src/**`. Add a per-package override only when one package genuinely needs different behavior.

## Specs

When a task is non-trivial, look in `.specs/` for an existing spec or be prepared to write one. See `.specs/README.md`. Specs are the canonical source of truth for intent; code is a derived artifact.

## What NOT to do

- Do not disable lint rules to pass the check. If a rule is wrong for a case, discuss first or use a scoped inline suppression with a comment explaining why.
- Do not add dependencies casually. Every new dep is surface area. Fallow will catch unused ones.
- Do not add a file that is not imported by something. Fallow will flag it.
- Do not skip writing tests for new behavior. Stryker (`pnpm check:mutation`) will eventually catch tests that pass trivially.
- Do not bypass `pnpm check` by running individual tools and claiming done.

## MCP tools available

- `fallow` — structured codebase analysis. Call `analyze`, `check_changed`, `find_dupes`, `check_health`, `fix_preview`, `fix_apply`, or `project_info`.

Use fallow via MCP during implementation for real-time dead-code and boundary feedback, rather than waiting for the final `pnpm check`.
