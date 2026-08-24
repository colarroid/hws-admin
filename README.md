# HWS Portal, admin tools

Internal tools for the HWS Portal: the listing review queue, organisation
verification, and Access Zone management.

**None of the three has been designed yet.** The handoff calls this the largest
gap in the project, because the whole trust model rests on all three: the
verified stamp women see is worth nothing if organisations self-publish. This
repository currently holds the foundation and an honest placeholder, so the
deployment target is real while the designs are done.

## The three repositories

The platform is three front ends over **one Supabase database**:

| Repository | What it is | Deployed at |
| --- | --- | --- |
| [hws-global](https://github.com/colarroid/hws-global) | The woman-facing flow and the landing page | the bare domain |
| [hws-organization](https://github.com/colarroid/hws-organization) | The organisation portal | `organisations.` |
| **hws-admin** (this one) | The admin tools | `administrator.` |

**The database schema lives in `hws-global/supabase/migrations` and nowhere
else.** All schema changes go there regardless of which front end needs them.

## Access

Every table these tools touch is gated on `is_admin()`, which reads the role
from `profiles`. The role is never self-assignable: `handle_new_user` resolves
anything other than `organisation` to `woman`, so an admin account is granted
by hand against the database. Nothing in any front end can mint one.

This deployment should also carry protection at the edge, since it is internal.
Vercel deployment protection is the cheapest way to do that.

## Running locally

```bash
npm install
npm run dev
```

Runs on <http://localhost:3002>, so it can run alongside the other two.

Decisions and their reasons are logged in `hws-global/docs/DECISIONS.md`.
