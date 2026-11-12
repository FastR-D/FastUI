# 升级到 0.3.0

三个包统一升级到 0.3.0，框架包精确依赖 foundation 0.3.0。
本版移除旧的框架全量 CSS 导出；配色、字体和桌面密度继续沿用 FastUI / FastWrite。

## 默认接入切换到 UnoCSS

| 旧方式 | 状态 | 替代方式 |
| --- | --- | --- |
| React / Vue `styles.css` 全量入口 | 已删除，导入将失败 | `presetFastUI()` + `virtual:uno.css` |
| 框架入口同时加载全量 CSS 与 UnoCSS | 不再推荐 | 只保留 UnoCSS，避免重复样式 |
| 静态 HTML `tokens.css` + `controls.css` | 支持 | 无 UnoCSS 构建链时继续使用 |

1. 开发依赖安装 `unocss`，Vite 增加 `UnoCSS()` 插件。
2. `uno.config.ts` 从 `@fastrd/ui-foundation/uno` 导入 `presetFastUI` 与 `fastUIContent`，
   分别设置 `presets: [presetFastUI()]` 与 `content: fastUIContent`。后者显式包含纯 JS/TS 文件。
3. 应用入口删除框架的 `styles.css`，改为 `import 'virtual:uno.css'`。
4. 字体、颜色模式、现有主题 storage key 和组件 API 保持原有配置。

自动识别具名导入、导入别名、命名空间成员与字面量 `fastui-*` 类。
运行时组件名或第三方封装无法静态识别时，用 `components` 声明组件名。
不要扫描整个组件库 barrel 或 safelist 全库，否则会失去按组件裁剪的收益。

裁剪粒度为组件类别，使用 Button 会保留动态 variant/size、禁用、聚焦、触控状态。
基础 token、局部主题与密度规则始终生成。JS tree shaking 由消费端 ESM bundler 完成，
纯函数初始化标记使未用组件可被移除。可运行 `pnpm test:tree-shaking` 查看实际样本大小。

## 移动端密度

小屏触摸设备自动采用 44px 控件点击区域、16px 表单字号；鼠标设备保持紧凑尺寸。
`data-fastui-density="touch"` / `"compact"` 可局部选择，并支持嵌套。
窄屏弹窗使用 `dvh` 和安全区，页签与表格采用局部滚动，不禁止页面缩放。
画布编辑、拖拽、缩放和面板重新排列由宿主负责。

## 开发依赖补丁

`unconfig@7.5.0` 的声明使用了未声明的 `Args[0]`，而实现的 `force` 参数为 boolean。
`patches/unconfig@7.5.0.patch` 仅修正这个类型声明，保留严格类型检查。依赖升级修复该问题后
应移除补丁；未修改其运行时代码。
