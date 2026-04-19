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

## Block 9 — Day 2 / Financial Overview Slice

**Block name:** Financial Overview Minimal Implementation  
**Status:** Approved  
**Date:** 2026-04-12  
**Objective:** Implement the first simple operational financial dashboard by deriving a minimal overview from existing charge data.

### Expected scope
- Create a Financial Overview route
- Create a minimal overview summary UI
- Derive all overview values from existing charges
- Show exactly these metrics:
  - available today
  - receivable in 7 days
  - overdue amount
- Reuse the existing derived overdue logic from the Charges slice
- Keep the implementation derived-only, with no persistence of overview totals

### Out of scope
- Authentication
- Database
- Prisma
- Supabase
- Clerk
- API routes
- Server actions
- Charts
- Graphs
- Financial tables
- Detailed reports
- Filters
- Search
- Pagination
- Export features
- Trend analytics
- Reminder logic
- New domain entities
- New storage layer
- State management libraries
- Automations
- AI
- Testing architecture expansion
- Docker
- CI/CD

### Acceptance criteria
- [x] A Financial Overview route exists
- [x] The page opens correctly
- [x] The UI shows exactly three metrics:
  - available today
  - receivable in 7 days
  - overdue amount
- [x] All values are derived from existing charges at runtime
- [x] No new persistence layer was introduced
- [x] No new domain model was introduced unnecessarily
- [x] Paid charges are excluded from active receivable totals
- [x] Available today includes due-today and overdue pending charges
- [x] Receivable in 7 days includes only upcoming pending charges in the next 7 days
- [x] Overdue amount includes only charges resolved as overdue
- [x] Overdue logic remains consistent with the Charges slice
- [x] No out-of-scope dashboard complexity was added
- [x] The app still runs locally
- [x] `npm run lint` passed
- [x] `npm run build` passed
- [x] Existing Cypress suite continued passing
- [x] The next blocks can build on this implementation cleanly

### Validation summary

#### 1. Product slice implementation
**Status:** Passed

Validated items:
- Added `app/financial-overview/page.tsx`
- Added a minimal overview summary component
- Added a homepage navigation entry to `/financial-overview`
- Kept the UI limited to the three required financial metrics

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No charts added
- No graphs added
- No tables added
- No filters or search added
- No analytics expansion introduced
- No new persistence layer introduced
- No unnecessary architectural expansion introduced

#### 3. Calculation integrity
**Status:** Passed

Validated items:
- Overview values are computed from charges at runtime
- Existing charge status resolution was reused
- Available today correctly includes:
  - due-today pending charges
  - overdue pending charges
- Receivable in 7 days correctly includes only:
  - upcoming pending charges within the next 7 days
- Overdue amount correctly includes only charges resolved as overdue
- Paid charges are excluded from active receivable metrics

#### 4. Persistence discipline
**Status:** Passed

Validated items:
- No new localStorage key was created for the overview
- No derived totals were persisted
- Existing Charges storage remained the only source of truth

#### 5. Manual functional validation
**Status:** Passed

Validated items:
- Overview page opens correctly
- Empty state with zeroed values works safely when no charges exist
- Controlled charge scenarios produced the expected financial totals
- Changes in Charges are reflected in the Financial Overview
- Marking overdue charges as paid updates the overview correctly
- Existing core slices remained stable

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
- The project now has its first readable financial snapshot
- Client-centered continuity in Block 10 can build on:
  - charges
  - quotes
  - timeline events
  - financial overview logic
- Assisted operations can later reuse these derived financial signals

### Evidence
- New route created: `/financial-overview`
- Minimal overview UI created
- Homepage updated with a Financial Overview entry link
- Manual validation completed for:
  - route access
  - zero-data behavior
  - runtime-derived totals
  - overdue consistency
  - paid charge exclusion
  - cross-check with Charges
- Successful execution of:
  - `npm run lint`
  - `npm run build`
- Existing Cypress suite continued passing

### Final QA decision
**Approved**

### Notes
- This block established the first readable operational financial snapshot of the system.
- The implementation is intentionally derived-only and correct for the current stage.
- No financial aggregates were persisted, which preserves cleaner architecture and avoids duplicated state.
- The project is now ready to move into Block 10 — Client Detail and Consolidated Timeline.

## Block 10T — UI Translation and Light Branding Pass

**Block name:** UI Translation and Light Branding Stabilization  
**Status:** Approved  
**Date:** 2026-04-12  
**Objective:** Translate the current Firmus UI to pt-BR and apply a light brand pass with the provided logo and favicon assets, without changing product behavior or architecture.

### Expected scope
- Translate current user-facing UI copy to pt-BR
- Normalize visible labels, buttons, empty states, and page descriptions
- Apply the provided Firmus logo assets in the homepage
- Activate the provided favicon
- Preserve the current layout and product behavior

### Out of scope
- Full i18n system
- Language switcher
- New branding assets
- Layout redesign
- Theme system
- Domain model changes
- Persistence changes
- Routing changes
- Product behavior changes

