# FastUI 文档发布

文档站点仅使用 GitHub Pages：https://fastr-d.github.io/FastUI/。

`.github/workflows/docs.yml` 在 PR 时构建并运行浏览器检查；main 推送和 main 上的手动运行会在检查通过后部署 GitHub Pages。Pages 的发布来源为 GitHub Actions，项目路径由 `actions/configure-pages` 返回的 `base_path` 决定。CI 使用 runner 自带 Chrome 运行浏览器检查。

`ui.fastrd.io` 保留为跳转入口，页面、脚本、样式和字体由 GitHub Pages 提供。FastUI 不再接入 FastDeploy，不需要服务器运行进程、SSH Secrets 或服务器回滚 workflow。恢复旧版文档时，在 main 回退相应源代码提交，由 Pages workflow 重新发布。

npm 包仍由 `.github/workflows/publish.yml` 响应正式版本标签发布；文档部署与 npm 发布相互独立，历史 `v*-deploy.*` 标签不发布 npm 包。
