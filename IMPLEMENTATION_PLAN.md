# Implementation Plan

## Phase 1 - App Foundation
- Initialize a strict TypeScript Next.js App Router application.
- Add Tailwind CSS, shared UI primitives, validation utilities, and Supabase client helpers.
- Add environment placeholders and protected admin route structure.

## Phase 2 - Database and Security
- Create Supabase SQL migrations for events, songs, votes, vote selections, storage metadata, RLS, indexes, views, and vote RPC.
- Add event lifecycle validation and ownership rules.

## Phase 3 - Admin Event Management
- Build authenticated organizer screens for login, event list, event creation, event controls, QR generation, exports, and status transitions.
- Enforce exactly 10 tracks before moving an event into a public state.

## Phase 4 - Public Attendee Flow
- Build lightweight public event pages with 8 second jittered polling.
- Add anonymous httpOnly voter token handling and HMAC voter hashes.
- Submit votes through one atomic server-side endpoint and preserve selections on retry.

## Phase 5 - Results and Projector
- Build private organizer result aggregation and CSV exports.
- Build authenticated projector route with controlled reveal, polling fallback, and no-animation table fallback.

## Phase 6 - Testing and Load Testing
- Add unit tests for validation, status transitions, hashing, ranking, and selection behavior.
- Add Playwright e2e coverage for the live event flow.
- Add k6 scripts and documentation for 500-attendee spike, polling, vote burst, duplicate, and full-scenario tests.

## Phase 7 - Production Readiness
- Complete README, Supabase setup, deployment, security notes, and event-day runbook.
- Verify build and document remaining manual Supabase/Vercel actions.
