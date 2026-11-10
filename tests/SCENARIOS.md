# Published-consumer behavior acceptance

The entry point is clean Vue/React/HTML applications installed from tarballs and served
from their production Vite 6 builds. No source aliases or internal mocks.
The final GitHub release URLs are served at the external HTTPS download boundary
by a local fixture until upload. Package and example manifests stay unchanged;
each consumer uses a fresh npm cache and explicitly installs dev dependencies.
The React example also builds with pinned React/ReactDOM 18.3.1 and matching
18.3 types; Vue/React type checks run with skipLibCheck=false.

Failure modes to exercise before acceptance:

- Package resolution: missing ESM/type/CSS export, bundled framework peers,
  unresolved internal registry dependency, incompatible Vite 6 declarations.
- Forms: button accidentally submits, disabled/loading click, controlled input
  stops updating, Vue trim/number/lazy or checkbox model breaks, IME commits
  intermediate text, native ref is lost, select emits on the same selection,
  empty/disabled options break keyboard behavior, native validation bypassed.
- Dialog: initial focus missing, forward/backward Tab escapes to the page,
  nested Escape dismisses parent, return focus missing, backdrop only requests
  close on a completed outside click, nondismissible dialog cancels, unmount
  leaves a top layer behind, local theme lost in top layer, StrictMode replay.
  Native browser-chrome traversal at Tab boundaries is allowed; page controls
  remain inert. React cancel events must only close their owning dialog.
  Initial parent/child open=true must establish the same child-first Escape and
  return-focus behavior as sequential opening, including React StrictMode.
  Vue native aria-label/aria-labelledby must survive absent convenience props;
  convenience props take precedence when both forms supply the same attribute.
  Stable React callback refs must survive rerenders, clean up on ref replacement
  and unmount, and receive null only when they did not return cleanup.
- Theme: existing storage preference lost, invalid preference crashes,
  system changes override explicit mode, same-origin tabs diverge, storage clear
  is ignored, denied storage throws, dispose retains a listener, SSR import
  touches browser globals, bootstrap runs after content, scoped tokens escape.
- Appearance: global control/reset pollutes preview inputs, deep nested themes
  fail to map MDUI/vscrui, light/dark unreadable, narrow viewport overflow.

The verifier writes a sorted scenario manifest, production build logs and
light/dark viewport screenshots under artifacts. Screenshots are review evidence,
not automatically approved golden images.
