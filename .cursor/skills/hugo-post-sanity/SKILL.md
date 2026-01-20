# Hugo Post Sanity Check

## Metadata

- **name**: Hugo Post Sanity Check
- **purpose**: 对单篇 Hugo 文章（`content/posts/<slug>/index.md`）做快速、可重复的质量检查，并给出可直接应用的修改建议。
- **inputs**:
  - 文章文件路径（必需）
  - 如涉及图片：文章同目录下的图片文件名列表（可选）
- **outputs**:
  - 发现的问题清单（分组、可执行）
  - 可选：按需要生成最小 diff（只改必要内容）

## When to use

当用户说这些话时触发：

- “帮我检查这篇文章有没有问题”
- “Hugo 构建/渲染哪里不对”
- “发布前帮我做一遍 checklist”

## Non-goals（不要做）

- 不要大改文风或重写全文，除非用户明确要求。
- 不要引入与仓库规范冲突的格式（比如随意改 front matter 风格）。
- 不要对 `public/` 产物做任何修改（它是生成物）。

## Procedure（严格按顺序）

### 1) Read & classify

- 先读完整文章，记录：
  - front matter 字段、标题层级、代码块语言标注
  - 图片引用方式（相对/绝对）、是否与同目录资源一致
  - 是否有明显的 Hugo shortcodes / Mermaid / 数学公式等

### 2) Front matter checks

- 必查：
  - `title` 是否存在、语义清晰
  - `date` / `draft` 是否符合当前阶段（草稿/发布）
  - `tags` / `categories`（如果仓库对它们有约定）
- 如果仓库使用 TOML/YAML/JSON 任意一种：**保持原样**，不要擅自切换。

### 3) Markdown structure checks

- 标题层级递进：不跳级（例如从 `##` 直接到 `####`）
- 代码块：
  - 有明确语言（如 `bash`, `go`, `json`），除非确实未知
  - 命令示例尽量可复制（避免提示符混入）
- 链接：
  - 外链格式统一（如果仓库有规范）
  - 文章内锚点可用（必要时给出修复建议）

### 4) Assets & images checks

针对 `content/posts/<slug>/`：

- 图片引用路径与实际文件名一致（大小写敏感）
- 建议优先用同目录相对引用（便于搬迁），除非你站点有统一静态目录策略
- 图片是否缺少 `alt` 文本（可选优化）

### 5) Hugo build risk checks（静态分析）

不运行命令也要能发现的典型坑：

- Markdown 中的 HTML 是否未闭合（会影响布局）
- Mermaid/Math 是否需要特定 shortcodes（如果主题要求）
- 代码围栏是否缺失闭合 ```（非常常见）

### 6) Report & propose minimal patch

- 输出分三组：
  - **Must fix**（会导致构建失败/渲染错误）
  - **Should fix**（体验/一致性问题）
  - **Nice to have**（可选润色）
- 如果用户希望你“直接改”：只做 Must fix + 少量 Should fix，保持最小 diff。

## Examples

见 `skills/hugo-post-sanity/examples/`。

