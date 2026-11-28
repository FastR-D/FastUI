/** Styled single-select popup while retaining the native form value, ref and events. */
const controllers = /* @__PURE__ */ new WeakMap<HTMLSelectElement, () => void>()
let sequence = 0
export function enhanceSelect(select: HTMLSelectElement): () => void {
  controllers.get(select)?.()
  const doc = select.ownerDocument, win = doc.defaultView!
  const popup = doc.createElement('div')
  popup.id = `fastui-select-popup-${++sequence}`
  popup.className = 'fastui-select-popup'
  popup.setAttribute('role', 'listbox')
  popup.setAttribute('popover', 'manual')
  popup.hidden = true
  let open = false, active = -1, frame = 0, buffer = '', typedAt = 0
  let entries: HTMLDivElement[] = []
  const previous = new Map(['aria-expanded', 'aria-controls', 'aria-activedescendant', 'aria-haspopup', 'data-fastui-select'].map(key => [key, select.getAttribute(key)]))
  const hiddenOptions = new Map<HTMLOptionElement, string | null>()
  const usable = () => !select.multiple && select.size <= 1 && !select.matches(':disabled')
  const enabled = (index: number) => {
    const option = select.options[index]
    return !!option && !option.disabled && !option.hidden && !(option.parentElement instanceof win.HTMLOptGroupElement && option.parentElement.disabled)
  }
  const restoreOptions = () => { hiddenOptions.forEach((value, option) => value === null ? option.removeAttribute('aria-hidden') : option.setAttribute('aria-hidden', value)); hiddenOptions.clear() }
  const close = () => {
    if (!open) return
    open = false
    if (typeof popup.hidePopover === 'function' && popup.matches(':popover-open')) popup.hidePopover()
    popup.hidden = true
    popup.remove()
    restoreOptions()
    select.setAttribute('aria-expanded', 'false')
    select.removeAttribute('aria-activedescendant')
    select.removeAttribute('aria-controls')
    buffer = ''
    if (frame) win.cancelAnimationFrame(frame)
    frame = 0
  }
  const highlight = (index: number, scroll = true) => {
    active = index
    entries.forEach((entry, i) => entry.toggleAttribute('data-active', i === index))
    if (entries[index]) {
      select.setAttribute('aria-activedescendant', entries[index].id)
      if (scroll) entries[index].scrollIntoView({ block: 'nearest' })
    } else select.removeAttribute('aria-activedescendant')
  }
  const position = () => {
    frame = 0
    if (!open) return
    if (!select.isConnected || !usable()) { close(); return }
    const rect = select.getBoundingClientRect(), viewport = win.visualViewport
    const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0
    const width = viewport?.width ?? win.innerWidth, height = viewport?.height ?? win.innerHeight
    if (rect.bottom < top || rect.top > top + height || rect.right < left || rect.left > left + width) { close(); return }
    const gap = 6, margin = 8
    const below = top + height - rect.bottom - gap - margin, above = rect.top - top - gap - margin
    const desired = Math.min(320, popup.scrollHeight || 320)
    const up = below < desired && above > below
    const available = Math.max(0, up ? above : below)
    if (available < 24) { close(); return }
    const popupWidth = Math.min(Math.max(rect.width, 180), width - margin * 2)
    popup.style.width = `${popupWidth}px`
    popup.style.maxHeight = `${Math.min(320, available)}px`
    popup.style.left = `${Math.max(left + margin, Math.min(rect.left, left + width - popupWidth - margin))}px`
    popup.style.top = `${up ? rect.top - gap - Math.min(popup.scrollHeight, available, 320) : rect.bottom + gap}px`
    popup.dataset.placement = up ? 'top' : 'bottom'
  }
  const schedule = () => { if (open && !frame) frame = win.requestAnimationFrame(position) }
  const choose = (index: number) => {
    if (!usable() || !enabled(index)) return
    const changed = select.selectedIndex !== index
    select.selectedIndex = index
    close()
    select.focus({ preventScroll: true })
    if (changed) {
      select.dispatchEvent(new win.Event('input', { bubbles: true }))
      select.dispatchEvent(new win.Event('change', { bubbles: true }))
    }
  }
  const render = () => {
    popup.replaceChildren()
    entries = []
    let group: Element | null = null
    Array.from(select.options).forEach((option, index) => {
      if (!hiddenOptions.has(option)) hiddenOptions.set(option, option.getAttribute('aria-hidden'))
      option.setAttribute('aria-hidden', 'true')
      if (option.parentElement?.tagName === 'OPTGROUP' && option.parentElement !== group) {
        group = option.parentElement
        const heading = doc.createElement('div'); heading.className = 'fastui-select-group'; heading.textContent = group.getAttribute('label'); heading.setAttribute('role', 'presentation'); popup.append(heading)
      }
      const entry = doc.createElement('div')
      entry.id = `${popup.id}-${index}`
      entry.className = 'fastui-select-option'
      entry.setAttribute('role', 'option')
      entry.setAttribute('aria-label', option.label)
      entry.setAttribute('aria-selected', String(select.selectedIndex === index))
      entry.setAttribute('aria-disabled', String(!enabled(index)))
      entry.textContent = option.label
      entry.hidden = option.hidden
      entry.addEventListener('pointermove', () => { if (enabled(index)) highlight(index, false) })
      entry.addEventListener('click', () => choose(index))
      entries.push(entry); popup.append(entry)
    })
    if (!entries.length) { const empty = doc.createElement('div'); empty.className = 'fastui-select-empty'; empty.textContent = '—'; popup.append(empty) }
    highlight(enabled(active) ? active : Array.from(select.options).findIndex((_, i) => enabled(i)), false)
  }
  const show = () => {
    if (open || !usable()) return
    open = true
    active = enabled(select.selectedIndex) ? select.selectedIndex : -1
    render()
    // Preserve scoped theme tokens when the popup escapes an overflow container.
    const style = win.getComputedStyle(select)
    for (let i = 0; i < style.length; i++) { const key = style[i]; if (key.startsWith('--fastui-')) popup.style.setProperty(key, style.getPropertyValue(key)) }
    popup.style.fontFamily = style.fontFamily
    popup.style.fontSize = style.fontSize
    popup.style.colorScheme = style.colorScheme
    popup.setAttribute('aria-label', select.getAttribute('aria-label') || Array.from(select.labels || []).map(label => label.textContent?.trim()).join(' ') || 'Options')
    ;(select.closest('dialog[open]') || doc.body).append(popup)
    popup.hidden = false
    if (typeof popup.showPopover === 'function') popup.showPopover()
    select.setAttribute('aria-expanded', 'true')
    select.setAttribute('aria-controls', popup.id)
    position()
    highlight(active)
  }
  const pointer = (event: Event) => { if (usable()) event.preventDefault() }
  const click = (event: MouseEvent) => { if (!usable()) return; event.preventDefault(); select.focus({ preventScroll: true }); if (open) close(); else show() }
  const outside = (event: Event) => { const target = event.target as Node; if (open && target !== select && !popup.contains(target)) close() }
  const keydown = (event: KeyboardEvent) => {
    if (!usable() || event.isComposing || event.ctrlKey || event.metaKey) return
    if (event.key === 'Escape') { if (open) { event.preventDefault(); event.stopPropagation(); close() } return }
    if (event.key === 'Tab') { close(); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (open) choose(active); else show(); return }
    if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault()
      const wasOpen = open; show()
      const valid = Array.from(select.options).map((_,i) => i).filter(enabled)
      if (!valid.length) return
      let next = active
      if (event.key === 'Home') next = valid[0]
      else if (event.key === 'End') next = valid[valid.length - 1]
      else if (wasOpen) { const current = valid.indexOf(active); next = valid[(current + (event.key === 'ArrowDown' ? 1 : -1) + valid.length) % valid.length] }
      highlight(next); return
    }
    if (event.key.length === 1 && !event.altKey) {
      event.preventDefault(); show()
      const now = Date.now(); buffer = now - typedAt > 700 ? event.key : buffer + event.key; typedAt = now
      const term = buffer.toLocaleLowerCase()
      const count = select.options.length
      const repeated = [...term].every(char => char === term[0])
      for (let offset = 1; offset <= count; offset++) { const index = (active + offset + count) % count; if (enabled(index) && select.options[index].label.toLocaleLowerCase().startsWith(repeated ? term[0] : term)) { highlight(index); break } }
    }
  }
  const state = () => {
    if (select.multiple || select.size > 1) { close(); previous.forEach((value,key) => value === null ? select.removeAttribute(key) : select.setAttribute(key,value)); return }
    select.setAttribute('data-fastui-select', '')
    select.setAttribute('aria-haspopup', 'listbox')
    if (open) select.setAttribute('aria-controls', popup.id)
    else select.removeAttribute('aria-controls')
    select.setAttribute('aria-expanded', String(open))
    if (open) { if (!usable()) close(); else { render(); schedule() } }
  }
  const observer = new win.MutationObserver(state)
  observer.observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled','label','value','selected','hidden','multiple','size'] })
  const fieldset = select.closest('fieldset')
  if (fieldset) observer.observe(fieldset, { attributes: true, attributeFilter: ['disabled'] })
  const resize = new win.ResizeObserver(schedule); resize.observe(select)
  select.addEventListener('pointerdown', pointer)
  select.addEventListener('mousedown', pointer)
  select.addEventListener('click', click)
  select.addEventListener('keydown', keydown)
  select.addEventListener('change', close)
  select.addEventListener('blur', close)
  doc.addEventListener('pointerdown', outside, true)
  win.addEventListener('resize', schedule)
  win.addEventListener('scroll', schedule, true)
  win.visualViewport?.addEventListener('resize', schedule)
  win.visualViewport?.addEventListener('scroll', schedule)
  // Options keep focus on their owning select, including inside native dialogs.
  popup.addEventListener('pointerdown', event => event.preventDefault())
  const form = select.form; form?.addEventListener('reset', close)
  state()
  const cleanup = () => {
    close(); observer.disconnect(); resize.disconnect()
    select.removeEventListener('pointerdown', pointer); select.removeEventListener('mousedown', pointer); select.removeEventListener('click', click); select.removeEventListener('keydown', keydown); select.removeEventListener('change', close); select.removeEventListener('blur', close)
    doc.removeEventListener('pointerdown', outside, true); win.removeEventListener('resize', schedule); win.removeEventListener('scroll', schedule, true); win.visualViewport?.removeEventListener('resize', schedule); win.visualViewport?.removeEventListener('scroll', schedule); form?.removeEventListener('reset', close)
    previous.forEach((value,key) => value === null ? select.removeAttribute(key) : select.setAttribute(key,value))
    controllers.delete(select)
  }
  controllers.set(select, cleanup)
  return cleanup
}

export function disposeSelect(select: HTMLSelectElement) { controllers.get(select)?.() }
