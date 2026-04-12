# QA Checkpoints

This document records quality validation by execution block for the Firmus project.

Its purpose is not to replace future automated testing, but to document build-stage QA step by step, ensuring that each vibecoding block ends with a stable foundation, respected scope, and safe continuity for the next block.

---

## Block 1A — Day 1 / Hour 1 / First Half Hour

**Block name:** Initial Technical Foundation  
**Status:** Approved with minor reservation  
**Date:** 2026-04-11  
**Objective:** Validate that the minimum technical foundation of the project was created correctly and is ready for continuation without rework.

## Block 1B — Day 1 / Hour 1 / Second Half Hour

**Block name:** Foundation Normalization and Shell Stabilization  
**Status:** Approved  
**Date:** 2026-04-11  
**Objective:** Normalize the initial scaffold, remove leftover template noise, and stabilize the base app shell for future domain work.

## Block 2 — Day 1 / Hour 2 / Core Domain Foundation

**Block name:** Core Domain Typing Spine  
**Status:** Approved  
**Date:** 2026-04-11  
**Objective:** Establish the first clear domain foundation of the product through lightweight entity typing, without implementing business flows or feature logic.

### Expected scope
- Define the core product concepts at the code structure level
- Introduce lightweight domain typing for the central entities
- Create a minimal structural spine for future implementation blocks
- Keep the app shell intact
- Preserve strict scope discipline

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- CRUD flows
- Forms
- Business logic
- Dashboards with real data
- State management
- Automations
- AI
- Payment integrations
- Public-facing quote flows
- Bio link features
- Testing setup
- Docker
- CI/CD

### Acceptance criteria
- [x] Core product concepts represented in code structure
- [x] Domain naming is coherent
- [x] Lightweight entity typing added without behavior
- [x] No out-of-scope features introduced
- [x] App still runs locally
- [x] `npm run lint` passed
- [x] `npm run build` passed
- [x] `npm run dev` booted successfully
- [x] Project is easier to continue in the next blocks
- [x] Structural ambiguity reduced

### Validation summary

#### 1. Domain structure
**Status:** Passed

Validated items:
- Added a dedicated `lib/domain` structure
- Introduced central domain files:
  - `business-profile.ts`
  - `client.ts`
  - `service.ts`
  - `quote.ts`
  - `charge.ts`
  - `timeline-event.ts`
  - `common.ts`
  - `index.ts`
- Domain concepts now exist as first-class structures in the codebase

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No CRUD flows added
- No forms added
- No database added
- No API routes added
- No feature behavior added
- No speculative enterprise architecture added

#### 3. Domain typing quality
**Status:** Passed

Validated items:
- Files contain lightweight types and interfaces
- `common.ts` defines reusable primitive foundations
- `quote.ts` correctly introduces `Quote` and `QuoteItem`
- `charge.ts` correctly models charge status and quote relation
- `timeline-event.ts` is generic enough for future reuse
- `index.ts` provides a clean export surface

#### 4. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- `npm run build` passed
- `npm run dev` booted successfully
- App remained stable after structural changes

#### 5. Continuity for next block
**Status:** Passed

Validated items:
- The codebase now has a clearer product spine
- Future implementation of profile, clients, services, quotes, charges, and timelines is less ambiguous
- The next blocks can focus on implementation rather than structural guessing

### Evidence
- New `lib/domain` structure created
- Local validation completed successfully:
  - `npm run lint`
  - `npm run build`
  - `npm run dev`
- Minimal shell preserved
- Only one minor homepage wording adjustment added

### Final QA decision
**Approved**

## Block 3 — Day 1 / Hour 3 / Business Profile Slice

**Block name:** Business Profile Minimal Implementation  
**Status:** Approved with minor reservation  
**Date:** 2026-04-11  
**Objective:** Implement the first real product slice by allowing the user to view, create, edit, and persist the Business Profile in a minimal and disciplined way.

