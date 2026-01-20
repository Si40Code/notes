#!/usr/bin/env node
/**
 * Add a new SVG template into script/covergen/templates/
 *
 * Typical usage (paste SVG then Ctrl-D):
 *   node script/covergen/add_template.js --name "heart-stitch"
 *
 * From file:
 *   node script/covergen/add_template.js --name "heart-stitch" --file /path/to/template.svg
 */

const fs = require("fs");
const path = require("path");

const SCRIPT_DIR = __dirname;
const TEMPLATES_DIR = path.join(SCRIPT_DIR, "templates");

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

function slugifyName(name) {
  const cleaned = String(name)
    .trim()
    .replace(/[\\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return `template-${Date.now()}`;
  const slug = cleaned
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug.length > 80 ? slug.slice(0, 80).replace(/-+$/g, "") : slug;
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
  });
}

function validateTemplateSvg(svg) {
  const s = String(svg).trim();
  if (!s.toLowerCase().includes("<svg")) return 'Missing "<svg"';
  if (!s.toLowerCase().includes("<pattern")) return 'Missing "<pattern" (covergen extracts first pattern)';
  if (!s.toLowerCase().includes("</pattern>")) return 'Missing "</pattern>"';
  return null;
}

function extractAllSvgs(text) {
  const matches = String(text).match(/<svg\b[\s\S]*?<\/svg>/gi) || [];
  return matches.map((m) => m.trim()).filter(Boolean);
}

async function main() {
  const args = parseArgs(process.argv);
  const nameArg = args.name && args.name !== true ? String(args.name) : "";
  if (!nameArg) {
    console.error('Missing required: --name "my-template-name"');
    process.exit(2);
  }

  const slug = slugifyName(nameArg);

  let svg = "";
  if (args.file && args.file !== true) {
    const p = path.isAbsolute(String(args.file)) ? String(args.file) : path.resolve(process.cwd(), String(args.file));
    svg = fs.readFileSync(p, "utf-8");
  } else {
    console.log("Paste SVG template, then press Ctrl-D to finish.");
    svg = await readStdin();
  }

  // Support batch mode: a text file can contain multiple <svg>...</svg> blocks.
  const svgs = extractAllSvgs(svg);
  const items = svgs.length ? svgs : [String(svg).trim()];

  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

  const saved = [];
  for (let i = 0; i < items.length; i++) {
    const content = items[i];
    const err = validateTemplateSvg(content);
    if (err) {
      console.error(`Invalid template SVG (#${i + 1}): ${err}`);
      process.exit(2);
    }

    const suffix = items.length > 1 ? `_${i + 1}` : "";
    const outPath = path.join(TEMPLATES_DIR, `template-${slug}${suffix}.svg`);
    fs.writeFileSync(outPath, content.trim() + "\n", "utf-8");
    saved.push(outPath);
  }

  if (saved.length === 1) {
    console.log(`✓ Saved template: ${saved[0]}`);
  } else {
    console.log(`✓ Saved ${saved.length} templates:`);
    saved.forEach((p) => console.log(`  - ${p}`));
  }

  console.log("Next:");
  console.log(`  node script/covergen/gen_cover.js --list-templates`);
  console.log(`  node script/covergen/gen_cover.js --title "My Article" --template ${path.basename(saved[0])}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

