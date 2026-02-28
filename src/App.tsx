import { useState, useEffect, useCallback } from 'react';
import {
  Code, Workflow, MessageSquare, Settings, Layers,
  Monitor, RefreshCw, Database
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CreateAgentModal } from './components/CreateAgentModal';
import { FileTree } from './components/FileTree';
import { CodeWorkspace } from './components/CodeWorkspace';
import { TerminalPanel } from './components/TerminalPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { useOllama, DEFAULT_MODEL } from './hooks/useOllama';
import { DEFAULT_AGENTS } from './data/agentRoster';
import type {
  Agent, ChatMessage, FileNode, TerminalLine,
  Workflow as WorkflowType, WorkflowStep
} from './types';
import { cn } from './utils/cn';

// Demo file tree
const DEMO_FILES: FileNode[] = [
  {
    name: 'agentric-project',
    path: '/agentric-project',
    type: 'folder',
    children: [
      {
        name: 'src',
        path: '/agentric-project/src',
        type: 'folder',
        children: [
          {
            name: 'main.ts',
            path: '/agentric-project/src/main.ts',
            type: 'file',
            language: 'typescript',
            content: `import { AgentricOrchestrator } from './orchestrator';\nimport { AgentPool } from './agents';\n\nasync function main() {\n  const pool = new AgentPool();\n  const orchestrator = new AgentricOrchestrator(pool);\n\n  // Initialize agents with AgentricAIcody as default model\n  await orchestrator.initialize();\n\n  // Start workflow execution\n  const workflow = await orchestrator.createWorkflow({\n    name: 'Code Review Pipeline',\n    steps: [\n      { agent: 'architect', task: 'Analyze codebase structure' },\n      { agent: 'reviewer', task: 'Review code quality' },\n      { agent: 'debugger', task: 'Check for potential bugs' },\n    ],\n  });\n\n  await orchestrator.execute(workflow);\n  console.log('Workflow completed successfully!');\n}\n\nmain().catch(console.error);`,
          },
          {
            name: 'orchestrator.ts',
            path: '/agentric-project/src/orchestrator.ts',
            type: 'file',
            language: 'typescript',
            content: `import type { Workflow } from './types';\nimport type { AgentPool } from './agents';\n\nexport class AgentricOrchestrator {\n  private pool: AgentPool;\n  private activeWorkflows: Map<string, Workflow> = new Map();\n\n  constructor(pool: AgentPool) {\n    this.pool = pool;\n  }\n\n  async initialize(): Promise<void> {\n    console.log('[AgentricAI] Initializing orchestrator...');\n    console.log('[AgentricAI] Default model: AgentricAIcody');\n    await this.pool.warmup();\n    console.log('[AgentricAI] Ready.');\n  }\n\n  async createWorkflow(config: any): Promise<Workflow> {\n    const workflow: Workflow = {\n      id: crypto.randomUUID(),\n      name: config.name,\n      steps: config.steps.map((s: any) => ({\n        id: crypto.randomUUID(),\n        ...s,\n        status: 'pending',\n      })),\n      status: 'idle',\n      createdAt: Date.now(),\n    };\n    this.activeWorkflows.set(workflow.id, workflow);\n    return workflow;\n  }\n\n  async execute(workflow: Workflow): Promise<void> {\n    workflow.status = 'running';\n    for (const step of workflow.steps) {\n      step.status = 'running';\n      const agent = this.pool.getAgent(step.agentId);\n      if (agent) {\n        step.output = await agent.run(step.instruction);\n        step.status = 'completed';\n      } else {\n        step.status = 'failed';\n      }\n    }\n    workflow.status = 'completed';\n  }\n}`,
          },
          {
            name: 'agents.ts',
            path: '/agentric-project/src/agents.ts',
            type: 'file',
            language: 'typescript',
            content: `export interface AgentConfig {\n  name: string;\n  role: string;\n  model: string;\n  systemPrompt: string;\n}\n\nexport class Agent {\n  config: AgentConfig;\n\n  constructor(config: AgentConfig) {\n    this.config = config;\n  }\n\n  async run(instruction: string): Promise<string> {\n    // Connect to Ollama for local inference\n    // Default model: AgentricAIcody\n    const response = await fetch('http://localhost:11434/api/generate', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({\n        model: this.config.model,\n        prompt: instruction,\n        system: this.config.systemPrompt,\n        stream: false,\n      }),\n    });\n    const data = await response.json();\n    return data.response;\n  }\n}\n\nexport class AgentPool {\n  private agents: Map<string, Agent> = new Map();\n\n  register(id: string, config: AgentConfig): void {\n    this.agents.set(id, new Agent(config));\n  }\n\n  getAgent(id: string): Agent | undefined {\n    return this.agents.get(id);\n  }\n\n  async warmup(): Promise<void> {\n    console.log(\`[Pool] Warming up \${this.agents.size} agents...\`);\n  }\n}`,
          },
          {
            name: 'types.ts',
            path: '/agentric-project/src/types.ts',
            type: 'file',
            language: 'typescript',
            content: `export interface Workflow {\n  id: string;\n  name: string;\n  steps: WorkflowStep[];\n  status: 'idle' | 'running' | 'completed' | 'failed';\n  createdAt: number;\n}\n\nexport interface WorkflowStep {\n  id: string;\n  agentId: string;\n  instruction: string;\n  status: 'pending' | 'running' | 'completed' | 'failed';\n  output?: string;\n}`,
          },
        ],
      },
      {
        name: 'config',
        path: '/agentric-project/config',
        type: 'folder',
        children: [
          {
            name: 'agents.yaml',
            path: '/agentric-project/config/agents.yaml',
            type: 'file',
            language: 'yaml',
            content: `# AgentricAI Agent Configuration\n# All agents use Ollama for local, offline inference\n# Default model: AgentricAIcody\n\nagents:\n  - name: CodeWeaver\n    role: coder\n    model: AgentricAIcody\n    temperature: 0.3\n    tools:\n      - file_read\n      - file_write\n      - terminal_exec\n      - git_ops\n\n  - name: ArchMind\n    role: architect\n    model: dolphin-llama3\n    temperature: 0.5\n    tools:\n      - file_read\n      - code_analysis\n\n  - name: BugHunter\n    role: debugger\n    model: qwen2.5-coder\n    temperature: 0.2\n    tools:\n      - file_read\n      - test_runner\n      - code_analysis\n\n  - name: Luna\n    role: researcher\n    model: CrimsonDragonX7/Luna\n    temperature: 0.6\n    tools:\n      - web_search\n      - file_read\n\navailable_models:\n  primary:\n    - AgentricAIcody      # Default coding model\n    - AgentricAI          # General purpose\n    - qwen2.5-coder       # Code specialist\n    - dolphin-llama3      # Uncensored general\n    - dolphin-phi         # Small & fast\n    - dolphin-uncensored  # Unrestricted\n    - glm-4.7-flash       # Fast inference\n    - llama2-uncensored   # Classic uncensored\n    - lacy                # Custom model\n  embeddings:\n    - nomic-embed-text    # For RAG/search\n  custom:\n    - AgentricAi/AgentricAI_LLaVa  # Vision model\n    - AgentricAi/AgentricAI_TLM    # Task model\n    - AgentricAi/lacy               # Custom variant\n    - CrimsonDragonX7/Luna          # Luna model`,
          },
          {
            name: 'ollama.yaml',
            path: '/agentric-project/config/ollama.yaml',
            type: 'file',
            language: 'yaml',
            content: `# Ollama Configuration\nendpoint: http://localhost:11434\ndefault_model: AgentricAIcody\n\n# Model pull priority (auto-pull if missing)\npull_queue:\n  - AgentricAIcody\n  - qwen2.5-coder\n  - dolphin-llama3\n\n# Performance settings\nmax_concurrent: 2\nkeep_alive: 5m\nnum_gpu: 1\nnum_thread: 8\n\n# Model-specific overrides\nmodels:\n  AgentricAIcody:\n    temperature: 0.3\n    num_predict: 4096\n    top_p: 0.9\n    repeat_penalty: 1.1\n  qwen2.5-coder:\n    temperature: 0.2\n    num_predict: 4096\n  dolphin-llama3:\n    temperature: 0.7\n    num_predict: 2048`,
          },
        ],
      },
      {
        name: 'package.json',
        path: '/agentric-project/package.json',
        type: 'file',
        language: 'json',
        content: `{\n  "name": "agentric-project",\n  "version": "2.0.0",\n  "type": "module",\n  "scripts": {\n    "start": "tsx src/main.ts",\n    "dev": "tsx watch src/main.ts"\n  },\n  "dependencies": {\n    "ollama": "^0.5.0"\n  }\n}`,
      },
      {
        name: 'README.md',
        path: '/agentric-project/README.md',
        type: 'file',
        language: 'markdown',
        content: `# AgentricAI Project\n\nMulti-agent orchestration powered by Ollama.\nDefault model: **AgentricAIcody**\n\n## Local Models\n\n| Model | Type | Use Case |\n|-------|------|----------|\n| AgentricAIcody | Coding | Default for all code tasks |\n| qwen2.5-coder | Coding | Alternative code specialist |\n| dolphin-llama3 | General | Research & writing |\n| CrimsonDragonX7/Luna | General | Creative tasks |\n| glm-4.7-flash | Fast | Quick inference |\n| nomic-embed-text | Embedding | RAG & search |\n\n## Getting Started\n\n1. Ensure Ollama is running: \`ollama serve\`\n2. Pull default model: \`ollama pull AgentricAIcody\`\n3. Run: \`npm start\`\n\n## Architecture\n\n- **Orchestrator**: Manages workflow execution\n- **Agent Pool**: Handles agent lifecycle\n- **Workflows**: Chainable agent task sequences\n- **All inference is local** — no cloud dependencies`,
      },
    ],
  },
];

