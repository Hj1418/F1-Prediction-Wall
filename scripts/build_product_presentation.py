import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette — Light Professional Executive Theme
BG_WHITE = RGBColor(255, 255, 255)
BG_CARD = RGBColor(248, 250, 252)        # Slate 50
BG_CARD_ALT = RGBColor(241, 245, 249)    # Slate 100
BORDER_COLOR = RGBColor(226, 232, 240)   # Slate 200
BORDER_DARK = RGBColor(203, 213, 225)    # Slate 300

TEXT_TITLE = RGBColor(15, 23, 42)        # Slate 900
TEXT_SUBTITLE = RGBColor(71, 85, 105)    # Slate 600
TEXT_BODY = RGBColor(51, 65, 85)         # Slate 700
TEXT_MUTED = RGBColor(148, 163, 184)     # Slate 400

BRAND_RED = RGBColor(225, 6, 0)          # F1 Racing Red
BRAND_ORANGE = RGBColor(235, 87, 34)     # GRDX Orange
ACCENT_BLUE = RGBColor(37, 99, 235)      # Blue 600
ACCENT_GREEN = RGBColor(22, 163, 74)     # Green 600
ACCENT_AMBER = RGBColor(217, 119, 6)     # Amber 600
ACCENT_PURPLE = RGBColor(147, 51, 234)   # Purple 600

CALLOUT_BG = RGBColor(255, 251, 235)     # Amber 50
CALLOUT_BORDER = RGBColor(245, 158, 11)  # Amber 500
CALLOUT_TEXT = RGBColor(120, 53, 15)     # Amber 900

TABLE_HEADER_BG = RGBColor(30, 41, 59)   # Slate 800
TABLE_ROW_ALT = RGBColor(248, 250, 252)  # Slate 50

FONT_HEADING = "Segoe UI"
FONT_BODY = "Segoe UI"

def set_slide_background(slide):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_WHITE
    bg.line.fill.background()
    return bg

def add_header(slide, breadcrumb, title, subtitle):
    # Top subtle racing red accent line
    top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.08))
    top_line.fill.solid()
    top_line.fill.fore_color.rgb = BRAND_RED
    top_line.line.fill.background()

    # Header text box
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.24), Inches(11.733), Inches(0.96))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p_bc = tf.paragraphs[0]
    p_bc.text = breadcrumb.upper()
    p_bc.font.name = FONT_HEADING
    p_bc.font.size = Pt(8.5)
    p_bc.font.bold = True
    p_bc.font.color.rgb = BRAND_RED
    p_bc.space_after = Pt(2)

    p_title = tf.add_paragraph()
    p_title.text = title
    p_title.font.name = FONT_HEADING
    p_title.font.size = Pt(20)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_TITLE
    p_title.space_after = Pt(2)

    p_sub = tf.add_paragraph()
    p_sub.text = subtitle
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = TEXT_SUBTITLE

    sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.22), Inches(11.733), Inches(0.015))
    sep.fill.solid()
    sep.fill.fore_color.rgb = BORDER_COLOR
    sep.line.fill.background()

def add_footer(slide, slide_num, total_slides=12):
    sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.015))
    sep.fill.solid()
    sep.fill.fore_color.rgb = BORDER_COLOR
    sep.line.fill.background()

    tb = slide.shapes.add_textbox(Inches(0.8), Inches(7.12), Inches(11.733), Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "THE GRDX — F1 Prediction & Community Platform  |  Product, Architecture & Roadmap Presentation"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_MUTED

    tb_num = slide.shapes.add_textbox(Inches(10.5), Inches(7.12), Inches(2.0), Inches(0.3))
    tf_num = tb_num.text_frame
    tf_num.margin_left = tf_num.margin_top = tf_num.margin_right = tf_num.margin_bottom = 0
    p_num = tf_num.paragraphs[0]
    p_num.text = f"Slide {slide_num} of {total_slides}"
    p_num.alignment = PP_ALIGN.RIGHT
    p_num.font.name = FONT_BODY
    p_num.font.size = Pt(8.5)
    p_num.font.bold = True
    p_num.font.color.rgb = TEXT_SUBTITLE

def add_card(slide, left, top, width, height, title=None, bg_color=BG_CARD, border_color=BORDER_COLOR):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)

    if title:
        tb = slide.shapes.add_textbox(left + Inches(0.18), top + Inches(0.12), width - Inches(0.36), Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title.upper()
        p.font.name = FONT_HEADING
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = TEXT_TITLE

    return card

def add_callout(slide, left, top, width, height, title, body_text):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = CALLOUT_BG
    card.line.color.rgb = CALLOUT_BORDER
    card.line.width = Pt(1.5)

    tb = slide.shapes.add_textbox(left + Inches(0.16), top + Inches(0.12), width - Inches(0.32), height - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p_title = tf.paragraphs[0]
    p_title.text = f"💡  {title.upper()}"
    p_title.font.name = FONT_HEADING
    p_title.font.size = Pt(8.5)
    p_title.font.bold = True
    p_title.font.color.rgb = CALLOUT_TEXT
    p_title.space_after = Pt(2)

    p_body = tf.add_paragraph()
    p_body.text = body_text
    p_body.font.name = FONT_BODY
    p_body.font.size = Pt(8.5)
    p_body.font.color.rgb = CALLOUT_TEXT

def add_image_proportional(slide, image_path, left, top, max_width, max_height):
    if not os.path.exists(image_path):
        print(f"Warning: image {image_path} not found.")
        return None
    
    with Image.open(image_path) as im:
        img_w, img_h = im.size
    
    aspect = img_w / img_h
    box_aspect = max_width / max_height

    if aspect > box_aspect:
        render_w = max_width
        render_h = max_width / aspect
        render_left = left
        render_top = top + (max_height - render_h) / 2
    else:
        render_h = max_height
        render_w = max_height * aspect
        render_top = top
        render_left = left + (max_width - render_w) / 2

    pic = slide.shapes.add_picture(image_path, render_left, render_top, width=render_w, height=render_h)
    return pic

def set_speaker_notes(slide, notes_text):
    notes_slide = slide.notes_slide
    text_frame = notes_slide.notes_text_frame
    text_frame.text = notes_text

# ==============================================================================
# SLIDE 0: TITLE COVER SLIDE
# ==============================================================================
slide0 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide0)

top_line = slide0.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
top_line.fill.solid()
top_line.fill.fore_color.rgb = BRAND_RED
top_line.line.fill.background()

tb_badge = slide0.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.3), Inches(0.4))
tf_badge = tb_badge.text_frame
tf_badge.margin_left = tf_badge.margin_top = 0
p = tf_badge.paragraphs[0]
p.text = "PRODUCT OVERVIEW, TECHNICAL ARCHITECTURE & STRATEGIC ROADMAP"
p.font.name = FONT_HEADING
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = BRAND_RED

