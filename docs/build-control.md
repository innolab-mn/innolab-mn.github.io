# Direct superadmin build and deploy

The build button calls the trigger-build Supabase Edge Function. The website
remains a static Next.js export. Only superadmins see the button, and the server
independently verifies Auth.getUser and the current database member_role on every
request. Signup metadata and client-supplied role/repository/ref cannot grant access.

Configure GITHUB_ACTIONS_TOKEN in Supabase Edge Functions Secrets. Use a
fine-grained token scoped to innolab-mn/innolab-mn.github.io with Actions: read and
write. Never put it in NEXT_PUBLIC variables or source. Deploy the function with
the gateway setting in config.toml; Auth session verification is implemented in
the handler. No new database migration is needed.

The destination is fixed to nextjs.yml on main. GET returns the latest run's safe
status fields. POST refuses an active workflow and uses the existing service-only
consume_member_login_limit RPC for a shared one-attempt-per-minute limit. A
successful dispatch means queued, not deployment complete. Check status in the
site to see progress; the GitHub log link is optional. Check status before retrying
a network failure because GitHub might have accepted the request already.

This function does not edit code, workflow permissions, or build environment values.
This endpoint does not manage bank instructions. GITHUB_ACTIONS_TOKEN is a private
server credential and is unrelated to public bank instructions.

Validation: npm run check:build-control. Tests use mock Auth/GitHub and never start
real workflow runs.
