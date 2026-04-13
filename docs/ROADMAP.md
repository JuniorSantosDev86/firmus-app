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
**Status:** Pending  
**Objective:** Start simulating the future conversational workflow without needing WhatsApp integration yet.

### Block 15 — Assisted Charge Suggestions
**Status:** Pending  
**Objective:** Give the first real feeling of an operational copilot.

---

## Phase 3 — Public Growth Layer

### Block 16 — Public Quote Page
**Status:** Pending  
**Objective:** Turn the quote into a professional public touchpoint.

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

## Phase 5 — Expansion and Monetization Readiness

### Block 26 — Improved Text Parsing
**Status:** Pending  
**Objective:** Increase the quality of structured input interpretation.

### Block 27 — Outbound Channel Abstraction
**Status:** Pending  
**Objective:** Prepare the system for future external channels.

### Block 28 — Feature Flags and Plan Limits
**Status:** Pending  
**Objective:** Prepare technical support for Free / Plus / Pro plans.

### Block 29 — Improved Onboarding
**Status:** Pending  
**Objective:** Make the first user experience faster and more guided.

### Block 30 — MVP Hardening
**Status:** Pending  
**Objective:** Stabilize the expanded MVP before beta usage.

---

# Milestones

## Milestone 1 — 50 Hours
Core transactional foundation validated.

## Milestone 2 — 75 Hours
Assisted operations layer validated.

## Milestone 3 — 100 Hours
Public-facing growth layer validated.

## Milestone 4 — 125 Hours
Initial automation and intelligence validated.

## Milestone 5 — 150 Hours
Expanded MVP ready for structured beta.

---

# Current Status

**Current active block:** Block 13 — Weekly Summary completed and approved  
**Current phase:** Phase 2 — Assisted Operations in progress  
**Overall project status:** In progress

- Block 12 — Templates completed and approved.
- Block 13 — Weekly Summary completed and approved.
- Cypress coverage now includes Templates and Weekly Summary.
- The next implementation target is Block 14 — Text-Based Assisted Input.


# Notes

- This roadmap is a living document.
- Each block should only be marked as completed after QA validation.
- Scope discipline is mandatory.
- The product must evolve in layers, not through uncontrolled feature accumulation.
- After Block 10, the project completed a controlled UI translation/branding pass and a safe deletion + Cypress stabilization pass before continuing.