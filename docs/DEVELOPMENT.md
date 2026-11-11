# FastUI 开发指南

要求 Node 22+ 与 pnpm 10.33.0。npm CLI 仅用于原始 tarball 打包及 OIDC 发布。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build
pnpm verify
pnpm test:release
```

工作区链接本地三包，公开包保持相同版本的精确 foundation 依赖。
唯一锁文件为 pnpm-lock.yaml，CI 使用 --frozen-lockfile。

消费者验证从临时 registry 安装原始候选 tarball，使用独立 pnpm store，
不使用源码 alias。覆盖 React 18 / 19、Vue 和原生 HTML 的生产构建，
以及表单、主题、模态框、页签键盘导航、焦点恢复与布局。

文档开发和部署见 [README.md](README.md)，包发布见 [RELEASING.md](../RELEASING.md)。
