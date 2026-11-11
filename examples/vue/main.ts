import { createApp } from 'vue'
import { initColorMode } from '@fastrd/ui-foundation'
import App from './App.vue'
import DialogCases from './DialogCases.vue'
import '@fastrd/ui-vue/styles.css'
import '@fastrd/ui-foundation/mdui.css'
import './example.css'
const theme = initColorMode({ storageKey: 'fastui-example-mode' })
Object.assign(window, { theme })
createApp(new URLSearchParams(location.search).has('dialog-case') ? DialogCases : App).mount('#app')
