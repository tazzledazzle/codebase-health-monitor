# Codebase Health Explorer

“Visualize, Document, and Monitor Your Codebase Instantly”

⸻

Table of Contents

1. Overview / Project Story
2. Use Cases
3. Functional Specifications
4. Component Diagram
5. Data Flow Diagrams (DFDs)
6. Wireframes (Low-Fidelity)
7. Project Stories (Agile/Epics)

⸻

## 1. Overview / Project Story

### Narrative

Development teams, especially those inheriting legacy or complex repos, struggle to get a quick and actionable view of their codebase health. Questions like “where are our dependencies?”, “which files or services are most error-prone?”, and “how do we onboard new engineers faster?” are hard to answer without a lot of manual digging.

### Codebase Health Explorer solves this by providing

* Automated static analysis of your codebase (supports Kotlin, Java, JS/TS out of the box).
* Interactive dependency graphs and hot spot overlays, embeddable anywhere.
* AI-generated, context-rich documentation (class, function, file, module, or API-level).
* Sentry-style error overlays to see problem areas, with live updates from Sentry or your error pipeline.
* Bolt.new/21st.dev inspired widget system for embeddable, self-updating visualizations and docs.

⸻

## 2. Use Cases

### UC1: Fast Codebase Understanding

* A new engineer joins a project. They upload the repo or connect a GitHub link.
* Within minutes, they see a map of all modules/files/classes/functions, with hot spots and auto-docs.

### UC2: Dependency Audit for Refactoring

* A tech lead wants to refactor a service.
* They use the dependency map to see all direct and indirect dependencies, high-churn files, and where errors are concentrated.

### UC3: Live Error Hot Spot Tracking

* An SRE wants to monitor which parts of the codebase are generating the most runtime errors.
* Live error overlays show them, so they can prioritize fixes.

### UC4: Embedding Documentation in an Internal Wiki

* The team wants to keep internal docs always up to date.
* They embed the dependency map and doc widgets in Confluence/Notion.

### UC5: Project Health Reporting

* PMs or managers want periodic “code health” reports.
* The platform auto-generates a snapshot of dependency complexity, hot spot density, and documentation coverage.

⸻

## 3. Functional Specifications

### Inputs

* GitHub/GitLab repo link (OAuth/clone)
* Zip file upload

### Core Functions

#### 1. Static Analysis Pipeline

* Parse codebase, extract classes, functions, dependencies, call graphs, module boundaries.
* Supported languages: Kotlin, Java, TypeScript/JavaScript (pluggable for others).

#### 2. AI Doc Generation

* Use Entri-style models or LLM prompts to summarize each class/function/file/module.
* Output natural-language summaries, usage notes, example code.

#### 3. Dependency & Hot Spot Mapping

* Build dependency trees/graphs.
* Integrate with Sentry API (or similar) for file/function error overlays.
* Analyze commit history for “high churn” and “ownership” data.

#### 4. Visualization / Widgets

* Pica-style, interactive node-link graphs.
* Hot spot overlays (color intensity for error/churn).
* Search, filter, zoom.

* Export as embeddable widgets (iframe, React/Vue components).

#### 5. User Management

* Account creation, team/workspace management.
* Repo/project history and snapshots.

### APIs

* REST (Ktor) or GraphQL for client interaction.
* WebSocket for real-time updates.
* Sentry/3rd-party error tracker integration.

### Non-Functional

* Responsive web design.
* Scalable backend for large repos (async processing, queues).
* Secure storage (data encryption at rest/in transit).
* Multi-tenant SaaS support.

⸻

## 4. Component Diagram

```bash
[ User ]
   |
   |   (1) Upload Repo / Connect GitHub
   v
[ Frontend Web App (Kotlin/JS, React) ]
   |
   |   (2) REST/GraphQL/WebSocket API
   v
[ Backend API (Ktor) ]<--------------------------\
   |     |           |     |                     |
   |     |           |     |                     |
   |     |           |     |--(5) Widget Embed   |
   |     |           |                           |
   |     |    [ AI Doc Generation Service ]      |
   |     |           |                           |
   |     |    [ Static Analysis Pipeline ]       |
   |     |           |                           |
   |     |    [ Dependency/Hot Spot Mapper ]     |
   |     |           |                           |
   |     |    [ Sentry/Error Tracker Adapter ]---|
   |     |           |      (pulls live error data)
   |     |    [ Storage (DB, Blob, Cache) ]      |
   |                                            /
   \----[ Authentication / Team Management ]----/

[ Embeddable Widget SDK / iFrame ] <-- External Wiki/Docs/Other Sites
```

