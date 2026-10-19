const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const deck = require("./signbridge_deck_spec.js");

const pptx = new pptxgen();

pptx.layout = "LAYOUT_WIDE";

pptx.author = "Team SignBridge";
pptx.company = "SignBridge";
pptx.subject = "Indian Sign Language Translator";
pptx.title = "SignBridge — Real-Time Indian Sign Language Translator";
pptx.lang = "en-US";

pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-US"
};

pptx.writeOptions = {
    compression: true
};


const W = 13.333;
const H = 7.5;

const ROOT = process.cwd();

const C = deck.theme.colors;

const PX = {
    bg: C.bg.replace("#", ""),
    bgAlt: C.bgAlt.replace("#", ""),
    panel: C.panel.replace("#", ""),
    border: C.panelBorder.replace("#", ""),
    blue: C.blue.replace("#", ""),
    purple: C.purple.replace("#", ""),
    teal: C.teal.replace("#", ""),
    text: C.text.replace("#", ""),
    muted: C.muted.replace("#", ""),
    warn: C.warn.replace("#", ""),
    ok: C.ok.replace("#", "")
};


// ============================================================
// ASSETS
// ============================================================

const assets = {

    ui: path.join(
        ROOT,
        "assets",
        "signbridge_ui.png"
    ),

    webcam: path.join(
        ROOT,
        "assets",
        "webcam_demo.png"
    ),

    hero: path.join(
        ROOT,
        "assets",
        "hero.png"
    )
};


// ============================================================
// HELPERS
// ============================================================

function exists(filePath) {
    return fs.existsSync(filePath);
}


function addBackground(slide, strong = false) {

    slide.background = {
        color: PX.bg
    };

    const blobs = [

        {
            x: strong ? 9.5 : 10.2,
            y: -0.7,
            w: 4.8,
            h: 4.8,
            color: PX.purple,
            transparency: 86
        },

        {
            x: -1.0,
            y: 4.8,
            w: 4.4,
            h: 4.4,
            color: PX.blue,
            transparency: 90
        },

        {
            x: 5.8,
            y: 5.8,
            w: 3.4,
            h: 3.4,
            color: PX.teal,
            transparency: 94
        }
    ];

    for (const b of blobs) {

        slide.addShape(
            pptx.ShapeType.ellipse,
            {
                x: b.x,
                y: b.y,
                w: b.w,
                h: b.h,

                fill: {
                    color: b.color,
                    transparency: b.transparency
                },

                line: {
                    color: b.color,
                    transparency: 100
                }
            }
        );
    }
}


function addTopTitle(
    slide,
    title,
    subtitle = ""
) {

    slide.addText(
        title,
        {
            x: 0.62,
            y: 0.32,
            w: 12.0,
            h: 0.46,

            fontFace: "Aptos Display",

            fontSize: 27,

            bold: true,

            color: PX.text,

            margin: 0,

            fit: "shrink"
        }
    );


    if (subtitle) {

        slide.addText(
            subtitle,
            {
                x: 0.65,
                y: 0.83,
                w: 11.8,
                h: 0.3,

                fontSize: 10.5,

                color: PX.muted,

                margin: 0,

                fit: "shrink"
            }
        );
    }
}


function addFooter(slide, number) {

    slide.addText(
        String(number).padStart(2, "0"),
        {
            x: 12.55,
            y: 7.08,
            w: 0.35,
            h: 0.16,

            fontSize: 7.5,

            color: "66718A",

            align: "right",

            margin: 0
        }
    );
}


function addPanel(
    slide,
    x,
    y,
    w,
    h,
    accent = PX.border,
    fill = PX.panel,
    options = {}
) {

    slide.addShape(
        pptx.ShapeType.roundRect,
        {
            x,
            y,
            w,
            h,

            fill: {
                color: fill,
                transparency:
                    options.transparency || 0
            },

            line: {
                color: accent,
                width:
                    options.lineWidth || 1.1,
                transparency:
                    options.lineTransparency || 0
            }
        }
    );
}


function addImageContain(
    slide,
    filePath,
    x,
    y,
    w,
    h
) {

    if (!exists(filePath)) {
        return false;
    }

    slide.addImage({
        path: filePath,
        x,
        y,
        w,
        h
    });

    return true;
}


function addArrowText(
    slide,
    x,
    y,
    text = "→",
    color = PX.purple,
    size = 21
) {

    slide.addText(
        text,
        {
            x,
            y,
            w: 0.45,
            h: 0.4,

            fontSize: size,

            bold: true,

            color,

            align: "center",

            margin: 0
        }
    );
}


