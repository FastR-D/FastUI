import { expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function runMobileScenarios(browser, url, artifacts) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const results = []
  try {
    await page.goto(`${url}#/components`)
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
    const create = page.getByRole('button', { name: '新建项目', exact: true })
    await expect(create).toHaveCSS('min-height', '44px')
    await expect(page.getByRole('textbox', { name: '项目名称', exact: true })).toHaveCSS('font-size', '16px')
    for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [844, 390]]) {
      await page.setViewportSize({ width, height })
      for (const mode of ['light', 'dark']) {
        await page.getByRole('combobox', { name: '颜色模式' }).selectOption(mode)
        for (const route of ['start', 'design', 'components', 'content', 'patterns']) {
          await page.goto(`${url}#/${route}`)
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `touch overflow ${width}/${height}/${mode}/${route}`).toBe(true)
          if (route === 'components') {
            await expect(page.getByRole('button', { name: '关闭 main.tex' })).toHaveCSS('width', '44px')
            await page.screenshot({ path: resolve(artifacts, `touch-${mode}-${width}x${height}.png`), fullPage: true })
          }
        }
      }
    }
    results.push('touch-light-dark-phone-tablet-landscape-no-page-overflow')
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${url}#/components`)
    const vue = page.getByTestId('vue-preview')
    await expect(vue.getByRole('button', { name: 'Vue 设置' })).toHaveCSS('min-height', '44px')
    await vue.getByRole('button', { name: '本地', exact: true }).tap()
    await expect(vue.getByRole('button', { name: '本地', exact: true })).toHaveAttribute('aria-pressed', 'true')
    const source = page.getByRole('tab', { name: 'main.tex' }).first()
    await source.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'notes.md' }).first()).toBeFocused()
    await page.getByRole('button', { name: '关闭 notes.md' }).tap()
    await expect(source).toBeFocused()
    results.push('touch-react-vue-tap-tabs-close-focus')
    await page.goto(`${url}#/content`)
    for (const framework of ['react', 'vue']) {
      const toggle = page.getByTestId(`${framework}-content`).getByRole('switch', { name: '自动保存', exact: true })
      await expect(toggle).toHaveCSS('width', '44px')
      await expect(toggle).toHaveCSS('height', '44px')
      await toggle.tap()
      await expect(toggle).not.toBeChecked()
    }
    results.push('touch-react-vue-switch-targets-and-tap')
    await page.goto(`${url}#/components`)
    for (const framework of ['react', 'vue']) {
      const trigger = framework === 'react' ? create : vue.getByRole('button', { name: 'Vue 设置' })
      await trigger.tap()
      const dialog = page.getByRole('dialog', { name: framework === 'react' ? '新建项目' : 'Vue 设置', exact: true })
      await expect(dialog).toBeVisible()
      const input = dialog.getByRole('textbox').first()
      await expect(input).toHaveCSS('font-size', '16px')
      await input.fill('移动端编辑')
      // A short viewport approximates the layout space left by a virtual keyboard.
      await page.setViewportSize({ width: 390, height: 300 })
      const bounds = await dialog.boundingBox()
      expect(bounds.x).toBeGreaterThanOrEqual(7)
      expect(bounds.y).toBeGreaterThanOrEqual(7)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(294)
      await dialog.getByRole('button', { name: framework === 'react' ? '完成' : '完成 Vue 设置', exact: true }).tap()
      await expect(dialog).not.toBeVisible()
      await expect(trigger).toBeFocused()
      await page.setViewportSize({ width: 390, height: 844 })
    }
    results.push('touch-dialogs-short-viewport-input-and-focus-restoration')
    const menu = page.getByRole('button', { name: '目录', exact: true })
    await menu.tap()
    await expect(page.getByRole('searchbox', { name: '查找文档' })).toBeFocused()
    expect(await page.locator('main').evaluate(node => node.inert)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(menu).toBeFocused()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await menu.tap()
    await page.getByRole('navigation', { name: '文档导航' }).getByRole('link', { name: '组件与交互', exact: true }).tap()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('main')).toBeFocused()
    expect(await page.locator('body').evaluate(node => node.style.overflow)).toBe('')
    await menu.tap()
    await page.setViewportSize({ width: 1024, height: 768 })
    await expect(page.locator('main')).not.toHaveAttribute('inert', '')
    expect(await page.locator('body').evaluate(node => node.style.overflow)).toBe('')
    results.push('mobile-menu-focus-escape-current-route-resize-and-scroll-cleanup')
    // Check the standalone HTML stylesheet as well as the Uno-generated docs.
    const css = await readFile('packages/foundation/dist/tokens.css', 'utf8') + await readFile('packages/foundation/dist/controls.css', 'utf8')
    await page.setViewportSize({ width: 320, height: 640 })
    await page.setContent(`<meta name="viewport" content="width=device-width,initial-scale=1"><style>${css} body{margin:0}</style>
      <section data-fastui-density="compact"><button class="fastui-button fastui-button--sm">Compact</button><div data-fastui-density="touch"><button class="fastui-button fastui-button--xs">Touch</button><input class="fastui-input" aria-label="Touch input"><button class="fastui-button fastui-button--icon" aria-label="Tool">+</button></div></section>
      <label class="fastui-field"><input class="fastui-input" type="checkbox">Include references</label>
      <div class="fastui-table-scroll" role="region" aria-label="Wide data" tabindex="0"><table class="fastui-table" style="min-width:700px"><tr><td>Column</td></tr></table></div>`)
    await expect(page.getByRole('button', { name: 'Compact', exact: true })).toHaveCSS('min-height', '25px')
    await expect(page.getByRole('button', { name: 'Touch', exact: true })).toHaveCSS('min-height', '44px')
    await expect(page.getByLabel('Touch input')).toHaveCSS('font-size', '16px')
    const toolBounds = await page.getByRole('button', { name: 'Tool' }).boundingBox()
    expect(toolBounds.width).toBeGreaterThanOrEqual(44)
    expect(toolBounds.height).toBeGreaterThanOrEqual(44)
    await page.getByText('Include references').tap()
    await expect(page.getByRole('checkbox')).toBeChecked()
    const table = page.getByRole('region', { name: 'Wide data' })
    expect(await table.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    results.push('standalone-html-scoped-density-touch-targets-checkbox-and-table-scroll')
    return results
  } finally { await context.close() }
}