tb_title = slide0.shapes.add_textbox(Inches(1.0), Inches(1.65), Inches(11.3), Inches(1.8))
tf_title = tb_title.text_frame
tf_title.word_wrap = True
tf_title.margin_left = tf_title.margin_top = 0

p1 = tf_title.paragraphs[0]
p1.text = "THE GRDX"
p1.font.name = FONT_HEADING
p1.font.size = Pt(44)
p1.font.bold = True
p1.font.color.rgb = TEXT_TITLE
p1.space_after = Pt(4)

p2 = tf_title.add_paragraph()
p2.text = "F1 Prediction & Community Platform"
p2.font.name = FONT_HEADING
p2.font.size = Pt(22)
p2.font.bold = True
p2.font.color.rgb = BRAND_ORANGE
p2.space_after = Pt(8)

p3 = tf_title.add_paragraph()
p3.text = "The problem → The product → How it works → How it is built → How it protects data → Where it is going → What it looks like."
p3.font.name = FONT_BODY
p3.font.size = Pt(12)
p3.font.italic = True
p3.font.color.rgb = TEXT_SUBTITLE

pillars = [
    ("THE PRODUCT", "Motorsport Engagement", "Turn every Grand Prix weekend into an interactive fan experience with session-aware predictions.", BRAND_RED),
    ("ARCHITECTURE", "Lightweight & Serverless", "React 19 + TypeScript SPA on GitHub Pages Edge CDN backed by Google Apps Script V8.", ACCENT_BLUE),
    ("DATA INTEGRITY", "Structured Cloud Records", "15 relational worksheets on Google Sheets with LockService mutex & CacheService RAM caching.", ACCENT_GREEN),
    ("PRODUCT VISION", "Community & Future Scale", "Three-phase expansion from core prediction reliability to rich analytics and social leagues.", ACCENT_PURPLE),
]

card_w = Inches(2.68)
card_h = Inches(2.2)
gap = Inches(0.2)
start_x = Inches(1.0)
start_y = Inches(3.9)

for i, (tag, heading, desc, col) in enumerate(pillars):
    cx = start_x + i * (card_w + gap)
    card = slide0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, start_y, card_w, card_h)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD
    card.line.color.rgb = BORDER_COLOR
    card.line.width = Pt(1)

    c_bar = slide0.shapes.add_shape(MSO_SHAPE.RECTANGLE, cx + Inches(0.02), start_y + Inches(0.02), card_w - Inches(0.04), Inches(0.06))
    c_bar.fill.solid()
    c_bar.fill.fore_color.rgb = col
    c_bar.line.fill.background()

    tb = slide0.shapes.add_textbox(cx + Inches(0.18), start_y + Inches(0.2), card_w - Inches(0.36), card_h - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p_tag = tf.paragraphs[0]
    p_tag.text = tag
    p_tag.font.name = FONT_HEADING
    p_tag.font.size = Pt(8.5)
    p_tag.font.bold = True
    p_tag.font.color.rgb = col
    p_tag.space_after = Pt(4)

    p_h = tf.add_paragraph()
    p_h.text = heading
    p_h.font.name = FONT_HEADING
    p_h.font.size = Pt(11)
    p_h.font.bold = True
    p_h.font.color.rgb = TEXT_TITLE
    p_h.space_after = Pt(4)

    p_d = tf.add_paragraph()
    p_d.text = desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(9)
    p_d.font.color.rgb = TEXT_BODY

tb_meta = slide0.shapes.add_textbox(Inches(1.0), Inches(6.6), Inches(11.3), Inches(0.4))
tf_meta = tb_meta.text_frame
tf_meta.margin_left = tf_meta.margin_top = 0
p = tf_meta.paragraphs[0]
p.text = "THE GRDX PRESENTATION  |  12 COMPREHENSIVE SLIDES  |  LIGHT PROFESSIONAL EXECUTIVE THEME"
p.font.name = FONT_BODY
p.font.size = Pt(9)
p.font.bold = True
p.font.color.rgb = TEXT_MUTED

set_speaker_notes(slide0, "Welcome to THE GRDX presentation. This deck tells the complete story of the platform: the problem it solves, how it works, how it is built, how it protects data, where it is headed, and what it looks like in live production.")

# ==============================================================================
# SLIDE 1: INTRODUCTION: WHAT IS THE GRDX?
# ==============================================================================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s1)
add_header(s1, "Product Introduction & Overview", "Slide 1 — Introduction: What Is THE GRDX?", "A motorsport-focused platform where Formula 1 fans make race predictions, follow race weekends, and compete with the community.")
add_footer(s1, 1, 12)

# Left Column: Problem & Product Cards
card_prob = add_card(s1, Inches(0.8), Inches(1.4), Inches(5.7), Inches(2.55), "The Problem It Solves", bg_color=BG_CARD)
tb_prob = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.3), Inches(2.0))
tf_prob = tb_prob.text_frame
tf_prob.word_wrap = True
tf_prob.margin_left = tf_prob.margin_top = 0
p_prob = tf_prob.paragraphs[0]
p_prob.text = "F1 fans often follow races through disparate, fragmented sources and share predictions informally across group chats or social media threads.\n\nThere is no dedicated, focused digital home that combines structured session-by-session predictions, live schedule countdowns, verified official results, and competitive community leaderboards in one cohesive experience."
p_prob.font.name = FONT_BODY
p_prob.font.size = Pt(9.5)
p_prob.font.color.rgb = TEXT_BODY

