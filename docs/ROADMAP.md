# Firmus Roadmap

This document tracks the execution roadmap of the Firmus project in progressive build blocks.

The goal is to keep development disciplined, incremental, and aligned with the corrected product architecture.

Firmus is being built in layers:

1. Core transactional foundation
2. Assisted operations
3. Public-facing growth layer
4. Intelligence and automation
5. Expansion and monetization readiness

The roadmap below reflects the current execution strategy.

---

## Product Execution Principles

Before listing blocks, these rules guide the roadmap:

- Build in small validated increments
- Protect the core before expanding outward
- Avoid premature complexity
- Keep scope disciplined
- Validate each block before starting the next one
- Prefer stable, boring foundations over flashy but fragile progress
- Treat each block as a concrete proof of value

---

## Architecture Layers

### Layer 1 — Core Transactional Foundation
This is the heart of the product.

Includes:
- business profile
- clients
- services
- quotes
- charges
- timeline events
- financial overview

### Layer 2 — Assisted Operations
This layer helps the user act faster and with less mental load.

Includes:
- reminders
- message templates
- weekly summary
- assisted charge suggestions
- text-based structured input

### Layer 3 — Public Growth Layer
This is the public-facing layer that improves perception and creates organic distribution.

Includes:
- public quote page
- premium quote PDF
- quote approval actions
- basic professional bio link

### Layer 4 — Intelligence and Automation
This layer adds automation and smarter behavior on top of already stable workflows.

Includes:
- automation rules
- automatic reminders
- reactivation radar
- observability
- event-driven automation foundations

### Layer 5 — Expansion and Monetization Readiness
This prepares the product for larger scale and future pricing plans.

Includes:
- improved parsing
- outbound channel abstraction
- feature flags
- plan limits
- improved onboarding

---

# Execution Roadmap

## Phase 1 — Core Transactional Foundation

### Block 1A — Day 1 / Hour 1 / First Half Hour
**Status:** Completed  
**Objective:** Create the initial technical foundation of the project.

**Delivered:**
- Next.js scaffold
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui baseline
- minimal global layout
- minimal homepage
- Git repository initialized and committed

**Validation status:** Approved with minor reservation

---

### Block 1B — Day 1 / Hour 1 / Second Half Hour
**Status:** Completed 
**Objective:** Clean and stabilize the initial app shell for future product expansion.

**Expected scope:**
- review and normalize initial structure
- ensure project naming consistency
- keep the app shell clean and minimal
- prepare placeholder navigation structure only if strictly needed
- confirm clean continuation point for domain work

**Out of scope:**
- auth
- database
- domain entities
- dashboards
- business logic

**Acceptance criteria:**
- project structure remains clean
- no duplicated folders or residual scaffold noise
- foundation files are stable and readable
- no out-of-scope features added
- ready to start domain modeling in the next block

---

### Block 2 — Core Domain Foundation
**Status:** Completed  
**Objective:** Establish the project’s central domain structure.

**Delivered:**
- Created a dedicated `lib/domain` module
- Added lightweight entity typing for:
  - business profile
  - clients
  - services
  - quotes
  - quote items
  - charges
  - timeline events
- Added common shared domain primitives
- Added a central export surface through `lib/domain/index.ts`
- Preserved strict scope discipline with no business flow implementation

**Validation status:** Approved

### Block 3 — Business Profile
**Status:** Completed  
**Objective:** Implement the business identity layer.

**Delivered:**
- Created a dedicated Business Profile route
- Added a focused create/edit form
- Added lightweight local persistence through `localStorage`
- Reused the `BusinessProfile` domain type
- Added a homepage entry link to the feature

**Validation status:** Approved with minor reservation

---

### Block 4 — Clients
**Status:** Completed  
**Objective:** Create the first real operational client entity flow.

**Delivered:**
- Created a dedicated Clients route
- Added a focused list + create/edit manager
- Added lightweight local persistence through `localStorage`
- Reused the `Client` domain type
- Added a homepage entry link to the feature

**Validation status:** Approved

---

### Block 5 — Services
**Status:** Completed  
**Objective:** Structure the service catalog in a lightweight way.

**Delivered:**
- Created a dedicated Services route
- Added a focused list + create/edit manager
- Added lightweight local persistence through `localStorage`
- Reused the `Service` domain type
- Added a homepage entry link to the feature

**Validation status:** Approved
---

### Block 6 — Quote Engine
**Status:** Completed  
**Objective:** Implement the quote creation flow.

**Delivered:**
- Created a dedicated Quotes route
- Added a focused list + create/edit manager
- Added lightweight local persistence through `localStorage`
- Reused the `Quote`, `QuoteItem`, `Client`, and `Service` domain types
- Implemented quote item handling with optional service reuse
- Implemented canonical quote calculations in cents
- Added a homepage entry link to the feature