### Acceptance criteria
- [x] User-facing UI is translated to pt-BR
- [x] Homepage branding is applied with existing assets
- [x] Favicon is active and correctly resolved
- [x] No redesign was introduced
- [x] No unrelated architecture changes were introduced
- [x] `npm run lint` passed
- [x] `npm run build` passed

### Validation summary

#### 1. Copy normalization
**Status:** Passed

Validated items:
- User-facing labels translated to Portuguese
- Buttons translated to Portuguese
- Empty states translated to Portuguese
- Metadata titles and descriptions translated where applicable
- Status labels normalized in UI presentation

#### 2. Branding insertion
**Status:** Passed

Validated items:
- Firmus logo applied in homepage hero area
- Branding kept lightweight and proportional
- No excessive logo repetition introduced

#### 3. Favicon handling
**Status:** Passed

Validated items:
- Canonical favicon strategy normalized
- App favicon resolved correctly after cleanup and refresh

#### 4. Technical validation
**Status:** Passed

Validated items:
- `npm run lint` passed
- `npm run build` passed
- No regression observed in the product flows after translation/branding

### Evidence
- Homepage updated with Firmus logo assets
- UI copy normalized to pt-BR
- Favicon updated and validated
- Successful execution of:
  - `npm run lint`
  - `npm run build`

### Final QA decision
**Approved**

### Notes
- This was a controlled transition step after Block 10.
- The implementation intentionally avoided a full i18n system.
- The product now has a more coherent local-language presentation without architectural expansion.


### Notes
- This patch closed an important operational gap by enabling deletion in the current tools.
- It also restored automated confidence after the Portuguese UI transition and the evolution of core flows.
- The project is now ready to continue with the next roadmap step on a healthier operational and testing base.

## Block 11 — Reminders
Status: Completed and approved.

### Objective
Introduce the first assisted-operations slice in Firmus through a lightweight reminders module that helps users track follow-ups and due-related actions without introducing premature automation complexity.

### Scope delivered
- Added a dedicated `Reminder` domain model with minimal, explicit fields.
- Added reminder persistence in localStorage with safe parsing, normalization, and stable writes.
- Added a reminders service layer for deterministic derived state and orchestration.
- Added `/reminders` route with Portuguese UI.
- Added reminder creation flow with optional client linkage.
- Added reminder creation flow with optional charge linkage.
- Added completion flow to move reminders from pending to done.
- Added timeline event emission for:
  - `reminder_created`
  - `reminder_completed`
- Added reminder labels to dashboard activity rendering.
- Added reminders entry to internal top navigation.
- Extended client timeline aggregation so reminder events linked by `metadata.clientId` or `metadata.chargeId` appear in the correct client detail timeline.

### Validation summary
Structural validation:
- `npm run lint` passed.
- `npm run build` passed.

Manual functional validation:
- Reminders page opened correctly.
- Manual reminder creation worked.
- Reminder with today date rendered correctly.
- Overdue reminder rendered correctly.
- Reminder linked directly to a client rendered the client name correctly.
- Reminder linked to a charge worked correctly.
- Reminder created from charge-only linkage inherited the client relationship correctly.
- Marking a reminder as completed moved it from pending to done.
- Reminder persistence remained correct after page refresh.
- Reminder events appeared correctly in dashboard activity.
- Reminder events appeared correctly in client detail timeline after the corrective patch.

Hydration investigation:
- The reported hydration warning pointed to `cz-shortcut-listen="true"` injected on `<body>`.
- This attribute was not emitted by app code.
- No hydration-specific app patch was applied because evidence indicated external DOM mutation rather than an app-side mismatch.

### Approval notes
- Block approved after the client detail timeline bug was corrected through a minimal patch in the aggregation layer.
- The reminders slice remains lightweight, deterministic, and compatible with future automation blocks.
- No backend, notifications, recurrence, or rule engine complexity was introduced.

### Follow-up note
- The current charge label shown inside reminders is functional but still minimal. It can be improved later for UX, but it does not block approval of this block.


## Block 12 — Templates
Status: Completed and approved.

### Objective
Introduce a lightweight reusable message library for repetitive operational communication inside Firmus, without adding automation, outbound delivery, or a complex template engine.

### Scope delivered
- Added a dedicated `Template` domain model.
- Added localStorage persistence with safe parsing, normalization, and stable ordering.
- Added a templates service layer for CRUD support, grouping, filtering, and preview handling.
- Added `/templates` route with Portuguese UI.
- Added template creation flow.
- Added template editing flow.
- Added active/inactive toggle flow.
- Added category-based organization for:
  - quote follow-up
  - payment reminder
  - approval prompt
  - general
- Added internal navigation entry for Templates.

### Validation summary
Structural validation:
- `npm run lint` passed.
- `npm run build` passed.

Manual functional validation:
- Templates screen opened correctly.
- Empty state rendered safely.
- Form rendered correctly.
- Template creation worked correctly.
- Category behavior worked correctly.
- Template editing worked correctly.
- Active/inactive toggle worked correctly.
- Persistence after refresh worked correctly.
- localStorage data structure was validated successfully.

Automated regression validation:
- `templates.cy.ts` passed.
- Final full Cypress run passed with all specs green.

