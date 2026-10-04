---
title: "Enterprise AI Platform: Agent Control Plane"
year: 2026
phase: "AI/GenAI Engineer & Architect"
description: "Engineered a centralized, UI-driven Enterprise AI Platform for component discovery, automated GitHub repo scanning, and lifecycle governance of LLM agents and MCP servers."
---

## Impact
Automated | Repo Scanning & Component Registration
Centralized | UI for Discovery & Lifecycle Governance
Governed | Chat History & Human-in-the-Loop Evaluation

## Overview
While the **Agent Development Kit (ADK)** provided the foundational code contract and execution engine, the enterprise needed a centralized "Control Plane" where teams could visually discover, test, and manage the lifecycle of these AI components. I engineered the overarching Enterprise AI Platform to serve as the unified hub for all AI initiatives across the business unit.

## The Problem

### Challenge 1: Component Discovery & Registry Governance
**Issue:** Teams were building powerful agents and MCP servers, but had no unified graphical hub to share them, explore their capabilities, or govern their deployment lifecycle across environments.


**Solution:** I architected the Enterprise AI Platform UI. The registries (Agent, MCP, Skill, KB) run as standalone microservices exposing REST APIs (`/register`, `/update`, `/delete`, `/lifecycle`). I built a self-service UI where authorized users can browse available components, understand their capabilities, and manage their full lifecycle from development to production.

### Challenge 2: Automated Onboarding at Scale
**Issue:** Manually registering dozens of individual agents, skills, and tools into the registry via API was a friction point that slowed down platform adoption.


**Solution:** I engineered an automated GitHub repository scanner. Users simply provide their repository URL in the UI. The platform automatically scans the codebase, identifies components based on their adherence to the ADK contract (e.g., classifying a repository as an MCP server vs. an ADK agent), and automatically registers them in the appropriate underlying microservice registry.

### Challenge 3: Observability, Interaction, and Dynamic Loading
**Issue:** Developers and auditors needed a way to interact with running agents, view past chat histories, and evaluate the quality of LLM responses. Furthermore, agents needed a way to dynamically pull dependencies.


**Solution:** The platform UI integrates directly with the ADK HTTP Server, providing a universal chat interface where users can interact with any registered agent. It natively displays chat histories and runs agent response evaluations directly in the UI, providing the critical "human-in-the-loop" feedback necessary for compliance and governance. Additionally, users can now dynamically reference registered components (like an MCP tool) directly in their declarative `agent.yaml` files, and the ADK will seamlessly fetch and execute them at runtime via the platform.

## Architecture

- **Self-Service Portal:** The unified frontend for interacting with agents and managing lifecycle states.
- **Automated Repo Scanner:** A service that ingests GitHub URLs, parses code structure, and automates component registration.
- **Microservice Registries:** Decoupled backing services (Agent, MCP, Skill, KB) that store component metadata and state.
- **Agent Evaluator UI:** The interface for human-in-the-loop response evaluation and chat history auditing.

```mermaid
graph TD
    subgraph SG1 [Enterprise AI Platform UI]
        UI[Self-Service Portal]
        Chat["Chat Interface & Human Eval"]
    end

    subgraph SG2 [Control Plane]
        Scanner[Automated Repo Scanner]
        LC[Lifecycle Manager]
    end

    subgraph SG3 [Microservice Registries]
        AR[Agent Registry]
        MR[MCP Registry]
        SR[Skill Registry]
        KR[KB Registry]
    end

    subgraph SG4 [Execution and Governance]
        ADK[ADK Server]
        YAML["agent.yaml"]
    end

    UI --> LC
    UI --> Chat
    UI --> Scanner

    Scanner -->|Scans Code| GitHub[GitHub Repos]
    GitHub -->|Auto-Registers| Registries["📦 Registries<br/>AR, MR, SR, KR"]
    Registries --> AR
    Registries --> MR
    Registries --> SR
    Registries --> KR

    LC -->|CRUD / Lifecycle| Registries

    Chat -->|Interact & Audit| ADK
    YAML -->|Dynamic Resolution| Registries
    ADK -->|Execute| Registries

    classDef ui fill:#8a2be2,stroke:#fff,stroke-width:2px,color:#fff;
    classDef control fill:#0066cc,stroke:#fff,stroke-width:2px,color:#fff;
    classDef reg fill:#28a745,stroke:#fff,stroke-width:2px,color:#fff;
    
    class UI,Chat ui;
    class Scanner,LC control;
    class AR,MR,SR,KR reg;
```

