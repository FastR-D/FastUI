import type { Preset } from 'unocss'

declare const __FASTUI_STYLES__: Record<string, string>
declare const __FASTUI_TOKENS__: string
const styles = __FASTUI_STYLES__
const componentFamilies = {
  Button: ['button'], TextField: ['input'], TextArea: ['textarea'], Checkbox: ['input'],
  Select: ['select'], SelectField: ['select'], Field: ['field'], Fieldset: ['fieldset'], Legend: ['legend'],
  Heading: ['heading'], Link: ['link'], Progress: ['progress'], Table: ['table'],
  DisclosureTrigger: ['disclosure-trigger'], Dialog: ['dialog'], Modal: ['dialog'], DialogSurface: ['dialog'], ModalBody: ['dialog'],
  Alert: ['alert', 'tone'], Badge: ['badge', 'tone'], EmptyState: ['empty'], Loading: ['loading', 'spinner'],
  TabBar: ['tabs'], SegmentedControl: ['segments'], Toolbar: ['toolbar'], StatusBar: ['statusbar'],
  Section: ['section'], ListRow: ['list-row'], Divider: ['divider'], ActivityRail: ['activity-rail'],
  PanelHeader: ['panel-header'], InspectorSection: ['inspector'], AssetCard: ['asset'], CanvasSurface: ['canvas'],
} as const
export type FastUIComponent = keyof typeof componentFamilies
export interface FastUIPresetOptions {
  /** Explicit inclusion for runtime-only component resolution or wrapper libraries. */
  components?: readonly FastUIComponent[]
}
function familyForClass(value: string) {
  const name = value.replace(/^fastui-/, '').split('--')[0]
  if ((name === 'tab' || name === 'tabs' || name.startsWith('tab-'))) return 'tabs'
  if (/^segments?$/.test(name)) return 'segments'
  if (/^inspector-/.test(name)) return 'inspector'
  if (/^asset-/.test(name)) return 'asset'
  if (/^tone-/.test(name)) return 'tone'
  return name === 'modal-body' ? 'dialog' : name
}
/** UnoCSS's Vite pipeline needs this on the top-level config to scan plain TS/JS. */
export const fastUIContent = {
  pipeline: { include: [/\.[cm]?[jt]sx?($|\?)/, /\.(vue|html|mdx?|svelte|astro)($|\?)/] },
}
const marker = (family: string) => `fastui-use-${family}`
/** Build-time only. Retains complete variants and accessibility states of used families. */
export function presetFastUI({ components = [] }: FastUIPresetOptions = {}): Preset {
  return {
    name: '@fastrd/ui-foundation',
    preflights: [{ getCSS: () => __FASTUI_TOKENS__ + '\n' + styles.shared }],
    safelist: components.flatMap(name => componentFamilies[name].map(marker)),
    extractors: [{
      name: 'fastui-components',
      extract({ code, id }) {
        // Never scan the library barrel: it contains every implementation.
        if (id && /(?:node_modules\/.*@fastrd\/ui-|packages\/(?:react|vue)\/(?:src|dist)\/)/.test(id)) return []
        const found = new Set<string>()
        const add = (name: string) => {
          for (const family of componentFamilies[name as FastUIComponent] ?? []) found.add(marker(family))
        }
        for (const match of code.matchAll(/(?:import|export)\s*\{([^}]+)\}\s*from\s*['"]@fastrd\/ui-(?:react|vue)['"]/g)) {
          for (const specifier of match[1].split(',')) {
            if (!/^\s*type\s/.test(specifier)) add(specifier.trim().split(/\s+as\s+/)[0])
          }
        }
        for (const match of code.matchAll(/import\s*\*\s*as\s+(\w+)\s*from\s*['"]@fastrd\/ui-(?:react|vue)['"]/g)) {
          const access = new RegExp(`\\b${match[1]}\\.([A-Z]\\w*)`, 'g')
          for (const usage of code.matchAll(access)) add(usage[1])
        }
        for (const match of code.matchAll(/\bfastui-[a-z][\w-]*/g)) {
          const family = familyForClass(match[0])
          if (styles[family]) found.add(marker(family))
        }
        return [...found]
      },
    }],
    // Raw CSS preserves pseudo selectors, native states and media queries verbatim.
    rules: Object.entries(styles).filter(([family]) => family !== 'shared').map(([family, css]) =>
      [new RegExp(`^${marker(family)}$`), () => css]),
  }
}