### Expected scope
- Create a Business Profile route
- Create a minimal Business Profile form
- Allow create/edit behavior
- Persist data locally in the simplest correct way for this stage
- Reuse the existing `BusinessProfile` domain type
- Keep the app shell coherent and minimal

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- Clients
- Services
- Quotes
- Charges
- Timeline flows
- Upload systems
- Validation libraries
- State management libraries
- Dashboards
- Automations
- AI
- Testing setup
- Docker
- CI/CD

### Acceptance criteria
- [x] A Business Profile route exists
- [x] The Business Profile can be viewed
- [x] The Business Profile can be created or edited
- [x] The profile fields match the intended scope
- [x] The implementation uses the domain foundation coherently
- [x] No out-of-scope features were added
- [x] The app still runs locally
- [x] `npm run lint` passed
- [x] `npm run build` passed
- [x] The project is meaningfully more product-like than before
- [x] The next blocks can build on this implementation cleanly

### Validation summary

#### 1. Product slice implementation
**Status:** Passed

Validated items:
- Added `app/business-profile/page.tsx`
- Added `components/business-profile-form.tsx`
- Added `lib/business-profile-storage.ts`
- Added a homepage entry link to the Business Profile area

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No auth added
- No DB added
- No Prisma added
- No API routes added
- No extra entities implemented
- No fake progress screens added
- No unnecessary architectural expansion introduced

#### 3. Persistence strategy
**Status:** Passed

Validated items:
- Persistence implemented through a lightweight `localStorage` helper
- Persistence is typed against the `BusinessProfile` domain model
- Solution is appropriate for this stage
- Easy to replace later with real backend persistence

#### 4. Domain coherence
**Status:** Passed

Validated items:
- Business Profile implementation reuses the domain foundation
- Structure remains aligned with the `lib/domain` spine
- The slice establishes a useful pattern for future entities

#### 5. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- `npm run build` passed
- App remained stable after the new slice was added

#### 6. Continuity for next block
**Status:** Passed

Validated items:
- The project now contains the first real internal product flow
- Future entity blocks can follow the same implementation pattern
- Business identity data can be reused by later flows such as quotes and public outputs

### Evidence
- New route created: `/business-profile`
- New form component created
- New local persistence helper created
- Homepage updated with feature entry link
- Successful execution of:
  - `npm run lint`
  - `npm run build`

### Final QA decision
**Approved with minor reservation**

### Notes
- The implementation is correct for this stage and respects the intended scope.
- Minor reservation: the pasted diff history included intermediate form refactors, so the final file should be visually reviewed once in the editor to ensure there is no leftover duplicate code fragment.
- This does not block progress because the technical validation already passed.


### Notes
- This block correctly established the first product-oriented structural layer of the codebase.
- The result is intentionally lightweight and appropriate for this stage.
- The project is now ready to move from structural preparation toward the first implementation-oriented domain blocks.

### Expected scope
- Review the current scaffold state
- Remove obvious starter-template leftovers
- Normalize the root shell structure
- Improve base consistency without adding features
- Keep the codebase ready for the next block

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- Domain entities
- CRUD flows
- Business logic
- Real dashboard
- Complex layouts
- State management
- Testing setup
- Docker
- CI/CD

### Acceptance criteria
- [x] Current scaffold normalized
- [x] Root shell remains minimal and correct
- [x] Clear scaffold leftovers removed
- [x] Structure cleaner than before
- [x] No out-of-scope features added
- [x] Project still runs locally
- [x] Codebase is easier to continue
- [x] Next block can start without structural confusion

### Validation summary

#### 1. Scaffold cleanup
**Status:** Passed

Validated items:
- Removed unused starter public assets
- Removed unnecessary scaffold residue files
- Replaced generic starter README with project-specific README

#### 2. Shell consistency
**Status:** Passed

Validated items:
- `app/layout.tsx` kept minimal and coherent
- `app/page.tsx` kept aligned with the intended placeholder shell
- Base shell remains clean and stable

#### 3. Repository hygiene
**Status:** Passed

Validated items:
- `.codex` added to ignore rules
- Working tree hygiene improved
- Foundation is now cleaner for future commits

#### 4. Scope compliance
**Status:** Passed

Validated items:
- No auth added
- No database added
- No business entities added
- No fake progress pages added
- No unnecessary architectural expansion introduced

