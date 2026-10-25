import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

# Initialize presentation with 16:9 widescreen dimensions
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette (Light Theme & Brand Identity)
BG_WHITE = RGBColor(255, 255, 255)
BG_CARD = RGBColor(248, 250, 252)       # Slate 50
BG_CARD_ALT = RGBColor(241, 245, 249)   # Slate 100
BORDER_COLOR = RGBColor(226, 232, 240)  # Slate 200
BORDER_DARK = RGBColor(203, 213, 225)   # Slate 300

TEXT_TITLE = RGBColor(15, 23, 42)       # Slate 900
TEXT_SUBTITLE = RGBColor(71, 85, 105)   # Slate 600
TEXT_BODY = RGBColor(51, 65, 85)        # Slate 700
TEXT_MUTED = RGBColor(148, 163, 184)    # Slate 400

BRAND_RED = RGBColor(225, 6, 0)         # F1 Racing Red
BRAND_ORANGE = RGBColor(235, 87, 34)    # GRDX Flame Orange
ACCENT_BLUE = RGBColor(37, 99, 235)     # Blue 600
ACCENT_GREEN = RGBColor(22, 163, 74)    # Green 600
ACCENT_AMBER = RGBColor(217, 119, 6)    # Amber 600
ACCENT_PURPLE = RGBColor(147, 51, 234)  # Purple 600

CALLOUT_BG = RGBColor(255, 251, 235)    # Amber 50
CALLOUT_BORDER = RGBColor(245, 158, 11) # Amber 500
CALLOUT_TEXT = RGBColor(120, 53, 15)    # Amber 900

TABLE_HEADER_BG = RGBColor(30, 41, 59)  # Slate 800
TABLE_ROW_ALT = RGBColor(248, 250, 252) # Slate 50

FONT_HEADING = "Segoe UI"
FONT_BODY = "Segoe UI"

def set_slide_background(slide):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_WHITE
    bg.line.fill.background()
    return bg

def add_header(slide, breadcrumb, title, subtitle):
    # Top racing accent line
    top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.08))
    top_line.fill.solid()
    top_line.fill.fore_color.rgb = BRAND_RED
    top_line.line.fill.background()

    # Header text box
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.25), Inches(11.733), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    # Breadcrumb
    p_bc = tf.paragraphs[0]
    p_bc.text = breadcrumb.upper()
    p_bc.font.name = FONT_HEADING
    p_bc.font.size = Pt(8.5)
    p_bc.font.bold = True
    p_bc.font.color.rgb = BRAND_RED
    p_bc.space_after = Pt(2)

    # Title
    p_title = tf.add_paragraph()
    p_title.text = title
    p_title.font.name = FONT_HEADING
    p_title.font.size = Pt(20)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_TITLE
    p_title.space_after = Pt(2)

    # Subtitle / Purpose
    p_sub = tf.add_paragraph()
    p_sub.text = subtitle
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(10.5)
    p_sub.font.color.rgb = TEXT_SUBTITLE

    # Header separator
    sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.22), Inches(11.733), Inches(0.015))
    sep.fill.solid()
    sep.fill.fore_color.rgb = BORDER_COLOR
    sep.line.fill.background()

def add_footer(slide, slide_num, total_slides=10):
    # Footer separator
    sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.015))
    sep.fill.solid()
    sep.fill.fore_color.rgb = BORDER_COLOR
    sep.line.fill.background()

    # Footer text box
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(7.12), Inches(11.733), Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = f"THE GRDX — Motorsport Prediction & Community Platform  |  Technical Architecture Specification"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_MUTED

    # Page number on the right
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
        p.font.size = Pt(9.5)
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
    p_title.text = f"⚠️  {title.upper()}"
    p_title.font.name = FONT_HEADING
    p_title.font.size = Pt(8.5)
    p_title.font.bold = True
    p_title.font.color.rgb = CALLOUT_TEXT
    p_title.space_after = Pt(3)

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
        # Constrained by width
        render_w = max_width
        render_h = max_width / aspect
        render_left = left
        render_top = top + (max_height - render_h) / 2
    else:
        # Constrained by height
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

# ==========================================
# SLIDE 0: TITLE SLIDE (COVER)
# ==========================================
slide0 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide0)

# Top accent bar
top_line = slide0.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
top_line.fill.solid()
top_line.fill.fore_color.rgb = BRAND_RED
top_line.line.fill.background()

# Pre-title badge
tb_badge = slide0.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.3), Inches(0.4))
tf_badge = tb_badge.text_frame
tf_badge.margin_left = tf_badge.margin_top = 0
p = tf_badge.paragraphs[0]
p.text = "TECHNICAL ARCHITECTURE BLUEPRINT  |  PRODUCTION SPECIFICATION V2"
p.font.name = FONT_HEADING
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = BRAND_RED

# Main Title & Subtitle
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
p2.text = "Complete Technical Architecture Presentation"
p2.font.name = FONT_HEADING
p2.font.size = Pt(22)
p2.font.bold = True
p2.font.color.rgb = BRAND_ORANGE
p2.space_after = Pt(8)

p3 = tf_title.add_paragraph()
p3.text = "Comprehensive C4 architectural model, container topology, domain services, relational data model, and production engineering considerations for the next-generation motorsport prediction platform."
p3.font.name = FONT_BODY
p3.font.size = Pt(12)
p3.font.color.rgb = TEXT_SUBTITLE

