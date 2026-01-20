# covergen

从 SVG 模板库生成文章背景图（SVG），并叠加文章标题文字。

## 快速开始

在仓库根目录运行：

```bash
node script/covergen/gen_cover.js --title "我的文章名"
```

默认会输出到：`script/covergen/output/`（不会修改 `content/`）。

## 常用命令

- **列出模板**

```bash
node script/covergen/gen_cover.js --list-templates
```

- **列出配色预设**

```bash
node script/covergen/gen_cover.js --list-presets
```

- **指定模板 + 指定 preset**

```bash
node script/covergen/gen_cover.js \
  --title "Agent Skills" \
  --template template-hex-a.svg \
  --preset morandi
```

- **自定义颜色 + 调整图案参数**

```bash
node script/covergen/gen_cover.js \
  --title "My Notes" \
  --template template-hex-b.svg \
  --bg "#050814" --primary "#22d3ee" --accent "#a78bfa" \
  --scale 2.2 --rotate 0 \
  --width 1200 --height 630
```

- **调整文字**

```bash
node script/covergen/gen_cover.js \
  --title "一篇文章" \
  --subtitle "副标题可选" \
  --titleSize 72 --subtitleSize 30 \
  --textBgOpacity 0.32 \
  --textY "55%"
```

## 模板约定（你的模板库怎么放）

把你收集的 SVG 放到 `script/covergen/templates/` 下（每个模板一个 `.svg` 文件）。

### 添加模板（推荐方式：脚本）

把 SVG 粘贴进来就能保存为一个模板文件：

```bash
node script/covergen/add_template.js --name "my-template-name"
```

然后粘贴完整 `<svg ...>...</svg>`，最后按 **Ctrl-D** 结束输入。

也可以从文件导入：

```bash
node script/covergen/add_template.js --name "my-template-name" --file /absolute/path/to/template.svg
```

#### 批量导入（一个文本里放多个 SVG）

如果你的 `add_template.txt` 里包含多个 `<svg>...</svg>` 块，脚本会自动切分并按序号保存：

```bash
node script/covergen/add_template.js --name "a" --file /absolute/path/to/add_template.txt
```

会生成：
- `template-a_1.svg`
- `template-a_2.svg`
- ...

生成器会从模板 SVG 中提取第一个 `pattern` 作为背景平铺单元，并进行一些标准化：

- **pattern id** 会统一重写为 `a`（方便统一引用）
- 颜色占位符会被替换（大小写不敏感）：
  - `#2b2b31` → `--bg`
  - `#ecc94b` → `--primary`
  - `#f44034` → `--accent`

如果你的模板不是这三种颜色占位，也可以后续扩展规则（或直接在模板里改成这三种占位色）。

## 输出文件

默认输出：`script/covergen/output/<title>.svg`（会做简单的文件名清理）。

建议不要把 `output/` 里的生成结果提交到 git；需要时把某一张复制到文章目录里作为 `cover.svg` 即可。

