# FastUI

Shared design foundations and UI components for FastR-D products.

Three MIT packages provide framework-independent tokens/color mode, Vue controls,
and React controls. API and migration details live in each package README.

## Install 0.1.0

After the coordinator uploads the `v0.1.0` release assets:

```sh
npm install https://github.com/FastR-D/FastUI/releases/download/v0.1.0/fastrd-ui-vue-0.1.0.tgz
# Or replace ui-vue with ui-react or ui-foundation in the filename.
```

The framework packages depend on the same-version foundation release URL, so
installation does not require unpublished foundation versions in npm. Keep the
consumer lockfile. Release asset names and bytes are immutable for this version.

## Build and verify

```sh
npm ci
npm run verify
```

Verification needs Node 22+, npm, tar, OpenSSL and Playwright Chromium
(`npx playwright install chromium` if absent). It packs the final packages,
installs them into clean Vite 6 Vue/React/HTML applications (React 18.3 and 19)
and tests production
builds in Chromium. A local HTTPS download fixture supplies the pending GitHub
release assets without changing package manifests or disabling TLS validation.
The fixture certificate is trusted only by its npm subprocesses. Each consumer
uses a new npm cache. `artifacts/results.json`, build logs and 24 screenshots
record the results; `artifacts/packages.json` records package contents and SHA-256.
`artifacts/dialog-regressions.json` covers initial nested modal stacks, Vue ARIA
names and callback ref cleanup/replacement/unmount. Bootstrap-only installation
is verified without explicitly depending on foundation. Static manifest hashes
cover all archive payload files except the manifest itself.
This is pre-upload evidence; live GitHub availability requires post-upload verification.

Only reusable interface code belongs here; application data, project assets,
authentication credentials and domain workflows stay in their owning products.