#### 5. Continuity for next block
**Status:** Passed

Validated items:
- Foundation is calmer and easier to reason about
- Documentation entry point is clearer
- Next technical block can start without shell cleanup debt

### Evidence
- `npm run lint` passed
- `npm run build` passed
- `npm run dev` booted successfully
- Starter residue removed
- README normalized
- `.gitignore` improved

### Final QA decision
**Approved**

### Notes
- This block successfully completed its intended role: cleaning and stabilizing the second half of Hour 1.
- The project is now ready to enter the first real domain-oriented technical block.

### Expected scope
- Create the initial project scaffold
- Configure Next.js
- Configure App Router
- Configure TypeScript
- Configure Tailwind CSS
- Configure the shadcn/ui baseline
- Create a minimal global layout
- Create a minimal homepage
- Ensure the project runs locally
- Ensure proper Git versioning

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- Domain entities
- Business pages
- Real dashboard
- Automations
- AI
- Automated tests
- Docker
- CI/CD

### Acceptance criteria
- [x] Project created in the correct folder
- [x] Project name set to `firmus-app`
- [x] Next.js configured correctly
- [x] App Router enabled
- [x] TypeScript configured correctly
- [x] Tailwind CSS configured correctly
- [x] shadcn/ui baseline present
- [x] `app/layout.tsx` created and valid
- [x] `app/page.tsx` created and valid
- [x] `app/globals.css` created and valid
- [x] Project runs locally with `npm run dev`
- [x] Lint runs successfully
- [x] Build completes successfully
- [x] Git repository configured in the correct directory
- [x] Initial commit created successfully

### Validation summary

#### 1. Project structure
**Status:** Passed

Validated items:
- Project created in the correct directory
- Base folder structure present: `app/`, `components/`, `lib/`, `public/`
- Core files present: `package.json`, `tsconfig`, `next.config`, ESLint config
- Git repository initialized and used in the correct project directory

#### 2. Dependencies and bootstrap
**Status:** Passed with observation

Validated items:
- `npm install` completed successfully
- `npm run lint` completed successfully
- `npm run build` completed successfully
- `npm run dev` started successfully

Observation:
- The UI baseline introduced additional dependencies from the UI ecosystem beyond the strict minimum. This does not block the project, but scope discipline should be maintained in the next blocks.

#### 3. Minimal rendering
**Status:** Passed

Validated items:
- Minimal homepage created successfully
- Initial shell is simple and coherent
- Default Next.js starter page was replaced
- `layout.tsx`, `page.tsx`, and `globals.css` fulfill the minimal shell purpose

#### 4. Foundation code quality
**Status:** Passed with light reservation

Validated items:
- Base files are present
- Reusable baseline exists (`lib/utils.ts`, `components/ui/`)
- Project compiles and runs

Reservation:
- Because the bootstrap went through iterative setup adjustments, a short manual review of the base files is recommended before expanding the app further.

#### 5. Scope compliance
**Status:** Passed

Validated items:
- No authentication added
- No database added
- No Prisma added
- No domain/business entities added
- No real dashboard added
- No out-of-scope product features added

#### 6. Continuity for the next block
**Status:** Passed

Validated items:
- Project is ready to move into the second half of Hour 1
- Local setup is stable
- Git and repository state are organized
- The next block can start without structural rework

### Evidence
- Project scaffold created and running locally
- Git repository initialized correctly
- Branch configured and working tree clean
- Successful execution of:
  - `npm install`
  - `npm run lint`
  - `npm run build`
  - `npm run dev`

### Final QA decision
**Approved with minor reservation**

## Block 4 — Day 1 / Hour 4 / Clients Slice

**Block name:** Clients Minimal Implementation  
**Status:** Approved  
**Date:** 2026-04-11  
**Objective:** Implement the Clients entity as the next real product slice, allowing the user to view, create, edit, and persist clients in a minimal and disciplined way.

