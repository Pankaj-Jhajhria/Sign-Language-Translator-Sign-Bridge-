/**
 * generate_ppt.js
 * Reads signbridge_deck_spec.js and renders SignBridge_Hackathon_Presentation.pptx
 * using PptxGenJS. Run with: node generate_ppt.js
 */

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const deck = require("./signbridge_deck_spec.js");

// ---------------------------------------------------------------------------
// Slide geometry
// ---------------------------------------------------------------------------

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

function px(v) { return (v / 100) * SLIDE_W; }
function py(v) { return (v / 100) * SLIDE_H; }
function pw(v) { return (v / 100) * SLIDE_W; }
function ph(v) { return (v / 100) * SLIDE_H; }
function rect(el) {
  return { x: px(el.x), y: py(el.y), w: pw(el.w), h: ph(el.h) };
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

const THEME = deck.theme;
const C = THEME.colors;

function hex(c) {
  if (!c) return C.text.replace("#", "");
  if (C[c]) return C[c].replace("#", "");
  if (typeof c === "string" && c.startsWith("#")) return c.replace("#", "");
  return C.text.replace("#", "");
}

const FONT_DISPLAY = THEME.fonts.display;
const FONT_BODY = THEME.fonts.body;
const FONT_MONO = THEME.fonts.mono;

// Small glyph set standing in for the "lucide, line, rounded" icon set
// referenced in the spec, so nodes/badges carry a visual mark even though
// no external icon library is loaded.
const ICONS = {
  hand: "\u270B",
  cpu: "\u25A6",
  type: "Tt",
  "text-cursor": "|T",
  "message-square": "\u{1F4AC}",
  "volume-2": "\u{1F50A}",
  camera: "\u{1F4F7}",
  "scan-face": "\u25C9",
  network: "\u2B22",
  ruler: "\u25AC",
  trees: "\u25B2",
  activity: "\u223F",
  globe: "\u25CE",
  cable: "\u2547",
  server: "\u25A4",
  sparkles: "\u2726",
  house: "\u2302",
  zap: "\u26A1",
  "shield-check": "\u2713",
  history: "\u21BA",
  lock: "\u{1F512}",
  unlock: "\u{1F513}",
  laptop: "\u25AD",
  smartphone: "\u25AF",
  "smartphone-charging": "\u25AF+",
  infinity: "\u221E",
  "case-upper": "AB",
  "message-square-text": "\u{1F4AC}",
  "audio-lines": "\u2248",
  "alert-triangle": "\u26A0",
};
function glyph(name) {
  return ICONS[name] || "\u25CF";
}

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

function addBackground(slide) {
  slide.background = { color: hex("bg") };
  // Soft gradient-mesh blobs standing in for theme.background.blobs
  const blobs = [
    { x: -2, y: -2, w: 7, h: 7, color: THEME.gradients.brand[0] },
    { x: SLIDE_W - 5, y: -3, w: 8, h: 8, color: THEME.gradients.brand[1] },
    { x: SLIDE_W - 4, y: SLIDE_H - 4, w: 7, h: 7, color: THEME.gradients.brand[2] },
  ];
  blobs.forEach((b) => {
    slide.addShape("ellipse", {
      x: b.x, y: b.y, w: b.w, h: b.h,
      fill: { color: b.color.replace("#", ""), transparency: 82 },
      line: { type: "none" },
    });
  });
}

function addTitle(slide, el) {
  const r = rect(el);
  const isGradient = (el.style || "").includes("gradient-text");
  slide.addText(el.text || "", {
    x: r.x, y: r.y, w: r.w, h: r.h,
    fontFace: FONT_DISPLAY,
    fontSize: el.size || THEME.type.title,
    bold: true,
    color: isGradient ? hex("blue") : hex("text"),
    align: el.align || "left",
    valign: "top",
    charSpacing: isGradient ? 1 : 0,
  });
}

function addSubtitle(slide, el) {
  const r = rect(el);
  slide.addText(el.text || "", {
    x: r.x, y: r.y, w: r.w, h: r.h,
    fontFace: FONT_BODY,
    fontSize: el.size || THEME.type.subtitle,
    color: hex(el.color || "muted"),
    align: el.align || "left",
    valign: "top",
  });
}

function addPanel(slide, opts) {
  // opts: {x,y,w,h,accent}
  slide.addShape("roundRect", {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    rectRadius: THEME.cornerRadius / 100,
    fill: { color: hex("panel") },
    line: { color: hex(opts.accent || "panelBorder"), width: 1.25 },
    shadow: opts.glow
      ? { type: "outer", color: hex(opts.accent || "blue"), opacity: 0.45, blur: 18, offset: 0, angle: 0 }
      : undefined,
  });
}

function addMetricCard(slide, el) {
  const r = rect(el);
  addPanel(slide, { ...r, accent: el.color, glow: el.emphasis ? true : false });
  slide.addText(el.value, {
    x: r.x, y: r.y + r.h * 0.12, w: r.w, h: r.h * 0.55,
    fontFace: FONT_DISPLAY, fontSize: Math.min(el.size || THEME.type.metric, 64),
    bold: true, color: hex(el.color), align: "center", valign: "middle",
  });
  if (el.caption) {
    slide.addText(el.caption, {
      x: r.x + r.w * 0.08, y: r.y + r.h * 0.72, w: r.w * 0.84, h: r.h * 0.22,
      fontFace: FONT_BODY, fontSize: 14, color: hex("muted"), align: "center", valign: "top",
    });
  }
}

function addFlowNode(slide, cx, cy, size, node) {
  // cx, cy = center in inches, size = diameter in inches
  slide.addShape("ellipse", {
    x: cx - size / 2, y: cy - size / 2, w: size, h: size,
    fill: { color: hex(node.color || "blue") },
    line: { type: "none" },
    shadow: { type: "outer", color: hex(node.color || "blue"), opacity: 0.5, blur: 14, offset: 0, angle: 0 },
  });
  slide.addText(glyph(node.icon), {
    x: cx - size / 2, y: cy - size / 2, w: size, h: size,
    fontFace: FONT_MONO, fontSize: 18, color: hex("bg"), align: "center", valign: "middle", bold: true,
  });
  slide.addText(node.label, {
    x: cx - size, y: cy + size / 2 + 0.05, w: size * 2, h: 0.32,
    fontFace: FONT_BODY, fontSize: 12, bold: true, color: hex("text"), align: "center", valign: "top",
    charSpacing: 1,
  });
}

function addArrow(slide, x1, y1, x2, y2, color) {
  slide.addShape("line", {
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01,
    flipV: y2 < y1, flipH: x2 < x1,
    line: { color: hex(color || "muted"), width: 2, endArrowType: "triangle" },
  });
}

function addChip(slide, text, x, y, w, h, color) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: h / 2,
    fill: { color: hex("panel") },
    line: { color: hex(color || "panelBorder"), width: 1 },
  });
  slide.addText(text, {
    x, y, w, h, fontFace: FONT_BODY, fontSize: 13, bold: true,
    color: hex(color || "text"), align: "center", valign: "middle",
  });
}

