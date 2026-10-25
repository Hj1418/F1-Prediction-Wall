import os
import time
from playwright.sync_api import sync_playwright

DIAGRAMS = {
    "slide_1_system_context": """flowchart LR
    U["Community Member"]
    A["Administrator"]
    G["THE GRDX<br/>Motorsport Prediction Platform"]
    GIS["Google Identity Services"]
    J["Jolpica F1 API"]
    M["Google MailApp"]

    U -->|"Predictions, quizzes,<br/>leaderboards"| G
    A -->|"Privileged operations"| G
    G <-->|"Google identity"| GIS
    G <-->|"Motorsport data"| J
    G -->|"Email delivery"| M

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef external fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef client fill:#DBEAFE,stroke:#2563EB,stroke-width:2px,color:#1E3A8A,font-weight:600;

    class G core;
    class U,A client;
    class GIS,J,M external;""",

    "slide_2_container_architecture": """flowchart TB
    User["Browser / User Client"]

    subgraph Frontend["Frontend — GitHub Pages Edge CDN"]
        SPA["React 19 + TypeScript SPA<br/>Vite build · React Router"]
        LS[("Browser LocalStorage<br/>Cache & Auth State")]
    end

    subgraph Backend["Backend — Google Apps Script (GCP V8 Engine)"]
        API["Web App Gateway<br/>doGet(e) / doPost(e)"]
        Cache[("CacheService<br/>In-Memory RAM Cache")]
        Logic["Application Logic Engine<br/>Auth · Predictions · Scoring"]
        Queue["Notification Queue Worker<br/>Async Email Processor"]
    end

    Sheets[("Google Sheets Relational DB<br/>15 Structured Worksheets")]
    GIS["Google Identity Services<br/>OAuth 2.0 / UserInfo"]
    F1["Jolpica F1 API<br/>Motorsport Data Engine"]
    Mail["Google MailApp<br/>Email Delivery Engine"]

    User --> SPA
    SPA <--> LS
    SPA -->|"HTTPS / JSON requests"| API
    API --> Logic
    Logic <--> Sheets
    Logic <--> Cache
    Logic --> Queue
    Logic <-->|"Identity verification"| GIS
    Logic <-->|"Calendar / results data"| F1
    Queue --> Mail

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef external fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef client fill:#DBEAFE,stroke:#2563EB,stroke-width:2px,color:#1E3A8A,font-weight:600;
    classDef store fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#581C87,font-weight:600;

    class SPA,API,Logic,Queue core;
    class User client;
    class LS,Cache,Sheets store;
    class GIS,F1,Mail external;""",

    "slide_3_frontend_component": """flowchart TB
    App["App Root & React Router 7"]

    subgraph State["Application State Layer"]
        Auth["AuthContext (GIS Auth State)"]
        Ctx["AppContext (Global Platform State)"]
    end

    subgraph UI["Feature UI Modules"]
        Race["Race Weekend & Session Views"]
        Pred["Prediction Form Engine"]
        Board["Leaderboard & Results Views"]
        Quiz["Quiz Engine & Learning"]
        Search["Universal Search Module"]
        Profile["Profiles & Achievements"]
    end

    subgraph Services["Client Services & Cache Layer"]
        Client["API Client Facade"]
        Norm["Motorsport Data Normalizers"]
        Cache["Client Cache (TTL & LocalStorage)"]
    end

    API["Apps Script Backend API"]
    Mock["Mock / Simulation Fallback"]

    App --> State
    App --> UI
    UI --> Client
    Auth --> Client
    Ctx --> Client
    Client --> Norm
    Client --> Cache
    Client -->|"Live HTTPS requests"| API
    Client -.->|"Graceful fallback where configured"| Mock

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef external fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef client fill:#DBEAFE,stroke:#2563EB,stroke-width:2px,color:#1E3A8A,font-weight:600;
    classDef store fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#581C87,font-weight:600;
    classDef fallback fill:#F1F5F9,stroke:#94A3B8,stroke-width:2px,stroke-dasharray: 4 4,color:#475569,font-weight:600;

    class App,Auth,Ctx,Race,Pred,Board,Quiz,Search,Profile,Client,Norm core;
    class Cache store;
    class API external;
    class Mock fallback;""",

    "slide_4_backend_component": """flowchart TB
    Client["Frontend API Client"]
    Get["doGet(e)<br/>Queries & Public Reads"]
    Post["doPost(e)<br/>Mutations & Admin Ops"]
    Router["Action Dispatcher Router"]

    subgraph Services["Application Domain Services"]
        Identity["Authentication & Identity"]
        Prediction["Prediction Service"]
        Deadline["Deadline Validation"]
        Scoring["Scoring Engine"]
        Calendar["Calendar Synchronization"]
        Quiz["Quiz Service"]
        Admin["Admin Operations"]
        Notify["Notification Queue Worker"]
    end

    Lock["LockService (Distributed Mutex)"]
    Sheets[("SpreadsheetApp / Google Sheets DB")]
    Cache["CacheService (Fast RAM Cache)"]
    External["External APIs / MailApp"]

    Client --> Get
    Client --> Post
    Get --> Router
    Post --> Router
    Router --> Identity
    Router --> Prediction
    Router --> Scoring
    Router --> Calendar
    Router --> Quiz
    Router --> Admin
    Router --> Notify

    Prediction --> Deadline
    Prediction --> Lock
    Scoring --> Lock
    Identity --> Sheets
    Prediction --> Sheets
    Scoring --> Sheets
    Calendar --> Sheets
    Quiz --> Sheets
    Admin --> Sheets
    Notify --> Sheets
    Calendar <--> External
    Notify --> External
    Router <--> Cache

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef external fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef client fill:#DBEAFE,stroke:#2563EB,stroke-width:2px,color:#1E3A8A,font-weight:600;
    classDef store fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#581C87,font-weight:600;
    classDef lock fill:#FFFBEB,stroke:#F59E0B,stroke-width:2px,color:#B45309,font-weight:600;

    class Client client;
    class Get,Post,Router,Identity,Prediction,Deadline,Scoring,Calendar,Quiz,Admin,Notify core;
    class Sheets,Cache store;
    class Lock lock;
    class External external;""",

    "slide_5_data_model_erd": """erDiagram
    USERS ||--o{ PREDICTIONS : submits
    USERS ||--o{ SCORES : earns
    USERS ||--o{ ACHIEVEMENTS : unlocks
    USERS ||--o{ QUIZ_ATTEMPTS : completes
    USERS ||--o{ QUIZ_ACHIEVEMENTS : earns
    USERS ||--o{ NOTIFICATION_QUEUE : receives

    RACE_WEEKENDS ||--o{ SESSIONS : contains
    RACE_WEEKENDS ||--o{ PREDICTION_ROUNDS : defines
    RACE_WEEKENDS ||--o{ SYNC_LOGS : records

    SESSIONS ||--o{ PREDICTION_ROUNDS : schedules
    PREDICTION_ROUNDS ||--o{ PREDICTIONS : receives
    PREDICTION_ROUNDS ||--o{ RESULTS : records
    PREDICTION_ROUNDS ||--o{ SCORES : produces

    QUIZ_CATEGORIES ||--o{ QUIZ_QUESTIONS : contains
    NOTIFICATION_QUEUE ||--o{ NOTIFICATION_LOG : tracks""",

    "slide_6_prediction_lifecycle": """flowchart TB
    subgraph Submission["1. Round Opening & Prediction Submission Window"]
        direction LR
        Start(["Race session available"]) --> Load["Load session & round"]
        Load --> Open{"Round accepts submissions?"}
        Open -->|"Yes (Open)"| Form["User submits prediction"]
        Open -->|"No (Closed)"| Reject["Reject / closed"]
        Form --> Validate["Server-side deadline & input validation"]
        Validate -->|"Invalid or late"| Reject
        Validate -->|"Valid & on-time"| Save["Persist prediction (LockService protection)"]
    end

    subgraph Scoring["2. Result Publication & Scoring Calculation"]
        direction LR
        Save --> Result["Official session result published"]
        Result --> Calculate["Calculate score (P1-P3, FL, DOTD, Wildcard)"]
        Calculate --> Store["Persist scoring outcome to Sheets DB"]
        Store --> Leaderboard["Refresh leaderboard & community rankings"]
    end

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef decision fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef reject fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B,font-weight:600;
    classDef terminal fill:#DBEAFE,stroke:#2563EB,stroke-width:2px,color:#1E3A8A,font-weight:600;

    class Start terminal;
    class Load,Form,Validate,Save,Result,Calculate,Store,Leaderboard core;
    class Open decision;
    class Reject reject;""",

    "slide_7_auth_security": """flowchart LR
    subgraph Identity["1. Identity Verification Flow"]
        User["User"] --> Choice{"Auth Method"}
        Choice --> Google["Google Sign-In (GIS OAuth 2.0)"]
        Choice --> Native["Native Credential Flow"]
        Google --> Verify["Server-Side Token Verification<br/>(Google UserInfo API)"]
        Native --> Verify
        Verify -->|"Valid token & email_verified"| Account["Resolve User Account<br/>(Immutable Google sub ID anchor)"]
        Verify -->|"Invalid token or unverified"| Deny["Reject Request (HTTP 401 / 403)"]
    end

    subgraph Access["2. Session & Authorization (RBAC)"]
        Account --> Session["Frontend Authenticated Session State"]
        Session --> Request["Protected API Request (Bearer Token)"]
        Request --> Role{"Authorized for Operation?<br/>(Check role in Users Sheet)"}
        Role -->|"Authorized"| Action["Execute Permitted Operation"]
        Role -->|"Unauthorized"| Deny
    end

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef decision fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef client fill:#DBEAFE,stroke:#2563EB,stroke-width:2px,color:#1E3A8A,font-weight:600;
    classDef reject fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B,font-weight:600;

    class User client;
    class Choice,Role decision;
    class Google,Native,Verify,Account,Session,Request,Action core;
    class Deny reject;""",

    "slide_8_async_email": """flowchart LR
    subgraph Enqueue["1. Notification Task Enqueue"]
        Event["Triggering Event<br/>(Registration, Prediction, Results)"] --> Queue["NotificationQueue Table<br/>(Status: PENDING)"]
    end

    subgraph Processing["2. Scheduled Worker & Locking"]
        Queue --> Worker["Scheduled Queue Processor<br/>(Time-driven Apps Script Trigger)"]
        Worker --> Lock["Acquire Processing Lock<br/>(LockService 10s Mutex)"]
        Lock --> Check{"Already processed?<br/>(Idempotency Check)"}
        Check -->|"Yes (Duplicate)"| Log["NotificationLog Table<br/>(Audit Trail)"]
    end

    subgraph Dispatch["3. MailApp Dispatch & Retry Policy"]
        Check -->|"No (Fresh)"| Send["Google MailApp<br/>(HTML Email Delivery)"]
        Send -->|"Success"| Success["Status: SENT & Timestamp"]
        Send -->|"Failure"| Retry{"Attempts < 3?"}
        Retry -->|"Attempts < 3"| Pending["Status: PENDING (Backoff)"]
        Retry -->|"Attempts >= 3"| Failed["Status: FAILED & Error"]
        Success --> Log
        Pending --> Queue
        Failed --> Log
    end

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef decision fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef store fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#581C87,font-weight:600;
    classDef fail fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B,font-weight:600;

    class Event,Worker,Lock,Send,Success,Pending core;
    class Queue,Log store;
    class Check,Retry decision;
    class Failed fail;""",

    "slide_9_deployment_cicd": """flowchart TB
    subgraph FrontendPipeline["1. Frontend CI/CD Pipeline (GitHub Pages)"]
        direction LR
        Dev["Developer Commit"] --> Git["GitHub Repository"]
        Git --> CI["GitHub Actions (deploy.yml)"]
        CI --> Build["Generate Calendar"]
        Build --> Type["TypeScript Checks (tsc -b)"]
        Type --> Bundle["Vite Bundle & Minify"]
        Bundle --> Publish["Deploy to gh-pages Branch"]
    end

    subgraph RuntimeBackend["2. CDN Delivery & Apps Script Backend"]
        direction LR
        Publish --> Pages["GitHub Pages Edge CDN"]
        Pages --> Browser["User Browser (React 19 SPA)"]
        Browser --> Script["Google Apps Script Backend Project"]
        Script --> DeployScript["Version Deployment / Web App URL"]
    end

    classDef core fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;
    classDef external fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:600;
    classDef client fill:#DBEAFE,stroke:#2563EB,stroke-width:2px,color:#1E3A8A,font-weight:600;
    classDef pages fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1D4ED8,font-weight:600;

    class Dev,Browser client;
    class Git,CI,Build,Type,Bundle,Publish core;
    class Pages pages;
    class Script,DeployScript external;""",

    "slide_10_engineering_considerations": """flowchart LR
    subgraph Risks["Key Engineering Concerns & Architectural Risks"]
        R1["External API availability & Jolpica rate limits"]
        R2["Apps Script quotas & 6-min execution timeouts"]
        R3["Google Sheets concurrent write contention"]
        R4["Mock-data fallback visibility to end users"]
        R5["Data integrity & duplicate scoring processing"]
    end

    subgraph Controls["Mitigating Controls & Verification Checks"]
        C1["Timeout, error handling & stale-while-revalidate"]
        C2["Apps Script CacheService & quota tracking"]
        C3["LockService distributed mutex & sheet validation"]
        C4["Clear UI fallback status banner / indicators"]
        C5["Idempotency keys, sync logs & audit trails"]
    end

    R1 --> C1
    R2 --> C2
    R3 --> C3
    R4 --> C4
    R5 --> C5

    classDef risk fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B,font-weight:600;
    classDef control fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:600;

    class R1,R2,R3,R4,R5 risk;
    class C1,C2,C3,C4,C5 control;"""
}

