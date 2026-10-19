from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ==========================================
# PALETTE & DESIGN SYSTEM
# ==========================================
BG_COLOR = RGBColor(11, 15, 25)         # Deep slate/black
CARD_BG = RGBColor(22, 31, 48)          # Surface card
CARD_BORDER = RGBColor(38, 52, 79)      # Card outline
CYAN_ACCENT = RGBColor(0, 229, 255)     # Neon cyan
GREEN_ACCENT = RGBColor(16, 185, 129)   # Emerald green
AMBER_ACCENT = RGBColor(245, 158, 11)   # Warning/Practical amber
RED_ACCENT = RGBColor(239, 68, 68)      # Danger red
TEXT_WHITE = RGBColor(255, 255, 255)    # High contrast white
TEXT_MUTED = RGBColor(148, 163, 184)    # Secondary muted slate

FONT_HEADING = "Segoe UI"
FONT_BODY = "Segoe UI"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def set_slide_background(slide):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_COLOR
    bg.line.fill.background()
    return bg

def add_header(slide, title, category=None):
    if category:
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        tf_c = cat_box.text_frame
        tf_c.word_wrap = True
        tf_c.margin_left = tf_c.margin_right = tf_c.margin_top = tf_c.margin_bottom = 0
        p_c = tf_c.paragraphs[0]
        p_c.text = category.upper()
        p_c.font.name = FONT_HEADING
        p_c.font.size = Pt(11)
        p_c.font.bold = True
        p_c.font.color.rgb = CYAN_ACCENT

    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.7))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
    p_t = tf_t.paragraphs[0]
    p_t.text = title
    p_t.font.name = FONT_HEADING
    p_t.font.size = Pt(26)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE

def add_card(slide, left, top, width, height, fill_color=CARD_BG, border_color=CARD_BORDER):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
    else:
        shape.line.fill.background()
    return shape

# ==========================================
# SLIDE 1: HERO / TITLE
# ==========================================
s1 = prs.slides.add_slide(blank_layout)
set_slide_background(s1)

hero_card = add_card(s1, 0.8, 1.2, 11.733, 5.1, CARD_BG, CYAN_ACCENT)
tb = hero_card.text_frame
tb.vertical_anchor = MSO_ANCHOR.MIDDLE
tb.word_wrap = True

p0 = tb.paragraphs[0]
p0.text = "PROJECT PITCH"
p0.font.name = FONT_HEADING
p0.font.size = Pt(14)
p0.font.bold = True
p0.font.color.rgb = CYAN_ACCENT
p0.alignment = PP_ALIGN.CENTER
p0.space_after = Pt(14)

p1 = tb.add_paragraph()
p1.text = "SIGNBRIDGE"
p1.font.name = FONT_HEADING
p1.font.size = Pt(54)
p1.font.bold = True
p1.font.color.rgb = TEXT_WHITE
p1.alignment = PP_ALIGN.CENTER

p2 = tb.add_paragraph()
p2.text = "Real-Time Indian Sign Language Translator"
p2.font.name = FONT_BODY
p2.font.size = Pt(22)
p2.font.color.rgb = TEXT_MUTED
p2.alignment = PP_ALIGN.CENTER
p2.space_after = Pt(36)

p3 = tb.add_paragraph()
p3.text = '" See. Understand. Speak. "'
p3.font.name = FONT_BODY
p3.font.size = Pt(18)
p3.font.bold = True
p3.font.color.rgb = CYAN_ACCENT
p3.alignment = PP_ALIGN.CENTER

# ==========================================
# SLIDE 2: THE PROBLEM
# ==========================================
s2 = prs.slides.add_slide(blank_layout)
set_slide_background(s2)
add_header(s2, "Communication Shouldn't Need a Translator", "The Accessibility Gap")

c1 = add_card(s2, 0.8, 1.8, 5.7, 4.8)
tf1 = c1.text_frame
tf1.word_wrap = True
p = tf1.paragraphs[0]
p.text = "THE REALITY"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = CYAN_ACCENT
p.space_after = Pt(20)

bullet1 = tf1.add_paragraph()
bullet1.text = "• Millions communicate primarily using Indian Sign Language."
bullet1.font.size = Pt(18)
bullet1.font.color.rgb = TEXT_WHITE
bullet1.space_after = Pt(16)

bullet2 = tf1.add_paragraph()
bullet2.text = "• Natural sign language is visually rich, complex, and structural."
bullet2.font.size = Pt(18)
bullet2.font.color.rgb = TEXT_WHITE

