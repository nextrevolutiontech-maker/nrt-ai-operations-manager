# Enterprise Production Deployment Checklist - NRT AI Operations Manager

Use this checklist prior to launching any production environment or onboarding new enterprise clients.

## 1. Security & Environment Verification
- [ ] Production environment variables configured in `production.env` (JWT secrets, PostgreSQL passwords, OpenAI API Key).
- [ ] Database permissions seeded and assigned (`pnpm --filter @nrt-ai-workforce/database exec prisma db seed`).
- [ ] HTTPS / SSL certificates installed via Nginx reverse proxy.
- [ ] Security headers (HSTS, CSP, X-Frame-Options) verified.

## 2. Multi-Tenancy & Data Isolation
- [ ] Verified Zero Trust TenantValidationGuard is active on all API endpoints.
- [ ] Tested cross-tenant data access rejection (Tenant A JWT cannot query Tenant B resources).

## 3. Rate Limiting & AI Quota
- [ ] API Rate Limit Guard configured (120 req/min).
- [ ] Daily per-tenant LLM token quota configured (100,000 tokens/day cap).
- [ ] AI Prompt Injection Protection active (`PromptSanitizerService`).

## 4. High Availability & Health Checks
- [ ] Container liveness probe `/health/liveness` returning HTTP 200.
- [ ] Container readiness probe `/health/readiness` returning HTTP 200 and verifying Postgres DB connection.
- [ ] Docker Compose restart policy set to `always`.

## 5. Automated Backups & Disaster Recovery
- [ ] Cron job scheduled for `backup.sh` (Daily 02:00 UTC).
- [ ] Verified 30-day retention cleanup.
- [ ] Executed test restore procedure using `RestoreService.verifyRestoreProcess`.

## 6. Performance Benchmarks
- [ ] Main Dashboard load time < 2.0 seconds.
- [ ] AI Chat initial response latency < 3.0 seconds.
- [ ] Financial report generation time < 5.0 seconds.
