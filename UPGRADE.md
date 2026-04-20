# Upgrade log

Tracks the versions of every tool in the `check` pipeline and notes on how to upgrade them. Update this file when you bump versions or swap tools.

## Current stack

Last reviewed: 2026-04-19

| Tool              | Version | Notes                                                                                  |
| ----------------- | ------- | -------------------------------------------------------------------------------------- |
| typescript        | ^5.7    | Stay on 5.x until TS 7 / Project Corsa ships stable. `tsc` remains the canonical type checker. |
| oxlint            | ^0.21   | Pair with `oxlint-tsgolint` at the same version.                                       |
| oxlint-tsgolint   | ^0.21   | Type-aware rules via typescript-go. 59/61 typescript-eslint rules covered.             |
| fallow            | ^2.14   | Dead code, cycles, duplication, complexity, boundaries. Provides `fallow-mcp`.         |
| vitest            | ^3.0    | With `@vitest/coverage-v8`.                                                            |
| @stryker-mutator  | ^8.6    | Mutation testing. Runs separately via `pnpm check:mutation`.                           |
| @ast-grep/cli     | ^0.30   | Structural rules in `rules/`.                                                          |
| markdownlint-cli2 | ^0.18   | Faster and more config-friendly than markdownlint-cli.                                 |
| cspell            | ^8.17   | Spelling for source and docs.                                                          |

## Upgrade policy

- **Minor/patch bumps:** do them weekly if the check passes.
- **Major bumps:** read the changelog, test in an isolated branch, update this table and any config that changed, land as a single commit titled `chore: upgrade <tool> to <version>`.
- **Tool swaps:** document the rationale in this file under "History". Update `scripts/check.mjs` and any related config. Ensure the command contract (`pnpm check`) stays unchanged.

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
