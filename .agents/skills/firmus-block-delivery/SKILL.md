---
name: firmus-block-delivery
description: Use when implementing, fixing, or reviewing a Firmus roadmap block with strict scope discipline, QA validation, and documentation alignment.
---

# Firmus Block Delivery

Use this skill whenever the task is to implement, patch, review, or validate a Firmus roadmap block.

## Source of truth
Always consult, in this order:
1. `docs/ROADMAP.md`
2. `docs/QA_CHECKPOINTS.md`
3. `docs/MASTER_EXECUTION_PLAYBOOK.md`

If these documents conflict:
- use `docs/ROADMAP.md` for current and next block
- use `docs/QA_CHECKPOINTS.md` for validation evidence
- use `docs/MASTER_EXECUTION_PLAYBOOK.md` for execution doctrine and architecture rules
- explicitly call out conflicts instead of guessing

## Primary goal
Deliver the smallest correct change for the current Firmus block without scope creep.

## Mandatory repository rules
- Respect the current roadmap block strictly.
- Do not refactor unrelated code.
- Keep routes thin.
- Put orchestration in `lib/services`.
- Do not place storage logic inside UI components.
- Preserve PT-BR UI wording unless explicitly instructed otherwise.
- Preserve existing `data-testid` selectors whenever possible.
- Prefer the smallest correct implementation.

## Out-of-scope defaults
Unless explicitly authorized, treat these as out of scope:
- broad refactors
- UI redesign waves
- architecture rewrites
- backend migrations
- auth rewrites
- database adoption
- external provider integrations outside the active block
- new product slices outside the current block
- hidden behavior changes to satisfy stale tests
- “while I was here” edits

## Required workflow
For any Firmus block task, follow this sequence:

1. Identify the current active block and the exact requested outcome.
2. Read the relevant sections of roadmap, QA checkpoints, and playbook.
3. State the exact in-scope target before changing code.
4. State what is explicitly out of scope.
5. Apply the smallest correct implementation.
6. Validate using:
   - `npm run lint`
   - tests relevant to the changed scope
7. Return a concise delivery report.

## Architecture defaults
- Routes must stay thin.
- Domain logic should stay out of UI components.
- Use `lib/services` when orchestration across slices is needed.
- Avoid hidden coupling between presentation and persistence.
- Preserve existing architectural patterns unless the block explicitly changes them.

## QA gate
A block task is not complete just because code exists.
Completion requires validation evidence.

Minimum required validation report:
- files changed
- what changed
- what was intentionally not changed
- how the work was validated

## Response format
When finishing a Firmus task, return:
1. current block confirmed
2. scope executed
3. files changed
4. validation run
5. risks or follow-up notes