<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Firmus repository expectations

### Source of truth
- docs/ROADMAP.md
- docs/QA_CHECKPOINTS.md
- docs/MASTER_EXECUTION_PLAYBOOK.md

### Permanent rules
- Respect the current roadmap block strictly.
- Do not refactor unrelated code.
- Keep routes thin.
- Put orchestration in `lib/services`.
- Do not place storage logic inside UI components.
- Preserve PT-BR UI wording unless the task explicitly requires otherwise.
- Preserve existing `data-testid` selectors whenever possible.
- Prefer the smallest correct implementation.

### Validation before concluding any task
- Run `npm run lint`
- Run the tests relevant to the changed scope
- Report:
  - files changed
  - what was changed
  - what was intentionally not changed
  - how the work was validated

  
 ### Scope discipline defaults
- If scope is unclear, treat as out of scope:
  - broad refactors
  - design rewrites
  - new infrastructure
  - backend migration
  - authentication
  - database adoption
  - external integrations
  - new product slices outside the current roadmap block
- Never expand beyond the current block unless the prompt explicitly authorizes it.

### Document precedence
- For current execution state and active block, prefer:
  1. docs/ROADMAP.md
  2. docs/QA_CHECKPOINTS.md
  3. docs/MASTER_EXECUTION_PLAYBOOK.md
- If documents conflict, call out the conflict explicitly instead of guessing. 