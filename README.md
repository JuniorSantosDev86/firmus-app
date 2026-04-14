# Firmus

**Firmus** is a B2B operational copilot for service professionals and small businesses.  
The product is being built to reduce operational friction in day-to-day routines such as client management, service organization, quote creation, charge tracking, and financial visibility.

Instead of behaving like a traditional bloated ERP, Firmus is being designed as a **practical operational layer**: simple, focused, and fast to use.

---

## Vision

Firmus is not being built as “just another management dashboard”.

The long-term vision is to create a **copiloto operacional e administrativo** for service businesses, combining:

- fast internal workflows
- lightweight business organization
- operational visibility
- guided data entry
- simple but reliable financial control

The product direction is to help the user work with less friction and less context switching.

---

## What is being built

The current product is an MVP in active development.

At this stage, Firmus is evolving into a system with the following core areas:

- **Business Profile**  
  Base business information and operational identity.

- **Clients**  
  Client registration and relationship foundation.

- **Services**  
  Service catalog with reusable pricing logic.

- **Quotes**  
  Quote creation, editing, persistence, and reuse of service data.

- **Charges**  
  Charge registration and due date tracking.

- **Financial Overview**  
  High-level operational finance visibility based on local product data.

- **Assisted Input (Entrada assistida)**  
  A guided natural-language operational entry flow, where the user writes a short instruction in PT-BR and the system interprets it before confirmation.

The product is being built with a strong MVP mindset:  
**make the flow useful, reliable, and coherent before making it complex.**

---

## Current product direction

Firmus is being developed as a **WhatsApp-first inspired operational product**, but the current implementation is focused on the **Web App control layer**.

The intention is to build a product that feels less like a generic ERP and more like a **daily command center** for service operations.

That is why current efforts are focused on:

- operational clarity
- faster data entry
- clean internal workflows
- progressively smarter interactions
- dashboard utility over visual excess

---

## Current status

The project already has a validated technical foundation and several operational slices in place.

### Implemented foundation

- Next.js App Router setup
- TypeScript configuration
- Tailwind CSS setup
- shadcn/ui integration
- project cleanup and initial structural conventions
- domain modeling for key entities
- local persistence using `localStorage`

### Functional slices already implemented

- Business Profile
- Clients
- Services
- Quotes
- Charges
- Financial Overview
- Assisted Input (MVP interpretation flow)

### Product evolution already completed

- homepage evolved into a more product-oriented internal dashboard
- Portuguese UI consistency improved across core areas
- assisted input interpretation improved significantly for PT-BR commands
- user review/edit step added before confirming interpreted actions
- stability improvements for parsing and warning rendering
- Cypress flows adapted and validated as the product evolved

---

## Assisted Input

One of the most important product directions in Firmus is the **Entrada assistida** flow.

This feature allows the user to write short natural-language instructions such as:

- `Criar cobrança para Ana de R$ 250 com vencimento amanhã`
- `Cria um orçamento de 250 reais para o João referente a manutenção de ar condicionado`
- `Lembrete de follow-up com Bruno hoje`

The system interprets the instruction, extracts structured data, and presents a review layer before confirmation.

This is a major part of the product thesis:
instead of forcing the user to always navigate many forms, the system should progressively support a more natural operational flow.

At the current stage, this feature is already at MVP level and is now evolving toward:
- stronger execution routing
- real entity creation from interpreted drafts
- timeline/event registration
- more cohesive product integration

---

## Tech stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Cypress** for end-to-end validation
- local persistence with **localStorage**

---

## Architecture approach

The current architecture favors simplicity, readability, and safe iteration.

### Core principles

- keep the MVP focused
- avoid premature backend complexity
- favor small and testable slices
- keep domain logic readable
- separate UI concerns from operational logic where possible
- evolve the product in validated blocks

### Current architectural characteristics

- route-based pages using App Router
- reusable UI primitives and dashboard components
- domain-first modeling for business entities
- local storage helpers for persistence
- incremental evolution of product flows instead of broad rewrites

---

## Testing strategy

Firmus is being developed with a practical quality strategy focused on **confidence during iteration**.

The project is tested through a combination of:

### 1. Manual validation
Each major development block is manually validated in the browser to confirm:
- main user flows
- layout integrity
- persistence behavior
- UI consistency
- Portuguese labels and messaging
- product usability after each change

### 2. Cypress end-to-end tests
Cypress is used to validate critical flows across the application, especially in areas such as:

- client creation
- service creation
- quote flows
- assisted input regressions
- navigation-sensitive interactions

As the product evolves, Cypress tests are updated to match real UI behavior and current labels.

### 3. Linting and static safety
The project also uses technical quality gates such as:
- lint checks
- type safety through TypeScript
- targeted regression validation after relevant changes

### 4. QA checkpoint tracking
The project maintains internal QA tracking documentation to ensure development and validation remain aligned.

Relevant project docs include:

- `docs/QA_CHECKPOINTS.md`
- `docs/ROADMAP.md`

These files help document:
- what was implemented
- what was validated
- what remains to be built
- what is intentionally deferred

---

## How quality is being approached

This project is not being built by adding features blindly.

The current approach is:

1. build a controlled slice
2. validate the slice
3. stabilize behavior
4. update QA and roadmap documentation
5. move to the next block only after confidence is acceptable

This keeps the MVP from becoming visually attractive but operationally fragile.

---

## Roadmap direction

The next layers of evolution focus on turning Firmus into a more cohesive operational product.

Planned or evolving directions include:

- assisted input as a real execution entrypoint
- structured draft validation before creation
- action routing to the correct module
- event/timeline registration
- dashboard as a true operational control tower
- stronger responsive shell with sidebar + mobile drawer
- more coherent navigation architecture
- lighter visual identity refinements
- future integrations and automation layers

The roadmap is intentionally incremental:
each block should add real product value without destabilizing what already works.

---

## Project structure

The exact structure may evolve, but the codebase currently follows a practical split across areas such as:

- `app/` — route structure and page-level UI
- `components/` — reusable interface components
- `lib/` — helpers, domain logic, persistence, and product logic
- `docs/` — roadmap and QA tracking

---

## Local development

### Requirements

- Node.js
- npm
- modern browser

### Install dependencies

```bash
npm install