### Expected scope
- Create a Clients route
- Create a minimal Clients manager flow
- Show empty state when no clients exist
- Allow client creation
- Allow client editing
- Show the current clients list
- Persist clients locally in the simplest correct way for this stage
- Reuse the existing `Client` domain type

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- Services
- Quotes
- Charges
- Timeline logic
- Search
- Filters
- Pagination
- Validation libraries
- State management libraries
- Dashboards
- Automations
- AI
- Testing setup
- Docker
- CI/CD

### Acceptance criteria
- [x] A Clients route exists
- [x] Clients can be viewed
- [x] Clients can be created
- [x] Clients can be edited
- [x] Empty state is present when no clients exist
- [x] The implementation uses the `Client` domain type coherently
- [x] Local persistence works correctly for this stage
- [x] No out-of-scope features were added
- [x] The app still runs locally
- [x] `npm run lint` passed
- [x] `npm run build` passed
- [x] The project is meaningfully more product-like than before
- [x] The next blocks can build on this implementation cleanly

### Validation summary

#### 1. Product slice implementation
**Status:** Passed

Validated items:
- Added `app/clients/page.tsx`
- Added `components/clients-manager.tsx`
- Added `lib/client-storage.ts`
- Added homepage navigation entry to `/clients`

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No auth added
- No DB added
- No Prisma added
- No API routes added
- No extra entities implemented
- No fake progress screens added
- No unnecessary architectural expansion introduced

#### 3. Persistence strategy
**Status:** Passed

Validated items:
- Persistence implemented through a lightweight `localStorage` helper
- Persistence is typed against the `Client` domain model
- Normalization and null-handling are present
- Solution is appropriate for this stage
- Easy to replace later with real backend persistence

#### 4. Domain coherence
**Status:** Passed

Validated items:
- Clients implementation reuses the domain foundation
- Structure remains aligned with `lib/domain/client.ts`
- The slice follows the same implementation pattern used by Business Profile

#### 5. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- `npm run build` passed
- App remained stable after the new slice was added

#### 6. Continuity for next block
**Status:** Passed

Validated items:
- The project now contains a second real internal product flow
- Future entity blocks can reuse the same page + component + storage pattern
- Client data is now available for later quote and charge flows

### Evidence
- New route created: `/clients`
- New manager component created
- New local persistence helper created
- Homepage updated with a Clients entry link
- Successful execution of:
  - `npm run lint`
  - `npm run build`

### Final QA decision
**Approved**

## Block 5 — Day 1 / Hour 5 / Services Slice

**Block name:** Services Minimal Implementation  
**Status:** Approved  
**Date:** 2026-04-11  
**Objective:** Implement the Services entity as the next real product slice, allowing the user to view, create, edit, and persist services in a minimal and disciplined way.

### Expected scope
- Create a Services route
- Create a minimal Services manager flow
- Show empty state when no services exist
- Allow service creation
- Allow service editing
- Show the current services list
- Persist services locally in the simplest correct way for this stage
- Reuse the existing `Service` domain type

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- Quotes
- Charges
- Timeline logic
- Categories
- Tags
- Search
- Filters
- Pagination
- Validation libraries
- State management libraries
- Dashboards
- Automations
- AI
- Testing setup
- Docker
- CI/CD

### Acceptance criteria
- [x] A Services route exists
- [x] Services can be viewed
- [x] Services can be created
- [x] Services can be edited
- [x] Empty state is present when no services exist
- [x] The implementation uses the `Service` domain type coherently
- [x] Local persistence works correctly for this stage
- [x] No out-of-scope features were added
- [x] The app still runs locally
- [x] `npm run lint` passed
- [x] `npm run build` passed
- [x] The project is meaningfully more product-like than before
- [x] The next blocks can build on this implementation cleanly

### Validation summary

#### 1. Product slice implementation
**Status:** Passed

Validated items:
- Added `app/services/page.tsx`
- Added `components/services-manager.tsx`
- Added `lib/service-storage.ts`
- Added homepage navigation entry to `/services`

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No auth added
- No DB added
- No Prisma added
- No API routes added
- No extra entity flows implemented
- No fake progress screens added
- No unnecessary architectural expansion introduced

#### 3. Persistence strategy
**Status:** Passed