card_what = add_card(s1, Inches(0.8), Inches(4.15), Inches(5.7), Inches(2.65), "What THE GRDX Is & Target Audience", bg_color=BG_CARD)
tb_what = s1.shapes.add_textbox(Inches(1.0), Inches(4.55), Inches(5.3), Inches(2.1))
tf_what = tb_what.text_frame
tf_what.word_wrap = True
tf_what.margin_left = tf_what.margin_top = 0

items_what = [
    ("Motorsport Prediction Platform:", "Structured prediction rounds for Practice, Qualifying, Sprint, and Grand Prix."),
    ("Target Audience:", "Formula 1 fans, race-weekend prediction enthusiasts, and motorsport communities."),
    ("Core Aim:", "Make following F1 interactive by giving fans a measurable way to predict outcomes and track accuracy."),
    ("Vision:", "Build a focused digital home for F1 prediction, learning, and competitive community engagement."),
]
for i, (bt, rt) in enumerate(items_what):
    p = tf_what.paragraphs[0] if i == 0 else tf_what.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(4)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Right Column: Visual Preview Card & Key Message
card_vis = add_card(s1, Inches(6.8), Inches(1.4), Inches(5.733), Inches(3.9), "Live Platform Preview")
if os.path.exists("generated_screenshots/desktop_home.png"):
    add_image_proportional(s1, "generated_screenshots/desktop_home.png", Inches(6.95), Inches(1.8), Inches(5.433), Inches(3.35))

# Key Message Callout
add_callout(s1, Inches(6.8), Inches(5.45), Inches(5.733), Inches(1.35), "Key Product Message", "“Turn every Grand Prix weekend into an interactive experience.”\n\nNote: Present the problem and vision as the platform's intended purpose, rather than claiming market-wide results or user impact that hasn't been measured.")

set_speaker_notes(s1, "THE GRDX provides a motorsport-focused prediction and community experience. F1 fans often follow races through separate sources and discuss predictions informally. THE GRDX brings prediction participation, results, and competitive engagement into one dedicated experience.\n\nKey message: Turn every Grand Prix weekend into an interactive experience.")

# ==============================================================================
# SLIDE 2: SYSTEM ARCHITECTURE AT A GLANCE
# ==============================================================================
s2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s2)
add_header(s2, "System Architecture  |  C4 Container Topology", "Slide 2 — System Architecture at a Glance", "A lightweight web platform connects the user experience to server-side business logic, structured application data, and external services.")
add_footer(s2, 2, 12)

# Diagram card (Left)
add_card(s2, Inches(0.8), Inches(1.4), Inches(5.8), Inches(5.4), "C4 Container Diagram: Core Architecture")
add_image_proportional(s2, "generated_diagrams/slide_2_container_architecture.png", Inches(0.95), Inches(1.85), Inches(5.5), Inches(4.8))

# Right Column: Container Breakdown & Callout
card_arch = add_card(s2, Inches(6.8), Inches(1.4), Inches(5.733), Inches(4.0), "Architectural Tiers & Data Flow")
tb_arch = s2.shapes.add_textbox(Inches(6.95), Inches(1.8), Inches(5.433), Inches(3.4))
tf_arch = tb_arch.text_frame
tf_arch.word_wrap = True
tf_arch.margin_left = tf_arch.margin_top = 0

arch_flow = [
    ("User Experience Layer (Frontend):", "React 19 + TypeScript Single Page App (SPA) hosted on GitHub Pages Edge CDN. Provides instant client-side navigation via React Router 7 and persistent local caching."),
    ("Application Logic Engine (Backend):", "Google Apps Script running on Google Cloud Platform's V8 serverless runtime. Processes incoming HTTPS GET/POST JSON requests via doGet(e) and doPost(e) gateways."),
    ("Persistent Cloud Database (Data Tier):", "Google Sheets relational cloud database comprising 15 structured worksheets, providing automated version history, zero hosting cost, and direct data inspectability."),
    ("External Services & Integrations:", "Google Identity Services for cryptographic OAuth 2.0 user verification, Jolpica F1 API for motorsport telemetry, and Google MailApp for async transactional emails."),
]
for i, (bt, rt) in enumerate(arch_flow):
    p = tf_arch.paragraphs[0] if i == 0 else tf_arch.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(5)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

add_callout(s2, Inches(6.8), Inches(5.55), Inches(5.733), Inches(1.25), "Core Architectural Principle", "A lightweight web platform connects the user experience to server-side business logic, structured application data, and external services without needing expensive traditional database or application servers.")

set_speaker_notes(s2, "“The frontend is a static web application, while the backend runs in Apps Script. Google Sheets provides the main persistent data store, avoiding the need to operate a conventional application server and database server.”\n\nKey message: A lightweight web platform connects the user experience to server-side business logic, structured application data, and external services.")

# ==============================================================================
# SLIDE 3: CORE WORKFLOW: RACE WEEKEND AND PREDICTIONS
# ==============================================================================
s3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s3)
add_header(s3, "User Journey & Core Workflow", "Slide 3 — Core Workflow: Race Weekend and Predictions", "Predictions are organized around real race sessions rather than being isolated, free-form entries.")
add_footer(s3, 3, 12)

# Diagram card (Left)
add_card(s3, Inches(0.8), Inches(1.4), Inches(4.5), Inches(5.4), "Prediction Lifecycle Workflow")
add_image_proportional(s3, "generated_diagrams/slide_6_prediction_lifecycle.png", Inches(0.95), Inches(1.85), Inches(4.2), Inches(4.8))

# Right Column: Step-by-Step Workflow Cards
card_wf = add_card(s3, Inches(5.5), Inches(1.4), Inches(7.033), Inches(4.1), "Step-by-Step Prediction Lifecycle")
tb_wf = s3.shapes.add_textbox(Inches(5.7), Inches(1.8), Inches(6.633), Inches(3.5))
tf_wf = tb_wf.text_frame
tf_wf.word_wrap = True
tf_wf.margin_left = tf_wf.margin_top = 0

