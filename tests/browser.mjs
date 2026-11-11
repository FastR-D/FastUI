import { expect } from '@playwright/test'
import { join } from 'node:path'

export async function runScenarios(browser, urls, artifacts) {
  const passed = []
  for (const framework of ['vue', 'react', 'html', ...(urls.react18 ? ['react18'] : [])]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1024 }, colorScheme: 'light', reducedMotion: 'reduce' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(urls[framework])
    await expect(page.getByRole('heading').first()).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'light')
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Ada')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(framework === 'html' ? page.locator('#saved') : page.getByTestId('saved')).toHaveText('1')
    await expect(page.getByRole('button', { name: 'Unavailable', exact: true })).toBeDisabled()
    if (framework !== 'html') {
      await expect(page.getByRole('button', { name: 'Saving', exact: true })).toBeDisabled()
      await page.getByRole('checkbox', { name: 'Include notes' }).check()
      await expect(page.getByTestId('checked')).toHaveText('true')
      await page.getByRole('textbox', { name: 'Notes', exact: true }).fill('Keep references')
      await page.getByRole('combobox', { name: 'Format', exact: true }).selectOption('svg')
      await expect(page.getByTestId('format')).toHaveText(framework === 'vue' ? 'svg:1' : 'svg')
      if (framework === 'vue') {
        await page.getByRole('combobox', { name: 'Format', exact: true }).selectOption('svg')
        await expect(page.getByTestId('format')).toHaveText('svg:1')
        await expect(page.getByRole('combobox', { name: 'Disabled format' })).toBeDisabled()
        await expect(page.getByRole('combobox', { name: 'Empty format' })).toHaveText('No formats')
        await page.getByRole('textbox', { name: 'Name', exact: true }).fill('  Ada  ')
        await page.getByRole('textbox', { name: 'Notes', exact: true }).focus()
        await expect(page.getByTestId('name')).toHaveText('Ada')
        await page.getByRole('spinbutton', { name: 'Count' }).fill('42')
        await expect(page.getByTestId('count')).toHaveText('0')
        await page.getByRole('textbox', { name: 'Notes', exact: true }).focus()
        await expect(page.getByTestId('count')).toHaveText('42')
        const input = page.getByRole('textbox', { name: 'Name', exact: true })
        await input.dispatchEvent('compositionstart')
        await input.evaluate(node => { node.value = '中'; node.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true })) })
        await expect(page.getByTestId('name')).toHaveText('Ada')
        await input.dispatchEvent('compositionend')
        await expect(page.getByTestId('name')).toHaveText('中')
        passed.push('vue:model-modifiers-and-ime')
      } else {
        await page.getByRole('button', { name: 'Focus name' }).click()
        await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused()
        await expect(page.getByRole('alert')).toBeVisible()
        await expect(page.getByRole('status', { name: '' }).filter({ hasText: 'Checking connection' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'No exports yet' })).toBeVisible()
        passed.push(`${framework}:native-ref-and-feedback`)
      }
    }
    passed.push(`${framework}:native-form-and-controlled-input`)
    const preview = await page.getByRole('textbox', { name: 'Preview input' }).evaluate(node => {
      const style = getComputedStyle(node)
      return { className: node.className, radius: style.borderRadius, minHeight: style.minHeight }
    })
    expect(preview.className).toBe('')
    expect(preview.minHeight).toBe('0px')
    passed.push(`${framework}:preview-input-not-reset`)
    await page.getByRole('button', { name: 'Open settings', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Settings', exact: true })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Dialog name' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    // Native dialog may visit browser chrome at the boundary (body is active),
    // but must never focus the inert page. Continue the native traversal.
    if (await page.evaluate(() => document.activeElement === document.body)) await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Close settings', exact: true })).toBeFocused()
    await page.keyboard.press('Tab')
    if (await page.evaluate(() => document.activeElement === document.body)) await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Dialog name' })).toBeFocused()
    if (framework !== 'html') {
      await page.getByRole('button', { name: 'Open nested' }).click()
      await expect(page.getByRole('dialog', { name: 'Nested settings' })).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog', { name: 'Nested settings' })).not.toBeVisible()
      await expect(dialog).toBeVisible()
      await expect(page.getByRole('button', { name: 'Open nested' })).toBeFocused()
      passed.push(`${framework}:nested-dialog-and-return-focus`)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeFocused()
    passed.push(`${framework}:dialog-tab-escape-restoration`)
    if (framework !== 'html') {
      await page.getByRole('button', { name: 'Open locked' }).click()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog', { name: 'Locked settings' })).toBeVisible()
      await page.mouse.click(5, 5)
      await expect(page.getByRole('dialog', { name: 'Locked settings' })).toBeVisible()
      await page.getByRole('button', { name: 'Unlock' }).click()
      await page.getByRole('button', { name: 'Open settings', exact: true }).click()
      await page.mouse.click(5, 5)
      await expect(dialog).not.toBeVisible()
      passed.push(`${framework}:backdrop-and-nondismissible`)
    }
    // Local theme remains inherited when a dialog enters the browser top layer.
    await page.evaluate(() => window.theme.setMode('dark'))
    const themeTarget = framework === 'html' ? page.locator('main') : page.locator('html')
    await expect(themeTarget).toHaveAttribute('data-fastui-theme', 'dark')
    await page.getByRole('button', { name: 'Open settings', exact: true }).click()
    expect(await dialog.evaluate(node => getComputedStyle(node).backgroundColor)).toBe('rgb(23, 30, 39)')
    await page.keyboard.press('Escape')
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 1024 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      for (const mode of ['light', 'dark']) {
        await page.evaluate(mode => window.theme.setMode(mode), mode)
        await page.screenshot({ path: join(artifacts, `${framework}-${mode}-${width}.png`), fullPage: true })
      }
    }
    passed.push(`${framework}:theme-in-top-layer-and-responsive-screenshots`)
    await page.evaluate(() => window.theme.setMode('system'))
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(themeTarget).toHaveAttribute('data-fastui-theme', 'dark')
    await page.evaluate(() => window.theme.setMode('light'))
    await expect(themeTarget).toHaveAttribute('data-fastui-theme', 'light')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(themeTarget).toHaveAttribute('data-fastui-theme', 'light')
    passed.push(`${framework}:system-and-explicit-mode`)
    if (framework === 'vue') {
      const mappings = page.getByTestId('mappings')
      for (const [mode, primary, channels] of [['light', '#155fb8', '21, 95, 184'], ['dark', '#0e639c', '14, 99, 156']]) {
        await page.evaluate(mode => window.theme.setMode(mode), mode)
        expect(await mappings.evaluate(node => getComputedStyle(node).getPropertyValue('--fastui-primary').trim())).toBe(primary)
        expect(await mappings.evaluate(node => getComputedStyle(node).getPropertyValue('--mdui-color-primary').trim())).toBe(channels)
      }
      // A local light integration nested below a dark app must resolve locally.
      await mappings.evaluate(node => { node.dataset.fastuiTheme = 'light' })
      expect(await mappings.evaluate(node => getComputedStyle(node).getPropertyValue('--mdui-color-primary').trim())).toBe('21, 95, 184')
      expect(await page.getByTestId('preview').evaluate(node => getComputedStyle(node).getPropertyValue('--vscode-button-background'))).toBe('')
      passed.push('foundation:scoped-mdui-rgb-mappings')
    }
    expect(errors).toEqual([])
    await context.close()
  }

  const context = await browser.newContext({ colorScheme: 'dark' })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('fastui-example-mode', 'light'))
  await page.goto(urls.vue)
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'light')
  const other = await context.newPage()
  await other.goto(urls.vue)
  await other.evaluate(() => window.theme.setMode('dark'))
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'dark')
  await other.evaluate(() => { localStorage.clear() })
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'light')
  await page.evaluate(() => window.theme.dispose())
  await other.evaluate(() => window.theme.setMode('dark'))
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'light')
  passed.push('foundation:existing-key-cross-tab-clear-and-dispose')
  await context.close()

  const denied = await browser.newContext({ colorScheme: 'dark' })
  const deniedPage = await denied.newPage()
  await deniedPage.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError') } }))
  await deniedPage.goto(urls.react)
  await expect(deniedPage.locator('html')).toHaveAttribute('data-fastui-theme', 'dark')
  await deniedPage.evaluate(() => window.theme.setMode('light'))
  await expect(deniedPage.locator('html')).toHaveAttribute('data-fastui-theme', 'light')
  passed.push('foundation:denied-storage-in-memory-mode')
  await denied.close()
  const invalid = await browser.newContext({ colorScheme: 'dark' })
  const invalidPage = await invalid.newPage()
  await invalidPage.addInitScript(() => localStorage.setItem('fastui-example-mode', 'not-a-mode'))
  await invalidPage.goto(urls.vue)
  await expect(invalidPage.locator('html')).toHaveAttribute('data-fastui-theme', 'dark')
  await invalidPage.emulateMedia({ colorScheme: 'light' })
  await expect(invalidPage.locator('html')).toHaveAttribute('data-fastui-theme', 'light')
  passed.push('foundation:invalid-preference-follows-system')
  await invalid.close()
  const early = await browser.newContext({ colorScheme: 'light' })
  const earlyPage = await early.newPage()
  await earlyPage.addInitScript(() => {
    localStorage.setItem('fastui-example-mode', 'dark')
    new MutationObserver((_, observer) => {
      if (document.querySelector('main')) {
        window.themeAtContentInsertion = document.documentElement.dataset.fastuiTheme
        observer.disconnect()
      }
    }).observe(document, { childList: true, subtree: true })
  })
  await earlyPage.goto(urls.html)
  expect(await earlyPage.evaluate(() => window.themeAtContentInsertion)).toBe('dark')
  passed.push('html:parser-blocking-theme-before-content')
  await early.close()
  return passed
}