⸻

## 5. Data Flow Diagrams (for All Use Cases)

### DFD: UC1 – Fast Codebase Understanding

```bash
User --> Web App --> Backend API --> Static Analysis Pipeline
    <-- Dependency Graph, Doc Summaries, Hot Spots
Web App <--> User (interactive visualization)
```

### DFD: UC2 – Dependency Audit

```bash
User --> Web App --> Backend API --> Query Dependency Map/Churn/Error Data
    <-- Filtered Dependency/Hot Spot Graphs
Web App <--> User (zoom, search, inspect nodes/edges)
```

### DFD: UC3 – Live Error Hot Spot Tracking

```bash
Backend API <---> Sentry Adapter (pulls live error data)
Backend API aggregates and updates error overlays
Web App/Widget <-- WebSocket/REST --> Backend API
User sees live updates on graph
```

### DFD: UC4 – Embedding Docs

```bash
External Wiki --> Embeddable Widget/iFrame --> Backend API
Widget renders interactive dependency/doc map in place
```

### DFD: UC5 – Project Health Reporting

```bash
Scheduler/Trigger --> Backend API --> Aggregates Analysis/Summaries
Backend generates PDF/HTML/CSV snapshot
User downloads/views/share report
```

⸻

## 6. Wireframes (Low-Fidelity)

### A. Dashboard/Home

```bash
+----------------------------------------------------+
| [Logo]         Codebase Health Explorer            |
|----------------------------------------------------|
|  [Repo Dropdown]  [Add New Repo]  [User Menu]      |
|                                                    |
| [Summary: # Files | # Classes | Errors | Churn]    |
|                                                    |
| [Dependency Graph Visualization]                   |
|    [Zoom] [Search] [Filters]                       |
|    [Node: Module/File/Class]                       |
|    [Hot Spot Overlay: Errors, Churn]               |
|                                                    |
| [AI Doc Sidebar]                                   |
|    [Class/Function Summary | Usage | Example]      |
+----------------------------------------------------+

#### B. Embeddable Widget

```bash
+--------------------+   +--------------------------+
|   [Dependency Map] |   | [AI Doc for Selection]   |
|     (interactive)  |   |                          |
|  [Click Node]      |-->| Name, Description,       |
|                    |   | Usage Notes, Examples    |
+--------------------+   +--------------------------+

#### C. Error Hot Spot View