### Approval notes
- Templates were implemented as an internal reusable library only.
- No rich-text editor, interpolation engine, outbound delivery, automation, or AI behavior was introduced.
- Block approved as the first reusable communication layer in Phase 2.


## Block 13 — Weekly Summary
Status: Completed and approved.

### Objective
Introduce a deterministic weekly operational summary derived from existing system data, focused on real pending work, financial movement, reminders, and recent activity without inventing unsupported insights.

### Scope delivered
- Added a typed weekly summary structure.
- Added a deterministic weekly summary service derived from:
  - charges
  - reminders
  - timeline events
- Added `/weekly-summary` route with Portuguese UI.
- Added explicit visible period rendering.
- Added stats/cards for:
  - received in period
  - open amount
  - overdue amount
  - pending reminders
  - completed reminders in period
- Added sections for:
  - overdue charges
  - due soon charges
  - pending reminders
  - completed reminders in period
  - recent activity
- Added deterministic highlights derived only from real data.
- Added internal navigation entry for Weekly Summary.

### Validation summary
Structural validation:
- `npm run lint` passed.
- `npm run build` passed.

Manual functional validation:
- Weekly Summary screen opened correctly.
- Visible period rendered correctly for the last 7 days.
- Main totals rendered correctly.
- Paid charges in period were reflected correctly.
- Overdue charges rendered correctly.
- Due soon charges rendered correctly.
- Pending reminders rendered correctly.
- Completed reminders in period rendered correctly.
- Recent activity rendered correctly.
- Highlights rendered correctly.
- Empty-state behavior rendered safely.

Automated regression validation:
- `weekly-summary.cy.ts` passed.
- Final full Cypress run passed with all specs green.

### Approval notes
- Weekly Summary remains a derived read model, not a persisted canonical aggregate.
- No fake insight generation, automation side effects, or analytics-heavy complexity was introduced.
- Initial Cypress assertion fragility was corrected at the test layer before final approval.

## Block 14 — Text-Based Assisted Input
Status: Completed and approved.

### Objective
Introduce a deterministic text-based assisted input flow that simulates future conversational workflows without external channels, chat gimmicks, or opaque AI behavior.

### Scope delivered
- Added a dedicated assisted input domain model with:
  - `AssistedIntentType`
  - `AssistedIntentConfidence`
  - `ParsedAssistedIntent`
  - `AssistedDraftAction`
- Added deterministic rule-based parsing in `lib/services/text-input-parser.ts`.
- Added orchestration in `lib/services/assisted-input.ts`.
- Added `/assisted-input` route with Portuguese UI.
- Added text interpretation flow with:
  - instruction input
  - “O que entendi” preview
  - extracted fields preview
  - warnings for ambiguity/incompleteness
  - safe fallback for unknown intent
- Added confirmation flow that creates real entities only after explicit user confirmation.
- Integrated confirmed reminder creation with the existing reminders slice.
- Integrated confirmed charge creation with the existing charges slice.
- Preserved the rule that parse-only actions do not create entities or timeline events.

### Validation summary
Structural validation:
- `npm run lint` passed.
- `npm run build` passed.

Manual functional validation:
- Assisted Input screen loaded correctly.
- Reminder-like instruction parsing behaved correctly.
- Charge-like instruction parsing behaved correctly.
- Ambiguous/unknown text produced safe fallback.
- Parse-only flow did not create entities before confirmation.
- Confirmed reminder creation worked through the real reminder flow.
- Confirmed charge creation worked through the real charge flow.

Automated regression validation:
- `assisted-input.cy.ts` passed.
- Final full Cypress run passed with all specs green.

### Approval notes
- Block 14 remains deterministic and inspectable.
- No WhatsApp integration, chat UI, LLM usage, probabilistic parsing, or automatic execution was introduced.
- This block successfully simulates future conversational workflows while keeping Firmus grounded in explicit confirmation and real domain actions.


## Block 14 — Text-Based Assisted Input
Status: Completed and approved.

### Objective
Introduce a deterministic text-based assisted input flow that simulates future conversational workflows without external channels, chat gimmicks, or opaque AI behavior.

### Scope delivered
- Added a dedicated assisted input domain model with:
  - `AssistedIntentType`
  - `AssistedIntentConfidence`
  - `ParsedAssistedIntent`
  - `AssistedDraftAction`
- Added deterministic rule-based parsing in `lib/services/text-input-parser.ts`.
- Added orchestration in `lib/services/assisted-input.ts`.
- Added `/assisted-input` route with Portuguese UI.
- Added text interpretation flow with:
  - instruction input
  - “O que entendi” preview
  - extracted fields preview
  - warnings for ambiguity/incompleteness
  - safe fallback for unknown intent
- Added confirmation flow that creates real entities only after explicit user confirmation.
- Integrated confirmed reminder creation with the existing reminders slice.
- Integrated confirmed charge creation with the existing charges slice.
- Preserved the rule that parse-only actions do not create entities or timeline events.

### Validation summary
Structural validation:
- `npm run lint` passed.
- `npm run build` passed.