wf_steps = [
    ("1. Race Calendar & Session Discovery:", "Users browse official Grand Prix schedules with local timezone-adjusted countdowns for Practice, Qualifying, Sprint, and Race sessions."),
    ("2. Prediction Round Activation:", "Session-specific prediction rounds open for submissions with dedicated deadlines and custom track metadata."),
    ("3. Ballot Entry & Selection:", "Users enter predicted podium finishers (P1, P2, P3), Fastest Lap, Driver of the Day, and session wildcard challenges."),
    ("4. Server-Side Validation:", "Backend enforces strict validation: driver combination validity, input sanitization, and atomic deadline checks (5 min before session start)."),
    ("5. Atomic Persistence:", "Verified submissions are locked and written to Google Sheets via LockService mutex to prevent race conditions."),
    ("6. Official Result Scoring:", "Official FIA session results are ingested; automated scoring engine calculates points and refreshes community leaderboards."),
]
for i, (bt, rt) in enumerate(wf_steps):
    p = tf_wf.paragraphs[0] if i == 0 else tf_wf.add_paragraph()
    p.text = f"{bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = BRAND_RED
    p.space_after = Pt(4)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

add_callout(s3, Inches(5.5), Inches(5.65), Inches(7.033), Inches(1.15), "Key Workflow Insight", "Predictions are organized around real motorsport sessions rather than being isolated entries. Strict server-side deadlines ensure competitive integrity across global timezones.")

set_speaker_notes(s3, "Predictions are organized around race sessions rather than being isolated, free-form entries. Once a submission is accepted, the scoring process compares it with the official result and produces the points used in the leaderboard.")

# ==============================================================================
# SLIDE 4: BACKEND AND DATA ARCHITECTURE
# ==============================================================================
s4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s4)
add_header(s4, "Backend & Cloud Persistence  |  Google Apps Script & Sheets", "Slide 4 — Backend and Data Architecture", "The backend coordinates business rules, data persistence, and processing across the platform.")
add_footer(s4, 4, 12)

# Diagram card (Top)
add_card(s4, Inches(0.8), Inches(1.4), Inches(11.733), Inches(2.9), "Backend Request Routing & Application Services Topology")
add_image_proportional(s4, "generated_diagrams/slide_4_backend_component.png", Inches(0.95), Inches(1.8), Inches(11.433), Inches(2.4))

# Bottom Cards: Request Handling & Data Architecture
card_b_req = add_card(s4, Inches(0.8), Inches(4.45), Inches(5.7), Inches(2.35), "Serverless Request Gateway & Domain Services")
tb_br = s4.shapes.add_textbox(Inches(1.0), Inches(4.8), Inches(5.3), Inches(1.9))
tf_br = tb_br.text_frame
tf_br.word_wrap = True
tf_br.margin_left = tf_br.margin_top = 0

req_points = [
    ("Unified Request Dispatcher:", "doGet(e) processes high-speed read queries; doPost(e) routes JSON mutations to domain action handlers."),
    ("Specialized Domain Services:", "Dedicated modules for Identity, Prediction Validation, Scoring Engine, Calendar Sync, and Quiz Management."),
    ("LockService Mutex Protection:", "Distributed script lock (10s timeout) prevents write collisions during high-traffic cutoff windows."),
]
for i, (bt, rt) in enumerate(req_points):
    p = tf_br.paragraphs[0] if i == 0 else tf_br.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(3)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

card_b_data = add_card(s4, Inches(6.8), Inches(4.45), Inches(5.733), Inches(2.35), "15-Worksheet Relational Data Model")
tb_bd = s4.shapes.add_textbox(Inches(7.0), Inches(4.8), Inches(5.333), Inches(1.9))
tf_bd = tb_bd.text_frame
tf_bd.word_wrap = True
tf_bd.margin_left = tf_bd.margin_top = 0

data_points = [
    ("Relational Entity Hierarchy:", "Users connect to Predictions, Scores, Achievements, QuizAttempts, and NotificationQueue."),
    ("Race & Prediction Entities:", "RaceWeekends and Sessions schedule PredictionRounds; rounds record Predictions, official Results, and Scores."),
    ("Integrity Enforcement:", "Google Sheets acts as persistent storage; foreign-key constraints and unique lookups are strictly maintained in application code."),
]
for i, (bt, rt) in enumerate(data_points):
    p = tf_bd.paragraphs[0] if i == 0 else tf_bd.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(3)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

set_speaker_notes(s4, "“The backend coordinates business rules, data persistence, and processing across the platform. The backend is organized around an action-dispatch pattern rather than separate microservices. Its services execute inside the same Apps Script project.”")

# ==============================================================================
# SLIDE 5: SCORING AND COMPETITIVE WORKFLOW
# ==============================================================================
s5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s5)
add_header(s5, "Competitive Scoring Model", "Slide 5 — Scoring and Competitive Workflow", "How predictions become points: rewarding pinpoint accuracy, podium coverage, and session bonuses.")
add_footer(s5, 5, 12)

# Left Column: Scoring Table Card
card_sc = add_card(s5, Inches(0.8), Inches(1.4), Inches(6.6), Inches(5.4), "Official Documented Scoring Model")

table_shape_s5 = s5.shapes.add_table(9, 3, Inches(1.0), Inches(1.8), Inches(6.2), Inches(4.7))
t_s5 = table_shape_s5.table
t_s5.columns[0].width = Inches(2.3)
t_s5.columns[1].width = Inches(1.1)
t_s5.columns[2].width = Inches(2.8)

headers_s5 = ["Prediction Outcome", "Points", "Evaluation Criteria"]
rows_s5 = [
    ("Exact P1 Winner", "15 pts", "Selected driver finishes in 1st position"),
    ("Exact P2 Runner-Up", "10 pts", "Selected driver finishes in 2nd position"),
    ("Exact P3 Third Place", "10 pts", "Selected driver finishes in 3rd position"),
    ("Podium Driver (Wrong Position)", "5 pts", "Driver finishes on podium but different spot"),
    ("Perfect 1–2–3 Podium Bonus", "+10 pts", "Exact P1, P2, and P3 predicted simultaneously"),
    ("Fastest Lap (FL)", "10 pts", "Selected driver records official race fastest lap"),
    ("Driver of the Day (DOTD)", "10 pts", "Selected driver wins official broadcast fan vote"),
    ("Wildcard Session Challenge", "15 pts", "Correct prediction on session-specific wildcard"),
]