function addSymbolTile(slide, x, y, size, label, assetDir) {
  const imgPath = path.join(assetDir, `${label}.png`);
  addPanel(slide, { x, y, w: size, h: size, accent: "panelBorder" });
  const pad = size * 0.14;
  if (fs.existsSync(imgPath)) {
    try {
      slide.addImage({ path: imgPath, x: x + pad, y: y + pad, w: size - pad * 2, h: size - pad * 2 - size * 0.2 });
    } catch (e) {
      // fall through to placeholder glyph below
    }
  } else {
    slide.addText(label, {
      x: x + pad, y: y + pad, w: size - pad * 2, h: size - pad * 2 - size * 0.2,
      fontFace: FONT_MONO, fontSize: size * 22, color: hex("muted"), align: "center", valign: "middle",
    });
  }
  slide.addText(label, {
    x, y: y + size - size * 0.22, w: size, h: size * 0.2,
    fontFace: FONT_BODY, fontSize: 11, bold: true, color: hex("teal"), align: "center", valign: "middle",
  });
}

function addImageIfExists(slide, filePath, opts, placeholderLabel) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      slide.addImage({ path: filePath, ...opts });
      return true;
    } catch (e) {
      // fall through to placeholder
    }
  }
  addPanel(slide, { ...opts, accent: "purple", glow: true });
  slide.addText(placeholderLabel || "Image unavailable", {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    fontFace: FONT_BODY, fontSize: 16, color: hex("muted"), align: "center", valign: "middle",
  });
  return false;
}

