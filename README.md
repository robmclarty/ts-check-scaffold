# ts-check-scaffold

A TypeScript/Node pnpm workspace scaffold with an agent-friendly `check` pipeline wired up. Clone, rename, install, build.

## Layout

```text
├── packages/
│   └── core/                 add more as siblings
│       ├── package.json      name "@repo/core", private, exports ./src/index.ts
│       └── src/
│           ├── index.ts
│           └── example.{ts,test.ts}
├── rules/                    ast-grep structural rules
├── scripts/check.mjs         the check orchestrator
├── pnpm-workspace.yaml
├── tsconfig.json
├── fallow.toml  vitest.config.ts  stryker.config.mjs  cspell.json  sgconfig.yml
├── AGENTS.md  CLAUDE.md
└── package.json              all devDependencies live here
```

Runtime deps live in the package that imports them. DevDeps live at the root. Cross-package imports use workspace names (`@repo/other`), not relative paths.

## Quick start

```bash
pnpm install
pnpm check
```

## The check

`pnpm check` is the single source of truth for "is this done?". It runs:

| Check    | Tool                             | Catches                                             |
| -------- | -------------------------------- | --------------------------------------------------- |
| `types`  | `tsc`                            | Type errors                                         |
| `lint`   | `oxlint` + `oxlint-tsgolint`     | Syntax, floating promises, unsafe any, type-aware   |
| `struct` | `ast-grep`                       | Structural rules in `rules/`                        |
| `dead`   | `fallow`                         | Unused code, circular deps, duplication, boundaries |
| `test`   | `vitest` + `@vitest/coverage-v8` | Test failures and coverage floors                   |
| `docs`   | `markdownlint-cli2`              | Broken markdown                                     |
| `spell`  | `cspell`                         | Misspellings                                        |

On-demand:

- `pnpm check:mutation` — Stryker mutation testing
- `pnpm check:security` — `pnpm audit`
- `pnpm check:fix` — auto-fix oxlint and fallow where possible

Output lands in `.check/`: `summary.json` (aggregate), `<name>.json` (per tool), `coverage/` (vitest).

Flags: `--json`, `--bail`, `--only <list>`, `--skip <list>`.

## Extending

**Add a package.** Create the two files, then `pnpm install && pnpm check`:

```jsonc
// packages/<name>/package.json
{
  "name": "@repo/<name>",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
```

```ts
// packages/<name>/src/index.ts
export {};
```

Root configs already glob `packages/*/src/**`.

**Add a check.** Append to `CHECKS` in `scripts/check.mjs`.

**Add a structural rule.** Drop a YAML file in `rules/`. ast-grep picks it up.

**Add a boundary.** Edit `fallow.toml`.

## Cutting a release

Every package version moves in lockstep with the root `package.json`. The `/version` Claude Code skill (see `.claude/skills/version/`) drives the release:

```text
/version patch            # 0.1.0 → 0.1.1, updates CHANGELOG.md, commits vX.Y.Z, tags
/version minor            # 0.1.0 → 0.2.0
/version major            # 0.1.0 → 1.0.0
/version patch --repair-skew   # force-align workspace to the root's current version (no bump)
```

The backend (`scripts/bump-version.mjs` + `scripts/lib/lockstep.mjs`) auto-discovers the lockstep set: root `package.json`, every `packages/*/package.json`, and every `packages/*/src/version.ts` that declares `export const version = '<SEMVER>';`. Packages opt into the `version.ts` half by creating the file — no edits to the scripts required as you add packages.

## Working across packages

```bash
pnpm --filter @repo/core test                   # one package's tests
pnpm --filter @repo/core add zod                # runtime dep to one package
pnpm add -w -D typescript@latest                # root devDep
pnpm --filter @repo/app add @repo/core --workspace
```

## Fallow MCP

`.mcp.json` exposes fallow to Claude Code, Cursor, and Windsurf as a structured tool. Confirm with `claude mcp list`.