Manual functional validation:
- Assisted Input screen loaded correctly.
- Reminder-like instruction parsing behaved correctly.
- Charge-like instruction parsing behaved correctly.
- Ambiguous/unknown text produced safe fallback.
- Parse-only flow did not create entities before confirmation.
- Confirmed reminder creation worked through the real reminder flow.
- Confirmed charge creation worked through the real charge flow.

Automated regression validation:
- `assisted-input.cy.ts` passed.
- Final full Cypress run passed with all specs green.

### Approval notes
- Block 14 remains deterministic and inspectable.
- No WhatsApp integration, chat UI, LLM usage, probabilistic parsing, or automatic execution was introduced.
- This block successfully simulates future conversational workflows while keeping Firmus grounded in explicit confirmation and real domain actions.

## Block 15 — Assisted Input MVP Interpretation

### Status
Completed and validated.

### Goal
Introduce and stabilize the first MVP version of Assisted Input ("Entrada assistida") as an interpretation layer for PT-BR natural-language instructions.

### Scope of this block
The purpose of Block 15 was not full operational execution yet.
Its purpose was to make Assisted Input useful, stable, and trustworthy as an MVP interaction layer.

That means:
- interpret natural-language instructions in PT-BR
- extract structured intent and relevant fields
- present a review layer before confirmation
- surface uncertainty through warnings
- avoid UI instability and parsing regressions

### Delivered
- Added/strengthened PT-BR natural-language parsing for assisted input.
- Improved intent recognition for operational commands such as:
  - orçamento
  - cobrança
  - lembrete / follow-up
- Improved extraction of key fields such as:
  - client
  - amount
  - title/context
  - due date
- Added a safer review step before confirmation.
- Improved warning generation for partial or uncertain interpretations.
- Added deduplication for warnings to avoid repeated rendering.
- Fixed duplicate-key rendering issues in the warnings list.
- Improved confidence behavior for complete vs partial interpretations.
- Preserved partial parsing when the instruction is incomplete.
- Kept the flow safe by avoiding premature automatic creation.

### Product result
After Block 15, Assisted Input stopped feeling like a fragile experiment and started feeling like a real MVP feature.

The feature became capable of:
- interpreting realistic PT-BR operational instructions
- showing what was understood
- exposing missing or inferred fields
- allowing the user to review the result safely before confirmation

### Validation summary
The following behavior was validated for Block 15:
- safe initial load
- no duplicate warning rendering
- no duplicate React key regression in warning lists
- useful PT-BR parsing for quote-like commands
- useful PT-BR parsing for charge-like commands
- useful PT-BR parsing for reminder / follow-up commands
- safe handling of incomplete input
- safe fallback for ambiguous input
- no confusion between day-of-month and monetary amount
- no entity creation before confirmation in interpretation-first scenarios

### Quality outcome
Block 15 was considered done when the feature achieved MVP-level trustworthiness:
- interpretation became useful
- warnings became stable
- UI stopped breaking on repeated warning states
- parsing handled realistic PT-BR input better
- review-before-confirmation became clear to the user

### Important note
Block 15 delivered the Assisted Input interpretation layer.
It did **not** yet represent full assisted execution as the primary product goal.

That next step belongs to Block 16, where the flow evolved into:
interpretation -> draft -> validation -> real entity creation -> timeline event

### Follow-up
The natural continuation after Block 15 was:
- Block 16: operationalize assisted input with real entity execution
- Block 17: consolidate shell/navigation and dashboard control-tower behavior

## Block 16 — Assisted Input Operational Execution

### Status
Completed and validated.

### Goal
Turn the Assisted Input flow from an interpretation-only UI into a real operational execution pipeline capable of creating actual entities in the correct module.

### Delivered
- Added a typed assisted-input draft layer for supported actions.
- Added explicit validation rules by action type.
- Added centralized execution routing for assisted actions.
- Enabled real creation flow for:
  - quotes
  - charges
  - reminders
- Preserved the current review/edit confirmation experience in the UI.
- Extended the assisted-input manager to support quote confirmation in addition to charge and reminder flows.
- Kept user-edited values overriding parser-inferred values before execution.
- Reused existing module creation/storage flows instead of duplicating business logic.
- Reused existing timeline/event registration already emitted by the target module logic.

### Validation summary
The following quality gates were validated for Block 16:
- assisted input continues to interpret PT-BR commands
- assisted input now creates real entities after confirmation
- charge creation works through the real storage path
- quote creation works through the real storage path
- reminder creation works through the real service path
- invalid drafts are blocked before confirmation
- timeline events are emitted after successful creation
- no regression was observed in the core application flows
- lint passed
- typecheck passed
- production build passed
- full Cypress run passed locally

### E2E coverage relevant to this block
Assisted Input suite validated:
- safe initial load
- reminder-like parsing without premature creation
- quote parsing in PT-BR with amount, client, title, and inferred due date
- charge parsing with relative due date
- follow-up reminder parsing
- unique warnings / no duplicate-key regression
- partial parsing for incomplete input
- no confusion between day-of-month and amount
- safe fallback for ambiguous input
- real reminder creation flow
- real charge creation flow
- invalid charge blocking
- real quote creation flow