## Sample UI Images

![Sample UI Image 1](ai_platform.svg)


## Live Registry Explorer

<div style="margin: 2rem 0; padding: 1.5rem; background: var(--color-bg-light); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden;">
  <style>
    .registry-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--color-border);
      flex-wrap: wrap;
    }
    .registry-tab-btn {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      color: var(--color-text-light);
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all 0.3s ease;
    }
    .registry-tab-btn:hover {
      color: var(--color-accent);
    }
    .registry-tab-btn.active {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
    }
    .registry-container {
      display: none;
    }
    .registry-container.active {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 1.5rem;
    }
    .registry-sidebar {
      border-right: 1px solid var(--color-border);
      max-height: 400px;
      overflow-y: auto;
    }
    .registry-sidebar-item {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: var(--color-bg);
      border-left: 4px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }
    .registry-sidebar-item:hover {
      background: var(--color-border);
      border-left-color: var(--color-accent);
    }
    .registry-sidebar-item.selected {
      background: var(--color-accent);
      color: white;
      border-left-color: white;
    }
    .registry-main {
      padding: 0 0.5rem;
    }
    .registry-detail {
      background: var(--color-bg);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }
    .detail-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-accent);
    }
    .detail-badge {
      background: var(--color-accent);
      color: white;
      padding: 0.35rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .detail-section {
      margin-top: 1rem;
    }
    .detail-label {
      font-weight: 600;
      color: var(--color-text-light);
      font-size: 0.85rem;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .detail-value {
      color: var(--color-text);
      font-size: 0.95rem;
      line-height: 1.6;
    }
    .interaction-box {
      background: var(--color-bg-light);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 1rem;
      margin-top: 1rem;
    }
    .interaction-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-bg);
      color: var(--color-text);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .interaction-btn {
      padding: 0.6rem 1.2rem;
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .interaction-btn:hover {
      background: var(--color-accent-dark);
    }
    .registry-container.dashboard-tab.active {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .metric-box {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
    }
    .metric-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .metric-number {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-accent);
      margin-bottom: 0.5rem;
    }
    .metric-label {
      font-size: 0.9rem;
      color: var(--color-text-light);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dashboard-section {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1.5rem;
    }
    .dashboard-section-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-accent);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .registry-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .stat-item {
      padding: 1rem;
      background: var(--color-bg-light);
      border-radius: 6px;
      border-left: 4px solid var(--color-accent);
    }
    .stat-name {
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 0.25rem;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-accent);
    }
    .stat-meta {
      font-size: 0.8rem;
      color: var(--color-text-light);
      margin-top: 0.25rem;
    }
  </style>

  <div class="registry-tabs">
    <button class="registry-tab-btn active" onclick="switchRegistry(event, 'agents')">🤖 Agents</button>
    <button class="registry-tab-btn" onclick="switchRegistry(event, 'mcps')">🔧 MCP Servers</button>
    <button class="registry-tab-btn" onclick="switchRegistry(event, 'skills')">⚡ Skills</button>
    <button class="registry-tab-btn" onclick="switchRegistry(event, 'kbs')">📚 Knowledge Bases</button>
    <button class="registry-tab-btn" onclick="switchRegistry(event, 'dashboard')">📊 Dashboard</button>
  </div>

  <!-- Agents Tab -->
  <div id="agents" class="registry-container active">
    <div class="registry-sidebar">
      <div class="registry-sidebar-item selected" onclick="selectComponent(this, 'agent-csa')">Customer Support</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'agent-cra')">Code Review</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'agent-daa')">Data Analysis</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'agent-er')">Email Responder</div>
    </div>
    <div class="registry-main">
      <div id="agent-csa" class="registry-detail">
        <div class="detail-header">
          <div class="detail-title">Customer Support Agent</div>
          <div class="detail-badge">Prod</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Handles customer inquiries with multi-turn conversation support</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Dependencies</div>
          <div class="detail-value">Slack Notification Server, Email Parsing Skill</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Status</div>
          <div class="detail-value">✅ Active (Uptime: 99.8%)</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Query</div>
          <input type="text" class="interaction-input" placeholder="Enter a customer query...">
          <button class="interaction-btn">Send</button>
        </div>
      </div>
      <div id="agent-cra" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Code Review Agent</div>
          <div class="detail-badge">Prod</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Analyzes code for quality, security, and best practices</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Dependencies</div>
          <div class="detail-value">GitHub Integration MCP, SQL Query MCP</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Status</div>
          <div class="detail-value">✅ Active (Uptime: 99.9%)</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Query</div>
          <input type="text" class="interaction-input" placeholder="Enter a GitHub repo URL...">
          <button class="interaction-btn">Analyze</button>
        </div>
      </div>
      <div id="agent-daa" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Data Analysis Agent</div>
          <div class="detail-badge">Staging</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Processes data queries and generates insights with visualizations</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Dependencies</div>
          <div class="detail-value">SQL Query MCP, Cloud Storage MCP</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Status</div>
          <div class="detail-value">⚠️ Staging (Ready for testing)</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Query</div>
          <input type="text" class="interaction-input" placeholder="Enter SQL query...">
          <button class="interaction-btn">Execute</button>
        </div>
      </div>
      <div id="agent-er" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Email Responder</div>
          <div class="detail-badge">Dev</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Drafts and sends intelligent email responses with context awareness</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Dependencies</div>
          <div class="detail-value">Email Parsing Skill, Sentiment Analysis</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Status</div>
          <div class="detail-value">🔧 Dev (In development)</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Query</div>
          <input type="text" class="interaction-input" placeholder="Enter email content...">
          <button class="interaction-btn">Draft Response</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MCP Servers Tab -->
  <div id="mcps" class="registry-container">
    <div class="registry-sidebar">
      <div class="registry-sidebar-item selected" onclick="selectComponent(this, 'mcp-gh')">GitHub Integration</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'mcp-slack')">Slack Notifications</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'mcp-sql')">SQL Query</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'mcp-cs')">Cloud Storage</div>
    </div>
    <div class="registry-main">
      <div id="mcp-gh" class="registry-detail">
        <div class="detail-header">
          <div class="detail-title">GitHub Integration MCP</div>
          <div class="detail-badge">Prod</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Endpoints</div>
          <div class="detail-value">read_repo | list_issues | create_pr | update_status</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Code Review Agent, Data Analysis Agent</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Call</div>
          <input type="text" class="interaction-input" placeholder="e.g., owner/repo">
          <button class="interaction-btn">Call Endpoint</button>
        </div>
      </div>
      <div id="mcp-slack" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Slack Notification Server</div>
          <div class="detail-badge">Prod</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Endpoints</div>
          <div class="detail-value">send_message | post_thread | add_reaction | update_status</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Customer Support Agent, Email Responder</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Call</div>
          <input type="text" class="interaction-input" placeholder="Enter message...">
          <button class="interaction-btn">Send Test</button>
        </div>
      </div>
      <div id="mcp-sql" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">SQL Query MCP</div>
          <div class="detail-badge">Prod</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Endpoints</div>
          <div class="detail-value">execute_query | describe_schema | get_stats | validate_query</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Data Analysis Agent, Code Review Agent</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Call</div>
          <input type="text" class="interaction-input" placeholder="SELECT * FROM...">
          <button class="interaction-btn">Execute</button>
        </div>
      </div>
      <div id="mcp-cs" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Cloud Storage MCP</div>
          <div class="detail-badge">Staging</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Endpoints</div>
          <div class="detail-value">upload_file | download_file | list_objects | delete_object</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Data Analysis Agent (Staging)</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Call</div>
          <input type="text" class="interaction-input" placeholder="Enter file path...">
          <button class="interaction-btn">Upload</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Skills Tab -->
  <div id="skills" class="registry-container">
    <div class="registry-sidebar">
      <div class="registry-sidebar-item selected" onclick="selectComponent(this, 'skill-ep')">Email Parsing</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'skill-sa')">Sentiment Analysis</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'skill-ds')">Doc Summarizer</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'skill-cg')">Code Generator</div>
    </div>
    <div class="registry-main">
      <div id="skill-ep" class="registry-detail">
        <div class="detail-header">
          <div class="detail-title">Email Parsing Skill</div>
          <div class="detail-badge">v1.2</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Extracts sender, recipient, subject, body, and attachments from emails</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Customer Support Agent, Email Responder</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Input</div>
          <input type="text" class="interaction-input" placeholder="Paste email content...">
          <button class="interaction-btn">Parse</button>
        </div>
      </div>
      <div id="skill-sa" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Sentiment Analysis</div>
          <div class="detail-badge">v2.0</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Analyzes text sentiment with confidence scoring (positive, negative, neutral)</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Customer Support Agent</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Input</div>
          <input type="text" class="interaction-input" placeholder="Enter text to analyze...">
          <button class="interaction-btn">Analyze</button>
        </div>
      </div>
      <div id="skill-ds" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Document Summarizer</div>
          <div class="detail-badge">v1.5</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Generates concise summaries from long-form documents</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Data Analysis Agent, Code Review Agent</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Input</div>
          <input type="text" class="interaction-input" placeholder="Paste document...">
          <button class="interaction-btn">Summarize</button>
        </div>
      </div>
      <div id="skill-cg" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Code Generator</div>
          <div class="detail-badge">v3.1</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">Generates code snippets based on natural language specifications</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Code Review Agent (Coming soon)</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Test Input</div>
          <input type="text" class="interaction-input" placeholder="Describe what you want to code...">
          <button class="interaction-btn">Generate</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Knowledge Bases Tab -->
  <div id="kbs" class="registry-container">
    <div class="registry-sidebar">
      <div class="registry-sidebar-item selected" onclick="selectComponent(this, 'kb-pd')">Product Docs</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'kb-ar')">API Reference</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'kb-ip')">Internal Policies</div>
      <div class="registry-sidebar-item" onclick="selectComponent(this, 'kb-cg')">Compliance</div>
    </div>
    <div class="registry-main">
      <div id="kb-pd" class="registry-detail">
        <div class="detail-header">
          <div class="detail-title">Product Documentation</div>
          <div class="detail-badge">2.3K docs</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Content</div>
          <div class="detail-value">User guides, feature documentation, troubleshooting guides</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Customer Support Agent, Data Analysis Agent</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Search</div>
          <input type="text" class="interaction-input" placeholder="Search documentation...">
          <button class="interaction-btn">Search</button>
        </div>
      </div>
      <div id="kb-ar" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">API Reference</div>
          <div class="detail-badge">450 endpoints</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Content</div>
          <div class="detail-value">API specifications, endpoint documentation, authentication guides</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Code Review Agent, Data Analysis Agent</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Search</div>
          <input type="text" class="interaction-input" placeholder="Search API endpoints...">
          <button class="interaction-btn">Search</button>
        </div>
      </div>
      <div id="kb-ip" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Internal Policies</div>
          <div class="detail-badge">128 docs</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Content</div>
          <div class="detail-value">Company policies, procedures, guidelines, and best practices</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">Email Responder, Customer Support Agent</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Search</div>
          <input type="text" class="interaction-input" placeholder="Search policies...">
          <button class="interaction-btn">Search</button>
        </div>
      </div>
      <div id="kb-cg" class="registry-detail" style="display:none;">
        <div class="detail-header">
          <div class="detail-title">Compliance Guide</div>
          <div class="detail-badge">89 docs</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Content</div>
          <div class="detail-value">Data protection, security standards, audit trails, GDPR compliance</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Used By</div>
          <div class="detail-value">All agents for governance</div>
        </div>
        <div class="interaction-box">
          <div class="detail-label">Search</div>
          <input type="text" class="interaction-input" placeholder="Search compliance docs...">
          <button class="interaction-btn">Search</button>
        </div>
      </div>
    </div>
  </div>