c2 = add_card(s2, 6.833, 1.8, 5.7, 4.8)
tf2 = c2.text_frame
tf2.word_wrap = True
p = tf2.paragraphs[0]
p.text = "THE FRICTION"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = RED_ACCENT
p.space_after = Pt(20)

bullet3 = tf2.add_paragraph()
bullet3.text = "• The vast majority of people cannot understand or read ISL."
bullet3.font.size = Pt(18)
bullet3.font.color.rgb = TEXT_WHITE
bullet3.space_after = Pt(16)

bullet4 = tf2.add_paragraph()
bullet4.text = "• Communication breakdowns limit education, commerce, and daily tasks."
bullet4.font.size = Pt(18)
bullet4.font.color.rgb = TEXT_WHITE
bullet4.space_after = Pt(24)

bullet5 = tf2.add_paragraph()
bullet5.text = "SignBridge provides a direct, accessible, camera-driven bridge."
bullet5.font.size = Pt(16)
bullet5.font.bold = True
bullet5.font.color.rgb = CYAN_ACCENT

# ==========================================
# SLIDE 3: THE IDEA
# ==========================================
s3 = prs.slides.add_slide(blank_layout)
set_slide_background(s3)
add_header(s3, "What if a Camera Could Understand the Sign?", "Core Product Concept")

pipeline_steps = [
    ("HAND", "Live webcam video feed"),
    ("SIGN", "ISL static posture capture"),
    ("CHARACTER", "Deterministic RF model inference"),
    ("WORD", "Temporal stabilization & accumulation"),
    ("SENTENCE", "Sign-lock & spacing controls"),
    ("VOICE", "Edge neural text-to-speech")
]

step_w = 1.8
gap = 0.18
for i, (title, desc) in enumerate(pipeline_steps):
    x = 0.8 + i * (step_w + gap)
    card = add_card(s3, x, 2.6, step_w, 3.0)
    tf = card.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = f"0{i+1}"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT
    p.space_after = Pt(10)
    
    p2 = tf.add_paragraph()
    p2.text = title
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.space_after = Pt(10)
    
    p3 = tf.add_paragraph()
    p3.text = desc
    p3.font.size = Pt(12)
    p3.font.color.rgb = TEXT_MUTED

# ==========================================
# SLIDE 4: PRODUCT / LIVE DEMO
# ==========================================
s4 = prs.slides.add_slide(blank_layout)
set_slide_background(s4)
add_header(s4, "Interactive Sign Translation in Real-Time", "Live Experience")

left_card = add_card(s4, 0.8, 1.8, 6.5, 4.8)
tf_l = left_card.text_frame
tf_l.word_wrap = True
p = tf_l.paragraphs[0]
p.text = "SIGN ACCUMULATION PIPELINE"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = CYAN_ACCENT
p.space_after = Pt(20)

flow_items = [
    "SIGN  ➔  H",
    "SIGN  ➔  E",
    "SIGN  ➔  L",
    "SIGN  ➔  L",
    "SIGN  ➔  O"
]
for item in flow_items:
    pf = tf_l.add_paragraph()
    pf.text = item
    pf.font.size = Pt(16)
    pf.font.bold = True
    pf.font.color.rgb = TEXT_WHITE
    pf.space_after = Pt(6)

pf_res = tf_l.add_paragraph()
pf_res.text = "\nCOMPILED WORD:  HELLO"
pf_res.font.size = Pt(18)
pf_res.font.bold = True
pf_res.font.color.rgb = GREEN_ACCENT

right_card = add_card(s4, 7.6, 1.8, 4.933, 4.8)
tf_r = right_card.text_frame
tf_r.word_wrap = True
p = tf_r.paragraphs[0]
p.text = "INTEGRATED CONTROLS"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = CYAN_ACCENT
p.space_after = Pt(16)

features = [
    ("Real-Time Camera Panel", "MediaPipe 21-landmark tracking overlay"),
    ("Visual Sign Guide Strip", "A–Z & 0–9 visual cartoon reference bar"),
    ("Sign-Boundary Locking", "Prevents duplicate inputs while holding a sign"),
    ("Action Triggers", "Dedicated Speak, Space, Delete, and Clear operations")
]
for f_title, f_desc in features:
    p_t = tf_r.add_paragraph()
    p_t.text = f"• {f_title}"
    p_t.font.size = Pt(14)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE
    
    p_d = tf_r.add_paragraph()
    p_d.text = f"  {f_desc}"
    p_d.font.size = Pt(12)
    p_d.font.color.rgb = TEXT_MUTED
    p_d.space_after = Pt(8)

