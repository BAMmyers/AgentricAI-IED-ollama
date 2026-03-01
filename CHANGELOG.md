# Changelog

All notable changes to AgentricAI IED (Integrated Execution Desktop) will be documented in this file.

## [1.5.0] - 2024-12-XX

### Added
- **Hive Mind Collective Intelligence** — All agents work as unified collective
  - OrchestratorAlpha task planning with JSON output
  - Full context passing between agents
  - Artifact extraction and assembly
  - `hive <mission>` terminal command
  
- **Comprehensive Test Suite**
  - `test-suite.ts` — Automated 7-phase test runner
  - `test-output.txt` — Verbose documentation of test results
  - Sample generated app: `output/test-crypto-tracker.html`

- **Hive Executor Service** (`src/services/hiveExecutor.ts`)
  - Task planning prompts
  - Agent execution with context injection
  - Artifact extraction from responses
  - Final output assembly

### Changed
- Agent data flow now properly passes through shared context
- OrchestratorAlpha delegates tasks by agent NAME for simplicity
- Verbose mode shows real-time agent thinking during hive execution

## [1.4.0] - 2024-12-XX

### Added
- **Verbose Mode** — Real-time agent thinking visibility
  - Toggle button in top bar
  - `verbose`, `verbose on`, `verbose off` terminal commands
  - Streaming token display with completion stats

## [1.3.0] - 2024-12-XX

### Added
- **Output Directory System** — Runtime code evolution
  - Save workflow outputs to `/output` directory
  - Custom agent import from outputs
  - `outputs`, `output <id>` terminal commands

- **Auto-Sync to GitHub**
  - PowerShell/Bash scripts for continuous sync
  - GitHub Actions CI/CD workflows
  - VS Code task integration
  - Git hooks for pre-push validation

## [1.2.0] - 2024-12-XX

### Added
- **Team Builder** — Multi-agent execution workflows
  - Toggle select button (👤+) on agent hover
  - TeamPanel with drag-to-reorder
  - Sequential team execution with chain-of-thought
  - `team`, `team-clear` terminal commands

## [1.1.0] - 2024-12-XX

### Added
- **Agent Roster by Categories** — 101 agents across 19 folders
  - Collapsible category tree
  - Search across all agents
  - Compact/detail view toggle
  - Category-specific icons and colors

- **SQLite Database** — Persistent memory for Consciousness agents
  - sql.js (WebAssembly SQLite)
  - IndexedDB persistence
  - Memory service for agent state
  - `memory`, `memory clear`, `memory agent <name>` commands

- **Knowledge Base System** — Academic publications integration
  - Semantic Scholar, OpenAlex, arXiv APIs
  - Domain-specific knowledge per agent
  - `kb status`, `kb populate <agent>`, `kb search <query>` commands

### Changed
- All agents now default to `AgentricAIcody` model
- Branding updated to "AgentricAI" with new logo
- Model dropdown shows all 14 local Ollama models

## [1.0.0] - 2024-12-XX

### Added
- Initial release
- **Multi-Agent Platform** with Ollama integration
- **Dark Futuristic UI** with neon accents
- **File Explorer** with syntax icons
- **Code Workspace** with tabbed editor
- **Terminal Panel** with command history
- **Workflow Builder** for sequential agent execution
- **Debug Logging** with `init` command and `debug-log.txt` export

### Agent Categories (19)
- Consciousness (3)
- Core \ System (11)
- Tool-Enabled (5)
- System \ OS (2)
- Data \ Integration (8)
- Development \ Code (7)
- Content \ Language (15)
- Support (6)
- Advanced Research \ Theory (1)
- Academic \ Research (7)
- Quantum Studies (8)
- Security (8)
- Security Enforcement (5)
- Security Reporting (3)
- External Review \ Impact Analysis (6)
- Governance (2)
- Correlation (2)
- Playbook Management (1)
- Validation (1)

---

## License

MIT License — Copyright (c) 2024 BAMmyers / AgentricAI Studios
