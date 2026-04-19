# Firmus — Master Execution Playbook

Version: 2.0
Status: Active source-of-truth companion
Format: Markdown
Purpose: Persistent technical memory, architectural guardrail, and execution doctrine for the Firmus project

Normalized current state:
- Desktop navigation with left sidebar is implemented and approved
- Mobile navigation with drawer/top bar is implemented and approved
- Block 25 — Activity Logs is completed and approved
- Current active implementation target is Block 26 — Observability and Stability
- The next official block after approval of Block 26 is Block 27 — Improved Text Parsing

---

## 1. Why this document exists

This file is the permanent execution memory of Firmus.

Its purpose is to keep the project coherent while it is being built block by block with AI-assisted execution, strict scope control, explicit QA gates, and progressive architecture.

The main risk in AI-assisted product development is not only bad code. It is:
- loss of continuity
- stale assumptions
- silent scope drift
- accidental refactors
- wrong architectural jumps
- confusing roadmap state
- tests lagging behind the product spine

This document exists to prevent that.

Firmus should always be able to answer, from this file alone:
- what the product really is
- what has already been validated
- what the next correct block is
- what architecture style must be preserved
- what is explicitly out of scope
- how prompts must be structured
- how QA must be applied
- what still must happen before go-live

This file is not a replacement for ROADMAP.md or QA_CHECKPOINTS.md.

It is the master execution logic of the project.

---

## 2. What Firmus is

Firmus is a lightweight operational and administrative copilot for service professionals and small businesses.

It is not being built as a bloated ERP.

Its product philosophy is:
1. first, create a durable operational spine
2. then, reduce cognitive load with assisted workflows
3. then, expose public trust and growth surfaces
4. then, add safe intelligence and automation
5. then, prepare the system for packaging, monetization, and go-live hardening

The correct product direction is:
- operational clarity before complexity
- stable data before smart features
- event awareness before automation
- public polish after internal usefulness
- controlled extensibility before integrations
- safety and compliance before real launch

Firmus should feel increasingly helpful, but never magical in a way that makes the user lose trust.

---

## 3. Document precedence

Use these files together, but with clear roles:

- `docs/ROADMAP.md`
  - official block order
  - official phase order
  - official progression state
  - what block comes next

- `docs/QA_CHECKPOINTS.md`
  - QA evidence
  - validation history
  - approval notes
  - manual and automated checks already performed

- `docs/MASTER_EXECUTION_PLAYBOOK.md`
  - master execution rules
  - architectural doctrine
  - anti-drift guardrails
  - prompt standards
  - normalized technical expectations
  - go-live discipline

If documents conflict:
1. ROADMAP governs official current block and next block
2. QA_CHECKPOINTS governs what was validated
3. this playbook governs how execution should behave
4. conflicts must be called out explicitly, never guessed around

---

## 4. Current normalized project state

### 4.1 What is already completed

The project should currently be treated as having completed and approved the following sequence:

- Block 1A — Initial Technical Foundation
- Block 1B — Foundation Normalization and Shell Stabilization
- Block 2 — Core Domain Foundation
- Block 3 — Business Profile
- Block 4 — Clients
- Block 5 — Services
- Block 6 — Quote Engine
- Block 6T — Cypress Baseline for Core Flows
- Block 7 — Timeline Events
- Block 8 — Charges
- Block 9 — Financial Overview
- Block 10 — Client Detail and Consolidated Timeline
- Block 11 — Reminders
- Block 12 — Templates
- Block 13 — Weekly Summary
- Block 14 — Text-Based Assisted Input
- Block 15 — Assisted Charge Suggestions
- Block 16 — Public Quote Page
- Block 17 — Premium Quote PDF
- Block 18 — Quote Approval Actions
- Block 19 — Basic Bio Link
- Block 20 — Public Touchpoint Polish
- Block 21 — Automation Rules Foundation
- Block 22 — Automatic Reminder Creation
- Block 23 — Simple Reactivation Radar
- Block 24 — Security & LGPD Foundation
- Block 25 — Activity Logs

### 4.2 Current active block

Current active implementation target:

- Block 26 — Observability and Stability

### 4.3 Next official block

The next official block after Block 26 approval is:

- Block 27 — Improved Text Parsing

### 4.4 Recently stabilized architectural reality

The project currently has these important technical realities:

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui baseline
- route-driven `app/` structure
- `components/` for page and UI slices
- `lib/domain/` for domain entities and primitives
- `lib/services/` for orchestration logic
- localStorage-based persistence where still appropriate in the current phase
- event-aware product behavior already established
- public-facing quote and related public surfaces already introduced
- desktop sidebar navigation implemented and approved
- mobile drawer/topbar navigation implemented and approved
- server-side protected activity logs implemented and approved
- Cypress already used as critical regression layer
- manual QA and block approval discipline already part of the workflow