# ==========================================
# SLIDE 5: HOW IT WORKS
# ==========================================
s5 = prs.slides.add_slide(blank_layout)
set_slide_background(s5)
add_header(s5, "From Hand Movement to Speech", "Technical Pipeline")

pipeline_boxes = [
    ("1. VIDEO INPUT", "Webcam frames captured locally at 30 FPS"),
    ("2. MEDIAPIPE", "21 3D hand landmarks tracked per detected hand"),
    ("3. STRUCTURAL EXTRACTION", "19 features (1 Hand) or 74 features (2 Hands)"),
    ("4. RANDOM FOREST", "Ensemble inference with confidence thresholding"),
    ("5. TEMPORAL SMOOTHING", "Majority voting buffer + sign boundary lock"),
    ("6. SENTENCE BUILDER", "Accumulation engine + Edge neural TTS synthesis")
]

for i, (title, desc) in enumerate(pipeline_boxes):
    col = i % 3
    row = i // 3
    x = 0.8 + col * 4.0
    y = 1.9 + row * 2.5
    card = add_card(s5, x, y, 3.733, 2.1)
    tf = card.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT
    p.space_after = Pt(8)
    
    p2 = tf.add_paragraph()
    p2.text = desc
    p2.font.size = Pt(14)
    p2.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 6: WHY STRUCTURAL FEATURES?
# ==========================================
s6 = prs.slides.add_slide(blank_layout)
set_slide_background(s6)
add_header(s6, "We Don't Want the Model to Learn Where the Hand Is", "Feature Engineering")

c_bad = add_card(s6, 0.8, 1.8, 5.7, 4.8)
tf_b = c_bad.text_frame
tf_b.word_wrap = True
p = tf_b.paragraphs[0]
p.text = "NAIVE: RAW COORDINATES (X, Y)"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = RED_ACCENT
p.space_after = Pt(16)

raw_points = [
    "• Highly vulnerable to user distance from the camera",
    "• Hand translation shifts raw coordinate values drastically",
    "• Hand scale changes with individual anatomy",
    "• Minor camera tilt ruins classification confidence",
    "➔ Fails to generalize to new environments"
]
for rp in raw_points:
    p = tf_b.add_paragraph()
    p.text = rp
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(10)

c_good = add_card(s6, 6.833, 1.8, 5.7, 4.8)
tf_g = c_good.text_frame
tf_g.word_wrap = True
p = tf_g.paragraphs[0]
p.text = "SOLUTION: STRUCTURAL SIGNATURES"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = GREEN_ACCENT
p.space_after = Pt(16)

struct_points = [
    "• Finger Bend Angles: Articulation-invariant finger state",
    "• Finger Spread Angles: Relative inter-finger geometry",
    "• Relative Lengths: Hand-size normalized proportions",
    "• Cross-Hand Geometry: Left/right spatial ordering logic",
    "➔ Captures hand pose geometry, not camera position"
]
for sp in struct_points:
    p = tf_g.add_paragraph()
    p.text = sp
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(10)

# ==========================================
# SLIDE 7: ONE-HAND VS TWO-HAND
# ==========================================
s7 = prs.slides.add_slide(blank_layout)
set_slide_background(s7)
add_header(s7, "Dual Model Architecture", "Specialized Classifiers")

c_oh = add_card(s7, 0.8, 1.8, 5.7, 4.8)
tf_oh = c_oh.text_frame
tf_oh.word_wrap = True
p = tf_oh.paragraphs[0]
p.text = "ONE-HAND CLASSIFIER"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = CYAN_ACCENT
p.space_after = Pt(18)

oh_specs = [
    ("Input Landmarks", "21 landmarks (single detected hand)"),
    ("Feature Vector", "19 structural geometric features"),
    ("Extracted Metrics", "Finger bend angles, spread angles, normalized lengths"),
    ("Model Artifact", "one_hand_structure.pkl"),
    ("Classifier", "Random Forest Ensemble")
]
for k, v in oh_specs:
    p1 = tf_oh.add_paragraph()
    p1.text = f"{k}:"
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_MUTED
    
    p2 = tf_oh.add_paragraph()
    p2.text = v
    p2.font.size = Pt(15)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.space_after = Pt(10)