def render_diagrams():
    out_dir = os.path.abspath("generated_diagrams")
    os.makedirs(out_dir, exist_ok=True)
    
    html_template = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    * {{
      box-sizing: border-box;
    }}
    body {{
      margin: 0;
      padding: 24px;
      background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: inline-block;
    }}
    #wrapper {{
      background: #FFFFFF;
      border-radius: 12px;
      padding: 24px 28px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      display: inline-block;
      width: max-content;
    }}
    svg {{
      max-width: none !important;
    }}
    .mermaid {{
      background: #FFFFFF;
    }}
    .edgeLabel {{
      background-color: #FFFFFF !important;
      border: 1px solid #CBD5E1 !important;
      border-radius: 4px !important;
      padding: 3px 6px !important;
      font-size: 11px !important;
      font-weight: 500 !important;
      color: #334155 !important;
    }}
    .cluster rect {{
      fill: #F8FAFC !important;
      stroke: #94A3B8 !important;
      stroke-width: 1.5px !important;
      rx: 8px !important;
      ry: 8px !important;
    }}
    .cluster text {{
      font-weight: 700 !important;
      fill: #1E293B !important;
      font-size: 13px !important;
    }}
    .node rect, .node circle, .node ellipse, .node polygon, .node path {{
      rx: 6px !important;
      ry: 6px !important;
    }}
  </style>
