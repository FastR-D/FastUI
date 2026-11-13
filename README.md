# FastUI

源于 FastWrite 的紧凑工作台组件，为 FastR-D 产品提供统一的浅深色语义色、排版与交互。

| 包 | 内容 |
| --- | --- |
| `@fastrd/ui-foundation` | 设计 token、原生 HTML 控件样式、颜色模式控制器 |
| `@fastrd/ui-react` | React 18.3 / 19 控件、弹窗、反馈与工作台组件 |
| `@fastrd/ui-vue` | Vue 3.5 控件、v-model、弹窗、反馈与工作台组件 |

**0.4.0** · 三包版本统一，框架包精确依赖同版本 foundation。

## 使用 UnoCSS（推荐）

0.3.0 使用 UnoCSS preset 作为 React / Vue 的样式接入方式。

```sh
pnpm add @fastrd/ui-react @fastrd/ui-foundation
# Vue 使用 @fastrd/ui-vue
pnpm add -D unocss @types/node@^22
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
export default defineConfig({ plugins: [UnoCSS()] })

// uno.config.ts
import { defineConfig } from 'unocss'
import { fastUIContent, presetFastUI } from '@fastrd/ui-foundation/uno'
export default defineConfig({ content: fastUIContent, presets: [presetFastUI()] })
```

```tsx
import { initColorMode } from '@fastrd/ui-foundation'
import { Button, TextField } from '@fastrd/ui-react'
import 'virtual:uno.css'

const theme = initColorMode({ storageKey: 'your-existing-theme-key' })
<label className="fastui-field">名称<TextField /></label>
<Button variant="primary">保存</Button>
```

Vue 使用相同 preset。UnoCSS 在构建时根据组件导入或 `fastui-*` 类生成样式，按组件类别裁剪，
保留该组件的全部变体、浅深色、触控和无障碍状态。动态组件注册或第三方封装可通过
`presetFastUI({ components: ['Button', 'Dialog'] })` 显式声明。JS 的 ESM 导出支持 tree shaking，
UnoCSS 不进入组件运行时。

**0.3.0 已移除** `@fastrd/ui-react/styles.css` 和 `@fastrd/ui-vue/styles.css` 全量样式入口。
升级时删除旧导入，改用 UnoCSS preset；不再生成或导出兼容文件。
静态 HTML / 无 UnoCSS 工具链继续使用 foundation 的 `tokens.css` 与 `controls.css`。
库不包含全局 reset。详见 [迁移说明](docs/MIGRATION.md)。

## 移动端

宽度不超过 900px 的触摸设备自动采用 44px 控件点击区域和 16px 表单字号。
桌面保持 24 / 25 / 28px 紧凑尺寸及 FastWrite 配色。容器可使用
`data-fastui-density="touch"` / `"compact"` 局部指定密度，React、Vue 与 HTML 一致。
窄屏弹窗兼容动态视口和安全区；页签、画布与 `.fastui-table-scroll` 使用局部滚动。
活动栏和多面板的重新排列由宿主布局负责，文档包含手机、平板与横屏示例。

## 视觉规范与对齐方向

- IBM Plex Sans / Noto Sans SC 字体栈，正文 500、代码 450 字重，提供系统字体回退。
  字体由宿主自托管；组件包不携带字体资源。
- 24 / 25 / 28px 紧凑控件；按钮保持 4px，输入框／面板／弹窗使用 8 / 12 / 16px 圆角。
- 当前蓝／灰语义色及独立状态色、AI 紫色；深色填充按钮保持白字可读。
- 平直页签、顶部细线、6px 未保存标记、矩形键盘焦点。
- 新增 TabBar、SegmentedControl、Toolbar、StatusBar、Section、ListRow、Divider；
  Vue 补齐 Alert、Badge、Loading、EmptyState。页签支持方向键、Home / End、RTL、禁用跳过与关闭后焦点恢复。
- 新增 ActivityRail、PanelHeader、InspectorSection、AssetCard、CanvasSurface，
  提供活动栏、面板标题、原生折叠属性区、素材卡片与网格画布；React / Vue 同步支持。
- 新增 Card / CardHeader / CardBody / CardFooter、Avatar、Switch、Skeleton、Kbd；React 补齐 Progress，Vue 原生 Progress 同步增强。
- 使用 FastUI 原生语义变量；MDUI 提供显式局部映射。

配色、字体与控件密度以 FastUI / FastWrite 为基础；参考 HeroUI 的语义层级与组合方式，
采用柔和圆角、轻量阴影、胶囊状态标签、浮起分段选项与按压反馈。FastPPT / FastFigure 仅提供通用组件的组织与交互参考，后续向
FastWrite / FastUI 的规范统一。新增组件直接使用同一套语义变量，不另设产品色板。

0.4.0 新增内容组件与更细腻的视觉层次，保留 UnoCSS 按需样式、JS tree shaking 和移动端适配。

## 开发与验证

要求 Node 22+、pnpm 10.33.0、npm CLI（仅打包与 OIDC 发布）、tar、Playwright Chromium。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build
pnpm verify
pnpm test:release
pnpm test:tree-shaking
```

仓库唯一锁文件是 `pnpm-lock.yaml`。`pnpm-workspace.yaml` 链接三包；根目录仅使用
workspace 依赖开发，已发布包保持精确的 registry 版本依赖。

`verify` 打包原始候选 tarball，通过临时 registry 安装进干净的 Vue、React 19、
React 18.3 和原生 HTML 消费者。每个消费者使用独立 pnpm store，不使用源码 alias，
类型检查与生产浏览器回归覆盖表单、主题、嵌套弹窗、页签、焦点及响应式布局。
产物写入 `artifacts/0.4.0/`，包含 65 个场景、构建日志、校验和和截图；发布入口另有 57 项边界测试。

## 文档站点

```sh
pnpm docs:dev       # 构建库并启动文档开发服务器
pnpm docs:build     # 构建库、类型检查及静态文档
pnpm docs:preview   # 预览 docs/dist
pnpm docs:test      # 验证已构建文档；与构建使用相同的 DOCS_BASE_PATH
```

文档包含安装、设计变量、React / Vue 实时组件、项目浏览器组合、开发指南、参考版本与部署说明。
自托管字体及其 OFL 许可证随站点发布。详见 [文档开发说明](docs/README.md)。

`.github/workflows/docs.yml` 对 PR 构建与浏览器检查，在 main 推送时部署 GitHub Pages。
首次需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**；部署路径由 Pages
元数据决定，兼容 `/FastUI/` 与自定义域名。文档发布独立于 npm 包发布。站点仅托管于 [GitHub Pages](https://fastr-d.github.io/FastUI/)，
不部署到 fastrd 服务器；详见 [发布说明](docs/deployment.md)。

## 自动发布

`.github/workflows/check.yml` 用 pnpm 冻结锁文件并验证消费者。
`.github/workflows/publish.yml` 由 `vX.Y.Z` tag 触发，或从 main 对载荷未变的现有标签手动重试，使用 npm Trusted Publishing
（GitHub OIDC）发布，先 foundation、再 Vue / React，原始归档必须通过完整性校验。
设置与流程见 [RELEASING.md](RELEASING.md)。

只将可复用界面代码放入此仓库；产品数据、认证与业务工作流留在各产品。
参考版本、设计来源及许可见 [设计参考](docs/REFERENCES.md) 与 [NOTICE.md](NOTICE.md)。
