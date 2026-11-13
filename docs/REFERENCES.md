# 视觉基准与组件参考

## 视觉基准：原版 FastUI / FastWrite

FastUI / FastWrite 是配色、排版和紧凑密度的基础。
保留 24 / 25 / 28px 紧凑控件、32px 舒适密度及灰色填充次按钮。
2026-11-13 参考 HeroUI 更新表面层级、圆角与状态反馈，详见下文。
FastPPT / FastFigure 后续向这套视觉规范统一，不反向覆盖 FastUI 的基础样式。

对齐依据：2026-11-11 FastWrite 工作区当前的 `apps/web/src/styles.css`、
`styles/tokens.css`、`components/ui/chrome/TabBar`、`SegmentedControl`、
`components/projects/ProjectBrowser`，以及 `docs/PLAN-UI组件更新.md`。
包含当前尚未提交的项目列表设计；本轮未修改 FastWrite 工作区。

本轮参考 FastWrite/reference 中的固定源码版本。清单及完整 commit 见
[reference-sources.json](reference-sources.json)。

| 来源 | 阅读入口 | 采用的设计思路 |
| --- | --- | --- |
| assistant-ui | packages/ui/src/components/react/assistant-ui/elements/surfaces.tsx | 表面、交互与运行状态分离；减少动态效果 |
| shadcn-ui | apps/v4/registry/new-york-v4/ui/button.tsx | 语义 token、按钮变体和显式状态 |
| radix-primitives | packages/react/roving-focus/src/roving-focus-group.tsx | 键盘循环、RTL 与禁用项跳过 |
| ayakaleaf-pro | services/web/modules/admin-tools/frontend/js/shared/projects-list.tsx | 项目搜索、筛选、排序与分隔线列表 |
| ui-ux-pro-max-skill | src/ui-ux-pro-max/data/ux-guidelines.csv | 导航当前状态、深链接与减少动态效果 |

采用自有 TypeScript/CSS 实现，没有复制上游组件或增加这些参考库的运行时依赖。
Ayakaleaf 为 AGPL-3.0，仅研究界面和行为；其代码不进入 MIT 包。
具体来源和许可证见根目录 NOTICE.md。


## 组件模式参考：FastPPT / FastFigure

2026-11-12 阅读本地源码，补充可复用组件的组织与交互：

| 来源 | 阅读入口 | 采用的设计思路 |
| --- | --- | --- |
| FastPPT | packages/components/src/ | 通用控件语义与组合方式 |
| FastFigure | src/styles/workspace.css | 活动栏、素材预览卡片、折叠属性区与网格画布 |

新增 ActivityRail、PanelHeader、InspectorSection、AssetCard、CanvasSurface 均使用
FastUI / FastWrite 的语义色、字体与圆角。网格点和滚动条引用已有边框色，
不另建产品色板。布局、缩放、拖放及产品业务由宿主负责。
本次仅更新 FastUI，没有修改 FastWrite / FastPPT / FastFigure。读取时的 HEAD 与文件
SHA-256 在 reference-sources.json 的 product_references 中，design_baseline 明确记录视觉优先级。

## HeroUI 视觉与内容组件参考（2026-11-13）

参考 [HeroUI 仓库](https://github.com/heroui-inc/heroui)，v3 分支
`8037a0198427faf1c1d09c6eb9e7bd09290ea3e2`（Apache-2.0），以及官方
[设计原则](https://heroui.com/en/docs/react/getting-started/design-principles)、
[主题](https://heroui.com/en/docs/react/getting-started/theming)、
[Card](https://heroui.com/en/docs/react/components/card) 和
[Switch](https://heroui.com/en/docs/react/components/switch) 文档。

采用语义层级、柔和表面、可组合内容与显式状态反馈的思路：按钮保留 4px，输入框／面板／弹窗使用 8 / 12 / 16px
圆角、主题阴影、柔和标签和浮起的分段选项。新增 Card 组合部件、Avatar、Switch、
Skeleton、Kbd，并统一两端的原生 Progress。React / Vue / HTML 共用自有样式，
不复制 HeroUI 源码、不引入其运行时依赖。原有蓝灰色板、紧凑密度和键盘行为继续保留。
