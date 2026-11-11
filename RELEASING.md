# npm tag releases

The npm packages `@fastrd/ui-foundation`, `@fastrd/ui-vue` and `@fastrd/ui-react`
trust **FastR-D/FastUI**, workflow **publish.yml**, with direct publish permission.
GitHub-hosted Actions receives short-lived OIDC credentials; no NPM_TOKEN secret
is required. Existing GitHub tarball releases remain immutable.

## Release procedure

1. Start from current main. Give all three `packages/*/package.json` the same new
   version. Update Vue/React's exact foundation dependency and example versions.
2. Refresh the pnpm lock, keeping official registry tarball URLs:
   `pnpm install --lockfile-only`.
3. Run `pnpm install --frozen-lockfile`, `pnpm verify`, `pnpm docs:build`,
   `pnpm docs:test`, and
   `node --experimental-vm-modules --test scripts/publish.test.mjs`.
4. Commit the reviewed files and push main. After checks pass, create and push
   the exact matching tag, for example `git tag v0.2.0` then
   `git push origin refs/tags/v0.2.0` for packages versioned 0.2.0.
5. Actions verifies the tag's source, original packed archives, consumer behavior
   and checksums, then publishes foundation followed by Vue and React. Stable
   releases use `latest`; prereleases use `next`.
6. Verify the public npm versions, integrity, provenance and a fresh consumer
   installation. UI consumers should commit their resulting lockfile updates.

Each post-upload confirmation has a ten-minute elapsed-time budget covering
metadata and tarball verification. Only a processing 404 is polled. If npm takes
longer, rerun the failed workflow after visibility is restored: identical
published archives are skipped, and different bytes fail. Never move an existing
tag, unpublish a version, or reuse a version number to repair an upload.

The repository pins pnpm 10.33.0. npm CLI remains necessary for original tarball
packing and OIDC publication. The publish:tag script invokes npm directly.
The docs.yml Pages workflow deploys documentation independently on main.
