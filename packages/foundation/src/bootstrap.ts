import { initColorMode } from './index.js'

// Parser-blocking static-site entry: the host supplies its own preference key.
const storageKey = (document.currentScript as HTMLScriptElement).dataset.storageKey
if (!storageKey) throw new Error('FastUI color-mode.js requires data-storage-key on its script element.')
initColorMode({ storageKey })