# Four Architecture Pillar Cards
pillars = [
    ("FRONTEND TIER", "React 19 + TypeScript SPA", "Vite build engine, React Router 7, Vanilla CSS design system, hosted on GitHub Pages Edge CDN.", ACCENT_BLUE),
    ("BACKEND ENGINE", "Google Apps Script V8", "doGet/doPost API gateway, LockService distributed mutex, CacheService RAM cache, and business services.", ACCENT_GREEN),
    ("PERSISTENT STORE", "Google Sheets Cloud DB", "15 structured worksheets, relational abstraction, automated version history, and audit logs.", ACCENT_PURPLE),
    ("ASYNC WORKERS", "Decoupled Notification Engine", "Time-driven queue processor, idempotency verification, exponential retries, and Google MailApp delivery.", ACCENT_AMBER),
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

    # Accent color top border on card
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

# Metadata footer
tb_meta = slide0.shapes.add_textbox(Inches(1.0), Inches(6.6), Inches(11.3), Inches(0.4))
tf_meta = tb_meta.text_frame
tf_meta.margin_left = tf_meta.margin_top = 0
p = tf_meta.paragraphs[0]
p.text = "THE GRDX TECHNICAL DECK  |  10 ARCHITECTURE BLUEPRINT SLIDES  |  CONFIDENTIAL & PROPRIETARY"
p.font.name = FONT_BODY
p.font.size = Pt(9)
p.font.bold = True
p.font.color.rgb = TEXT_MUTED

set_speaker_notes(slide0, "Welcome to THE GRDX Technical Architecture presentation. This deck presents the complete architecture blueprint following the C4 model, domain workflows, relational data modeling on Google Sheets, and engineering trade-offs.")

# ==========================================
# SLIDE 1: AGENDA & DECK STRUCTURE
# ==========================================
slide_agenda = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide_agenda)
add_header(slide_agenda, "Architecture Roadmap & Blueprint Overview", "Deck Structure & Presentation Agenda", "Ten-slide architecture narrative covering system topology, component architecture, data model, and engineering trade-offs.")
add_footer(slide_agenda, "Overview", 10)

agenda_items = [
    ("Slide 1", "System Context (C4 Level 1)", "System boundary, community members, administrators, and external integrations (GIS, Jolpica, MailApp)."),
    ("Slide 2", "Container Architecture (C4 Level 2)", "Major executable units, static edge hosting, serverless GCP V8 backend, and persistent data stores."),
    ("Slide 3", "Frontend Component Architecture (C4 Level 3)", "React Router navigation, AuthContext/AppContext, modular feature UI, and API facade with cache/fallback."),
    ("Slide 4", "Backend Component Architecture (C4 Level 3)", "Apps Script doGet/doPost action dispatcher, domain services, LockService mutex, and spreadsheet persistence."),
    ("Slide 5", "Data Model & Entity Relationships (ERD)", "15-worksheet relational abstraction, user identity mapping, prediction rounds, and scoring tables."),
    ("Slide 6", "Prediction Lifecycle & Scoring Engine", "End-to-end race round submission, server-side deadline checks, official result ingestion, and points calculation."),
    ("Slide 7", "Authentication, Authorization & Integrity", "Zero-trust Google GIS token verification, immutable Google 'sub' anchor, and server-side RBAC."),
    ("Slide 8", "Asynchronous Notification Architecture", "Decoupled NotificationQueue, scheduled background triggers, LockService mutex, and MailApp delivery."),
    ("Slide 9", "CI/CD, Hosting & Deployment", "GitHub Actions build pipeline, dynamic circuit generation, Vite bundling, and independent Apps Script releases."),
    ("Slide 10", "Reliability, Quotas & Trade-offs", "Apps Script quotas, execution timeouts, Google Sheets write contention, and production hardening."),
]

# 2 columns x 5 rows
col_w = Inches(5.7)
row_h = Inches(0.95)
x_left = Inches(0.8)
x_right = Inches(6.833)
y_start = Inches(1.45)
y_gap = Inches(0.12)

