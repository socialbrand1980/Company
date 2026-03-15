import sharp from "sharp";
import { buildImagePath, makeSlug, truncateAtWord } from "./helpers.js";

const WIDTH = 1600;
const HEIGHT = 900;

function paletteForCategory(category) {
  if (category === "Social Media") {
    return {
      bgStart: "#061322",
      bgEnd: "#0C2742",
      accent: "#41D6FF",
      accentSoft: "#1C86FF",
      textMuted: "#9CC3DA",
    };
  }

  if (category === "Content Marketing") {
    return {
      bgStart: "#07111B",
      bgEnd: "#133149",
      accent: "#56C8FF",
      accentSoft: "#2A6CFF",
      textMuted: "#A9C3D8",
    };
  }

  return {
    bgStart: "#070D16",
    bgEnd: "#112B42",
    accent: "#56D5FF",
    accentSoft: "#2D75FF",
    textMuted: "#A9C4D9",
  };
}

function splitTitle(title, maxChars = 25) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSvg(article) {
  const palette = paletteForCategory(article.category);
  const titleLines = splitTitle(article.title);
  const category = escapeXml((article.category || "Brand Strategy").toUpperCase());
  const subtitle = escapeXml(truncateAtWord(article.excerpt || "", 110));
  const slug = escapeXml(makeSlug(article.title));

  const title = titleLines
    .map((line, index) => `<tspan x="118" dy="${index === 0 ? 0 : 84}">${escapeXml(line)}</tspan>`)
    .join("");

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="${WIDTH}" y2="${HEIGHT}" gradientUnits="userSpaceOnUse">
        <stop stop-color="${palette.bgStart}"/>
        <stop offset="1" stop-color="${palette.bgEnd}"/>
      </linearGradient>
      <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1300 120) rotate(130) scale(460 340)">
        <stop stop-color="${palette.accent}"/>
        <stop offset="1" stop-color="${palette.accent}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(280 760) rotate(-25) scale(520 360)">
        <stop stop-color="${palette.accentSoft}"/>
        <stop offset="1" stop-color="${palette.accentSoft}" stop-opacity="0"/>
      </radialGradient>
      <filter id="blur">
        <feGaussianBlur stdDeviation="22"/>
      </filter>
    </defs>

    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <circle cx="1300" cy="120" r="260" fill="url(#glowA)" filter="url(#blur)"/>
    <circle cx="280" cy="760" r="240" fill="url(#glowB)" filter="url(#blur)"/>

    <rect x="72" y="72" width="1456" height="756" rx="34" fill="rgba(8,14,24,0.28)" stroke="rgba(255,255,255,0.08)"/>
    <rect x="96" y="96" width="1100" height="708" rx="30" fill="rgba(7,13,22,0.38)" stroke="rgba(255,255,255,0.06)"/>

    <g opacity="0.48">
      <circle cx="1260" cy="228" r="118" stroke="${palette.accent}" stroke-opacity="0.38"/>
      <circle cx="1260" cy="228" r="164" stroke="${palette.accent}" stroke-opacity="0.16"/>
      <path d="M1130 544C1222 454 1358 424 1450 332" stroke="${palette.accent}" stroke-opacity="0.22" stroke-width="2"/>
      <path d="M1082 592C1180 514 1312 506 1420 448" stroke="${palette.accentSoft}" stroke-opacity="0.18" stroke-width="2"/>
    </g>

    <rect x="118" y="126" width="232" height="48" rx="24" fill="rgba(86,213,255,0.12)" stroke="rgba(86,213,255,0.30)"/>
    <text x="148" y="157" fill="#DDF6FF" font-size="22" font-family="Arial, Helvetica, sans-serif" letter-spacing="2.8">${category}</text>

    <text x="118" y="280" fill="white" font-size="74" font-weight="700" font-family="Arial, Helvetica, sans-serif">
      ${title}
    </text>

    <text x="118" y="616" fill="${palette.textMuted}" font-size="28" font-family="Arial, Helvetica, sans-serif">
      <tspan x="118">${subtitle}</tspan>
    </text>

    <g transform="translate(1220 660)">
      <rect width="220" height="92" rx="22" fill="rgba(9,18,30,0.82)" stroke="rgba(86,213,255,0.18)"/>
      <text x="30" y="42" fill="${palette.textMuted}" font-size="18" font-family="Arial, Helvetica, sans-serif">SocialBrand1980</text>
      <text x="30" y="72" fill="white" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">Strategic Insight</text>
    </g>

    <text x="118" y="764" fill="rgba(255,255,255,0.36)" font-size="18" font-family="Arial, Helvetica, sans-serif">${slug}</text>
  </svg>`;
}

export async function generateCoverImage(article) {
  const filePath = buildImagePath(article.title);
  const svg = buildSvg(article);

  await sharp(Buffer.from(svg))
    .png({ quality: 96, compressionLevel: 8 })
    .toFile(filePath);

  return {
    filePath,
    fileName: filePath.split("/").pop(),
  };
}
