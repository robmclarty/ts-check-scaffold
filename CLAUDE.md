# CLAUDE.md

Claude Code-specific instructions for this repository.

## Start here

Read [AGENTS.md](./AGENTS.md) for the universal contract: `pnpm check` is the source of truth, all conventions live there, all structured output contracts are defined there.

This file only adds what is Claude-specific.

## Workflow

1. **Plan in text first.** For any task larger than a typo fix, explain the plan before editing. Reference files with full paths.
2. **Implement.** Prefer small, focused diffs. Keep unrelated changes out.
3. **Verify with `pnpm check`.** This is non-negotiable. Do not claim done until it exits 0.
4. **Summarize what changed.** One short paragraph, no bullet firehose.

## Tool use

- **fallow MCP server** is wired up in `.mcp.json`. Prefer calling fallow tools (`analyze`, `check_changed`) during implementation over waiting for the final `pnpm check`.
- **Don't shell out to run `pnpm check` repeatedly during tight loops.** Use `pnpm check --bail --only <relevant checks>` or `pnpm exec tsc --noEmit` for faster iteration. Run the full `pnpm check` once at the end.

## What Claude should avoid

- Do not add comments that narrate what the code does ("// loop through users"). Comments explain *why*, not *what*.
- Do not add defensive code for conditions TypeScript's strict mode already rules out.
- Do not apologize in prose for lint or type failures. Fix them.
- Do not use em dashes in code comments or docs.
