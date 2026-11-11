# FastUI 文档站

Vite 静态文档，直接导入工作区构建后的 React / Vue 包。Vue 示例通过 createApp
挂载并在 React 示例卸载时清理，浏览器验证覆盖两套真实组件。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm docs:dev
```

生产构建：

```sh
DOCS_BASE_PATH=/FastUI/ pnpm docs:build
DOCS_BASE_PATH=/FastUI/ pnpm docs:test
DOCS_BASE_PATH=/FastUI/ pnpm docs:preview
```

默认本地路径 `/`；构建与测试传入相同路径。所有页内导航采用 hash 路由，直接打开
`/FastUI/#/components` 不依赖服务器回退。不存在的文档显示返回入口。

`docs/src/main.tsx` 提供内容与示例；`site.css` 管理文档自身布局，组件外观来自包 CSS。
`reference-sources.json` 记录 FastWrite/reference 中的固定参考版本。
字体通过锁定的 Fontsource 版本自托管，`public/licenses/fonts/` 保留各字体的 OFL 许可证。

`docs:test` 启动自己的 Vite production preview，检查所有导航、搜索、双框架键盘行为、
焦点恢复、项目搜索筛选排序、主题持久化、子路径资源、字体加载与 320–1440px
浅深色布局；结果与截图写入 `artifacts/docs/`。测试结束自动关闭服务器。

GitHub Actions：

- PR：冻结 pnpm 锁文件、构建和浏览器检查，不部署。
- main / 手动 main：configure-pages 获取 base_path，构建与检查后上传 Pages artifact；
  独立 deploy job 使用 pages:write、id-token:write 和 github-pages environment。
- 首次配置：仓库 Settings → Pages → Source 选择 GitHub Actions。

参考 [GitHub Pages 工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
和 [Vite 静态部署说明](https://vite.dev/guide/static-deploy.html#github-pages)。