Validated items:
- Persistence implemented through a lightweight `localStorage` helper
- Persistence is typed against the `Service` domain model
- Canonical storage uses `basePriceInCents`
- Price input is converted from user-friendly input to domain-safe integer cents
- Solution is appropriate for this stage
- Easy to replace later with real backend persistence

#### 4. Domain coherence
**Status:** Passed

Validated items:
- Services implementation reuses the domain foundation
- Structure remains aligned with `lib/domain/service.ts`
- The slice follows the same implementation pattern used by Business Profile and Clients

#### 5. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- `npm run build` passed
- App remained stable after the new slice was added

#### 6. Continuity for next block
**Status:** Passed

Validated items:
- The project now contains a third real internal product flow
- Future quote implementation can reuse the persisted services list
- Canonical price storage reduces ambiguity for future quote totals

### Evidence
- New route created: `/services`
- New manager component created
- New local persistence helper created
- Homepage updated with a Services entry link
- Successful execution of:
  - `npm run lint`
  - `npm run build`

### Final QA decision
**Approved**

### Notes
- The implementation is correct for this stage and respects the intended scope.
- The slice is minimal, coherent, and useful.
- The project is now ready to move into the quote-oriented block.
---

## Block 6 — Day 1 / Hour 6 / Quote Engine Slice

**Block name:** Quote Engine Minimal Implementation  
**Status:** Approved  
**Date:** 2026-04-11  
**Objective:** Implement the first multi-entity product flow by allowing the user to create, edit, view, and persist quotes linked to clients and composed of quote items with optional service reuse.

### Expected scope
- Create a Quotes route
- Create a minimal Quotes manager flow
- Show empty state when no quotes exist
- Allow quote creation
- Allow quote editing
- Link a quote to a client
- Add and edit quote items
- Optionally reuse an existing service inside quote items
- Calculate subtotal, discount, and total correctly
- Persist quotes locally in the simplest correct way for this stage
- Reuse the existing Quote, QuoteItem, Client, and Service domain types

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- PDF generation
- Public quote page
- Quote approval flow
- Charges
- Timeline integration
- Reminders
- Templates
- Search
- Filters
- Pagination
- Validation libraries
- State management libraries
- Dashboards
- Automations
- AI
- Testing setup
- Docker
- CI/CD

### Acceptance criteria
- [x] A Quotes route exists
- [x] Quotes can be viewed
- [x] Quotes can be created
- [x] Quotes can be edited
- [x] Empty state is present when no quotes exist
- [x] A quote can be linked to a client
- [x] Quote items can be added and edited
- [x] Optional service reuse works coherently
- [x] Subtotal, discount, and total are calculated correctly
- [x] The implementation uses the Quote domain type coherently
- [x] Local persistence works correctly for this stage
- [x] No out-of-scope features were added
- [x] The app still runs locally
- [x] `npm run lint` passed
- [x] `npm run build` passed
- [x] The project is meaningfully more product-like than before
- [x] The next blocks can build on this implementation cleanly

### Validation summary

#### 1. Product slice implementation
**Status:** Passed

Validated items:
- Added `app/quotes/page.tsx`
- Added `components/quotes-manager.tsx`
- Added `lib/quote-storage.ts`
- Added homepage navigation entry to `/quotes`

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No auth added
- No DB added
- No Prisma added
- No API routes added
- No approval/public quote flow added
- No charges or timeline logic added
- No unnecessary architectural expansion introduced

#### 3. Persistence strategy
**Status:** Passed

Validated items:
- Persistence implemented through a lightweight `localStorage` helper
- Persistence uses normalized `{ quotes, items }` storage
- Quote and quote items are linked deterministically
- Read path normalizes and sanitizes stored data
- Solution is appropriate for this stage
- Easy to replace later with real backend persistence

#### 4. Calculation integrity
**Status:** Passed

Validated items:
- Canonical money values are stored in cents
- Item line totals are calculated from quantity and unit price
- Subtotal is calculated from item totals
- Discount is clamped to subtotal
- Total is derived correctly from subtotal minus discount

#### 5. Domain coherence
**Status:** Passed

