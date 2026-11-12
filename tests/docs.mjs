import { chromium, expect } from '@playwright/test'
import { preview } from 'vite'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runMobileScenarios } from './mobile.mjs'

const artifacts = resolve('artifacts/docs')
await mkdir(artifacts, { recursive: true })
const base = (process.env.DOCS_BASE_PATH || '/').replace(/\/*$/, '/')
const server = await preview({ configFile: resolve('docs/vite.config.ts'), preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const url = origin + base
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {})
const results = []
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', colorScheme: 'light' })
  const page = await context.newPage()
  const errors = [], failures = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(origin)) failures.push(`${response.status()} ${response.url()}`) })
  await page.goto(url)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('介绍与安装')
  await expect(page.locator('.brand-mark')).toHaveAttribute('src', `${base}brand/fastui-icon.svg`)
  await expect.poll(() => page.locator('.brand-mark').evaluate(image => image.naturalWidth)).toBeGreaterThan(0)
  const icons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll(links => links.map(link => ({ href: link.getAttribute('href'), type: link.type || 'image/png' })))
  expect(icons).toHaveLength(3)
  for (const icon of icons) {
    expect(icon.href.startsWith(`${base}brand/`)).toBe(true)
    const response = await page.request.get(new URL(icon.href, url).href)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain(icon.type)
  }
  results.push('brand-image-favicons-and-apple-touch-icon')
  await page.evaluate(() => Promise.all([document.fonts.load('500 14px \"IBM Plex Sans Variable\"', 'Research'), document.fonts.load('500 14px \"Noto Sans SC Variable\"', '界面')]))
  expect(await page.evaluate(() => document.fonts.check('500 14px \"IBM Plex Sans Variable\"', 'Research') && document.fonts.check('500 14px \"Noto Sans SC Variable\"', '界面'))).toBe(true)
  await page.getByRole('searchbox', { name: '查找文档' }).fill('不存在的标题')
  await expect(page.getByRole('status', { name: '' }).filter({ hasText: '没有匹配的文档' })).toBeVisible()
  await page.getByRole('searchbox', { name: '查找文档' }).fill('')
  for (const title of ['色彩与排版', '组件与交互', '项目与工作台', '本地开发', '设计参考', '文档与发布', '介绍与安装']) {
    await page.getByRole('navigation', { name: '文档导航' }).getByRole('link', { name: title, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    await expect(page.locator('main')).toBeFocused()
  }
  await page.goto(`${url}#/unknown`)
  await expect(page.getByRole('heading', { name: '页面未找到' })).toBeVisible()
  results.push('navigation-search-focus-and-not-found')
  await page.goto(`${url}#/components`)
  const source = page.getByRole('tab', { name: 'main.tex' }).first()
  await source.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'notes.md' }).first()).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(source).toBeFocused()
  await page.getByRole('button', { name: '关闭 main.tex' }).click()
  await expect(page.getByRole('tab', { name: 'notes.md' }).first()).toBeFocused()
  await page.getByRole('button', { name: '关闭 notes.md' }).click()
  await expect(page.getByRole('heading', { name: '没有打开的文件' })).toBeVisible()
  await page.getByRole('button', { name: '重新打开文件' }).click()
  const marker = page.getByRole('img', { name: '未保存的更改' })
  expect(await marker.evaluate(node => [getComputedStyle(node).width, getComputedStyle(node).height])).toEqual(['6px', '6px'])
  await page.getByRole('button', { name: '新建项目', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '新建项目' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('textbox', { name: '名称', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button', { name: '新建项目', exact: true })).toBeFocused()
  const vue = page.getByTestId('vue-preview')
  await vue.getByRole('tab', { name: 'main.tex' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(vue.getByRole('tab', { name: 'notes.md' })).toBeFocused()
  await expect(vue.getByRole('tabpanel')).toHaveText('Vue · 研究笔记')
  await vue.getByRole('button', { name: '本地', exact: true }).click()
  await expect(vue.getByRole('status').filter({ hasText: '筛选：local' })).toBeVisible()
  await vue.getByRole('button', { name: 'Vue 设置' }).click()
  await expect(page.getByRole('textbox', { name: 'Vue 项目名称' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(vue.getByRole('button', { name: 'Vue 设置' })).toBeFocused()
  for (const framework of ['Vue', 'HTML', 'React']) {
    await page.getByRole('group', { name: '示例框架' }).getByRole('button', { name: framework, exact: true }).click()
    await expect(page.locator('.code-block pre')).toContainText(framework === 'Vue' ? '@fastrd/ui-vue' : framework === 'HTML' ? 'tokens.css' : '@fastrd/ui-react')
  }
  expect(await page.locator('.fastui-spinner').first().evaluate(node => getComputedStyle(node).animationName)).toBe('none')
  results.push('react-vue-tabs-dialog-focus-code-and-reduced-motion')
  const editor = page.getByTestId('react-editor')
  await editor.getByRole('button', { name: '流程结构' }).click()
  await expect(editor.getByRole('button', { name: '流程结构' })).toHaveAttribute('aria-pressed', 'true')
  await expect(editor.getByRole('button', { name: '趋势图表' })).toHaveAttribute('aria-pressed', 'false')
  await expect(editor.getByRole('heading', { name: '研究工作流程' })).toBeVisible()
  await editor.getByText('画布信息', { exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(editor.getByText('160 × 90 mm')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(editor.getByText('160 × 90 mm')).not.toBeVisible()
  await editor.getByRole('navigation', { name: '编辑器导航' }).getByRole('button', { name: '图层' }).click()
  await expect(editor.getByRole('heading', { name: '图层' })).toBeVisible()
  const vueEditor = page.getByTestId('vue-editor')
  await vueEditor.getByRole('button', { name: 'Vue 流程' }).focus()
  await page.keyboard.press('Enter')
  await expect(vueEditor.getByRole('button', { name: 'Vue 流程' })).toHaveAttribute('aria-pressed', 'true')
  await expect(vueEditor.getByLabel('Vue 画布预览')).toHaveText('流程预览')
  await expect(vueEditor.getByLabel('Vue 画布预览')).not.toHaveClass(/fastui-canvas--grid/)
  await vueEditor.getByText('Vue 属性', { exact: true }).click()
  await expect(vueEditor.locator('.fastui-inspector-body')).toBeVisible()
  // Both frameworks preserve disabled props and prevent accidental form submit.
  await expect(editor.getByRole('button', { name: '团队素材' })).toBeDisabled()
  await expect(vueEditor.getByRole('button', { name: 'Vue 锁定素材' })).toBeDisabled()
  for (const root of [editor, vueEditor]) {
    const card = root.getByRole('button', { name: /流程/ }).first()
    await expect(card).toHaveAttribute('type', 'button')
  }
  for (const mode of ['light', 'dark']) {
    await page.getByRole('combobox', { name: '颜色模式' }).selectOption(mode)
    for (const root of [editor, vueEditor]) {
      expect(await root.locator('.fastui-canvas').evaluate(node => getComputedStyle(node).backgroundColor)).toBe(mode === 'light' ? 'rgb(238, 240, 243)' : 'rgb(16, 22, 30)')
    }
    const button = page.getByRole('button', { name: '新建项目', exact: true })
    await button.hover()
    expect(await button.evaluate(node => getComputedStyle(node).color)).toBe('rgb(255, 255, 255)')
  }
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(editor.getByRole('button', { name: '流程结构' })).toHaveCSS('outline-style', 'solid')
  await page.emulateMedia({ forcedColors: 'none' })
  results.push('editor-primitives-react-vue-selection-keyboard-disclosure-disabled-grid-themes-forced-colors')
  // Preserve the established FastUI / FastWrite visual contract in both themes.
  for (const [mode, primary, secondary] of [
    ['light', 'rgb(21, 95, 184)', 'rgb(239, 241, 244)'],
    ['dark', 'rgb(14, 99, 156)', 'rgb(42, 53, 67)'],
  ]) {
    await page.getByRole('combobox', { name: '颜色模式' }).selectOption(mode)
    const primaryButton = page.getByRole('button', { name: '新建项目', exact: true })
    await page.mouse.move(0, 0)
    await expect(primaryButton).toHaveCSS('background-color', primary)
    await expect(page.getByRole('button', { name: '导入项目', exact: true })).toHaveCSS('background-color', secondary)
    await expect(primaryButton).toHaveCSS('min-height', '25px')
    await expect(primaryButton).toHaveCSS('border-radius', '4px')
    await expect(page.getByRole('textbox', { name: '项目名称', exact: true })).toHaveCSS('min-height', '28px')
    await expect(editor.getByRole('button', { name: '趋势图表' })).toHaveCSS('border-radius', '6px')
  }
  results.push('fastwrite-original-palette-filled-secondary-compact-geometry')


  await page.goto(`${url}#/patterns`)
  await expect(page.getByRole('status').filter({ hasText: '3 个项目' })).toBeVisible()
  await page.getByRole('group', { name: '项目来源' }).getByRole('button', { name: 'GitHub' }).click()
  await expect(page.getByRole('status').filter({ hasText: '1 个项目' })).toBeVisible()
  await page.getByRole('searchbox', { name: '搜索项目' }).fill('不存在')
  await expect(page.getByRole('heading', { name: '没有匹配的项目' })).toBeVisible()
  await page.getByRole('searchbox', { name: '搜索项目' }).fill('')
  await page.getByRole('group', { name: '项目来源' }).getByRole('button', { name: '全部', exact: true }).click()
  await page.getByRole('combobox', { name: '项目排序' }).selectOption('name')
  expect(await page.locator('.project-name strong').allTextContents()).toEqual(['多模态检索研究', '面向科研的写作工作流', '实验与文献笔记'])
  results.push('project-filter-search-sort-empty')
  await page.getByRole('combobox', { name: '颜色模式' }).selectOption('dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'dark')
  await page.getByRole('combobox', { name: '颜色模式' }).selectOption('system')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-fastui-theme', 'dark')
  results.push('theme-persistence-system')
  for (const width of [1440, 1024, 720, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const mode of ['light', 'dark']) {
      await page.getByRole('combobox', { name: '颜色模式' }).selectOption(mode)
      for (const route of ['start', 'design', 'components', 'patterns', 'references', 'development', 'deploy']) {
        await page.goto(`${url}#/${route}`)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route}/${mode}/${width} overflow`).toBe(true)
        // Capture the representative routes while checking every page for overflow.
        if (['start', 'components', 'patterns'].includes(route)) await page.screenshot({ path: resolve(artifacts, `${route}-${mode}-${width}.png`), fullPage: true })
      }
    }
  }
  await page.getByRole('button', { name: '目录', exact: true }).click()
  await expect(page.getByRole('navigation', { name: '文档导航' })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: '介绍与安装' }).click()
  await expect(page.getByRole('navigation', { name: '文档导航' })).not.toBeVisible()
  results.push('all-routes-light-dark-responsive-320-to-1440-and-mobile-navigation')
  for (const font of ['ibm-plex-sans', 'noto-sans-sc', 'jetbrains-mono']) {
    const response = await page.request.get(`${url}licenses/fonts/${font}.txt`)
    expect(response.ok()).toBe(true)
    expect(await response.text()).toContain('OPEN FONT LICENSE')
  }
  const html = await readFile('docs/dist/index.html', 'utf8')
  expect(html).toContain(`${base}assets/`)
  expect(failures).toEqual([])
  expect(errors).toEqual([])
  results.push('deployment-base-assets-font-licenses-no-runtime-errors')
  await context.close()
  results.push(...await runMobileScenarios(browser, url, artifacts))
  await writeFile(resolve(artifacts, 'results.json'), JSON.stringify({ status: 'passed', base, scenarios: results }, null, 2) + '\n')
  console.log(`PASS: ${results.length} documentation scenario groups; ${url}`)
} finally {
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))
}