// ---------------------------------------------------------------------------
// Asset locations (relative to project root)
// ---------------------------------------------------------------------------

const ASSET_DIR = path.join(__dirname, "assets");
const SYMBOL_DIR = path.join(__dirname, "symbols");

// ---------------------------------------------------------------------------
// Shared element handling used across layouts
// ---------------------------------------------------------------------------

function byType(elements, type) {
  return elements.filter((e) => e.type === type);
}
function findEl(elements, type) {
  return elements.find((e) => e.type === type);
}

function renderTitleBlock(slide, slide_el) {
  const title = findEl(slide_el.elements, "title");
  if (title) addTitle(slide, title);
  const subtitle = findEl(slide_el.elements, "subtitle");
  if (subtitle) addSubtitle(slide, subtitle);
}

// ---------------------------------------------------------------------------
// Layout renderers — one dedicated function per layout type
// ---------------------------------------------------------------------------

function renderHero(slide, s) {
  const els = s.elements;
  findEl(els, "decor") && renderDecor(slide, findEl(els, "decor"));
  const title = findEl(els, "title");
  if (title) addTitle(slide, title);
  const subtitle = findEl(els, "subtitle");
  if (subtitle) addSubtitle(slide, subtitle);
  const tagline = findEl(els, "tagline");
  if (tagline) {
    const r = rect(tagline);
    slide.addText(tagline.text, {
      x: r.x, y: r.y, w: r.w, h: r.h,
      fontFace: FONT_BODY, fontSize: tagline.size || 20,
      color: hex(tagline.color || "teal"), bold: true,
      align: tagline.align || "left", valign: "top",
    });
  }
  const flow = findEl(els, "flow");
  if (flow) {
    const r = rect(flow);
    const n = flow.nodes.length;
    const nodeSize = 0.95;
    if (flow.direction === "horizontal") {
      const gap = r.w / n;
      flow.nodes.forEach((node, i) => {
        const cx = r.x + gap * i + gap / 2;
        const cy = r.y + r.h / 2;
        if (i > 0) addArrow(slide, r.x + gap * (i - 1) + gap / 2 + nodeSize / 2, cy, cx - nodeSize / 2, cy, node.color);
        addFlowNode(slide, cx, cy, nodeSize, node);
      });
    } else {
      // vertical-zigzag
      const gap = r.h / n;
      flow.nodes.forEach((node, i) => {
        const cx = r.x + r.w / 2 + (i % 2 === 0 ? -0.6 : 0.6);
        const cy = r.y + gap * i + gap / 2;
        if (i > 0) {
          const prevCx = r.x + r.w / 2 + ((i - 1) % 2 === 0 ? -0.6 : 0.6);
          const prevCy = r.y + gap * (i - 1) + gap / 2;
          addArrow(slide, prevCx, prevCy + nodeSize / 2, cx, cy - nodeSize / 2, node.color);
        }
        addFlowNode(slide, cx, cy, nodeSize, node);
      });
    }
  }
}

function renderDecor(slide, decor) {
  const r = rect(decor);
  slide.addShape("ellipse", {
    x: r.x, y: r.y, w: r.w, h: r.h,
    fill: { color: hex("purple"), transparency: Math.round((1 - (decor.opacity || 0.3)) * 100) },
    line: { type: "none" },
  });
}

