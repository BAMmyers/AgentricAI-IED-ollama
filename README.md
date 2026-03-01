<p align="center">
  <img src="public/logo.svg" alt="AgentricAI Logo" width="120" height="120" />
</p>

<h1 align="center">AgentricAI — IED (Integrated Execution Desktop)</h1>

<p align="center">
  <strong>Multi-Agent Orchestration Platform for Local LLM Workflows</strong>
</p>

<p align="center">
  <a href="https://github.com/BAMmyers/AgentricAI-IED-ollama"><img src="https://img.shields.io/badge/GitHub-Repository-181717?logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Ollama-Local%20LLM-000000?logo=ollama" alt="Ollama" />
  <img src="https://img.shields.io/badge/Agents-101-22d3ee" alt="101 Agents" />
  <img src="https://img.shields.io/badge/Categories-19-e879f9" alt="19 Categories" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#features">Features</a> •
  <a href="#-team-builder--multi-agent-execution">Team Builder</a> •
  <a href="#-auto-sync--github-automation">Auto-Sync</a> •
  <a href="#terminal-commands">Commands</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  A futuristic, dark-themed IDE for orchestrating 101 specialized AI agents powered by <a href="https://ollama.ai">Ollama</a> for fully offline, privacy-first LLM execution.
</p>

---

## 🆕 What's New

### v1.5 — Hive Mind Collective Intelligence
- **Hive Mind Execution** — All agents work as one unified collective intelligence
- **OrchestratorAlpha Task Planning** — Automatically breaks down missions into agent-specific tasks BY NAME
- **Chain-of-Thought Context** — Each agent receives full context from all previous agents
- **Artifact Extraction** — Automatically extracts code, files, and data from agent responses
- **Non-Sequential Execution** — Tasks execute based on dependencies, not fixed order
- **Terminal Command**: `hive <mission>` — Execute a complete multi-agent mission — v1.4

### 🧠 Verbose Mode — Agent Thinking Visibility
> Watch your agents think in real-time!

- **Toggle Button** — Click "Verbose" in the top bar to enable/disable
- **Live Thinking Stream** — See tokens stream to terminal as agents process
- **Plain Text Output** — Clean, readable thinking blocks with agent name, model, and timing
- **Terminal Commands** — `verbose`, `verbose on`, `verbose off`