for col_idx, h_text in enumerate(headers_s5):
    cell = t_s5.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = TABLE_HEADER_BG
    p = cell.text_frame.paragraphs[0]
    p.text = h_text
    p.font.name = FONT_HEADING
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = BG_WHITE

for row_idx, r_data in enumerate(rows_s5):
    for col_idx, val in enumerate(r_data):
        cell = t_s5.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_WHITE if row_idx % 2 == 0 else TABLE_ROW_ALT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.bold = (col_idx == 0 or col_idx == 1)
        p.font.color.rgb = BRAND_RED if col_idx == 1 else TEXT_BODY

# Right Column: Progression & Competitive Rules
card_prog = add_card(s5, Inches(7.7), Inches(1.4), Inches(4.833), Inches(3.6), "Competitive Progression & Engine Rules")
tb_prog = s5.shapes.add_textbox(Inches(7.9), Inches(1.8), Inches(4.433), Inches(3.0))
tf_prog = tb_prog.text_frame
tf_prog.word_wrap = True
tf_prog.margin_left = tf_prog.margin_top = 0

prog_points = [
    ("Measurable Competition:", "Turns individual Grand Prix predictions into a competitive community leaderboard updated after every session."),
    ("Tiered Bonus System:", "Balanced weighting rewards exact position insight while giving partial credit for podium presence and race-day feats."),
    ("Automated Ingestion:", "Official results feed the scoring process automatically; scores aggregate into seasonal championship totals."),
    ("Achievement Milestones:", "Special achievements and badges unlocked based on prediction streaks, perfect podiums, and trivia accuracy."),
]
for i, (bt, rt) in enumerate(prog_points):
    p = tf_prog.paragraphs[0] if i == 0 else tf_prog.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(5)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

add_callout(s5, Inches(7.7), Inches(5.15), Inches(4.833), Inches(1.65), "Scoring Integrity Checkpoint", "Treat these as documented scoring values subject to backend/Code.gs verification. Server-side idempotency keys prevent duplicate scoring calculation rows upon multiple result sync events.")

set_speaker_notes(s5, "“The scoring system turns individual race predictions into a measurable competitive experience. A prediction is tied to a specific session and round. Once a submission is accepted, the scoring process compares it with the official result and produces the points used in the leaderboard.”")

# ==============================================================================
# SLIDE 6: FEATURES AND PLATFORM CAPABILITIES
# ==============================================================================
s6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s6)
add_header(s6, "Product Capabilities & Feature Map", "Slide 6 — Features and Platform Capabilities", "THE GRDX combines race information, prediction, competition, and engagement in one focused experience.")
add_footer(s6, 6, 12)

feature_groups = [
    ("RACE WEEKEND", BRAND_RED, [
        ("Session Schedules & Clocks", "Practice, Qualifying, Sprint, and Grand Prix local time countdowns."),
        ("Dynamic Circuit Visuals", "Authentic SVG track layouts with sector and DRS zone info."),
        ("Session Round Activation", "Prediction rounds tied to specific weekend sessions."),
        ("Telemetry & Context", "Weather forecasts, historical circuit winners, and track length."),
    ]),
    ("COMPETITION", ACCENT_BLUE, [
        ("Prediction Form Engine", "Intuitive ballot for podium picks, fastest lap, and DOTD."),
        ("Automated Point Tallies", "Transparent rule-based scoring calculated instantly."),
        ("Live Community Leaderboards", "Global rankings, seasonal ladders, and event standings."),
        ("Achievement Badges", "Unlockable trophies celebrating milestones and streaks."),
    ]),
    ("LEARNING & ENGAGEMENT", ACCENT_GREEN, [
        ("Motorsport Trivia Engine", "Categorized F1 quizzes testing technical and historical trivia."),
        ("Difficulty Tiers", "Rookie, Enthusiast, and Strategist difficulty levels."),
        ("Championship Exploration", "Circuit guides and junior feeder championship overviews."),
        ("Universal Search (Ctrl+K)", "Quick search modal across circuits, drivers, and rounds."),
    ]),
    ("PERSONAL EXPERIENCE", ACCENT_PURPLE, [
        ("User Profiles & Avatars", "Personalized fan profiles displaying rank and trophies."),
        ("Participation History", "Review past submitted ballots and point breakdowns."),
        ("Transactional Notifications", "Email confirmations and race result point summaries."),
        ("Notification Preferences", "Configurable reminder alerts for upcoming session cutoffs."),
    ]),
]

fg_w = Inches(2.7)
fg_h = Inches(4.0)
fg_gap = Inches(0.24)
fg_start = Inches(0.8)

for i, (grp_name, grp_col, grp_items) in enumerate(feature_groups):
    cur_x = fg_start + i * (fg_w + fg_gap)
    card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cur_x, Inches(1.4), fg_w, fg_h)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD
    card.line.color.rgb = BORDER_COLOR
    card.line.width = Pt(1)

    strip = s6.shapes.add_shape(MSO_SHAPE.RECTANGLE, cur_x + Inches(0.02), Inches(1.42), fg_w - Inches(0.04), Inches(0.08))
    strip.fill.solid()
    strip.fill.fore_color.rgb = grp_col
    strip.line.fill.background()

    tb = s6.shapes.add_textbox(cur_x + Inches(0.18), Inches(1.6), fg_w - Inches(0.36), fg_h - Inches(0.35))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p_t = tf.paragraphs[0]
    p_t.text = grp_name
    p_t.font.name = FONT_HEADING
    p_t.font.size = Pt(10)
    p_t.font.bold = True
    p_t.font.color.rgb = grp_col
    p_t.space_after = Pt(10)

    for bt, rt in grp_items:
        p = tf.add_paragraph()
        p.text = f"• {bt}: "
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_TITLE
        p.space_after = Pt(6)

        run = p.add_run()
        run.text = rt
        run.font.bold = False
        run.font.color.rgb = TEXT_BODY

add_callout(s6, Inches(0.8), Inches(5.55), Inches(11.733), Inches(1.25), "Platform Feature Scope", "THE GRDX combines race information, prediction, competition, and engagement in one focused experience. All features depicted above represent implemented functionality in the active repository.")