for idx, (s_num, s_title, s_desc) in enumerate(agenda_items):
    col_idx = idx // 5
    row_idx = idx % 5
    cur_x = x_left if col_idx == 0 else x_right
    cur_y = y_start + row_idx * (row_h + y_gap)

    card = slide_agenda.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cur_x, cur_y, col_w, row_h)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD
    card.line.color.rgb = BORDER_COLOR
    card.line.width = Pt(1)

    # Number badge
    nb = slide_agenda.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cur_x + Inches(0.15), cur_y + Inches(0.18), Inches(0.9), Inches(0.3))
    nb.fill.solid()
    nb.fill.fore_color.rgb = RGBColor(254, 242, 242) if col_idx == 0 else RGBColor(239, 246, 255)
    nb.line.color.rgb = RGBColor(254, 202, 202) if col_idx == 0 else RGBColor(191, 219, 254)
    nb.line.width = Pt(1)
    
    tf_nb = nb.text_frame
    tf_nb.margin_top = tf_nb.margin_bottom = 0
    p_nb = tf_nb.paragraphs[0]
    p_nb.text = s_num
    p_nb.alignment = PP_ALIGN.CENTER
    p_nb.font.name = FONT_HEADING
    p_nb.font.size = Pt(8.5)
    p_nb.font.bold = True
    p_nb.font.color.rgb = BRAND_RED if col_idx == 0 else ACCENT_BLUE

    # Content
    tb = slide_agenda.shapes.add_textbox(cur_x + Inches(1.15), cur_y + Inches(0.12), col_w - Inches(1.3), row_h - Inches(0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p_t = tf.paragraphs[0]
    p_t.text = s_title
    p_t.font.name = FONT_HEADING
    p_t.font.size = Pt(10.5)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_TITLE
    p_t.space_after = Pt(2)

    p_d = tf.add_paragraph()
    p_d.text = s_desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(8.5)
    p_d.font.color.rgb = TEXT_BODY

set_speaker_notes(slide_agenda, "Recommended presentation sequence: Slides 1-4 establish what the system is and how it is structured. Slides 5-8 cover data schemas and business workflows. Slides 9-10 cover deployment processes and engineering trade-offs.")

# ==========================================
# SLIDE 1 (DECK SLIDE 1): SYSTEM CONTEXT (C4 LEVEL 1)
# ==========================================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s1)
add_header(s1, "C4 Architecture Model  |  Level 1: Context", "Slide 1 — System Context (C4 Level 1)", "Purpose: Establish the system boundary and show the people and external services interacting with THE GRDX.")
add_footer(s1, 1, 10)

# Diagram card (Left/Top)
card_diag_s1 = add_card(s1, Inches(0.8), Inches(1.4), Inches(7.4), Inches(5.4), "System Context Topology Diagram")
add_image_proportional(s1, "generated_diagrams/slide_1_system_context.png", Inches(0.95), Inches(1.9), Inches(7.1), Inches(4.7))

# Right Column: Capabilities Card & Boundary Details
card_cap_s1 = add_card(s1, Inches(8.4), Inches(1.4), Inches(4.133), Inches(3.7), "Platform Boundary & Capabilities")
tb_cap_s1 = s1.shapes.add_textbox(Inches(8.55), Inches(1.85), Inches(3.833), Inches(3.1))
tf_cap_s1 = tb_cap_s1.text_frame
tf_cap_s1.word_wrap = True
tf_cap_s1.margin_left = tf_cap_s1.margin_top = 0

items_s1 = [
    ("Race-Weekend Predictions:", "Session-specific prediction rounds (Practice, Quali, Sprint, GP)."),
    ("Automated Scoring & Boards:", "Rule-based point tallies, live leaderboard calculations, and driver stats."),
    ("Motorsport Quizzes & Content:", "Gamified trivia engine, tiered difficulty categories, and learning badges."),
    ("User Profiles & Security:", "Cryptographic Google OAuth identity, avatar customization, and settings."),
    ("External Cloud Services:", "Google Identity Services (Auth), Jolpica F1 API (Data), Google MailApp (Email)."),
]

for i, (bold_txt, reg_txt) in enumerate(items_s1):
    p = tf_cap_s1.paragraphs[0] if i == 0 else tf_cap_s1.add_paragraph()
    p.text = f"• {bold_txt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(6)

    run = p.add_run()
    run.text = reg_txt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Validation Note Callout Card
add_callout(s1, Inches(8.4), Inches(5.25), Inches(4.133), Inches(1.55), "Validation Checkpoint", "The repository documents these integrations, but confirm that each is enabled and actively used in the current production deployment before describing it as a live dependency.")

set_speaker_notes(s1, "“THE GRDX provides a motorsport-focused prediction and community experience. This context view establishes the system boundary before we examine its internal architecture.”\n\nValidation note: The repository documents these integrations, but confirm that each is enabled and actively used in the current production deployment before describing it as a live dependency.")

# ==========================================
# SLIDE 2 (DECK SLIDE 2): CONTAINER ARCHITECTURE (C4 LEVEL 2)
# ==========================================
s2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s2)
add_header(s2, "C4 Architecture Model  |  Level 2: Containers", "Slide 2 — Container Architecture (C4 Level 2)", "Purpose: Show the major executable units, hosting locations, and data stores.")
add_footer(s2, 2, 10)

# Diagram card (Left)
add_card(s2, Inches(0.8), Inches(1.4), Inches(5.8), Inches(5.4), "Container & Runtime Topology")
add_image_proportional(s2, "generated_diagrams/slide_2_container_architecture.png", Inches(0.95), Inches(1.85), Inches(5.5), Inches(4.8))

# Right Column: Container Summary Table & Validation Note
card_table_s2 = add_card(s2, Inches(6.8), Inches(1.4), Inches(5.733), Inches(3.85), "Container Technology Summary")

# Create Table
table_shape = s2.shapes.add_table(7, 3, Inches(6.95), Inches(1.8), Inches(5.433), Inches(3.3))
table = table_shape.table
table.columns[0].width = Inches(1.3)
table.columns[1].width = Inches(1.7)
table.columns[2].width = Inches(2.433)

headers_s2 = ["Container", "Technology", "Responsibility"]
rows_s2 = [
    ("Frontend", "React 19, TypeScript, Vite", "UI, navigation, client cache, and user interactions."),
    ("Backend", "Google Apps Script V8", "doGet/doPost API gateway and application business logic."),
    ("Persistent Store", "Google Sheets (15 Worksheets)", "Structured application records and versioned database."),
    ("Browser Storage", "LocalStorage", "Client-side persistence, session tokens, and cached state."),
    ("Backend Cache", "CacheService (In-Memory RAM)", "Temporary cached calendar responses and speedups."),
    ("External Services", "GIS, Jolpica F1, MailApp", "OAuth identity, motorsport calendar, and email dispatch."),
]

for col_idx, h_text in enumerate(headers_s2):
    cell = table.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = TABLE_HEADER_BG
    p = cell.text_frame.paragraphs[0]
    p.text = h_text
    p.font.name = FONT_HEADING
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = BG_WHITE

for row_idx, r_data in enumerate(rows_s2):
    for col_idx, val in enumerate(r_data):
        cell = table.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_WHITE if row_idx % 2 == 0 else TABLE_ROW_ALT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(8)
        p.font.bold = (col_idx == 0)
        p.font.color.rgb = TEXT_TITLE if col_idx == 0 else TEXT_BODY

# Validation Note Callout Card
add_callout(s2, Inches(6.8), Inches(5.4), Inches(5.733), Inches(1.4), "Validation Checkpoint", "The exact request paths and whether every API action reaches the live backend must be checked against the frontend API client. The repository includes mock-data fallback behavior.")

set_speaker_notes(s2, "“The frontend is a static web application, while the backend runs in Apps Script. Google Sheets provides the main persistent data store, avoiding the need to operate a conventional application server and database server.”\n\nValidation note: The exact request paths and whether every API action reaches the live backend must be checked against the frontend API client. The repository includes mock-data fallback behavior.")

# ==========================================
# SLIDE 3 (DECK SLIDE 3): FRONTEND COMPONENT ARCHITECTURE (C4 LEVEL 3)
# ==========================================
s3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s3)
add_header(s3, "C4 Architecture Model  |  Level 3: Frontend", "Slide 3 — Frontend Component Architecture (C4 Level 3)", "Purpose: Explain how the frontend separates navigation, state, API communication, and feature modules.")
add_footer(s3, 3, 10)

# Diagram card (Left)
add_card(s3, Inches(0.8), Inches(1.4), Inches(5.8), Inches(5.4), "Frontend Component Interaction Map")
add_image_proportional(s3, "generated_diagrams/slide_3_frontend_component.png", Inches(0.95), Inches(1.85), Inches(5.5), Inches(4.8))

