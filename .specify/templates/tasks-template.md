---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `src/app/` for pages/routes, `src/features/` for feature modules
- **Components**: `src/components/` for shared, `src/features/[name]/components/` for feature-specific
- **Services**: `src/lib/` for shared, `src/features/[name]/services/` for feature-specific
- **Tests**: Colocated with source (`*.test.tsx`) or `__tests__/` for E2E
- Paths shown below assume Next.js structure per constitution

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Next.js project with TypeScript strict mode
- [ ] T002 Configure Tailwind CSS and base styles
- [ ] T003 [P] Setup ESLint + Prettier with pre-commit hooks
- [ ] T004 [P] Configure Vitest for unit/component testing
- [ ] T005 [P] Configure Playwright for E2E testing
- [ ] T006 Create base folder structure per constitution (src/app, src/features, src/lib, src/components, src/types)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T007 Setup Zustand store structure with typed slices
- [ ] T008 [P] Configure React Query (TanStack Query) with provider
- [ ] T009 [P] Setup API client layer in src/lib/api/
- [ ] T010 Create base layout and navigation in src/app/layout.tsx
- [ ] T011 [P] Configure environment variables and config/ structure
- [ ] T012 Setup shared types in src/types/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Component test for [component] in src/features/[feature]/components/[name].test.tsx
- [ ] T014 [P] [US1] E2E test for [user journey] in **tests**/e2e/[name].spec.ts

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create feature types in src/features/[feature]/types.ts
- [ ] T016 [P] [US1] Create [Entity] service in src/features/[feature]/services/[service].ts
- [ ] T017 [US1] Implement feature components in src/features/[feature]/components/
- [ ] T018 [US1] Create feature hooks in src/features/[feature]/hooks/
- [ ] T019 [US1] Implement page/route in src/app/[route]/page.tsx
- [ ] T020 [US1] Export public API from src/features/[feature]/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T021 [P] [US2] Component test for [component] in src/features/[feature]/components/[name].test.tsx
- [ ] T022 [P] [US2] E2E test for [user journey] in **tests**/e2e/[name].spec.ts

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create feature types in src/features/[feature]/types.ts
- [ ] T024 [US2] Implement [Service] in src/features/[feature]/services/[service].ts
- [ ] T025 [US2] Implement feature components in src/features/[feature]/components/
- [ ] T026 [US2] Integrate with shared components if needed (via props, not direct feature imports)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T027 [P] [US3] Component test for [component] in src/features/[feature]/components/[name].test.tsx
- [ ] T028 [P] [US3] E2E test for [user journey] in **tests**/e2e/[name].spec.ts

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create feature types in src/features/[feature]/types.ts
- [ ] T030 [US3] Implement [Service] in src/features/[feature]/services/[service].ts
- [ ] T031 [US3] Implement feature components in src/features/[feature]/components/

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring (ensure SRP compliance)
- [ ] TXXX Performance optimization (Lighthouse audit)
- [ ] TXXX [P] Additional unit tests in colocated test files
- [ ] TXXX Accessibility audit and fixes
- [ ] TXXX Run `next build` and verify no type errors
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Component test for [component] in src/features/[feature]/components/[name].test.tsx"
Task: "E2E test for [user journey] in __tests__/e2e/[name].spec.ts"

# Launch all independent tasks for User Story 1 together:
Task: "Create feature types in src/features/[feature]/types.ts"
Task: "Create [Service] in src/features/[feature]/services/[service].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Test-First per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Constitution compliance**: Ensure no cross-feature imports (Principle II)
- **SRP**: Each file should have single responsibility (Principle I)
- **TypeScript**: All code must compile under strict mode (Principle III)