### 4.5 What must not be assumed blindly

The following must not be assumed as “fully solved” unless the current block explicitly hardens them:

- final production backend architecture
- production-grade observability maturity
- finalized provider integrations
- complete go-live privacy package
- complete incident response readiness
- complete backup/restore proof
- full monetization gating
- real launch readiness

---

## 5. Master development philosophy

### 5.1 Build in layers, not bursts

Every phase must add durable capability in the correct order.

### 5.2 Stable boring foundations beat clever fragile leaps

If a proposed change is technically flashy but structurally unnecessary, it is suspect by default.

### 5.3 Scope discipline is part of product quality

Unnecessary expansion damages the product even when the code works.

### 5.4 Every block must produce real value

A block is not just preparation. It must either:
- create capability
- reduce ambiguity
- strengthen continuity
- increase trust
- reduce future implementation risk

### 5.5 AI is an executor, not the product owner

AI helps implement the next validated step.
AI does not decide what the product becomes.

### 5.6 Preserve replaceability

Current persistence choices are acceptable only if they preserve future migration.
No component should become inseparable from the current persistence mechanism.

### 5.7 QA is a gate, not a ceremony

A block is only done when validation exists.

### 5.8 Continuity beats novelty

The system must feel increasingly coherent, not increasingly scattered.

---

## 6. Canonical technical architecture

### 6.1 Structural pattern

Default structure should remain:

- `app/` for route entry points
- `components/` for presentational and interaction slices
- `lib/domain/` for domain definitions and core types
- `lib/*-storage.ts` or dedicated helpers for persistence mechanics
- `lib/services/` for orchestration and cross-slice composition
- `cypress/e2e/` for regression coverage
- `docs/` for source-of-truth project documents

### 6.2 Route philosophy

Routes must remain thin.

Routes should:
- load the required data
- call services when orchestration is needed
- render the relevant page/component tree

Routes should not:
- accumulate business logic
- parse persistence directly when avoidable
- become mini-services
- hide complex mutations

### 6.3 Component philosophy

Components handle UI and local interaction.

Components should not:
- own canonical domain rules
- implement persistence parsing
- silently encode business decisions that belong to services or domain helpers

### 6.4 Service philosophy

`lib/services/` owns orchestration.

Use services when:
- multiple slices interact
- rendering needs a presenter/snapshot
- mutations touch more than one entity
- business flows need one clear coordination layer

### 6.5 Domain-first modeling

Before implementing a new slice:
- define the domain
- define required states
- define derived states
- define invariants
- define relationship boundaries

Domain files should remain:
- explicit
- minimal
- stable
- UI-agnostic
- free of speculative fields

---

## 7. Money, dates, statuses, and records

### 7.1 Money rules

All money must be canonical integer cents.

Never:
- store float money
- use formatted strings as canonical value
- compare money through display output

Always:
- parse to cents
- store cents
- compute with cents
- format only at the UI boundary

### 7.2 Date rules

Persist dates as serialization-friendly values.
Prefer ISO strings where persistence is involved.

### 7.3 Derived-state rule

If a state can be safely derived, prefer deriving it over persisting it.

### 7.4 Record ordering rule

When ordering matters operationally, records should preserve:
- `createdAt`
- `updatedAt`

### 7.5 Minimal-state rule

Statuses must remain intentionally limited.
Do not explode state complexity early.

---

## 8. Event and log architecture rules

### 8.1 Events

Events are immutable records of real completed actions.

Events are:
- append-only
- factual
- emitted after success
- part of product continuity

Events are not:
- UI toasts
- temporary notices
- editable workflow state

### 8.2 Event rules

Emit events:
- only after successful operations
- only when the action actually occurred
- never on failed validation
- never on no-op updates
- never on passive rendering

### 8.3 Activity Logs

Activity Logs are now part of the protected server-side operational spine.

They must remain:
- protected
- queryable
- filterable
- chronologically useful
- operationally readable

Logs should improve traceability, not become noise.

### 8.4 Observability distinction

Do not confuse:
- timeline events
- activity logs
- observability signals

These are related but different:

- timeline events = product continuity for user/business flows
- activity logs = protected operational audit trail
- observability = health, stability, failure visibility, recovery signals

---

## 9. QA doctrine

### 9.1 QA forms in Firmus

Firmus uses four complementary layers of validation:

1. Structural validation
   - architecture
   - file layout
   - scope discipline
   - continuity with roadmap

2. Manual functional validation
   - UX
   - responsiveness
   - smoke visual checks
   - realistic usage checks

3. Automated regression validation
   - Cypress E2E for critical user-visible flows

4. Targeted technical validation
   - unit tests for pure logic/helpers
   - integration tests for routes, services, and server boundaries

