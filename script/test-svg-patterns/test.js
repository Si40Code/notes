/**
 * 测试 svelte-svg-patterns 库
 * 这个库是一个 Svelte 应用，用于生成 SVG 图案
 * 网站: https://pattern.monster
 */

const fs = require('fs');
const path = require('path');

// 创建输出目录
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('测试 svelte-svg-patterns 库');
console.log('============================\n');

// 测试 1: 创建一个简单的 SVG 图案示例
console.log('测试 1: 创建简单的 SVG 图案示例');

// 这是一个简单的网格图案示例，基于 svelte-svg-patterns 的风格
function createGridPattern(width = 100, height = 100, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <path d="M ${width} 0 L 0 0 0 ${height}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>
</svg>`;
}

// 测试 2: 创建一个点状图案
function createDotPattern(width = 100, height = 100, dotSize = 4, dotColor = '#000000', bgColor = '#ffffff', spacing = 20) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dots" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${dotSize / 2}" fill="${dotColor}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <rect width="100%" height="100%" fill="url(#dots)"/>
</svg>`;
}

// 测试 3: 创建一个斜线图案
function createDiagonalPattern(width = 100, height = 100, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff', angle = 45) {
  const radians = (angle * Math.PI) / 180;
  const dx = width * Math.cos(radians);
  const dy = height * Math.sin(radians);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="diagonal" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <line x1="0" y1="0" x2="${dx}" y2="${dy}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#diagonal)"/>
</svg>`;
}

// 复杂图案 1: 波浪图案
function createWavePattern(width = 100, height = 100, amplitude = 10, frequency = 2, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff') {
  const waveLength = width / frequency;
  const points = [];
  for (let x = 0; x <= width + waveLength; x += 2) {
    const y = height / 2 + amplitude * Math.sin((x * 2 * Math.PI) / waveLength);
    points.push(`${x},${y}`);
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="waves" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <path d="M 0,${height/2} Q ${width/4},${height/2 + amplitude} ${width/2},${height/2} T ${width},${height/2}" 
            fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <path d="M 0,${height/2} Q ${width/4},${height/2 - amplitude} ${width/2},${height/2} T ${width},${height/2}" 
            fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#waves)"/>
</svg>`;
}

// 复杂图案 2: 六边形蜂窝图案
function createHexagonPattern(width = 100, height = 100, size = 20, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff') {
  const h = size * Math.sqrt(3);
  const w = size * 2;
  
  function getHexagonPath(cx, cy, r) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="hexagon" width="${w}" height="${h}" patternUnits="userSpaceOnUse">
      <rect width="${w}" height="${h}" fill="${bgColor}"/>
      <polygon points="${getHexagonPath(w/2, h/2, size)}" 
               fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <polygon points="${getHexagonPath(w/2, 0, size)}" 
               fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <polygon points="${getHexagonPath(w/4, h/4, size)}" 
               fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#hexagon)"/>
</svg>`;
}

// 复杂图案 3: 星形图案
function createStarPattern(width = 100, height = 100, starSize = 15, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff', spacing = 30) {
  function getStarPath(cx, cy, outerRadius, innerRadius, points = 5) {
    const path = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      path.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
    }
    path.push('Z');
    return path.join(' ');
  }
  
  const innerRadius = starSize * 0.4;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="stars" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <rect width="${spacing}" height="${spacing}" fill="${bgColor}"/>
      <path d="${getStarPath(spacing/2, spacing/2, starSize/2, innerRadius)}" 
            fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#stars)"/>
</svg>`;
}

// 复杂图案 4: 交叉线图案 (Crosshatch)
function createCrosshatchPattern(width = 100, height = 100, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff', spacing = 10) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="crosshatch" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <rect width="${spacing}" height="${spacing}" fill="${bgColor}"/>
      <line x1="0" y1="0" x2="${spacing}" y2="${spacing}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <line x1="${spacing}" y1="0" x2="0" y2="${spacing}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#crosshatch)"/>
</svg>`;
}

// 复杂图案 5: 同心圆图案
function createConcentricCirclesPattern(width = 100, height = 100, maxRadius = 40, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff', numCircles = 5) {
  const spacing = maxRadius / numCircles;
  const circles = [];
  for (let i = 1; i <= numCircles; i++) {
    const r = spacing * i;
    circles.push(`<circle cx="${width/2}" cy="${height/2}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`);
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="concentric" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      ${circles.join('\n      ')}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#concentric)"/>
</svg>`;
}

// 复杂图案 6: 三角形图案
function createTrianglePattern(width = 100, height = 100, size = 20, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff') {
  const h = size * Math.sqrt(3) / 2;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="triangles" width="${size}" height="${h}" patternUnits="userSpaceOnUse">
      <rect width="${size}" height="${h}" fill="${bgColor}"/>
      <polygon points="0,${h} ${size/2},0 ${size},${h}" 
               fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <polygon points="${size/2},${h} ${size + size/2},${h} ${size},0" 
               fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#triangles)"/>
</svg>`;
}

