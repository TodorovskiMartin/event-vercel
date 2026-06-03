# Deployment

## Vercel

1. Connect this repository to Vercel.
2. Add environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS deployment URL.
4. Deploy.

## Supabase

1. Create or select the production project.
2. Run migrations with the Supabase CLI.
3. Create organizer accounts in Auth.
4. Configure Auth redirect URLs for the Vercel domain if needed.

## Smoke Test

1. Sign in at `/admin/login`.
2. Create an event with 10 tracks.
3. Open public page from the QR URL.
4. Move event to `voting_open`.
5. Submit a vote from a phone.
6. Close voting and reveal results.
7. Open projector page and CSV export.