**Validation status:** Approved
---

### Block 6T — Cypress Baseline for Core Flows
**Status:** Completed  
**Objective:** Establish the first automated E2E regression layer for the current implemented slices.

**Delivered:**
- Installed and configured Cypress
- Added E2E coverage for:
  - Home
  - Business Profile
  - Clients
  - Services
  - Quotes
- Corrected hydration-related instability affecting test execution
- Validated the suite successfully in headless mode

**Validation status:** Approved

### Block 7 — Timeline Events
**Status:** Completed  
**Objective:** Introduce event-driven product memory.

**Delivered:**
- Implemented TimelineEvent domain model (normalized structure)
- Implemented append-only event storage using localStorage
- Created timeline event service layer
- Integrated event creation into:
  - client creation
  - service creation
  - quote creation
- Ensured no event creation on update flows
- Preserved existing flows without regression

**Validation status:** Approved

### Block 8 — Charges
**Status:** Completed  
**Objective:** Implement the charge registration flow.

**Delivered:**
- Created a dedicated Charges route
- Added a focused list + create/edit manager
- Added lightweight local persistence through `localStorage`
- Reused the `Charge` domain type
- Implemented derived overdue status logic without persisting `overdue`
- Implemented charge payment transition flow
- Integrated timeline event emission for:
  - `charge_created`
  - `charge_paid`
- Added a homepage entry link to the feature

**Validation status:** Approved

---

### Block 9 — Financial Overview
**Status:** Completed  
**Objective:** Create the first simple operational dashboard.

**Delivered:**
- Created a dedicated Financial Overview route
- Added a minimal overview summary UI
- Implemented runtime-derived financial calculations from existing charges
- Reused the existing derived overdue logic from the Charges slice
- Added overview metrics for:
  - available today
  - receivable in 7 days
  - overdue amount
- Preserved a derived-only approach with no new persistence layer
- Added a homepage entry link to the feature

**Validation status:** Approved

---

## Block 10U — Safe Deletion Actions and Cypress Stabilization

**Block name:** Safe Deletion Layer and Cypress Recovery  
**Status:** Approved  
**Date:** 2026-04-12  
**Objective:** Introduce safe deletion actions for the current core tools and restore Cypress coverage to the current validated Portuguese UI and behavior.

### Expected scope
- Add deletion actions for:
  - clients
  - services
  - quotes
  - charges
- Apply entity-specific deletion rules safely
- Recover Cypress coverage after translation and UI evolution
- Stabilize selectors where necessary with minimal test-oriented hooks

### Out of scope
- Soft delete
- Archive mode
- Undo history
- Timeline deletion
- Delete-related timeline events
- Modal systems
- Product redesign
- Architecture refactor
- New testing libraries

### Acceptance criteria
- [x] Delete actions exist for clients, services, quotes, and charges
- [x] Deletion requires confirmation
- [x] Services can be deleted safely
- [x] Quotes can be deleted safely
- [x] Charges can be deleted safely
- [x] Clients with related quotes or charges cannot be deleted
- [x] Clients without related data can be deleted
- [x] No unintended cascade behavior was introduced
- [x] Timeline architecture remained unchanged
- [x] Cypress suite was updated to the current Portuguese UI
- [x] The remaining Quotes spec was corrected and now passes
- [x] `npm run lint` passed
- [x] Cypress suite is green again in the local validated project flow

### Validation summary

#### 1. Safe deletion behavior
**Status:** Passed

Validated items:
- Services deletion implemented safely
- Quotes deletion implemented with quote-owned item cleanup
- Charges deletion implemented safely
- Client deletion guarded against linked quotes or charges
- Confirmation step required before deletion

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No soft delete introduced
- No archive mode introduced
- No timeline deletion introduced
- No forced delete for clients introduced
- No unrelated architecture changes introduced

#### 3. Cypress stabilization
**Status:** Passed

Validated items:
- Existing specs updated to the current Portuguese UI
- Selector strategy improved with minimal `data-testid` hooks
- Quotes spec corrected to align with the current DOM structure
- Core flows remain meaningfully covered

#### 4. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- Local Cypress validation returned to passing state after spec corrections

### Evidence
- Delete buttons added to core managers
- Client deletion guard validated
- Quotes spec corrected after UI evolution
- Cypress suite stabilized again for the current app state
- Successful execution of:
  - `npm run lint`
  - local Cypress validation

### Final QA decision
**Approved**

### Notes
- This patch closed an important operational gap by enabling deletion in the current tools.
- It also restored automated confidence after the Portuguese UI transition and the evolution of core flows.
- The project is now ready to continue with the next roadmap step on a healthier operational and testing base.
---

## Phase 2 — Assisted Operations


### Block 11 — Reminders
Status: Completed and approved.