### Full regression status at validation time
Cypress full run:
- 12 specs
- 34 tests
- 34 passing
- 0 failing

### Notes
- Block 16 should now be treated as operationally complete for MVP scope.
- The next step is not further parser sophistication.
- The next step is consolidating product structure through Block 17:
  - app shell
  - centralized navigation
  - sidebar on desktop
  - drawer on mobile
  - timeline-driven dashboard / control tower

## Technical Exception — Product Shell and Control Tower

### Status
Completed and validated.

### Goal
Introduce a cohesive product shell for Firmus before continuing the official public-growth roadmap blocks.

This technical exception was intentionally executed outside the official block numbering to solve a structural product issue:
the app had outgrown the previous top-navigation pattern and needed a more mature shell before continuing expansion.

### Objective
Turn Firmus from a collection of functional pages into a more cohesive operational product shell.

### Delivered
- Introduced a reusable application shell for the main product area.
- Added desktop sidebar as the primary navigation pattern.
- Added mobile top bar + drawer navigation.
- Centralized primary navigation in a single registry.
- Removed the previous overcrowded top-nav as the main structural navigation model.
- Added a shared page-header pattern for internal routes.
- Adapted major existing routes to the new shell without changing their purpose.
- Preserved the current Portuguese product direction.
- Strengthened the dashboard as a control-tower experience.
- Added timeline-based recent activity reading for the dashboard.
- Added real operational summary cards and upcoming-action visibility.
- Preserved local persistence and existing module flows.

### Functional result
After this technical exception, Firmus now behaves more like a real product shell and less like a set of disconnected tools.

The current shell now provides:
- desktop sidebar navigation
- mobile drawer navigation
- centralized navigation source of truth
- consistent page framing across main routes
- dashboard with real operational visibility
- recent activity based on persisted timeline events
- upcoming actions derived from real stored data

### Validation summary
The following behavior was validated successfully:
- app shell renders correctly
- desktop sidebar navigation is visible and usable
- mobile drawer opens and closes correctly
- major routes remain reachable inside the shell
- dashboard renders recent activity from real stored data
- dashboard renders upcoming actions from real stored data
- no route-level regression was observed in core product areas
- no typecheck regression
- no lint regression
- build passed
- full local Cypress run passed

### Cypress result at validation time
Full local run:
- 12 specs
- 36 tests
- 36 passing
- 0 failing

Included relevant validation for:
- shell rendering
- mobile drawer behavior
- recent timeline activity rendering
- navigation reachability across core routes
- all prior core product flows still passing

### Product notes
This exception should be treated as completed and stable enough for the MVP continuation path.

However, before starting the official Block 17, the following visual polish items were intentionally left as next-step refinements:
- standardize remaining mixed language labels to full PT-BR
- improve sidebar contrast / legibility slightly
- strengthen CTA/status emphasis in “Próximas ações”
- improve visual hierarchy in “Atividades recentes”
- review whether the small lower-left helper card should remain or be removed

### Final QA decision
Approved.

### Continuation rule
After visual polish refinements are applied, the project should return to the official roadmap flow starting from:
- Block 17 — Premium Quote PDF


## Block 17 — Premium Quote PDF
Status: Approved

### Scope delivered
- Implemented the premium printable/PDF quote surface at `/public/quotes/[publicId]/pdf`
- Reused the same public quote rendering foundation instead of creating a parallel rendering system
- Added print-oriented document behavior and premium document presentation
- Kept routes thin and avoided premature backend complexity

### Validation performed
- PDF route rendered correctly with the same canonical quote data used by the public route
- Page-only controls were absent on the PDF-oriented surface where appropriate
- Money fidelity was validated across:
  - line items
  - subtotal
  - discount
  - final total
- Public document remained isolated from the internal shell
- Invalid id handling remained safe
- Optional missing fields rendered without breaking the document
- Final full Cypress run passed with all specs green:
  - 13 specs
  - 40 tests
  - 0 failures

### QA verdict
Approved. Block 17 is complete, validated, and safe. The premium public quote/PDF layer is now part of the validated product surface.

### Block 18 — Quote Approval Actions
Status: Completed and approved.

Delivered:
- lightweight public quote approval action
- dedicated quote approval orchestration service
- quote approval persistence with:
  - status transition to approved
  - approvedAt metadata
- timeline event emission for:
  - quote_approved
- approved-state reflection on the public quote page
- internal Quotes entry points for:
  - Abrir página pública
  - Abrir PDF premium
- Cypress coverage for public approval flow and internal public/PDF entry points

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run
- `npm run lint` passed
- `npm run build` passed

Notes:
- Block 18 was implemented on top of the existing Block 17 public quote foundation.
- The PDF route remained document-only.
- No signature, payment, auth, client portal, or broad backend expansion was introduced.
- Approval emits `quote_approved` only on a real approval transition.
- Canonical monetary logic remained unchanged.

### Block 19 — Basic Bio Link
Status: Completed and approved.

Delivered:
- public bio presenter
- thin public bio route
- public bio page
- Business Profile as source of truth for the public page
- public-shell isolation for `/public/bio`
- internal entry point in Business Profile:
  - Abrir página pública