c_th = add_card(s7, 6.833, 1.8, 5.7, 4.8)
tf_th = c_th.text_frame
tf_th.word_wrap = True
p = tf_th.paragraphs[0]
p.text = "TWO-HAND CLASSIFIER"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = CYAN_ACCENT
p.space_after = Pt(18)

th_specs = [
    ("Input Landmarks", "42 landmarks (both hands detected)"),
    ("Feature Vector", "74 structural geometric features"),
    ("Extracted Metrics", "Hand 1 + Hand 2 structure + Cross-hand distance/angles"),
    ("Model Artifact", "two_hand_structure.pkl"),
    ("Normalization", "Left/right positional ordering invariant")
]
for k, v in th_specs:
    p1 = tf_th.add_paragraph()
    p1.text = f"{k}:"
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_MUTED
    
    p2 = tf_th.add_paragraph()
    p2.text = v
    p2.font.size = Pt(15)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.space_after = Pt(10)

# ==========================================
# SLIDE 8: THE DATASET CHALLENGE
# ==========================================
s8 = prs.slides.add_slide(blank_layout)
set_slide_background(s8)
add_header(s8, "Real-World Data Is Messy", "Data Engineering")

c_chal = add_card(s8, 0.8, 1.8, 5.7, 4.8)
tf_c = c_chal.text_frame
tf_c.word_wrap = True
p = tf_c.paragraphs[0]
p.text = "REAL-WORLD VARIATION"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = AMBER_ACCENT
p.space_after = Pt(16)

chal_items = [
    "• Drastic lighting and exposure variations across cameras",
    "• Partial hand occlusions during complex two-handed signs",
    "• Visually similar signs that confuse standard coordinate nets:",
    "   - '1' vs 'S'",
    "   - 'I' vs 'Q'",
    "• Inconsistent user distance and camera perspective"
]
for ci in chal_items:
    p = tf_c.add_paragraph()
    p.text = ci
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(10)

c_eng = add_card(s8, 6.833, 1.8, 5.7, 4.8)
tf_e = c_eng.text_frame
tf_e.word_wrap = True
p = tf_e.paragraphs[0]
p.text = "DATA CLEANING PIPELINE"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = CYAN_ACCENT
p.space_after = Pt(16)

stages = [
    ("1. Raw Image Acquisition", "Standardized static ISL class folders"),
    ("2. Hand-Count Filtering", "Discards corrupt frames with incorrect hands"),
    ("3. Landmark Extraction", "Generates 21 keypoints per valid hand"),
    ("4. Structural Translation", "Computes invariant angles and relative lengths"),
    ("5. Balanced Retraining", "Supplemental webcam data for edge-case signs")
]
for s_title, s_desc in stages:
    p1 = tf_e.add_paragraph()
    p1.text = s_title
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    
    p2 = tf_e.add_paragraph()
    p2.text = f"   {s_desc}"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_after = Pt(6)

# ==========================================
# SLIDE 9: MODEL RESULTS
# ==========================================
s9 = prs.slides.add_slide(blank_layout)
set_slide_background(s9)
add_header(s9, "Strong Offline Validation. Real-World Testing Matters.", "Empirical Performance")

metrics = [
    ("99.29%", "ONE-HAND VALIDATION", "Image-level holdout accuracy", CYAN_ACCENT),
    ("99.81%", "TWO-HAND VALIDATION", "Image-level holdout accuracy", CYAN_ACCENT),
    ("70–80%", "REAL WEBCAM TESTING", "Practical live performance", AMBER_ACCENT)
]

for i, (val, title, subtitle, color) in enumerate(metrics):
    x = 0.8 + i * 4.0
    card = add_card(s9, x, 1.8, 3.733, 2.9)
    tf = card.text_frame
    tf.word_wrap = True
    
    p0 = tf.paragraphs[0]
    p0.text = val
    p0.font.size = Pt(44)
    p0.font.bold = True
    p0.font.color.rgb = color
    p0.space_after = Pt(8)
    
    p1 = tf.add_paragraph()
    p1.text = title
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(4)
    
    p2 = tf.add_paragraph()
    p2.text = subtitle
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

disc_card = add_card(s9, 0.8, 5.0, 11.733, 1.7, CARD_BG, AMBER_ACCENT)
tf_d = disc_card.text_frame
tf_d.word_wrap = True
p = tf_d.paragraphs[0]
p.text = "CRITICAL TECHNICAL DISTINCTION"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = AMBER_ACCENT
p.space_after = Pt(6)