function renderSplit(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;

  // Variant A: two illustrations + connector + chips (e.g. "problem")
  const illustrations = byType(els, "illustration");
  if (illustrations.length && byType(els, "panel").length === 0) {
    illustrations.forEach((ill) => {
      const r = rect(ill);
      addPanel(slide, { ...r, accent: ill.color, glow: true });
      slide.addText(ill.kind, {
        x: r.x + 0.2, y: r.y, w: r.w - 0.4, h: r.h,
        fontFace: FONT_BODY, fontSize: 14, italic: true,
        color: hex(ill.color), align: "center", valign: "middle",
      });
    });
    const connector = findEl(els, "connector");
    if (connector) {
      const r = rect(connector);
      addArrow(slide, r.x, r.y + r.h / 2, r.x + r.w, r.y + r.h / 2, connector.color);
    }
    const chips = findEl(els, "chips");
    if (chips) {
      const r = rect(chips);
      const n = chips.items.length;
      const chipW = r.w / n - 0.15;
      chips.items.forEach((item, i) => {
        addChip(slide, item, r.x + i * (chipW + 0.15), r.y, chipW, r.h, "teal");
      });
    }
  }

  // Variant B: side-by-side stat panels (e.g. "one-vs-two-hand")
  const panels = byType(els, "panel");
  if (panels.length) {
    panels.forEach((panel) => {
      const r = rect(panel);
      addPanel(slide, { ...r, accent: panel.accent, glow: true });
      let cursorY = r.y + 0.3;
      (panel.children || []).forEach((child) => {
        if (child.type === "illustration") {
          slide.addText("\u270B", {
            x: r.x, y: cursorY, w: r.w, h: 1.0,
            fontFace: FONT_MONO, fontSize: 40, color: hex("muted"), align: "center", valign: "middle",
          });
          cursorY += 1.05;
        } else if (child.type === "label") {
          slide.addText(child.text, {
            x: r.x, y: cursorY, w: r.w, h: 0.45,
            fontFace: FONT_DISPLAY, fontSize: child.size || 20, bold: true,
            color: hex(child.color), align: "center", valign: "middle",
          });
          cursorY += 0.5;
        } else if (child.type === "metric") {
          slide.addText([
            { text: child.value, options: { fontSize: Math.min(child.size || 60, 54), bold: true, color: hex(child.color || panel.accent) } },
            { text: "  " + child.unit, options: { fontSize: 16, color: hex("muted") } },
          ], {
            x: r.x, y: cursorY, w: r.w, h: 0.85,
            fontFace: FONT_DISPLAY, align: "center", valign: "middle",
          });
          cursorY += 0.95;
        }
      });
    });
  }
}

