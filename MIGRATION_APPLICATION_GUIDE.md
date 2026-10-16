# Migration Application Guide — Production Deployment
**Date:** Oct 16, 2026 | **Urgency:** IMMEDIATE (Deepawali Launch)  
**Status:** Ready to apply

---

## Command to Apply Migrations

### Migration 0006: Events Table
```bash
wrangler d1 execute occultviision-db --file=worker/migrations/0006_events_table.sql --remote
```

### Migration 0007: Saved Muhurtas Table
```bash
wrangler d1 execute occultviision-db --file=worker/migrations/0007_saved_muhurtas.sql --remote
```

**Run both in sequence:**
```bash
# From project root (/home/claude/occultviision)
wrangler d1 execute occultviision-db --file=worker/migrations/0006_events_table.sql --remote && \
wrangler d1 execute occultviision-db --file=worker/migrations/0007_saved_muhurtas.sql --remote
```

---

## Verification Query (After Migrations Applied)

To verify both tables exist with correct structure:

```sql
-- Check events table
SELECT name FROM sqlite_master WHERE type='table' AND name='events';
SELECT sql FROM sqlite_master WHERE type='table' AND name='events';

-- Check saved_muhurtas table
SELECT name FROM sqlite_master WHERE type='table' AND name='saved_muhurtas';
SELECT sql FROM sqlite_master WHERE type='table' AND name='saved_muhurtas';

-- Check indexes
SELECT name FROM sqlite_master WHERE type='index' AND (tbl_name='events' OR tbl_name='saved_muhurtas');
```

---

## What Gets Created

### Migration 0006: Events Table
- **Purpose:** Track all user interactions (birth_chart queries, muhurta searches, payments, exports)
- **Columns:** id, user_id, event_type, muhurta_id, event_date, event_data (JSON), created_at
- **Indexes:** 4 (user_id, event_type, event_date, composite user_type)
- **Size Estimate:** ~5-10 MB for 1M events (100 bytes/row)

### Migration 0007: Saved Muhurtas Table
- **Purpose:** Store user-saved muhurta calculations for later reference & comparison
- **Columns:** id, user_id, query_params (JSON), result_data (JSON), auspiciousness_score, created_at, updated_at
- **Indexes:** 4 (user_id, created_at, auspiciousness_score, composite user_score)
- **Size Estimate:** ~20-30 MB for 1M saves (150+ bytes/row with JSON data)

---

## Rollback (If Needed)

```bash
# Drop tables (DANGEROUS - irreversible data loss)
wrangler d1 execute occultviision-db --command "DROP TABLE IF EXISTS saved_muhurtas;" --remote
wrangler d1 execute occultviision-db --command "DROP TABLE IF EXISTS events;" --remote
```

---

## Database Status After Migrations

```
occultviision-db (NEON PostgreSQL)
├── Schema: public
├── Tables:
│   ├── users (existing)
│   ├── saved_muhurtas (NEW - 0007)
│   └── events (NEW - 0006)
├── Indexes: 8 new indexes (4 per table)
└── Ready for: User activity tracking + Muhurta query history
```

---

## Timeline for Launch

✅ **Phase 3 Code Complete:** Migrations created + KP verified (Oct 16)  
🟡 **NOW:** Apply migrations to production database (Oct 16)  
🟡 **Next:** Confirm remaining blockers (Razorpay, Twilio, Domain)  
🟡 **Oct 17-18:** Deploy to production + go live for Deepawali

---

## Next Steps After Migrations

1. ✅ Confirm migrations applied successfully (run verification query above)
2. ⏳ Provide **Razorpay credentials** (API Key, Merchant ID)
3. ⏳ Provide **Twilio credentials** (Account SID, Auth Token, phone number)
4. ⏳ Confirm **production domain** ready
5. ⏳ Deploy backend code to Cloudflare Workers
6. ⏳ Test core Muhurta queries (vehicles, property, gold, electronics)

---

**Ready to execute. Naveen — run the migration commands above when ready.**