# Right Column: Architecture Details
card_fe = add_card(s3, Inches(6.8), Inches(1.4), Inches(5.733), Inches(3.85), "Modular Frontend Architecture")
tb_fe = s3.shapes.add_textbox(Inches(6.95), Inches(1.8), Inches(5.433), Inches(3.3))
tf_fe = tb_fe.text_frame
tf_fe.word_wrap = True
tf_fe.margin_left = tf_fe.margin_top = 0

fe_points = [
    ("Client-Side Routing (React Router 7):", "Declarative SPA route tree for predictions, leaderboards, quizzes, search, profiles, and administration."),
    ("Application State Management:", "AuthContext encapsulates Google Identity tokens & profile state; AppContext coordinates active rounds and global notifications."),
    ("Feature UI Modules:", "Self-contained feature views for race calendar sessions, interactive prediction entry, live scoreboards, and trivia quizzes."),
    ("API Client Facade (`apiClient.ts`):", "Centralizes frontend-to-backend communication, manages HTTP timeouts, and attaches bearer authorization."),
    ("Motorsport Normalization & Cache:", "Transforms third-party Jolpica payloads into normalized UI models with localStorage TTL caching."),
    ("Graceful Mock Fallback Engine:", "Transparently serves local fixtures during offline development or backend API rate limiting."),
]

for i, (b_txt, r_txt) in enumerate(fe_points):
    p = tf_fe.paragraphs[0] if i == 0 else tf_fe.add_paragraph()
    p.text = f"• {b_txt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(4)

    run = p.add_run()
    run.text = r_txt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Validation Note Callout Card
add_callout(s3, Inches(6.8), Inches(5.4), Inches(5.733), Inches(1.4), "Validation Checkpoint", "Treat these as architectural groupings, not necessarily the exact names of every component file. Confirm the actual imports and call relationships before drawing fine-grained module dependencies.")

set_speaker_notes(s3, "“The frontend is organized around feature UI, shared context, and a client-service layer. This separation keeps UI components from needing to manage every backend detail themselves.”\n\nValidation note: Treat these as architectural groupings, not necessarily the exact names of every component file. Confirm the actual imports and call relationships before drawing fine-grained module dependencies.")

# ==========================================
# SLIDE 4 (DECK SLIDE 4): BACKEND COMPONENT ARCHITECTURE (C4 LEVEL 3)
# ==========================================
s4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s4)
add_header(s4, "C4 Architecture Model  |  Level 3: Backend", "Slide 4 — Backend Component Architecture (C4 Level 3)", "Purpose: Show how API requests enter the backend and reach application services and storage.")
add_footer(s4, 4, 10)

# Diagram card (Top / Full width)
add_card(s4, Inches(0.8), Inches(1.4), Inches(11.733), Inches(3.0), "Backend Request Routing & Application Services Architecture")
add_image_proportional(s4, "generated_diagrams/slide_4_backend_component.png", Inches(0.95), Inches(1.8), Inches(11.433), Inches(2.5))

# Bottom Cards: 2 Columns of Backend Responsibilities + Validation Note
card_b1 = add_card(s4, Inches(0.8), Inches(4.55), Inches(3.8), Inches(2.25), "Gateway & Domain Services")
tb_b1 = s4.shapes.add_textbox(Inches(0.95), Inches(4.9), Inches(3.5), Inches(1.8))
tf_b1 = tb_b1.text_frame
tf_b1.word_wrap = True
tf_b1.margin_left = tf_b1.margin_top = 0

b1_points = [
    ("API Gateway:", "doGet(e) handles public queries; doPost(e) handles mutations."),
    ("Action Dispatcher:", "Single-point router delegating requests by action param."),
    ("Authentication Service:", "Validates Google GIS OAuth tokens with Google UserInfo API."),
    ("Quiz & Calendar Services:", "Syncs F1 schedule and serves categorized trivia questions."),
]
for i, (bt, rt) in enumerate(b1_points):
    p = tf_b1.paragraphs[0] if i == 0 else tf_b1.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(2)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

card_b2 = add_card(s4, Inches(4.75), Inches(4.55), Inches(3.8), Inches(2.25), "Data Integrity & Concurrency")
tb_b2 = s4.shapes.add_textbox(Inches(4.9), Inches(4.9), Inches(3.5), Inches(1.8))
tf_b2 = tb_b2.text_frame
tf_b2.word_wrap = True
tf_b2.margin_left = tf_b2.margin_top = 0

b2_points = [
    ("Deadline Validation:", "Enforces session cutoffs (5 min prior to session start)."),
    ("Scoring Engine:", "Compares user picks against official FIA race results."),
    ("LockService Mutex:", "Serializes concurrent mutations to prevent race conditions."),
    ("SpreadsheetApp Persistence:", "Structured worksheet read/write via Apps Script V8."),
]
for i, (bt, rt) in enumerate(b2_points):
    p = tf_b2.paragraphs[0] if i == 0 else tf_b2.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(2)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Validation Note Callout Card
add_callout(s4, Inches(8.7), Inches(4.55), Inches(3.833), Inches(2.25), "Validation Checkpoint", "This is a conceptual component map. In the final version, remove any arrow or component that cannot be traced to an actual handler or function in backend/Code.gs.\n\nApps Script executes in a single-threaded serverless instance per request; LockService is essential for multi-user integrity.")

set_speaker_notes(s4, "“The backend is organized around an action-dispatch pattern rather than a set of separately deployed microservices. Its services execute inside the same Apps Script project.”\n\nValidation note: This is a conceptual component map. In the final version, remove any arrow or component that cannot be traced to an actual handler or function in backend/Code.gs.")

# ==========================================
# SLIDE 5 (DECK SLIDE 5): DATA MODEL & ERD
# ==========================================
s5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s5)
add_header(s5, "Data Architecture  |  Relational Schema & Google Sheets DB", "Slide 5 — Data Model and Entity Relationship Diagram", "Purpose: Explain how users, race weekends, predictions, results, and scores relate across 15 worksheets.")
add_footer(s5, 5, 10)