function renderPipeline(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;

  const pipeline = findEl(els, "pipeline");
  if (pipeline) {
    const r = rect(pipeline);
    const n = pipeline.nodes.length;
    const gap = r.w / n;
    const nodeSize = 1.05;
    const cy = r.y + r.h * 0.35;
    // gradient flow line
    slide.addShape("line", {
      x: r.x, y: cy, w: r.w, h: 0,
      line: { color: hex("purple"), width: 3, dashType: "solid" },
    });
    pipeline.nodes.forEach((node, i) => {
      const cx = r.x + gap * i + gap / 2;
      addFlowNode(slide, cx, cy, nodeSize, node);
      if (i < n - 1) addArrow(slide, cx + nodeSize / 2, cy, cx + gap - nodeSize / 2, cy, node.color);
    });
  }

  // Letter-tile row merging into a word (Sentence Building)
  const tileRow = findEl(els, "tile-row");
  if (tileRow) {
    const r = rect(tileRow);
    const n = tileRow.items.length;
    const tileW = r.w / n - 0.15;
    tileRow.items.forEach((ch, i) => {
      const tx = r.x + i * (tileW + 0.15);
      addPanel(slide, { x: tx, y: r.y, w: tileW, h: r.h, accent: tileRow.color, glow: false });
      slide.addText(ch, {
        x: tx, y: r.y, w: tileW, h: r.h,
        fontFace: FONT_DISPLAY, fontSize: Math.min(tileRow.size || 48, 40), bold: true,
        color: hex(tileRow.color), align: "center", valign: "middle",
      });
    });
  }
  const arrow = findEl(els, "arrow");
  if (arrow) {
    const r = rect(arrow);
    addArrow(slide, r.x + r.w / 2, r.y, r.x + r.w / 2, r.y + r.h, arrow.color);
  }
  const wordBlock = findEl(els, "word-block");
  if (wordBlock) {
    const r = rect(wordBlock);
    slide.addText(wordBlock.text, {
      x: r.x, y: r.y, w: r.w, h: r.h,
      fontFace: FONT_DISPLAY, fontSize: Math.min(wordBlock.size || 64, 48), bold: true,
      color: hex("blue"), align: "center", valign: "middle",
    });
  }
  const flow = findEl(els, "flow");
  if (flow) {
    const r = rect(flow);
    const n = flow.nodes.length;
    const gap = r.w / n;
    const cy = r.y + r.h / 2;
    flow.nodes.forEach((node, i) => {
      const cx = r.x + gap * i + gap / 2;
      addFlowNode(slide, cx, cy, 0.9, node);
      if (i < n - 1) addArrow(slide, cx + 0.45, cy, cx + gap - 0.45, cy, node.color);
    });
  }
  const decor = findEl(els, "decor");
  if (decor && decor.kind && decor.kind.includes("waveform")) {
    const r = rect(decor);
    const bars = 24;
    const barW = r.w / bars - 0.03;
    for (let i = 0; i < bars; i++) {
      const barH = r.h * (0.25 + 0.75 * Math.abs(Math.sin(i * 0.7)));
      slide.addShape("roundRect", {
        x: r.x + i * (barW + 0.03), y: r.y + (r.h - barH) / 2, w: barW, h: barH,
        rectRadius: barW / 2,
        fill: { color: i % 3 === 0 ? hex("teal") : i % 3 === 1 ? hex("purple") : hex("blue") },
        line: { type: "none" },
      });
    }
  }

  // Real-time stability frame strip → funnel → result badge
  const frameStrip = findEl(els, "frame-strip");
  if (frameStrip) {
    const r = rect(frameStrip);
    const n = frameStrip.frames.length;
    const fW = r.w / n - 0.1;
    frameStrip.frames.forEach((f, i) => {
      const fx = r.x + i * (fW + 0.1);
      const isHi = i === frameStrip.highlightIndex;
      addPanel(slide, { x: fx, y: r.y, w: fW, h: r.h, accent: isHi ? frameStrip.highlightColor : "panelBorder", glow: isHi });
      slide.addText(f, {
        x: fx, y: r.y, w: fW, h: r.h,
        fontFace: FONT_MONO, fontSize: 22, bold: true,
        color: hex(isHi ? frameStrip.highlightColor : "text"), align: "center", valign: "middle",
      });
    });
  }
  const funnel = findEl(els, "funnel");
  if (funnel) {
    const r = rect(funnel);
    slide.addShape("trapezoid", {
      x: r.x, y: r.y, w: r.w, h: r.h,
      fill: { color: hex(funnel.color) },
      line: { type: "none" },
    });
    slide.addText(funnel.label, {
      x: r.x - 0.4, y: r.y + r.h + 0.05, w: r.w + 0.8, h: 0.4,
      fontFace: FONT_BODY, fontSize: 11, color: hex("muted"), align: "center", valign: "top",
    });
  }
  const resultBadge = findEl(els, "result-badge");
  if (resultBadge) {
    const r = rect(resultBadge);
    addPanel(slide, { ...r, accent: resultBadge.color, glow: true });
    slide.addText(resultBadge.text, {
      x: r.x, y: r.y, w: r.w, h: r.h,
      fontFace: FONT_DISPLAY, fontSize: Math.min(resultBadge.size || 64, 48), bold: true,
      color: hex(resultBadge.color), align: "center", valign: "middle",
    });
  }
  byType(els, "card").forEach((card) => {
    const r = rect(card);
    addPanel(slide, { ...r, accent: card.color, glow: false });
    slide.addText(glyph(card.icon), {
      x: r.x, y: r.y + 0.15, w: r.w, h: r.h * 0.4,
      fontFace: FONT_MONO, fontSize: 22, color: hex(card.color), align: "center", valign: "middle",
    });
    slide.addText(card.label, {
      x: r.x + 0.1, y: r.y + r.h * 0.55, w: r.w - 0.2, h: r.h * 0.4,
      fontFace: FONT_BODY, fontSize: 14, bold: true, color: hex("text"), align: "center", valign: "top",
    });
  });
}

function renderUiMockup(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;
  const frame = findEl(els, "browser-frame");
  if (frame) {
    const r = rect(frame);
    // browser chrome bar
    slide.addShape("roundRect", {
      x: r.x, y: r.y, w: r.w, h: r.h, rectRadius: 0.08,
      fill: { color: hex("panel") },
      line: { color: hex("purple"), width: 1.5 },
      shadow: { type: "outer", color: hex("purple"), opacity: 0.4, blur: 20, offset: 0, angle: 0 },
    });
    slide.addShape("roundRect", {
      x: r.x, y: r.y, w: r.w, h: 0.35, rectRadius: 0.08,
      fill: { color: hex("bgAlt") }, line: { type: "none" },
    });
    ["#EF4444", "#F59E0B", "#22C55E"].forEach((c, i) => {
      slide.addShape("ellipse", {
        x: r.x + 0.18 + i * 0.25, y: r.y + 0.11, w: 0.13, h: 0.13,
        fill: { color: c.replace("#", "") }, line: { type: "none" },
      });
    });
    addImageIfExists(
      slide,
      path.join(ASSET_DIR, "signbridge_ui.png"),
      { x: r.x + 0.15, y: r.y + 0.5, w: r.w - 0.3, h: r.h - 0.65 },
      "SignBridge Live UI"
    );
  }
  byType(els, "callout").forEach((c) => {
    const r = rect(c);
    addChip(slide, c.text, r.x, r.y, r.w, r.h, c.color);
  });
}

