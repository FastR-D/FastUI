import { expect } from '@playwright/test'

export async function runWorkbenchScenarios(browser, urls) {
  const passed = []
  for (const framework of ['react', 'react18', 'vue']) {
    const page = await browser.newPage({ reducedMotion: 'reduce' })
    try {
      await page.goto(urls[framework])
      const source = page.getByRole('tab', { name: 'Source', exact: false })
      const notes = page.getByRole('tab', { name: 'Notes file' })
      await expect(page.getByRole('tablist', { name: 'Files' })).toHaveAttribute('aria-owns', 'work-source work-disabled work-notes')
      await expect(page.getByRole('tab', { name: 'Disabled file' })).toBeDisabled()
      await source.focus()
      await page.keyboard.press('ArrowRight')
      await expect(notes).toBeFocused()
      await expect(notes).toHaveAttribute('aria-selected', 'true')
      await page.keyboard.press('ArrowRight')
      await expect(source).toBeFocused()
      await page.keyboard.press('End')
      await expect(notes).toBeFocused()
      await page.keyboard.press('Home')
      await expect(source).toBeFocused()
      await source.locator('..').locator('..').evaluate(node => node.setAttribute('dir', 'rtl'))
      await page.keyboard.press('ArrowLeft')
      await expect(notes).toBeFocused()
      const marker = page.getByRole('img', { name: 'Unsaved changes' })
      expect(await marker.evaluate(node => { const s = getComputedStyle(node); return [s.width, s.height] })).toEqual(['6px', '6px'])
      expect(await notes.evaluate(node => getComputedStyle(node).borderRadius)).toBe('0px')
      passed.push(`${framework}:workbench-keyboard-disabled-rtl-and-markers`)
      await page.getByRole('button', { name: 'Close Notes file' }).click()
      await expect(source).toBeFocused()
      await expect(page.getByRole('tabpanel')).toHaveText('work-source')
      await page.getByRole('button', { name: 'Close Source' }).click()
      await expect(page.getByRole('tabpanel')).toHaveText('No file')
      expect(await page.locator('[role=tab][tabindex="0"]').count()).toBe(0)
      passed.push(`${framework}:workbench-close-focus-and-empty`)
      await page.getByRole('button', { name: 'Local sources' }).click()
      await expect(page.getByRole('button', { name: 'Local sources' })).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByRole('status', { name: 'Source status' })).toHaveText('local')
      await expect(page.getByRole('button', { name: 'Locked sources' })).toBeDisabled()
      passed.push(`${framework}:workbench-segmented-controlled-status`)
    } finally { await page.close() }
  }
  return passed
}