# Diagram card (Left)
add_card(s5, Inches(0.8), Inches(1.4), Inches(6.8), Inches(5.4), "15-Worksheet Entity Relationship Model")
add_image_proportional(s5, "generated_diagrams/slide_5_data_model_erd.png", Inches(0.95), Inches(1.85), Inches(6.5), Inches(4.8))

# Right Column: Schema Explanation & Relational Notes
card_erd = add_card(s5, Inches(7.8), Inches(1.4), Inches(4.733), Inches(3.55), "Worksheet Entities & Relationships")
tb_erd = s5.shapes.add_textbox(Inches(7.95), Inches(1.8), Inches(4.433), Inches(3.0))
tf_erd = tb_erd.text_frame
tf_erd.word_wrap = True
tf_erd.margin_left = tf_erd.margin_top = 0

erd_items = [
    ("Users (Identity Anchor):", "Anchored by googleSubjectId (sub); maps to prediction submissions, total score aggregates, badges, and quiz attempts."),
    ("RaceWeekends & Sessions:", "Motorsport calendar hierarchy defining Grand Prix rounds, practice, sprint, and main race sessions."),
    ("PredictionRounds & Predictions:", "Binds active prediction opportunities to user picks and submission timestamps."),
    ("Results & Scores:", "Official FIA session outcomes mapped to computed points, powering event and seasonal leaderboards."),
    ("QuizCategories & Questions:", "Trivia question bank with difficulty tiers, completion logs, and quiz badges."),
    ("NotificationQueue & Log:", "Asynchronous email task queue with delivery timestamps and retry counters."),
]

for i, (bt, rt) in enumerate(erd_items):
    p = tf_erd.paragraphs[0] if i == 0 else tf_erd.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(2.5)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Validation Note Callout Card
add_callout(s5, Inches(7.8), Inches(5.1), Inches(4.733), Inches(1.7), "Important Architecture Checkpoint", "This is a conceptual ERD based on relationships described in docs/ARCHITECTURE.md. Google Sheets does not enforce relational foreign keys like a conventional SQL database. All referential integrity, uniqueness rules, and UUID lookups are enforced in application code. Verify exact sheet names against backend/SetupSheet.gs.")

set_speaker_notes(s5, "“The data model separates identity, race structure, prediction submissions, official results, scoring, and engagement features. This makes the business relationships easier to reason about even though the persistence layer is Google Sheets.”\n\nImportant: This is a conceptual ERD based on relationships described in docs/ARCHITECTURE.md. Verify the real worksheet names, key columns, uniqueness rules, and lookup logic in the code.")

# ==========================================
# SLIDE 6 (DECK SLIDE 6): PREDICTION LIFECYCLE & SCORING
# ==========================================
s6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s6)
add_header(s6, "Core Business Workflows  |  Prediction Engine", "Slide 6 — Prediction Lifecycle and Scoring Engine", "Purpose: Demonstrate the core business workflow, from opening a prediction round through calculating a user's score.")
add_footer(s6, 6, 10)

# Workflow Diagram (Left)
add_card(s6, Inches(0.8), Inches(1.4), Inches(4.5), Inches(5.4), "Prediction Lifecycle Workflow")
add_image_proportional(s6, "generated_diagrams/slide_6_prediction_lifecycle.png", Inches(0.95), Inches(1.85), Inches(4.2), Inches(4.8))

# Right Column: Scoring Model Table & Business Rules
card_score = add_card(s6, Inches(5.5), Inches(1.4), Inches(7.033), Inches(3.6), "Official Documented Scoring Model")

# Table
table_shape_s6 = s6.shapes.add_table(9, 3, Inches(5.65), Inches(1.75), Inches(6.733), Inches(3.1))
t_s6 = table_shape_s6.table
t_s6.columns[0].width = Inches(2.3)
t_s6.columns[1].width = Inches(1.1)
t_s6.columns[2].width = Inches(3.333)

headers_s6 = ["Prediction Outcome", "Points", "Evaluation Criteria"]
rows_s6 = [
    ("Exact P1 Winner", "15 pts", "Selected driver finishes in 1st position"),
    ("Exact P2 Runner-Up", "10 pts", "Selected driver finishes in 2nd position"),
    ("Exact P3 Third Place", "10 pts", "Selected driver finishes in 3rd position"),
    ("Podium Driver (Wrong Position)", "5 pts", "Driver finishes on podium (top 3) but wrong spot"),
    ("Perfect 1–2–3 Podium Bonus", "+10 pts", "Exact P1, P2, and P3 predicted simultaneously"),
    ("Fastest Lap (FL)", "10 pts", "Selected driver records official race fastest lap"),
    ("Driver of the Day (DOTD)", "10 pts", "Selected driver wins official fan voting"),
    ("Wildcard Session Challenge", "15 pts", "Correct prediction on session-specific wildcard question"),
]

for col_idx, h_text in enumerate(headers_s6):
    cell = t_s6.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = TABLE_HEADER_BG
    p = cell.text_frame.paragraphs[0]
    p.text = h_text
    p.font.name = FONT_HEADING
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = BG_WHITE

for row_idx, r_data in enumerate(rows_s6):
    for col_idx, val in enumerate(r_data):
        cell = t_s6.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_WHITE if row_idx % 2 == 0 else TABLE_ROW_ALT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(8)
        p.font.bold = (col_idx == 0 or col_idx == 1)
        p.font.color.rgb = BRAND_RED if col_idx == 1 else TEXT_BODY

# Business Rules & Validation Note
add_callout(s6, Inches(5.5), Inches(5.15), Inches(7.033), Inches(1.65), "Business Rules & Validation Checkpoint", "• Session Deadlines: Rounds close 5 minutes prior to official session start; strictly validated on the server.\n• Concurrency: LockService serializes simultaneous submissions during high-traffic cutoff windows.\n• Ingestion & Idempotency: Official race results trigger batch scoring; verify duplicate-scoring protections in backend/Code.gs.")

set_speaker_notes(s6, "“A prediction is tied to a specific session and round. Once a submission is accepted, the scoring process compares it with the official result and produces the points used in the leaderboard.”\n\nValidation note: Confirm the precise deadline calculation, update behavior for existing predictions, result-ingestion mechanism, and duplicate-scoring protection against the implementation.")