```bash
+----------------------------------------------------+
| [Dependency Graph: Error Overlay Mode]             |
|   [Red intensity = error frequency]                |
|   [Hover/Click: Show error logs, stack traces]     |
+----------------------------------------------------+

#### D. Project Health Report

```bash
+----------------------------------------------------+
| Codebase Health Snapshot (Date)                    |
|  - Files:      | High Churn:                       |
|  - Errors:     | Top Error Locations:              |
|  - Modules:    | Docs Coverage:                    |
|  - Hot Spots:  |                                  |
|                                                    |
|  [Download PDF]  [Share Link]                      |
+----------------------------------------------------+
```

⸻

## 7. Project Stories (Agile/Epics)

### Epic 1: Codebase Ingestion & Static Analysis

* As a user, I can connect a repo or upload a zip, and receive a breakdown of my codebase’s structure and dependencies.

### Epic 2: AI Documentation Generation

* As a user, I can view auto-generated documentation for any class, file, or function in my codebase.

### Epic 3: Dependency & Error Visualization

* As a user, I can explore an interactive dependency graph with error/churn overlays, and drill down into problem areas.

### Epic 4: Embeddable Widgets

* As a user, I can embed the dependency map and docs as widgets in my internal docs, and they auto-update when the codebase changes.

### Epic 5: Project Health Reporting

* As a user or manager, I can generate and export/share periodic health snapshots of my projects.

### Epic 6: User and Team Management

* As a user, I can invite teammates, manage projects, and control data access.

⸻

## 8. UI/UX Expansion

### A. Main Dashboard

* Header:
* Logo
* Repo/project selector
* User menu (profile, settings, logout)
* Overview Stats:
* Total files, modules, classes, functions
* Error count, top error locations (with Sentry icon for live errors)
* Churn/ownership metrics
* Interactive Graph Area:
* Node-link graph visualizing modules/files/classes
* Controls: zoom, pan, search, node filter (by error, churn, module, etc.)
* Color overlays for hot spots (red/yellow intensity for errors/churn)
* AI Doc Sidebar:
* Updates when a node is clicked
* Natural-language summary, usage notes, sample usages
* “Open in file view” link, copy-to-clipboard, and permalink
* File Explorer:
* Tree view of project structure
* Highlights files by error/churn
* Project Health Card:
* Quick health indicators (score, trend arrows, last scan time)
* Bottom Bar:
* Recent scans, report downloads, notifications

⸻

### B. Embeddable Widget UI

* Mini dependency graph (auto-fits to container)
* Doc popover: Appears on node hover/click
* Dark/light mode toggle
* “Open full view” button: Links back to main app

⸻

### C. File View / Details

* Code viewer (syntax-highlighted, read-only)
* Inline AI summaries and error markers
* Commit/churn visualization (mini-bar chart per line or block)
* Jump-to-definition and find-references

⸻

### D. Team/Workspace Management

* User list, roles (admin, member, viewer)
* Invite by email
* Audit trail of repo scans and health report generations

⸻

### E. Authentication & Onboarding

* Sign in/up with Google, GitHub, or email
* OAuth repo connect flow (GitHub/GitLab/Bitbucket)
* Onboarding modal: “Paste repo link or upload ZIP”

⸻

## 9. API (REST & WebSocket) Specification

### A. REST Endpoints

* Auth & Users
  * `POST /api/auth/signup` / `POST /api/auth/login`
  * `POST /api/auth/oauth/github`
  * `GET /api/users/me`
  * `POST /api/invite`
* Repo Management
  * `POST /api/repos/add` (clone repo or upload ZIP)
  * `GET /api/repos/:id` (metadata, status)
  * `GET /api/repos/:id/files` (tree/list)
* Static Analysis
  * `POST /api/repos/:id/scan` (trigger scan)
  * `GET /api/repos/:id/scan/:scanId/status`
  * `GET /api/repos/:id/dependencies`
  * `GET /api/repos/:id/churn`
* AI Documentation
  * `GET /api/repos/:id/docs/:fileOrSymbol`
  * `POST /api/repos/:id/docs/:fileOrSymbol/feedback`
* Error Integration
  * `GET /api/repos/:id/errors` (latest)
  * `GET /api/repos/:id/errors/:symbol`
* (Webhook endpoint for Sentry: POST /api/sentry/events)
* Visualization
  * `GET /api/repos/:id/graph` (returns graph JSON)
  * `GET /api/repos/:id/health` (metrics)
* Widgets
  * `GET /api/widgets/dependency-map/:repoId` (auth-optional, CORS-enabled)
* Reports
  * `GET /api/repos/:id/report/:scanId` (download PDF/HTML)
* Teams
  * `GET /api/teams/:teamId`
  * `POST /api/teams/:teamId/invite`
* Notifications
  * `GET /api/notifications`
  * `POST /api/notifications/mark-read`

### B. WebSocket Endpoints

* `ws://.../api/repos/:id/updates`
* Streams: scan progress, new errors, live graph updates

### C. API Example Schema

`// GET /api/repos/:id/graph`

```json
{
  "nodes": [
    {"id": "FileA.kt", "type": "file", "errors": 2, "churn": 5, ...},
    {"id": "MyClass", "type": "class", "errors": 0, "churn": 1, ...}
  ],
  "edges": [
    {"source": "FileA.kt", "target": "FileB.kt", "type": "import"},
    {"source": "MyClass", "target": "OtherClass", "type": "extends"}
  ]
}
```

⸻

## 10. Workflow Details

### A. Onboarding & Repo Setup

1. User signs up (email/OAuth).
2. Adds a repo (via OAuth or ZIP upload).
3. System queues analysis; shows progress.
4. Once analysis is complete, user lands on dashboard with dependency graph, hot spots, and AI docs.

⸻

### B. Static Analysis & Documentation

1. Triggered automatically on repo upload/connection, or on demand.
2. Language-specific analyzers extract:
    * Module boundaries, file/class/function definitions
    * Imports, call graphs, data flows
    * Churn metrics from git logs

3. Analyzer pushes parsed ASTs/metadata to the backend DB.
4. AI documentation service is invoked per symbol (batched); summaries saved and indexed.
5. Errors from Sentry fetched/received via webhook and mapped to files/symbols.

