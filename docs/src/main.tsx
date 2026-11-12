import { StrictMode, useEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createApp, h, ref } from 'vue'
import { initColorMode, type ColorMode } from '@fastrd/ui-foundation'
import { ActivityRail, AssetCard, CanvasSurface, InspectorSection, PanelHeader, Alert, Badge, Button, Checkbox, Dialog, Divider, EmptyState, ListRow, Loading, Section, SegmentedControl, Select, StatusBar, TabBar, TextArea, TextField, Toolbar, type TabItem } from '@fastrd/ui-react'
import * as VueUI from '@fastrd/ui-vue'
import tokens from '../../packages/foundation/tokens.json'
import sources from '../reference-sources.json'
import '@fontsource-variable/ibm-plex-sans'
import '@fontsource-variable/noto-sans-sc'
import '@fontsource-variable/jetbrains-mono'
import 'virtual:uno.css'
import './site.css'

const theme = initColorMode({ storageKey: 'fastui-docs-mode' })
const routes = [
  { id: 'start', group: '开始使用', title: '介绍与安装', description: '沿用原版 FastUI 与 FastWrite 的视觉规范，为科研工具提供一致、清晰的工作界面。' },
  { id: 'design', group: '设计基础', title: '色彩与排版', description: '以语义变量连接浅色与深色界面，让颜色表达状态，让间距保持稳定。' },
  { id: 'components', group: '组件', title: '组件与交互', description: '同一套外观与交互约定，分别适配 React、Vue 和原生 HTML。' },
  { id: 'patterns', group: '组合模式', title: '项目与工作台', description: '固定工具区、独立滚动列表、平直页签和轻量状态反馈。' },
  { id: 'development', group: '工程', title: '本地开发', description: '使用 pnpm 工作区开发、构建和验证 FastUI。' },
  { id: 'references', group: '工程', title: '设计参考', description: '记录参考版本和设计取舍，保持代码来源可追踪。' },
  { id: 'deploy', group: '工程', title: '文档与发布', description: '在本地预览文档，通过 GitHub Actions 检查、部署和发布。' },
]
const initialTabs: TabItem[] = [
  { id: 'demo-source', label: 'main.tex', controls: 'demo-panel', dirty: true },
  { id: 'demo-notes', label: 'notes.md', controls: 'demo-panel', preview: true },
  { id: 'demo-locked', label: '只读附件', disabled: true, controls: 'demo-panel' },
]
function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  return <div className="code-block"><Button size="xs" variant="quiet" aria-label="复制代码" onClick={async () => {
    try { await navigator.clipboard.writeText(children); setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) }
  }}>{copied ? '已复制' : '复制'}</Button><pre><code>{children}</code></pre><span className="sr-only" role="status">{copied ? '代码已复制' : ''}</span></div>
}
function Example({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return <section className="example"><div className="example-heading"><h2>{title}</h2>{note && <p>{note}</p>}</div><div className="example-preview">{children}</div></section>
}
function AssetPreview({ kind = 'chart' }: { kind?: string }) {
  return kind === 'chart' ? <svg viewBox="0 0 120 72" fill="none" aria-hidden="true"><path d="M16 12v46h90" stroke="var(--fastui-border-strong)" /><path d="M25 48 45 34 65 40 94 17" stroke="var(--fastui-focus)" strokeWidth="3" /><path d="M25 54 45 47 65 49 94 34" stroke="var(--fastui-ai)" strokeWidth="2" /></svg> : <svg viewBox="0 0 120 72" fill="none" aria-hidden="true"><path d="M38 36h44" stroke="var(--fastui-focus)" strokeWidth="2" /><rect x="8" y="22" width="32" height="28" rx="4" fill="var(--fastui-selected)" stroke="var(--fastui-focus)" /><rect x="80" y="22" width="32" height="28" rx="4" fill="var(--fastui-ai-soft)" stroke="var(--fastui-ai)" /></svg>
}
function EditorPreview() {
  const [asset, setAsset] = useState('chart'), [tool, setTool] = useState('素材')
  return <div className="editor-demo" data-testid="react-editor"><div className="editor-top"><span className="editor-brand">F<span> / </span>工作台</span><span>研究图表</span><Badge tone="success">已保存</Badge></div>
    <div className="editor-layout"><ActivityRail label="编辑器导航">{['素材', '图层', '助手'].map((label, i) => <Button key={label} variant="navigation" aria-pressed={tool === label} aria-label={label} onClick={() => setTool(label)}><span className="rail-glyph" aria-hidden="true">{['▦', '▱', '✧'][i]}</span>{label}</Button>)}</ActivityRail>
      <aside className="editor-library"><PanelHeader><h3>{tool}</h3><Badge>02</Badge></PanelHeader><div className="editor-library-body"><span className="eyebrow">可复用素材</span>{['chart', 'flow'].map((kind, i) => <AssetCard key={kind} label={i ? '流程结构' : '趋势图表'} description={i ? '结构 / 双节点' : '图表 / 双系列'} selected={asset === kind} onClick={() => setAsset(kind)} preview={<AssetPreview kind={kind} />} />)}<AssetCard label="团队素材" description="暂无访问权限" disabled /></div></aside>
      <div className="editor-workspace"><Toolbar label="画布工具"><span>{asset === 'chart' ? '趋势图表' : '流程结构'}</span><span className="ml-auto">100%</span></Toolbar><CanvasSurface tabIndex={0} aria-label="画布预览"><div className="editor-paper"><span className="eyebrow">FIGURE 01</span><h3>{asset === 'chart' ? '实验结果趋势' : '研究工作流程'}</h3><AssetPreview kind={asset} /><span className="editor-paper-caption">{asset === 'chart' ? '方法 A 与方法 B 的对比' : '从输入到结果的结构'}</span></div></CanvasSurface><StatusBar><span>可编辑预览</span><span className="ml-auto">SVG</span></StatusBar></div>
      <aside className="editor-inspector"><PanelHeader><h3>属性</h3></PanelHeader><InspectorSection label="外观" open><label className="fastui-field">名称<TextField size="sm" aria-label="素材名称" value={asset === 'chart' ? '趋势图表' : '流程结构'} readOnly /></label><div className="row"><span className="color-chip" /><span>主题蓝</span></div></InspectorSection><InspectorSection label="画布信息"><span>160 × 90 mm</span><span>矢量 / 可编辑</span></InspectorSection></aside>
    </div></div>
}
function VuePreview() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const app = createApp({ setup() {
      const active = ref('vue-source'), selected = ref('all'), open = ref(false), asset = ref('chart')
      const tabs = ref([{ id: 'vue-source', label: 'main.tex', dirty: true, controls: 'vue-panel' }, { id: 'vue-disabled', label: '不可用', disabled: true, controls: 'vue-panel' }, { id: 'vue-notes', label: 'notes.md', controls: 'vue-panel' }])
      return () => h('div', { class: 'vue-demo' }, [
        h(VueUI.TabBar, { tabs: tabs.value, activeId: active.value, label: 'Vue 文件', onSelect: id => { active.value = id } }),
        h('div', { id: 'vue-panel', role: 'tabpanel', 'aria-labelledby': active.value, tabindex: 0, class: 'demo-body' }, active.value === 'vue-source' ? 'Vue · 源码预览' : 'Vue · 研究笔记'),
        h(VueUI.Toolbar, { label: 'Vue 筛选' }, { default: () => [
          h(VueUI.SegmentedControl, { label: 'Vue 来源', options: [{ value: 'all', label: '全部' }, { value: 'local', label: '本地' }, { value: 'disabled', label: '不可用', disabled: true }], value: selected.value, onChange: value => { selected.value = value } }),
          h(VueUI.Button, { onClick: () => { open.value = true } }, { default: () => 'Vue 设置' }),
        ] }),
        h(VueUI.StatusBar, {}, { default: () => `筛选：${selected.value}` }),
        h(VueUI.Modal, { open: open.value, label: 'Vue 设置', onClose: () => { open.value = false } }, { default: () => h(VueUI.ModalBody, {}, { default: () => [h('h2', 'Vue 设置'), h(VueUI.TextField, { 'aria-label': 'Vue 项目名称', autofocus: true }), h(VueUI.Button, { onClick: () => { open.value = false } }, { default: () => '完成 Vue 设置' })] }) }),
        h('div', { class: 'vue-editor-demo', 'data-testid': 'vue-editor' }, [
          h(VueUI.ActivityRail, { label: 'Vue 编辑器导航' }, { default: () => h(VueUI.Button, { variant: 'navigation', 'aria-pressed': true }, { default: () => '素材' }) }),
          h('div', { class: 'vue-editor-content' }, [
            h(VueUI.PanelHeader, {}, { default: () => 'Vue 素材面板' }),
            h('div', { class: 'asset-demo-grid' }, ['chart', 'flow'].map((kind, i) => h(VueUI.AssetCard, { label: i ? 'Vue 流程' : 'Vue 图表', description: '矢量素材', selected: asset.value === kind, onClick: () => { asset.value = kind } }, { preview: () => h('span', { class: 'rail-glyph' }, i ? '▱' : '▦') }))),
            h(VueUI.AssetCard, { label: 'Vue 锁定素材', disabled: true }),
            h(VueUI.CanvasSurface, { grid: asset.value === 'chart', tabindex: 0, 'aria-label': 'Vue 画布预览' }, { default: () => h('span', asset.value === 'chart' ? '图表预览' : '流程预览') }),
            h(VueUI.InspectorSection, { label: 'Vue 属性' }, { default: () => '矢量 / 可编辑' }),
          ]),
        ]),
        h(VueUI.Alert, { tone: 'success' }, { default: () => 'Vue 与 React 使用相同的语义色。' }),
      ])
    } })
    app.mount(root.current!)
    return () => app.unmount()
  }, [])
  return <div ref={root} data-testid="vue-preview" />
}
function Components() {
  const [open, setOpen] = useState(false), [active, setActive] = useState('demo-source')
  const [tabs, setTabs] = useState(initialTabs), [format, setFormat] = useState('pdf'), [framework, setFramework] = useState('react')
  return <>
    <Example title="操作与输入" note="24 / 25 / 28px 三档控件；表单标签、禁用和加载状态使用原生语义。">
      <div className="grid gap-4"><div className="row"><Button variant="primary" onClick={() => setOpen(true)}>新建项目</Button><Button>导入项目</Button><Button variant="quiet">更多操作</Button><Button variant="danger">删除</Button><Button disabled>不可用</Button><Button loading>正在保存</Button></div>
      <div className="form-grid"><label className="fastui-field">项目名称<TextField placeholder="输入项目名称" /></label><label className="fastui-field">导出格式<Select value={format} onChange={event => setFormat(event.target.value)}><option value="pdf">PDF 文档</option><option value="svg">SVG 图形</option></Select></label></div>
      <label className="fastui-field">研究笔记<TextArea placeholder="记录你的想法…" rows={3} /></label><label className="fastui-field"><Checkbox defaultChecked /> 包含参考文献</label></div>
    </Example>
    <Example title="页签与工具区" note="方向键、Home / End 切换；跳过禁用项。关闭行为和面板状态由应用管理。">
      <div className="demo-frame"><TabBar tabs={tabs} activeId={active} label="编辑文件" onSelect={setActive} dirtyLabel="未保存的更改" closeLabel={tab => `关闭 ${tab.label}`} onClose={id => { const remaining = tabs.filter(tab => tab.id !== id); setTabs(remaining); if (active === id) setActive(remaining.find(tab => !tab.disabled)?.id ?? '') }} />
      <div className="demo-body" role="tabpanel" id="demo-panel" aria-labelledby={active || undefined} aria-label={active ? undefined : '无打开的文件'} tabIndex={0}>{active ? <code>{active === 'demo-source' ? '\\documentclass{article}\n\\begin{document}\n  写作，从一个想法开始。\n\\end{document}' : '# 研究笔记\n\n保留思考的线索。'}</code> : <EmptyState title="没有打开的文件" action={<Button onClick={() => { setTabs(initialTabs); setActive('demo-source') }}>重新打开文件</Button>} />}</div>
      <StatusBar><Badge tone="success">已连接</Badge><span>UTF-8</span><span className="ml-auto">LaTeX</span></StatusBar></div>
    </Example>
    <Example title="编辑器与素材" note="参考 FastFigure 的组件组织，配色与外观遵循 FastUI / FastWrite。点击素材切换预览。"><EditorPreview /></Example>
    <Example title="反馈与空状态"><div className="grid gap-4"><div className="row"><Badge>信息</Badge><Badge tone="success">已完成</Badge><Badge tone="warning">待检查</Badge><Badge tone="danger">失败</Badge></div><Alert tone="warning">存在未保存的更改，离开前请保存。</Alert><Loading label="正在读取文档" /><Divider /><EmptyState title="还没有项目" action={<Button onClick={() => setOpen(true)}>创建第一个项目</Button>}><p>从空白项目开始，或导入已有内容。</p></EmptyState></div></Example>
    <Example title="Vue 实时示例" note="此区域直接挂载 @fastrd/ui-vue，支持键盘切换、筛选和原生模态框。"><VuePreview /></Example>
    <h2>调用示例</h2><SegmentedControl label="示例框架" value={framework} onChange={setFramework} options={[{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'html', label: 'HTML' }]} />
    <Code>{framework === 'react' ? `import { Button, TabBar } from '@fastrd/ui-react'\nimport 'virtual:uno.css'\n\n<TabBar label="文件" tabs={tabs} activeId={active}\n  onSelect={setActive} />\n<Button variant="primary" onClick={save}>保存</Button>` : framework === 'vue' ? `<script setup>\nimport { Button, TabBar } from '@fastrd/ui-vue'\nimport 'virtual:uno.css'\n</script>\n\n<TabBar label="文件" :tabs="tabs" :active-id="active"\n  @select="active = $event" />\n<Button variant="primary" @click="save">保存</Button>` : `<link rel="stylesheet" href="./tokens.css">\n<link rel="stylesheet" href="./controls.css">\n<button class="fastui-button fastui-button--primary"\n  type="button">保存</button>\n<!-- HTML 提供样式；页签键盘行为由应用实现。 -->`}</Code>
    <h2>组件 API</h2><div className="table-scroll"><table className="api-table"><thead><tr><th>组件</th><th>主要属性</th><th>约定</th></tr></thead><tbody>
      <tr><td>ActivityRail / PanelHeader</td><td>label / native attributes</td><td>活动导航与面板标题；导航项由原生按钮或链接组成。</td></tr>
      <tr><td>InspectorSection</td><td>label, open?, onToggle</td><td>原生 details 折叠区；默认由浏览器管理展开状态。</td></tr>
      <tr><td>AssetCard</td><td>label, description?, selected?, disabled</td><td>原生按钮；React preview / Vue #preview 放置非交互预览。</td></tr>
      <tr><td>CanvasSurface</td><td>grid=true, native attributes</td><td>独立滚动的网格背景；画布内容、缩放和拖拽由宿主实现。</td></tr>
      <tr><td>Button</td><td>variant, size, loading, disabled</td><td>默认 type="button"；loading 禁用操作并保留名称。</td></tr>
      <tr><td>TabBar</td><td>tabs, activeId, label, onSelect, onClose?</td><td>TabItem.id 是唯一 DOM id；controls 指向 panel。关闭后更新 activeId。</td></tr>
      <tr><td>SegmentedControl</td><td>options, value, label, onChange</td><td>互斥 toggle 按钮组，原生 Tab 顺序；禁用项不可操作。</td></tr>
      <tr><td>Dialog / Modal</td><td>open, label / labelledby, dismissible</td><td>React onClose、Vue @close 请求更新 open；原生顶层与焦点恢复。</td></tr>
      <tr><td>Toolbar / StatusBar</td><td>label / native attributes, children / slots</td><td>Toolbar 是操作 group；StatusBar 默认 role="status"。</td></tr>
      <tr><td>Section / ListRow / Divider</td><td>native attributes, children / slots</td><td>结构和样式；应用负责链接、排序、搜索与数据。</td></tr>
      <tr><td>Alert / Badge / Loading / EmptyState</td><td>tone / label / title / action</td><td>Vue EmptyState 使用 #action 插槽；danger Alert 默认 alert。</td></tr>
    </tbody></table></div>
    <Dialog open={open} onClose={() => setOpen(false)} label="新建项目"><div className="fastui-modal-body"><h2>新建项目</h2><label className="fastui-field">名称<TextField autoFocus placeholder="未命名项目" /></label><p>此示例展示表单与焦点管理，项目数据由接入应用保存。</p><Button variant="primary" onClick={() => setOpen(false)}>完成</Button></div></Dialog>
  </>
}
const projects = [{ name: '面向科研的写作工作流', file: 'main.tex', source: 'local', updated: '2026-11-11' }, { name: '多模态检索研究', file: 'paper.tex', source: 'github', updated: '2026-11-10' }, { name: '实验与文献笔记', file: 'notes.md', source: 'local', updated: '2026-11-09' }]
function Patterns() {
  const [query, setQuery] = useState(''), [source, setSource] = useState('all'), [sort, setSort] = useState('recent')
  const rows = projects.filter(p => (source === 'all' || p.source === source) && `${p.name} ${p.file} ${p.source}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'zh-CN') : b.updated.localeCompare(a.updated))
  return <><Example title="项目浏览器" note="用分隔线组织内容，把搜索、来源筛选和排序固定在列表上方。"><Section aria-label="项目浏览器" className="project-browser"><Toolbar label="项目筛选"><TextField type="search" aria-label="搜索项目" placeholder="搜索项目、文件或来源" value={query} onChange={event => setQuery(event.target.value)} /><Select aria-label="项目排序" value={sort} onChange={event => setSort(event.target.value)}><option value="recent">最近修改</option><option value="name">名称排序</option></Select></Toolbar><div className="project-filter"><SegmentedControl label="项目来源" value={source} onChange={setSource} options={[{ value: 'all', label: '全部' }, { value: 'local', label: '本地' }, { value: 'github', label: 'GitHub' }]} /></div><div className="project-list" tabIndex={0} aria-label="项目列表">{rows.length ? rows.map(p => <ListRow key={p.name}><div className="project-name"><strong>{p.name}</strong><span>{p.file}</span></div><Badge>{p.source === 'local' ? '本地' : 'GitHub'}</Badge><time className="project-date">{p.updated}</time></ListRow>) : <EmptyState title="没有匹配的项目"><p>尝试其他搜索词或来源。</p></EmptyState>}</div><StatusBar>{rows.length} 个项目</StatusBar></Section></Example>
    <h2>接入原则</h2><p>组件只管理界面交互；项目数据、请求、认证、持久化和编辑器留在产品层。滚动区域使用 min-height: 0，标题与工具区保持固定，列表获得可用高度。</p><Code>{`.workspace { display: flex; flex-direction: column; min-height: 0; }\n.project-list { flex: 1; min-height: 0; overflow: auto; }`}</Code>
    <Example title="AI 辅助区域" note="研究 assistant-ui 的表面分层，将状态、内容与操作独立组合。"><div className="ai-surface"><Badge>AI 辅助</Badge><h3>保留写作的主导权</h3><p>建议区使用独立的紫色语义色。生成、空状态、错误和确认操作应分别呈现，交互状态由宿主应用驱动。</p></div></Example></>
}
function Start() { return <><div className="intro-note"><span className="eyebrow">FASTWRITE → FASTUI</span><h2>紧凑、有序，留出工作的空间。</h2><p>让编辑器、项目列表和研究工具共享一套界面语言。提供框架无关的设计基础，以及 React 和 Vue 组件。</p><div className="row"><a className="fastui-button fastui-button--primary" href="#/components">探索组件 <span aria-hidden="true">↗</span></a><a className="fastui-button fastui-button--quiet" href="#/design">查看设计变量</a></div></div>
  <div className="package-grid">{['foundation', 'react', 'vue'].map((name, i) => <div key={name}><span className="eyebrow">0{i + 1}</span><h3>@fastrd/ui-{name}</h3><p>{['语义色、尺寸、原生控件样式和颜色模式。', '原生属性与 ref、受控状态和工作台组件。', 'v-model、插槽、组合式组件和工作台组件。'][i]}</p></div>)}</div>
  <h2>安装与接入</h2><Code>{`pnpm add @fastrd/ui-react @fastrd/ui-foundation\n# Vue 项目\npnpm add @fastrd/ui-vue @fastrd/ui-foundation\n# 原生 HTML / 自定义组件\npnpm add @fastrd/ui-foundation`}</Code><h3>配置 UnoCSS</h3><Code>{`pnpm add -D unocss\n\n// vite.config.ts\nimport UnoCSS from 'unocss/vite'\nexport default { plugins: [UnoCSS()] }\n\n// uno.config.ts\nimport { defineConfig } from 'unocss'\nimport { fastUIContent, presetFastUI } from '@fastrd/ui-foundation/uno'\nexport default defineConfig({ content: fastUIContent, presets: [presetFastUI()] })\n\n// main.tsx / main.ts\nimport 'virtual:uno.css'`}</Code><p>自动识别组件的具名导入、别名、命名空间用法与 fastui-* 类，按组件类别裁剪 CSS。运行时组件注册或封装库使用 presetFastUI({`{ components: ['Button'] }`}) 显式声明。</p><h3>在挂载内容前初始化主题</h3><Code>{`import { initColorMode } from '@fastrd/ui-foundation'\nimport 'virtual:uno.css'\n\nconst theme = initColorMode({ storageKey: 'your-existing-theme-key' })\ntheme.setMode('system') // light | dark | system\n// 应用卸载时 theme.dispose()`}</Code><p>React / Vue 默认使用 UnoCSS preset 按组件生成样式；0.3.0 已删除旧 styles.css 入口。静态 HTML 可继续导入 tokens.css 与 controls.css。</p><Alert>最低环境：Node 22、pnpm 10；React 18.3 / 19 或 Vue 3.5。字体资源由宿主应用按需加载，组件包不包含字体文件。</Alert></> }
function Design() { return <><h2>语义色板</h2><p>蓝色表达操作与选中；绿、黄、红表达状态；紫色留给 AI 辅助区。深色主按钮保留较深底色以承载白色文字。</p><div className="swatches">{['grid-dot', 'page', 'workspace', 'surface', 'raised', 'text', 'secondary', 'muted', 'border', 'primary', 'selected', 'focus', 'success', 'warning', 'danger', 'ai', 'ai-soft'].map(key => <div className="swatch" key={key}><div style={{ background: `var(--fastui-${key})` }} /><code>--fastui-{key}</code><span>{tokens.light[key as keyof typeof tokens.light]} / {tokens.dark[key as keyof typeof tokens.dark]}</span></div>)}</div>
  <h2>排版与密度</h2><p>界面使用 IBM Plex Sans Variable 与 Noto Sans SC Variable，正文默认 500 字重；代码使用 JetBrains Mono Variable 与 450 字重。字体缺失时回退至系统字体。</p><div className="type-sample"><h3>研究、写作与思考 Research in focus</h3><p>清晰的层级，让注意力回到内容本身。Aa Bb 0123456789</p><code>const idea = '从一个问题开始';</code></div><Code>{`/* 在宿主应用自托管字体（文档站已加载） */\nimport '@fontsource-variable/ibm-plex-sans'\nimport '@fontsource-variable/noto-sans-sc'\nimport '@fontsource-variable/jetbrains-mono'\n\n/* 局部切换为系统字体 */\n.system-ui { --fastui-font: var(--fastui-font-system); }`}</Code>
  <div className="table-scroll"><table className="api-table"><thead><tr><th>变量</th><th>值</th><th>用途</th></tr></thead><tbody>{[['height-xs / sm / md', '24 / 25 / 28px', '紧凑工作台控件'], ['height-comfortable', '32px', '舒适密度表单'], ['radius-control / panel / overlay', '4 / 6 / 8px', '控件、面板、弹窗'], ['duration-fast / normal', '120 / 180ms', '短促反馈，尊重 reduced-motion'], ['tab-height', '28px', '平直页签；可关闭文件页签为 34px']].map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div><h2>移动端与触控密度</h2><p>宽度不超过 900px 的触摸设备自动使用 44px 控件点击区域，表单字号提高到 16px。桌面紧凑尺寸、原有配色与圆角保持不变；窄屏弹窗自动收紧边距，页签支持横向滚动。</p><Code>{`<!-- 可在任意容器局部选择密度；React / Vue 使用同样的 data 属性 -->\n<section data-fastui-density="touch">…</section>\n<section data-fastui-density="compact">…</section>\n\n<!-- 表格在局部区域滚动，不撑宽页面 -->\n<div class="fastui-table-scroll" role="region" aria-label="数据表" tabindex="0">\n  <table class="fastui-table">…</table>\n</div>`}</Code><h2>局部主题</h2><Code>{`const local = initColorMode({\n  storageKey: 'preview-mode',\n  target: document.querySelector('#preview')\n})\nlocal.setMode('dark')`}</Code><p>data-fastui-theme 可在任意容器定义本地模式。原生 dialog 保持在原 DOM 位置，进入顶层后继续继承容器变量。</p></> }
function Development() { return <><h2>pnpm 工作流</h2><Code>{`corepack enable\npnpm install --frozen-lockfile\npnpm build\npnpm verify\npnpm test:release\npnpm test:tree-shaking\npnpm docs:build\npnpm docs:test`}</Code><p>工作区统一使用 pnpm 10.33.0 与 pnpm-lock.yaml。根目录链接本地三包，公开包精确依赖相同版本的 foundation。</p><h2>消费者验证</h2><p>干净的 React 18 / 19、Vue 与 HTML 项目从临时 registry 安装原始候选 tarball，每个消费者使用独立 pnpm store。浏览器回归检查表单、模态框、颜色模式、键盘页签与响应式布局。</p><p>npm CLI 仅用于生成发布归档及 Trusted Publishing，保留 npm registry 原始 tarball 完整性检查。</p><h2>产品边界</h2><p>组件负责可复用的界面与交互，宿主维护业务数据、认证、网络请求、编辑器和 AI 运行状态。MDUI 映射为显式导入、局部容器适配。</p></> }
function References() { return <><p>视觉基准为原版 FastUI 与 FastWrite；FastPPT / FastFigure 提供可复用组件模式，并以这套规范为后续统一目标。早期参考清单来自 FastWrite/reference，记录日期 {sources.recorded_date}。本轮通过研究语义色、布局和键盘模式实现 FastUI 自有组件，没有引入这些库的运行时依赖或复制上游组件。</p><div className="intro-note"><h2>原版 FastUI / FastWrite 为视觉基准</h2><p>沿用原有浅深色板、灰色填充次按钮、24 / 25 / 28px 紧凑控件与 4 / 6 / 8px 圆角。FastPPT / FastFigure 的活动栏、素材卡片与属性区使用同一套语义变量；两者后续向 FastWrite 统一。</p><code>FastWrite apps/web/src/styles/tokens.css · FastUI packages/foundation/tokens.json</code></div><div className="reference-list">{sources.repositories.map(repo => <section key={repo.name}><div className="row"><h2><a href={repo.url.replace('.git', '')}>{repo.name}</a></h2><Badge>{repo.license}</Badge></div><code>{repo.commit}</code><p>{({ 'assistant-ui': '分离消息内容、运行状态与操作；以 props / slots 组合界面。', 'ui-ux-pro-max-skill': '清晰的当前状态、深链接、键盘焦点和减少动态效果。', 'ayakaleaf-pro': '项目搜索、过滤与分隔线列表的信息组织。仅研究设计与行为，不复制 AGPL 源码。', 'shadcn-ui': '语义变量、可组合变体、可见的焦点和禁用状态。', 'radix-primitives': '方向键、Home / End、跳过禁用项及可预测的焦点顺序。' } as Record<string, string>)[repo.name]}</p></section>)}</div><p><a href="https://github.com/FastR-D/FastUI/blob/main/NOTICE.md">许可证与来源说明</a> · 文档字体：SIL Open Font License 1.1，详见 <a href={`${import.meta.env.BASE_URL}licenses/fonts/ibm-plex-sans.txt`}>Plex</a>、<a href={`${import.meta.env.BASE_URL}licenses/fonts/noto-sans-sc.txt`}>Noto Sans SC</a>、<a href={`${import.meta.env.BASE_URL}licenses/fonts/jetbrains-mono.txt`}>JetBrains Mono</a>。</p></> }
function Deploy() { return <><h2>本地文档站</h2><Code>{`corepack enable\npnpm install --frozen-lockfile\npnpm docs:dev\n\n# 生产构建与预览\npnpm docs:build\npnpm docs:preview`}</Code><h2>GitHub Pages</h2><p>docs.yml 在 main 推送时构建并部署 docs/dist，pull request 仅构建和检查。首次使用需在仓库 Settings → Pages → Source 选择 GitHub Actions。</p><p>部署路径由 configure-pages 的 base_path 输出决定，兼容 /FastUI/ 和自定义域名。部署 job 仅在 main 上获得 pages: write 与 id-token: write 权限。</p><h2>包发布</h2><p>check.yml 使用 pnpm 冻结锁文件并验证原始候选包。publish.yml 仅响应 v* tag，依次发布 foundation、Vue 和 React，验证公开 registry 的归档完整性。提交代码不会自动发布 npm 包。</p><p>完整流程见 <a href="https://github.com/FastR-D/FastUI/blob/main/RELEASING.md">RELEASING.md</a>。部署方式遵循 <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages">GitHub Pages 自定义工作流</a>与 <a href="https://vite.dev/guide/static-deploy.html#github-pages">Vite 静态部署说明</a>。</p></> }
function App() {
  const readRoute = () => location.hash.replace('#/', '') || 'start'
  const [route, setRoute] = useState(readRoute), [query, setQuery] = useState(''), [mode, setMode] = useState<ColorMode>(theme.mode), [menu, setMenu] = useState(false)
  const main = useRef<HTMLElement>(null), menuButton = useRef<HTMLButtonElement>(null), search = useRef<HTMLInputElement>(null)
  useEffect(() => { const onHash = () => { setRoute(readRoute()); setMenu(false); window.scrollTo(0, 0); requestAnimationFrame(() => main.current?.focus({ preventScroll: true })) }; addEventListener('hashchange', onHash); return () => removeEventListener('hashchange', onHash) }, [])
  useEffect(() => theme.subscribe(state => setMode(state.mode)), [])
  useEffect(() => {
    if (!menu) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const content = main.current
    if (content) content.inert = true
    search.current?.focus()
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus() } }
    const media = matchMedia('(max-width: 680px)')
    const resize = () => { if (!media.matches) setMenu(false) }
    document.addEventListener('keydown', escape)
    media.addEventListener('change', resize)
    return () => { document.body.style.overflow = previousOverflow; if (content) content.inert = false; document.removeEventListener('keydown', escape); media.removeEventListener('change', resize) }
  }, [menu])

  const page = routes.find(page => page.id === route)
  useEffect(() => { document.title = `${page?.title ?? '页面未找到'} · FastUI` }, [page])
  const filtered = routes.filter(page => `${page.title} ${page.group} ${page.description}`.toLowerCase().includes(query.toLowerCase()))
  return <><a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); main.current?.focus() }}>跳转到内容</a><header className="site-header"><a className="brand" href="#/start"><img className="brand-mark" src={`${import.meta.env.BASE_URL}brand/fastui-icon.svg`} width="28" height="28" alt="" aria-hidden="true" />FastUI<span className="version">0.3.0</span></a><div className="header-right"><a href="https://github.com/FastR-D/FastUI">GitHub <span aria-hidden="true">↗</span></a><Select aria-label="颜色模式" size="sm" value={mode} onChange={event => theme.setMode(event.target.value as ColorMode)}><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></Select><Button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="docs-navigation" onClick={() => setMenu(!menu)}>目录</Button></div></header><div className="site-shell"><aside id="docs-navigation" className={`sidebar ${menu ? 'is-open' : ''}`}><label className="search-label">查找文档<TextField ref={search} type="search" placeholder="搜索标题与说明…" value={query} onChange={event => setQuery(event.target.value)} /></label><nav aria-label="文档导航">{filtered.length ? filtered.map((item, i) => <div key={item.id}>{(i === 0 || filtered[i - 1].group !== item.group) && <span className="nav-group">{item.group}</span>}<a href={`#/${item.id}`} onClick={() => { setMenu(false); requestAnimationFrame(() => main.current?.focus({ preventScroll: true })) }} aria-current={route === item.id ? 'page' : undefined}>{item.title}</a></div>) : <p role="status">没有匹配的文档</p>}</nav><div className="sidebar-footer">为专注的工作而设计。<br /><span>FastR-D · MIT License</span></div></aside><main id="main-content" ref={main} tabIndex={-1}><div className="page-kicker">文档 <span>/</span> {page?.group ?? '404'}</div><div className="page-intro"><h1>{page?.title ?? '页面未找到'}</h1><p>{page?.description ?? '该文档地址不存在，请从左侧目录继续浏览。'}</p></div>{!page ? <a href="#/start">返回介绍</a> : route === 'start' ? <Start /> : route === 'design' ? <Design /> : route === 'components' ? <Components /> : route === 'patterns' ? <Patterns /> : route === 'development' ? <Development /> : route === 'references' ? <References /> : <Deploy />}<footer className="page-footer"><span>FastUI · {page?.title}</span><a href="https://github.com/FastR-D/FastUI/issues">反馈问题 ↗</a></footer></main></div></>
}
createRoot(document.getElementById('app')!).render(<StrictMode><App /></StrictMode>)
