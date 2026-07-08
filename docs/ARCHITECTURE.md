# System Architecture

This document serves as the permanent technical reference for the NRT AI Operations Manager. It details the overarching architectural decisions, technology choices, and development standards governing the project.

## Project Overview
NRT AI Operations Manager is a comprehensive, scalable, and intelligent multi-tenant SaaS platform designed to manage robust enterprise operations ranging from inventory and procurement to AI-driven command systems.

## Vision
To establish an unshakeable operational backbone that seamlessly unifies human workflows with autonomous AI agents, driving intelligence, precision, and efficiency across every vertical of business operations.

## High-Level System Architecture
The platform operates as a detached, micro-service styled architecture within a single monorepo. It cleanly separates the Backend (API), the Frontend (Web UI), and shared underlying dependencies (Database, Config, Utils, Types) into distinct workspace packages, all orchestrated by Turborepo.

## Technology Stack
- **Backend**: NestJS (TypeScript)
- **Frontend**: Next.js (React, TailwindCSS)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Monorepo Manager**: Turborepo / pnpm workspaces
- **API Documentation**: Swagger (OpenAPI)

## Monorepo Structure
We leverage a `pnpm` workspace powered by Turborepo to enforce rigid boundaries between components while enabling rapid, cached builds and effortless code sharing.

### Folder Structure
```
nrt-ai-operations-manager/
├── apps/
│   ├── api/          # NestJS Backend Application
│   └── web/          # Next.js Frontend Application
├── packages/
│   ├── config/       # Shared TS/ESLint configurations
│   ├── database/     # Prisma schema, migrations, and generated client
│   ├── types/        # Shared TypeScript interfaces and enums
│   ├── ui/           # Shared React components library
│   └── utils/        # Common utility functions
├── docs/             # Permanent Project Documentation
└── docker/           # Containerization and orchestration scripts
```

## Backend Architecture (NestJS)
- **Design Pattern**: Domain-Driven Design (DDD) coupled with SOLID principles.
- **Modularity**: Every domain (e.g., `Products`, `Auth`) is strictly encapsulated within its own Module, Controller, and Service.
- **Data Transfer**: Strict `class-validator` and `class-transformer` DTOs enforce data integrity at the network boundary.
- **Global Abstractions**: Custom Exception Filters, Interceptors, and validation Pipes are applied globally to ensure uniform responses.

## Frontend Architecture (Next.js)
- **App Router**: Utilizes Next.js App Router for server-side rendering, streaming, and optimized SEO.
- **Component Design**: Atomic design principles with a highly reusable, custom UI component library imported from `packages/ui`.
- **State Management**: Lean client-side state, heavily relying on Server Components to minimize bundle sizes.

## Database Architecture (PostgreSQL + Prisma)
- **Schema Management**: Managed centrally in `packages/database`. The Prisma client is generated locally and shared dynamically across the monorepo.
- **Integrity**: Enforces rigid relational mapping, utilizing constraints, cascading (where appropriate), and high-precision types (e.g., `Decimal` for inventory thresholds).

## Authentication Architecture
- **Mechanism**: JWT (JSON Web Tokens).
- **Token Rotation**: Implements distinct short-lived Access Tokens and configurable Refresh Tokens.
- **Session Management**: Dedicated `Session` model tracking active device logins, IPs, and user agents, enabling explicit remote logouts.
- **Authorization**: Role-Based Access Control (RBAC) enforced via `@Permissions()` decorators intersecting with a global `PermissionsGuard`.

## Multi-Tenant Strategy
- **Isolation**: Tenant isolation is achieved logically via a strict `companyId` foreign key enforced across almost all core entities (Categories, Products, Users, etc.).
- **Validation**: Core service layers universally validate `companyId` matching before permitting read, write, or delete operations. 
- **Global Fallbacks**: Certain models (like `Unit`) support global defaults where `companyId` equals `null`.

## Shared Packages
Shared internal libraries eliminate code duplication:
- `@nrt-ai-workforce/database`: Provides the instantiated Prisma client.
- `@nrt-ai-workforce/types`: Centralizes complex types shared between the Next.js UI and the NestJS API.
- `@nrt-ai-workforce/config`: Standardizes Prettier, ESLint, and TypeScript settings globally.

## API Standards
- **RESTful Principles**: Resource-based URI routing.
- **Versioning**: Global URI versioning enabled (e.g., `/api/v1/resource`).
- **Standardized Responses**: Predictable JSON structures wrapped via interceptors.
- **Pagination**: Uniform generic pagination wrappers incorporating sorting, searching, and metadata.

## Coding Standards
- **Strict TypeScript**: `any` usage is prohibited unless absolutely necessary.
- **Linting & Formatting**: Enforced universally by ESLint and Prettier.
- **Documentation**: All public APIs must be documented using Swagger decorators.

## Naming Conventions
- **Files/Folders**: `kebab-case` (e.g., `create-product.dto.ts`).
- **Classes/Interfaces**: `PascalCase` (e.g., `ProductsService`).
- **Variables/Methods**: `camelCase` (e.g., `findAll`).
- **Constants/Enums**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_LIMIT`, `ProductStatus.ACTIVE`).

## Git Workflow
- **Branching**: Trunk-based development or GitHub Flow. Feature branches branch off `main` and merge back via Pull Requests.
- **Commits**: Adherence to Conventional Commits (e.g., `feat:`, `fix:`, `chore:`).
- **Hooks**: Husky enforces pre-commit linting and commit message formatting.

## Deployment Strategy
- **Containerization**: Backend and frontend services are containerized via Docker.
- **CI/CD**: GitHub Actions (or similar pipelines) automate linting, building, and deployments.
- **Orchestration**: Designed to be cloud-agnostic, supporting standard orchestrators like Kubernetes or Docker Swarm.

## Security Principles
- **Data Protection**: Sensitive data (passwords, refresh tokens) is hashed via bcrypt.
- **Audit Logging**: A central `AuditLog` table records critical `CREATE`, `UPDATE`, `DELETE`, and `RESTORE` actions.
- **Soft Deletes**: Business entities default to soft-deletes (`deletedAt` timestamps) to preserve relational integrity and prevent accidental data loss.
- **Environment Variables**: Secrets are isolated via `.env` files and never committed to source control.

## Future AI Architecture
In upcoming sprints, the system will integrate an intelligent **AI Command Center**. This layer will utilize autonomous AI agents operating natively within the monorepo, authorized via specialized system-level RBAC tokens. These agents will possess the capability to read metrics, identify anomalies, and dynamically execute multi-step workflows (e.g., intelligent reordering or anomalous stock alerts) using the exact same API endpoints designed for human users.
