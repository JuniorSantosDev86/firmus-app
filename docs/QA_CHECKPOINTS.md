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

### Notes
- The block successfully achieved its purpose: establishing the initial technical foundation of the project.
- The current state is stable enough to continue safely into the next execution block.
- Recommendation: proceed to the second half of Hour 1 while maintaining tight scope control.

---

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