pd1 = tf_d.add_paragraph()
pd1.text = "Offline image-level validation splits samples, but does not measure generalization to unseen signers, varied illumination, or shifting angles."
pd1.font.size = Pt(14)
pd1.font.color.rgb = TEXT_WHITE

pd2 = tf_d.add_paragraph()
pd2.text = "SignBridge explicitly validates on live webcam feeds to measure true real-world reliability."
pd2.font.size = Pt(13)
pd2.font.bold = True
pd2.font.color.rgb = CYAN_ACCENT

# ==========================================
# SLIDE 10: REAL-TIME STABILITY
# ==========================================
s10 = prs.slides.add_slide(blank_layout)
set_slide_background(s10)
add_header(s10, "One Frame Isn't Enough", "Temporal Stabilization")

card_flow = add_card(s10, 0.8, 1.8, 11.733, 2.0)
tf_f = card_flow.text_frame
tf_f.word_wrap = True

pf = tf_f.paragraphs[0]
pf.text = "FRAME BUFFER SAMPLING (RAW VS SMOOTHED)"
pf.font.size = Pt(12)
pf.font.bold = True
pf.font.color.rgb = CYAN_ACCENT
pf.space_after = Pt(12)

pf2 = tf_f.add_paragraph()
pf2.text = "Raw Predictions:      [ H ] ➔ [ H ] ➔ [ H ] ➔ [ I ] (Glitch) ➔ [ H ] ➔ [ H ]"
pf2.font.size = Pt(16)
pf2.font.bold = True
pf2.font.color.rgb = TEXT_MUTED
pf2.space_after = Pt(8)

pf3 = tf_f.add_paragraph()
pf3.text = "Majority Output:      [ H ] (Confirmed Stable Gesture)"
pf3.font.size = Pt(18)
pf3.font.bold = True
pf3.font.color.rgb = GREEN_ACCENT

pillars = [
    ("Prediction History Buffer", "Retains rolling window of recent frames to filter momentary classification noise."),
    ("Sign-Lock Logic", "Locks character once stabilized; prevents repeated inputs while the sign is held."),
    ("Release Detection", "Requires clear gesture transition or hand removal before accepting the next character.")
]

for i, (title, desc) in enumerate(pillars):
    x = 0.8 + i * 4.0
    card = add_card(s10, x, 4.1, 3.733, 2.5)
    tf = card.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT
    p.space_after = Pt(8)
    
    p2 = tf.add_paragraph()
    p2.text = desc
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 11: FROM CHARACTERS TO SENTENCES
# ==========================================
s11 = prs.slides.add_slide(blank_layout)
set_slide_background(s11)
add_header(s11, "From Characters to Coherent Sentences", "Language Construction")

c_steps = add_card(s11, 0.8, 1.8, 11.733, 4.8)
tf_s = c_steps.text_frame
tf_s.word_wrap = True

p = tf_s.paragraphs[0]
p.text = "CONSTRUCTION LIFECYCLE"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = CYAN_ACCENT
p.space_after = Pt(20)

steps = [
    ("1. CHARACTER ACCUMULATION", "H  ➔  E  ➔  L  ➔  L  ➔  O"),
    ("2. WORD FORMATION", "Individual stable characters assemble into the target token 'HELLO'"),
    ("3. SPACE & SEPARATION", "Triggered via UI Space button or registered sign gesture"),
    ("4. FULL SENTENCE COMPILATION", '"HELLO I AM PANKAJ"'),
    ("5. NEURAL SPEECH SYNTHESIS", "Instant high-fidelity voice output via Edge TTS")
]
for title, detail in steps:
    p_t = tf_s.add_paragraph()
    p_t.text = title
    p_t.font.size = Pt(14)
    p_t.font.bold = True
    p_t.font.color.rgb = GREEN_ACCENT
    
    p_d = tf_s.add_paragraph()
    p_d.text = f"   {detail}"
    p_d.font.size = Pt(16)
    p_d.font.color.rgb = TEXT_WHITE
    p_d.space_after = Pt(10)

# ==========================================
# SLIDE 12: WEB APP ARCHITECTURE
# ==========================================
s12 = prs.slides.add_slide(blank_layout)
set_slide_background(s12)
add_header(s12, "High-Performance Local Architecture", "System Design")

c_diag = add_card(s12, 0.8, 1.8, 11.733, 1.8)
tf_diag = c_diag.text_frame
tf_diag.word_wrap = True