# ==========================================
# SLIDE 7 (DECK SLIDE 7): AUTHENTICATION & SECURITY
# ==========================================
s7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s7)
add_header(s7, "Security Architecture  |  Zero-Trust Identity & Access Control", "Slide 7 — Authentication, Authorization, and Data Integrity", "Purpose: Explain how identity, privileged access, and prediction integrity are handled.")
add_footer(s7, 7, 10)

# Diagram card (Top)
add_card(s7, Inches(0.8), Inches(1.4), Inches(11.733), Inches(2.9), "Authentication & Authorization Workflow")
add_image_proportional(s7, "generated_diagrams/slide_7_auth_security.png", Inches(0.95), Inches(1.8), Inches(11.433), Inches(2.4))

# Bottom Cards: 6 Security Controls in 2 columns + Validation Note
card_sec1 = add_card(s7, Inches(0.8), Inches(4.45), Inches(3.8), Inches(2.35), "Identity & Account Anchoring")
tb_s7_1 = s7.shapes.add_textbox(Inches(0.95), Inches(4.8), Inches(3.5), Inches(1.9))
tf_s7_1 = tb_s7_1.text_frame
tf_s7_1.word_wrap = True
tf_s7_1.margin_left = tf_s7_1.margin_top = 0

sec1_points = [
    ("Zero-Trust Verification:", "Browser identity claims are never trusted; backend verifies token directly with Google UserInfo API."),
    ("Immutable Google 'sub' Anchor:", "User record is permanently keyed to Google Subject ID, preventing account hijacking or duplicate profiles."),
    ("Session State & Tokens:", "Client maintains authenticated state via short-lived bearer tokens and encrypted local session cache."),
]
for i, (bt, rt) in enumerate(sec1_points):
    p = tf_s7_1.paragraphs[0] if i == 0 else tf_s7_1.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(2.5)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

card_sec2 = add_card(s7, Inches(4.75), Inches(4.45), Inches(3.8), Inches(2.35), "Authorization & Data Integrity")
tb_s7_2 = s7.shapes.add_textbox(Inches(4.9), Inches(4.8), Inches(3.5), Inches(1.9))
tf_s7_2 = tb_s7_2.text_frame
tf_s7_2.word_wrap = True
tf_s7_2.margin_left = tf_s7_2.margin_top = 0

sec2_points = [
    ("Server-Side RBAC:", "Privileged operations (calendar sync, score overrides, admin tools) require verified 'admin' role in Users table."),
    ("Server Deadline Enforcement:", "Submission timestamp verified against session cutoff on Apps Script server; ignores client clock."),
    ("Distributed Mutex (LockService):", "10-second script lock prevents race conditions during user registration and high-concurrency writes."),
]
for i, (bt, rt) in enumerate(sec2_points):
    p = tf_s7_2.paragraphs[0] if i == 0 else tf_s7_2.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(2.5)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Validation Note Callout Card
add_callout(s7, Inches(8.7), Inches(4.45), Inches(3.833), Inches(2.35), "Security Validation Checkpoint", "The repository describes both Google authentication and native credential-related flows. Do not label the system passwordless or Google-only without resolving that distinction in the actual implementation.\n\nAlso verify which API operations enforce roles server-side and ensure sensitive account tokens are redacted from public leaderboard responses.")

set_speaker_notes(s7, "“Security is not just a login screen. The backend must independently validate the caller, enforce permissions, and protect sensitive updates even if a client request is modified.”\n\nValidation note: The repository describes both Google authentication and native credential-related flows. Do not label the system passwordless or Google-only without resolving that distinction in the actual implementation.")

# ==========================================
# SLIDE 8 (DECK SLIDE 8): ASYNCHRONOUS EMAIL ARCHITECTURE
# ==========================================
s8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s8)
add_header(s8, "Asynchronous Workflows  |  Notification Infrastructure", "Slide 8 — Asynchronous Email Notification Architecture", "Purpose: Show how email delivery can be separated from the main user-facing request via background workers.")
add_footer(s8, 8, 10)

# Diagram card (Top)
add_card(s8, Inches(0.8), Inches(1.4), Inches(11.733), Inches(3.0), "Asynchronous Email Delivery Pipeline")
add_image_proportional(s8, "generated_diagrams/slide_8_async_email.png", Inches(0.95), Inches(1.8), Inches(11.433), Inches(2.5))

# Bottom Cards: Architecture Points + Validation Note
card_email = add_card(s8, Inches(0.8), Inches(4.55), Inches(7.5), Inches(2.25), "Notification Architecture & Operational Design")
tb_e = s8.shapes.add_textbox(Inches(0.95), Inches(4.9), Inches(7.2), Inches(1.8))
tf_e = tb_e.text_frame
tf_e.word_wrap = True
tf_e.margin_left = tf_e.margin_top = 0

email_points = [
    ("Decoupled Task Enqueue:", "Triggering events (account welcome, prediction receipts, scoring summaries) write a lightweight PENDING row to NotificationQueue without blocking user response."),
    ("Time-Driven Queue Worker:", "Scheduled Apps Script trigger runs periodically (every 5–10 min) executing `processNotificationQueue()` to drain pending dispatches in batches."),
    ("Distributed Processing Lock:", "Worker acquires `LockService.getScriptLock()` with a 10s timeout to prevent overlapping executions from sending duplicate emails."),
    ("Idempotency & Audit Trail:", "Checks NotificationLog before sending; successful dispatches transition to SENT, logging timestamps and message IDs."),
    ("Exponential Retries & Dead-Letter:", "Transient failures transition to retry queue with backoff; failures exceeding 3 attempts are marked as FAILED for manual review."),
]

for i, (bt, rt) in enumerate(email_points):
    p = tf_e.paragraphs[0] if i == 0 else tf_e.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(2)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Validation Note Callout Card
add_callout(s8, Inches(8.5), Inches(4.55), Inches(4.033), Inches(2.25), "Notification Validation Checkpoint", "The architecture documentation describes a maximum of three retries and a time-driven queue processor.\n\nConfirm those exact rules in the implementation before including the retry count in the final slide, and verify Google MailApp daily sending quotas (typically 100-1500 emails/day).")