function flattenFiles(nodes: FileNode[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (n: FileNode) => {
    if (n.type === 'file' && n.content) {
      map.set(n.path, n.content);
    }
    n.children?.forEach(walk);
  };
  nodes.forEach(walk);
  return map;
}

// Inline SVG logo component
function AgentricLogo({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#00f0ff'}}/>
          <stop offset="100%" style={{stopColor:'#8b5cf6'}}/>
        </linearGradient>
      </defs>
      <polygon points="256,140 345,190 345,322 256,372 167,322 167,190" fill="none" stroke="url(#lg)" strokeWidth="14"/>
      <polygon points="256,195 310,290 202,290" fill="none" stroke="url(#lg)" strokeWidth="11"/>
      <circle cx="256" cy="258" r="22" fill="url(#lg)" opacity="0.9"/>
      <circle cx="256" cy="258" r="10" fill="#0a0a1a"/>
      <circle cx="256" cy="258" r="5" fill="#00f0ff"/>
    </svg>
  );
}

export default function App() {
  // Ollama
  const ollama = useOllama();

  // State
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [fileContents, setFileContents] = useState<Map<string, string>>(() => flattenFiles(DEMO_FILES));
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 'sys_1',
      type: 'system',
      content: 'AgentricAI Terminal v2.0 — Multi-Agent Orchestration Engine',
      timestamp: Date.now(),
    },
    {
      id: 'sys_2',
      type: 'system',
      content: `Default Model: ${DEFAULT_MODEL} | Backend: http://localhost:11434`,
      timestamp: Date.now(),
    },
    {
      id: 'sys_3',
      type: 'system',
      content: 'Type "help" for available commands. Type "models" to list installed Ollama models.',
      timestamp: Date.now(),
    },
    {
      id: 'sys_4',
      type: 'output',
      content: '─'.repeat(60),
      timestamp: Date.now(),
    },
  ]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [activeView, setActiveView] = useState<string>('editor');
  const [showFileTree, setShowFileTree] = useState(true);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;

  // Debug log entries
  const [debugLog, setDebugLog] = useState<string[]>([
    `[${new Date().toISOString()}] AgentricAI System Initialized`,
    `[${new Date().toISOString()}] Default Model: ${DEFAULT_MODEL}`,
    `[${new Date().toISOString()}] Agents Loaded: ${DEFAULT_AGENTS.length}`,
  ]);

  // Add debug log entry
  const logDebug = useCallback((entry: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${entry}`;
    setDebugLog(prev => [...prev, logEntry]);
    console.log(logEntry);
  }, []);

  // Download debug log as file
  const downloadDebugLog = useCallback(() => {
    const content = debugLog.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'debug-log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [debugLog]);

  // Add terminal line helper
  const addTerminalLine = useCallback((type: TerminalLine['type'], content: string, agentName?: string, agentColor?: string) => {
    setTerminalLines(prev => [...prev, {
      id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      type,
      content,
      timestamp: Date.now(),
      agentName,
      agentColor,
    }]);
  }, []);

  // Check Ollama connection on mount
  useEffect(() => {
    ollama.checkConnection().then(connected => {
      if (connected) {
        logDebug(`OLLAMA CONNECTED: ${ollama.models.length} models available`);
      } else {
        logDebug('OLLAMA OFFLINE: Connection check failed');
      }
    });
    const interval = setInterval(() => {
      ollama.checkConnection();
    }, 15000);
    return () => clearInterval(interval);
  }, [ollama.checkConnection, ollama.models.length, logDebug]);

  // Agent management
  const handleCreateAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
    addTerminalLine('system', `Agent "${agent.name}" deployed [${agent.role}] using ${agent.model}`);
  };

  const handleDeleteAgent = (id: string) => {
    const agent = agents.find(a => a.id === id);
    setAgents(prev => prev.filter(a => a.id !== id));
    if (selectedAgentId === id) setSelectedAgentId(null);
    if (agent) addTerminalLine('system', `Agent "${agent.name}" terminated`);
  };

  // Send message to agent
  const handleSendMessage = async (agentId: string, message: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      agentId,
      agentName: 'You',
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    addTerminalLine('agent', `[${agent.model}] ${message.slice(0, 80)}${message.length > 80 ? '...' : ''}`, agent.name, agent.color);

    // Update agent status
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'running' as const } : a));
    setIsGenerating(true);
    setStreamingContent('');

    try {
      // Build message history
      const agentMessages = messages
        .filter(m => m.agentId === agentId)
        .map(m => ({ role: m.role, content: m.content }));
      
      agentMessages.push({ role: 'user', content: message });

      const chatMessages = [
        { role: 'system', content: agent.systemPrompt },
        ...agentMessages,
      ];

      let fullResponse = '';

      const response = await ollama.chat(
        agent.model,
        chatMessages,
        (token) => {
          fullResponse += token;
          setStreamingContent(fullResponse);
        },
        agent.temperature,
        agent.maxTokens
      );

      // Require real Ollama response - no simulation
      const finalResponse = response || `⚠️ No response received from ${agent.model}. Ensure Ollama is running and the model is loaded.`;

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        agentId,
        agentName: agent.name,
        role: 'assistant',
        content: finalResponse,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingContent('');
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'success' as const } : a));
      addTerminalLine('agent', `[Response] ${finalResponse.slice(0, 100)}${finalResponse.length > 100 ? '...' : ''}`, agent.name, agent.color);
      logDebug(`CHAT OK: ${agent.name} | Model: ${agent.model} | Response length: ${finalResponse.length}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      
      // Show error message - no fake fallback
      const errorResponse = `## ⚠️ Connection Error\n\n**Agent:** ${agent.name}\n**Model:** ${agent.model}\n**Error:** ${errorMsg}\n\n### Troubleshooting\n1. Ensure Ollama is running: \`ollama serve\`\n2. Check model is available: \`ollama list\`\n3. Pull model if missing: \`ollama pull ${agent.model}\`\n\n> This agent requires a live Ollama connection. No simulated responses are used.`;
      
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        agentId,
        agentName: agent.name,
        role: 'assistant',
        content: errorResponse,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingContent('');
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'error' as const } : a));
      addTerminalLine('error', `Ollama error: ${errorMsg}`);
      logDebug(`CHAT ERROR: ${agent.name} | ${errorMsg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initialize single agent with a basic ping
  const initializeAgent = useCallback(async (agent: Agent): Promise<{ success: boolean; response: string; duration: number }> => {
    const startTime = Date.now();
    const initPrompt = `System initialization check. Respond with a brief confirmation that you (${agent.name}) are operational and ready. Include your primary function.`;
    
    try {
      const response = await ollama.generate(
        agent.model,
        initPrompt,
        agent.systemPrompt,
        undefined,
        0.3,
        256
      );
      
      const duration = Date.now() - startTime;
      return { success: !!response, response: response || 'No response', duration };
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, response: `ERROR: ${errorMsg}`, duration };
    }
  }, [ollama]);

  // Run full agent initialization workflow
  const runAgentInitialization = useCallback(async () => {
    if (!ollama.isConnected) {
      addTerminalLine('error', 'Cannot initialize agents: Ollama is offline. Start Ollama first.');
      logDebug('INIT FAILED: Ollama offline');
      return;
    }

    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    addTerminalLine('system', '  AGENTRIC AI — AGENT INITIALIZATION SEQUENCE');
    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    logDebug('INIT START: Beginning agent initialization sequence');

    const results: { agent: Agent; success: boolean; response: string; duration: number }[] = [];
    
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      addTerminalLine('agent', `[${i + 1}/${agents.length}] Initializing ${agent.name} (${agent.model})...`, agent.name, agent.color);
      
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'running' as const } : a));
      
      const result = await initializeAgent(agent);
      results.push({ agent, ...result });
      
      if (result.success) {
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'success' as const } : a));
        addTerminalLine('output', `  ✓ ${agent.name}: Ready (${result.duration}ms)`);
        logDebug(`INIT OK: ${agent.name} | Model: ${agent.model} | Time: ${result.duration}ms | Response: ${result.response.slice(0, 100)}`);
      } else {
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'error' as const } : a));
        addTerminalLine('error', `  ✗ ${agent.name}: Failed - ${result.response}`);
        logDebug(`INIT FAIL: ${agent.name} | Model: ${agent.model} | Error: ${result.response}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

    addTerminalLine('system', '───────────────────────────────────────────────────────────');
    addTerminalLine('system', `  INITIALIZATION COMPLETE: ${successCount} OK, ${failCount} FAILED, ${totalTime}ms total`);
    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    logDebug(`INIT COMPLETE: Success=${successCount}, Failed=${failCount}, TotalTime=${totalTime}ms`);

    // Auto-download debug log after initialization
    setTimeout(() => {
      downloadDebugLog();
      addTerminalLine('system', '  📄 Debug log saved to debug-log.txt');
    }, 500);

  }, [agents, ollama.isConnected, initializeAgent, addTerminalLine, logDebug, downloadDebugLog]);

  const handleRunAgent = (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;
    if (agent.status === 'running') {
      ollama.abort();
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'idle' as const } : a));
      addTerminalLine('system', `Agent "${agent.name}" execution halted`);
    } else {
      setSelectedAgentId(id);
      addTerminalLine('agent', `Agent "${agent.name}" activated [${agent.model}] — awaiting instructions`, agent.name, agent.color);
    }
  };

  // File management
  const handleSelectFile = (node: FileNode) => {
    if (node.type === 'file') {
      setActiveFile(node);
      setActiveView('editor');
    }
  };

  const handleUpdateFileContent = (path: string, content: string) => {
    setFileContents(prev => {
      const next = new Map(prev);
      next.set(path, content);
      return next;
    });
  };

  // Terminal commands
  const handleTerminalCommand = (cmd: string) => {
    addTerminalLine('input', cmd);

    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help':
        addTerminalLine('output', 'AgentricAI Commands:');
        addTerminalLine('output', '  init                — Initialize all agents (requires Ollama)');
        addTerminalLine('output', '  agents              — List all agents and their models');
        addTerminalLine('output', '  status              — Show system status');
        addTerminalLine('output', '  models              — List all installed Ollama models');
        addTerminalLine('output', '  run <agent>         — Activate an agent by name');
        addTerminalLine('output', '  workflows           — List workflows');
        addTerminalLine('output', '  pull <model>        — Pull an Ollama model');
        addTerminalLine('output', '  log                 — Download debug log');
        addTerminalLine('output', '  default             — Show default model info');
        addTerminalLine('output', '  clear               — Clear terminal');
        addTerminalLine('output', '  help                — Show this help');
        break;
      case 'init':
        runAgentInitialization();
        break;
      case 'log':
        downloadDebugLog();
        addTerminalLine('system', 'Debug log downloaded to debug-log.txt');
        break;
      case 'agents':
        if (agents.length === 0) {
          addTerminalLine('output', 'No agents registered.');
        } else {
          // Group by category
          const catMap = new Map<string, Agent[]>();
          agents.forEach(a => {
            const cat = a.category || 'Uncategorized';
            if (!catMap.has(cat)) catMap.set(cat, []);
            catMap.get(cat)!.push(a);
          });
          for (const [cat, catAgents] of catMap) {
            addTerminalLine('output', ``);
            addTerminalLine('system', `  📁 ${cat} (${catAgents.length})`);
            catAgents.forEach(a => {
              const statusIcon = a.status === 'running' ? '🟢' : a.status === 'error' ? '🔴' : '⚪';
              addTerminalLine('output', `     ${statusIcon} ${a.name.padEnd(28)} ${a.model.padEnd(20)} [${a.logic}]`);
            });
          }
          addTerminalLine('output', ``);
          addTerminalLine('output', `  Total: ${agents.length} agents across ${catMap.size} categories`);
        }
        break;
      case 'status':
        addTerminalLine('output', `  Ollama:         ${ollama.isConnected ? '🟢 Connected (localhost:11434)' : '🔴 Offline'}`);
        addTerminalLine('output', `  Default Model:  ${DEFAULT_MODEL}`);
        addTerminalLine('output', `  Agents:         ${agents.length} registered, ${agents.filter(a => a.status === 'running').length} active`);
        addTerminalLine('output', `  Models:         ${ollama.models.length} available`);
        addTerminalLine('output', `  Workflows:      ${workflows.length} total`);
        break;
      case 'models':
        if (ollama.models.length === 0) {
          addTerminalLine('output', 'No models found. Ensure Ollama is running.');
        } else {
          addTerminalLine('output', '  MODEL                           SIZE      DEFAULT');
          addTerminalLine('output', '  ' + '─'.repeat(55));
          ollama.models.forEach(m => {
            const sizeStr = m.size > 0 ? `${(m.size / 1e9).toFixed(1)}GB` : 'N/A';
            const isDefault = m.name === DEFAULT_MODEL ? '  ★' : '';
            addTerminalLine('output', `  ${m.name.padEnd(32)}${sizeStr.padEnd(10)}${isDefault}`);
          });
        }
        break;
      case 'default':
        addTerminalLine('output', `  Default Model: ${DEFAULT_MODEL}`);
        addTerminalLine('output', `  Endpoint:      http://localhost:11434`);
        addTerminalLine('output', `  Usage:         All new agents default to ${DEFAULT_MODEL}`);
        break;
      case 'pull': {
        const modelName = parts.slice(1).join(' ');
        if (!modelName) {
          addTerminalLine('error', 'Usage: pull <model-name>');
        } else if (!ollama.isConnected) {
          addTerminalLine('error', 'Ollama is offline. Start Ollama first.');
        } else {
          addTerminalLine('system', `Pulling model: ${modelName}...`);
          ollama.pullModel(modelName, (status, completed, total) => {
            if (completed && total) {
              const pct = Math.round((completed / total) * 100);
              addTerminalLine('output', `  ${status}: ${pct}%`);
            } else {
              addTerminalLine('output', `  ${status}`);
            }
          }).then(ok => {
            if (ok) {
              addTerminalLine('system', `Model "${modelName}" pulled successfully`);
              ollama.checkConnection();
            } else {
              addTerminalLine('error', `Failed to pull "${modelName}"`);
            }
          });
        }
        break;
      }
      case 'run': {
        const agentName = parts.slice(1).join(' ');
        const agent = agents.find(a => a.name.toLowerCase() === agentName.toLowerCase());
        if (agent) {
          setSelectedAgentId(agent.id);
          addTerminalLine('system', `Activated agent: ${agent.name} [${agent.model}]`);
        } else {
          addTerminalLine('error', `Agent not found: ${agentName}`);
          addTerminalLine('output', `  Available: ${agents.map(a => a.name).join(', ')}`);
        }
        break;
      }
      case 'workflows':
        if (workflows.length === 0) {
          addTerminalLine('output', 'No workflows created.');
        } else {
          workflows.forEach(w => {
            addTerminalLine('output', `  [${w.status.toUpperCase().padEnd(9)}] ${w.name} (${w.steps.length} steps)`);
          });
        }
        break;
      case 'clear':
        setTerminalLines([]);
        break;
      default:
        addTerminalLine('error', `Unknown command: ${command}. Type "help" for available commands.`);
    }
  };

  // Workflow management
  const handleCreateWorkflow = (name: string, steps: Omit<WorkflowStep, 'id' | 'status'>[]) => {
    const workflow: WorkflowType = {
      id: `wf_${Date.now()}`,
      name,
      steps: steps.map(s => ({
        ...s,
        id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        status: 'pending' as const,
      })),
      status: 'idle',
      createdAt: Date.now(),
    };
    setWorkflows(prev => [...prev, workflow]);
    addTerminalLine('system', `Workflow "${name}" created with ${steps.length} steps`);
  };

  const handleRunWorkflow = async (id: string) => {
    const wfIndex = workflows.findIndex(w => w.id === id);
    if (wfIndex === -1) return;

    // Reset and run
    setWorkflows(prev => prev.map(w => {
      if (w.id !== id) return w;
      return {
        ...w,
        status: 'running',
        steps: w.steps.map(s => ({ ...s, status: 'pending' as const, output: undefined, duration: undefined })),
      };
    }));

    const workflow = workflows[wfIndex];
    addTerminalLine('system', `Starting workflow: ${workflow.name}`);

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const agent = agents.find(a => a.id === step.agentId);
      if (!agent) {
        setWorkflows(prev => prev.map(w => {
          if (w.id !== id) return w;
          const steps = [...w.steps];
          steps[i] = { ...steps[i], status: 'failed' };
          return { ...w, steps, status: 'failed' };
        }));
        addTerminalLine('error', `Step ${i + 1} failed: Agent not found`);
        return;
      }

      // Set step running
      setWorkflows(prev => prev.map(w => {
        if (w.id !== id) return w;
        const steps = [...w.steps];
        steps[i] = { ...steps[i], status: 'running' };
        return { ...w, steps };
      }));

      addTerminalLine('agent', `Step ${i + 1}: ${agent.name} [${agent.model}] → ${step.instruction}`, agent.name, agent.color);
      const startTime = Date.now();

      try {
        let response = '';
        try {
          response = await ollama.generate(
            agent.model,
            step.instruction,
            agent.systemPrompt,
            undefined,
            agent.temperature,
            agent.maxTokens
          );
        } catch (genErr) {
          const genErrMsg = genErr instanceof Error ? genErr.message : 'Generation failed';
          response = `⚠️ Agent ${agent.name} failed: ${genErrMsg}`;
          logDebug(`WORKFLOW STEP ERROR: ${agent.name} | ${genErrMsg}`);
        }
        
        if (!response) {
          response = `⚠️ No response from ${agent.name} (${agent.model}). Model may not be loaded.`;
          logDebug(`WORKFLOW STEP EMPTY: ${agent.name} | No response received`);
        }

        const duration = Date.now() - startTime;

        setWorkflows(prev => prev.map(w => {
          if (w.id !== id) return w;
          const steps = [...w.steps];
          steps[i] = { ...steps[i], status: 'completed', output: response, duration };
          return { ...w, steps };
        }));

        addTerminalLine('output', `  ✓ Completed in ${(duration / 1000).toFixed(1)}s`);
      } catch (err) {
        const duration = Date.now() - startTime;
        setWorkflows(prev => prev.map(w => {
          if (w.id !== id) return w;
          const steps = [...w.steps];
          steps[i] = { ...steps[i], status: 'failed', duration };
          return { ...w, steps, status: 'failed' };
        }));
        addTerminalLine('error', `  ✗ Step failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return;
      }
    }

    setWorkflows(prev => prev.map(w =>
      w.id === id ? { ...w, status: 'completed' } : w
    ));
    addTerminalLine('system', `Workflow "${workflow.name}" completed successfully`);
    logDebug(`WORKFLOW COMPLETE: ${workflow.name} | Steps: ${workflow.steps.length}`);
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const viewButtons = [
    { id: 'editor', icon: Code, label: 'Editor' },
    { id: 'workflows', icon: Workflow, label: 'Workflows' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-void noise-bg">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-void border-b border-border-dim z-20 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-glow/70 hover:bg-red-glow transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-amber-glow/70 hover:bg-amber-glow transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-emerald-glow/70 hover:bg-emerald-glow transition-colors cursor-pointer" />
          </div>
          <div className="h-4 w-px bg-border-dim" />
          <div className="flex items-center gap-1.5">
            <AgentricLogo size={18} />
            <span className="text-[10px] font-bold tracking-[0.15em] text-text-muted" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              AGENTR<span className="text-cyan">IC</span><span className="text-violet">AI</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border-dim" />
          <div className="flex items-center gap-1 text-[9px] text-text-muted bg-surface/50 px-2 py-0.5 rounded-md border border-border-dim">
            <Database size={9} className="text-cyan" />
            <span className="font-mono">{DEFAULT_MODEL}</span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-abyss rounded-lg p-0.5 border border-border-dim">
          {viewButtons.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-medium transition-all',
                activeView === v.id
                  ? 'bg-surface text-cyan'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <v.icon size={11} />
              {v.label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Monitor size={11} />
            <span>Offline-Ready</span>
          </div>
          <button
            onClick={() => ollama.checkConnection()}
            className={cn(
              'flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all',
              ollama.isConnected ? 'bg-emerald-glow/10 text-emerald-glow' : 'bg-red-glow/10 text-red-glow hover:bg-red-glow/20'
            )}
          >
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              ollama.isConnected ? 'bg-emerald-glow' : 'bg-red-glow animate-pulse'
            )} />
            <span>{ollama.isConnected ? 'Ollama Online' : 'Ollama Offline'}</span>
            {!ollama.isConnected && <RefreshCw size={9} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Agent Roster */}
        <Sidebar
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
          onCreateAgent={() => setShowCreateModal(true)}
          onDeleteAgent={handleDeleteAgent}
          onRunAgent={handleRunAgent}
          isConnected={ollama.isConnected}
          onCheckConnection={ollama.checkConnection}
        />

        {/* Activity Bar */}
        <div className="flex flex-col items-center w-10 bg-void border-r border-border-dim py-2 gap-1">
          <button
            onClick={() => setShowFileTree(!showFileTree)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showFileTree ? 'bg-surface text-cyan' : 'text-text-muted hover:text-text-secondary'
            )}
            title="Explorer"
          >
            <Layers size={16} />
          </button>
          <button
            onClick={() => setActiveView('editor')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              activeView === 'editor' ? 'bg-surface text-cyan' : 'text-text-muted hover:text-text-secondary'
            )}
            title="Editor"
          >
            <Code size={16} />
          </button>
          <button
            onClick={() => {
              if (selectedAgent) setActiveView('editor');
              else if (agents.length > 0) {
                setSelectedAgentId(agents[0].id);
                setActiveView('editor');
              }
            }}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-text-muted hover:text-text-secondary'
            )}
            title="Chat"
          >
            <MessageSquare size={16} />
          </button>
          <button
            onClick={() => setActiveView('workflows')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              activeView === 'workflows' ? 'bg-surface text-violet' : 'text-text-muted hover:text-text-secondary'
            )}
            title="Workflows"
          >
            <Workflow size={16} />
          </button>
          <div className="flex-1" />
          <button
            className="p-2 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* File Tree */}
        {showFileTree && (
          <div className="w-56 border-r border-border-dim bg-abyss flex-shrink-0">
            <FileTree
              files={DEMO_FILES}
              selectedPath={activeFile?.path || null}
              onSelectFile={handleSelectFile}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'workflows' ? (
            <WorkflowPanel
              agents={agents}
              workflows={workflows}
              onCreateWorkflow={handleCreateWorkflow}
              onRunWorkflow={handleRunWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              activeView={activeView}
            />
          ) : (
            <CodeWorkspace
              agents={agents}
              selectedAgent={selectedAgent}
              activeFile={activeFile}
              messages={messages}
              onSendMessage={handleSendMessage}
              onStopGeneration={() => ollama.abort()}
              isGenerating={isGenerating}
              streamingContent={streamingContent}
              onUpdateFileContent={handleUpdateFileContent}
              files={fileContents}
            />
          )}

          {/* Terminal */}
          <TerminalPanel
            lines={terminalLines}
            onCommand={handleTerminalCommand}
            onClear={() => setTerminalLines([])}
          />
        </div>
      </div>

      {/* Create Agent Modal */}
      <CreateAgentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAgent}
        models={ollama.models}
      />
    </div>
  );
}
