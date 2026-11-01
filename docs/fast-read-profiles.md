# fast_read profile archive v1

Profiles are local to a browser and transferred as UTF-8 JSON. The archive has
a stable `format` identifier, an outer `schemaVersion`, and an independently
versioned entry for every game. The machine-readable schema is
`public/fast_read/data/profile-format.schema.json`.

```json
{
  "format": "fast-read-profiles",
  "schemaVersion": 1,
  "exportedAt": "2026-11-01T08:00:00.000Z",
  "activeProfileId": "example-profile-id",
  "profiles": [{
    "id": "example-profile-id", "name": "Ану", "avatar": "cat",
    "createdAt": "2026-11-01T08:00:00.000Z", "updatedAt": "2026-11-01T08:00:00.000Z",
    "games": {
      "core": {"version": 1, "state": {"learned": ["dad"], "sound": true}},
      "reading": {"version": 1, "state": {"records": [], "fontSize": 21}}
    }
  }]
}
```

Game identifiers are `core`, `alphabet`, `actions`, `reading`, and `shooter`.
An archive may contain one profile or several. Import validates the whole file,
then adds selected profiles as new copies with new local IDs. Existing profiles
and the active profile are not overwritten. Source IDs are recorded in
`importedFrom`. The limits are 5 MiB per file and 50 profiles per browser.

On first launch, the five previous `fast-read-*-v1` keys are copied into the
initial profile, while the original keys remain as a recovery copy. Later game
writes use `fast-read-profiles-v1`. Each browser tab writes to the profile it
opened with, even if another tab selects another child. The current registry is
read before each write. There is no cloud synchronization or account system.

For future releases:

- Keep profile IDs, game IDs, passage IDs and existing field meanings stable.
  Add optional fields for backward-compatible additions.
- Preserve unknown profile fields, game entries, game metadata and top-level
  fields inside game states. An old client cannot preserve arbitrary additions
  nested inside a known field when that field is rewritten.
- For incompatible game state changes, increment that game's `version` and add
  an explicit migration. This version refuses to overwrite or reset a newer
  game state.
- For incompatible outer changes, increment `schemaVersion` and add an explicit
  old-to-new migration in `profiles-model.js`, with fixtures and tests. This
  version rejects unsupported future archives without touching existing data.
- Do not reuse content IDs for unrelated content; register and document any
  newly added game state.

Run `node scripts/check-fast-read-profiles.mjs` for migration, separation, tab
isolation, import/export, unsupported versions and storage-failure checks.
Storage is scoped to an origin: use export/import between localhost, a
published site and other devices. Keep an exported copy before clearing browser
site data.