set_speaker_notes(s6, "“THE GRDX combines race information, prediction, competition, and engagement in one focused experience. Organizing capabilities into four clear groups helps users understand the full breadth of the product.”")

# ==============================================================================
# SLIDE 7: TECHNOLOGY STACK
# ==============================================================================
s7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s7)
add_header(s7, "Technology & Engineering Stack", "Slide 7 — Technology Stack", "Built with a lightweight, serverless-oriented stack combining modern web frameworks and managed Google services.")
add_footer(s7, 7, 12)

# Left Column: Layered Tech Stack Table
card_tech = add_card(s7, Inches(0.8), Inches(1.4), Inches(7.5), Inches(5.4), "Layered Technology Architecture")

table_shape_s7 = s7.shapes.add_table(6, 3, Inches(1.0), Inches(1.8), Inches(7.1), Inches(4.7))
t_s7 = table_shape_s7.table
t_s7.columns[0].width = Inches(1.5)
t_s7.columns[1].width = Inches(2.3)
t_s7.columns[2].width = Inches(3.3)

headers_s7 = ["Layer", "Technologies", "Role & Responsibility"]
rows_s7 = [
    ("Frontend Layer", "React 19, TypeScript, Vite, React Router 7", "User interface, client navigation, state contexts, and fast build tooling."),
    ("Backend Layer", "Google Apps Script V8 Serverless Engine", "doGet/doPost API request gateway and application domain logic."),
    ("Data Layer", "Google Sheets, CacheService, LocalStorage", "15 structured relational sheets, in-memory RAM cache, and browser cache."),
    ("Integrations Layer", "Google GIS, Jolpica F1 API, Google MailApp", "Cryptographic token auth, motorsport telemetry, and transactional HTML email."),
    ("Hosting & Delivery", "GitHub Pages Edge CDN, GitHub Actions", "Global edge static distribution and automated deploy.yml CI/CD workflows."),
]

for col_idx, h_text in enumerate(headers_s7):
    cell = t_s7.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = TABLE_HEADER_BG
    p = cell.text_frame.paragraphs[0]
    p.text = h_text
    p.font.name = FONT_HEADING
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = BG_WHITE

for row_idx, r_data in enumerate(rows_s7):
    for col_idx, val in enumerate(r_data):
        cell = t_s7.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_WHITE if row_idx % 2 == 0 else TABLE_ROW_ALT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.bold = (col_idx == 0)
        p.font.color.rgb = TEXT_TITLE if col_idx == 0 else TEXT_BODY

# Right Column: Engineering Rationale & Qualification Note
card_rat = add_card(s7, Inches(8.5), Inches(1.4), Inches(4.033), Inches(3.6), "Architectural Rationale")
tb_rat = s7.shapes.add_textbox(Inches(8.7), Inches(1.8), Inches(3.633), Inches(3.0))
tf_rat = tb_rat.text_frame
tf_rat.word_wrap = True
tf_rat.margin_left = tf_rat.margin_top = 0

rat_points = [
    ("Zero Infrastructure Cost:", "Static edge frontend combined with serverless Google backend eliminates cloud compute and database hosting expenses."),
    ("Rapid Development:", "Google Sheets provides transparent inspectability without requiring dedicated database management interfaces."),
    ("Type-Safe Frontend:", "React 19 + TypeScript catches contract violations at compile time before deployment."),
]
for i, (bt, rt) in enumerate(rat_points):
    p = tf_rat.paragraphs[0] if i == 0 else tf_rat.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(4)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

add_callout(s7, Inches(8.5), Inches(5.15), Inches(4.033), Inches(1.65), "Accuracy & Serverless Note", "Do not describe this as a generic serverless architecture without qualification: the backend runs specifically inside Google Apps Script V8, with execution limits (6 min timeout, daily email quotas).")

set_speaker_notes(s7, "“The platform uses familiar web technologies and managed Google services to keep infrastructure relatively lightweight. The backend runs specifically on Google Apps Script rather than conventional Node or container servers.”")

# ==============================================================================
# SLIDE 8: WHAT MAKES THE GRDX DIFFERENT?
# ==============================================================================
s8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s8)
add_header(s8, "Product Differentiation & Value Proposition", "Slide 8 — What Makes THE GRDX Different?", "Beyond a basic prediction website: making F1 prediction structured, immersive, and community-oriented.")
add_footer(s8, 8, 12)

differentiators = [
    ("F1-Focused Experience", "Designed specifically around Formula 1 race weekends, rather than being a generic betting or sports skin."),
    ("Session-Aware Predictions", "Predictions are organized by relevant sessions (Practice, Sprint, Quali, GP) with individual deadlines."),
    ("Circuit-Centered Identity", "Dynamic circuit SVG assets and track-specific telemetry connect prediction choices directly to real circuits."),
    ("Competitive Progression", "Rule-based scoring, global leaderboards, and tiered achievements give users measurable seasonal progression."),
    ("Multiple Engagement Modes", "Fans engage across predictions, motorsport trivia quizzes, and championship research in one platform."),
    ("Community-First Direction", "Built to foster friendly rivalry and shared excitement among friends and online motorsport communities."),
]

col_w8 = Inches(5.7)
row_h8 = Inches(1.6)
x_l8 = Inches(0.8)
x_r8 = Inches(6.833)
y_s8 = Inches(1.4)
y_g8 = Inches(0.2)

for idx, (d_title, d_desc) in enumerate(differentiators):
    col_idx = idx % 2
    row_idx = idx // 2
    cur_x = x_l8 if col_idx == 0 else x_r8
    cur_y = y_s8 + row_idx * (row_h8 + y_g8)

    card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cur_x, cur_y, col_w8, row_h8)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD
    card.line.color.rgb = BORDER_COLOR
    card.line.width = Pt(1)

    c_bar = s8.shapes.add_shape(MSO_SHAPE.RECTANGLE, cur_x + Inches(0.02), cur_y + Inches(0.02), col_w8 - Inches(0.04), Inches(0.05))
    c_bar.fill.solid()
    c_bar.fill.fore_color.rgb = BRAND_RED if col_idx == 0 else ACCENT_BLUE
    c_bar.line.fill.background()

    tb = s8.shapes.add_textbox(cur_x + Inches(0.2), cur_y + Inches(0.16), col_w8 - Inches(0.4), row_h8 - Inches(0.25))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p_t = tf.paragraphs[0]
    p_t.text = d_title
    p_t.font.name = FONT_HEADING
    p_t.font.size = Pt(11)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_TITLE
    p_t.space_after = Pt(4)

    p_d = tf.add_paragraph()
    p_d.text = d_desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(9)
    p_d.font.color.rgb = TEXT_BODY