function renderArchitecture(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;

  // Two-row node graph (Core Architecture)
  const nodes = byType(els, "node");
  if (nodes.length) {
    const nodeSize = 1.4;
    nodes.forEach((n) => {
      const r = rect(n);
      addPanel(slide, { ...r, accent: n.color, glow: true });
      slide.addText(glyph(n.icon), {
        x: r.x, y: r.y + 0.1, w: r.w, h: r.h * 0.45,
        fontFace: FONT_MONO, fontSize: 22, color: hex(n.color), align: "center", valign: "middle",
      });
      slide.addText(n.label, {
        x: r.x + 0.1, y: r.y + r.h * 0.5, w: r.w - 0.2, h: r.h * 0.45,
        fontFace: FONT_BODY, fontSize: 13, bold: true, color: hex("text"), align: "center", valign: "top",
      });
    });
    // row-by-row arrows
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = rect(nodes[i]);
      const b = rect(nodes[i + 1]);
      if (Math.abs(a.y - b.y) < 0.05) {
        addArrow(slide, a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2, "muted");
      }
    }
    // elbow connector from end of row 1 down to start of row 2
    if (nodes.length >= 8) {
      const topEnd = rect(nodes[3]);
      const bottomStart = rect(nodes[4]);
      addArrow(slide, topEnd.x + topEnd.w / 2, topEnd.y + topEnd.h, topEnd.x + topEnd.w / 2, bottomStart.y + bottomStart.h / 2, "muted");
      addArrow(slide, topEnd.x + topEnd.w / 2, bottomStart.y + bottomStart.h / 2, bottomStart.x, bottomStart.y + bottomStart.h / 2, "muted");
    }
  }

  // Vertical stack + badges (Local Web Architecture)
  const stack = findEl(els, "vertical-stack");
  if (stack) {
    const r = rect(stack);
    const n = stack.nodes.length;
    const nodeH = r.h / n - 0.15;
    stack.nodes.forEach((node, i) => {
      const ny = r.y + i * (nodeH + 0.15);
      addPanel(slide, { x: r.x, y: ny, w: r.w, h: nodeH, accent: node.color, glow: false });
      slide.addText(glyph(node.icon), {
        x: r.x + 0.15, y: ny, w: nodeH * 0.9, h: nodeH,
        fontFace: FONT_MONO, fontSize: 18, color: hex(node.color), align: "center", valign: "middle",
      });
      slide.addText(node.label, {
        x: r.x + nodeH, y: ny, w: r.w - nodeH - 0.2, h: nodeH,
        fontFace: FONT_BODY, fontSize: 15, bold: true, color: hex("text"), align: "left", valign: "middle",
      });
      if (i < n - 1) addArrow(slide, r.x + r.w / 2, ny + nodeH, r.x + r.w / 2, ny + nodeH + 0.15, "muted");
    });
  }
  byType(els, "badge").forEach((b) => {
    const r = rect(b);
    addPanel(slide, { ...r, accent: b.color, glow: true });
    slide.addText(glyph(b.icon), {
      x: r.x + 0.15, y: r.y, w: r.h * 0.8, h: r.h,
      fontFace: FONT_MONO, fontSize: 20, color: hex(b.color), align: "center", valign: "middle",
    });
    slide.addText(b.text, {
      x: r.x + r.h * 0.9, y: r.y, w: r.w - r.h * 0.9 - 0.15, h: r.h,
      fontFace: FONT_BODY, fontSize: 16, bold: true, color: hex("text"), align: "left", valign: "middle",
    });
  });
}

