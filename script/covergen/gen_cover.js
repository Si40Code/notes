#!/usr/bin/env node
/**
 * covergen: generate SVG cover background from template patterns + text overlay.
 *
 * Minimal:
 *   node script/covergen/gen_cover.js --title "Article Title"
 *
 * Helpful:
 *   node script/covergen/gen_cover.js --list-templates
 *   node script/covergen/gen_cover.js --list-presets
 */

const fs = require("fs");
const path = require("path");

const SCRIPT_DIR = __dirname;
const TEMPLATES_DIR = path.join(SCRIPT_DIR, "templates");
const OUTPUT_DIR = path.join(SCRIPT_DIR, "output");
const PRESETS_PATH = path.join(SCRIPT_DIR, "presets.json");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function readJsonIfExists(filePath) {
  try {
    const txt = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function listTemplateFiles() {
  try {
    return fs
      .readdirSync(TEMPLATES_DIR)
      .filter((f) => f.toLowerCase().endsWith(".svg"))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function resolveTemplatePath(templateArg) {
  if (!templateArg) return null;

  // Absolute / relative path
  if (templateArg.includes("/") || templateArg.includes("\\") || templateArg.endsWith(".svg")) {
    const p = path.isAbsolute(templateArg) ? templateArg : path.resolve(process.cwd(), templateArg);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }

  // Name inside templates dir
  const name = templateArg.endsWith(".svg") ? templateArg : `${templateArg}.svg`;
  const p2 = path.join(TEMPLATES_DIR, name);
  if (fs.existsSync(p2) && fs.statSync(p2).isFile()) return p2;

  return null;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function slugifyFilename(name) {
  const cleaned = String(name)
    .trim()
    // drop filesystem-unsafe characters
    .replace(/[\\\/:*?"<>|]/g, " ")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return `cover-${Date.now()}`;

  // Turn spaces into hyphens; keep unicode (Chinese titles are fine as filenames on macOS).
  const slug = cleaned
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug.length > 100 ? slug.slice(0, 100).replace(/-+$/g, "") : slug;
}

function extractFirstPattern(svgText) {
  const m = svgText.match(/<pattern\b[\s\S]*?<\/pattern>/i);
  if (!m) return null;
  return m[0];
}

function normalizePattern(patternXml, overrides) {
  let p = patternXml;

  // Ensure id="a"
  if (/\bid\s*=/.test(p)) {
    p = p.replace(/\bid\s*=\s*(['"])[\s\S]*?\1/i, 'id="a"');
  } else {
    p = p.replace(/<pattern\b/i, '<pattern id="a"');
  }

  // width/height override
  if (overrides.tileW != null) {
    p = p.replace(/\bwidth\s*=\s*(['"])[^'"]*\1/i, `width="${overrides.tileW}"`);
  }
  if (overrides.tileH != null) {
    p = p.replace(/\bheight\s*=\s*(['"])[^'"]*\1/i, `height="${overrides.tileH}"`);
  }

  // patternTransform override (scale/rotate)
  const wantsTransform = overrides.scale != null || overrides.rotate != null;
  if (wantsTransform) {
    const parts = [];
    if (overrides.scale != null) parts.push(`scale(${overrides.scale})`);
    if (overrides.rotate != null) parts.push(`rotate(${overrides.rotate})`);
    const newTransform = parts.join(" ");

    if (/\bpatternTransform\s*=/.test(p)) {
      p = p.replace(/\bpatternTransform\s*=\s*(['"])[^'"]*\1/i, `patternTransform="${newTransform}"`);
    } else {
      p = p.replace(/<pattern\b/i, `<pattern patternTransform="${newTransform}"`);
    }
  }

  // Color replacement (placeholders)
  if (overrides.bg) p = p.replace(/#2b2b31/gi, overrides.bg);
  if (overrides.primary) p = p.replace(/#ecc94b/gi, overrides.primary);
  if (overrides.accent) p = p.replace(/#f44034/gi, overrides.accent);

  return p;
}

function renderSvg({
  width,
  height,
  patternXml,
  title,
  subtitle,
  textColor,
  fontFamily,
  titleSize,
  subtitleSize,
  textBg,
  textBgOpacity,
  textX,
  textY,
}) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = subtitle ? escapeXml(subtitle) : "";

  const hasSubtitle = Boolean(safeSubtitle);
  const dy = Math.round(titleSize * 0.75);

  // a simple readability overlay behind text, not full-screen: a centered rounded rect.
  // (kept simple & robust; no filters needed)
  const panelW = Math.round(width * 0.86);
  const panelH = Math.round(height * (hasSubtitle ? 0.30 : 0.22));
  const panelX = Math.round((width - panelW) / 2);
  const panelY = Math.round(height * 0.36);
  const r = Math.round(Math.min(width, height) * 0.02);

  const textLayer = `
  <g>
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="${r}" ry="${r}" fill="${textBg}" fill-opacity="${textBgOpacity}"/>
    <text x="${escapeXml(textX)}" y="${escapeXml(textY)}" text-anchor="middle" dominant-baseline="middle"
      font-family="${escapeXml(fontFamily)}" font-size="${titleSize}" font-weight="800"
      fill="${textColor}"
      style="paint-order:stroke;stroke:#000;stroke-opacity:0.35;stroke-width:${Math.max(6, Math.round(titleSize * 0.14))}">
      ${safeTitle}
    </text>
    ${
      hasSubtitle
        ? `<text x="${escapeXml(textX)}" y="${escapeXml(textY)}" dy="${dy}" text-anchor="middle" dominant-baseline="middle"
      font-family="${escapeXml(fontFamily)}" font-size="${subtitleSize}" font-weight="600"
      fill="${textColor}"
      style="paint-order:stroke;stroke:#000;stroke-opacity:0.25;stroke-width:${Math.max(
        4,
        Math.round(subtitleSize * 0.12)
      )}">
      ${safeSubtitle}
    </text>`
        : ""
    }
  </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${patternXml}
  </defs>
  <rect width="100%" height="100%" fill="url(#a)"/>
  ${textLayer}
</svg>
`;
}

function main() {
  const args = parseArgs(process.argv);

  const presets = readJsonIfExists(PRESETS_PATH) || {};

  if (args["list-templates"]) {
    const list = listTemplateFiles();
    if (!list.length) {
      console.log("(no templates found)");
      process.exit(0);
    }
    list.forEach((f) => console.log(f));
    process.exit(0);
  }

  if (args["list-presets"]) {
    const keys = Object.keys(presets);
    if (!keys.length) {
      console.log("(no presets found)");
      process.exit(0);
    }
    keys.sort((a, b) => a.localeCompare(b)).forEach((k) => console.log(k));
    process.exit(0);
  }

  const title = args.title && args.title !== true ? String(args.title) : "";
  if (!title) {
    console.error('Missing required: --title "Article Title"');
    process.exit(2);
  }

  const subtitle = args.subtitle && args.subtitle !== true ? String(args.subtitle) : "";

  const presetName = args.preset && args.preset !== true ? String(args.preset) : "default";
  const preset = presets[presetName] || presets.default || {};

  const width = Number(args.width ?? 1200);
  const height = Number(args.height ?? 630);

  const bg = String(args.bg ?? preset.bg ?? "#2b2b31");
  const primary = String(args.primary ?? preset.primary ?? "#ecc94b");
  const accent = String(args.accent ?? preset.accent ?? "#f44034");

  const tileW = args.tileW != null ? Number(args.tileW) : null;
  const tileH = args.tileH != null ? Number(args.tileH) : null;
  const scale = args.scale != null ? Number(args.scale) : null;
  const rotate = args.rotate != null ? Number(args.rotate) : null;

  const textColor = String(args.textColor ?? preset.textColor ?? "#ffffff");
  const textBg = String(args.textBg ?? preset.textBg ?? "#000000");
  const textBgOpacity = Number(args.textBgOpacity ?? preset.textBgOpacity ?? 0.35);
  const titleSize = Number(args.titleSize ?? preset.titleSize ?? 72);
  const subtitleSize = Number(args.subtitleSize ?? preset.subtitleSize ?? 30);
  const textX = String(args.textX ?? "50%");
  const textY = String(args.textY ?? "50%");

  const fontFamily = String(
    args.fontFamily ??
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'
  );

  let templatePath = resolveTemplatePath(args.template && args.template !== true ? String(args.template) : "");
  if (!templatePath) {
    const list = listTemplateFiles();
    if (!list.length) {
      console.error(`No templates found in: ${TEMPLATES_DIR}`);
      process.exit(2);
    }
    templatePath = path.join(TEMPLATES_DIR, pickRandom(list));
  }

  const templateSvg = fs.readFileSync(templatePath, "utf-8");
  const patternXmlRaw = extractFirstPattern(templateSvg);
  if (!patternXmlRaw) {
    console.error(`Template does not contain <pattern>: ${templatePath}`);
    process.exit(2);
  }

  const patternXml = normalizePattern(patternXmlRaw, {
    bg,
    primary,
    accent,
    tileW,
    tileH,
    scale,
    rotate,
  });

  const out =
    args.out && args.out !== true
      ? (path.isAbsolute(String(args.out)) ? String(args.out) : path.resolve(process.cwd(), String(args.out)))
      : path.join(OUTPUT_DIR, `${slugifyFilename(title)}.svg`);

  fs.mkdirSync(path.dirname(out), { recursive: true });

  const svg = renderSvg({
    width,
    height,
    patternXml,
    title,
    subtitle,
    textColor,
    fontFamily,
    titleSize,
    subtitleSize,
    textBg,
    textBgOpacity,
    textX,
    textY,
  });

  fs.writeFileSync(out, svg, "utf-8");

  console.log(`✓ Generated: ${out}`);
  console.log(`  template: ${templatePath}`);
  console.log(`  preset: ${presetName}`);
}

main();