add_callout(s8, Inches(0.8), Inches(5.65), Inches(11.733), Inches(1.15), "Product Positioning Note", "The goal is to make F1 prediction more structured, immersive, and community-oriented. Avoid claiming these capabilities are unique across the entire market unless comparative empirical research supports it.")

set_speaker_notes(s8, "“The goal is to make F1 prediction more structured, immersive, and community-oriented. We focus on session awareness, circuit identity, and community competition rather than generic odds or gambling.”")

# ==============================================================================
# SLIDE 9: PRODUCT VISION AND FUTURE ROADMAP
# ==============================================================================
s9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s9)
add_header(s9, "Strategic Roadmap & Product Vision", "Slide 9 — Product Vision and Future Roadmap", "Build a reliable prediction platform first, deepen user engagement next, and expand into a richer F1 community experience over time.")
add_footer(s9, 9, 12)

phases = [
    ("PHASE 1 — FOUNDATION", "Reliability & Core Experience (In Progress)", ACCENT_GREEN, [
        ("End-to-End Verification", "Verify prediction submission, deadline locks, and scoring."),
        ("Resilient Fallbacks", "Improve handling of unavailable upstream APIs and stale data."),
        ("Calendar Consistency", "Strengthen sync across race sessions, results, and boards."),
        ("Multi-Device UX", "Refine responsive desktop and mobile experiences."),
    ]),
    ("PHASE 2 — ENGAGEMENT", "Community & Competition (Planned)", ACCENT_AMBER, [
        ("Tiered Achievements", "Season-long progression milestones and badge showcases."),
        ("Expanded Quiz Engine", "Deeper trivia categories and interactive knowledge activities."),
        ("Smart Notifications", "User-configurable race-weekend alerts and result digests."),
        ("Private Community Leagues", "Custom leagues for friends and motorsport clubs."),
    ]),
    ("PHASE 3 — LONG-TERM VISION", "Complete Community Hub (Proposed)", ACCENT_PURPLE, [
        ("Race & Circuit Analytics", "Rich telemetry, sector trends, and circuit insights."),
        ("Predictive Accuracy Insights", "Historical user performance metrics and prediction analytics."),
        ("Social Participation Tools", "Live race-weekend discussion and community reactions."),
        ("High-Scale Architecture", "Evaluate caching and indexing as community grows."),
    ]),
]

p_w = Inches(3.64)
p_h = Inches(5.4)
p_gap = Inches(0.35)
p_start = Inches(0.8)

for i, (p_title, p_sub, p_col, p_items) in enumerate(phases):
    cur_x = p_start + i * (p_w + p_gap)
    card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cur_x, Inches(1.4), p_w, p_h)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD
    card.line.color.rgb = BORDER_COLOR
    card.line.width = Pt(1)

    strip = s9.shapes.add_shape(MSO_SHAPE.RECTANGLE, cur_x + Inches(0.02), Inches(1.42), p_w - Inches(0.04), Inches(0.08))
    strip.fill.solid()
    strip.fill.fore_color.rgb = p_col
    strip.line.fill.background()

    tb = s9.shapes.add_textbox(cur_x + Inches(0.2), Inches(1.6), p_w - Inches(0.4), p_h - Inches(0.35))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p_t = tf.paragraphs[0]
    p_t.text = p_title
    p_t.font.name = FONT_HEADING
    p_t.font.size = Pt(10)
    p_t.font.bold = True
    p_t.font.color.rgb = p_col
    p_t.space_after = Pt(2)

    p_s = tf.add_paragraph()
    p_s.text = p_sub
    p_s.font.name = FONT_BODY
    p_s.font.size = Pt(8.5)
    p_s.font.color.rgb = TEXT_SUBTITLE
    p_s.space_after = Pt(12)

    for bt, rt in p_items:
        p = tf.add_paragraph()
        p.text = f"• {bt}: "
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_TITLE
        p.space_after = Pt(8)

        run = p.add_run()
        run.text = rt
        run.font.bold = False
        run.font.color.rgb = TEXT_BODY

set_speaker_notes(s9, "“Build a reliable prediction platform first, deepen user engagement next, and expand into a richer F1 community experience over time. Each roadmap item is realistically categorized as in-progress, planned, or proposed.”")

# ==============================================================================
# SLIDE 10: SECURITY, PRIVACY, AND DATA INTEGRITY
# ==============================================================================
s10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s10)
add_header(s10, "Security & Trust Controls", "Slide 10 — Security, Privacy, and Data Integrity", "Security depends on backend enforcement and data-integrity controls, not just the authentication interface.")
add_footer(s10, 10, 12)

# Diagram card (Top)
add_card(s10, Inches(0.8), Inches(1.4), Inches(11.733), Inches(2.9), "Security & Integrity Flowchart")
add_image_proportional(s10, "generated_diagrams/slide_7_auth_security.png", Inches(0.95), Inches(1.8), Inches(11.433), Inches(2.4))

# Bottom Cards: 4 Security Areas
sec_cards = [
    ("Zero-Trust Authentication", [
        ("Server Verification", "Token validated via Google UserInfo API."),
        ("Immutable sub Anchor", "Account bound to Google Subject ID."),
    ]),
    ("Role-Based Access Control", [
        ("Server-Side Roles", "Privileged actions require verified 'admin' role."),
        ("Operation Validation", "Admin tools enforce server checks on every call."),
    ]),
    ("Prediction Integrity", [
        ("Server-Clock Deadlines", "Submissions cutoff 5 min prior to session."),
        ("LockService Mutex", "Serializes writes to eliminate race conditions."),
    ]),
    ("Data Privacy & Notifications", [
        ("Token Redaction", "Auth secrets omitted from public endpoints."),
        ("Idempotent Worker", "Deduplication checks prevent duplicate emails."),
    ]),
]