function addFlowNode(
    slide,
    x,
    y,
    w,
    h,
    label,
    color,
    sub = ""
) {

    addPanel(
        slide,
        x,
        y,
        w,
        h,
        color,
        PX.panel
    );


    slide.addShape(
        pptx.ShapeType.ellipse,
        {
            x: x + 0.16,
            y: y + 0.18,
            w: 0.36,
            h: 0.36,

            fill: {
                color,
                transparency: 10
            },

            line: {
                color,
                transparency: 100
            }
        }
    );


    slide.addText(
        label,
        {
            x: x + 0.62,
            y: y + 0.16,
            w: w - 0.78,
            h: 0.27,

            fontSize: 13.5,

            bold: true,

            color: PX.text,

            margin: 0,

            fit: "shrink"
        }
    );


    if (sub) {

        slide.addText(
            sub,
            {
                x: x + 0.16,
                y: y + 0.53,
                w: w - 0.3,
                h: 0.25,

                fontSize: 8.5,

                color: PX.muted,

                margin: 0,

                fit: "shrink"
            }
        );
    }
}


function addLabelChip(
    slide,
    text,
    x,
    y,
    w,
    color = PX.purple
) {

    slide.addShape(
        pptx.ShapeType.roundRect,
        {
            x,
            y,
            w,
            h: 0.34,

            fill: {
                color,
                transparency: 84
            },

            line: {
                color,
                transparency: 45,
                width: 0.8
            }
        }
    );


    slide.addText(
        text,
        {
            x,
            y: y + 0.03,
            w,
            h: 0.18,

            fontSize: 8.5,

            bold: true,

            color: PX.text,

            align: "center",

            margin: 0,

            fit: "shrink"
        }
    );
}


function addMetricCard(
    slide,
    value,
    caption,
    x,
    y,
    w,
    h,
    color,
    emphasis = false
) {

    addPanel(
        slide,
        x,
        y,
        w,
        h,
        color,
        PX.panel,
        {
            lineWidth:
                emphasis ? 1.9 : 1.1
        }
    );


    slide.addText(
        value,
        {
            x: x + 0.12,
            y: y + 0.45,
            w: w - 0.24,
            h: 0.7,

            fontSize: 33,

            bold: true,

            color,

            align: "center",

            margin: 0
        }
    );


    slide.addText(
        caption,
        {
            x: x + 0.22,
            y: y + 1.34,
            w: w - 0.44,
            h: 0.6,

            fontSize: 10.5,

            bold: true,

            color: PX.text,

            align: "center",

            margin: 0,

            fit: "shrink"
        }
    );


    if (emphasis) {

        slide.addText(
            "PRACTICAL",
            {
                x: x + 0.18,
                y: y + 0.16,
                w: w - 0.36,
                h: 0.2,

                fontSize: 7.5,

                bold: true,

                color,

                align: "center",

                margin: 0
            }
        );
    }
}


function addSymbolTile(
    slide,
    symbol,
    x,
    y,
    w,
    h
) {

    addPanel(
        slide,
        x,
        y,
        w,
        h,
        PX.border,
        "0C1530"
    );


    const imagePath =
        path.join(
            ROOT,
            "symbols",
            `${symbol}.png`
        );


    if (exists(imagePath)) {

        slide.addImage(
            {
                path: imagePath,

                x: x + 0.06,

                y: y + 0.05,

                w: w - 0.12,

                h: h - 0.28
            }
        );
    }


    slide.addText(
        symbol,
        {
            x,
            y: y + h - 0.27,
            w,
            h: 0.18,

            fontSize: 10,

            bold: true,

            color: PX.text,

            align: "center",

            margin: 0
        }
    );
}


// ============================================================
// SLIDE 1 — HERO
// ============================================================