- WhatsApp CTA derived from stored business profile data when available
- Cypress coverage for:
  - public bio rendering
  - missing optional fields
  - internal entry point visibility

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run
- `npm run lint` passed
- `npm run build` passed

Notes:
- The public bio page was implemented as a minimal professional identity surface, not as a site builder or CMS.
- Business Profile remained the only source of truth.
- No backend, auth, analytics, SEO tooling, or multi-page public website was introduced.
- The block stayed aligned with the public-growth layer and reused the public-shell pattern established in previous public surfaces.

### Block 20 — Public Touchpoint Polish
Status: Completed and approved.

Delivered:
- shared public surface shell
- shared public status card
- shared public CTA row
- consolidated public visual language for:
  - public quote page
  - premium quote PDF
  - public quote approval layer
  - public bio page
- unified public spacing, card hierarchy, heading rhythm, and fallback treatment
- improved public approval-state presentation
- improved public loading and unavailable states
- preserved public-shell isolation
- Cypress validation over the polished public surfaces

Validation:
- manual QA approved
- Cypress coverage remained green after the polish pass
- included in final all-green full suite run
- `npm run lint` passed
- `npm run build` passed

Notes:
- Block 20 was implemented as a public-surface consolidation pass, not as a domain-expansion block.
- No new business rules, approval logic, persistence layer, backend infrastructure, or CMS/site-builder behavior were introduced.
- Quote page remained document-centered.
- PDF route remained document-only.
- Public bio page remained minimal and professional.

### Block 21 — Automation Rules Foundation
Status: Completed and approved.

Delivered:
- automation rule domain model
- automation rule storage helper
- automation rule service
- automation rule evaluator
- internal automation rules route
- automation rules manager UI
- navigation entry for automation rules
- deterministic evaluation for:
  - timeline-event triggers
  - derived operational conditions
- inspectable match output
- Cypress coverage for:
  - rule creation
  - persistence
  - activation/deactivation
  - deterministic evaluation

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run
- `npm run lint` passed
- `npm run build` passed

Notes:
- Block 21 was implemented as a deterministic automation foundation, not as a hidden execution engine.
- No scheduler, queue, worker, backend expansion, AI decision-making, or workflow builder was introduced.
- The block prepared continuity for Block 22 without prematurely executing automatic reminder creation.
- Evaluation remained explicit, inspectable, and based on real events and real derived conditions.

### Block 22 — Automatic Reminder Creation
Status: Completed and approved.

Delivered:
- automation rule executor
- automation execution-log storage for deterministic deduplication
- real reminder creation for supported automation-rule matches
- event-based automatic execution for:
  - charge_created
  - charge_paid
  - quote_approved
- controlled derived-condition execution through explicit match execution
- minimal reminder source metadata for automation origin
- timeline integration with `reminder_created` only on real reminder creation
- execution summary inside Automation Rules UI
- automation-origin badge inside Reminders UI
- Cypress coverage for:
  - event-based automatic reminder creation
  - duplicate protection
  - inactive-rule safeguards
  - preview/no-op action safeguards
  - persistence after reload

Validation:
- manual QA approved
- Cypress coverage added and approved
- included in final all-green full suite run
- `npm run lint` passed
- `npm run build` passed

Notes:
- Block 22 was implemented as a deterministic execution layer on top of the Block 21 automation foundation.
- Reminder creation remained inside the real reminders slice.
- Duplicate protection was implemented through execution fingerprints, not UI heuristics.
- No scheduler, queue, worker, backend expansion, outbound channel, or AI decision layer was introduced.
- The block did not consume Block 23 or later scope.

### Block 23 — Simple Reactivation Radar
**Status:** Completed  
**Objective:** Identify inactive clients and support revenue recovery.

**Delivered:**
- reactivation radar derived domain model
- central reactivation radar service
- deterministic eligibility computation from:
  - clients
  - quotes
  - charges
  - reminders
  - timeline events
- explicit opportunity classification with:
  - `win_back`
  - `stalled_follow_up`
- visible reason labeling for surfaced candidates
- conservative exclusion rules for:
  - recent activity
  - active collection/payment follow-up
  - equivalent active follow-up reminder
  - weak or non-meaningful commercial history
- deterministic priority ordering
- dedicated internal route:
  - `/reactivation-radar`
- internal navigation entry:
  - `Radar de reativação`
- lightweight manager UI with:
  - Todos filter
  - Win-back filter
  - Follow-up filter
  - empty state
  - candidate list
  - visible inactivity context
  - open-client CTA
  - create-reactivation-reminder CTA
- reminder creation reusing the existing reminder infrastructure
- duplicate-equivalent reminder protection using deterministic fingerprint/context checks
- no dedicated persistence layer for the radar
- Cypress coverage for:
  - empty state
  - win-back detection
  - stalled follow-up detection
  - exclusion of recent activity
  - exclusion of already-covered follow-up cases
  - exclusion of active collection cases
  - reminder creation from radar
  - reminder persistence after reload
  - deterministic ordering
  - navigation to client detail

