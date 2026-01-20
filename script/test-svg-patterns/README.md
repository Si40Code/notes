# 测试 svelte-svg-patterns 库

这个文件夹用于测试 [svelte-svg-patterns](https://github.com/catchspider2002/svelte-svg-patterns) 库。

## 关于 svelte-svg-patterns

这是一个用于生成无缝 SVG 图案的 Svelte 应用，提供了 320+ 种图案。

- **网站**: https://pattern.monster
- **GitHub**: https://github.com/catchspider2002/svelte-svg-patterns

## 功能特性

✔ 自定义前景色和背景色  
✔ 修改描边宽度（支持的图案）  
✔ 改变角度生成独特图像  
✔ 复制 CSS 和 SVG 代码到剪贴板  
✔ 下载可平铺的 SVG 或高分辨率无缝 PNG 图像  
✔ 按描边/填充或颜色数量筛选图案  
✔ 搜索图案  
✔ 按字母顺序或更新日期排序图案  

## 使用方法

### 方式 1: 使用网站界面（推荐）

访问 https://pattern.monster，在网页上：
1. 浏览 320+ 种图案
2. 自定义颜色、角度、描边宽度等参数
3. 复制 SVG 代码或下载图像

### 方式 2: 运行测试脚本

```bash
npm test
```

这会生成一些示例 SVG 图案到 `output/` 目录。

### 方式 3: 生成 `cover.svg` 同款（推荐）

这个仓库里 `content/posts/agent-skills/cover.svg` 对应的就是 `svelte-svg-patterns` 的一个 pattern 模板。你可以用下面这个脚本生成“同款结构”的 SVG（可换色/缩放）。

```bash
npm run generate:cover
```

输出文件默认是 `output/cover-like.svg`。

你也可以自定义参数：

```bash
node generate-cover-like.js \
  --out output/cover-like.svg \
  --bg "#111827" \
  --primary "#fbbf24" \
  --accent "#ef4444" \
  --scale 2
```

### 方式 3: 自定义参数

你可以修改 `test.js` 文件中的函数调用，自定义图案参数：

```javascript
// 自定义波浪图案
createWavePattern(
  100,      // 宽度
  100,      // 高度
  15,       // 振幅 (wave amplitude)
  3,        // 频率 (wave frequency)
  3,        // 描边宽度
  '#2c3e50', // 描边颜色
  '#ecf0f1'  // 背景颜色
)

// 自定义星形图案
createStarPattern(
  100,      // 宽度
  100,      // 高度
  20,       // 星形大小
  2,        // 描边宽度
  '#e74c3c', // 描边颜色
  '#fff5f5', // 背景颜色
  30        // 间距
)
```

## 文件说明

- `test.js` - 测试脚本，生成示例 SVG 图案
- `output/` - 生成的 SVG 文件输出目录
- `package.json` - Node.js 项目配置

## 生成的图案示例

测试脚本会生成以下类型的图案：

### 基础图案
- **网格图案** (grid.svg) - 简单的网格线条
- **点状图案** (dots.svg) - 均匀分布的点
- **斜线图案** (diagonal.svg) - 对角线图案

### 复杂图案
- **波浪图案** (waves.svg) - 平滑的波浪曲线
- **六边形图案** (hexagon.svg) - 蜂窝状六边形网格
- **星形图案** (stars.svg) - 五角星重复图案
- **交叉线图案** (crosshatch.svg) - 交叉斜线纹理

### 高级图案
- **同心圆图案** (concentric-circles.svg) - 多个同心圆
- **三角形图案** (triangles.svg) - 三角形重复图案
- **编织图案** (weave.svg) - 编织纹理效果
- **花型图案** (flowers.svg) - 花瓣形状重复图案

### 大尺寸版本 (800x800)
适合用作博客封面图片或其他大型用途：
- waves-large.svg
- hexagon-large.svg
- stars-large.svg
- flowers-large.svg

## 在你的项目中使用

生成的 SVG 图案可以用于：
- 网站背景
- 封面图片
- 信纸设计
- 包装设计

在你的 Hugo 博客中，可以将生成的 SVG 文件放在 `content/posts/<slug>/` 目录下作为封面图片。