pd = tf_diag.paragraphs[0]
pd.text = "END-TO-END DATAFLOW (RUNS ENTIRELY ON LOCAL MACHINE)"
pd.font.size = Pt(12)
pd.font.bold = True
pd.font.color.rgb = CYAN_ACCENT
pd.space_after = Pt(12)

pd2 = tf_diag.add_paragraph()
pd2.text = "Browser UI   ➔   WebSocket   ➔   FastAPI Backend   ➔   MediaPipe + Random Forest   ➔   Prediction Payload"
pd2.font.size = Pt(15)
pd2.font.bold = True
pd2.font.color.rgb = TEXT_WHITE

arch_pillars = [
    ("LOW LATENCY", "Direct bi-directional WebSocket frames deliver responsive feedback loop."),
    ("LOCAL PROCESSING", "All ML inference happens locally. No costly server-side GPU roundtrips."),
    ("COMPLETE PRIVACY", "Video frames never leave the user machine; zero remote video storage.")
]

for i, (title, desc) in enumerate(arch_pillars):
    x = 0.8 + i * 4.0
    card = add_card(s12, x, 3.9, 3.733, 2.7)
    tf = card.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = GREEN_ACCENT
    p.space_after = Pt(10)
    
    p2 = tf.add_paragraph()
    p2.text = desc
    p2.font.size = Pt(14)
    p2.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 13: USER EXPERIENCE
# ==========================================
s13 = prs.slides.add_slide(blank_layout)
set_slide_background(s13)
add_header(s13, "Built for Accessibility & Learning", "Interface Ergonomics")

c_mock = add_card(s13, 0.8, 1.8, 5.7, 4.8)
tf_m = c_mock.text_frame
tf_m.word_wrap = True
pm = tf_m.paragraphs[0]
pm.text = "UI STRUCTURE"
pm.font.size = Pt(13)
pm.font.bold = True
pm.font.color.rgb = CYAN_ACCENT
pm.space_after = Pt(16)

ui_layers = [
    ("Top Tutorial Strip", "Visual cartoon reference guide for 0–9 and A–Z signs"),
    ("Live Video Panel", "Immediate webcam feed with detected landmark coordinates"),
    ("State Dashboard", "Current prediction, confidence %, and detected hand count"),
    ("Sentence Display", "Real-time accumulated text with manual editing support"),
    ("Control Dock", "Dedicated Speak, Space, Delete, and Clear buttons")
]
for l_title, l_desc in ui_layers:
    p1 = tf_m.add_paragraph()
    p1.text = f"• {l_title}"
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    
    p2 = tf_m.add_paragraph()
    p2.text = f"  {l_desc}"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_after = Pt(6)

c_diff = add_card(s13, 6.833, 1.8, 5.7, 4.8)
tf_df = c_diff.text_frame
tf_df.word_wrap = True
p = tf_df.paragraphs[0]
p.text = "THE KEY DESIGN DIFFERENTIATOR"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = GREEN_ACCENT
p.space_after = Pt(20)

p_body = tf_df.add_paragraph()
p_body.text = '"Even if the user forgets how to sign a character, the guide is always in their line of sight."'
p_body.font.size = Pt(20)
p_body.font.bold = True
p_body.font.color.rgb = TEXT_WHITE
p_body.space_after = Pt(20)

p_sub = tf_df.add_paragraph()
p_sub.text = "SignBridge acts simultaneously as a communication bridge and a sign learning tool."
p_sub.font.size = Pt(15)
p_sub.font.color.rgb = TEXT_MUTED

# ==========================================
# SLIDE 14: TTS
# ==========================================
s14 = prs.slides.add_slide(blank_layout)
set_slide_background(s14)
add_header(s14, "Hands to Voice", "Neural Speech Synthesis")

c_tts = add_card(s14, 0.8, 1.8, 11.733, 4.8)
tf_tts = c_tts.text_frame
tf_tts.word_wrap = True

pt = tf_tts.paragraphs[0]
pt.text = "NEURAL VOICE PIPELINE"
pt.font.size = Pt(13)
pt.font.bold = True
pt.font.color.rgb = CYAN_ACCENT
pt.space_after = Pt(24)

p_chain = tf_tts.add_paragraph()
p_chain.text = 'ISL SIGN  ➔  COMPILED TEXT  ➔  NEURAL AUDIO SYNTHESIS'
p_chain.font.size = Pt(20)
p_chain.font.bold = True
p_chain.font.color.rgb = TEXT_WHITE
p_chain.space_after = Pt(24)