Validated items:
- Quotes implementation reuses the domain foundation
- Structure remains aligned with `lib/domain/quote.ts`
- Clients and Services are reused as inputs instead of duplicating data models
- The slice preserves coherence across the existing entity flows

#### 6. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- `npm run build` passed
- App remained stable after the new slice was added

#### 7. Continuity for next block
**Status:** Passed

Validated items:
- The project now contains the first complete multi-entity workflow
- Future charges and timeline flows can build on stable quote data
- The system now has enough complexity to justify formal flow testing from this point onward

### Evidence
- New route created: `/quotes`
- New manager component created
- New local persistence helper created
- Homepage updated with a Quotes entry link
- Successful execution of:
  - `npm run lint`
  - `npm run build`

### Final QA decision
**Approved**

### Notes
- Manual functional validation for the Quote Engine slice was completed successfully.
- This is the first block with a validated multi-entity product flow.
- The project is now ready to move into the next implementation block with stronger confidence.

### Manual functional test results
- [x] Quotes page opens correctly
- [x] Empty state is shown when no quotes exist
- [x] A quote can be created and linked to a client
- [x] Line totals are calculated correctly
- [x] Service reuse works correctly
- [x] Subtotal is calculated correctly
- [x] Discount is applied correctly
- [x] Discount is clamped correctly
- [x] Quote saves successfully
- [x] Quote persists after reload
- [x] Existing quote can be edited
- [x] Quote/item linkage remains consistent
- [x] Quotes still work without services
- [x] Quotes fail gracefully without clients

## Block 6T — Day 2 / Cypress Baseline for Core Flows

**Block name:** Cypress E2E Baseline for Core Product Flows  
**Status:** Approved  
**Date:** 2026-04-12  
**Objective:** Establish the first automated end-to-end regression layer for the current implemented Firmus slices.

### Expected scope
- Install and configure Cypress
- Create a minimal E2E suite for the current product state
- Cover the implemented slices:
  - Home
  - Business Profile
  - Clients
  - Services
  - Quotes
- Ensure tests run successfully against the local app

### Out of scope
- Component tests
- API tests
- Visual regression tooling
- CI integration
- Coverage tooling
- Playwright
- Reporter expansion
- Testing architecture beyond the current E2E need

### Acceptance criteria
- [x] Cypress is installed and configured
- [x] Home E2E test exists and passes
- [x] Business Profile E2E test exists and passes
- [x] Clients E2E test exists and passes
- [x] Services E2E test exists and passes
- [x] Quotes E2E test exists and passes
- [x] The suite runs successfully in headless mode
- [x] No exception-suppression hack was used as a workaround
- [x] The project is now protected by a first regression layer

### Validation summary

#### 1. Cypress setup
**Status:** Passed

Validated items:
- Cypress installed successfully
- E2E structure created and usable
- Test suite runs against the local Next.js app

#### 2. Test coverage
**Status:** Passed

Validated items:
- Home smoke flow covered
- Business Profile create/edit/persist flow covered
- Clients empty state + create/edit/persist flow covered
- Services empty state + create/edit/persist flow covered
- Quotes multi-entity flow covered, including:
  - client linkage
  - manual item entry
  - service reuse
  - subtotal
  - discount
  - total
  - persistence after reload

#### 3. Stability correction
**Status:** Passed

Validated items:
- Hydration mismatch issues were corrected
- Quotes spec assertion was corrected to match implemented UI behavior
- E2E suite became stable without masking application errors

#### 4. Execution result
**Status:** Passed

Validated items:
- `npx cypress run` executed successfully
- All 5 specs passed
- Total result: 5 passing, 0 failing

### Evidence
- Successful Cypress run:
  - `business-profile.cy.ts` passed
  - `clients.cy.ts` passed
  - `home.cy.ts` passed
  - `quotes.cy.ts` passed
  - `services.cy.ts` passed

### Final QA decision
**Approved**

### Notes
- This block established the first real automated regression protection layer of the project.
- From this point onward, future slices should be validated both manually when needed and through incremental E2E coverage.

## Block 7 — Day 2 / Timeline Events Foundation

