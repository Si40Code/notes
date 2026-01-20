/**
 * Generate a cover.svg similar to content/posts/agent-skills/cover.svg
 * (pattern template taken from https://github.com/catchspider2002/svelte-svg-patterns)
 *
 * Usage:
 *   node generate-cover-like.js --out output/cover-like.svg
 *   node generate-cover-like.js --out output/cover-like.svg --bg "#111827" --primary "#fbbf24" --accent "#ef4444" --scale 2
 */
const fs = require("fs");
const path = require("path");
 
function getArg(name, defaultValue) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return defaultValue;
  const value = process.argv[idx + 1];
  if (!value || value.startsWith("--")) return defaultValue;
  return value;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
 
function buildCoverSvg({
  bg = "#2b2b31",
  primary = "#ecc94b",
  accent = "#f44034",
  tileW = 30,
  tileH = 60,
  scale = 2,
  canvasPercent = 800,
  width = 1200,
  height = 630,
  title,
  subtitle,
  textColor = "#ffffff",
  fontFamily =
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  titleSize = 72,
  subtitleSize = 30,
  textBg = "#000000",
  textBgOpacity = 0.35,
  textX = "50%",
  textY = "50%",
} = {}) {
  // The two paths are exactly the same geometry as your current cover.svg,
  // only colors / sizing are parameterized.
  const pathPrimary =
    "M9.27 0 0 6.48v23.49l15 10V60h5.16L30 53.46V29.97L15 19.96V0Zm5.83 0L30 9.9V6.48L20.26 0ZM15 23.4l9.9 6.57-9.9 6.58-9.9-6.58ZM0 50.1v3.36l9.22 6.48.1.06h5.6l-.1-.06z";
  const pathAccent =
    "M0 0v3.4L5 0zm24.48 0L30 3.4V0zM15 26.2l-5.68 3.77L15 33.73l5.68-3.76Zm15 30.2L24.48 60H30Zm-30 0V60h5z";
 
  const hasText = Boolean(title || subtitle);
  const safeTitle = title ? escapeXml(title) : "";
  const safeSubtitle = subtitle ? escapeXml(subtitle) : "";

  // Simple readability panel behind text (optional)
  const textPanel = hasText
    ? `<rect x="0" y="0" width="100%" height="100%" fill="${textBg}" fill-opacity="${textBgOpacity}"/>`
    : "";

  const textGroup = hasText
    ? `<g transform="translate(0,0)">
        <g x="0" y="0" style="font-family:${escapeXml(fontFamily)}" fill="${textColor}">
          <g transform="translate(0,0)">
            <g>
              <g>
                <g>
                  <g>
                    <g>
                      <g>
                        <g>
                          <g>
                            <g>
                              <g>
                                <g>
                                  <g>
                                    <g>
                                      <g>
                                        <g>
                                          <g>
                                            <g>
                                              <g>
                                                <g>
                                                  <g>
                                                    <g>
                                                      <g>
                                                        <g>
                                                          <g>
                                                            <g>
                                                              <g>
                                                                <g>
                                                                  <g>
                                                                    <g>
                                                                      <g>
                                                                        <g>
                                                                          <g>
                                                                            <g>
                                                                              <g>
                                                                                <g>
                                                                                  <g>
                                                                                    <g>
                                                                                      <g>
                                                                                        <g>
                                                                                          <g>
                                                                                            <g>
                                                                                              <g>
                                                                                                <g>
                                                                                                  <g>
                                                                                                    <g>
                                                                                                      <g>
                                                                                                        <g>
                                                                                                          <g>
                                                                                                            <g>
                                                                                                              <g>
                                                                                                                <g>
                                                                                                                  <g>
                                                                                                                    <g>
                                                                                                                      <g>
                                                                                                                        <g>
                                                                                                                          <g>
                                                                                                                            <g>
                                                                                                                              <g>
                                                                                                                                <g>
                                                                                                                                  <g>
                                                                                                                                    <g>
                                                                                                                                      <g>
                                                                                                                                        <g>
                                                                                                                                          <g>
                                                                                                                                            <g>
                                                                                                                                              <g>
                                                                                                                                                <g>
                                                                                                                                                  <g>
                                                                                                                                                    <g>
                                                                                                                                                      <g>
                                                                                                                                                        <g>
                                                                                                                                                          <g>
                                                                                                                                                            <g>
                                                                                                                                                              <g>
                                                                                                                                                                <g>
                                                                                                                                                                  <g>
                                                                                                                                                                    <g>
                                                                                                                                                                      <g>
                                                                                                                                                                        <g>
                                                                                                                                                                          <g>
                                                                                                                                                                            <g>
                                                                                                                                                                              <g>
                                                                                                                                                                                <g>
                                                                                                                                                                                  <g>
                                                                                                                                                                                    <g>
                                                                                                                                                                                      <g>
                                                                                                                                                                                        <g>
                                                                                                                                                                                          <g>
                                                                                                                                                                                            <g>
                                                                                                                                                                                              <g>
                                                                                                                                                                                                <g>
                                                                                                                                                                                                  <g>
                                                                                                                                                                                                    <g>
                                                                                                                                                                                                      <g>
                                                                                                                                                                                                        <g>
                                                                                                                                                                                                          <g>
                                                                                                                                                                                                            <g>
                                                                                                                                                                                                              <g>
                                                                                                                                                                                                                <g>
                                                                                                                                                                                                                  <g>
                                                                                                                                                                                                                    <g>
                                                                                                                                                                                                                      <g>
                                                                                                                                                                                                                        <g>
                                                                                                                                                                                                                          <g>
                                                                                                                                                                                                                            <g>
                                                                                                                                                                                                                              <g>
                                                                                                                                                                                                                                <g>
                                                                                                                                                                                                                                  <g>
                                                                                                                                                                                                                                    <g>
                                                                                                                                                                                                                                      <g>
                                                                                                                                                                                                                                        <g>
                                                                                                                                                                                                                                          <g>
                                                                                                                                                                                                                                            <g>
                                                                                                                                                                                                                                              <g>
                                                                                                                                                                                                                                                <g>
                                                                                                                                                                                                                                                  <g>
                                                                                                                                                                                                                                                    <g>
                                                                                                                                                                                                                                                      <g>
                                                                                                                                                                                                                                                        <g>
                                                                                                                                                                                                                                                          <g>
                                                                                                                                                                                                                                                            <g>
                                                                                                                                                                                                                                                              <g>
                                                                                                                                                                                                                                                                <g>
                                                                                                                                                                                                                                                                  <g>
                                                                                                                                                                                                                                                                    <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-size="${titleSize}" font-weight="800" style="paint-order:stroke;stroke:#000;stroke-opacity:0.35;stroke-width:10">
                                                                                                                                                                                                                                                                      ${safeTitle}
                                                                                                                                                                                                                                                                    </text>
                                                                                                                                                                                                                                                                    ${
                                                                                                                                                                                                                                                                      safeSubtitle
                                                                                                                                                                                                                                                                        ? `<text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-size="${subtitleSize}" font-weight="600" dy="${Math.round(
                                                                                                                                                                                                                                                                            titleSize * 0.75
                                                                                                                                                                                                                                                                          )}" style="paint-order:stroke;stroke:#000;stroke-opacity:0.35;stroke-width:6">
                                                                                                                                                                                                                                                                             ${safeSubtitle}
                                                                                                                                                                                                                                                                           </text>`
                                                                                                                                                                                                                                                                        : ""
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                  </g>
                                                                                                                                                                                                                                                                </g>
                                                                                                                                                                                                                                                              </g>
                                                                                                                                                                                                                                                            </g>
                                                                                                                                                                                                                                                          </g>
                                                                                                                                                                                                                                                        </g>
                                                                                                                                                                                                                                                      </g>
                                                                                                                                                                                                                                                    </g>
                                                                                                                                                                                                                                                  </g>
                                                                                                                                                                                                                                                </g>
                                                                                                                                                                                                                                              </g>
                                                                                                                                                                                                                                            </g>
                                                                                                                                                                                                                                          </g>
                                                                                                                                                                                                                                        </g>
                                                                                                                                                                                                                                      </g>
                                                                                                                                                                                                                                    </g>
                                                                                                                                                                                                                                  </g>
                                                                                                                                                                                                                                </g>
                                                                                                                                                                                                                              </g>
                                                                                                                                                                                                                            </g>
                                                                                                                                                                                                                          </g>
                                                                                                                                                                                                                        </g>
                                                                                                                                                                                                                      </g>
                                                                                                                                                                                                                    </g>
                                                                                                                                                                                                                  </g>
                                                                                                                                                                                                                </g>
                                                                                                                                                                                                              </g>
                                                                                                                                                                                                            </g>
                                                                                                                                                                                                          </g>
                                                                                                                                                                                                        </g>
                                                                                                                                                                                                      </g>
                                                                                                                                                                                                    </g>
                                                                                                                                                                                                  </g>
                                                                                                                                                                                                </g>
                                                                                                                                                                                              </g>
                                                                                                                                                                                            </g>
                                                                                                                                                                                          </g>
                                                                                                                                                                                        </g>
                                                                                                                                                                                      </g>
                                                                                                                                                                                    </g>
                                                                                                                                                                                  </g>
                                                                                                                                                                                </g>
                                                                                                                                                                              </g>
                                                                                                                                                                            </g>
                                                                                                                                                                          </g>
                                                                                                                                                                        </g>
                                                                                                                                                                      </g>
                                                                                                                                                                    </g>
                                                                                                                                                                  </g>
                                                                                                                                                                </g>
                                                                                                                                                              </g>
                                                                                                                                                            </g>
                                                                                                                                                          </g>
                                                                                                                                                        </g>
                                                                                                                                                      </g>
                                                                                                                                                    </g>
                                                                                                                                                  </g>
                                                                                                                                                </g>
                                                                                                                                              </g>
                                                                                                                                            </g>
                                                                                                                                          </g>
                                                                                                                                        </g>
                                                                                                                                      </g>
                                                                                                                                    </g>
                                                                                                                                  </g>
                                                                                                                                </g>
                                                                                                                              </g>
                                                                                                                            </g>
                                                                                                                          </g>
                                                                                                                        </g>
                                                                                                                      </g>
                                                                                                                    </g>
                                                                                                                  </g>
                                                                                                                </g>
                                                                                                              </g>
                                                                                                            </g>
                                                                                                          </g>
                                                                                                        </g>
                                                                                                      </g>
                                                                                                    </g>
                                                                                                  </g>
                                                                                                </g>
                                                                                              </g>
                                                                                            </g>
                                                                                          </g>
                                                                                        </g>
                                                                                      </g>
                                                                                    </g>
                                                                                  </g>
                                                                                </g>
                                                                              </g>
                                                                            </g>
                                                                          </g>
                                                                        </g>
                                                                      </g>
                                                                    </g>
                                                                  </g>
                                                                </g>
                                                              </g>
                                                            </g>
                                                          </g>
                                                        </g>
                                                      </g>
                                                    </g>
                                                  </g>
                                                </g>
                                              </g>
                                            </g>
                                          </g>
                                        </g>
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs>` +
    `<pattern id="a" width="${tileW}" height="${tileH}" patternTransform="scale(${scale})" patternUnits="userSpaceOnUse">` +
    `<rect width="100%" height="100%" fill="${bg}"/>` +
    `<path fill="${primary}" d="${pathPrimary}"/>` +
    `<path fill="${accent}" d="${pathAccent}"/>` +
    `</pattern>` +
    `</defs>` +
    `<rect width="${canvasPercent}%" height="${canvasPercent}%" fill="url(#a)"/>` +
    (hasText ? `<g>${textPanel}${textGroup}</g>` : "") +
    `</svg>`
  );
}
 
