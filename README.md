# FastUI

源于 FastWrite 的紧凑工作台组件，为 FastR-D 产品提供统一的浅深色语义色、排版与交互。

| 包 | 内容 |
| --- | --- |
| `@fastrd/ui-foundation` | 设计 token、原生 HTML 控件样式、颜色模式控制器 |
| `@fastrd/ui-react` | React 18.3 / 19 控件、弹窗、反馈与工作台组件 |
| `@fastrd/ui-vue` | Vue 3.5 控件、v-model、弹窗、反馈与工作台组件 |

**0.2.0** · 三包版本统一，框架包精确依赖同版本 foundation。

## 使用

```sh
pnpm add @fastrd/ui-react@0.2.0
# 或 @fastrd/ui-vue@0.2.0、@fastrd/ui-foundation@0.2.0
```

```tsx
import { initColorMode } from '@fastrd/ui-foundation'
import { Button, TextField } from '@fastrd/ui-react'
import '@fastrd/ui-react/styles.css'

// 在挂载内容前调用；继续使用产品已有的主题 preference key。
const theme = initColorMode({ storageKey: 'your-existing-theme-key' })

<label className="fastui-field">名称<TextField /></label>
<Button variant="primary">保存</Button>
```

Vue 导入 `@fastrd/ui-vue/styles.css`；原生 HTML 显式导入 foundation 的
`tokens.css` 与 `controls.css`，并给控件添加 `.fastui-*` 类。库不包含全局 reset。
详见各包 README 与 [开发指南](docs/DEVELOPMENT.md)。

## 与 FastWrite 对齐

- IBM Plex Sans / Noto Sans SC 字体栈，正文 500、代码 450 字重，提供系统字体回退。
  字体由宿主自托管；组件包不携带字体资源。
- 24 / 25 / 28px 控件、4 / 6 / 8px 控件／面板／弹窗圆角。
- 当前蓝／灰语义色及独立状态色、AI 紫色；深色填充按钮保持白字可读。
- 平直页签、顶部细线、6px 未保存标记、矩形键盘焦点。
- 新增 TabBar、SegmentedControl、Toolbar、StatusBar、Section、ListRow、Divider；
  Vue 补齐 Alert、Badge、Loading、EmptyState。页签支持方向键、Home / End、RTL、禁用跳过与关闭后焦点恢复。
- 使用 FastUI 原生语义变量；MDUI 提供显式局部映射。

## 开发与验证

要求 Node 22+、pnpm 10.33.0、npm CLI（仅打包与 OIDC 发布）、tar、Playwright Chromium。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build
pnpm verify
pnpm test:release
```

仓库唯一锁文件是 `pnpm-lock.yaml`。`pnpm-workspace.yaml` 链接三包；根目录仅使用
workspace 依赖开发，已发布包保持精确的 registry 版本依赖。

`verify` 打包原始候选 tarball，通过临时 registry 安装进干净的 Vue、React 19、
React 18.3 和原生 HTML 消费者。每个消费者使用独立 pnpm store，不使用源码 alias，
类型检查与生产浏览器回归覆盖表单、主题、嵌套弹窗、页签、焦点及响应式布局。
产物写入 `artifacts/0.2.0/`，包含 62 个场景、构建日志、校验和和截图；发布入口另有 49 项边界测试。

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
元数据决定，兼容 `/FastUI/` 与自定义域名。文档发布独立于 npm 包发布。

## 自动发布

`.github/workflows/check.yml` 用 pnpm 冻结锁文件并验证消费者。
`.github/workflows/publish.yml` 只在匹配 `vX.Y.Z` tag 时使用 npm Trusted Publishing
（GitHub OIDC）发布，先 foundation、再 Vue / React，原始归档必须通过完整性校验。
设置与流程见 [RELEASING.md](RELEASING.md)。

只将可复用界面代码放入此仓库；产品数据、认证与业务工作流留在各产品。
参考版本、设计来源及许可见 [设计参考](docs/REFERENCES.md) 与 [NOTICE.md](NOTICE.md)。