function renderHero(
    slide,
    s,
    number
) {

    addBackground(
        slide,
        true
    );


    slide.addText(
        s.title,
        {
            x: 0.8,
            y: 1.38,
            w: 6.5,
            h: 0.95,

            fontSize: 46,

            bold: true,

            color: PX.text,

            margin: 0,

            fit: "shrink"
        }
    );


    slide.addText(
        s.subtitle,
        {
            x: 0.84,
            y: 2.42,
            w: 6.25,
            h: 0.42,

            fontSize: 18,

            color: PX.muted,

            margin: 0,

            fit: "shrink"
        }
    );


    const labels =
        s.labels || [
            "HAND",
            "AI",
            "TEXT",
            "SPEECH"
        ];


    const colors = [
        PX.blue,
        PX.purple,
        PX.teal,
        PX.blue
    ];


    const y = 4.0;


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const x =
            0.95 +
            i * 1.52;


        addFlowNode(
            slide,
            x,
            y,
            1.23,
            0.82,
            labels[i],
            colors[i]
        );


        if (i < 3) {

            addArrowText(
                slide,
                x + 1.23,
                y + 0.18,
                "→",
                PX.muted,
                18
            );
        }
    }


    slide.addText(
        "See. Understand. Speak.",
        {
            x: 0.85,
            y: 5.72,
            w: 5.8,
            h: 0.42,

            fontSize: 21,

            italic: true,

            color: PX.teal,

            margin: 0
        }
    );


    if (
        !addImageContain(
            slide,
            assets.hero,
            7.1,
            0.65,
            5.55,
            6.2
        )
    ) {

        slide.addShape(
            pptx.ShapeType.ellipse,
            {
                x: 8.15,
                y: 1.15,
                w: 3.2,
                h: 3.2,

                fill: {
                    color: PX.purple,
                    transparency: 78
                },

                line: {
                    color: PX.purple,
                    transparency: 100
                }
            }
        );


        slide.addText(
            "SIGN\n↓\nAI\n↓\nTEXT\n↓\nSPEECH",
            {
                x: 8.9,
                y: 1.95,
                w: 1.7,
                h: 3.0,

                fontSize: 24,

                bold: true,

                color: PX.text,

                align: "center",

                valign: "mid",

                margin: 0
            }
        );
    }


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 2 — PROBLEM
// ============================================================