// 复杂图案 7: 编织图案 (Weave)
function createWeavePattern(width = 100, height = 100, bandWidth = 8, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff') {
  const paths = [];
  for (let i = 0; i < width; i += bandWidth * 2) {
    paths.push(`<path d="M ${i},0 Q ${i + bandWidth},${height/2} ${i},${height}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`);
    paths.push(`<path d="M ${i + bandWidth},0 Q ${i},${height/2} ${i + bandWidth},${height}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`);
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="weave" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      ${paths.join('\n      ')}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#weave)"/>
</svg>`;
}

// 复杂图案 8: 花型图案
function createFlowerPattern(width = 100, height = 100, petalCount = 8, petalLength = 20, strokeWidth = 2, strokeColor = '#000000', bgColor = '#ffffff', spacing = 40) {
  function getFlowerElements(cx, cy) {
    const elements = [];
    const centerRadius = petalLength * 0.3;
    
    // 花瓣
    for (let i = 0; i < petalCount; i++) {
      const angle1 = (2 * Math.PI / petalCount) * i;
      const angle2 = (2 * Math.PI / petalCount) * (i + 0.5);
      const angle3 = (2 * Math.PI / petalCount) * (i + 1);
      
      const x1 = cx + petalLength * Math.cos(angle1);
      const y1 = cy + petalLength * Math.sin(angle1);
      const x2 = cx + centerRadius * Math.cos(angle2);
      const y2 = cy + centerRadius * Math.sin(angle2);
      const x3 = cx + petalLength * Math.cos(angle3);
      const y3 = cy + petalLength * Math.sin(angle3);
      
      elements.push(`<path d="M ${cx},${cy} Q ${x1},${y1} ${x2},${y2} Q ${x3},${y3} ${cx},${cy}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`);
    }
    
    // 中心圆
    elements.push(`<circle cx="${cx}" cy="${cy}" r="${centerRadius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`);
    
    return elements.join('\n      ');
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="flowers" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <rect width="${spacing}" height="${spacing}" fill="${bgColor}"/>
      ${getFlowerElements(spacing/2, spacing/2)}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#flowers)"/>
</svg>`;
}

// 生成测试图案
const patterns = [
  { name: 'grid', svg: createGridPattern(100, 100, 2, '#333333', '#ffffff') },
  { name: 'dots', svg: createDotPattern(100, 100, 4, '#666666', '#f0f0f0', 20) },
  { name: 'diagonal', svg: createDiagonalPattern(100, 100, 2, '#444444', '#ffffff', 45) },
  { name: 'waves', svg: createWavePattern(100, 100, 10, 2, 2, '#2c3e50', '#ecf0f1') },
  { name: 'hexagon', svg: createHexagonPattern(100, 100, 18, 2, '#34495e', '#f8f9fa') },
  { name: 'stars', svg: createStarPattern(100, 100, 12, 1.5, '#e74c3c', '#fff5f5', 25) },
  { name: 'crosshatch', svg: createCrosshatchPattern(100, 100, 1.5, '#7f8c8d', '#ffffff', 12) },
  { name: 'concentric-circles', svg: createConcentricCirclesPattern(100, 100, 45, 2, '#3498db', '#ebf5fb', 5) },
  { name: 'triangles', svg: createTrianglePattern(100, 100, 20, 2, '#27ae60', '#eafaf1') },
  { name: 'weave', svg: createWeavePattern(100, 100, 8, 2, '#8e44ad', '#f4ecf7') },
  { name: 'flowers', svg: createFlowerPattern(100, 100, 8, 15, 1.5, '#e67e22', '#fef5e7', 35) }
];

console.log(`准备生成 ${patterns.length} 种图案...\n`);

patterns.forEach((pattern, index) => {
  const filePath = path.join(outputDir, `${pattern.name}.svg`);
  fs.writeFileSync(filePath, pattern.svg);
  console.log(`✓ [${index + 1}/${patterns.length}] 已生成: ${pattern.name}.svg`);
});

// 生成一些更大尺寸的版本（用于实际使用）
console.log('\n生成大尺寸版本 (800x800)...');
const largePatterns = [
  { name: 'waves-large', svg: createWavePattern(800, 800, 40, 4, 3, '#2c3e50', '#ecf0f1') },
  { name: 'hexagon-large', svg: createHexagonPattern(800, 800, 60, 3, '#34495e', '#f8f9fa') },
  { name: 'stars-large', svg: createStarPattern(800, 800, 40, 2, '#e74c3c', '#fff5f5', 80) },
  { name: 'flowers-large', svg: createFlowerPattern(800, 800, 8, 50, 2, '#e67e22', '#fef5e7', 120) }
];

largePatterns.forEach(pattern => {
  const filePath = path.join(outputDir, `${pattern.name}.svg`);
  fs.writeFileSync(filePath, pattern.svg);
  console.log(`✓ 已生成: ${pattern.name}.svg (800x800)`);
});

console.log('\n' + '='.repeat(50));
console.log('测试完成！');
console.log(`输出目录: ${outputDir}`);
console.log(`共生成 ${patterns.length + largePatterns.length} 个 SVG 文件`);
console.log('\n图案类型:');
console.log('  - 基础图案: grid, dots, diagonal');
console.log('  - 复杂图案: waves, hexagon, stars, crosshatch');
console.log('  - 高级图案: concentric-circles, triangles, weave, flowers');
console.log('  - 大尺寸版本: waves-large, hexagon-large, stars-large, flowers-large');
console.log('\n提示:');
console.log('- 这个库是一个 Svelte 应用，主要用于 web 界面');
console.log('- 访问 https://pattern.monster 可以看到完整的图案库（320+ 种图案）');
console.log('- 你可以通过网站界面自定义颜色、角度、描边宽度等参数');
console.log('- 生成的 SVG 可以直接用于网站背景、封面图片等');
console.log('- 大尺寸版本 (800x800) 适合用作博客封面图片');
