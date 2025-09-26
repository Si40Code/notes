---
title: "部署到 GitHub Pages 并焕新主页"
date: 2025-09-27T00:45:00+08:00
draft: false
tags: ["折腾记录", "Hugo"]
summary: "记录把 Notes 博客上线到 GitHub Pages 的全过程，并整理这次主题美化的思路。"
---

最近给 Notes 博客做了两件事：一是把站点发布到 GitHub Pages，二是重做主页视觉，让内容展示更有仪式感。这里简单记录整个过程，方便以后回顾。

## 发布到 GitHub Pages

最开始只是本地仓库，想公开访问需要几个步骤：

1. 在 GitHub 上创建 `Si40Code/notes` 仓库，本地仓库推送到 `main` 分支。
2. 修改 `config.toml` 的 `baseURL`，换成 `https://si40code.github.io/notes/`，以免静态资源加载到默认域名。
3. 新增 GitHub Actions 工作流：
   - `actions/checkout` 拉取代码，顺便抓取子模块（主题）。
   - `peaceiris/actions-hugo` 安装扩展版 Hugo 0.92.2。
   - 执行 `hugo --minify` 构建静态文件。
   - `peaceiris/actions-gh-pages` 把 `public/` 推送到 `gh-pages` 分支。
4. Actions 需要写权限，于是在 workflow 里补上 `permissions: contents: write`。
5. 首次运行成功后，在仓库 Settings → Pages 里把发布来源改成 `gh-pages`，稍等片刻就能访问正式站点。

## 焕新主题与首页

原来的主题偏简洁，这次想要更有层次的首页体验：

- 设计了带渐变背景的 Hero 区块，展示标题、副标题和一句激励标语。
- 提供亮点标签（highlights）与社交链接，在 `config.toml` 里直接配置即可。
- 首页文章列表改成卡片网格，显示阅读时长、摘要和标签，更适合快速浏览。
- 统一重写样式，支持暗色模式、粘性导航条和圆角阴影，整体视觉更现代。
- 文章正文页加入目录、阅读时长标签、代码块样式也同步调整。
- 菜单改成动态配置，能自动高亮当前页面；分页展示也更友好。

## 小结

现在只要写完文章推送到 `main`，GitHub Actions 就会自动构建并部署，省去了手动上传的麻烦。主题也变得更有“博客首页”的感觉，后面可以继续补充：

- 在 `config.toml` 填上真实的作者信息和更多社交链接。
- 给 `highlights` 和 Hero 文案做阶段性调整，让页面和内容保持同步。
- 逐步补齐标签、归档等页面的内容，形成更完整的知识索引。

这篇记录算是一次小版本发布的总结，之后遇到新的改动也继续写下来，让博客成为自己的成长档案。EOF
