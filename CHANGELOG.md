# 更新记录

## 0.5.0 · 2026-11-28

- React Select、Vue Select / SelectField 改用统一单选弹层，保留原生表单取值、校验、重置、事件和 ref。
- 根据可视区域向上或向下展开，约束宽高并处理滚动、缩放和软键盘视口变化；弹层可脱离 overflow 裁剪并显示在模态框中。
- 支持分组、禁用项、长文本、键盘方向键、首尾定位、输入首字母查找、Escape / Tab 关闭和触控。
- 浅深色、选中状态、高对比度及 UnoCSS 按需样式统一；HTML 可使用 enhanceSelect / disposeSelect。
- 多选和 size > 1 的列表框仍保留原生行为。

## 0.4.0 · 2026-11-13

- 参考 HeroUI 更新表面层次、轻量阴影、状态标签和交互反馈；按钮保留原有 4px 圆角。
- React / Vue 新增 Card 及其 Header / Body / Footer 组合部件、Avatar、Switch、Skeleton、Kbd。
- React 补齐 Progress；Vue Progress 支持 label / tone，统一进度边界处理和不确定状态。
- 新组件支持 UnoCSS 按需样式与 JS tree shaking；补充键盘、表单、RTL、触控和减少动态效果验证。
- 文档新增「卡片与状态」及交互预览，完善浅深色与移动端展示。

Vue Progress 的默认 max 从原生的 1 改为 100；使用 0…1 比例的项目需显式设置 max=1。
输入框／面板／弹窗默认圆角为 8 / 12 / 16px，按钮独立使用 radius-button=4px。
兼容配置见 [迁移说明](docs/MIGRATION.md)。
