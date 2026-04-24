# AGENTS.md

Instructions for any coding agent (Claude Code, Codex, Cursor, Windsurf, Amp) operating in this repository.

## The contract

**`pnpm check` is the single source of truth for "done".** If it exits 0, the work is complete. If it exits non-zero, it is not.

Before declaring a task finished:

1. Run `pnpm check`.
2. If it fails, read `.check/summary.json` to find which check failed.
3. Read the corresponding per-tool JSON (`.check/lint.json`, `.check/dead.json`, etc.) for structured diagnostics.
4. Fix the root cause, not the symptom.
5. Re-run `pnpm check`.

## Tight feedback loops

During iteration, use narrower commands for faster turnaround:

```bash
pnpm check --bail              # stop at first failure
pnpm check --only types,lint   # just the fast checks
pnpm test:watch                # watch-mode tests
pnpm exec tsc --noEmit         # just types
```

Full `pnpm check` is for the final verification.

## Conventions

- **TypeScript strict.** No `any`, no `!` non-null assertions without justification.
- **No classes.** Enforced by `rules/no-class.yml`.
- **Named exports only.** Enforced by `rules/no-default-export.yml`.
- **File extensions:** import with `.js` from `.ts` files (NodeNext resolution).
- **Tests colocated:** `foo.ts` and `foo.test.ts` in the same directory.

## Monorepo layout

pnpm workspace. Source lives under `packages/<name>/src/`, never at the repo root.

- **Cross-package imports use workspace names**, not relative paths. `import { x } from '@repo/other'`, never `'../../other/src/x.js'`.
- **Runtime deps live in the package that imports them.** Inter-package deps use `"workspace:*"`.
- **Tooling deps live at the root.** A devDependency inside a package is a smell.
- **Adding a package:** create `packages/<name>/package.json` and `packages/<name>/src/index.ts`. Nothing else. `pnpm check` must still exit 0.
- **No per-package tool configs.** Root configs glob `packages/*/src/**`. Add an override only when a package genuinely needs different behavior.

## What NOT to do

- Do not disable lint rules to pass the check. Use a scoped inline suppression with a reason, or discuss first.
- Do not add dependencies casually. Fallow will flag unused ones.
- Do not add a file that is not imported by something.
- Do not skip tests for new behavior.
- Do not bypass `pnpm check` by running individual tools and claiming done.

## MCP tools

- `fallow` — structured codebase analysis (`analyze`, `check_changed`, `find_dupes`, `check_health`, `fix_preview`, `fix_apply`, `project_info`). Prefer this over waiting for the final `pnpm check` during implementation.
