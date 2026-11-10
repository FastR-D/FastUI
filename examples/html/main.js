const modulePath = '/assets/index.js'
import(/* @vite-ignore */ modulePath).then(({ initColorMode }) => {
  // The parser-blocking bootstrap owns the root listener. This controller is
  // local to this panel, so the root is not initialized twice.
  window.theme = initColorMode({ storageKey: 'fastui-example-panel-mode', target: document.querySelector('main') })
})
document.querySelector('#open').onclick = () => document.querySelector('dialog').showModal()
document.querySelector('main > form').onsubmit = event => {
  event.preventDefault()
  document.querySelector('#saved').textContent = String(Number(document.querySelector('#saved').textContent) + 1)
}
