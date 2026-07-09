# Changelog

All notable changes to this project will be documented in this file.
## [Sprint 9] - Dashboard & Business Intelligence - 2026-07-09
### Added
- Created a robust schema-driven Dashboard Engine allowing users to define Dashboards and Dashboard Widgets via REST APIs.
- Implemented Dynamic Analytics Aggregate APIs serving real-time statistics for KPI Summaries, Inventory, Procurement, Warehouses, Workflows, and Notifications.
- Extracted and safely guarded analytics endpoints behind robust `JwtAuthGuard` and `PermissionsGuard` (RBAC) with complete Tenant Isolation.
- Added comprehensive Swagger documentation across the `dashboards` and `analytics` modules.
- Deployed system audit logging for `DASHBOARD_VIEWED` and `ANALYTICS_GENERATED` to trace executive-level data reads.

## [Sprint 8] - Notification & Event Center - 2026-07-09
### Added
- Integrated `@nestjs/event-emitter` to serve as the unified internal communication bus across the system.
- Created `NotificationsModule` providing CRUD APIs, multi-status types (INFO, SUCCESS, ERROR, WARNING) and priority levels.
- Designed `NotificationProvider` generic architecture and implemented `InAppNotificationProvider`.
- Built an immutable `ActivitiesModule` serving centralized user and system activity feeds.
- Automated system notifications and activities for Goods Receipt, Order Approval, Stock Warnings, and Data Creation events.
- Emitted audit logs globally via wildcards whenever domain events trigger.


## [Sprint 7] - Workflow & Approval Engine - 2026-07-09
### Added
- Introduced `Workflow` and `ApprovalLevel` models for defining flexible, multi-tier approval sequences.
- Generic `ApprovalRequest` and immutable `ApprovalHistory` to trace entity status changes across the application.
- Event-driven integration (`@nestjs/event-emitter`) syncing the decoupled Approval Engine directly with Purchase Order transitions.
- Multi-approver capability requiring absolute distinct users to sign off before promoting workflow states.
- Fully automated Purchase Order status locking and automated transitions upon approval rejection or finalization.

### Changed
- Shifted Procurement Approval flows from direct manual endpoints to the central Approval Engine automatically generated via Draft -> Pending Approval.

## [Sprint 6] - Procurement Management - 2026-07-08
### Added
- Complete Supplier Management module with rich details (Contact Person, Mobile, Tax Number) and `SupplierStatus`.
- Purchase Order lifecycle tracking with stringent State Machine transitions (Draft → Pending Approval → Approved → Partially Received → Completed).
- Item-level percentage-based Discount and Tax calculation integration.
- Atomic Goods Receiving endpoints wrapping Inventory creation, updating, and `PURCHASE_IN` Stock Movements via Prisma `$transaction`.
- OCC integrated automatically to prevent race conditions during Goods Receiving.
- Added comprehensive Swagger decorators for Procurement endpoints.

### Improved
- Established robust cross-module relations tying `Warehouse`, `Product`, `Supplier`, and `PurchaseOrders`.

## [Sprint 5] - Inventory & Warehouse - 2026-07-08
### Added
- Complete Warehouse module with status tracking and CRUD operations.
- Immutable StockMovements module for tracking 9 precise movement types including Opening Stock, Purchase, and Transfers.
- Dynamic Inventory tracking with granular stock buckets (`availableStock`, `reservedStock`, `damagedStock`).
- Dynamic stock valuation calculation (Stock x Product Cost).
- Optimistic Concurrency Control (OCC) using an incremental `version` field in Inventory to prevent multi-transaction race conditions.
- Automated generation of dual movement ledgers for Stock Transfers (`TRANSFER_OUT` to `TRANSFER_IN`).
- Explicit Indexes to `Inventory` and `StockMovement` tables for fast historical retrieval.

### Improved
- Database transactional integrity heavily utilized by coupling `StockMovement` creation and `Inventory` quantity adjustments into single atomic transactions via Prisma `$transaction`.
- Added missing `lastPage` calculation to Pagination Meta.

## [Sprint 4] - Product Catalog - 2026-07-07
### Added
- Comprehensive Product Catalog APIs for `Products`, `Categories`, `Brands`, and `Units`.
- Auto-generation of unique SKUs.
- Global API Versioning configured (default: `/api/v1/`).
- Extensive Swagger/OpenAPI documentation decorators added to all new endpoints.
- Generic Pagination wrappers (`PaginationQueryDto`, `PaginatedResultDto`).

### Changed
- Converted stock quantity tracking thresholds (`minStockLevel`, `maxStockLevel`, `reorderLevel`) from `Float` to `Decimal` to ensure absolute precision compatibility with future inventory modules.
- Replaced boolean `isActive` with a formal `ProductStatus` Enum (`ACTIVE`, `INACTIVE`) on the Product model.

### Improved
- Validations now enforce that `Unit` models are either specifically bound to a company or globally shared.
- Deep relational tree validation added to prevent circular relationships in the Category hierarchy.

## [Sprint 3] - Authentication & RBAC
### Added
- Fully-featured JWT authentication (Access & Refresh tokens).
- New `Session` model for tracking multiple active devices per user.
- Role-Based Access Control (RBAC) and explicit permission requirements injected into global Guards (`JwtAuthGuard`, `PermissionsGuard`).

### Changed
- Shifted refresh token tracking from the raw `User` table directly into isolated `Session` structures, preventing plain-text token exposure and facilitating robust token rotation.

### Improved
- Hardened database security standards and strictly validated API endpoints via DTOs and global pipes.
- Introduced robust generic Audit Logging mechanisms (e.g. tracking `CREATE_CATEGORY`, `UPDATE_PRODUCT`, etc.).

## [Sprint 1 & 2] - Foundation & Architecture
### Added
- Initialized core Turborepo monorepo architecture mapping applications (`api`, `web`) and packages (`database`, `config`, `types`, etc.).
- Scaffolded NestJS API platform and Next.js UI shell.
- Established and explicitly froze the Prisma Database Architecture with multi-tenant company isolation via `companyId`.
