# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ChainBooks uses a standardized Next.js tech stack per the constitution.
  Override only if feature requires deviations (must be justified).
-->

**Language/Version**: TypeScript 5.x (strict mode)
**Framework**: Next.js 14.x (App Router)
**Primary Dependencies**: React 18, Zustand, React Query (TanStack Query), Tailwind CSS
**Storage**: [e.g., PostgreSQL, Prisma ORM, or N/A - NEEDS CLARIFICATION if applicable]
**Testing**: Vitest (unit/component), Playwright (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Next.js App Router (monolithic frontend with API routes)
**Performance Goals**: [domain-specific, e.g., LCP < 2.5s, TTI < 3s, or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., SSR required, offline-capable, or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 10k users, 50 screens, or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                 | Requirement                                         | Status |
| ------------------------- | --------------------------------------------------- | ------ |
| I. Modular Architecture   | Feature is self-contained with explicit boundaries  | ☐ Pass |
| II. Loose Coupling        | No cross-feature imports; uses contracts/interfaces | ☐ Pass |
| III. TypeScript Strict    | All code compiles under strict mode                 | ☐ Pass |
| IV. Component Composition | UI follows presentational/container split           | ☐ Pass |
| V. Test-First             | Test strategy defined before implementation         | ☐ Pass |
| VI. Simplicity & YAGNI    | No premature abstractions; complexity justified     | ☐ Pass |

**Violations requiring justification**: [List any violations with rationale in Complexity Tracking section]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Next.js App Router Structure (DEFAULT for ChainBooks)
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (auth)/             # Route groups for auth pages
│   ├── (dashboard)/        # Route groups for dashboard
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── features/               # Feature modules (self-contained)
│   └── [feature]/
│       ├── components/     # Feature-specific components
│       ├── hooks/          # Feature-specific hooks
│       ├── services/       # Feature-specific business logic
│       ├── types.ts        # Feature-specific types
│       └── index.ts        # Public API of the feature
├── lib/                    # Shared utilities & services
│   ├── api/                # API client layer
│   ├── hooks/              # Shared hooks
│   └── utils/              # Pure utility functions
├── components/             # Shared UI components (design system)
│   ├── atoms/              # Basic building blocks (Button, Input)
│   ├── molecules/          # Composed components (FormField, Card)
│   └── organisms/          # Complex components (Header, Sidebar)
├── types/                  # Shared type definitions
└── config/                 # App configuration

# Tests (colocated + root level)
├── __tests__/              # E2E and integration tests
│   ├── e2e/
│   └── integration/
└── [Feature tests colocated with source files as *.test.tsx]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
