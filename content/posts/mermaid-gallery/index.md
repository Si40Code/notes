---
title: "Mermaid 图示全览"
date: 2025-09-27T00:46:00+08:00
draft: false
tags: ["Mermaid", "可视化", "测试"]
summary: "收集常用的 Mermaid 语法，包括流程图、时序图、状态图、甘特图等，方便确认主题展示效果。"
cover: cover.jpg
coverAlt: "数据可视化仪表盘屏幕"
coverCaption: "Mermaid 图示灵感墙"
---

Mermaid 支持多种图形语言，这篇文章快速罗列我最常用的几种类型，方便检查主题对代码块的渲染表现。

## 流程图 (Flowchart)

```mermaid
flowchart LR
    A[需求梳理] --> B{是否可实现?}
    B -- 是 --> C[拆分任务]
    B -- 否 --> D[继续调研]
    C --> E[实现功能]
    D --> B
    E --> F{通过测试?}
    F -- 是 --> G[部署]
    F -- 否 --> C
```

## 时序图 (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User
    participant S as Static Site
    participant G as GitHub

    U->>S: 浏览首页
    S-->>U: 返回最新文章列表
    U->>G: 触发 GitHub Actions
    G-->>U: 通知构建结果
```

## 状态图 (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> InReview: PR 已创建
    InReview --> ChangesRequested
    ChangesRequested --> InReview: 提交修订
    InReview --> Published: 合并主干
    Published --> Archived: 版本迭代
```

## 类图 (Class Diagram)

```mermaid
classDiagram
    class Article {
      +string title
      +string summary
      +Date date
      +render()
    }

    class BuildPipeline {
      +run()
      +deploy()
    }

    Article <|-- MarkdownArticle
    BuildPipeline o-- Article
```

## 饼图 (Pie Chart)

```mermaid
pie showData
    title 一周写作时间占比
    "写作" : 12
    "阅读" : 8
    "调研" : 6
    "复盘" : 4
```

## 甘特图 (Gantt Chart)

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title 博客优化迭代计划
    section 基础设施
      初始化仓库      :done,    des1, 2025-09-20, 2025-09-21
      Pages 自动部署  :active,  des2, 2025-09-22, 2d
    section 主题美化
      设计首页        :         des3, 2025-09-24, 1d
      样式调优        :         des4, after des3, 2d
      提交流程        :crit,    des5, after des4, 1d
```

## Journey 图 (Journey Diagram)

```mermaid
journey
    title 写博客的心情曲线
    section 起步阶段
      构思选题: 3: 灵感一般
      收集素材: 2: 有点纠结
    section 写作阶段
      起草大纲: 4: 稍微顺畅
      编写正文: 5: 进入状态
      调整格式: 4: 保持节奏
    section 发布阶段
      推送仓库: 5: 稳定
      Actions 部署: 4: 等待通过
      分享链接: 5: 小兴奋
```

## 结语

有了这份示例，就能快速确认主题对 Mermaid 图的支持效果。如果要隐藏或按需加载 Mermaid，也可以进一步通过 Hugo 管道进行优化。
