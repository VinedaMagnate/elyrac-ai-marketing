# Production readiness

The application foundation is intentionally not production-ready until infrastructure is configured and validated.

Required before launch: apply all Supabase migrations; configure Supabase and OpenAI server credentials; add authenticated staff access and authorization; configure supported social platform OAuth/connectors; store tokens server-side; add publishing audit logs, retries and idempotency; validate platform-specific API permissions; run type-check/build/tests; deploy; verify production; and connect analytics ingestion.

Never place live tokens or service-role credentials in this public repository. Publishing remains disabled until these controls are complete.
