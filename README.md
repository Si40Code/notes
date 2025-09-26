# Notes 博客

这是一个使用 [Hugo](https://gohugo.io/) 搭建的静态博客仓库，用来记录日常的学习与随笔笔记。

## 快速开始

- 安装 Hugo Extended（本地已经安装 `hugo v0.92.2`）。
- 克隆或拉取本仓库后，执行 `hugo server` 进入本地预览；浏览器访问提示的地址即可查看实时更新。
- 需要新文章时，运行 `hugo new posts/<slug>.md`，然后编辑生成的 Markdown 文件。

## 本地开发

```bash
hugo server --buildDrafts
```

- `--buildDrafts` 会同时展示 `draft: true` 的文章，便于调试。
- 如需关闭草稿预览，移除该参数即可。

## 生成发布版本

```bash
hugo
```

- 所有静态资源会输出到 `public/` 目录，适合直接推送到 GitHub Pages 或其他静态站点托管平台。
- 若使用 GitHub Pages（用户/组织主页仓库），可以将 `public/` 内容推送到 `gh-pages` 分支，或启用 GitHub Actions 自动化部署。

## 目录结构

- `content/`：Markdown 文章。
- `themes/notes-theme/`：自定义主题，包含页面布局与样式。
- `static/`：静态资源（图片、附件等）。

欢迎持续补充与调整配置，让博客更贴合自己的写作习惯。
