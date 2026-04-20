# ts-check-scaffold

A minimal TypeScript/Node scaffold with a modern, agent-friendly `check` pipeline already wired up. Clone, rename, install, go.

## What you get

One command, `pnpm check`, that is the single source of truth for "is this done?". It runs:

| Check    | Tool                           | Catches                                                      |
| -------- | ------------------------------ | ------------------------------------------------------------ |
| `types`  | `tsc`                          | Type errors (ground truth)                                   |
| `lint`   | `oxlint` + `oxlint-tsgolint`   | Syntax rules, floating promises, unsafe any, and 50+ type-aware rules |
| `struct` | `ast-grep`                     | Project-specific structural rules (see `rules/`)             |
| `dead`   | `fallow`                       | Unused exports/files/deps, circular deps, duplication, complexity hotspots, architecture boundary violations |
| `test`   | `vitest` + `@vitest/coverage-v8` | Unit test failures and coverage below thresholds           |
| `docs`   | `markdownlint-cli2`            | Broken markdown                                              |
| `spell`  | `cspell`                       | Misspellings in source and docs                              |

Run deeper passes on demand:

- `pnpm check:mutation` runs Stryker mutation testing (slower; validates that tests actually test something)
- `pnpm check:security` runs `pnpm audit`
- `pnpm check:fix` auto-fixes oxlint and fallow issues where possible

## Quick start

```bash
pnpm install
pnpm check
```

Output lands in `.check/`:

- `.check/summary.json` — aggregate result for agents
- `.check/lint.json`, `.check/dead.json`, `.check/struct.json`, `.check/test.json` — raw per-tool JSON
- `.check/coverage/` — vitest coverage report

## How agents should use this

The contract is simple: **if `pnpm check` exits 0, the work is done. If it exits non-zero, read `.check/summary.json` to see which checks failed, then read the corresponding tool JSON for diagnostics.**

```jsonc
// .check/summary.json
{
  "timestamp": "2026-04-19T...",
  "ok": false,
  "total_duration_ms": 4821,
  "checks": [
    { "name": "types", "ok": true,  "exit_code": 0, "duration_ms": 1200, "output_file": null },
    { "name": "lint",  "ok": false, "exit_code": 1, "duration_ms": 340,  "output_file": "lint.json" },
    // ...
  ]
}
```

Flags for agent use:

- `pnpm check --json` — machine-readable to stdout, no human decoration
- `pnpm check --bail` — stop at the first failure (tighter feedback loop)
- `pnpm check --only types,lint` — run a subset during iteration
- `pnpm check --skip spell,docs` — skip slow or currently-noisy checks

## Fallow MCP server

`.mcp.json` configures `fallow-mcp` so Claude Code / Cursor / Windsurf can call fallow as a structured tool (`analyze`, `check_changed`, `find_dupes`, `check_health`, `fix_preview`, `fix_apply`, `project_info`). Agents get structured diagnostics with `auto_fixable` flags and can self-correct without parsing terminal output.

To enable in Claude Code, the `.mcp.json` in the repo root is picked up automatically. Confirm with `claude mcp list`.

## Extending the scaffold

**Add a check.** Edit `scripts/check.mjs` and append to `CHECKS`:

```js
{
  name: 'agent',
  description: 'agnix: AI config linting (CLAUDE.md, SKILL.md, hooks)',
  command: 'pnpm',
  args: ['exec', 'agnix', '--format', 'json', '.'],
  output_file: 'agent.json',
},
```

**Add a structural rule.** Drop a YAML file into `rules/`. See `rules/no-class.yml` and `rules/no-default-export.yml` for examples. ast-grep picks it up automatically.

**Add an architecture boundary.** Edit `fallow.toml`:

```toml
[[boundaries]]
from = "src/domain/**"
cannot_import = ["src/infra/**", "src/api/**"]
```

**Tighten a rule.** Each tool's config lives at the repo root (`.oxlintrc.json`, `fallow.toml`, `stryker.config.mjs`, `sgconfig.yml`, etc). No wrapper configs, no magic.

## Philosophy

Four principles drive every choice here:

1. **The check is the contract.** A single command the agent can trust. No hidden CI gates, no "oh also run this."
2. **Structured output over stderr chatter.** Every JSON-capable tool is configured to emit JSON. Agents parse structured data, not colorized text.
3. **The orchestrator is dumb.** It shells out, captures exit codes, and writes files. It does not parse diagnostics. If a tool evolves its output, the orchestrator does not care.
4. **Tools, not frameworks.** Each tool is independently swappable. If something better than oxlint ships next year, you change one line in `CHECKS`.

## Related docs

- [UPGRADE.md](./UPGRADE.md) — version tracking and tool migration notes
- [AGENTS.md](./AGENTS.md) — instructions for any coding agent working in this repo
- [CLAUDE.md](./CLAUDE.md) — Claude-specific instructions
- [.specs/README.md](./.specs/README.md) — spec-driven development conventions