⸻

### C. Visualization & Widget Embedding

1. Graph data delivered as JSON via API or WebSocket.
2. Web app renders interactive graph using D3.js or similar in Kotlin/JS or React.
3. Embeddable widget loads via URL (iframe or JS SDK), fetches same graph and doc data (public or auth-required mode).

⸻

### D. Error & Hot Spot Monitoring

1. Sentry (or similar) integration—either via polling, webhook, or direct API.
2. Errors mapped to code locations.
3. UI overlays red/yellow colors on nodes/edges based on severity/frequency.
4. Clicking error hot spot surfaces logs, stack traces, and error trends.

⸻

### E. Health Report Generation

1. User triggers or schedules a report.
2. Backend compiles scan results, churn/error metrics, AI doc coverage.
3. Exports as PDF/HTML, notifies user.
4. Optionally, shares via link/email to team.

⸻

### F. Team & Permission Management

1. Admins invite teammates by email.
2. Roles: admin (full), member (edit), viewer (read-only).
3. Audit log tracks project scans, data access, and edits.

⸻

### G. Tech Stack per Component

#### A. Frontend (Web)

* Language: Kotlin/JS (React wrappers) OR TypeScript + React (if team prefers)
* Visualization: D3.js (for graph), react-force-graph, or Cytoscape.js
* UI Framework: Material-UI, Tailwind CSS, or custom
* State Management: Redux, Zustand, or hooks-based

#### B. Embeddable Widget

* JS SDK: Small standalone bundle (prebuilt with Rollup), embeddable via `<script>` tag
* Alternative: iFrame with responsive design and postMessage API for interaction

#### C. Backend/API

* Framework: Kotlin Ktor (REST and WebSocket)
* Auth: JWT for API + OAuth2 (GitHub, Google)
* Repo Ingestion: JGit for Git, unzip/parse for ZIPs
* Async Task Processing: Kotlin Coroutines + Ktor Background Workers (or use Redis Queue, Sidekiq if scaling)
* DB: PostgreSQL (users, repos, scans, AI docs), Redis (caching, queue)
* Blob Storage: AWS S3, MinIO, or local (for repo snapshots, reports)

#### D. Static Analysis & AI Doc Generation

* Static Analysis:
* Kotlin/Java: Use Kotlin Compiler Analysis API, javaparser
* JS/TS: TypeScript Compiler API, ESLint/TSLint AST parsers
* Churn Metrics: JGit, git log parsing
* AI Docs:
* LLM integration: OpenAI API, Ollama, or self-hosted LLM (via Python service or Kotlin-JVM client)
* Prompting: Provide AST and symbol context, request summary/usage/examples

#### E. Error Integration

* Sentry Adapter: REST client for Sentry API, webhook receiver for live error events
* Error Mapping: Source map support for JS/TS, stack trace mapping for JVM

#### F. Reporting

* PDF/HTML generation: Pandoc, wkhtmltopdf, or Java PDF libraries (Apache PDFBox)
* Scheduler: Quartz (Kotlin), or Kubernetes cron jobs

#### G. Authentication, Teams, Permissions

* JWT-based auth, OAuth2 (GitHub/Google)
* RBAC (Role-Based Access Control): Table/model in DB

#### H. Deployment/DevOps

* Containerization: Docker (multi-service: API, analyzer, AI docs service)
* CI/CD: GitHub Actions, GitLab CI, or Jenkins
* Hosting: AWS ECS/Fargate, GCP Cloud Run, or Kubernetes (Helm charts for easy deploy)
* Monitoring: Sentry for frontend/backend, Prometheus + Grafana for infra

⸻

### 11. (Optional) High-Level Directory Structure

```bash
/frontend            # Kotlin/JS + React code
  /src
  /components
  /widgets
/backend             # Ktor API, service code
  /src
  /routes
  /analyzers
  /ai_docs
  /workers
/integrations        # Sentry, GitHub, etc.
/infra               # Terraform, Docker, Helm, deploy scripts
/ai                  # Prompt templates, LLM integration (if separate)
```

⸻

## Summary

Codebase Health Explorer is your team’s x-ray vision into code structure, dependencies, documentation, and runtime health.
It blends static analysis, LLM-generated docs, real-time error overlays, and embeddable visualizations in a modern, cloud-native package.
Built in Kotlin (Ktor, Kotlin/JS, multiplatform), with a React/JS-powered front end and real-time data feeds.
