# FastWrite 对齐与设计参考

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