</head>
<body>
  <div id="wrapper">
    <div class="mermaid" id="chart">
{mermaid_code}
    </div>
  </div>
  <script>
    mermaid.initialize({{
      startOnLoad: true,
      theme: 'base',
      themeVariables: {{
        primaryColor: '#DCFCE7',
        primaryTextColor: '#14532D',
        primaryBorderColor: '#16A34A',
        lineColor: '#64748B',
        secondaryColor: '#FEF3C7',
        tertiaryColor: '#F3E8FF',
        background: '#FFFFFF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '14px'
      }}
    }});
  </script>
</body>
</html>"""

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        page = browser.new_page(viewport={"width": 4200, "height": 3000}, device_scale_factor=2)
        
        for name, code in DIAGRAMS.items():
            print(f"Rendering {name}...")
            html_file = os.path.join(out_dir, f"{name}.html")
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(html_template.format(mermaid_code=code))
            
            page.goto("file:///" + html_file.replace("\\", "/"))
            page.wait_for_selector("svg", timeout=12000)
            time.sleep(0.6)  # Ensure all SVG layouts stabilize
            
            page.evaluate('''() => {
                const svg = document.querySelector('svg');
                if (svg) {
                    const vb = svg.viewBox.baseVal;
                    if (vb && vb.width > 0) {
                        svg.style.width = (vb.width * 1.3) + 'px';
                        svg.style.height = (vb.height * 1.3) + 'px';
                        svg.style.maxWidth = 'none';
                    }
                }
                const wrap = document.getElementById('wrapper');
                if (wrap) wrap.style.width = 'max-content';
            }''')
            time.sleep(0.3)
            
            wrapper = page.locator("#wrapper")
            png_file = os.path.join(out_dir, f"{name}.png")
            wrapper.screenshot(path=png_file)
            print(f"  -> Generated {png_file} ({os.path.getsize(png_file)} bytes)")
            
        browser.close()

if __name__ == "__main__":
    render_diagrams()