set_speaker_notes(s8, "“Moving email delivery into a queue allows the platform to manage delivery independently of the original user action. Tracking and retrying failures can improve operational reliability, provided the queue's actual retry and idempotency logic is implemented correctly.”\n\nValidation note: Confirm the exact retry count and time-driven trigger rules in the code.")

# ==========================================
# SLIDE 9 (DECK SLIDE 9): CI/CD, HOSTING & DEPLOYMENT
# ==========================================
s9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s9)
add_header(s9, "DevOps & Infrastructure  |  Delivery Pipelines", "Slide 9 — CI/CD, Hosting, and Deployment", "Purpose: Explain how frontend changes become a deployed website and distinguish that process from backend deployment.")
add_footer(s9, 9, 10)

# Diagram card (Left)
add_card(s9, Inches(0.8), Inches(1.4), Inches(4.5), Inches(5.4), "CI/CD & Deployment Pipeline")
add_image_proportional(s9, "generated_diagrams/slide_9_deployment_cicd.png", Inches(0.95), Inches(1.85), Inches(4.2), Inches(4.8))

# Right Column: Deployment Boundaries & Operational Considerations
card_cicd1 = add_card(s9, Inches(5.5), Inches(1.4), Inches(7.033), Inches(3.6), "Deployment Pipelines & Operational Concerns")
tb_c1 = s9.shapes.add_textbox(Inches(5.65), Inches(1.8), Inches(6.733), Inches(3.1))
tf_c1 = tb_c1.text_frame
tf_c1.word_wrap = True
tf_c1.margin_left = tf_c1.margin_top = 0

cicd_points = [
    ("Automated Frontend CI/CD Pipeline (GitHub Actions):", "Defined in `.github/workflows/deploy.yml`. Triggered automatically on push to `main` branch. Executes end-to-end static build sequence."),
    ("Pre-Build Calendar & Circuit Generation:", "`npx tsx scripts/generate-calendar.ts` generates standardized race schedules and dynamic SVG circuit track layouts."),
    ("Strict TypeScript & Vite Compilation:", "Runs `tsc -b` for full project type checking followed by `vite build` to generate optimized production bundles."),
    ("Edge CDN Hosting (GitHub Pages):", "Pushes compiled `/dist` directory to `gh-pages` branch, serving users via GitHub Pages global CDN edge."),
    ("Independent Backend Deployment Boundary:", "Apps Script backend (`backend/Code.gs`) is an independent deployment. Publishing the frontend DOES NOT automatically update or deploy the live Apps Script backend version."),
    ("SPA Client-Side Routing Fallback:", "GitHub Pages requires a custom 404 redirection script (`404.html`) to preserve HTML5 client-side routes on refresh."),
]

for i, (bt, rt) in enumerate(cicd_points):
    p = tf_c1.paragraphs[0] if i == 0 else tf_c1.add_paragraph()
    p.text = f"• {bt} "
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_TITLE
    p.space_after = Pt(3.5)
    run = p.add_run()
    run.text = rt
    run.font.bold = False
    run.font.color.rgb = TEXT_BODY

# Validation Note Callout Card
add_callout(s9, Inches(5.5), Inches(5.15), Inches(7.033), Inches(1.65), "Deployment Verification Checkpoint", "The frontend deployment pipeline and backend release process are separate. Confirm the actual workflow triggers, required checks, deployment credentials, and whether backend deployment is automated or manual before claiming end-to-end CI/CD.\n\nA green frontend build does not prove the Apps Script endpoint is current.")

set_speaker_notes(s9, "“The frontend deployment pipeline and backend release process are separate. This is important because a successful website build does not necessarily mean the Apps Script backend has been updated or configured correctly.”\n\nValidation note: Confirm the actual workflow triggers, required checks, deployment credentials, and whether backend deployment is automated or manual before claiming end-to-end CI/CD.")

# ==========================================
# SLIDE 10 (DECK SLIDE 10): RELIABILITY & TRADE-OFFS
# ==========================================
s10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s10)
add_header(s10, "Engineering Discipline  |  Architectural Trade-offs", "Slide 10 — Reliability, Limitations, and Engineering Considerations", "Purpose: Demonstrate that you understand architectural trade-offs and operational limits, not just the feature set.")
add_footer(s10, 10, 10)

# Diagram card (Left)
add_card(s10, Inches(0.8), Inches(1.4), Inches(4.5), Inches(5.4), "Risks vs Mitigating Controls Map")
add_image_proportional(s10, "generated_diagrams/slide_10_engineering_considerations.png", Inches(0.95), Inches(1.85), Inches(4.2), Inches(4.8))

# Right Column: Trade-offs Table & Checklist
card_trade = add_card(s10, Inches(5.5), Inches(1.4), Inches(7.033), Inches(3.6), "Key Architectural Trade-offs & Operational Realities")

# Table
table_shape_s10 = s10.shapes.add_table(6, 2, Inches(5.65), Inches(1.75), Inches(6.733), Inches(3.1))
t_s10 = table_shape_s10.table
t_s10.columns[0].width = Inches(2.6)
t_s10.columns[1].width = Inches(4.133)

headers_s10 = ["Architectural Advantage", "Engineering Consideration & Trade-off"]
rows_s10 = [
    ("Low infrastructure overhead & zero cost", "Apps Script quotas apply: 6-min execution timeouts, daily email limits, and invocation caps."),
    ("Google Sheets is easy to inspect & audit", "No relational foreign keys or ACID guarantees; relational integrity must be enforced in code."),
    ("Static Edge CDN frontend hosting", "Frontend depends on separately configured backend Web App URL; cross-origin latency applies."),
    ("External motorsport data (Jolpica)", "Upstream API outages and last-minute schedule changes affect freshness; requires client cache."),
    ("Client-side fallback capability", "Users may see simulated rather than live data if fallback behavior is not clearly signaled in the UI."),
]

for col_idx, h_text in enumerate(headers_s10):
    cell = t_s10.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = TABLE_HEADER_BG
    p = cell.text_frame.paragraphs[0]
    p.text = h_text
    p.font.name = FONT_HEADING
    p.font.size = Pt(8.5)
    p.font.bold = True
    p.font.color.rgb = BG_WHITE

