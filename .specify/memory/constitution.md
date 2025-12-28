<!--
SYNC IMPACT REPORT
==================
Version Change: 0.0.0 → 1.0.0 (MAJOR: Initial constitution ratification)

Modified Principles: N/A (initial version)

Added Sections:
  - Core Principles (I-VI)
  - Technology Stack
  - Development Workflow
  - Governance

Removed Sections: N/A (initial version)

Templates Requiring Updates:
  ✅ plan-template.md - Compatible (Constitution Check section exists)
  ✅ spec-template.md - Compatible (Requirements align with principles)
  ✅ tasks-template.md - Compatible (Phase structure supports modularity)

Follow-up TODOs: None
-->

# ChainBooks Constitution

## Core Principles

### I. Modular Architecture (NON-NEGOTIABLE)

Every feature MUST be implemented as a self-contained module with explicit boundaries.

- **Single Responsibility**: Each module MUST have exactly one reason to change. A component, hook, or service MUST do one thing well.
- **Explicit Dependencies**: All dependencies MUST be explicitly declared via imports or dependency injection. No hidden global state.
- **Replaceable by Design**: Any module MUST be replaceable without cascading changes. Use interfaces/types to define contracts between modules.
- **Feature Isolation**: Features MUST be organized in feature folders (`/features/[feature-name]/`) containing their own components, hooks, services, and types.

**Rationale**: Modularity enables incremental deprecation and improvement. When a module is self-contained, it can be rewritten, replaced, or removed without destabilizing the system.

### II. Loose Coupling (NON-NEGOTIABLE)

Cross-cutting concerns MUST be mediated through well-defined contracts, not direct imports.

- **No Cross-Feature Imports**: Features MUST NOT import directly from other features. Shared logic MUST live in `/lib/` or `/shared/`.
- **Event-Driven Communication**: Features that need to communicate MUST use events, callbacks, or a shared state layer (e.g., Zustand store slices) rather than direct function calls.
- **API Boundaries**: Backend interactions MUST go through a dedicated API layer (`/lib/api/`). Components MUST NOT make fetch calls directly.
- **Type Contracts**: Shared types MUST be defined in `/types/` and versioned. Breaking type changes require MAJOR version bump.

**Rationale**: Loose coupling ensures that changes in one part of the app don't ripple unpredictably. This is essential for long-term maintainability and team velocity.

### III. TypeScript Strict Mode

All TypeScript code MUST compile under strict mode with zero type errors.

- **No `any` Types**: Use of `any` is prohibited except in explicitly justified escape hatches (must be documented inline).
- **Explicit Return Types**: All exported functions MUST have explicit return type annotations.
- **Null Safety**: Use strict null checks. Handle `null` and `undefined` explicitly.
- **Type Inference for Locals**: Local variables may use type inference when the type is obvious.

**Rationale**: Strict typing catches errors at compile time, reduces runtime bugs, and serves as living documentation for the codebase.

### IV. Component Composition

UI components MUST follow a composable, layered architecture.

- **Presentational vs Container**: Distinguish between presentational components (UI only, no business logic) and container components (data fetching, state management).
- **Atomic Design Principles**: Organize components as atoms → molecules → organisms → templates → pages.
- **Props Over Context**: Prefer explicit props passing over React Context for component-level dependencies. Context SHOULD be reserved for truly global concerns (theme, auth, i18n).
- **Server Components by Default**: In Next.js App Router, components MUST be Server Components unless they require client-side interactivity (use `"use client"` directive explicitly).

**Rationale**: Composable components are easier to test, reuse, and reason about. Clear boundaries between presentation and logic enable UI iterations without business logic changes.

### V. Test-First Development

Tests MUST be written before or alongside implementation, not as an afterthought.

- **Unit Tests for Logic**: All business logic in `/lib/` and `/features/*/services/` MUST have unit tests.
- **Component Tests for UI**: Interactive components MUST have component tests (React Testing Library or Playwright Component Testing).
- **E2E for Critical Paths**: User-critical flows (auth, checkout, core features) MUST have E2E tests.
- **Test File Colocation**: Test files MUST be colocated with the code they test (e.g., `Button.tsx` → `Button.test.tsx`).

**Rationale**: Tests provide confidence for refactoring and deprecation. You cannot safely replace a module if you cannot verify its behavior.

### VI. Simplicity & YAGNI

Prefer the simplest solution that solves the current problem.

- **No Premature Abstraction**: Do not abstract until you have at least 3 concrete use cases.
- **Delete Over Deprecate**: If code is unused, delete it. Version control preserves history.
- **Explicit Over Clever**: Write code that is obvious to read, even if it's slightly more verbose.
- **Justify Complexity**: Any pattern beyond basic functions/components MUST be justified in PR description.

**Rationale**: Unnecessary complexity is the primary source of technical debt. Simple code is easier to understand, maintain, and replace.

## Technology Stack

The following technologies are mandated for this project:

| Layer           | Technology            | Version/Notes                                          |
| --------------- | --------------------- | ------------------------------------------------------ |
| Framework       | Next.js               | App Router (14.x+)                                     |
| Language        | TypeScript            | Strict mode enabled                                    |
| Styling         | Tailwind CSS          | With CSS Modules for component encapsulation           |
| State           | Zustand / React Query | Zustand for client state, React Query for server state |
| Testing         | Vitest + Playwright   | Unit/component + E2E                                   |
| Linting         | ESLint + Prettier     | Enforced via pre-commit hooks                          |
| Package Manager | pnpm                  | Preferred for workspace support                        |

**Stack Changes**: Introducing a new framework, library, or major dependency REQUIRES:

1. Constitution amendment proposal
2. Migration plan with rollback strategy
3. Team approval

## Development Workflow

### Code Organization

```
src/
├── app/                    # Next.js App Router pages & layouts
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
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── types/                  # Shared type definitions
└── config/                 # App configuration
```

### Quality Gates

Before any code is merged:

1. **Type Check**: `tsc --noEmit` MUST pass with zero errors
2. **Lint**: `eslint . --max-warnings 0` MUST pass
3. **Format**: Code MUST be formatted with Prettier
4. **Tests**: All tests MUST pass; coverage MUST NOT decrease
5. **Build**: `next build` MUST complete successfully

### Deprecation Process

When deprecating a module:

1. Mark with `@deprecated` JSDoc tag including migration path
2. Add console warning in development mode
3. Create migration guide in `/docs/migrations/`
4. Set removal target (minimum 2 minor versions)
5. Remove only after all usages are migrated

## Governance

This constitution is the authoritative source for architectural decisions in ChainBooks.

- **Supremacy**: This constitution supersedes all other development guidelines, blog posts, or personal preferences.
- **Compliance**: All PRs MUST be reviewed for constitution compliance. Violations MUST be resolved before merge.
- **Amendments**: Proposed changes MUST include rationale, impact analysis, and migration plan. Changes require documented approval.
- **Version Policy**:
  - MAJOR: Principle removal or fundamental redefinition
  - MINOR: New principle, section, or material expansion
  - PATCH: Clarifications, typo fixes, non-semantic changes

**Version**: 1.0.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2025-12-27