Delivered:
- Reminder domain model
- localStorage persistence
- deterministic reminder service layer
- Portuguese reminders UI
- optional client linkage
- optional charge linkage
- completion flow
- reminder timeline events
- dashboard activity integration
- client detail timeline integration

Notes:
- Reminder behavior was validated manually and structurally.
- A client timeline linkage bug was identified during QA and fixed before final approval.
- Hydration warning investigation indicated external DOM mutation rather than an app-side defect.


### Block 12 — Templates
Status: Completed and approved.

Delivered:
- Template domain model
- localStorage persistence
- templates service layer
- Portuguese templates UI
- create flow
- edit flow
- active/inactive toggle
- category organization
- internal navigation integration

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run

Notes:
- Templates were intentionally kept lightweight.
- No interpolation engine, outbound delivery, automation rules, or AI generation were introduced.

### Block 13 — Weekly Summary
Status: Completed and approved.

Delivered:
- typed weekly summary structure
- deterministic weekly summary service
- Portuguese weekly summary UI
- explicit period rendering
- stats/cards for operational totals
- sections for overdue charges, due soon charges, reminders, and recent activity
- deterministic highlights derived from real data
- internal navigation integration

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run

Notes:
- Weekly Summary remains a derived view over existing slices.
- No persisted canonical summary aggregate was introduced.
- Test fragility was corrected in Cypress without changing product behavior.

### Block 14 — Text-Based Assisted Input
Status: Completed and approved.

Delivered:
- assisted input domain model
- deterministic text parser
- assisted input orchestration service
- Portuguese assisted input UI
- structured interpretation preview
- warnings for ambiguous/incomplete text
- explicit confirmation flow
- real reminder creation through existing slice
- real charge creation through existing slice

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run

Notes:
- The feature simulates future conversational workflows without external channels.
- No chat-first UI, WhatsApp dependency, LLM parsing, or automatic execution was introduced.
- Parse-only actions remain non-destructive and do not create entities before user confirmation.

### Block 15 — Assisted Charge Suggestions
Status: Completed and approved.

Delivered:
- assisted charge suggestion domain model
- deterministic suggestion engine
- Portuguese suggestions UI
- explanation and reason-code rendering
- accept flow
- dismiss flow
- minimal suggestion-state persistence
- real charge creation through existing slice on acceptance

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run

Notes:
- Suggestions are derived from known validated data such as quotes, charges, reminders, and timeline events.
- The feature remains explainable and inspectable.
- No black-box AI behavior or automatic execution was introduced.

---

## Phase 3 — Public Growth Layer

### Technical Exception — Product Shell and Control Tower
**Status:** Next  
**Objective:** Turn Firmus from a set of functional pages into a more cohesive product shell without changing the official public-growth numbering.

### Main goals
- Introduce a proper application shell
- Replace the overcrowded top-nav pattern as the primary navigation structure
- Add left sidebar for desktop
- Add top bar + drawer navigation for mobile
- Centralize navigation in a single registry
- Strengthen dashboard as a control-tower experience
- Consume real timeline/activity data in the home/dashboard

### Expected architecture
- central navigation registry
- reusable app shell
- desktop sidebar
- mobile drawer
- page header / content frame
- lightweight timeline consumption in dashboard
- recent activity and operational overview cards

### Expected outcome
After this technical exception, the app should feel structurally more mature, more navigable, and more aligned with the product thesis of an operational copilot.

### Out of scope
- backend
- auth
- multi-user support
- external integrations
- broad redesign of visual identity
- major domain rewrites

## Technical Exception — Product Shell and Control Tower
**Status:** Completed

### Objective
Turn Firmus from a set of functional pages into a more cohesive product shell before continuing the official public-growth roadmap sequence.

### Why this exception happened
The previous top-navigation pattern had reached its structural limit.
Before continuing outward-facing growth features, the app needed a stronger internal shell and clearer operational navigation.

### Outcome
Completed successfully.

The app now includes:
- desktop sidebar as primary navigation
- mobile top bar + drawer navigation
- centralized navigation registry
- shared internal page-header structure
- dashboard/control-tower behavior using real persisted data
- recent activity based on timeline events
- upcoming actions and operational summary from real module data

### Why this matters
This exception improves product cohesion, navigation clarity, and operational usability.
It creates a stronger base for the next official roadmap steps without changing the public-growth numbering.

### Exit criteria reached
- shell implemented
- sidebar implemented
- mobile drawer implemented
- centralized navigation implemented
- dashboard upgraded to control-tower role
- recent activity and upcoming actions connected to real data
- regression safety validated

### Follow-up before returning to official roadmap
Apply visual polish refinements:
- full PT-BR consistency
- sidebar legibility tuning
- stronger CTA/status emphasis in operational lists
- better hierarchy in recent activity
- review lower-left helper card usefulness

