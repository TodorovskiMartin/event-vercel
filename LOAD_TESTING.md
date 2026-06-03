# Load Testing

Install k6 from https://k6.io/docs/get-started/installation/.

Required environment variables:

- `BASE_URL`: staging or production-like deployment URL.
- `EVENT_SLUG`: dedicated test event slug.
- `SONG_IDS`: comma-separated UUIDs for at least three songs in that event.

Run:

```bash
k6 run load-tests/qr-page-spike.js
k6 run load-tests/status-poll.js
k6 run load-tests/vote-burst.js
k6 run load-tests/duplicate-vote.js
k6 run load-tests/full-event-scenario.js
```

Use a staging/test event, not the real event data. Put the test event into `voting_open` before vote-burst tests, then verify final totals in Supabase:

- confirmed vote rows match accepted submissions
- every confirmed vote has exactly three selections
- duplicate submissions are rejected
- p95 latency and failure thresholds are within your venue-day target
