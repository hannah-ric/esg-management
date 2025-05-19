# ESG System Enhancements

## Audit Trail Module
- Table `audit_logs` stores all data changes with before/after values, user identity, role, source and timestamp.
- Functions in `src/lib/audit-log.ts` provide logging and query capabilities.
- Export helpers allow CSV and PDF report generation using `pdf-lib`.

## Semantic Search
- `searchESGDataPoints` now relies on vector embeddings generated via the Supabase edge function `supabase-functions-embed-text`.
- Embeddings are stored in `esg_data_embeddings` and queried via the `match_esg_data_points` RPC for similarity search.
- Fallback ILIKE queries were removed.

## Framework Mapping
- `src/lib/framework-mapping.ts` defines a modular system for loading framework definitions from the database.
- Functions enable comparison of frameworks to highlight overlaps.

These modules are designed to scale with increased data volumes and provide extensible foundations for further ESG functionality.