**Block name:** Timeline Events Minimal Implementation
**Status:** Approved
**Date:** 2026-04-12
**Objective:** Introduce an append-only event system to capture core product actions and establish the foundation for future timeline, automation, and summary features.

### Expected scope

* Create a TimelineEvent domain model
* Implement append-only event persistence using localStorage
* Create a minimal event creation service
* Integrate event creation into:

  * client creation
  * service creation
  * quote creation
* Ensure events are only created on creation flows (not updates)
* Keep implementation lightweight and deterministic

### Out of scope

* Timeline UI
* Timeline page
* Event filtering
* Event sorting
* Event analytics
* Automation logic
* Reminders
* AI features
* Dashboard integration
* API layer
* Database
* State management libraries
* CI/CD integration

### Acceptance criteria

* [x] TimelineEvent domain model implemented with normalized structure
* [x] Events are stored in localStorage under a dedicated key
* [x] Event storage is append-only
* [x] Client creation generates a timeline event
* [x] Service creation generates a timeline event
* [x] Quote creation generates a timeline event
* [x] No events are generated on update flows
* [x] Events persist after reload
* [x] Event order is preserved
* [x] No UI dependency introduced
* [x] No regression in existing flows
* [x] `npm run lint` passed
* [x] `npm run build` passed

### Validation summary

#### 1. Event system structure

**Status:** Passed

Validated items:

* Created `lib/domain/timeline-event.ts` with normalized event structure
* Created `lib/storage/timeline-events.ts` with safe parsing and append-only logic
* Created `lib/services/timeline.ts` for event creation orchestration
* Storage key defined as `firmus.timelineEvents`

#### 2. Functional validation

**Status:** Passed

Validated items:

* Creating a client generates a `client_created` event
* Creating a service generates a `service_created` event
* Creating a quote generates a `quote_created` event
* Events contain:

  * id
  * type
  * timestamp
  * entityId
  * entityType
* Events persist correctly after reload
* Event list grows without overwriting previous entries

#### 3. Scope compliance

**Status:** Passed

Validated items:

* No timeline UI created
* No filtering or sorting logic added
* No analytics introduced
* No automation logic introduced
* No architectural over-expansion

#### 4. Continuity for next block

**Status:** Passed

Validated items:

* The system now captures product actions as structured events
* Timeline rendering (Block 10) can be implemented without refactoring
* Future automation (Blocks 11+) can rely on event history
* The product now has a consistent behavioral memory layer

### Evidence

* LocalStorage key `firmus.timelineEvents` populated with:

  * `client_created`
  * `service_created`
  * `quote_created`
* Manual validation via DevTools Application tab
* Successful execution of:

  * `npm run lint`
  * `npm run build`
* No regression observed in existing flows

### Final QA decision

**Approved**

### Notes

* This block establishes the first event-driven foundation of the system.
* The implementation is intentionally minimal and correct for the current stage.
* This is a critical enabling layer for timeline rendering, reminders, summaries, and automation.

## Block 8 — Day 2 / Charges Slice

**Block name:** Charges Minimal Implementation  
**Status:** Approved  
**Date:** 2026-04-12  
**Objective:** Implement the Charges entity as the next real financial product slice, allowing the user to create, edit, persist, and track charges linked to clients, with optional quote relation and timeline integration.

### Expected scope
- Create a Charges route
- Create a minimal Charges manager flow
- Show empty state when no charges exist
- Allow charge creation
- Allow charge editing
- Allow marking a charge as paid
- Link a charge to a client
- Optionally link a charge to a quote
- Persist charges locally in the simplest correct way for this stage
- Reuse the existing `Charge` domain type
- Integrate timeline events for charge creation and payment transitions
- Derive overdue status at runtime without persisting it

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- Payment systems
- Installments
- Interest or fees
- Bank integrations
- Financial dashboards
- Search
- Filters
- Pagination
- Validation libraries
- State management libraries
- Automations
- AI
- Testing architecture expansion
- Docker
- CI/CD

