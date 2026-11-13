import { expect } from '@playwright/test'

export async function runContentScenarios(browser, urls) {
  const results = []
  for (const framework of ['react', 'react18', 'vue']) {
    const page = await browser.newPage({ reducedMotion: 'reduce' })
    try {
      await page.goto(`${urls[framework]}?content-case`)
      const root = page.getByTestId('content-cases')
      const auto = root.getByRole('switch', { name: 'Auto save', exact: true })
      await expect(auto).not.toBeChecked()
      if (framework !== 'vue') {
        await root.getByRole('button', { name: 'Focus switch' }).click()
        await expect(auto).toBeFocused()
      } else await auto.focus()
      await page.keyboard.press('Space')
      await expect(auto).toBeChecked()
      await expect(root.getByTestId('switch-state')).toHaveText('true')
      expect(await root.locator('form').evaluate(form => Array.from(new FormData(form)))).toEqual([['auto', 'yes'], ['native', 'on']])
      await expect(root.getByRole('switch', { name: 'Disabled' })).toBeDisabled()
      const native = root.getByRole('switch', { name: 'Uncontrolled' })
      await native.uncheck()
      await root.getByRole('button', { name: 'Reset form' }).click()
      await expect(native).toBeChecked()
      await expect(root.getByRole('progressbar', { name: 'Lower bound' })).toHaveJSProperty('value', 0)
      await expect(root.getByRole('progressbar', { name: 'Upper bound' })).toHaveJSProperty('value', 10)
      await expect(root.getByRole('progressbar', { name: 'Upper bound' })).toHaveJSProperty('max', 10)
      await expect(root.getByRole('progressbar', { name: 'Unknown' })).not.toHaveAttribute('value')
      await expect(root.getByRole('progressbar', { name: 'Invalid' })).not.toHaveAttribute('value')
      await expect(root.getByRole('progressbar', { name: 'Invalid' })).toHaveJSProperty('max', 100)
      await expect(root.getByRole('progressbar', { name: 'Ratio' })).toHaveJSProperty('value', 0.5)
      const avatar = root.getByRole('img', { name: 'Ada Lovelace' })
      await expect(avatar).toHaveText('AL')
      await expect(avatar.locator('img')).toHaveCount(0)
      await expect(root.getByRole('img', { name: '林知远' })).toHaveText('林')
      await root.getByRole('button', { name: 'Load avatar' }).click()
      await expect.poll(() => avatar.locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
      await expect(root.locator('.fastui-skeleton')).toHaveCSS('animation-name', 'none')
      await expect(root.locator('.fastui-skeleton')).toHaveAttribute('aria-hidden', 'true')
      await expect(root.locator('kbd').first()).toHaveText('Ctrl')
      // Logical thumb placement follows direction without changing switch semantics.
      await root.evaluate(node => node.dir = 'rtl')
      await auto.check()
      const thumb = await auto.evaluate(node => {
        const style = getComputedStyle(node, '::after')
        return { right: parseFloat(style.right), width: node.getBoundingClientRect().width }
      })
      expect(thumb.right).toBeCloseTo(thumb.width - 19)
      await page.emulateMedia({ forcedColors: 'active' })
      await auto.focus()
      await page.keyboard.press('Tab')
      await page.keyboard.press('Shift+Tab')
      await expect(auto).toBeFocused()
      await expect(auto).toHaveCSS('outline-style', 'solid')
      results.push(`${framework}:content-card-switch-native-form-reset-progress-bounds-avatar-fallback-rtl-reduced-motion`)
    } finally { await page.close() }
  }
  return results
}
