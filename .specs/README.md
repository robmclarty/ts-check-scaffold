# Specs

Behavioral specifications for this codebase. Specs are the canonical source of truth for intent; code is a derived artifact.

## When to write a spec

Write one when:

- A feature has non-trivial behavior that could be implemented multiple ways.
- Multiple agents or humans will touch the feature and need aligned understanding.
- The feature has edge cases that are easy to miss.
- You want to write tests from the spec rather than from the code.

Do not write one for trivial changes, pure refactors, or dependency bumps.

## Structure

One spec per feature or subsystem. File name: `<kebab-case-name>.md`. Suggested sections:

```markdown
# <Feature name>

## Intent

One paragraph. What is this for? What problem does it solve? What is explicitly *not* in scope?

## Behavior

Concrete, testable statements. Prefer "must" / "must not" / "may" phrasing.

- The system must ...
- The system must reject ...
- The system may optionally ...

## Inputs and outputs

Describe the shape of data flowing in and out. Reference Zod schemas or TypeScript types if they exist.

## Invariants

Properties that always hold, regardless of input. These make excellent property-based tests.

## Error modes

What can go wrong and how the system responds. Distinguish recoverable from fatal.

## Non-goals

What this spec does *not* cover. Prevents scope creep and clarifies boundaries.

## Open questions

Things still to decide. Resolve before implementation.
```

## Relationship to tests

Every "must" in the Behavior section should map to at least one test. Invariants map to property-based tests (`fast-check`). When tests diverge from the spec, update one or the other deliberately; do not let them drift.

## Relationship to code

Code must implement the spec. If implementation forces a change in intent, update the spec first, then the code. Specs are not documentation of what the code does; they are the contract the code must satisfy.