### Acceptance criteria
- [x] A Charges route exists
- [x] Charges can be viewed
- [x] Charges can be created
- [x] Charges can be edited
- [x] Empty state is present when no charges exist
- [x] A charge must be linked to a client
- [x] A charge can optionally be linked to a quote
- [x] Charge values are stored canonically in cents
- [x] Charges persist correctly after reload
- [x] Mark as paid flow works correctly
- [x] Overdue is derived at runtime and not persisted
- [x] Timeline events are generated for:
  - `charge_created`
  - `charge_paid`
- [x] No duplicate events are generated on neutral edits
- [x] No out-of-scope features were added
- [x] The app still runs locally
- [x] `npm run lint` passed
- [x] `npm run build` passed
- [x] Existing Cypress suite continued passing
- [x] The project is meaningfully more product-like than before
- [x] The next blocks can build on this implementation cleanly

### Validation summary

#### 1. Product slice implementation
**Status:** Passed

Validated items:
- Added `app/charges/page.tsx`
- Added `components/charges-manager.tsx`
- Added `lib/charge-storage.ts`
- Added `lib/charge-status.ts`
- Added homepage navigation entry to `/charges`

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No auth added
- No DB added
- No Prisma added
- No API routes added
- No payment system added
- No installment or fee logic added
- No dashboard or analytics added
- No unnecessary architectural expansion introduced

#### 3. Persistence and domain integrity
**Status:** Passed

Validated items:
- Persistence implemented through a lightweight `localStorage` helper
- Persistence uses canonical `amountInCents`
- Charge storage safely parses invalid data without crashing
- Charge status persistence is limited to:
  - `pending`
  - `paid`
- `overdue` is correctly derived at runtime and not stored
- `createdAt` remains stable on edit
- `updatedAt` changes on update
- Charges are ordered by `updatedAt` descending

#### 4. Timeline integration
**Status:** Passed

Validated items:
- `charge_created` event generated on successful charge creation
- `charge_paid` event generated on valid pending → paid transition
- Neutral edits do not generate duplicate timeline events
- Existing timeline behavior remained stable

#### 5. Manual functional validation
**Status:** Passed

Validated items:
- Charges page opens correctly
- Empty state is shown when no charges exist
- Charges correctly require at least one client
- A charge can be created and persisted
- A charge can be edited without duplicating itself
- A charge can optionally link to a quote
- Mark as paid action works correctly
- Overdue charge displays correctly in UI
- Overdue charge remains persisted as `pending`
- Timeline events reflect charge lifecycle correctly
- Charges persist after reload

#### 6. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- `npm run build` passed
- Existing Cypress suite remained passing
- No regression observed in previous implemented flows

#### 7. Continuity for next block
**Status:** Passed

Validated items:
- The project now contains a real financial intent layer
- Financial Overview can now be derived from existing charge data
- Client-centered financial continuity is now possible
- Future reminders and automation can build on due dates and charge events

### Evidence
- New route created: `/charges`
- New manager component created
- New local persistence helper created
- New derived charge status helper created
- Homepage updated with a Charges entry link
- Manual validation completed for:
  - create
  - edit
  - paid transition
  - overdue derivation
  - persistence
  - timeline integration
- Successful execution of:
  - `npm run lint`
  - `npm run build`
- Existing Cypress suite continued passing

### Final QA decision
**Approved**

### Notes
- This block established the first real financial intent layer of the system.
- The implementation is intentionally minimal and correct for the current stage.
- The derived overdue strategy is especially important because it preserves a cleaner domain model and avoids unnecessary persisted state.
- The project is now ready to move into Block 9 — Financial Overview.


## QA Template for Future Blocks

Use this structure for the next checkpoints:

### Block [ID] — [Name]

**Status:**  
**Date:**  
**Objective:**  

#### Expected scope
- 

#### Out of scope
- 

#### Acceptance criteria
- [ ] 
- [ ] 
- [ ] 

#### Validation summary
**1. Structure / setup**  
**Status:**  

**2. Functional validation**  
**Status:**  

**3. Scope compliance**  
**Status:**  

**4. Continuity for next block**  
**Status:**  

#### Evidence
- 

#### Final QA decision
**Approved / Approved with reservations / Rejected**

#### Notes
- 