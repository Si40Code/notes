---
title: "本地图片使用示例"
date: 2025-09-27T12:00:00+08:00
draft: false
tags: ["写作流程", "素材管理"]
summary: "演示如何在文章中引用自己下载的图片，包括封面、正文插图以及简单的图文布局。"
cover: cover.svg
coverAlt: "木质桌面上的笔记本电脑与便签"
coverCaption: "写作时的工作台"
---

将文章改成 Leaf Bundle（目录 + `index.md`）后，就可以把截图和照片放在同一个文件夹里。这样引用资源时只需写文件名，Hugo 会自动处理路径。

## 直接引用图片

最简单的方式是使用标准 Markdown 语法：

![编辑环境截图](workspace.jpg)

## 图文混排

还可以用一点点 HTML 包装，让图片和文字排版更紧凑：

<figure class="image-note">
  <img src="code.jpg" alt="终端里运行代码的屏幕">
  <figcaption>用于演示的终端截图，可以换成自己的调试画面。</figcaption>
</figure>

## 两张图片并排

当需要对比两张截图时，可以利用一个小的 `<div>` 容器放两个 `<img>`：

<div class="image-grid">
  <img src="code.jpg" alt="代码编辑器" loading="lazy">
  <img src="coffee.jpg" alt="清晨咖啡与笔记本" loading="lazy">
</div>

上面的示例都只用到文件名，因此把图片复制进文章目录后即可引用。如果想在其它文章复用同一张图，可以把文件放到 `static/images/`，引用时写绝对路径（例如 `/images/screenshot.png`）。

写完后运行 `hugo server -D`，在浏览器里确认图片是否显示正确，同时检查体积和视觉效果是否满足预期。