[📖 Full Verbose Mode Documentation](#-verbose-mode--agent-thinking-visibility)

### 🔄 Auto-Sync — Automatic GitHub Updates
> Push changes to GitHub automatically with zero effort!

- **🔄 Auto-Sync Script** — Watches for changes, auto-commits and pushes
- **⚡ Quick Push** — One-command commit with smart messages
- **🛡️ Pre-Push Hooks** — Build verification before pushing
- **🤖 GitHub Actions** — CI/CD for build validation and deployment
- **📋 VS Code Tasks** — Run scripts directly from VS Code

[📖 Full Auto-Sync Documentation](#-auto-sync--github-automation)

### Output Directory — Runtime Code Evolution
> Execute workflows that generate **new agents, code, and data** — all saved to a sandboxed output directory!

- **📂 Output Panel** — View, preview, and manage all workflow outputs
- **🤖 Custom Agents** — Agents created during workflows are auto-imported to roster
- **📦 Export/Import** — Download output bundles for backup or sharing
- **🔒 Core Immutable** — Generated code stays separate from core app code
- **⚡ Real-time Evolution** — Workflows can create agents that join future workflows

### Team Builder — Multi-Agent Execution
> Assemble a team of agents and execute them as a coordinated unit!

- **👤+ Select Button** — Hover over any agent, click to add to team
- **Drag-to-Reorder** — Arrange agents in execution order
- **Chain-of-Thought** — Each agent receives previous agents' responses
- **Real-time Status** — Watch each agent process in sequence
- **Execution Report** — Success/fail summary with timing

[📖 Full Team Builder Documentation](#-team-builder--multi-agent-execution)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/BAMmyers/AgentricAI-IED-ollama.git
cd AgentricAI-IED-ollama

# Install dependencies
npm install

# Start Ollama (in a separate terminal)
ollama serve

# Pull the default model
ollama pull AgentricAIcody

# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

---

## Table of Contents

- [What's New](#-whats-new--v13)
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Agent System](#agent-system)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Team Builder](#-team-builder--multi-agent-execution)
- [Output Directory](#-output-directory--runtime-code-evolution)
- [Auto-Sync](#-auto-sync--github-automation)
- [Terminal Commands](#terminal-commands)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 📸 Screenshots

<details>
<summary>Click to expand screenshots</summary>

### Main Interface
> Dark-themed IDE with collapsible agent roster, code workspace, and terminal

### Agent Roster
> 101 agents organized into 19 collapsible category folders with search and filtering

### Team Builder
> Select agents with toggle buttons, reorder with drag-and-drop, execute as coordinated team

### Workflow Builder
> Visual pipeline builder for chaining agents into multi-step workflows

### Chat Interface
> Real-time streaming chat with agents, powered by Ollama

### Terminal
> Integrated command-line interface with agent commands and debug logging

*Screenshots coming soon — run the app locally to see the full interface!*

</details>

---

## Overview

AgentricAI is a browser-based multi-agent orchestration platform designed for developers, researchers, and security professionals who need to coordinate multiple specialized AI agents for complex workflows. Unlike cloud-dependent solutions, AgentricAI runs entirely on your local machine using Ollama as the LLM backend, ensuring:

- **Complete Privacy**: All data stays on your machine
- **Offline Operation**: No internet required after initial model download
- **Zero API Costs**: Use your own hardware for inference
- **Full Control**: Customize agents, models, and workflows

### Design Philosophy

1. **No Simulated Responses**: Every AI response comes from real Ollama inference
2. **Transparent Logging**: All operations are logged for debugging and audit
3. **Modular Agents**: 101 pre-built agents across 19 categories, fully customizable
4. **Workflow-First**: Chain agents into sequential pipelines for complex tasks

---

## Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **101 Pre-built Agents** | Specialized agents for security, development, research, quantum studies, and more |
| **19 Category Folders** | Organized agent roster with collapsible folders and search |
| **🆕 Team Builder** | Select multiple agents with toggle buttons, reorder, and execute as a coordinated team |
| **Workflow Builder** | Visual pipeline builder to chain agents into multi-step workflows |
| **Streaming Responses** | Real-time token-by-token output from Ollama |
| **Code Workspace** | Tabbed editor with syntax highlighting and line numbers |
| **Integrated Terminal** | Command-line interface for system operations |
| **File Explorer** | Hierarchical file tree with language-specific icons |
| **Debug Logging** | Comprehensive event logging with export to `debug-log.txt` |

### Agent Categories

| Category | Count | Purpose |
|----------|-------|---------|
| Consciousness | 3 | Persistent memory systems (Collective, Simulated, Theoretical) |
| Core \ System | 11 | Orchestration, security, logging, maintenance |
| Tool-Enabled | 5 | Python, Git, file system, image analysis |
| System \ OS | 2 | Process management, application launching |
| Data \ Integration | 8 | Data transformation, extraction, web crawling |
| Development \ Code | 7 | Code generation, refactoring, documentation |
| Content \ Language | 15 | Writing, translation, summarization, diagrams |
| Support | 6 | Tutoring, counseling, email drafting |
| Advanced Research \ Theory | 1 | Frontier science exploration |
| Academic \ Research | 7 | Physics, biology, chemistry, CS, astronomy, history, psychology |
| Quantum Studies | 8 | Quantum theory, fields, waves, energy, entanglement, algorithms |
| Security | 8 | Threat detection, anomaly detection, sandboxing |
| Security Enforcement | 5 | Isolation, blocking, quarantine, credential reset |
| Security Reporting | 3 | Incident reports, threat intel sync, audit trails |
| External Review \ Impact Analysis | 6 | Environmental, economic, human, ethical, regulatory review |
| Governance | 2 | Human approval gateway, policy compliance |
| Correlation | 2 | Event correlation, timeline reconstruction |
| Playbook Management | 1 | Response playbook storage and validation |
| Validation | 1 | Response validation for safety and correctness |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AgentricAI Frontend                           │
│                         (React + TypeScript + Vite)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   Sidebar   │  │  Code Workspace │  │   Workflow / Team Panel     │ │
│  │             │  │                 │  │                             │ │
│  │ • 19 Cats   │  │ • Tabbed Editor │  │ • Pipeline Builder          │ │
│  │ • 101 Agents│  │ • Chat View     │  │ • Team Builder              │ │
│  │ • Search    │  │ • File Editing  │  │ • Multi-Agent Execution     │ │
│  │ • Team Toggle│ │ • Streaming     │  │ • Chain-of-Thought          │ │
│  └─────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Terminal Panel                              │   │
│  │  • Command History  • Agent Commands  • Debug Logging            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                          useOllama Hook                                 │
│              (Streaming Chat, Generate, Model Discovery)                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                │ HTTP (localhost:11434)
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                           Ollama Server                                 │
│                        (Local LLM Inference)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Models:                                                                │
│  • AgentricAIcody (default)    • dolphin-llama3      • qwen2.5-coder   │
│  • dolphin-uncensored          • glm-4.7-flash       • llama2-uncensored│
│  • AgentricAi/AgentricAI_LLaVa • CrimsonDragonX7/Luna                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → Chat message or workflow trigger
2. **Agent Selection** → Agent's system prompt + model loaded
3. **Ollama Request** → Streaming POST to `/api/chat`
4. **Token Streaming** → Real-time display in UI
5. **Logging** → Event captured in debug log
6. **State Update** → Agent status, chat history, workflow progress

---

## Agent System

### Agent Interface

```typescript
interface Agent {
  id: string;           // Unique identifier (e.g., "agent-cc", "tool-1")
  name: string;         // Display name (e.g., "Collective Consciousness")
  role: string;         // Detailed description of agent's purpose
  color: string;        // Hex color for UI theming
  status: 'idle' | 'running' | 'success' | 'error';
  model: string;        // Ollama model name (e.g., "AgentricAIcody")
  tools: string[];      // Available tools (e.g., ["python", "fileSystem"])
  temperature: number;  // LLM temperature (0.0 - 2.0)
  maxTokens: number;    // Maximum response tokens
  systemPrompt: string; // System prompt defining agent behavior
  category: string;     // Category folder (e.g., "Security")
  logic: 'local' | 'remote' | 'hybrid';  // Execution mode
}
```

### Model Assignments

| Agent Type | Default Model | Rationale |
|------------|---------------|-----------|
| Core System, Security, Development | `AgentricAIcody` | High-capability general purpose |
| Academic, Research, Content | `dolphin-llama3` | Strong reasoning and knowledge |
| Code Analysis, Validation | `qwen2.5-coder` | Code-optimized model |
| Creative, Theoretical | `dolphin-uncensored` | Unrestricted creative output |
| Image Analysis | `AgentricAi/AgentricAI_LLaVa` | Vision-language model |

### Creating Custom Agents

Via the UI:
1. Click **"+ Create Agent"** in the sidebar
2. Configure name, role, category, model, tools, and system prompt
3. Agent appears in the appropriate category folder

Programmatically (in `agentRoster.ts`):
```typescript
import { makeAgent } from './agentRoster';

const myAgent = makeAgent(
  'custom-001',                    // id
  'MyCustomAgent',                 // name
  'Performs specialized analysis', // role
  'AgentricAIcody',                // model
  ['read_file', 'write_file'],     // tools
  'Custom Category',               // category
  0.7,                             // temperature
  4096                             // maxTokens
);
```

---

## Prerequisites

### Required

| Dependency | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | ≥18.0.0 | JavaScript runtime |
| [npm](https://www.npmjs.com/) | ≥9.0.0 | Package manager |
| [Ollama](https://ollama.ai/) | ≥0.1.0 | Local LLM server |

### Recommended Models

```bash
# Default model (required)
ollama pull AgentricAIcody

# Additional models for specialized agents
ollama pull qwen2.5-coder
ollama pull dolphin-llama3
ollama pull dolphin-uncensored
ollama pull glm-4.7-flash

# Optional: Vision model for image analysis
ollama pull llava
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BAMmyers/AgentricAI-IED-ollama.git
cd AgentricAI-IED-ollama
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Ollama Server

```bash
# In a separate terminal
ollama serve
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open in Browser

Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## Configuration

### Ollama Endpoint

Default: `http://localhost:11434`

To use a different endpoint, modify `src/hooks/useOllama.ts`:

```typescript
const OLLAMA_BASE_URL = 'http://your-ollama-host:11434';
```

### Default Model

To change the default model, edit `src/hooks/useOllama.ts`:

```typescript
export const DEFAULT_MODEL = 'your-preferred-model';
```

### Agent Roster

All agents are defined in `src/data/agentRoster.ts`. To modify:

1. Edit agent properties directly in the file
2. Add/remove agents from category arrays
3. Update `CATEGORY_ORDER` for display ordering

### Styling

- **Colors**: `src/index.css` (CSS variables)
- **Tailwind**: `tailwind.config.js`
- **Component styles**: Inline Tailwind classes

---

## Usage

### Chat with an Agent

1. Click an agent in the sidebar
2. Type your message in the chat input
3. Press Enter or click Send
4. Watch the streaming response

### Create a Workflow

1. Click the **Workflows** tab (or press the workflow icon)
2. Click **"+ New Workflow"**
3. Enter workflow name and description
4. Click **"+ Add Step"** for each agent in the pipeline
5. Configure each step's prompt
6. Click **"Run Workflow"**

### File Editing

1. Click a file in the File Explorer
2. Edit in the Code Workspace
3. Changes are held in memory (implement save logic as needed)

---

## 👥 Team Builder — Multi-Agent Execution

The **Team Builder** enables you to assemble a team of agents and execute them sequentially on a shared mission. Each agent receives the combined context of all previous agent responses, creating a powerful chain-of-thought workflow.

### Selecting Agents

1. **Hover over any agent** in the roster sidebar
2. Three action buttons appear:
   - ▶️ **Play** — Run this agent individually
   - 👤+ **Select** — Toggle this agent into/out of the team
   - 🗑️ **Delete** — Remove this agent
3. **Click Select** to add the agent to your team
4. A magenta highlight and order badge (#1, #2, #3...) shows selected agents

### Team Panel

When you select your first agent, the **Team Panel** opens automatically:

| Element | Function |
|---------|----------|
| **Agent List** | Shows all selected agents with drag handles |
| **↑/↓ Arrows** | Reorder agents (or drag-and-drop) |
| **✕ Remove** | Remove agent from team |
| **Mission Input** | Enter the objective for all agents |
| **Execute Button** | Run the full team workflow |
| **Clear Team** | Deselect all agents |

### Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Mission Objective                          │
│              "Analyze auth module for vulnerabilities"          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent #1: ThreatPatternMatcher                                 │
│  Input: Mission objective                                       │
│  Output: "Found 3 patterns matching known vulnerabilities..."   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ (passes response to next agent)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent #2: CodeRefactorSuggestor                                │
│  Input: Mission + Agent #1's analysis                           │
│  Output: "Recommend refactoring the JWT validation logic..."    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ (passes combined responses)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent #3: BugHunter                                            │
│  Input: Mission + Agent #1 + Agent #2 responses                 │
│  Output: "Verified fix resolves CVE-2024-XXXX..."               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Execution Report │
                    │ 3/3 Success      │
                    │ Total: 12.4s     │
                    └─────────────────┘
```

### Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟣 Magenta ring on agent card | Agent is selected for team |
| `#1` `#2` `#3` badges | Execution order |
| Team count badge (activity bar) | Number of agents selected |
| "Team Selected" banner (sidebar) | Quick summary + clear button |
| Status dots during execution | ⏳ Pending → 🔄 Running → ✅ Success / ❌ Error |

### Example Team Workflow

**Security Audit Team:**
1. **ThreatPatternMatcher** — Scan for known vulnerability patterns
2. **AnomalyDetectionEngine** — Identify unusual code patterns  
3. **CodeRefactorSuggestor** — Recommend fixes
4. **EthicalComplianceOfficer** — Review for compliance issues
5. **IncidentReporter** — Generate formal audit report

**Research Team:**
1. **DrEvelynReedPhysics** — Analyze scientific feasibility
2. **NickTesla** — Explore theoretical possibilities
3. **LongTermViabilityAnalyst** — Assess sustainability
4. **ContentSummarizer** — Create executive summary

### Terminal Commands

| Command | Description |
|---------|-------------|
| `team` | Display current team selection |
| `team-clear` | Clear all selected agents |

---

## 🧠 Verbose Mode — Agent Thinking Visibility

**Verbose Mode** provides real-time visibility into agent reasoning, streaming the internal "thinking" process directly to the terminal as agents generate responses.

### Enabling Verbose Mode

**Option 1: UI Toggle**
- Click the **"Verbose"** button in the top bar (between the model badge and Ollama status)
- When enabled, button shows **"Verbose ON"** with amber highlight

**Option 2: Terminal Command**
```bash
> verbose on
🧠 Verbose mode ENABLED — Agent thinking will be streamed to terminal

> verbose off
🔇 Verbose mode DISABLED — Agent thinking hidden

> verbose
# Toggles current state
```

### What Verbose Mode Shows

When an agent processes a request, the terminal displays:

```
┌─ 🧠 ThreatPatternMatcher THINKING [AgentricAIcody] ─────────────────
│ Analyzing input and formulating response...
💭 ...analyzing the provided code for security vulnerabilities. I notice
   several patterns that match known CVE entries. First, the JWT validation
   logic appears to be susceptible to...
└─ ✓ Complete: 847 tokens in 3.42s ──────────────────
```

### Components

| Element | Description |
|---------|-------------|
| `┌─ 🧠 ... THINKING` | Header showing agent name and model |
| `│ Analyzing...` | Initial status message |
| `💭 ...` | Rolling window of last 200 characters being generated |
| `└─ ✓ Complete:` | Footer with token count and duration |

### Use Cases

1. **Debugging** — Understand why an agent gave a particular response
2. **Learning** — Watch how different models approach problems
3. **Performance** — Monitor token generation speed per model
4. **Presentation** — Show agent reasoning during demos

### Verbose Mode in Team Execution

When a team workflow runs with verbose mode enabled, each agent's thinking is displayed sequentially:

```
═════════════════════════════════════════════════════════════
  AGENTRIC AI — TEAM EXECUTION WORKFLOW
  Mission: Analyze authentication module...
  Team: 3 agents
═════════════════════════════════════════════════════════════

[1/3] ThreatPatternMatcher (AgentricAIcody) executing...
┌─ 🧠 ThreatPatternMatcher THINKING [AgentricAIcody] ─────────
│ Analyzing input and formulating response...
💭 ...checking against 47 known vulnerability patterns...
└─ ✓ Complete: 523 tokens in 2.14s ───────────────────────────
  ✓ ThreatPatternMatcher: Completed (2.1s)

[2/3] CodeRefactorSuggestor (qwen2.5-coder) executing...
┌─ 🧠 CodeRefactorSuggestor THINKING [qwen2.5-coder] ─────────
│ Analyzing input and formulating response...
💭 ...based on the security analysis, I recommend refactoring...
└─ ✓ Complete: 612 tokens in 2.87s ───────────────────────────
  ✓ CodeRefactorSuggestor: Completed (2.9s)

...
```

### Terminal Commands

| Command | Description |
|---------|-------------|
| `verbose` | Toggle verbose mode on/off |
| `verbose on` | Enable verbose mode |
| `verbose off` | Disable verbose mode |

### Performance Note

Verbose mode adds minimal overhead (updating terminal text) but can make the terminal scroll rapidly during long responses. For production batch workflows, consider disabling verbose mode.

---

## 🧠 Hive Mind — Collective Intelligence

The **Hive Mind** is AgentricAI's advanced orchestration paradigm where agents operate as a **unified collective intelligence** rather than isolated workers. The key differentiator: **OrchestratorAlpha plans and delegates tasks BY AGENT NAME**.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       USER MISSION                                   │
│  "Create a futuristic Tetris game with neon theme"                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: ORCHESTRATOR ALPHA (Task Planning)                        │
│                                                                     │
│  Analyzes mission → Creates task plan → Assigns BY NAME             │
│                                                                     │
│  Output JSON:                                                       │
│  [                                                                  │
│    {"agentName": "TheAlchemist", "task": "Design game arch"},       │
│    {"agentName": "SnippetCoder", "task": "Generate game code"},     │
│    {"agentName": "Visualizer", "task": "Create neon CSS"},          │
│    {"agentName": "Bug", "task": "Check for errors"},                │
│    {"agentName": "ResponseValidatorAgent", "task": "Final check"}   │
│  ]                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: TASK EXECUTION (Chain-of-Thought)                         │
│                                                                     │
│  Each agent receives FULL CONTEXT:                                  │
│  • Original mission                                                 │
│  • Their specific task                                              │
│  • ALL previous agent outputs                                       │
│  • Generated artifacts so far                                       │
│  • Errors to fix                                                    │
│                                                                     │
│  TheAlchemist → SnippetCoder → Visualizer → Bug → Validator         │
│       ↓              ↓             ↓          ↓          ↓          │
│   [design]      [game.js]     [style.css]  [fixes]    [✓/✗]        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: OUTPUT ASSEMBLY                                           │
│                                                                     │
│  • Extracts all code artifacts from responses                       │
│  • Combines HTML + CSS + JS                                         │
│  • Saves to /output directory                                       │
│  • Returns complete, runnable application                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Terminal Command

```bash
hive Create a Snake game with retro pixel art style
```

### Agent Roles in Hive Mind

| Role | Agents | Function |
|------|--------|----------|
| **Orchestrator** | OrchestratorAlpha, AgentricAI_001 | Plan tasks, delegate BY NAME |
| **Monitor** | Bug, Security_Sentinel, Logger, Mechanic | Background checks |
| **Consciousness** | Collective/Simulated/Theoretical | Persistent memory |
| **Executor** | SnippetCoder, TheAlchemist, Visualizer | Perform actual work |
| **Validator** | ResponseValidator, PolicyGatekeeper | Validate outputs |

### HiveContext Structure

Every agent in the Hive Mind receives a **HiveContext** prompt:

```
## YOUR IDENTITY
Name: SnippetCoder
Role: Generates small code snippets...
Category: Development \ Code

## MISSION OBJECTIVE
Create a Snake game with retro pixel art style

## YOUR CURRENT TASK
Generate the main game loop and rendering code

## PREVIOUS AGENT OUTPUTS (CHAIN OF THOUGHT)
### TheAlchemist:
[Full architecture design...]

## GENERATED ARTIFACTS SO FAR
### game_design.md
[Content...]

## INSTRUCTIONS
1. Complete your task thoroughly
2. Output COMPLETE, WORKING code
3. Wrap code in appropriate code blocks
```

### Data Flow

```typescript
// HiveExecutor creates context
const context: HiveContext = {
  mission: "Create a Tetris game...",
  artifacts: {},              // Accumulates generated code
  agentOutputs: [],           // All agent responses
  errors: [],                 // Errors to fix
  status: 'executing',
  currentPhase: 'Task 2/5',
};

// Each agent adds to context
context.agentOutputs.push({
  agentName: 'TheAlchemist',
  response: '## Architecture...',
  artifacts: [{ name: 'design.md', content: '...' }]
});

// Next agent sees all previous context
const prompt = buildAgentPrompt(agent, task, context);
```

---

## 📂 Output Directory — Runtime Code Evolution

The **Output Directory** system provides a sandboxed location for workflow-generated content, enabling real-time code evolution without risking the core application.

### How It Works

When a workflow or team execution completes:
1. **Results are saved** as timestamped output entries
2. **Custom agents** in the output are auto-detected and importable
3. **Files are downloadable** individually or as bundles
4. **Core code remains immutable** — generated code stays separate

### Output Types

| Type | Extension | Purpose |
|------|-----------|---------|
| `agent` | `.agent.json` | Custom agent definitions (auto-importable) |
| `workflow` | `.workflow.json` | Workflow execution results |
| `code` | `.ts`, `.tsx`, `.js` | Generated code files |
| `data` | `.json`, `.yaml` | Structured data outputs |
| `report` | `.md`, `.txt` | Analysis reports and logs |

### Output Panel

Access via the **📂 Output** button in the activity bar:

| Feature | Description |
|---------|-------------|
| **Output List** | All saved outputs with timestamps |
| **Preview Pane** | View content without downloading |
| **Import Agent** | One-click import of custom agents to roster |
| **Download** | Export individual files |
| **Export Bundle** | Download all outputs as ZIP |
| **Clear** | Remove old outputs |

### Terminal Commands

| Command | Description |
|---------|-------------|
| `outputs` | List all saved outputs |
| `output <id>` | Preview a specific output |
| `output-clear` | Clear all outputs |
| `output-export` | Download outputs bundle |

### Example: Agent Creation Workflow

```
Mission: "Create a new agent that specializes in Rust code review"

Team:
1. AgentDesigner → Designs agent spec
2. SnippetCoder → Generates system prompt
3. ResponseValidatorAgent → Validates the design

Output:
{
  "type": "agent",
  "name": "RustReviewer",
  "role": "Reviews Rust code for safety, performance, and idiomatic patterns",
  "model": "qwen2.5-coder",
  "category": "Development \\ Code"
}

→ Auto-imported to roster as custom agent!
```

---

## 🔄 Auto-Sync — GitHub Automation

Keep your repository automatically synchronized with zero manual effort.

### Quick Start

```bash
# One-time sync (commit + push)
.\scripts\quick-push.ps1

# Watch mode (continuous auto-sync)
.\scripts\auto-sync.ps1

# Custom interval (60 seconds)
.\scripts\auto-sync.ps1 -Interval 60
```

### Available Scripts

| Script | Platform | Purpose |
|--------|----------|---------|
| `scripts/auto-sync.ps1` | Windows PowerShell | Watch mode with auto-commit/push |
| `scripts/auto-sync.sh` | Linux/Mac Bash | Watch mode with auto-commit/push |
| `scripts/quick-push.ps1` | Windows PowerShell | One-command commit + push |
| `scripts/setup-hooks.ps1` | Windows PowerShell | Install Git hooks |

### Auto-Sync Features

- **🔍 Change Detection** — Monitors files every 30 seconds (configurable)
- **📝 Smart Commit Messages** — Auto-generates messages based on changed files:
  - Agent changes → `agents: Updated agent roster`
  - Output files → `output: New workflow output`
  - README changes → `docs: Updated documentation`
  - Code changes → `feat: Code updates`
- **🔄 Auto-Pull** — Pulls latest before pushing to prevent conflicts
- **📊 Visual Feedback** — Color-coded output showing what changed

### GitHub Actions

Two workflows are included in `.github/workflows/`:

#### `ci.yml` — Continuous Integration
```yaml
Triggers: Push to main/dev, Pull requests
Actions:
  ✓ Checkout code
  ✓ Install dependencies
  ✓ Type check (tsc --noEmit)
  ✓ Lint (eslint)
  ✓ Build
  ✓ Upload artifacts
```

#### `deploy.yml` — GitHub Pages Deployment
```yaml
Triggers: Push to main, Manual dispatch
Actions:
  ✓ Build production bundle
  ✓ Deploy to GitHub Pages
```

### Git Hooks

Install pre-push validation:

```bash
.\scripts\setup-hooks.ps1
```

This creates:
- **pre-push** — Runs `npm run build` before allowing push (prevents broken code)
- **post-commit** — Logs all commits to `.git/commit-log.txt`

### VS Code Integration

Run tasks directly from VS Code (`Ctrl+Shift+P` → "Tasks: Run Task"):

| Task | Description |
|------|-------------|
| Auto-Sync (Watch Mode) | Start continuous sync |
| Quick Push | Commit and push all changes |
| Setup Git Hooks | Install pre-push validation |
| Dev Server | Start Vite dev server |
| Build | Production build |
| Start Ollama | Launch Ollama server |

### Example Session

```powershell
PS> .\scripts\auto-sync.ps1

    _                    _        _        _    ___ 
   / \   __ _  ___ _ __ | |_ _ __(_) ___  / \  |_ _|
  / _ \ / _` |/ _ \ '_ \| __| '__| |/ __| / _ \  | | 
 / ___ \ (_| |  __/ | | | |_| |  | | (__ / ___ \ | | 
/_/   \_\__, |\___|_| |_|\__|_|  |_|\___/_/   \_\___|
        |___/                                        
                    Auto-Sync v1.0

Pulling latest from origin/main...
Watching for changes every 30 seconds...
Press Ctrl+C to stop.

[2024-01-15 14:32:15] Changes detected...
  Modified: src/App.tsx
  New:      src/components/NewFeature.tsx
[2024-01-15 14:32:16] Committed: feat: Code updates (2 files)
[2024-01-15 14:32:16] Pushing to origin/main...
[2024-01-15 14:32:18] Pushed successfully!

[2024-01-15 14:32:45] No changes detected.
```

---

## 📚 Knowledge Base — Academic Publications

AgentricAI includes a **real-time academic knowledge base** that fetches peer-reviewed publications from free, public APIs and stores them in SQLite for offline access. When agents with knowledge profiles are invoked, relevant papers are automatically injected into their context.

### Public API Sources (No API Keys Required)

| Source | URL | Coverage |
|--------|-----|----------|
| **Semantic Scholar** | api.semanticscholar.org | 200M+ papers with abstracts, citations |
| **OpenAlex** | api.openalex.org | 250M+ fully open scholarly works |
| **arXiv** | export.arxiv.org | 2M+ preprints in physics, CS, math |

### Agents with Knowledge Profiles (36 agents)

| Category | Agents | Domains |
|----------|--------|---------|
| **Academic \ Research** (7) | DrEvelynReedPhysics, DrArisThorneBiology, DrKenjiTanakaChemistry, DrLenaPetrovaCompSci, DrSamuelCarterAstronomy, ProfessorEleanorVanceHistory, DrMarcusColePsychology | Physics, Biology, Chemistry, CS, Astronomy, History, Psychology |
| **Quantum Studies** (8) | All 8 quantum specialists | QFT, Wave mechanics, Entanglement, Qubits, Algorithms, Vacuum, Energy |
| **Security** (4) | ThreatPatternMatcher, AnomalyDetectionEngine, Security_Sentinel_001, BitForceAction | Malware, IDS, SOC, Digital forensics |
| **Consciousness** (3) | Collective, Simulated, Theoretical | Knowledge graphs, Simulation theory, Philosophy of mind |
| **Development** (2) | TheAlchemist, AgentDesigner | Software architecture, Multi-agent systems |
| **Content** (4) | ContentSummarizer, SentimentAnalyzer, TextTranslator, PromptRefiner | NLP, Summarization, Translation, Prompt engineering |
| **Governance** (3) | EthicalComplianceOfficer, EnvironmentalImpactAnalyser, RegulatoryAffairsSpecialist | AI ethics, Environmental science, Regulation |
| **Core** (2) | OrchestratorAlpha, APIGateway | Orchestration, API design |
| **Data** (2) | Universal_Data_Adapter, RecursiveWebCrawler | ETL, Web crawling |
| **Research** (1) | NickTesla | EM theory, Wireless energy |

### Terminal Commands

| Command | Description |
|---------|-------------|
| `kb` | Show knowledge base statistics |
| `kb-populate` | Fetch publications for ALL profiled agents |
| `kb-populate <agent>` | Fetch publications for a specific agent |
| `kb-search <query>` | Search stored publications by title/author/abstract |
| `kb-agents` | List all agents with knowledge profiles |

### How It Works

```
1. Run "kb-populate" in terminal (fetches from all 3 APIs)
2. Papers stored in SQLite publications table
3. On agent chat, relevant papers auto-injected into system prompt
4. Agent grounds responses in real published research
5. All data persists offline in IndexedDB (survives restarts)
```

### Example

```bash
> kb-populate DrEvelynReedPhysics
  📚 Query 1/6: "quantum mechanics foundations"...
  📚 Query 2/6: "general relativity gravitational waves"...
  ✓ DrEvelynReedPhysics: 47 publications stored

> kb-search quantum entanglement
  Found 12 results for "quantum entanglement":
  [1] "Quantum entanglement" (2009)
      Authors: Horodecki, R., Horodecki, P., Horodecki, M.
      Citations: 5847
      DOI: 10.1103/RevModPhys.81.865
```

---

## Terminal Commands

| Command | Description |
|---------|-------------|
| `help` | Display all available commands |
| `clear` | Clear terminal output |
| `agents` | List all agents grouped by category |
| `status` | Show Ollama connection status and active agents |
| `models` | List available Ollama models |
| `workflows` | List all defined workflows |
| `run <workflow>` | Execute a workflow by name |
| `init` | Initialize all 101 agents with basic health check |
| `pull <model>` | Pull a new model from Ollama registry |
| `log` | Download debug log as `debug-log.txt` |
| `default` | Show default model information |
| `team` | Show current team selection with agent names |
| `team-clear` | Clear all selected team agents |
| `hive <mission>` | Execute Hive Mind collective intelligence mission |
| `verbose` | Toggle verbose mode (show agent thinking) |
| `verbose on` | Enable verbose mode |
| `verbose off` | Disable verbose mode |
| `outputs` | List all saved outputs with timestamps |
| `output <id>` | Preview a specific output |
| `output-clear` | Clear all outputs from storage |
| `output-export` | Download all outputs as bundle |
| `kb` | Show knowledge base statistics |
| `kb-populate` | Fetch publications for all profiled agents |
| `kb-populate <name>` | Fetch for a specific agent |
| `kb-search <query>` | Search all stored publications |
| `kb-agents` | List agents with knowledge profiles |

### Example Session

```bash
> status
[AgentricAI] Connection Status: ● Connected to Ollama
[AgentricAI] Active agents: 3/101
[AgentricAI] Default model: AgentricAIcody

> agents
📁 Consciousness (3)
   • Collective Consciousness
   • Simulated Consciousness
   • Theoretical Consciousness
📁 Core \ System (11)
   • APIGateway
   • AgentricAI_001
   ...

> init
[AgentricAI] Starting agent initialization...
[AgentricAI] Initializing Collective Consciousness (AgentricAIcody)...
[AgentricAI] ✓ Collective Consciousness initialized (1.2s)
...
[AgentricAI] Initialization complete. 101/101 agents ready.

> team
[AgentricAI] Current Team (3 agents):
  #1 ThreatPatternMatcher (Security)
  #2 CodeRefactorSuggestor (Development \ Code)
  #3 IncidentReporter (Security Reporting)

> team-clear
[AgentricAI] Team cleared.

> log
[AgentricAI] Downloading debug-log.txt...
```

---

## API Reference

### useOllama Hook

```typescript
import { useOllama, DEFAULT_MODEL } from './hooks/useOllama';

const {
  isConnected,      // boolean - Ollama server reachable
  models,           // OllamaModel[] - Available models
  isLoading,        // boolean - Request in progress
  streamingMessage, // string - Current streaming response
  error,            // string | null - Last error message
  sendMessage,      // (messages, model, onToken?) => Promise<string>
  generateResponse, // (prompt, model, system?) => Promise<string>
  pullModel,        // (modelName) => Promise<void>
  abortRequest,     // () => void - Cancel current request
  checkConnection,  // () => Promise<void>
} = useOllama();
```

### sendMessage

Send a chat message with conversation history:

```typescript
const response = await sendMessage(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  'AgentricAIcody',
  (token) => console.log('Token:', token)  // Optional streaming callback
);
```

### generateResponse

Single-shot generation without history:

```typescript
const response = await generateResponse(
  'Explain quantum entanglement',
  'dolphin-llama3',
  'You are a physics professor.'  // Optional system prompt
);
```

### Ollama REST API

AgentricAI communicates with Ollama via HTTP:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tags` | GET | List available models |
| `/api/chat` | POST | Streaming chat completion |
| `/api/generate` | POST | Single-shot generation |
| `/api/pull` | POST | Download a model |

---

## Project Structure

```
agentric-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml               # Continuous integration (build + lint)
│       └── deploy.yml           # GitHub Pages deployment
├── .vscode/
│   ├── settings.json            # VS Code workspace settings
│   └── tasks.json               # VS Code tasks (auto-sync, build, etc.)
├── scripts/
│   ├── auto-sync.ps1            # Windows auto-sync (watch mode)
│   ├── auto-sync.sh             # Linux/Mac auto-sync (watch mode)
│   ├── quick-push.ps1           # One-command commit + push
│   └── setup-hooks.ps1          # Install Git hooks
├── public/
│   └── logo.svg                 # AgentricAI logo
├── src/
│   ├── components/
│   │   ├── CodeWorkspace.tsx    # Tabbed editor + chat view
│   │   ├── CreateAgentModal.tsx # Agent creation form
│   │   ├── FileTree.tsx         # File explorer component
│   │   ├── OutputPanel.tsx      # Output directory browser
│   │   ├── Sidebar.tsx          # Agent roster with team toggles
│   │   ├── TeamPanel.tsx        # Multi-agent team builder & executor
│   │   ├── TerminalPanel.tsx    # Command-line interface
│   │   └── WorkflowPanel.tsx    # Workflow builder
│   ├── data/
│   │   ├── agentRoster.ts       # 101 agent definitions
│   │   ├── agentKnowledge.ts    # Agent knowledge profiles (36 agents)
│   │   └── outputManager.ts     # Output directory management
│   ├── services/
│   │   ├── knowledgeBase.ts     # Semantic Scholar + OpenAlex + arXiv API
│   │   └── memoryService.ts     # Consciousness memory operations
│   ├── db/
│   │   ├── database.ts          # SQLite (sql.js WASM) + IndexedDB
│   │   └── schema.sql           # Database schema
│   ├── hooks/
│   │   └── useOllama.ts         # Ollama API integration
│   ├── utils/
│   │   └── cn.ts                # Tailwind class merger
│   ├── App.tsx                  # Main application component
│   ├── index.css                # Global styles + dark theme
│   ├── main.tsx                 # React entry point
│   └── types.ts                 # TypeScript interfaces
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── README.md                    # This file
```

---

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Adding a New Agent Category

1. Add category to `CATEGORY_ORDER` in `agentRoster.ts`
2. Add color to `CATEGORY_COLORS`
3. Add icon to `CATEGORY_ICONS`
4. Create agents with `makeAgent()` and add to `DEFAULT_AGENTS`
5. Add category to `CreateAgentModal.tsx` dropdown

### Adding a New Terminal Command

In `App.tsx`, find the `handleTerminalCommand` function:

```typescript
case 'mycommand':
  addLine('output', 'My command output');
  logDebug('TERMINAL', 'mycommand executed');
  break;
```

### Customizing the Theme

Edit CSS variables in `src/index.css`:

```css
:root {
  --color-void: #030712;
  --color-abyss: #0a0f1a;
  --color-deep: #111827;
  --color-surface: #1f2937;
  --color-elevated: #374151;
  --color-cyan: #22d3ee;
  --color-magenta: #e879f9;
  --color-violet: #8b5cf6;
}
```

---

## Testing

### Comprehensive System Test

A full test suite is included that validates the entire AgentricAI platform:

```bash
# Run the test suite (requires tsx)
npx tsx test-suite.ts
```

**Test Output Files:**
- `test-output.txt` — Verbose documentation of all test phases
- `output/test-crypto-tracker.html` — Generated sample application

**Test Phases:**
| Phase | Description | Validation |
|-------|-------------|------------|
| 1 | System Integrity | Agent roster (101), categories (19), Ollama connection |
| 2 | Orchestrator Planning | Task breakdown via OrchestratorAlpha |
| 3 | Hive Mind Execution | Sequential agent execution with context passing |
| 4 | Output Assembly | HTML/CSS/JS artifact combination |
| 5 | Consciousness Memory | Agent output archival and persistence |
| 6 | Security Validation | Code security scan (eval, XSS, secrets) |
| 7 | Final Report | Summary with pass/fail status |

**Sample Test Task:**
> "Create a real-time cryptocurrency portfolio tracker with cyberpunk neon theme"

**Agents Exercised:**
- TheAlchemist → Blueprint/architecture
- JSONDataGenerator → Mock data structure
- SnippetCoder → HTML generation
- Visualizer → CSS theming
- DataConnector → JavaScript logic
- CodeCommenter → Documentation
- Bug → Error scanning
- ResponseValidatorAgent → Requirements validation

---

## Troubleshooting

### Ollama Connection Failed

```
Error: Failed to connect to Ollama
```

**Solutions:**
1. Ensure Ollama is running: `ollama serve`
2. Check Ollama is on port 11434: `curl http://localhost:11434/api/tags`
3. Check firewall settings
4. Verify no other process is using port 11434

### Model Not Found

```
Error: model 'AgentricAIcody' not found
```

**Solutions:**
1. Pull the model: `ollama pull AgentricAIcody`
2. Check available models: `ollama list`
3. Use terminal command: `models` to see what's available

### Slow Responses

**Solutions:**
1. Use a smaller model (e.g., `dolphin-phi` instead of `dolphin-llama3`)
2. Reduce `maxTokens` in agent configuration
3. Ensure sufficient RAM/VRAM for the model
4. Check GPU utilization: `nvidia-smi` (if using NVIDIA GPU)

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

---

## Contributing

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling (no external CSS files)
- Descriptive variable names
- JSDoc comments for complex functions

### Pull Request Process

1. Fork the repository at [github.com/BAMmyers/AgentricAI-IED-ollama](https://github.com/BAMmyers/AgentricAI-IED-ollama)
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test thoroughly
4. Ensure build passes: `npm run build`
5. Submit PR at [github.com/BAMmyers/AgentricAI-IED-ollama/pulls](https://github.com/BAMmyers/AgentricAI-IED-ollama/pulls)

### Agent Contributions

When contributing new agents:
- Use `makeAgent()` factory function
- Assign appropriate category
- Choose suitable model for the task
- Write clear, specific role descriptions
- Test with real Ollama inference

---

## License

MIT License

Copyright (c) 2024 BAMmyers / AgentricAI Studios

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<p align="center">
  <strong>Built with 🧠 by <a href="https://github.com/BAMmyers">BAMmyers</a> / AgentricAI Studios</strong>
</p>

<p align="center">
  <a href="https://github.com/BAMmyers/AgentricAI-IED-ollama/issues">Report Bug</a> •
  <a href="https://github.com/BAMmyers/AgentricAI-IED-ollama/issues">Request Feature</a> •
  <a href="https://github.com/BAMmyers/AgentricAI-IED-ollama/pulls">Submit PR</a>
</p>