p_eg = tf_tts.add_paragraph()
p_eg.text = 'Target Output: "HELLO I AM PANKAJ"'
p_eg.font.size = Pt(24)
p_eg.font.bold = True
p_eg.font.color.rgb = GREEN_ACCENT
p_eg.space_after = Pt(24)

tts_details = [
    "• Powered by Edge TTS neural engine",
    "• Active voice persona: en-IN-PrabhatNeural (Natural Indian English inflection)",
    "• High intelligibility without robotic cadence",
    "• Non-blocking asynchronous audio playback"
]
for td in tts_details:
    p_td = tf_tts.add_paragraph()
    p_td.text = td
    p_td.font.size = Pt(15)
    p_td.font.color.rgb = TEXT_MUTED
    p_td.space_after = Pt(6)

# ==========================================
# SLIDE 15: LIMITATIONS / HONEST SCOPE
# ==========================================
s15 = prs.slides.add_slide(blank_layout)
set_slide_background(s15)
add_header(s15, "Where We Are Today", "Honest Engineering Roadmap")

ladder_steps = [
    ("CURRENT PROTOTYPE", "Static alphabet & digit ISL signs (A-Z, 0-9)", GREEN_ACCENT, "COMPLETE"),
    ("PHASE 2", "Dynamic gesture recognition (movement across time)", CYAN_ACCENT, "NEXT"),
    ("PHASE 3", "Continuous sign segmentation in open dialogue", TEXT_MUTED, "PLANNED"),
    ("PHASE 4", "ISL grammatical models (facial expression + spatial syntax)", TEXT_MUTED, "RESEARCH"),
    ("PHASE 5", "Signer-independent cross-domain generalization", TEXT_MUTED, "RESEARCH")
]

for i, (title, desc, color, tag) in enumerate(ladder_steps):
    y = 1.8 + i * 0.95
    card = add_card(s15, 0.8, y, 11.733, 0.82)
    tf = card.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = f"[{tag}]  {title} — {desc}"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = color

# ==========================================
# SLIDE 16: FUTURE VISION
# ==========================================
s16 = prs.slides.add_slide(blank_layout)
set_slide_background(s16)
add_header(s16, "From Laptop Prototype to Everyday Accessibility", "Expansion Horizon")

vision_phases = [
    ("1. MOBILE PORTABILITY", "Port landmark pipeline to Android / iQOO on-device runtime."),
    ("2. EDGE ML OPTIMIZATION", "TFLite / ONNX quantization for low-power mobile execution."),
    ("3. CONTINUOUS ISL", "Transition from discrete fingerspelling to full conversational signs."),
    ("4. MULTILINGUAL SPEECH", "Direct translation from ISL into Hindi, Telugu, Tamil, and English.")
]

for i, (title, desc) in enumerate(vision_phases):
    col = i % 2
    row = i // 2
    x = 0.8 + col * 6.0
    y = 1.9 + row * 2.5
    card = add_card(s16, x, y, 5.733, 2.2)
    tf = card.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT
    p.space_after = Pt(10)
    
    p2 = tf.add_paragraph()
    p2.text = desc
    p2.font.size = Pt(15)
    p2.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 17: WHY SIGNBRIDGE MATTERS
# ==========================================
s17 = prs.slides.add_slide(blank_layout)
set_slide_background(s17)

card_quote = add_card(s17, 0.8, 1.2, 11.733, 5.1, CARD_BG, None)
tf_q = card_quote.text_frame
tf_q.vertical_anchor = MSO_ANCHOR.MIDDLE
tf_q.word_wrap = True

pq = tf_q.paragraphs[0]
pq.text = '"Technology should adapt to people —\nnot the other way around."'
pq.font.size = Pt(32)
pq.font.bold = True
pq.font.color.rgb = TEXT_WHITE
pq.alignment = PP_ALIGN.CENTER
pq.space_after = Pt(28)

pq2 = tf_q.add_paragraph()
pq2.text = "SIGN  ➔  UNDERSTANDING  ➔  CONNECTION"
pq2.font.size = Pt(18)
pq2.font.bold = True
pq2.font.color.rgb = CYAN_ACCENT
pq2.alignment = PP_ALIGN.CENTER

# ==========================================
# SLIDE 18: FINAL DEMO / CALL TO ACTION
# ==========================================
s18 = prs.slides.add_slide(blank_layout)
set_slide_background(s18)