for row_idx, r_data in enumerate(rows_s10):
    for col_idx, val in enumerate(r_data):
        cell = t_s10.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_WHITE if row_idx % 2 == 0 else TABLE_ROW_ALT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(8)
        p.font.bold = (col_idx == 0)
        p.font.color.rgb = TEXT_TITLE if col_idx == 0 else TEXT_BODY

# Validation Note Callout Card
add_callout(s10, Inches(5.5), Inches(5.15), Inches(7.033), Inches(1.65), "Engineering Checklist Before Production Release", "These are engineering considerations, not claims that every failure mode is already mitigated. In particular, verify:\n1. Physical worksheet schema in backend/SetupSheet.gs  |  2. Auth paths & server-side RBAC in backend/Code.gs\n3. Mock-data fallback UI indicators  |  4. Deadline & scoring rules  |  5. Notification retries & deduplication.")

set_speaker_notes(s10, "“THE GRDX prioritizes low-cost infrastructure and straightforward maintenance. Its reliability depends on validating data integrity, handling external failures, controlling concurrent writes, and distinguishing live data from fallback behavior.”\n\nThese are engineering considerations, not claims that every failure mode is already mitigated. Present each control as implemented only after verifying the corresponding source.")

# ==========================================
# SLIDE 11: ARCHITECTURAL SYNTHESIS & CONCLUSION
# ==========================================
slide_summary = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide_summary)
add_header(slide_summary, "Executive Summary  |  Production Readiness", "Architectural Synthesis & Production Hardening", "Summary of architectural strengths, verified operational guarantees, and recommended roadmap milestones.")
add_footer(slide_summary, "Summary", 10)

cards_summary = [
    ("CORE ARCHITECTURAL STRENGTHS", ACCENT_GREEN, [
        ("Serverless & Zero Fixed Overhead:", "Static SPA on Edge CDN paired with GCP V8 Apps Script serverless backend eliminates infrastructure maintenance costs."),
        ("Clean Separation of Concerns:", "Strict C4 Level 1-3 layering separates presentation, routing, state, API client facade, and business domain services."),
        ("Cryptographic Google Identity:", "Passwordless authentication eliminates password leakage vulnerabilities; user account anchored to immutable Google `sub`."),
        ("Granular Concurrency Controls:", "LockService distributed mutex ensures transactional write safety across high-concurrency race finish windows."),
    ]),
    ("VERIFICATION & READINESS CHECKLIST", ACCENT_AMBER, [
        ("Backend Deployment URL Alignment:", "Ensure Vite build environment variables point to active, versioned Apps Script Web App URL."),
        ("Worksheet Schema Consistency:", "Cross-reference all 15 sheets in backend/SetupSheet.gs against backend action dispatcher column lookups."),
        ("Server-Side Clock Enforcement:", "Confirm deadline checks strictly evaluate server timestamps with zero trust on client system time."),
        ("Fallback Transparency:", "Ensure UI prominently displays status pills when displaying cached or mock simulation datasets."),
    ]),
    ("RECOMMENDED PRODUCTION ROADMAP", ACCENT_BLUE, [
        ("Edge Cache Layer (Cloudflare Workers):", "Introduce edge caching for read-heavy public endpoints (driver standings, static race calendars) to reduce Apps Script quota pressure."),
        ("Automated Integration Testing:", "Expand CI/CD pipeline to execute integration test suite verifying backend API contracts before deployment."),
        ("Granular Quota Telemetry:", "Add quota monitoring hooks to record daily Apps Script execution seconds and MailApp email consumption."),
        ("Leaderboard Snapshot Generation:", "Pre-render static leaderboard JSON snapshots upon race scoring to serve high-traffic traffic spikes instantly."),
    ])
]

c_w = Inches(3.64)
c_h = Inches(5.4)
c_gap = Inches(0.35)
c_start = Inches(0.8)

for i, (col_title, col_accent, col_bullets) in enumerate(cards_summary):
    cur_x = c_start + i * (c_w + c_gap)
    card = slide_summary.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cur_x, Inches(1.4), c_w, c_h)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD
    card.line.color.rgb = BORDER_COLOR
    card.line.width = Pt(1)

    # Accent top strip
    strip = slide_summary.shapes.add_shape(MSO_SHAPE.RECTANGLE, cur_x + Inches(0.02), Inches(1.42), c_w - Inches(0.04), Inches(0.08))
    strip.fill.solid()
    strip.fill.fore_color.rgb = col_accent
    strip.line.fill.background()

    tb = slide_summary.shapes.add_textbox(cur_x + Inches(0.2), Inches(1.6), c_w - Inches(0.4), c_h - Inches(0.35))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p_title = tf.paragraphs[0]
    p_title.text = col_title
    p_title.font.name = FONT_HEADING
    p_title.font.size = Pt(10)
    p_title.font.bold = True
    p_title.font.color.rgb = col_accent
    p_title.space_after = Pt(12)

    for bt, rt in col_bullets:
        p = tf.add_paragraph()
        p.text = f"• {bt} "
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_TITLE
        p.space_after = Pt(8)

        run = p.add_run()
        run.text = rt
        run.font.bold = False
        run.font.color.rgb = TEXT_BODY

set_speaker_notes(slide_summary, "In conclusion, THE GRDX achieves a remarkable balance between zero-cost operational simplicity and robust architectural design. Adhering to the verification checklist and implementing edge caching will ensure seamless scale during peak motorsport race weekends.")

# Save PowerPoint presentation in both project root and docs directory
root_pptx = os.path.abspath("THE_GRDX_Technical_Architecture.pptx")
docs_pptx = os.path.abspath("docs/THE_GRDX_Technical_Architecture.pptx")

prs.save(root_pptx)
prs.save(docs_pptx)

print(f"Presentation successfully created!")
print(f"  Root path: {root_pptx} ({os.path.getsize(root_pptx)} bytes)")
print(f"  Docs path: {docs_pptx} ({os.path.getsize(docs_pptx)} bytes)")
