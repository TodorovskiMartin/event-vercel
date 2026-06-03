# Security Notes

RLS is enabled on every public table. Anonymous visitors can read only public event and song data through policies, but the app uses server API routes for public reads to keep responses small and controlled.

Votes are submitted through `submit_event_vote`, a single PostgreSQL function that validates lifecycle status, exactly three distinct songs, event ownership of songs, and duplicate voter hashes before inserting one vote and three selections.

The raw anonymous voter token is stored only in an httpOnly cookie. The database stores an HMAC of `event_id + token` using `VOTER_HASH_SECRET`.

This blocks ordinary repeat voting from the same browser. It does not stop intentional voting with multiple devices, cleared browser storage, or incognito sessions. A future ticket-code or checked-in guest list model would provide stronger identity.

Guest devices do not open Supabase Realtime connections. They poll the tiny status endpoint about every 8 seconds with jitter. Realtime should be reserved for authenticated admin/projector screens.

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `VOTER_HASH_SECRET` to the browser.