sc_w = Inches(2.7)
sc_h = Inches(2.35)
sc_gap = Inches(0.24)
sc_start = Inches(0.8)

for i, (sc_title, sc_bullets) in enumerate(sec_cards):
    cur_x = sc_start + i * (sc_w + sc_gap)
    card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cur_x, Inches(4.45), sc_w, sc_h)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD
    card.line.color.rgb = BORDER_COLOR
    card.line.width = Pt(1)

    tb = s10.shapes.add_textbox(cur_x + Inches(0.16), Inches(4.6), sc_w - Inches(0.32), sc_h - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p_t = tf.paragraphs[0]
    p_t.text = sc_title.upper()
    p_t.font.name = FONT_HEADING
    p_t.font.size = Pt(9)
    p_t.font.bold = True
    p_t.font.color.rgb = BRAND_RED
    p_t.space_after = Pt(8)

    for bt, rt in sc_bullets:
        p = tf.add_paragraph()
        p.text = f"• {bt}: "
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_TITLE
        p.space_after = Pt(4)

        run = p.add_run()
        run.text = rt
        run.font.bold = False
        run.font.color.rgb = TEXT_BODY

set_speaker_notes(s10, "“Security depends on backend enforcement and data-integrity controls, not just the authentication interface. We enforce token verification, role checks, and deadline enforcement on the server.”")

# ==============================================================================
# SLIDE 11: PRODUCT SHOWCASE: DESKTOP EXPERIENCE
# ==============================================================================
s11 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s11)
add_header(s11, "Product Showcase  |  User Experience", "Slide 11 — Product Showcase: Desktop Experience", "Demonstrating how the underlying architecture translates into a usable, cohesive, and modern web application.")
add_footer(s11, 11, 12)

# Left Large Dominant Screenshot Card: Desktop Homepage
card_d_home = add_card(s11, Inches(0.8), Inches(1.4), Inches(7.5), Inches(5.4), "Desktop Homepage & Hero Dashboard")
if os.path.exists("generated_screenshots/desktop_home.png"):
    add_image_proportional(s11, "generated_screenshots/desktop_home.png", Inches(0.95), Inches(1.85), Inches(7.2), Inches(4.8))

# Right Top Card: Prediction Hub
card_d_pred = add_card(s11, Inches(8.5), Inches(1.4), Inches(4.033), Inches(2.6), "Predictions Hub Interface")
if os.path.exists("generated_screenshots/desktop_predictions.png"):
    add_image_proportional(s11, "generated_screenshots/desktop_predictions.png", Inches(8.6), Inches(1.8), Inches(3.833), Inches(2.1))

# Right Bottom Card: Leaderboard / Calendar
card_d_lead = add_card(s11, Inches(8.5), Inches(4.15), Inches(4.033), Inches(2.65), "Community Leaderboard & Standings")
if os.path.exists("generated_screenshots/desktop_leaderboard.png"):
    add_image_proportional(s11, "generated_screenshots/desktop_leaderboard.png", Inches(8.6), Inches(4.55), Inches(3.833), Inches(2.15))

set_speaker_notes(s11, "“Actual production screenshots of the running desktop application: The left shows the main dashboard and session countdown; the top-right shows the Prediction Hub; the bottom-right shows the live community leaderboard.”")

# ==============================================================================
# SLIDE 12: PRODUCT SHOWCASE: MOBILE EXPERIENCE
# ==============================================================================
s12 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s12)
add_header(s12, "Product Showcase  |  Responsive Mobile Experience", "Slide 12 — Product Showcase: Mobile Experience", "Demonstrating how users access the prediction experience and key platform features on mobile screens.")
add_footer(s12, 12, 12)

# 3 Mobile Screens Side-by-Side in styled phone frame cards
mob_w = Inches(3.64)
mob_h = Inches(5.4)
mob_gap = Inches(0.35)
mob_start = Inches(0.8)

mobiles = [
    ("Mobile Homepage & Countdown", "generated_screenshots/mobile_home.png", "Responsive dashboard with race countdown & quick links."),
    ("Mobile Prediction Hub", "generated_screenshots/mobile_predictions.png", "Touch-friendly prediction rounds and driver selectors."),
    ("Mobile Leaderboard", "generated_screenshots/mobile_leaderboard.png", "Fast-loading community rankings and user points tally."),
]

for i, (m_title, m_img, m_desc) in enumerate(mobiles):
    cur_x = mob_start + i * (mob_w + mob_gap)
    card = add_card(s12, cur_x, Inches(1.4), mob_w, mob_h, m_title)
    
    if os.path.exists(m_img):
        add_image_proportional(s12, m_img, cur_x + Inches(0.15), Inches(1.85), mob_w - Inches(0.3), mob_h - Inches(0.95))

    tb = s12.shapes.add_textbox(cur_x + Inches(0.15), Inches(6.35), mob_w - Inches(0.3), Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = m_desc
    p.alignment = PP_ALIGN.CENTER
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_SUBTITLE

set_speaker_notes(s12, "“Demonstrate how users can access the prediction experience and key platform features on smaller screens. Actual mobile screenshots show responsive touch-friendly navigation, quick ballot entry, and leaderboard rankings.”")

# Save updated presentation
saved_files = []

# Primary filenames
targets = [
    os.path.abspath("THE_GRDX_Presentation.pptx"),
    os.path.abspath("docs/THE_GRDX_Presentation.pptx"),
    os.path.abspath("THE_GRDX_Product_and_Architecture.pptx"),
    os.path.abspath("docs/THE_GRDX_Product_and_Architecture.pptx"),
    os.path.abspath("THE_GRDX_Technical_Architecture.pptx"),
    os.path.abspath("docs/THE_GRDX_Technical_Architecture.pptx")
]

for target_path in targets:
    try:
        prs.save(target_path)
        saved_files.append(target_path)
        print(f"  -> Successfully saved: {target_path} ({os.path.getsize(target_path)} bytes)")
    except PermissionError:
        print(f"  -> Notice: {target_path} is currently open in another program (locked). Skipping.")
    except Exception as e:
        print(f"  -> Error saving {target_path}: {e}")

print("Presentation generation completed!")