### Validation summary

#### 1. Product behavior
**Status:** Passed

Validated items:
- Radar renders as an internal operational surface
- Only two opportunity kinds are surfaced:
  - win_back
  - stalled_follow_up
- Each surfaced item explains why it appears
- Candidate prioritization feels deterministic and coherent
- Radar remains lightweight and action-oriented

#### 2. Scope discipline
**Status:** Passed

Validated items:
- No backend or API routes introduced
- No auth or database work introduced
- No AI behavior introduced
- No outbound automation introduced
- No analytics dashboard or chart layer introduced
- No dedicated radar storage introduced
- No unrelated refactor introduced

#### 3. Reminder integration
**Status:** Passed

Validated items:
- Reactivation reminder is created through the real reminder flow
- Existing reminder infrastructure was reused
- Duplicate-equivalent reminder creation is blocked safely
- Reminder creation removes or neutralizes the surfaced candidate as expected
- Existing timeline/reminder behavior remained coherent

#### 4. Technical validation
**Status:** Passed

Validated items:
- Local lint validation passed
- Manual QA approved
- Full local Cypress suite passed
- Dedicated radar spec passed with 10 green tests
- Full suite finished green with 17 specs and 57 tests

### Evidence
- New internal route for reactivation radar added
- Navigation entry added to the internal shell
- Derived radar service implemented with conservative eligibility rules
- No new persistence layer introduced for radar state
- Reminder creation integrated through existing services
- Full Cypress run green, including `reactivation-radar.cy.ts`

### Final QA decision
**Approved**

### Notes
- Block 23 correctly extends the automation layer without turning Firmus into a CRM or analytics product.
- The implementation stayed deterministic, explainable, and small.
- This block strengthens operational leverage while preserving scope discipline for the next roadmap step.

### Block 24 — Security & LGPD Foundation
**Status:** Completed  
**Objective:** Establish the minimum security and privacy foundation required before real go-live exposure.

**Delivered:**
- minimal owner authentication flow
- explicit login page
- logout flow with redirect behavior corrected
- signed session model with secure cookie handling
- private/public route boundary enforcement
- protected internal routes by default
- explicit public route allowlist for:
  - `/login`
  - `/public/bio`
  - `/public/quotes/*`
- initial server-side trust boundary for sensitive security/privacy actions
- protected internal endpoints for privacy foundation
- centralized environment/security baseline
- secret/env validation foundation
- minimal security audit domain and append-oriented service
- audited security-sensitive actions for:
  - login success
  - login failure
  - logout
  - denied private route access
  - denied private API access
  - privacy review registration
  - security config error
- privacy/LGPD foundation domain and service
- internal privacy foundation status surface in Business Profile
- minimal protected bootstrap/status validation flow
- Cypress coverage for:
  - unauthenticated redirect from private routes
  - valid login
  - invalid login
  - protected route access after authentication
  - logout invalidation
  - public route accessibility without authentication
  - public route isolation from internal shell
  - protected privacy review action
  - fail-safe bootstrap status
  - security audit event generation
  - privacy foundation status load
  - public/private separation regression

### Validation summary

#### 1. Authentication and session boundary
**Status:** Passed

Validated items:
- Internal routes now require authentication
- Valid login flow works correctly
- Invalid login fails safely
- Logout invalidates private access
- Redirect behavior after logout is correct

#### 2. Public vs private separation
**Status:** Passed

Validated items:
- Explicit public routes remain reachable without auth
- Private routes redirect correctly when unauthenticated
- Public routes do not render the internal shell
- No accidental exposure of internal UI on public surfaces

#### 3. Security/privacy foundation
**Status:** Passed

Validated items:
- Security audit foundation records expected events
- Privacy/LGPD foundation status loads correctly
- Sensitive privacy review action is protected server-side
- Environment/security bootstrap behavior is covered
- Business Profile now exposes a minimal internal privacy/security surface

#### 4. Scope discipline
**Status:** Passed

Validated items:
- No RBAC matrix introduced
- No SSO/OAuth/MFA introduced
- No full compliance center introduced
- No full migration of all product data to backend introduced
- No unrelated architecture refactor introduced

#### 5. Technical validation
**Status:** Passed

Validated items:
- Manual QA approved
- Local Cypress suite fully green
- `security-foundation.cy.ts` passed completely
- Full local suite finished green with 18 specs and 69 tests

### Evidence
- Authentication/session flow introduced
- Protected route boundary introduced
- Security/privacy foundations added
- Public/private separation validated
- Full Cypress run green with 18 specs / 69 tests

### Final QA decision
**Approved**

### Notes
- Block 24 establishes the minimum serious trust boundary for the MVP.
- It does not close all future go-live obligations by itself, but it correctly creates the technical and operational foundation for the remaining security, logs, observability, and privacy work.
- The next official step is Block 25 — Activity Logs.

### Block 25 — Activity Logs
**Status:** Completed  
**Objective:** Track important product actions internally.

**Delivered:**
- internal Activity Logs page
- protected internal route:
  - `/activity-logs`
- protected internal API endpoint:
  - `/api/internal/activity-logs`