### 9.2 QA gate rule

A block is not complete because code exists.
A block is complete only when validation exists.

### 9.3 Four approval questions

Every block must answer:

- Was the intended structure added correctly?
- Does the feature behave correctly?
- Was scope respected?
- Is the system safer to continue now than before this block?

### 9.4 Cypress usage rule

Use Cypress where regression would be costly.
Do not overuse Cypress for everything.
Balance with integration and unit tests.

### 9.5 Manual QA usage rule

Manual QA is still valid when:
- the block is evolving
- the UI is not yet stable enough
- the main risk is usability or visual coherence
- the block’s value is still partly structural

---

## 10. Test strategy from Block 24 onward

This section should be used as a reminder before starting and before approving each new block.

### Block 24 — Security & LGPD Foundation
Expected validation:
- Cypress for login/logout and public/private route behavior
- unit tests for session/env/crypto/guards
- integration tests for auth routes and privacy/security endpoints
- manual QA for auth UX and logout flow

### Block 25 — Activity Logs
Expected validation:
- Cypress for visible logs flow
- unit tests for formatters and filters
- integration tests for append/read permissions and log APIs
- manual QA for readability and traceability

### Block 26 — Observability and Stability
Expected validation:
- integration tests for health checks
- integration tests for backup/restore flow
- integration tests for controlled failure scenarios
- unit tests for monitoring/stability helpers
- Cypress only as critical smoke
- manual QA for restore confidence and runbook clarity

### Block 27 — Improved Text Parsing
Expected validation:
- strong unit coverage for parser and edge cases
- integration tests for parsing-to-entity flows
- Cypress only for key user-facing assisted flows
- manual QA with realistic PT-BR input phrases

### Block 28 — Outbound Channel Abstraction
Expected validation:
- unit tests for adapters and contracts
- integration tests for dispatchers and fallbacks
- Cypress only where user-visible flow exists
- manual QA for message/state coherence

### Block 29 — NFSe Foundation
Expected validation:
- unit tests for tax mappings and fiscal validations
- integration tests for payload generation, persistence, and status handling
- Cypress for main admin flow
- manual QA for fiscal field clarity and operational errors

### Block 30 — NFSe Issuance Integration
Expected validation:
- strong integration tests with provider/gateway or controlled mocks
- Cypress for main issuance happy path and major failure path
- manual QA for operational status visibility

### Block 31 — DAS Companion and Official Channel Handoff
Expected validation:
- unit tests for displayed rules, deadlines, and helper calculations
- integration tests for handoff, links, and status transitions
- Cypress for main guidance flow
- manual QA to prevent confusion with official channels

### Block 32 — Feature Flags and Plan Limits
Expected validation:
- unit tests for gating and eligibility
- integration tests for server-side enforcement
- Cypress for visible differences between plans
- manual QA for paywall/upgrade UX clarity

### Block 33 — Improved Onboarding
Expected validation:
- Cypress for onboarding journey
- unit tests for helpers and checklist logic
- integration tests for persistence and progress state
- manual QA for clarity and completion speed

### Block 34 — MVP Hardening
Expected validation:
- full final smoke E2E on critical flows
- integration tests for security, restore, and operational resilience
- final manual go-live checklist
- final regression pass before launch decision

---

## 11. Current normalized roadmap

### Phase 1 — Core Transactional Foundation
- Block 1A — Initial Technical Foundation
- Block 1B — Foundation Normalization and Shell Stabilization
- Block 2 — Core Domain Foundation
- Block 3 — Business Profile
- Block 4 — Clients
- Block 5 — Services
- Block 6 — Quote Engine
- Block 6T — Cypress Baseline for Core Flows
- Block 7 — Timeline Events
- Block 8 — Charges
- Block 9 — Financial Overview
- Block 10 — Client Detail and Consolidated Timeline

### Phase 2 — Assisted Operations
- Block 11 — Reminders
- Block 12 — Templates
- Block 13 — Weekly Summary
- Block 14 — Text-Based Assisted Input
- Block 15 — Assisted Charge Suggestions

### Phase 3 — Public Growth Layer
- Block 16 — Public Quote Page
- Block 17 — Premium Quote PDF
- Block 18 — Quote Approval Actions
- Block 19 — Basic Bio Link
- Block 20 — Public Touchpoint Polish

### Phase 4 — Intelligence and Automation
- Block 21 — Automation Rules Foundation
- Block 22 — Automatic Reminder Creation
- Block 23 — Simple Reactivation Radar
- Block 24 — Security & LGPD Foundation
- Block 25 — Activity Logs
- Block 26 — Observability and Stability

