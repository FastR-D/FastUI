# Source and publication scope

The owner has authorized publication of the generic UI portions under MIT.
Vue semantic primitives and v-model adapters derive from the common
`primitives.ts` (203 lines) in FastPPT and FastFigure. Modal's public props and
the focus-lifecycle purpose derive from their common `use-dialog-focus.ts`
(58 lines) and Modal component. FastUI delegates focus trapping, inertness,
nesting and focus restoration to the browser's native modal dialog rather
than maintaining the original hand-written trap. Select retains the shared
value/options/change contract and delegates interaction to the native select.

The palette follows FastWrite's semantic colors and the approved FastTask
workbench design. Only generic UI code and semantic design values are included.
No private artwork, icons, logos, application data, product-specific workflows
or brand assets are distributed in the UI packages. Documentation fonts are
licensed separately as described below. Upstream product repositories
retain ownership of their application-specific code and assets.

Source reference revisions: FastPPT `f6bf21f13445c2507719928fa68550552a8fcab2`
(`packages/components/src/`) and FastFigure
`13dcc4179fd0073da76f7626264af8605d5e8c70` (`src/components/ui/`).
At both revisions, `primitives.ts` has Git blob
`c7123af5f8316bc0486bce5c99cfbb2e9ab3dc73` and `use-dialog-focus.ts` has
Git blob `3ffbb6c6c7bd5e3c96f2b8c05c5e008dcdfc4cab`.

# FastUI notices

FastUI is an MIT-licensed design foundation and component library extracted from
shared interface work in FastR-D products. Product data, authentication, assets
and application workflows are not included.

The design aligns with the 2026-11-11 FastWrite workbench: compact geometry,
semantic light/dark colors, typography, flat tabs, project lists and focus states.

Design research used the fixed checkouts in FastWrite/reference:

- assistant-ui/assistant-ui (MIT), f92028b466cba721846de6851e4dddb6c04ecfad:
  composable surfaces and separation of display from runtime state.
- shadcn-ui/ui (MIT), 8ab27715521cbd4f87ae6886cd989cbb678f6de7:
  semantic tokens, variants and explicit focus/disabled states.
- radix-ui/primitives (MIT), eb3a2b7091293e27df8f9ba906632d8daa3d81a3:
  keyboard navigation, disabled-item handling and focus order.
- nextlevelbuilder/ui-ux-pro-max-skill (MIT), 6ae86f61f520d6ca229d2f40e070410638c908c5:
  navigation, deep links and reduced-motion guidance.
- ayaka-notes/ayakaleaf-pro (AGPL-3.0), 6ce22039d19b516354dff2a8508dd67515ded9f0:
  project-list layout and interaction research only.

The workbench implementations are original. No source from these reference libraries,
including the AGPL project, is copied into the distributed MIT packages. Exact
repository URLs and revisions are recorded in docs/reference-sources.json.

The documentation site self-hosts IBM Plex Sans Variable 5.3.0, Noto Sans SC
Variable 5.3.1 and JetBrains Mono Variable 5.3.0 through Fontsource. These fonts use
SIL Open Font License 1.1; their original license texts are shipped with the
site under docs/public/licenses/fonts/. Font files are not shipped in UI packages.