function renderComparison(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;
  const variantRow = findEl(els, "variant-row");
  if (variantRow) {
    const r = rect(variantRow);
    const cols = 3, rows = 2;
    const cellW = r.w / cols - 0.15;
    const cellH = r.h / rows - 0.15;
    variantRow.items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = r.x + col * (cellW + 0.15);
      const cy = r.y + row * (cellH + 0.15);
      addPanel(slide, { x: cx, y: cy, w: cellW, h: cellH, accent: "panelBorder" });
      const rotate = item.rotate || (item.flip ? 180 : 0);
      slide.addText(glyph(item.icon), {
        x: cx, y: cy, w: cellW, h: cellH * 0.65,
        fontFace: FONT_MONO, fontSize: 26 * (item.scale || 1),
        color: hex("blue"), align: "center", valign: "middle", rotate,
      });
      slide.addText(item.label, {
        x: cx, y: cy + cellH * 0.65, w: cellW, h: cellH * 0.35,
        fontFace: FONT_BODY, fontSize: 13, bold: true, color: hex("muted"), align: "center", valign: "top",
      });
    });
  }
  const arrow = findEl(els, "arrow");
  if (arrow) {
    const r = rect(arrow);
    addArrow(slide, r.x, r.y + r.h / 2, r.x + r.w, r.y + r.h / 2, arrow.color);
  }
  const heroVisual = findEl(els, "hero-visual");
  if (heroVisual) {
    const r = rect(heroVisual);
    addPanel(slide, { ...r, accent: heroVisual.color, glow: true });
    slide.addText(glyph("hand"), {
      x: r.x, y: r.y, w: r.w, h: r.h * 0.75,
      fontFace: FONT_MONO, fontSize: 60, color: hex(heroVisual.color), align: "center", valign: "middle",
    });
    slide.addText("Structural Signature", {
      x: r.x + 0.1, y: r.y + r.h * 0.78, w: r.w - 0.2, h: r.h * 0.2,
      fontFace: FONT_BODY, fontSize: 13, bold: true, color: hex("text"), align: "center", valign: "top",
    });
  }
}

function renderGrid(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;

  // Data-challenge montage + cleanup pipeline
  const montage = findEl(els, "montage");
  if (montage) {
    const r = rect(montage);
    const n = montage.items.length;
    const cardW = r.w / n - 0.15;
    montage.items.forEach((item, i) => {
      const cx = r.x + i * (cardW + 0.15);
      const rotate = (i % 2 === 0 ? -4 : 4);
      addPanel(slide, { x: cx, y: r.y, w: cardW, h: r.h, accent: "warn" });
      slide.addText(item.label, {
        x: cx + 0.08, y: r.y + r.h * 0.35, w: cardW - 0.16, h: r.h * 0.5,
        fontFace: FONT_BODY, fontSize: 12, bold: true, color: hex("text"), align: "center", valign: "middle",
        rotate,
      });
    });
  }
  const gridPipeline = findEl(els, "pipeline");
  if (gridPipeline) {
    const r = rect(gridPipeline);
    const n = gridPipeline.nodes.length;
    const nodeW = r.w / n - 0.2;
    gridPipeline.nodes.forEach((node, i) => {
      const nx = r.x + i * (nodeW + 0.2);
      addChip(slide, node.label, nx, r.y + r.h * 0.3, nodeW, r.h * 0.4, node.color);
      if (i < n - 1) addArrow(slide, nx + nodeW, r.y + r.h * 0.5, nx + nodeW + 0.2, r.y + r.h * 0.5, node.color);
    });
  }

  // Sign guide: real symbol tiles
  byType(els, "row-label").forEach((rl) => {
    const r = rect(rl);
    slide.addText(rl.text, {
      x: r.x, y: r.y, w: r.w, h: r.h,
      fontFace: FONT_DISPLAY, fontSize: rl.size || 20, bold: true,
      color: hex(rl.color), align: "left", valign: "middle",
    });
  });
  byType(els, "tile-grid").forEach((tg) => {
    const r = rect(tg);
    const chars = tg.items === "0-9"
      ? "0123456789".split("")
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const cols = tg.cols;
    const rows = tg.rows;
    const gap = 0.08;
    const tileSize = Math.min((r.w - gap * (cols - 1)) / cols, (r.h - gap * (rows - 1)) / rows);
    chars.forEach((ch, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = r.x + col * (tileSize + gap);
      const ty = r.y + row * (tileSize + gap);
      addSymbolTile(slide, tx, ty, tileSize, ch, SYMBOL_DIR);
    });
  });
}

