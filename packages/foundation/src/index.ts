export type ColorMode = 'light' | 'dark' | 'system'
export type ResolvedColorMode = Exclude<ColorMode, 'system'>
export interface ColorModeState { mode: ColorMode; resolved: ResolvedColorMode }
export interface ColorModeController extends ColorModeState {
  setMode(mode: ColorMode): void
  subscribe(listener: (state: ColorModeState) => void): () => void
  dispose(): void
}
const parse = (value: unknown): ColorMode => value === 'light' || value === 'dark' ? value : 'system'

/** Call before mounting the app. The host owns its existing preference key. */
export function initColorMode({ storageKey, target = document.documentElement }: {
  storageKey: string
  target?: HTMLElement
}): ColorModeController {
  const win = target.ownerDocument.defaultView!
  const media = win.matchMedia('(prefers-color-scheme: dark)')
  let mode: ColorMode = 'system'
  try { mode = parse(win.localStorage.getItem(storageKey)) } catch { /* Private browsing may deny storage. */ }
  let disposed = false
  const listeners = new Set<(state: ColorModeState) => void>()
  const resolved = (): ResolvedColorMode => mode === 'system' ? (media.matches ? 'dark' : 'light') : mode
  const apply = () => {
    target.dataset.fastuiTheme = resolved()
    listeners.forEach(listener => listener({ mode, resolved: resolved() }))
  }
  const systemChange = () => { if (mode === 'system') apply() }
  const storageChange = (event: StorageEvent) => {
    let storage: Storage
    try { storage = win.localStorage } catch { return }
    if (event.storageArea !== storage || (event.key !== storageKey && event.key !== null)) return
    mode = parse(event.newValue)
    apply()
  }
  media.addEventListener('change', systemChange)
  win.addEventListener('storage', storageChange)
  apply()
  return {
    get mode() { return mode },
    get resolved() { return resolved() },
    setMode(value) {
      if (disposed) return
      mode = parse(value)
      try { win.localStorage.setItem(storageKey, mode) } catch { /* In-memory mode still works. */ }
      apply()
    },
    subscribe(listener) {
      if (disposed) return () => {}
      listeners.add(listener)
      listener({ mode, resolved: resolved() })
      return () => { listeners.delete(listener) }
    },
    dispose() {
      disposed = true
      media.removeEventListener('change', systemChange)
      win.removeEventListener('storage', storageChange)
      listeners.clear()
    },
  }
}

/** Native top-layer dialogs preserve inherited tokens, inertness and the browser's focus stack. */
export function syncDialog(element: HTMLDialogElement, open: boolean): void {
  if (open && !element.open) {
    // Child mount hooks may run first. Re-enter open descendants after their
    // ancestor so the native top-layer and return-focus stacks follow nesting.
    const descendants = Array.from(element.querySelectorAll<HTMLDialogElement>('dialog:modal'))
    for (const child of [...descendants].reverse()) child.close()
    element.showModal()
    for (const child of descendants) child.showModal()
  }
  else if (!open && element.open) element.close()
}