function main() {
  const out = getArg("out", path.join(__dirname, "output", "cover-like.svg"));
  const bg = getArg("bg", "#2b2b31");
  const primary = getArg("primary", "#ecc94b");
  const accent = getArg("accent", "#f44034");
  const tileW = Number(getArg("tileW", "30"));
  const tileH = Number(getArg("tileH", "60"));
  const scale = Number(getArg("scale", "2"));
  const canvasPercent = Number(getArg("canvasPercent", "800"));
  const width = Number(getArg("width", "1200"));
  const height = Number(getArg("height", "630"));
  const title = getArg("title", undefined);
  const subtitle = getArg("subtitle", undefined);
  const textColor = getArg("textColor", "#ffffff");
  const fontFamily = getArg("fontFamily", undefined);
  const titleSize = Number(getArg("titleSize", "72"));
  const subtitleSize = Number(getArg("subtitleSize", "30"));
  const textBg = getArg("textBg", "#000000");
  const textBgOpacity = Number(getArg("textBgOpacity", "0.35"));
  const textX = getArg("textX", "50%");
  const textY = getArg("textY", "50%");
 
  const svg = buildCoverSvg({
    bg,
    primary,
    accent,
    tileW,
    tileH,
    scale,
    canvasPercent,
    width,
    height,
    title,
    subtitle,
    textColor,
    fontFamily: fontFamily || undefined,
    titleSize,
    subtitleSize,
    textBg,
    textBgOpacity,
    textX,
    textY,
  });
 
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg, "utf-8");
 
  console.log(`✓ Generated: ${out}`);
  console.log(`  bg=${bg} primary=${primary} accent=${accent} tile=${tileW}x${tileH} scale=${scale} canvas=${canvasPercent}%`);
}
 
main();