function renderMetric(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;
  byType(els, "metric-card").forEach((mc) => addMetricCard(slide, mc));
  const note = findEl(els, "note");
  if (note) {
    const r = rect(note);
    slide.addText(`${glyph(note.icon)}  ${note.text}`, {
      x: r.x, y: r.y, w: r.w, h: r.h,
      fontFace: FONT_BODY, fontSize: note.size || 16, bold: true,
      color: hex(note.color), align: note.align || "center", valign: "middle",
    });
  }
}

function renderRoadmap(slide, s) {
  renderTitleBlock(slide, s);
  const els = s.elements;

  // Ladder (Current Scope)
  const ladder = findEl(els, "ladder");
  if (ladder) {
    const r = rect(ladder);
    const n = ladder.steps.length;
    const stepH = r.h / n - 0.12;
    const steps = ladder.direction === "bottom-to-top" ? [...ladder.steps].reverse() : ladder.steps;
    steps.forEach((step, i) => {
      const rowFromTop = i;
      const sy = r.y + rowFromTop * (stepH + 0.12);
      const indent = (n - 1 - i) * (r.w * 0.045);
      const sw = r.w - indent;
      const filled = step.fill === "solid";
      slide.addShape("roundRect", {
        x: r.x + indent / 2, y: sy, w: sw, h: stepH, rectRadius: 0.12,
        fill: filled ? { color: hex(step.color) } : { color: hex("panel") },
        line: { color: hex(step.color), width: 1.5 },
      });
      slide.addText(`${step.mark ? step.mark + "  " : ""}${step.label}`, {
        x: r.x + indent / 2 + 0.2, y: sy, w: sw - 0.4, h: stepH,
        fontFace: FONT_BODY, fontSize: 16, bold: true,
        color: filled ? hex("bg") : hex(step.color), align: "left", valign: "middle",
      });
    });
  }

  // Path with milestones (What's Next)
  const pathEl = findEl(els, "path");
  if (pathEl) {
    const r = rect(pathEl);
    const n = pathEl.milestones.length;
    const gap = r.w / n;
    const baseY = r.y + r.h * 0.7;
    const topY = r.y;
    slide.addShape("line", {
      x: r.x, y: baseY, w: r.w, h: -(baseY - topY),
      line: { color: hex("purple"), width: 3 },
      flipV: true,
    });
    pathEl.milestones.forEach((m, i) => {
      const cx = r.x + gap * i + gap / 2;
      const t = i / (n - 1);
      const cy = baseY - t * (baseY - topY) * 0.85;
      addFlowNode(slide, cx, cy, m.emphasis ? 1.1 : 0.85, {
        icon: m.icon, label: m.label, color: m.emphasis ? "teal" : (m.status === "now" ? "blue" : "purple"),
      });
    });
  }
}

// ---------------------------------------------------------------------------
// Layout dispatch table
// ---------------------------------------------------------------------------

const LAYOUT_RENDERERS = {
  hero: renderHero,
  split: renderSplit,
  pipeline: renderPipeline,
  "ui-mockup": renderUiMockup,
  architecture: renderArchitecture,
  comparison: renderComparison,
  grid: renderGrid,
  metric: renderMetric,
  roadmap: renderRoadmap,
};

// ---------------------------------------------------------------------------
// Build the deck
// ---------------------------------------------------------------------------

function build() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "SIGNBRIDGE", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "SIGNBRIDGE";
  pptx.author = "SignBridge";
  pptx.title = deck.meta.project;

  deck.slides.forEach((s) => {
    const slide = pptx.addSlide();
    try {
      addBackground(slide);
      const renderer = LAYOUT_RENDERERS[s.layout];
      if (renderer) {
        renderer(slide, s);
      } else {
        renderTitleBlock(slide, s);
      }
      // Slide number
      slide.addText(String(s.number).padStart(2, "0"), {
        x: SLIDE_W - 0.7, y: SLIDE_H - 0.45, w: 0.5, h: 0.3,
        fontFace: FONT_MONO, fontSize: 10, color: hex("muted"), align: "right", valign: "middle",
      });
    } catch (err) {
      console.error(`Error rendering slide ${s.number} (${s.id}):`, err.message);
    }
  });

  const outFile = path.join(__dirname, "SignBridge_Hackathon_Presentation.pptx");
  pptx
    .writeFile({ fileName: outFile })
    .then(() => console.log(`Written: ${outFile}`))
    .catch((err) => console.error("Failed to write pptx:", err));
}

build();
