// SIGNBRIDGE — hackathon deck specification (machine-readable)
// Coordinates: x, y, w, h are % of a 16:9 slide (0–100). Origin = top-left.
// Font sizes are pt on a 13.33in x 7.5in slide.
// "labels" = the 2–5 short text labels per slide. "elements" = visual parts.

const deck = {
  meta: {
    project: "SIGNBRIDGE",
    tagline: "See. Understand. Speak.",
    aspect: "16:9",
    slideCount: 17,
    honestyRule:
      "Never present 99% offline validation as real-world accuracy. Practical webcam performance is ~70–80%.",
  },

  theme: {
    style: "premium AI startup / modern hackathon / dark",
    colors: {
      bg: "#070B1A",
      bgAlt: "#0B1024",
      panel: "#0F1733",
      panelBorder: "#26305C",
      blue: "#3B82F6",
      purple: "#8B5CF6",
      teal: "#14B8A6",
      text: "#F8FAFC",
      muted: "#94A3B8",
      warn: "#F59E0B",
      ok: "#22C55E",
    },
    gradients: {
      brand: ["#3B82F6", "#8B5CF6", "#14B8A6"],
      glow: ["#8B5CF6", "#070B1A"],
    },
    fonts: { display: "Space Grotesk", body: "Inter", mono: "JetBrains Mono" },
    type: { hero: 88, title: 40, subtitle: 20, metric: 96, label: 16, caption: 12 },
    margins: { x: 6, y: 6 },
    cornerRadius: 16,
    background: { type: "gradient-mesh", base: "#070B1A", blobs: ["#3B82F6", "#8B5CF6", "#14B8A6"], blobOpacity: 0.18 },
    icons: { style: "line, 2px stroke, rounded", set: "lucide" },
  },

  slides: [
    // 1
    {
      number: 1,
      id: "hero",
      title: "SIGNBRIDGE",
      subtitle: "Real-Time Indian Sign Language Translator",
      layout: "hero",
      visual: "hand → AI → text → speech",
      hierarchy: ["title", "flow", "subtitle", "tagline"],
      labels: ["See.", "Understand.", "Speak."],
      elements: [
        { type: "title", text: "SIGNBRIDGE", x: 6, y: 20, w: 60, h: 20, size: 88, style: "gradient-text brand" },
        { type: "subtitle", text: "Real-Time Indian Sign Language Translator", x: 6, y: 42, w: 60, h: 8, size: 24, color: "muted" },
        { type: "tagline", text: "See. Understand. Speak.", x: 6, y: 78, w: 50, h: 6, size: 20, color: "teal" },
        { type: "flow", x: 55, y: 25, w: 40, h: 50, direction: "vertical-zigzag",
          nodes: [
            { icon: "hand", label: "HAND", color: "blue" },
            { icon: "cpu", label: "AI", color: "purple" },
            { icon: "type", label: "TEXT", color: "teal" },
            { icon: "volume-2", label: "SPEECH", color: "blue" },
          ] },
        { type: "decor", kind: "glowing hand wireframe with 21 landmark dots", x: 50, y: 10, w: 45, h: 80, opacity: 0.35 },
      ],
    },

    // 2
    {
      number: 2,
      id: "problem",
      title: "Communication Shouldn't Need a Translator",
      subtitle: "Signers and non-signers talk past each other.",
      layout: "split",
      visual: "signer ↔ person who cannot understand",
      hierarchy: ["title", "two-figure illustration", "keywords"],
      labels: ["Communication Gap", "Accessibility", "Understanding"],
      elements: [
        { type: "title", x: 6, y: 8, w: 88, h: 14, size: 40 },
        { type: "illustration", kind: "signer silhouette with glowing hands", x: 8, y: 28, w: 30, h: 50, side: "left", color: "blue" },
        { type: "illustration", kind: "listener silhouette with '?' bubble", x: 62, y: 28, w: 30, h: 50, side: "right", color: "purple" },
        { type: "connector", kind: "broken double-arrow with gap spark", x: 38, y: 48, w: 24, h: 10, color: "warn" },
        { type: "chips", items: ["Communication Gap", "Accessibility", "Understanding"], x: 15, y: 84, w: 70, h: 7, size: 16 },
      ],
    },

    // 3
    {
      number: 3,
      id: "solution",
      title: "From Signs to Speech",
      subtitle: "One live pipeline, no human interpreter.",
      layout: "pipeline",
      visual: "SIGN → CHARACTER → WORD → SENTENCE → VOICE",
      hierarchy: ["title", "pipeline"],
      labels: ["SIGN", "CHARACTER", "WORD", "SENTENCE", "VOICE"],
      elements: [
        { type: "title", x: 6, y: 8, w: 88, h: 12, size: 40 },
        { type: "pipeline", x: 5, y: 32, w: 90, h: 36, direction: "horizontal", gradientFlow: "blue→purple→teal",
          nodes: [
            { icon: "hand", label: "SIGN", w: 15 },
            { icon: "case-upper", label: "CHARACTER", w: 15 },
            { icon: "text-cursor", label: "WORD", w: 15 },
            { icon: "message-square", label: "SENTENCE", w: 15 },
            { icon: "volume-2", label: "VOICE", w: 15 },
          ] },
        { type: "subtitle", x: 6, y: 78, w: 88, h: 6, size: 20, color: "muted" },
      ],
    },

    // 4
    {
      number: 4,
      id: "product",
      title: "The Working Product",
      subtitle: "Live in the browser today.",
      layout: "ui-mockup",
      visual: "actual SignBridge web UI screenshot in a browser frame with callouts",
      hierarchy: ["screenshot", "callouts", "title"],
      labels: ["Camera", "Prediction", "Confidence", "Text", "Sign Guide"],
      elements: [
        { type: "title", x: 6, y: 5, w: 60, h: 10, size: 36 },
        { type: "browser-frame", kind: "screenshot placeholder: SignBridge UI", x: 8, y: 18, w: 84, h: 74, glow: "purple" },
        { type: "callout", text: "Camera", target: "live camera panel", x: 10, y: 22, w: 14, h: 5, color: "blue" },
        { type: "callout", text: "Prediction", target: "predicted character", x: 40, y: 22, w: 16, h: 5, color: "purple" },
        { type: "callout", text: "Confidence", target: "confidence bar", x: 60, y: 22, w: 16, h: 5, color: "teal" },
        { type: "callout", text: "Text", target: "recognized text box", x: 40, y: 82, w: 12, h: 5, color: "blue" },
        { type: "callout", text: "Sign Guide", target: "A–Z / 0–9 panel", x: 78, y: 82, w: 14, h: 5, color: "teal" },
      ],
    },

    // 5
    {
      number: 5,
      id: "core-architecture",
      title: "Core Architecture",
      subtitle: "Eight stages, milliseconds apart.",
      layout: "architecture",
      visual: "two-row node graph with wrap connector",
      hierarchy: ["title", "node graph"],
      labels: ["Webcam", "MediaPipe", "Random Forest", "Smoothing", "TTS"],
      elements: [
        { type: "title", x: 6, y: 8, w: 88, h: 12, size: 40 },
        { type: "node", label: "Webcam", icon: "camera", x: 6, y: 32, w: 19, h: 16, color: "blue" },
        { type: "node", label: "MediaPipe", icon: "scan-face", x: 29, y: 32, w: 19, h: 16, color: "blue" },
        { type: "node", label: "Landmarks", icon: "network", x: 52, y: 32, w: 19, h: 16, color: "purple" },
        { type: "node", label: "Structural Features", icon: "ruler", x: 75, y: 32, w: 19, h: 16, color: "purple" },
        { type: "node", label: "Random Forest", icon: "trees", x: 6, y: 60, w: 19, h: 16, color: "purple" },
        { type: "node", label: "Smoothing", icon: "activity", x: 29, y: 60, w: 19, h: 16, color: "teal" },
        { type: "node", label: "Text", icon: "type", x: 52, y: 60, w: 19, h: 16, color: "teal" },
        { type: "node", label: "TTS", icon: "volume-2", x: 75, y: 60, w: 19, h: 16, color: "teal" },
        { type: "connectors", kind: "arrows left→right in each row; elbow arrow from Structural Features down-left to Random Forest", color: "muted" },
      ],
    },

    // 6
    {
      number: 6,
      id: "key-innovation",
      title: "We Model the Shape — Not the Position",
      subtitle: "Same sign, any size, side or tilt.",
      layout: "comparison",
      visual: "five variants of the same hand sign converging into one structural representation",
      hierarchy: ["title", "variants", "convergence arrow", "structure skeleton"],
      labels: ["Small", "Large", "Left", "Right", "Tilted"],
      elements: [
        { type: "title", x: 6, y: 8, w: 88, h: 12, size: 38 },
        { type: "variant-row", x: 5, y: 28, w: 50, h: 50, layout: "grid 3x2",
          items: [
            { label: "Small", icon: "hand", scale: 0.6 },
            { label: "Large", icon: "hand", scale: 1.3 },
            { label: "Left", icon: "hand", flip: true },
            { label: "Right", icon: "hand" },
            { label: "Tilted", icon: "hand", rotate: 25 },
          ] },
        { type: "arrow", kind: "converging arrows with glow", x: 56, y: 45, w: 10, h: 12, color: "purple" },
        { type: "hero-visual", kind: "single clean hand skeleton with angle arcs and length ticks", x: 68, y: 25, w: 27, h: 55, color: "teal", glow: true },
      ],
    },

    // 7
    {
      number: 7,
      id: "one-vs-two-hand",
      title: "One Hand vs Two Hands",
      subtitle: "Two dedicated models.",
      layout: "split",
      visual: "50/50 split panel with large numbers",
      hierarchy: ["big numbers", "hand illustration", "title"],
      labels: ["ONE HAND", "21 landmarks", "19 features", "TWO HANDS", "42 landmarks", "74 features"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 36 },
        { type: "panel", x: 5, y: 20, w: 43, h: 72, accent: "blue",
          children: [
            { type: "illustration", kind: "single hand skeleton", x: 12, y: 24, w: 30, h: 30 },
            { type: "label", text: "ONE HAND", size: 22, color: "blue" },
            { type: "metric", value: "21", unit: "landmarks", size: 72 },
            { type: "metric", value: "19", unit: "features", size: 72, color: "teal" },
          ] },
        { type: "panel", x: 52, y: 20, w: 43, h: 72, accent: "purple",
          children: [
            { type: "illustration", kind: "two hand skeletons with cross-hand link lines", x: 58, y: 24, w: 30, h: 30 },
            { type: "label", text: "TWO HANDS", size: 22, color: "purple" },
            { type: "metric", value: "42", unit: "landmarks", size: 72 },
            { type: "metric", value: "74", unit: "features", size: 72, color: "teal" },
          ] },
      ],
    },

    // 8
    {
      number: 8,
      id: "data-challenge",
      title: "Real-World Sign Data Is Messy",
      subtitle: "So we clean it before we learn from it.",
      layout: "grid",
      visual: "montage of messy samples above a five-step cleanup pipeline",
      hierarchy: ["title", "montage", "pipeline"],
      labels: ["Scale", "Rotation", "Partial Hands", "One/Two-Hand Ambiguity", "Capture Conditions"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 38 },
        { type: "montage", x: 6, y: 20, w: 88, h: 40, layout: "5 tilted cards, slightly overlapping",
          items: [
            { label: "Scale", kind: "hand small vs large" },
            { label: "Rotation", kind: "hand rotated" },
            { label: "Partial Hands", kind: "hand cut off at frame edge" },
            { label: "One/Two-Hand Ambiguity", kind: "second hand half visible" },
            { label: "Capture Conditions", kind: "dim / bright / blurred variants" },
          ] },
        { type: "pipeline", x: 6, y: 70, w: 88, h: 18, direction: "horizontal",
          nodes: [
            { label: "RAW", color: "muted" },
            { label: "FILTER", color: "blue" },
            { label: "LANDMARKS", color: "purple" },
            { label: "STRUCTURE", color: "teal" },
            { label: "MODEL", color: "teal", emphasis: true },
          ] },
      ],
    },

    // 9
    {
      number: 9,
      id: "model-results",
      title: "Model Results",
      subtitle: "Offline vs. real webcam — reported separately.",
      layout: "metric",
      visual: "three large metric cards; third card visually distinct as the practical result",
      hierarchy: ["metrics", "captions", "warning note"],
      labels: ["99.29%", "99.81%", "70–80%"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 36 },
        { type: "metric-card", value: "99.29%", caption: "One-hand offline validation", x: 5, y: 22, w: 28, h: 50, size: 96, color: "blue" },
        { type: "metric-card", value: "99.81%", caption: "Two-hand offline validation", x: 36, y: 22, w: 28, h: 50, size: 96, color: "purple" },
        { type: "metric-card", value: "70–80%", caption: "Practical webcam performance", x: 67, y: 22, w: 28, h: 50, size: 96, color: "teal", emphasis: "outlined + glow" },
        { type: "note", text: "Offline validation ≠ real-world accuracy", x: 20, y: 82, w: 60, h: 7, size: 16, color: "warn", icon: "alert-triangle", align: "center" },
      ],
    },

    // 10
    {
      number: 10,
      id: "real-time-stability",
      title: "Real-Time Stability",
      subtitle: "Steady output from noisy frames.",
      layout: "pipeline",
      visual: "frame strip with a stray 'I' → smoothing funnel → clean 'H'",
      hierarchy: ["frame strip", "result", "stability labels"],
      labels: ["Prediction History", "Sign Lock", "Release Detection"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 38 },
        { type: "frame-strip", x: 6, y: 24, w: 56, h: 16,
          frames: ["H", "H", "H", "I", "H", "H", "H"], highlightIndex: 3, highlightColor: "warn" },
        { type: "funnel", label: "Temporal Smoothing", x: 62, y: 22, w: 14, h: 20, color: "purple" },
        { type: "result-badge", text: "H", x: 80, y: 22, w: 14, h: 20, size: 88, color: "teal" },
        { type: "card", label: "Prediction History", icon: "history", x: 6, y: 55, w: 28, h: 30, color: "blue" },
        { type: "card", label: "Sign Lock", icon: "lock", x: 36, y: 55, w: 28, h: 30, color: "purple" },
        { type: "card", label: "Release Detection", icon: "unlock", x: 66, y: 55, w: 28, h: 30, color: "teal" },
      ],
    },

    // 11
    {
      number: 11,
      id: "sentence-building",
      title: "Sentence Building",
      subtitle: "Letter by letter, then spoken.",
      layout: "pipeline",
      visual: "letter tiles H-E-L-L-O merging into HELLO, then sentence bar, then speaker",
      hierarchy: ["letter tiles", "merged word", "sentence + speech"],
      labels: ["HELLO", "SENTENCE", "SPEECH"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 38 },
        { type: "tile-row", items: ["H", "E", "L", "L", "O"], x: 15, y: 24, w: 70, h: 16, size: 56, arrows: true, color: "blue" },
        { type: "arrow", direction: "down", x: 48, y: 42, w: 4, h: 8, color: "purple" },
        { type: "word-block", text: "HELLO", x: 32, y: 52, w: 36, h: 14, size: 64, style: "gradient-text brand" },
        { type: "flow", x: 15, y: 74, w: 70, h: 14, direction: "horizontal",
          nodes: [
            { label: "HELLO", icon: "text-cursor" },
            { label: "SENTENCE", icon: "message-square" },
            { label: "SPEECH", icon: "volume-2", color: "teal" },
          ] },
      ],
    },

    // 12
    {
      number: 12,
      id: "local-web-architecture",
      title: "Local Web Architecture",
      subtitle: "Runs on your machine.",
      layout: "architecture",
      visual: "vertical stack of five nodes on the left, three benefit badges on the right",
      hierarchy: ["stack", "badges", "title"],
      labels: ["Local", "Low Latency", "Camera stays local"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 38 },
        { type: "vertical-stack", x: 8, y: 20, w: 40, h: 72, connector: "down-arrows",
          nodes: [
            { label: "Browser", icon: "globe", color: "blue" },
            { label: "WebSocket", icon: "cable", color: "blue" },
            { label: "FastAPI", icon: "server", color: "purple" },
            { label: "Local Inference", icon: "cpu", color: "purple" },
            { label: "Prediction", icon: "sparkles", color: "teal" },
          ] },
        { type: "badge", text: "Local", icon: "house", x: 58, y: 28, w: 32, h: 12, color: "teal" },
        { type: "badge", text: "Low Latency", icon: "zap", x: 58, y: 46, w: 32, h: 12, color: "purple" },
        { type: "badge", text: "Camera stays local", icon: "shield-check", x: 58, y: 64, w: 32, h: 12, color: "blue" },
      ],
    },

    // 13
    {
      number: 13,
      id: "sign-guide",
      title: "Never Forget a Sign",
      subtitle: "Built-in visual reference.",
      layout: "grid",
      visual: "two rows of cartoon hand tiles: 0–9 above, A–Z below",
      hierarchy: ["title", "A–Z row", "0–9 row"],
      labels: ["0–9", "A–Z"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 40 },
        { type: "row-label", text: "0–9", x: 6, y: 20, w: 10, h: 5, size: 20, color: "teal" },
        { type: "tile-grid", x: 6, y: 26, w: 88, h: 18, cols: 10, rows: 1, tile: "cartoon hand illustration + small character label", items: "0-9", assetType: "AI-generated cartoon hand (placeholder)" },
        { type: "row-label", text: "A–Z", x: 6, y: 50, w: 10, h: 5, size: 20, color: "blue" },
        { type: "tile-grid", x: 6, y: 56, w: 88, h: 34, cols: 13, rows: 2, tile: "cartoon hand illustration + small character label", items: "A-Z", assetType: "AI-generated cartoon hand (placeholder)" },
      ],
    },

    // 14
    {
      number: 14,
      id: "voice",
      title: "Hands → Voice",
      subtitle: "Natural Indian-English neural speech.",
      layout: "pipeline",
      visual: "hand icon → text bubble → sound waveform",
      hierarchy: ["three large icons", "waveform", "title"],
      labels: ["SIGN", "TEXT", "NEURAL VOICE"],
      elements: [
        { type: "title", x: 6, y: 8, w: 88, h: 12, size: 42 },
        { type: "pipeline", x: 8, y: 30, w: 84, h: 36, direction: "horizontal",
          nodes: [
            { label: "SIGN", icon: "hand", color: "blue" },
            { label: "TEXT", icon: "message-square-text", color: "purple" },
            { label: "NEURAL VOICE", icon: "audio-lines", color: "teal", emphasis: true },
          ] },
        { type: "decor", kind: "animated-style waveform bars in brand gradient", x: 20, y: 74, w: 60, h: 14, opacity: 0.8 },
      ],
    },

    // 15
    {
      number: 15,
      id: "current-scope",
      title: "Current Scope",
      subtitle: "A static-sign prototype — an honest starting point.",
      layout: "roadmap",
      visual: "five-step ladder; bottom step filled and checked, others outlined",
      hierarchy: ["ladder", "status marks", "title"],
      labels: ["STATIC SIGNS", "DYNAMIC SIGNS", "CONTINUOUS SEGMENTATION", "ISL GRAMMAR", "NATURAL CONVERSATION"],
      elements: [
        { type: "title", x: 6, y: 6, w: 88, h: 10, size: 38 },
        { type: "ladder", x: 15, y: 20, w: 70, h: 72, direction: "bottom-to-top",
          steps: [
            { label: "STATIC SIGNS", status: "done", mark: "✅", color: "teal", fill: "solid" },
            { label: "DYNAMIC SIGNS", status: "planned", color: "purple", fill: "outline" },
            { label: "CONTINUOUS SEGMENTATION", status: "planned", color: "purple", fill: "outline" },
            { label: "ISL GRAMMAR", status: "planned", color: "blue", fill: "outline" },
            { label: "NATURAL CONVERSATION", status: "planned", color: "blue", fill: "outline" },
          ] },
      ],
    },

    // 16
    {
      number: 16,
      id: "future",
      title: "What's Next",
      subtitle: "From laptop to pocket.",
      layout: "roadmap",
      visual: "horizontal ascending path with five device/milestone icons",
      hierarchy: ["path", "milestones", "title"],
      labels: ["Laptop", "Smartphone", "Android / iQOO", "On-device AI", "Continuous ISL"],
      elements: [
        { type: "title", x: 6, y: 8, w: 88, h: 12, size: 40 },
        { type: "path", x: 6, y: 28, w: 88, h: 50, style: "ascending glowing line", gradient: "blue→purple→teal",
          milestones: [
            { label: "Laptop", icon: "laptop", status: "now" },
            { label: "Smartphone", icon: "smartphone" },
            { label: "Android / iQOO", icon: "smartphone-charging" },
            { label: "On-device AI", icon: "cpu" },
            { label: "Continuous ISL", icon: "infinity", emphasis: true },
          ] },
      ],
    },

    // 17
    {
      number: 17,
      id: "closing",
      title: "SIGNBRIDGE",
      subtitle: "Breaking communication barriers, one sign at a time.",
      layout: "hero",
      visual: "HAND → AI → TEXT → SPEECH as a horizontal glowing flow",
      hierarchy: ["title", "flow", "subtitle"],
      labels: ["HAND", "AI", "TEXT", "SPEECH"],
      elements: [
        { type: "title", text: "SIGNBRIDGE", x: 10, y: 18, w: 80, h: 20, size: 88, align: "center", style: "gradient-text brand" },
        { type: "flow", x: 10, y: 46, w: 80, h: 20, direction: "horizontal",
          nodes: [
            { icon: "hand", label: "HAND", color: "blue" },
            { icon: "cpu", label: "AI", color: "purple" },
            { icon: "type", label: "TEXT", color: "teal" },
            { icon: "volume-2", label: "SPEECH", color: "blue" },
          ] },
        { type: "subtitle", x: 10, y: 76, w: 80, h: 8, size: 24, align: "center", color: "muted" },
        { type: "decor", kind: "soft radial glow behind title", x: 20, y: 10, w: 60, h: 50, opacity: 0.3 },
      ],
    },
  ],
};

// Fill in title/subtitle text on elements that omit it, so a converter can read them directly.
for (const s of deck.slides) {
  for (const el of s.elements) {
    if (el.type === "title" && !el.text) el.text = s.title;
    if (el.type === "subtitle" && !el.text) el.text = s.subtitle;
  }
}

if (typeof module !== "undefined") module.exports = deck;