<div id="dashboard" class="registry-container dashboard-tab">
  <div class="dashboard-grid">
    <div class="metric-box"><div class="metric-icon">🤖</div><div class="metric-number">4</div><div class="metric-label">Active Agents</div></div>
    <div class="metric-box"><div class="metric-icon">🔧</div><div class="metric-number">4</div><div class="metric-label">MCP Servers</div></div>
    <div class="metric-box"><div class="metric-icon">⚡</div><div class="metric-number">4</div><div class="metric-label">Skills</div></div>
    <div class="metric-box"><div class="metric-icon">📚</div><div class="metric-number">4</div><div class="metric-label">Knowledge Bases</div></div>
    <div class="metric-box"><div class="metric-icon">✅</div><div class="metric-number">3,850</div><div class="metric-label">Total Interactions</div></div>
    <div class="metric-box"><div class="metric-icon">⭐</div><div class="metric-number">4.7/5</div><div class="metric-label">Avg. Satisfaction</div></div>
  </div>
  <div class="dashboard-section">
    <div class="dashboard-section-title">📊 Registry Breakdown</div>
    <div class="registry-stats">
      <div class="stat-item"><div class="stat-name">🤖 Agents</div><div class="stat-value">4</div><div class="stat-meta">3 Prod | 1 Dev</div></div>
      <div class="stat-item"><div class="stat-name">🔧 MCP Servers</div><div class="stat-value">4</div><div class="stat-meta">3 Prod | 1 Staging</div></div>
      <div class="stat-item"><div class="stat-name">⚡ Skills</div><div class="stat-value">4</div><div class="stat-meta">Avg Version: 2.2</div></div>
      <div class="stat-item"><div class="stat-name">📚 Knowledge Bases</div><div class="stat-value">3.1K</div><div class="stat-meta">Total Documents</div></div>
    </div>
  </div>
  <div class="dashboard-section">
    <div class="dashboard-section-title">📈 Utilization Metrics</div>
    <div class="registry-stats">
      <div class="stat-item"><div class="stat-name">Agent Requests (24h)</div><div class="stat-value">1,240</div><div class="stat-meta">↑ 12% vs yesterday</div></div>
      <div class="stat-item"><div class="stat-name">API Calls (24h)</div><div class="stat-value">8,750</div><div class="stat-meta">↑ 8% vs yesterday</div></div>
      <div class="stat-item"><div class="stat-name">Avg Response Time</div><div class="stat-value">240ms</div><div class="stat-meta">Within SLA ✅</div></div>
      <div class="stat-item"><div class="stat-name">System Uptime</div><div class="stat-value">99.9%</div><div class="stat-meta">This Month</div></div>
    </div>
  </div>
  <div class="dashboard-section">
    <div class="dashboard-section-title">🎯 Quality Metrics</div>
    <div class="registry-stats">
      <div class="stat-item"><div class="stat-name">Agent Accuracy</div><div class="stat-value">92%</div><div class="stat-meta">Avg across all agents</div></div>
      <div class="stat-item"><div class="stat-name">Error Rate</div><div class="stat-value">0.8%</div><div class="stat-meta">Below threshold</div></div>
      <div class="stat-item"><div class="stat-name">User Satisfaction</div><div class="stat-value">4.7/5</div><div class="stat-meta">Based on 520 reviews</div></div>
      <div class="stat-item"><div class="stat-name">Completion Rate</div><div class="stat-value">96%</div><div class="stat-meta">Tasks completed</div></div>
    </div>
  </div>
</div>

  <script>
    function switchRegistry(e, tabId) {
      document.querySelectorAll('.registry-container').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.registry-tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      e.target.classList.add('active');
    }
    function selectComponent(el, componentId) {
      const sidebar = el.parentElement;
      sidebar.querySelectorAll('.registry-sidebar-item').forEach(item => item.classList.remove('selected'));
      el.classList.add('selected');
      
      const main = sidebar.nextElementSibling;
      main.querySelectorAll('.registry-detail').forEach(detail => detail.style.display = 'none');
      document.getElementById(componentId).style.display = 'block';
    }
  </script>
</div>

## Business Outcomes
- **Frictionless Adoption:** Automated repo scanning reduced the time to publish an agent or MCP server to the enterprise from hours to seconds.
- **Audit-Ready AI:** Centralized chat history and integrated response evaluation provided compliance and operations teams with the exact governance trail they required.
- **Composable AI:** The ability to dynamically reference registered tools within `agent.yaml` created a highly composable ecosystem where complex agents can be assembled entirely from pre-existing, community-built blocks.