### Return point after this exception
Resume official roadmap at:
- Block 17 — Premium Quote PDF

---

### Block 17 — Premium Quote PDF
**Status:** Pending  
**Objective:** Improve perceived professionalism and sharing quality.

### Block 18 — Quote Approval Actions
**Status:** Pending  
**Objective:** Make the public quote page interactive.

### Block 19 — Basic Bio Link
**Status:** Pending  
**Objective:** Create the first professional public identity page.

### Block 20 — Public Touchpoint Polish
**Status:** Pending  
**Objective:** Improve visual quality and consistency across public-facing outputs.

---

## Phase 4 — Intelligence and Automation

### Block 21 — Automation Rules Foundation
**Status:** Pending  
**Objective:** Create the first rule-based automation layer.

### Block 22 — Automatic Reminder Creation
**Status:** Pending  
**Objective:** Generate reminders automatically from events and due dates.

### Block 23 — Simple Reactivation Radar
**Status:** Pending  
**Objective:** Identify inactive clients and support revenue recovery.

### Block 24 — Activity Logs
**Status:** Pending  
**Objective:** Track important product actions internally.

### Block 25 — Observability and Stability
**Status:** Pending  
**Objective:** Improve reliability before further expansion.

---

## Phase 5 — Expansion, Fiscal Compliance, and Monetization Readiness

### Block 26 — Improved Text Parsing
**Status:** Pending  
**Objective:** Increase the quality of structured input interpretation.

### Block 27 — Outbound Channel Abstraction
**Status:** Pending  
**Objective:** Prepare the system for future external channels.

### Block 28 — NFSe Foundation
**Status:** Pending  
**Objective:** Prepare the minimum fiscal layer required for service invoice issuance.

### Expected scope
- fiscal profile fields for issuer
- minimum customer/taker fiscal requirements
- service-to-tax mapping needed for issuance
- invoice status model
- link between quotes / charges / service execution and invoice readiness
- validation rules before attempting issuance
- safe issuer-side configuration UI

### Out of scope
- full accounting module
- bank reconciliation
- advanced tax engine
- multi-city fallback abstraction beyond the chosen provider strategy
- cancellation and substitution edge cases beyond MVP needs

---

### Block 29 — NFSe Issuance Integration
**Status:** Pending  
**Objective:** Emit NFS-e through the selected official-compatible integration path.

### Expected scope
- integration adapter for the chosen NFS-e path/provider
- issuance request flow
- response/status persistence
- protocol / receipt / invoice identifiers
- error handling and retry-safe states
- basic issuance history visibility

### Out of scope
- broad fiscal BI
- complex reconciliation workflows
- municipality-specific deep customizations outside the chosen MVP strategy

---

### Block 30 — DAS Companion and Official Channel Handoff
**Status:** Pending  
**Objective:** Help the MEI stay compliant with DAS obligations without pretending to replace the official payment channels.

### Expected scope
- monthly DAS reminder/status layer
- due-date visibility inside Firmus
- guidance for official payment flow
- handoff/deep-link strategy to official channels where applicable
- support content for PIX / debit automatic / consolidated DAS usage
- manual payment confirmation / bookkeeping marker inside the product

### Out of scope
- native DAS payment processing inside Firmus
- unofficial scraping-based automation
- dependency on brittle browser automation against government portals
- pretending there is a stable public payment API if none is adopted in the MVP strategy

---

### Block 31 — Feature Flags and Plan Limits
**Status:** Pending  
**Objective:** Prepare technical support for Free / Plus / Pro plans.

### Block 32 — Improved Onboarding
**Status:** Pending  
**Objective:** Make the first user experience faster and more guided.

### Block 33 — MVP Hardening
**Status:** Pending  
**Objective:** Stabilize the expanded MVP before beta usage.

---

# Current Status

**Current technical exception:** Product Shell and Control Tower  
**Current official roadmap block:** Block 17 — Premium Quote PDF  
**Overall project status:** In progress

- Block 12 — Templates completed and approved.
- Block 13 — Weekly Summary completed and approved.
- Block 14 — Text-Based Assisted Input completed and approved.
- Block 15 — Assisted Charge Suggestions completed and approved.
- Block 16 — Assisted Input as Real Operational Entry Point completed and approved.
- Assisted operations layer is now functionally complete for the current roadmap slice.
- The next official implementation target, after the shell exception, is Block 17 — Premium Quote PDF.

---

# Notes

- This roadmap is a living document.
- Each block should only be marked as completed after QA validation.
- Scope discipline is mandatory.
- The product must evolve in layers, not through uncontrolled feature accumulation.
- The shell work is an intentional technical exception outside the official growth-layer numbering.
- NFSe is now explicitly inside the MVP roadmap as part of fiscal compliance readiness.
- DAS is included as a compliance-assistance workflow, not as a native payment rail.