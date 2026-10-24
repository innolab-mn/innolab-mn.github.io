# Shop and staff roles

Database status (2026-10-24): the migration, four priced Contentful products,
owner superadmin assignment and supplied bank details have been applied to
`ajniokginnpuhttfjhcz`. Public API checks confirm catalog/payment reads succeed
and anonymous order reads are denied. The catalog-sync GitHub secret is still
required for automatic future price updates. The workflow edit is prepared
locally, but the current GitHub credential cannot publish workflow changes;
the deployed workflow remains unchanged until that edit is applied separately.

`202610240001_shop_roles.sql` adds protected roles, private delivery contacts,
server-priced orders, bank settings and an audit trail. Apply it after the
existing membership migration, then `catalog-seed.sql`, then `shop-bootstrap.sql`.
The bootstrap targets only the existing confirmed account identified by the private
SQL session setting `innolab.bootstrap_email`. Do not commit the owner's email.
Set `innolab.bank_account` privately in the same SQL session; bank account numbers
are read from that setting rather than embedded in public source. The account
update migration uses the same private setting.
It configures the bank details supplied by the owner. It never creates an Auth account.

Everyone defaults to member. Signup metadata cannot grant staff rights. Admins
can read members and orders and advance order states. Only superadmins can change
roles or bank details. The last superadmin cannot demote themselves. Private
roles are checked in PostgreSQL on every protected call, not trusted from browser
state or a JWT role claim. Staff changes are recorded in a private audit table.

The cart stores only products and quantities in browser local storage, never
names or delivery addresses. Guests provide name, phone and address at checkout.
Signed-in members receive saved contact details and can opt to save checkout
contact changes to their own profile. Orders made as guests are not automatically
linked to later accounts. Guests retain the reference shown on the confirmation
screen; there is no public endpoint that exposes order information by reference.

Bank transfer is the only checkout payment method. Payment remains pending until
staff check the statement. Prices come from the private-write catalog, not the
browser. Invalid quantities, duplicate lines, stale prices and unknown products
are rejected. Retries use an idempotency UUID. Limits allow at most five orders
per phone and 100 orders overall per hour. Phone/global limits are basic abuse
controls, not proof of a verified phone number. No delivery charge, inventory
quantity, automated payment verification, refund or order email is implied.
Availability and delivery are confirmed with the buyer separately.

Run `node --env-file=.env.local scripts/sync-shop-catalog.mjs --sql` to generate a
seed from published Contentful products. For automatic price synchronization,
configure **SUPABASE_SERVICE_ROLE_KEY** as a GitHub Actions **Secret** (never a
NEXT_PUBLIC value). The workflow calls a service-only atomic catalog sync after
building. If absent, it warns and skips synchronization; stale prices fail closed
at checkout. Never share the secret in chat. Contentful remains the source for
product descriptions, images and prices. The initially supplied catalog is seeded
from existing published data.

Validation: `npm run check:shop` tests SQL permissions, metadata privilege
escalation, last-superadmin protection, privacy, price tampering, guest ordering,
retry idempotency, rate limits, state transitions and auditing against PostgreSQL.
