# FastUI

## Automated npm releases

All public packages use the same version. Update their manifests and exact internal
dependency versions, run `npm install --package-lock-only` and `npm run verify`,
commit, then push a matching `vX.Y.Z` tag. `.github/workflows/publish.yml` verifies
the original packed candidates and publishes foundation before Vue/React using
npm Trusted Publishing (GitHub OIDC); no long-lived publish token is required.
The npm package settings must authorize `FastR-D/FastUI`, workflow `publish.yml`,
for all three packages. Tag/package mismatches and already-published versions with
different archive integrity fail closed. Prereleases use the `next` dist-tag.

Shared design foundations and UI components for FastR-D products.

Three MIT packages provide framework-independent tokens/color mode, Vue controls,
and React controls. API and migration details live in each package README.

## Install 0.1.1

After the coordinator publishes version 0.1.1 to npm:

```sh
npm install @fastrd/ui-vue@0.1.1
# Or install @fastrd/ui-react@0.1.1 or @fastrd/ui-foundation@0.1.1.
```

The framework packages depend on the exact foundation registry version 0.1.1.
Keep the consumer lockfile. Publish foundation before Vue and React. The existing
0.1.0 release assets remain immutable.

## Build and verify

```sh
npm install
npm run verify
```

The root workspaces resolve the unpublished foundation locally. Standalone
example installation requires the npm publication; pre-publication verification
supplies the candidates through an external registry fixture.

Verification needs Node 22+, npm, tar and Playwright Chromium
(`npx playwright install chromium` if absent). It packs the final packages,
installs them into clean Vite 6 Vue/React/HTML applications (React 18.3 and 19)
and tests production
builds in Chromium. A local npm registry fixture serves candidate-scope packuments
and the original packed tarballs, with other package requests passed through to
the public npm registry over HTTPS. Each consumer uses a new npm cache and its
unchanged registry-version manifest. `artifacts/0.1.1/results.json`, build logs and
24 screenshots record the 53 scenarios; `artifacts/0.1.1/packages.json` records
package contents and SHA-256.
`artifacts/0.1.1/dialog-regressions.json` covers initial nested modal stacks, Vue ARIA
names and callback ref cleanup/replacement/unmount. Bootstrap-only installation
is verified without explicitly depending on foundation. Static manifest hashes
cover all archive payload files except the manifest itself.
This is pre-publication evidence; live npm availability requires post-publication verification.

Only reusable interface code belongs here; application data, project assets,
authentication credentials and domain workflows stay in their owning products.