### Phase 5 — Expansion, Fiscal Layer, and Monetization Readiness
- Block 27 — Improved Text Parsing
- Block 28 — Outbound Channel Abstraction
- Block 29 — NFSe Foundation
- Block 30 — NFSe Issuance Integration
- Block 31 — DAS Companion and Official Channel Handoff
- Block 32 — Feature Flags and Plan Limits
- Block 33 — Improved Onboarding
- Block 34 — MVP Hardening

---

## 12. Active block doctrine — Block 26

Block 26 exists to reduce operational blindness and improve recovery confidence.

### 12.1 Core responsibilities
- expose system health signals
- improve visibility into failures
- establish practical stability helpers
- support backup and restore confidence
- reduce uncertainty during debugging and incident-like situations
- create a minimal runbook-worthy operational baseline

### 12.2 What Block 26 is not
- not a full enterprise observability platform
- not a vendor-heavy monitoring rewrite
- not a complete SRE stack
- not a production-scale infra rebuild
- not permission to refactor the whole app
- not a reason to change unrelated domain behavior

### 12.3 Expected deliverables
- health-check or equivalent diagnostic surface
- minimal operational visibility
- controlled failure handling where relevant
- backup/restore confidence path
- clear runbook inputs
- evidence that the system is safer to operate after the block

### 12.4 Approval logic
Block 26 is approved only if:
- the system is more observable than before
- failure scenarios are easier to reason about
- restore confidence improved
- the scope stayed narrow
- unrelated product behavior did not drift

---

## 13. Security, privacy, and go-live reminders

### 13.1 Already introduced foundation

Security and LGPD groundwork already entered the roadmap through Block 24.

### 13.2 Still mandatory before real go-live

Even after roadmap completion, the following remain mandatory before real launch:
- public privacy policy
- operational channel for LGPD subject requests
- simplified record of processing activities and legal bases
- incident runbook and communication baseline
- supplier/subprocessor contractual review where applicable
- backup and restoration proof under realistic conditions

### 13.3 Security principles that must survive every prompt
- do not expose protected internals casually
- do not weaken routes just to satisfy tests
- do not hardcode secrets
- do not couple public artifacts to sensitive internals
- do not treat compliance as copywriting only

---

## 14. Prompt standard for Codex and AI-assisted execution

Firmus must not be developed with vague prompts.

### 14.1 Every serious implementation prompt should define:
- role
- exact block or bug
- strict goal
- strict scope
- expected strategy
- domain requirements
- storage/logic rules
- integration points
- UI constraints
- testing mindset
- acceptance criteria
- response format
- explicit final instruction against scope creep

### 14.2 Prompt tone
Prompts must be:
- technical
- strict
- narrow
- implementation-oriented
- hostile to drift

### 14.3 Prompt anti-patterns
Never use prompts like:
- improve the system
- make it more professional
- refactor as needed
- apply best practices broadly
- modernize architecture
- optimize everything

### 14.4 Preferred behavior
Prefer:
- smallest correct implementation
- explicit forbidden directions
- minimal file touch
- visible acceptance criteria
- validation evidence

---

## 15. Repository-wide out-of-scope defaults

If a prompt does not explicitly authorize expansion, treat these as out of scope by default:
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

---

## 16. Documentation maintenance rules

### 16.1 Update this playbook when:
- the active block changes
- a new architectural rule becomes durable
- a phase transitions
- the roadmap is renumbered or expanded
- security/go-live doctrine changes materially
- testing doctrine changes materially

### 16.2 Do not update this playbook for:
- tiny wording tweaks
- cosmetic observations
- routine isolated bug fixes
- transient dev noise

### 16.3 Minimum maintenance rule
After approving a meaningful block:
- update ROADMAP.md
- update QA_CHECKPOINTS.md
- update this playbook if the project rules or normalized state changed

---

## 17. Final governing rules

1. Build only the next correct block.
2. Respect the roadmap more than momentum.
3. Keep routes thin.
4. Put orchestration in services.
5. Keep money canonical in cents.
6. Derive state whenever reasonable.
7. Emit events only for real completed actions.
8. Use QA as a gate.
9. Do not let AI improvise product direction.
10. Prefer continuity over novelty.
11. Protect the project from scope drift.
12. Do not confuse feature progress with launch readiness.

---

## 18. Final normalized project statement

Firmus is no longer in early foundation mode.

It already has:
- operational core
- assisted behavior layers
- public-facing trust surfaces
- security/LGPD foundation
- protected activity logs
- stabilized desktop/mobile navigation

The current mission is not to invent the product again.

The current mission is to finish the remaining blocks with discipline, observability, fiscal readiness, controlled expansion, and real go-live maturity.

The next correct step is Block 26 — Observability and Stability.

That block should make the system easier to trust, easier to recover, and safer to continue.

Durable progress remains the objective.

End of document.