function renderProblem(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    addPanel(
        slide,
        0.75,
        1.7,
        5.3,
        4.7,
        PX.blue
    );


    addPanel(
        slide,
        7.25,
        1.7,
        5.3,
        4.7,
        PX.purple
    );


    slide.addText(
        "SIGNER",
        {
            x: 0.95,
            y: 1.96,
            w: 4.9,
            h: 0.3,

            fontSize: 13,

            bold: true,

            color: PX.blue,

            align: "center",

            margin: 0
        }
    );


    slide.addText(
        "NON-SIGNER",
        {
            x: 7.45,
            y: 1.96,
            w: 4.9,
            h: 0.3,

            fontSize: 13,

            bold: true,

            color: PX.purple,

            align: "center",

            margin: 0
        }
    );


    slide.addText(
        "✋",
        {
            x: 2.35,
            y: 2.65,
            w: 2,
            h: 1.4,

            fontSize: 86,

            align: "center",

            margin: 0
        }
    );


    slide.addText(
        "?",
        {
            x: 9.35,
            y: 2.65,
            w: 2,
            h: 1.4,

            fontSize: 88,

            bold: true,

            color: PX.purple,

            align: "center",

            margin: 0
        }
    );


    addLabelChip(
        slide,
        "COMMUNICATION GAP",
        1.25,
        4.95,
        2.2,
        PX.warn
    );


    addLabelChip(
        slide,
        "ACCESSIBILITY",
        8.1,
        4.95,
        1.55,
        PX.purple
    );


    addLabelChip(
        slide,
        "UNDERSTANDING",
        9.85,
        4.95,
        1.7,
        PX.teal
    );


    slide.addText(
        "×",
        {
            x: 5.98,
            y: 3.18,
            w: 1.1,
            h: 0.8,

            fontSize: 44,

            color: PX.warn,

            bold: true,

            align: "center",

            margin: 0
        }
    );


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 3 / 11 / 10 — PIPELINES
// ============================================================

function renderPipeline(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    if (
        s.id ===
        "real-time-stability"
    ) {

        const frames = [
            "H",
            "H",
            "H",
            "I",
            "H",
            "H",
            "H"
        ];


        frames.forEach(
            (label, i) => {

                addPanel(
                    slide,
                    0.75 + i * 1.13,
                    2.0,
                    0.85,
                    0.8,
                    i === 3
                        ? PX.warn
                        : PX.border,
                    i === 3
                        ? "2A1C0B"
                        : "101B31"
                );


                slide.addText(
                    label,
                    {
                        x: 0.75 + i * 1.13,
                        y: 2.23,
                        w: 0.85,
                        h: 0.24,

                        fontSize: 21,

                        bold: true,

                        color:
                            i === 3
                                ? PX.warn
                                : PX.text,

                        align: "center",

                        margin: 0
                    }
                );
            }
        );


        addArrowText(
            slide,
            9.05,
            2.16,
            "→",
            PX.purple,
            28
        );


        addFlowNode(
            slide,
            9.65,
            2,
            1.65,
            0.8,
            "H",
            PX.teal,
            "stable"
        );


        const labels = [
            "Prediction History",
            "Sign Lock",
            "Release Detection"
        ];


        labels.forEach(
            (label, i) => {

                addLabelChip(
                    slide,
                    label,
                    1.05 + i * 3.95,
                    4.05,
                    3.2,
                    [
                        PX.blue,
                        PX.purple,
                        PX.teal
                    ][i]
                );
            }
        );


        slide.addText(
            "Frame-to-frame noise → stable character",
            {
                x: 3,
                y: 5.25,
                w: 7.3,
                h: 0.4,

                fontSize: 17,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );


        addFooter(
            slide,
            number
        );

        return;
    }


    if (
        s.id ===
        "sentence-building"
    ) {

        const letters = [
            "H",
            "E",
            "L",
            "L",
            "O"
        ];


        letters.forEach(
            (letter, i) => {

                addPanel(
                    slide,
                    2.9 + i * 0.88,
                    2.0,
                    0.7,
                    0.72,
                    PX.blue,
                    "15213B"
                );


                slide.addText(
                    letter,
                    {
                        x: 2.9 + i * 0.88,
                        y: 2.2,
                        w: 0.7,
                        h: 0.25,

                        fontSize: 20,

                        bold: true,

                        color: PX.text,

                        align: "center",

                        margin: 0
                    }
                );
            }
        );


        slide.addText(
            "↓",
            {
                x: 6.25,
                y: 2.95,
                w: 0.5,
                h: 0.45,

                fontSize: 26,

                bold: true,

                color: PX.purple,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "HELLO",
            {
                x: 4.9,
                y: 3.48,
                w: 3.5,
                h: 0.7,

                fontSize: 37,

                bold: true,

                color: PX.teal,

                align: "center",

                margin: 0
            }
        );


        addFlowNode(
            slide,
            2.0,
            5.0,
            2.5,
            0.85,
            "HELLO",
            PX.blue
        );


        addArrowText(
            slide,
            4.65,
            5.18,
            "→",
            PX.muted,
            23
        );


        addFlowNode(
            slide,
            5.25,
            5.0,
            2.5,
            0.85,
            "SENTENCE",
            PX.purple
        );


        addArrowText(
            slide,
            7.9,
            5.18,
            "→",
            PX.muted,
            23
        );


        addFlowNode(
            slide,
            8.45,
            5.0,
            2.5,
            0.85,
            "SPEECH",
            PX.teal
        );


        addFooter(
            slide,
            number
        );

        return;
    }


    const labels =
        s.labels ||
        [
            "SIGN",
            "CHARACTER",
            "WORD",
            "SENTENCE",
            "VOICE"
        ];


    const count =
        labels.length;


    const nodeW = 2.0;

    const gap = 0.38;

    const total =
        count * nodeW +
        (count - 1) * gap;

    let x =
        (W - total) / 2;


    const y = 2.5;


    const colors = [
        PX.blue,
        PX.purple,
        PX.purple,
        PX.teal,
        PX.blue
    ];


    labels.forEach(
        (label, i) => {

            addFlowNode(
                slide,
                x,
                y,
                nodeW,
                1.15,
                label,
                colors[
                    i % colors.length
                ]
            );


            if (
                i <
                count - 1
            ) {

                addArrowText(
                    slide,
                    x + nodeW + 0.02,
                    y + 0.34,
                    "→",
                    PX.muted,
                    22
                );
            }


            x +=
                nodeW +
                gap;
        }
    );


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 4 — PRODUCT UI
// ============================================================

function renderUI(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    const used =
        addImageContain(
            slide,
            assets.ui,
            0.9,
            1.45,
            11.55,
            5.35
        );


    if (!used) {

        addPanel(
            slide,
            0.9,
            1.45,
            11.55,
            5.35,
            PX.purple,
            PX.panel
        );


        slide.addText(
            "SIGNBRIDGE WEB UI",
            {
                x: 3.15,
                y: 2.1,
                w: 7,
                h: 0.7,

                fontSize: 28,

                bold: true,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "Add your current UI screenshot here:\nassets/signbridge_ui.png",
            {
                x: 3,
                y: 3.15,
                w: 7.3,
                h: 1.2,

                fontSize: 18,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );
    }


    const callouts = [
        [
            "Camera",
            1.05,
            5.95,
            PX.blue
        ],
        [
            "Prediction",
            3.55,
            2.02,
            PX.purple
        ],
        [
            "Confidence",
            6.45,
            2.02,
            PX.teal
        ],
        [
            "Text",
            8.95,
            5.95,
            PX.blue
        ],
        [
            "Sign Guide",
            10.65,
            5.95,
            PX.teal
        ]
    ];


    for (
        const [label, x, y, color]
        of callouts
    ) {

        addLabelChip(
            slide,
            label,
            x,
            y,
            1.3,
            color
        );
    }


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 5 / 12 — ARCHITECTURE
// ============================================================

function renderArchitecture(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    const nodes = [

        [
            "Webcam",
            PX.blue,
            0.7,
            1.65
        ],

        [
            "MediaPipe",
            PX.blue,
            3.1,
            1.65
        ],

        [
            "Landmarks",
            PX.purple,
            5.5,
            1.65
        ],

        [
            "Structural Features",
            PX.purple,
            7.9,
            1.65
        ],

        [
            "Random Forest",
            PX.purple,
            1.9,
            4.0
        ],

        [
            "Smoothing",
            PX.teal,
            4.3,
            4.0
        ],

        [
            "Text",
            PX.teal,
            6.7,
            4.0
        ],

        [
            "TTS",
            PX.teal,
            9.1,
            4.0
        ]
    ];


    nodes.forEach(
        (
            [
                label,
                color,
                x,
                y
            ]
        ) => {

            addFlowNode(
                slide,
                x,
                y,
                2.0,
                1.0,
                label,
                color
            );
        }
    );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        addArrowText(
            slide,
            2.72 + i * 2.4,
            1.95,
            "→",
            PX.muted,
            22
        );
    }


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        addArrowText(
            slide,
            5.08 + i * 2.4,
            4.3,
            "→",
            PX.muted,
            22
        );
    }


    slide.addShape(
        pptx.ShapeType.line,
        {
            x: 8.85,
            y: 2.65,
            w: -5.75,
            h: 1.15,

            line: {
                color: PX.muted,
                width: 1.5,

                endArrowType:
                    "triangle"
            }
        }
    );


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 6 / 7 — COMPARISON
// ============================================================

function renderComparison(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    if (
        s.id ===
        "key-innovation"
    ) {

        const labels = [
            "Small",
            "Large",
            "Left",
            "Right",
            "Tilted"
        ];


        labels.forEach(
            (label, i) => {

                const x =
                    0.75 +
                    (i % 3) *
                        1.85;

                const y =
                    1.95 +
                    Math.floor(
                        i / 3
                    ) *
                    1.55;


                addPanel(
                    slide,
                    x,
                    y,
                    1.55,
                    1.2,
                    PX.border,
                    "101B31"
                );


                slide.addText(
                    "✋",
                    {
                        x: x + 0.35,
                        y: y + 0.15,
                        w: 0.85,
                        h: 0.65,

                        fontSize: 38,

                        color:
                            [
                                PX.blue,
                                PX.purple,
                                PX.teal,
                                PX.blue,
                                PX.purple
                            ][i],

                        align: "center",

                        margin: 0
                    }
                );


                slide.addText(
                    label,
                    {
                        x: x + 0.1,
                        y: y + 0.92,
                        w: 1.35,
                        h: 0.18,

                        fontSize: 9,

                        color: PX.muted,

                        align: "center",

                        margin: 0
                    }
                );
            }
        );


        addArrowText(
            slide,
            6.05,
            3.0,
            "→",
            PX.purple,
            36
        );


        addPanel(
            slide,
            7.05,
            1.75,
            5.2,
            4.0,
            PX.teal,
            "0E1730"
        );


        slide.addText(
            "STRUCTURAL SIGNATURE",
            {
                x: 7.55,
                y: 2.12,
                w: 4.2,
                h: 0.35,

                fontSize: 16,

                bold: true,

                color: PX.teal,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "ANGLE",
            {
                x: 7.6,
                y: 2.95,
                w: 1.2,
                h: 0.25,

                fontSize: 10,

                bold: true,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "SPREAD",
            {
                x: 9.05,
                y: 2.95,
                w: 1.2,
                h: 0.25,

                fontSize: 10,

                bold: true,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "LENGTH",
            {
                x: 10.55,
                y: 2.95,
                w: 1.2,
                h: 0.25,

                fontSize: 10,

                bold: true,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "↗  ↘  ↔\n⌁  ∿  ⌁\n│  │  │\n○  ○  ○",
            {
                x: 8.2,
                y: 3.45,
                w: 3,
                h: 1.25,

                fontSize: 28,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "Similar representation\nacross size • position • tilt",
            {
                x: 7.8,
                y: 5.05,
                w: 3.8,
                h: 0.55,

                fontSize: 11,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );
    }

    else {

        addPanel(
            slide,
            0.7,
            1.65,
            5.7,
            4.9,
            PX.blue,
            "101B31"
        );


        addPanel(
            slide,
            6.95,
            1.65,
            5.7,
            4.9,
            PX.purple,
            "101B31"
        );


        slide.addText(
            "ONE HAND",
            {
                x: 1.05,
                y: 1.98,
                w: 5,
                h: 0.35,

                fontSize: 20,

                bold: true,

                color: PX.blue,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "TWO HANDS",
            {
                x: 7.3,
                y: 1.98,
                w: 5,
                h: 0.35,

                fontSize: 20,

                bold: true,

                color: PX.purple,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "21",
            {
                x: 1.4,
                y: 2.8,
                w: 2,
                h: 0.75,

                fontSize: 52,

                bold: true,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "landmarks",
            {
                x: 1.35,
                y: 3.52,
                w: 2.1,
                h: 0.25,

                fontSize: 11,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "19",
            {
                x: 3.55,
                y: 2.8,
                w: 2,
                h: 0.75,

                fontSize: 52,

                bold: true,

                color: PX.teal,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "features",
            {
                x: 3.5,
                y: 3.52,
                w: 2.1,
                h: 0.25,

                fontSize: 11,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "42",
            {
                x: 7.65,
                y: 2.8,
                w: 2,
                h: 0.75,

                fontSize: 52,

                bold: true,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "landmarks",
            {
                x: 7.6,
                y: 3.52,
                w: 2.1,
                h: 0.25,

                fontSize: 11,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "74",
            {
                x: 9.8,
                y: 2.8,
                w: 2,
                h: 0.75,

                fontSize: 52,

                bold: true,

                color: PX.teal,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "features",
            {
                x: 9.75,
                y: 3.52,
                w: 2.1,
                h: 0.25,

                fontSize: 11,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "Dedicated model",
            {
                x: 1.55,
                y: 4.55,
                w: 4,
                h: 0.3,

                fontSize: 14,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );


        slide.addText(
            "Dedicated model",
            {
                x: 7.8,
                y: 4.55,
                w: 4,
                h: 0.3,

                fontSize: 14,

                color: PX.text,

                align: "center",

                margin: 0
            }
        );
    }


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDES 8 / 13 — GRID
// ============================================================

function renderGrid(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    if (
        s.id ===
        "sign-guide"
    ) {

        const numbers = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9"
        ];


        const letters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                .split("");


        slide.addText(
            "0–9",
            {
                x: 0.62,
                y: 1.45,
                w: 1,
                h: 0.28,

                fontSize: 13,

                bold: true,

                color: PX.teal,

                margin: 0
            }
        );


        numbers.forEach(
            (symbol, i) => {

                addSymbolTile(
                    slide,
                    symbol,
                    1.45 +
                        i * 1.16,
                    1.18,
                    0.96,
                    1.08
                );
            }
        );


        slide.addText(
            "A–Z",
            {
                x: 0.62,
                y: 2.72,
                w: 1,
                h: 0.28,

                fontSize: 13,

                bold: true,

                color: PX.blue,

                margin: 0
            }
        );


        letters.forEach(
            (symbol, i) => {

                const row =
                    Math.floor(
                        i / 13
                    );

                const col =
                    i % 13;


                addSymbolTile(
                    slide,
                    symbol,
                    0.62 +
                        col * 0.96,
                    3.12 +
                        row * 1.28,
                    0.82,
                    1.1
                );
            }
        );


        slide.addText(
            "Visual reference stays above the live camera.",
            {
                x: 3.1,
                y: 6.1,
                w: 7.1,
                h: 0.3,

                fontSize: 14,

                color: PX.muted,

                align: "center",

                margin: 0
            }
        );
    }

    else {

        const labels = [
            "Scale",
            "Rotation",
            "Partial Hands",
            "One/Two-Hand",
            "Capture Conditions"
        ];


        labels.forEach(
            (label, i) => {

                addPanel(
                    slide,
                    0.75 +
                        i * 2.45,
                    1.75,
                    2.15,
                    2.2,

                    [
                        PX.blue,
                        PX.purple,
                        PX.warn,
                        PX.purple,
                        PX.teal
                    ][i],

                    "101B31"
                );


                slide.addText(
                    [
                        "↕",
                        "⟳",
                        "✂",
                        "↔",
                        "◐"
                    ][i],
                    {
                        x:
                            1.35 +
                            i * 2.45,

                        y: 2.05,

                        w: 0.95,

                        h: 0.55,

                        fontSize: 28,

                        bold: true,

                        color:
                            [
                                PX.blue,
                                PX.purple,
                                PX.warn,
                                PX.purple,
                                PX.teal
                            ][i],

                        align: "center",

                        margin: 0
                    }
                );


                slide.addText(
                    label,
                    {
                        x:
                            0.95 +
                            i * 2.45,

                        y: 3.0,

                        w: 1.75,

                        h: 0.45,

                        fontSize: 10,

                        bold: true,

                        color: PX.text,

                        align: "center",

                        margin: 0,

                        fit: "shrink"
                    }
                );
            }
        );


        const steps = [
            "RAW",
            "FILTER",
            "LANDMARKS",
            "STRUCTURE",
            "MODEL"
        ];


        steps.forEach(
            (step, i) => {

                addFlowNode(
                    slide,
                    0.9 +
                        i * 2.45,
                    4.85,
                    1.95,
                    0.85,
                    step,

                    [
                        PX.muted,
                        PX.blue,
                        PX.purple,
                        PX.teal,
                        PX.teal
                    ][i]
                );


                if (
                    i <
                    steps.length - 1
                ) {

                    addArrowText(
                        slide,
                        2.88 +
                            i * 2.45,
                        5.08,
                        "→",
                        PX.muted,
                        20
                    );
                }
            }
        );
    }


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 9 — METRICS
// ============================================================

function renderMetric(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    addMetricCard(
        slide,
        "99.29%",
        "One-hand offline validation",
        0.6,
        1.65,
        3.8,
        3.1,
        PX.blue
    );


    addMetricCard(
        slide,
        "99.81%",
        "Two-hand offline validation",
        4.77,
        1.65,
        3.8,
        3.1,
        PX.purple
    );


    addMetricCard(
        slide,
        "70–80%",
        "Practical webcam performance",
        8.94,
        1.65,
        3.8,
        3.1,
        PX.teal,
        true
    );


    addLabelChip(
        slide,
        "OFFLINE VALIDATION ≠ REAL-WORLD ACCURACY",
        3.55,
        5.3,
        6.2,
        PX.warn
    );


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDES 15 / 16 — ROADMAP
// ============================================================

function renderRoadmap(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    if (
        s.id ===
        "current-scope"
    ) {

        const steps = [
            "STATIC SIGNS",
            "DYNAMIC SIGNS",
            "CONTINUOUS SEGMENTATION",
            "ISL GRAMMAR",
            "NATURAL CONVERSATION"
        ];


        steps.forEach(
            (step, i) => {

                const y =
                    5.95 -
                    i * 0.85;

                const w =
                    4.6 +
                    i * 0.75;

                const x =
                    4.2 -
                    i * 0.37;


                addPanel(
                    slide,
                    x,
                    y,
                    w,
                    0.62,

                    i === 0
                        ? PX.teal
                        : PX.border,

                    i === 0
                        ? "123126"
                        : "0F1733"
                );


                slide.addText(
                    step,
                    {
                        x: x + 0.12,
                        y: y + 0.19,
                        w: w - 0.24,
                        h: 0.2,

                        fontSize: 12,

                        bold: true,

                        color:
                            i === 0
                                ? PX.teal
                                : PX.text,

                        align: "center",

                        margin: 0,

                        fit: "shrink"
                    }
                );


                if (
                    i === 0
                ) {

                    slide.addText(
                        "✓",
                        {
                            x:
                                x +
                                w -
                                0.4,

                            y:
                                y +
                                0.14,

                            w: 0.25,

                            h: 0.25,

                            fontSize: 14,

                            bold: true,

                            color: PX.ok,

                            align: "center",

                            margin: 0
                        }
                    );
                }
            }
        );
    }

    else {

        const milestones = [
            "Laptop",
            "Smartphone",
            "Android / iQOO",
            "On-device AI",
            "Continuous ISL"
        ];


        milestones.forEach(
            (label, i) => {

                const x =
                    1.0 +
                    i * 2.72;

                const y =
                    4.95 -
                    i * 0.46;


                slide.addShape(
                    pptx.ShapeType.ellipse,
                    {
                        x,
                        y,
                        w: 0.75,
                        h: 0.75,

                        fill: {
                            color:
                                [
                                    PX.blue,
                                    PX.blue,
                                    PX.purple,
                                    PX.teal,
                                    PX.teal
                                ][i],

                            transparency: 15
                        },

                        line: {
                            color: "FFFFFF",
                            transparency: 100
                        }
                    }
                );


                slide.addText(
                    String(i + 1),
                    {
                        x,
                        y: y + 0.19,
                        w: 0.75,
                        h: 0.2,

                        fontSize: 13,

                        bold: true,

                        color: PX.text,

                        align: "center",

                        margin: 0
                    }
                );


                slide.addText(
                    label,
                    {
                        x: x - 0.55,
                        y: y + 0.95,
                        w: 1.85,
                        h: 0.45,

                        fontSize: 10.5,

                        bold: true,

                        color: PX.text,

                        align: "center",

                        margin: 0,

                        fit: "shrink"
                    }
                );


                if (
                    i <
                    milestones.length - 1
                ) {

                    slide.addShape(
                        pptx.ShapeType.line,
                        {
                            x:
                                x +
                                0.75,

                            y:
                                y +
                                0.38,

                            w:
                                1.95,

                            h:
                                -0.36,

                            line: {
                                color:
                                    [
                                        PX.blue,
                                        PX.purple,
                                        PX.teal,
                                        PX.teal
                                    ][i],

                                width: 2.5,

                                endArrowType:
                                    "triangle"
                            }
                        }
                    );
                }
            }
        );
    }


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 14 — VOICE
// ============================================================

function renderVoice(
    slide,
    s,
    number
) {

    addBackground(slide);

    addTopTitle(
        slide,
        s.title,
        s.subtitle
    );


    const nodes = [
        ["SIGN", PX.blue],
        ["TEXT", PX.purple],
        ["NEURAL VOICE", PX.teal]
    ];


    let x = 1.55;


    nodes.forEach(
        ([label, color], i) => {

            addFlowNode(
                slide,
                x,
                2.35,
                2.45,
                1.15,
                label,
                color
            );


            if (
                i < 2
            ) {

                addArrowText(
                    slide,
                    x + 2.53,
                    2.68,
                    "→",
                    PX.muted,
                    28
                );
            }


            x += 4.0;
        }
    );


    slide.addShape(
        pptx.ShapeType.rect,
        {
            x: 2.55,
            y: 4.55,
            w: 8.2,
            h: 0.02,

            fill: {
                color: PX.teal,
                transparency: 20
            },

            line: {
                color: PX.teal,
                transparency: 100
            }
        }
    );


    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const h =
            0.12 +
            ((i * 7) % 5) *
            0.07;


        const color =
            [
                PX.blue,
                PX.purple,
                PX.teal
            ][
                i % 3
            ];


        slide.addShape(
            pptx.ShapeType.rect,
            {
                x:
                    2.6 +
                    i * 0.36,

                y:
                    4.48 -
                    h / 2,

                w: 0.08,

                h,

                fill: {
                    color
                },

                line: {
                    color,
                    transparency: 100
                }
            }
        );
    }


    addFooter(
        slide,
        number
    );
}


// ============================================================
// SLIDE 17 — CLOSING
// ============================================================

function renderClosing(
    slide,
    s,
    number
) {

    addBackground(
        slide,
        true
    );


    slide.addText(
        "SIGNBRIDGE",
        {
            x: 2.1,
            y: 1.35,
            w: 9.1,
            h: 0.9,

            fontSize: 48,

            bold: true,

            color: PX.text,

            align: "center",

            margin: 0
        }
    );


    slide.addText(
        "Breaking communication barriers, one sign at a time.",
        {
            x: 2.05,
            y: 2.35,
            w: 9.2,
            h: 0.4,

            fontSize: 18,

            color: PX.muted,

            align: "center",

            margin: 0
        }
    );


    const labels = [
        "HAND",
        "AI",
        "TEXT",
        "SPEECH"
    ];


    const colors = [
        PX.blue,
        PX.purple,
        PX.teal,
        PX.blue
    ];


    labels.forEach(
        (label, i) => {

            addFlowNode(
                slide,
                1.5 +
                    i * 2.78,
                4.15,
                2.05,
                1.0,
                label,
                colors[i]
            );


            if (
                i < 3
            ) {

                addArrowText(
                    slide,
                    3.63 +
                        i * 2.78,
                    4.43,
                    "→",
                    PX.muted,
                    24
                );
            }
        }
    );


    addFooter(
        slide,
        number
    );
}


// ============================================================
// ROUTER
// ============================================================

function renderSlide(
    slide,
    spec
) {

    switch (
        spec.layout
    ) {

        case "hero":

            if (
                spec.id ===
                "closing"
            ) {

                return renderClosing(
                    slide,
                    spec,
                    spec.number
                );
            }

            return renderHero(
                slide,
                spec,
                spec.number
            );


        case "split":

            return renderProblem(
                slide,
                spec,
                spec.number
            );


        case "pipeline":

            return renderPipeline(
                slide,
                spec,
                spec.number
            );


        case "ui-mockup":

            return renderUI(
                slide,
                spec,
                spec.number
            );


        case "architecture":

            return renderArchitecture(
                slide,
                spec,
                spec.number
            );


        case "comparison":

            return renderComparison(
                slide,
                spec,
                spec.number
            );


        case "grid":

            return renderGrid(
                slide,
                spec,
                spec.number
            );


        case "metric":

            return renderMetric(
                slide,
                spec,
                spec.number
            );


        case "roadmap":

            return renderRoadmap(
                slide,
                spec,
                spec.number
            );


        default:

            return renderPipeline(
                slide,
                spec,
                spec.number
            );
    }
}


// ============================================================
// BUILD ALL SLIDES
// ============================================================

for (
    const spec
    of deck.slides
) {

    const slide =
        pptx.addSlide();


    renderSlide(
        slide,
        spec
    );
}


// ============================================================
// WRITE FILE
// ============================================================

(async () => {

    const outputPath =
        path.join(
            ROOT,
            "SignBridge_Hackathon_Presentation.pptx"
        );


    await pptx.writeFile({
        fileName: outputPath
    });


    console.log(
        `Created: ${outputPath}`
    );

})();