- explicit activity log domain model with:
  - category
  - status
  - actor
  - entity reference
  - readable message
  - timestamp
- activity log repository reusing the server-side audit source introduced in Block 24
- activity log service with:
  - normalization from audit records
  - PT-BR readable messages
  - reverse chronological ordering
  - category filtering
  - simple text search
  - limit/hasMore behavior
- internal navigation entry:
  - `Logs de atividade`
- Activity Logs UI with:
  - page header
  - category filter
  - text search
  - reverse chronological feed
  - empty state
  - load more behavior
  - actor/entity context
  - status/category badges
- helper coverage for:
  - category mapping
  - message formatting
  - status mapping
  - text search
  - reverse sorting
  - filtering
- integration coverage for:
  - protected read access
  - append/read behavior over the audit-backed source
  - normalization into ActivityLogEntry shape
  - pagination/limit behavior
  - filtered server-side reads
- visible flow coverage for:
  - route access
  - empty state
  - rendering records
  - category filter
  - text search
  - reverse chronological order
  - auth protection
  - navigation entry behavior

### Validation summary

#### 1. Product behavior
**Status:** Passed

Validated items:
- Activity Logs page loads as a protected internal surface
- Feed is readable and useful in PT-BR
- Logs are shown in reverse chronological order
- Filters and text search work as expected
- Empty state is safe and coherent

#### 2. Architecture and source-of-truth
**Status:** Passed

Validated items:
- Logs are read from a server-side protected source
- Block 25 reuses the Block 24 audit foundation instead of creating a conflicting source
- Activity trail remains append-oriented
- No editable/deletable UI was introduced

#### 3. Scope discipline
**Status:** Passed

Validated items:
- No observability dashboard introduced
- No alerting/metrics/charts introduced
- No export/reporting layer introduced
- No RBAC or unrelated auth expansion introduced
- No unrelated feature refactor introduced

#### 4. Technical validation
**Status:** Passed

Validated items:
- lint/build validated during implementation
- manual QA approved
- helper/unit coverage added
- API/integration coverage added
- visible Cypress coverage added
- block approved after final test pass confirmation

### Evidence
- new internal page `/activity-logs`
- new protected API `/api/internal/activity-logs`
- server-side repository/service integration with Block 24 audit foundation
- search/filter/order behaviors implemented
- navigation entry added
- focused test coverage added for helpers, API, and visible flow

### Final QA decision
**Approved**

### Notes
- Block 25 correctly transforms the Block 24 audit foundation into an operator-readable activity trail.
- This block strengthens traceability and prepares the product well for Block 26 — Observability and Stability.

### Block 26 — Observability and Stability
Status: Approved

Objective:
Add a minimal observability/stability baseline that reduces operational blindness, improves recovery confidence, and keeps scope narrow.

What was implemented:
- Protected internal observability endpoints:
  - `GET /api/internal/observability/health`
  - `GET /api/internal/observability/backup`
  - `POST /api/internal/observability/restore`
- Dedicated orchestration service in `lib/services/observability-stability.ts`
- Domain/helper layer for health reports, backup envelope validation, backup summaries, and controlled failures in `lib/domain/observability-stability.ts`
- Controlled failure responses with safe `OBS_*` codes
- Minimal operational runbook in `docs/BLOCK_26_RUNBOOK.md`
- New automated coverage for:
  - observability/stability integration API flow
  - observability/stability helper logic

Architecture validation:
- Routes remained thin and protected behind existing auth boundaries
- Observability logic was centralized in `lib/services`
- Domain-safe helper/types were isolated from UI
- No dashboard/admin UI was introduced
- No scope drift into unrelated product slices
- No mutation of timeline semantics
- No mutation of activity log semantics beyond what already existed

Validation performed:
- `npm run lint`
- Automated tests for the block
- Full regression validation completed successfully
- Manual QA completed for:
  - protected access behavior
  - healthy/degraded signal readability
  - backup generation
  - restore dry-run behavior
  - applied restore behavior
  - controlled failure response for invalid payload
  - no regression in protected/internal flows

Manual QA checklist completed:
- Internal authenticated health endpoint responds correctly
- Health output distinguishes healthy vs degraded state safely
- Backup endpoint returns valid backup envelope and summary
- Restore endpoint supports `dryRun: true` safely
- Restore endpoint applies valid restore correctly
- Invalid restore payload returns controlled failure response
- Existing protected/internal flows remain stable after implementation

Approval notes:
- Block 26 delivered the intended minimum observability/stability baseline without overbuilding.
- Recovery confidence improved through backup/restore path and post-restore verification.
- The system is easier to inspect and reason about operationally than before this block.

Files added or modified:
- `app/api/internal/observability/health/route.ts`
- `app/api/internal/observability/backup/route.ts`
- `app/api/internal/observability/restore/route.ts`
- `lib/services/observability-stability.ts`
- `lib/domain/observability-stability.ts`
- `cypress/e2e/observability-stability-api.cy.ts`
- `cypress/e2e/observability-stability-helpers.cy.ts`
- `docs/BLOCK_26_RUNBOOK.md`

Verdict:
Approved

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