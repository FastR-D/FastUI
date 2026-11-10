import { expect } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function runDialogRegressions(browser, urls, artifacts) {
  const results = []
  const run = async (name, framework, mode, check) => {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(`${urls[framework]}/?dialog-case=${mode}`)
      await check(page)
      expect(errors).toEqual([])
      results.push({ name, status: 'passed' })
    } catch (error) {
      results.push({ name, status: 'failed', error: error.message })
    } finally { await page.close() }
    console.log(`${results.at(-1).status}: ${name}`)
  }
  const frameworks = ['react', 'react18', 'react-dev', 'react18-dev'].filter(framework => urls[framework])
  for (const framework of ['vue', ...frameworks]) await run(`${framework}:initial-open-nested-stack`, framework, 'stack', async page => {
    await page.getByRole('button', { name: 'Child focus', exact: true }).focus()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('requests')).toHaveText('child')
    await expect(page.getByRole('dialog', { name: 'Initial child', exact: true })).not.toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Initial parent', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Parent focus', exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('requests')).toHaveText('child,parent')
  })
  for (const [mode, attribute, value, name] of [
    ['native-label', 'aria-label', 'Native label', 'Native label'],
    ['native-labelledby', 'aria-labelledby', 'native-heading', 'Native heading'],
    ['prop-label', 'aria-label', 'Prop label', 'Prop label'],
    ['prop-labelledby', 'aria-labelledby', 'prop-heading', 'Prop heading'],
    ['label-precedence', 'aria-label', 'Prop label', 'Prop label'],
    ['labelledby-precedence', 'aria-labelledby', 'prop-heading', 'Prop heading'],
  ]) await run(`vue:modal-${mode}`, 'vue', mode, async page => {
    await expect(page.locator('dialog')).toHaveAttribute(attribute, value)
    await expect(page.getByRole('dialog', { name, exact: true })).toBeVisible()
  })
  for (const framework of frameworks) for (const mode of ['ref-cleanup', 'ref-null']) await run(`${framework}:dialog-${mode}`, framework, mode, async page => {
    const detached = mode === 'ref-cleanup' ? 'cleanup' : 'null'
    const initial = framework === 'react-dev' ? ['attach:0', `${detached}:0`, 'attach:0'] : ['attach:0']
    await expect.poll(() => page.evaluate(() => window.refEvents)).toEqual(initial)
    await page.getByRole('button', { name: 'Rerender', exact: true }).click()
    expect(await page.evaluate(() => window.refEvents)).toEqual(initial)
    await page.getByRole('button', { name: 'Replace ref', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.refEvents)).toEqual([...initial, `${detached}:0`, 'attach:1'])
    await page.getByRole('button', { name: 'Unmount', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.refEvents)).toEqual([...initial, `${detached}:0`, 'attach:1', `${detached}:1`])
  })
  const packages = JSON.parse(await readFile(join(artifacts, 'packages.json'), 'utf8'))
  await writeFile(join(artifacts, 'dialog-regressions.json'), JSON.stringify({
    status: results.every(result => result.status === 'passed') ? 'passed' : 'failed', packages, results,
  }, null, 2) + '\n')
  const failed = results.filter(result => result.status === 'failed')
  if (failed.length) {
    throw new Error(`Packed dialog regressions failed: ${failed.map(result => result.name).join(', ')}; see artifacts/dialog-regressions.json`)
  }
  return results.map(result => result.name)
}
