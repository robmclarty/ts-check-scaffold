# CLAUDE.md

Claude Code-specific instructions for this repository.

Read [AGENTS.md](./AGENTS.md) for the universal contract. This file only adds what is Claude-specific.

## Workflow

1. Plan in text first for any task larger than a typo. Reference files with full paths.
2. Implement with small, focused diffs.
3. Verify with `pnpm check`. Do not claim done until it exits 0.

## Tool use

- **fallow MCP** is wired in `.mcp.json`. Call fallow tools (`analyze`, `check_changed`) during implementation rather than re-running `pnpm check` in a tight loop.
- For faster iteration, use `pnpm check --bail --only <checks>` or `pnpm exec tsc --noEmit`. Run the full `pnpm check` once at the end.