card_cta = add_card(s18, 0.8, 1.2, 11.733, 5.1, CARD_BG, CYAN_ACCENT)
tf_cta = card_cta.text_frame
tf_cta.vertical_anchor = MSO_ANCHOR.MIDDLE
tf_cta.word_wrap = True

pc0 = tf_cta.paragraphs[0]
pc0.text = "SIGNBRIDGE"
pc0.font.size = Pt(48)
pc0.font.bold = True
pc0.font.color.rgb = TEXT_WHITE
pc0.alignment = PP_ALIGN.CENTER
pc0.space_after = Pt(12)

pc1 = tf_cta.add_paragraph()
pc1.text = "HAND  ➔  AI  ➔  TEXT  ➔  SPEECH"
pc1.font.size = Pt(18)
pc1.font.bold = True
pc1.font.color.rgb = CYAN_ACCENT
pc1.alignment = PP_ALIGN.CENTER
pc1.space_after = Pt(24)

pc2 = tf_cta.add_paragraph()
pc2.text = '"Breaking communication barriers, one sign at a time."'
pc2.font.size = Pt(20)
pc2.font.bold = True
pc2.font.color.rgb = GREEN_ACCENT
pc2.alignment = PP_ALIGN.CENTER

# ==========================================
# SLIDE 19: TEAM
# ==========================================
s19 = prs.slides.add_slide(blank_layout)
set_slide_background(s19)
add_header(s19, "Team SignBridge", "Builders")

c_team = add_card(s19, 0.8, 1.8, 11.733, 4.8)
tf_tm = c_team.text_frame
tf_tm.word_wrap = True

ptm = tf_tm.paragraphs[0]
ptm.text = "CORE CONTRIBUTORS"
ptm.font.size = Pt(13)
ptm.font.bold = True
ptm.font.color.rgb = CYAN_ACCENT
ptm.space_after = Pt(24)

ptm_name = tf_tm.add_paragraph()
ptm_name.text = "Dilnawaz & Team SignBridge"
ptm_name.font.size = Pt(24)
ptm_name.font.bold = True
ptm_name.font.color.rgb = TEXT_WHITE
ptm_name.space_after = Pt(16)

roles = [
    "• Machine Learning & Feature Engineering (19 / 74 Structural Descriptors)",
    "• Computer Vision & MediaPipe Landmark Pipelines",
    "• FastAPI Backend & Real-Time WebSocket Architecture",
    "• Accessible Web UI with Visual Sign Tutorial Guides"
]
for r in roles:
    pr = tf_tm.add_paragraph()
    pr.text = r
    pr.font.size = Pt(16)
    pr.font.color.rgb = TEXT_MUTED
    pr.space_after = Pt(8)

# ==========================================
# SLIDE 20: CODE & DEPLOYMENT
# ==========================================
s20 = prs.slides.add_slide(blank_layout)
set_slide_background(s20)
add_header(s20, "Open Source & Reproducibility", "Repository")

c_repo = add_card(s20, 0.8, 1.8, 11.733, 4.8)
tf_rp = c_repo.text_frame
tf_rp.word_wrap = True

pr0 = tf_rp.paragraphs[0]
pr0.text = "PROJECT REPOSITORY"
pr0.font.size = Pt(13)
pr0.font.bold = True
pr0.font.color.rgb = CYAN_ACCENT
pr0.space_after = Pt(20)

pr1 = tf_rp.add_paragraph()
pr1.text = "GitHub URL:"
pr1.font.size = Pt(14)
pr1.font.bold = True
pr1.font.color.rgb = TEXT_MUTED

pr2 = tf_rp.add_paragraph()
pr2.text = "https://github.com/DD-bit001/Indian-Sign-Language-translator"
pr2.font.size = Pt(20)
pr2.font.bold = True
pr2.font.color.rgb = GREEN_ACCENT
pr2.space_after = Pt(28)

instructions = [
    "1. Clone the repository and install requirements (FastAPI, MediaPipe, OpenCV, Edge TTS)",
    "2. Place trained weights 'one_hand_structure.pkl' and 'two_hand_structure.pkl' in root",
    "3. Run the local inference server and launch the interactive browser interface"
]
for inst in instructions:
    pi = tf_rp.add_paragraph()
    pi.text = inst
    pi.font.size = Pt(15)
    pi.font.color.rgb = TEXT_WHITE
    pi.space_after = Pt(10)

# ==========================================
# SAVE PRESENTATION
# ==========================================
prs.save("signbridge_pitch_deck.pptx")
print("Presentation generated successfully: signbridge_pitch_deck.pptx")