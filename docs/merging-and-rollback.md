# Merging a phase and rolling back a deploy

## Branches

Every plan phase is built on its own branch, `phase-NN-name` (plan decision D7). Each push to a
branch other than master runs `npm run check` on GitHub (`.github/workflows/check.yml`) and never
deploys. Only master deploys (`.github/workflows/deploy.yml`): it runs the checks again, applies
the D1 migrations and runs `wrangler deploy`.

## Merging a phase

Only after the owner has confirmed the merge:

1. The checks are green on the phase branch on GitHub.
2. Merge without squashing, so each step of the phase stays in the history:
   `git checkout master`, `git pull`, `git merge --no-ff phase-NN-name`, `git push`.
3. Watch the Deploy run on GitHub until it finishes.
4. Open the live site and check that every reachable screen works.

## Rolling back a bad deploy

1. `npx wrangler rollback` puts the previous version of the Worker back live within seconds
   (`npx wrangler deployments list` shows the versions). It needs `CLOUDFLARE_API_TOKEN`, or
   `npx wrangler login` once on this computer.
2. Then fix master: `git revert` the merge commit (`git revert -m 1 <merge commit>`) and push, so
   the next deploy does not bring the bad version back.

What a rollback does not undo:

- **D1 migrations.** A table dropped or changed stays that way; undo it with a new migration.
- **Durable Object migrations** in `wrangler.jsonc` (a deleted class and its data are gone). A
  rollback to a version from before such a migration is refused by Cloudflare.
- **Stored data** written by the bad version. Until version 1 is public, stored data may be
  wiped instead (D1).
