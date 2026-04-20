# Upgrade log

Tracks the versions of every tool in the `check` pipeline and notes on how to upgrade them. Update this file when you bump versions or swap tools.

## Current stack

Last reviewed: 2026-04-19

| Tool              | Version | Notes                                                                                  |
| ----------------- | ------- | -------------------------------------------------------------------------------------- |
| typescript        | 6.0.3   | `tsc` remains the canonical type checker. TS 7 / Project Corsa (Go-based) not yet stable. |
| oxlint            | 1.60.0  | Pair with `oxlint-tsgolint` at a compatible version.                                   |
| oxlint-tsgolint   | 0.21.1  | Type-aware rules via typescript-go. 59/61 typescript-eslint rules covered.             |
| fallow            | 2.40.3  | Dead code, cycles, duplication, complexity, boundaries. Provides `fallow-mcp`.         |
| vitest            | 4.1.4   | With `@vitest/coverage-v8` at the same version.                                        |
| @stryker-mutator  | 9.6.1   | Mutation testing. Runs separately via `pnpm check:mutation`.                           |
| @ast-grep/cli     | 0.42.1  | Structural rules in `rules/`.                                                          |
| markdownlint-cli2 | 0.22.0  | Faster and more config-friendly than markdownlint-cli.                                 |
| cspell            | 10.0.0  | Spelling for source and docs.                                                          |

## Upgrade policy

- **Minor/patch bumps:** do them weekly if the check passes.
- **Major bumps:** read the changelog, test in an isolated branch, update this table and any config that changed, land as a single commit titled `chore: upgrade <tool> to <version>`.
- **Tool swaps:** document the rationale in this file under "History". Update `scripts/check.mjs` and any related config. Ensure the command contract (`pnpm check`) stays unchanged.
- **Monorepo scope:** every tool in the table is a root devDependency and runs across `packages/*/src/**`. Bump it once at the root; `pnpm install` propagates it. Do not pin tooling inside a package — a devDependency inside `packages/*/package.json` is a smell.

## Watching for changes

Tools that are moving fast and worth watching for meaningful upgrades:

- **TypeScript 7 / Project Corsa** — Go-based compiler. When stable, may replace `tsc` in the pipeline entirely (oxlint-tsgolint already uses it under the hood via `--type-check`).
- **oxfmt** — Rust formatter from the oxlint family. Currently optional; add as a `format` check when mature if you want determinism in agent diffs.
- **fallow** — Moving fast on MCP responses and agent skills. Watch the ROADMAP.md for unused-class-member removal, letter-grade reporting, and richer MCP context.
- **Biome 2** — Competing Rust-based linter/formatter with its own type synthesizer. If its type-aware rules close the gap with tsgolint, it becomes a plausible alternative to `oxlint + tsgolint + oxfmt`.
- **agnix** — AI config linter. Worth adding as a check once CLAUDE.md / SKILL.md conventions stabilise in a repo.

## How to check for upgrades

```bash
pnpm outdated
```

Or for a specific tool:

```bash
pnpm view oxlint version
pnpm view fallow version
```

## History

Append entries here when you bump majors or change tools. Format: `YYYY-MM-DD — what changed — why`.

- 2026-04-19 — initial scaffold — baseline stack established.
- 2026-04-19 — check pipeline upgraded to latest versions (typescript 5→6, oxlint 0.21→1.60, vitest 3→4, stryker 8→9, cspell 8→10, fallow 2.14→2.40, ast-grep 0.30→0.42, markdownlint-cli2 0.18→0.22). Table above updated to match.
- 2026-04-19 — converted to pnpm workspaces monorepo. Source moved from `src/` to `packages/core/src/`. All tool configs re-globbed to `packages/*/src/**`; no per-package configs. `tsconfig.json` lost `rootDir`/`outDir`/`baseUrl` (the last is deprecated in TS 6) and gained `noEmit: true`.
