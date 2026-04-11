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

### Block 2 — Core Data Modeling
**Status:** Pending  
**Objective:** Establish the project’s central data structure.

**Expected scope:**
- define the core product entities conceptually
- prepare technical direction for:
  - business profile
  - clients
  - services
  - quotes
  - quote items
  - charges
  - timeline events
- document relationships before implementation

**Acceptance criteria:**
- core entities clearly defined
- relationships coherent
- no unnecessary complexity
- ready for implementation in future blocks

---

### Block 3 — Business Profile
**Status:** Pending  
**Objective:** Implement the business identity layer.

**Expected scope:**
- business name
- professional name
- short description
- city
- WhatsApp
- logo placeholder

**Acceptance criteria:**
- business profile can be created and updated
- profile data is reusable by future public outputs
- scope remains minimal

---

### Block 4 — Clients
**Status:** Pending  
**Objective:** Create the first real operational entity of the product.

**Expected scope:**
- client CRUD
- minimal fields
- lightweight organization
- simple searchability

**Acceptance criteria:**
- client can be created
- client can be edited
- client can be listed
- client detail screen is possible in the next block

---

### Block 5 — Services
**Status:** Pending  
**Objective:** Structure the service catalog in a lightweight way.

**Expected scope:**
- service CRUD
- base price
- short description
- estimated delivery time
- active/inactive status

**Acceptance criteria:**
- services can be managed
- services are ready to be reused inside quotes

---

### Block 6 — Quote Engine
**Status:** Pending  
**Objective:** Implement the quote creation flow.

**Expected scope:**
- create quote
- add quote items
- attach quote to client
- define status
- calculate totals

**Acceptance criteria:**
- quote structure works end to end
- quote statuses are valid
- quote total calculation is correct

---

### Block 7 — Timeline Events
**Status:** Pending  
**Objective:** Introduce event-driven product memory.

**Expected scope:**
- store important actions as timeline events
- support future automation and summaries
- begin event-driven structure early

**Acceptance criteria:**
- core actions generate events
- events can be rendered in a client timeline later

---

### Block 8 — Charges
**Status:** Pending  
**Objective:** Implement the charge registration flow.

**Expected scope:**
- create charge
- attach to client
- optional relation to quote
- define due date
- define status

**Acceptance criteria:**
- charges can be created and tracked
- statuses work properly
- flow supports future reminders and summaries

---

### Block 9 — Financial Overview
**Status:** Pending  
**Objective:** Create the first simple operational dashboard.

**Expected scope:**
- available today
- receivable in 7 days
- overdue amount

**Acceptance criteria:**
- financial summary is simple and readable
- no ERP-style complexity
- values reflect stored data correctly

---

### Block 10 — Client Detail and Consolidated Timeline
**Status:** Pending  
**Objective:** Create the first useful client-centered view.

**Expected scope:**
- client information
- related quotes
- related charges
- timeline rendering
- internal notes if necessary

**Acceptance criteria:**
- client view is coherent
- timeline creates continuity
- foundation is ready for assisted operations

---

## Phase 2 — Assisted Operations

### Block 11 — Reminders
**Status:** Pending  
**Objective:** Help the user keep track of follow-ups and due actions.

### Block 12 — Templates
**Status:** Pending  
**Objective:** Reduce repetitive communication effort.

### Block 13 — Weekly Summary
**Status:** Pending  
**Objective:** Create retention through useful operational feedback.

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

**Current active block:** Block 1B  
**Current phase:** Phase 1 — Core Transactional Foundation  
**Overall project status:** In progress

---

# Notes

- This roadmap is a living document.
- Each block should only be marked as completed after QA validation.
- Scope discipline is mandatory.
- The product must evolve in layers, not through uncontrolled feature accumulation.