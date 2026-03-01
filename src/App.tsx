import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Code, Workflow, MessageSquare, Settings, Layers,
  Monitor, RefreshCw, Database, Users, FolderOutput, Eye, EyeOff, HardDrive, BookOpen
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CreateAgentModal } from './components/CreateAgentModal';
import { FileTree } from './components/FileTree';
import { CodeWorkspace } from './components/CodeWorkspace';
import { TerminalPanel } from './components/TerminalPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { TeamPanel, TeamExecutionResult } from './components/TeamPanel';
import OutputPanel from './components/OutputPanel';
import { MemoryPanel } from './components/MemoryPanel';
import { useOllama, DEFAULT_MODEL } from './hooks/useOllama';
import { useDatabase } from './hooks/useDatabase';
import {
  getMemorySummary,
  parseMemoryCommands,
  getCollectiveConsciousnessPrompt,
  getSimulatedConsciousnessPrompt,
  getTheoreticalConsciousnessPrompt,
  startConversation,
  addMessage,
} from './services/memoryService';
import {
  createContext as createHiveContext,
  buildPlannerPrompt,
  buildAgentPrompt,
  extractArtifacts,
  parseTaskPlan,
  buildFinalOutput,
  type HiveContext,
  type AgentOutput,
} from './services/hiveExecutor';
import { DEFAULT_AGENTS } from './data/agentRoster';
import {
  loadCustomAgents,
  saveCustomAgents,
  saveWorkflowOutput,
  createOutputFile,
  saveOutputFile,
  parseAgentFromOutput,
  extractCodeFromOutput,
  downloadOutputBundle,
  getOutputStats,
} from './data/outputManager';
import {
  ensurePublicationsTable,
  populateAgentKnowledge,
  populateAllAgentKnowledge,
  getAgentPublicationCount,
  getAllPublicationStats,
  searchPublications,
  getKnowledgeContextForAgent,
  getTotalPublicationCount,
  hasKnowledgeProfile,
} from './services/knowledgeBase';
import { getAgentProfile, getAgentsWithProfiles } from './data/agentKnowledge';
import type {
  Agent, ChatMessage, FileNode, TerminalLine,
  Workflow as WorkflowType, WorkflowStep, CustomAgent, WorkflowOutput
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

  // Team Builder state
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [isTeamExecuting, setIsTeamExecuting] = useState(false);
  const [teamExecutionResults, setTeamExecutionResults] = useState<TeamExecutionResult[]>([]);
  const [showTeamPanel, setShowTeamPanel] = useState(false);

  // Output Directory state
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);

  // Memory Panel state
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  // Database hook for SQLite persistence
  const database = useDatabase();

  // Verbose mode state - shows agent thinking in real-time
  const [verboseMode, setVerboseMode] = useState(false);
  const verboseLineRef = useRef<string | null>(null);

  // Hive Mind orchestration state
  const [isHiveMindActive, setIsHiveMindActive] = useState(false);
  const [hiveMindMission, setHiveMindMission] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;

  // runOrchestratedMission is defined below after helper functions are declared

  // Load custom agents on mount and merge with default agents
  useEffect(() => {
    const loaded = loadCustomAgents();
    setCustomAgents(loaded);
    if (loaded.length > 0) {
      // Merge custom agents into agent list (avoid duplicates)
      setAgents(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newCustom = loaded.filter(a => !existingIds.has(a.id));
        return [...prev, ...newCustom];
      });
    }
  }, []);

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

  // Verbose mode: Update streaming line in terminal (replaces last line while streaming)
  const updateVerboseLine = useCallback((content: string, agentName: string, agentColor: string, isComplete: boolean = false) => {
    const lineId = verboseLineRef.current;
    
    if (isComplete) {
      // Finalize the line
      verboseLineRef.current = null;
      return;
    }
    
    if (!lineId) {
      // Create new streaming line
      const newId = `verbose_${Date.now()}`;
      verboseLineRef.current = newId;
      setTerminalLines(prev => [...prev, {
        id: newId,
        type: 'agent' as const,
        content: `💭 ${content}`,
        timestamp: Date.now(),
        agentName,
        agentColor,
      }]);
    } else {
      // Update existing line
      setTerminalLines(prev => prev.map(line => 
        line.id === lineId 
          ? { ...line, content: `💭 ${content}` }
          : line
      ));
    }
  }, []);

  // Add verbose thinking header
  const startVerboseThinking = useCallback((agentName: string, agentColor: string, model: string) => {
    addTerminalLine('system', `┌─ 🧠 ${agentName} THINKING [${model}] ─────────────────────────`);
    addTerminalLine('agent', `│ Analyzing input and formulating response...`, agentName, agentColor);
  }, [addTerminalLine]);

  // End verbose thinking block
  const endVerboseThinking = useCallback((duration: number, tokenCount: number) => {
    addTerminalLine('system', `└─ ✓ Complete: ${tokenCount} tokens in ${(duration / 1000).toFixed(2)}s ──────────────────`);
  }, [addTerminalLine]);

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

    // Create conversation ID for persistence
    const conversationId = `conv_${agentId}_${Date.now()}`;

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

    // Save to database
    if (database.isReady) {
      startConversation(conversationId, agentId, agent.name, agent.model);
      addMessage(conversationId, 'user', message);
    }

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

      // Build system prompt - enhance for Consciousness agents
      let systemPrompt = agent.systemPrompt;
      
      if (agent.name === 'Collective Consciousness') {
        systemPrompt = getCollectiveConsciousnessPrompt();
      } else if (agent.name === 'Simulated Consciousness') {
        systemPrompt = getSimulatedConsciousnessPrompt();
      } else if (agent.name === 'Theoretical Consciousness') {
        systemPrompt = getTheoreticalConsciousnessPrompt();
      } else if (database.isReady) {
        // Add memory summary to all agents
        systemPrompt = `${agent.systemPrompt}\n\n${getMemorySummary()}`;
      }

      // Inject knowledge base context for agents with research profiles
      if (hasKnowledgeProfile(agent.id)) {
        const knowledgeContext = getKnowledgeContextForAgent(agent.id, message);
        if (knowledgeContext) {
          systemPrompt = `${systemPrompt}\n\n${knowledgeContext}`;
          logDebug(`KB INJECT: ${agent.name} | ${getAgentPublicationCount(agent.id)} publications in context`);
        }
      }

      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...agentMessages,
      ];

      let fullResponse = '';
      let tokenCount = 0;
      const startTime = Date.now();

      // Start verbose output if enabled
      if (verboseMode) {
        startVerboseThinking(agent.name, agent.color, agent.model);
      }

      const response = await ollama.chat(
        agent.model,
        chatMessages,
        (token) => {
          fullResponse += token;
          tokenCount++;
          setStreamingContent(fullResponse);
          
          // Stream to terminal in verbose mode
          if (verboseMode) {
            // Show last 200 chars of thinking
            const displayContent = fullResponse.length > 200 
              ? '...' + fullResponse.slice(-200) 
              : fullResponse;
            updateVerboseLine(displayContent.replace(/\n/g, ' '), agent.name, agent.color);
          }
        },
        agent.temperature,
        agent.maxTokens
      );
      
      // End verbose block
      if (verboseMode) {
        updateVerboseLine('', agent.name, agent.color, true);
        endVerboseThinking(Date.now() - startTime, tokenCount);
      }

      // Require real Ollama response - no simulation
      let finalResponse = response || `⚠️ No response received from ${agent.model}. Ensure Ollama is running and the model is loaded.`;

      // Parse memory commands from response (for Consciousness agents)
      if (database.isReady && finalResponse.includes('[MEMORY:')) {
        const { cleanResponse, results } = parseMemoryCommands(finalResponse, agent.name);
        finalResponse = cleanResponse;
        
        // Log memory operations to terminal
        results.forEach(result => {
          addTerminalLine('system', `  💾 ${result}`);
        });
        
        // Refresh database
        database.refresh();
      }

      // Save assistant message to database
      if (database.isReady) {
        addMessage(conversationId, 'assistant', finalResponse, tokenCount, Date.now() - startTime);
      }

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

  // Team Builder handlers
  const handleToggleTeamAgent = (id: string) => {
    setSelectedTeam(prev => {
      const newTeam = prev.includes(id) 
        ? prev.filter(agentId => agentId !== id)
        : [...prev, id];
      
      // Auto-show team panel when first agent is added
      if (newTeam.length > 0 && !prev.includes(id)) {
        setShowTeamPanel(true);
      }
      // Auto-hide team panel when last agent is removed
      if (newTeam.length === 0) {
        setShowTeamPanel(false);
      }
      
      return newTeam;
    });
  };

  const handleReorderTeam = (newTeam: string[]) => {
    setSelectedTeam(newTeam);
  };

  const handleClearTeam = () => {
    setSelectedTeam([]);
    setTeamExecutionResults([]);
  };

  // Team mode is now automatic - toggled when team has members

  // Run Hive Mind mission - all agents work as one collective intelligence
  const runHiveMindMission = useCallback(async (objective: string) => {
    if (!ollama.isConnected) {
      addTerminalLine('error', 'Cannot run Hive Mind: Ollama is offline');
      return;
    }

    setIsHiveMindActive(true);
    setHiveMindMission(objective);

    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    addTerminalLine('system', '  🧠 AGENTRIC AI — HIVE MIND COLLECTIVE INTELLIGENCE');
    addTerminalLine('system', `  Mission: ${objective.slice(0, 60)}${objective.length > 60 ? '...' : ''}`);
    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    logDebug(`HIVE MIND START: ${objective}`);

    // Create hive context for shared state
    const hiveContext: HiveContext = createHiveContext(objective);
    hiveContext.status = 'analyzing';

    // Step 1: Get OrchestratorAlpha to create a task plan
    const orchestrator = agents.find(a => a.name === 'OrchestratorAlpha');
    if (!orchestrator) {
      addTerminalLine('error', 'OrchestratorAlpha not found. Cannot plan mission.');
      setIsHiveMindActive(false);
      return;
    }

    addTerminalLine('agent', '[PHASE 1] OrchestratorAlpha analyzing mission and creating task plan...', orchestrator.name, orchestrator.color);
    setAgents(prev => prev.map(a => a.id === orchestrator.id ? { ...a, status: 'running' as const } : a));

    try {
      // Build planner prompt with available agent names
      const availableAgentNames = agents.map(a => `- ${a.name}: ${a.role.slice(0, 80)}`);
      const plannerPrompt = buildPlannerPrompt(objective, availableAgentNames);

      let planResponse = '';
      const planStartTime = Date.now();

      if (verboseMode) {
        startVerboseThinking(orchestrator.name, orchestrator.color, orchestrator.model);
      }

      planResponse = await ollama.generate(
        orchestrator.model,
        plannerPrompt,
        orchestrator.systemPrompt,
        verboseMode ? (token) => {
          const display = (planResponse + token).slice(-200);
          updateVerboseLine(display.replace(/\n/g, ' '), orchestrator.name, orchestrator.color);
        } : undefined,
        0.3,
        2048
      );

      if (verboseMode) {
        updateVerboseLine('', orchestrator.name, orchestrator.color, true);
        endVerboseThinking(Date.now() - planStartTime, planResponse.length / 4);
      }

      setAgents(prev => prev.map(a => a.id === orchestrator.id ? { ...a, status: 'success' as const } : a));
      
      // Parse the task plan
      const taskPlan = parseTaskPlan(planResponse);
      
      if (taskPlan.length === 0) {
        addTerminalLine('error', 'Failed to parse task plan from OrchestratorAlpha');
        addTerminalLine('output', 'Raw response: ' + planResponse.slice(0, 200));
        setIsHiveMindActive(false);
        return;
      }

      addTerminalLine('system', `  ✓ Task plan created: ${taskPlan.length} tasks`);
      taskPlan.forEach((task, i) => {
        addTerminalLine('output', `    ${i + 1}. ${task.agentName}: ${task.task.slice(0, 50)}...`);
      });

      // Step 2: Execute each task in order, passing context forward
      hiveContext.status = 'executing';
      addTerminalLine('system', '───────────────────────────────────────────────────────────');
      addTerminalLine('agent', '[PHASE 2] Executing task plan...', 'HIVE', '#e040fb');

      for (let i = 0; i < taskPlan.length; i++) {
        const task = taskPlan[i];
        const agent = agents.find(a => a.name === task.agentName);
        
        if (!agent) {
          addTerminalLine('error', `  Agent not found: ${task.agentName}`);
          hiveContext.errors.push(`Agent ${task.agentName} not found`);
          continue;
        }

        hiveContext.currentPhase = `Task ${i + 1}/${taskPlan.length}`;
        addTerminalLine('agent', `[${i + 1}/${taskPlan.length}] ${agent.name}: ${task.task.slice(0, 60)}...`, agent.name, agent.color);
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'running' as const } : a));

        const taskStartTime = Date.now();

        try {
          // Build agent prompt with full context from previous agents
          const agentPrompt = buildAgentPrompt(agent, task.task, hiveContext);

          let response = '';
          
          if (verboseMode) {
            startVerboseThinking(agent.name, agent.color, agent.model);
          }

          response = await ollama.generate(
            agent.model,
            agentPrompt,
            agent.systemPrompt,
            verboseMode ? (token) => {
              const display = (response + token).slice(-200);
              updateVerboseLine(display.replace(/\n/g, ' '), agent.name, agent.color);
            } : undefined,
            agent.temperature,
            agent.maxTokens
          );

          const duration = Date.now() - taskStartTime;

          if (verboseMode) {
            updateVerboseLine('', agent.name, agent.color, true);
            endVerboseThinking(duration, response.length / 4);
          }

          // Extract artifacts from response
          const artifacts = extractArtifacts(response);
          artifacts.forEach(art => {
            hiveContext.artifacts[art.name] = art.content;
            addTerminalLine('output', `    📄 Generated: ${art.name} (${art.type})`);
          });

          // Store agent output in context for next agents
          const agentOutput: AgentOutput = {
            agentId: agent.id,
            agentName: agent.name,
            task: task.task,
            response,
            artifacts,
            timestamp: Date.now(),
            duration,
            success: true,
          };
          hiveContext.agentOutputs.push(agentOutput);

          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'success' as const } : a));
          addTerminalLine('output', `    ✓ Completed in ${(duration / 1000).toFixed(1)}s`);
          logDebug(`HIVE TASK OK: ${agent.name} | ${duration}ms | ${artifacts.length} artifacts`);

        } catch (err) {
          const duration = Date.now() - taskStartTime;
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          
          if (verboseMode) {
            updateVerboseLine('', agent.name, agent.color, true);
          }

          hiveContext.errors.push(`${agent.name}: ${errorMsg}`);
          hiveContext.agentOutputs.push({
            agentId: agent.id,
            agentName: agent.name,
            task: task.task,
            response: '',
            artifacts: [],
            timestamp: Date.now(),
            duration,
            success: false,
            error: errorMsg,
          });

          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'error' as const } : a));
          addTerminalLine('error', `    ✗ Failed: ${errorMsg}`);
          logDebug(`HIVE TASK ERROR: ${agent.name} | ${errorMsg}`);
        }
      }

      // Step 3: Build final output
      hiveContext.status = 'finalizing';
      hiveContext.endTime = Date.now();
      
      addTerminalLine('system', '───────────────────────────────────────────────────────────');
      addTerminalLine('agent', '[PHASE 3] Building final output...', 'HIVE', '#e040fb');

      const finalOutput = buildFinalOutput(hiveContext);
      const totalDuration = hiveContext.endTime - hiveContext.startTime;
      const successCount = hiveContext.agentOutputs.filter(o => o.success).length;
      const failCount = hiveContext.agentOutputs.filter(o => !o.success).length;
      const artifactCount = Object.keys(hiveContext.artifacts).length;

      // Save to output directory
      if (finalOutput) {
        const outputFile = createOutputFile(
          `hive_${Date.now()}`,
          'code',
          finalOutput,
          { workflowId: 'hive-mind', workflowName: objective.slice(0, 50) },
          { language: 'html', extension: 'html' }
        );
        saveOutputFile(outputFile);
        addTerminalLine('output', `  💾 Output saved: ${outputFile.name}`);
      }

      // Summary
      addTerminalLine('system', '═══════════════════════════════════════════════════════════');
      addTerminalLine('system', '  🧠 HIVE MIND MISSION COMPLETE');
      addTerminalLine('system', `  Tasks: ${successCount} OK, ${failCount} failed`);
      addTerminalLine('system', `  Artifacts: ${artifactCount} generated`);
      addTerminalLine('system', `  Duration: ${(totalDuration / 1000).toFixed(1)}s`);
      if (hiveContext.errors.length > 0) {
        addTerminalLine('output', `  Errors: ${hiveContext.errors.length}`);
      }
      addTerminalLine('system', '═══════════════════════════════════════════════════════════');
      
      logDebug(`HIVE MIND COMPLETE: ${successCount}/${taskPlan.length} tasks | ${artifactCount} artifacts | ${totalDuration}ms`);

      hiveContext.status = 'complete';

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addTerminalLine('error', `Hive Mind failed: ${errorMsg}`);
      logDebug(`HIVE MIND FAILED: ${errorMsg}`);
      setAgents(prev => prev.map(a => a.id === orchestrator.id ? { ...a, status: 'error' as const } : a));
    }

    setIsHiveMindActive(false);
    setHiveMindMission(null);
  }, [ollama.isConnected, ollama.generate, agents, addTerminalLine, logDebug, verboseMode, startVerboseThinking, updateVerboseLine, endVerboseThinking]);

  const handleExecuteTeam = async (mission: string) => {
    if (selectedTeam.length === 0 || !ollama.isConnected) {
      addTerminalLine('error', 'Cannot execute team: No agents selected or Ollama offline');
      return;
    }

    setIsTeamExecuting(true);
    setTeamExecutionResults([]);

    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    addTerminalLine('system', '  AGENTRIC AI — TEAM EXECUTION WORKFLOW');
    addTerminalLine('system', `  Mission: ${mission.slice(0, 60)}${mission.length > 60 ? '...' : ''}`);
    addTerminalLine('system', `  Team: ${selectedTeam.length} agents`);
    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    logDebug(`TEAM EXEC START: ${selectedTeam.length} agents | Mission: ${mission}`);

    const results: TeamExecutionResult[] = [];
    let previousResponses = '';

    for (let i = 0; i < selectedTeam.length; i++) {
      const agentId = selectedTeam[i];
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) {
        results.push({
          agentId,
          agentName: 'Unknown',
          model: 'N/A',
          status: 'error',
          error: 'Agent not found',
        });
        continue;
      }

      // Add pending result
      const pendingResult: TeamExecutionResult = {
        agentId: agent.id,
        agentName: agent.name,
        model: agent.model,
        status: 'running',
      };
      setTeamExecutionResults([...results, pendingResult]);

      // Update agent status
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'running' as const } : a));

      addTerminalLine('agent', `[${i + 1}/${selectedTeam.length}] ${agent.name} (${agent.model}) executing...`, agent.name, agent.color);

      const startTime = Date.now();

      // Start verbose thinking for team execution
      if (verboseMode) {
        startVerboseThinking(agent.name, agent.color, agent.model);
      }

      try {
        // Build context from previous responses
        let fullPrompt = `## Mission Objective\n${mission}\n\n`;
        
        if (previousResponses) {
          fullPrompt += `## Previous Agent Responses\n${previousResponses}\n\n`;
        }
        
        fullPrompt += `## Your Task\nAs ${agent.name}, analyze the mission objective${previousResponses ? ' and previous agent responses' : ''}, then provide your expert contribution based on your role: ${agent.role}`;

        let streamedContent = '';
        let tokenCount = 0;

        const response = await ollama.generate(
          agent.model,
          fullPrompt,
          agent.systemPrompt,
          (token) => {
            streamedContent += token;
            tokenCount++;
            // Stream thinking to terminal in verbose mode
            if (verboseMode) {
              const displayContent = streamedContent.length > 200 
                ? '...' + streamedContent.slice(-200) 
                : streamedContent;
              updateVerboseLine(displayContent.replace(/\n/g, ' '), agent.name, agent.color);
            }
          },
          agent.temperature,
          agent.maxTokens
        );

        // End verbose block
        if (verboseMode) {
          updateVerboseLine('', agent.name, agent.color, true);
          endVerboseThinking(Date.now() - startTime, tokenCount);
        }

        const duration = Date.now() - startTime;
        const finalResponse = response || `No response from ${agent.name}`;

        // Add to previous responses for next agent
        previousResponses += `\n### ${agent.name} (${agent.category})\n${finalResponse}\n`;

        results.push({
          agentId: agent.id,
          agentName: agent.name,
          model: agent.model,
          status: 'success',
          response: finalResponse,
          duration,
        });

        setTeamExecutionResults([...results]);
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'success' as const } : a));
        addTerminalLine('output', `  ✓ ${agent.name}: Completed (${(duration / 1000).toFixed(1)}s)`);
        logDebug(`TEAM AGENT OK: ${agent.name} | ${duration}ms | ${finalResponse.length} chars`);

      } catch (err) {
        const duration = Date.now() - startTime;
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';

        // End verbose on error
        if (verboseMode) {
          updateVerboseLine('', agent.name, agent.color, true);
          addTerminalLine('error', `└─ ✗ Error: ${errorMsg}`);
        }

        results.push({
          agentId: agent.id,
          agentName: agent.name,
          model: agent.model,
          status: 'error',
          error: errorMsg,
          duration,
        });

        setTeamExecutionResults([...results]);
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'error' as const } : a));
        addTerminalLine('error', `  ✗ ${agent.name}: Failed - ${errorMsg}`);
        logDebug(`TEAM AGENT ERROR: ${agent.name} | ${errorMsg}`);
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status === 'error').length;
    const totalTime = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    addTerminalLine('system', '───────────────────────────────────────────────────────────');
    addTerminalLine('system', `  TEAM EXECUTION COMPLETE: ${successCount} OK, ${failCount} FAILED`);
    addTerminalLine('system', `  Total Time: ${(totalTime / 1000).toFixed(1)}s`);
    addTerminalLine('system', '═══════════════════════════════════════════════════════════');
    logDebug(`TEAM EXEC COMPLETE: Success=${successCount}, Failed=${failCount}, Time=${totalTime}ms`);

    // Save workflow output to output directory
    const workflowOutput: WorkflowOutput = {
      workflowId: `team_${Date.now()}`,
      workflowName: `Team Execution: ${mission.slice(0, 30)}...`,
      executedAt: Date.now() - totalTime,
      duration: totalTime,
      steps: results.map(r => ({
          agentId: r.agentId,
          agentName: r.agentName,
          input: mission,
          output: r.response || r.error || '',
          status: r.status === 'success' ? 'completed' as const : 'failed' as const,
          duration: r.duration || 0,
        })),
      generatedFiles: [],
      customAgents: [],
    };

    // Check for any generated code or agents in responses
    results.forEach(r => {
      if (r.status === 'success' && r.response) {
        // Check for code blocks
        const codeBlocks = extractCodeFromOutput(r.response);
        codeBlocks.forEach((block, idx) => {
          const codeFile = createOutputFile(
            `${r.agentName.toLowerCase().replace(/\s+/g, '_')}_output_${idx + 1}`,
            'code',
            block.code,
            { agentId: r.agentId, agentName: r.agentName, teamExecution: true },
            { language: block.language, extension: block.language === 'typescript' ? 'ts' : block.language === 'javascript' ? 'js' : block.language }
          );
          saveOutputFile(codeFile);
          workflowOutput.generatedFiles.push(codeFile);
        });

        // Check for agent definitions
        const newAgent = parseAgentFromOutput(r.response, {
          agentId: r.agentId,
          agentName: r.agentName,
          teamExecution: true,
        });
        if (newAgent) {
          workflowOutput.customAgents.push(newAgent);
          addTerminalLine('system', `  📦 New agent detected: ${newAgent.name}`);
        }
      }
    });

    // Save workflow output
    saveWorkflowOutput(workflowOutput);
    addTerminalLine('system', `  💾 Output saved to /output directory`);

    // If custom agents were created, add them to the roster
    if (workflowOutput.customAgents.length > 0) {
      const existingIds = new Set(agents.map(a => a.id));
      const newAgents = workflowOutput.customAgents.filter(a => !existingIds.has(a.id));
      if (newAgents.length > 0) {
        setAgents(prev => [...prev, ...newAgents]);
        saveCustomAgents([...customAgents, ...newAgents]);
        setCustomAgents(prev => [...prev, ...newAgents]);
        addTerminalLine('system', `  🤖 ${newAgents.length} new agent(s) added to roster`);
      }
    }

    setIsTeamExecuting(false);
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
        addTerminalLine('output', '  team                — Show selected team agents');
        addTerminalLine('output', '  team-clear          — Clear team selection');
        addTerminalLine('output', '  hive <mission>      — Execute Hive Mind collective intelligence mission');
        addTerminalLine('output', '  pull <model>        — Pull an Ollama model');
        addTerminalLine('output', '  log                 — Download debug log');
        addTerminalLine('output', '  default             — Show default model info');
        addTerminalLine('output', '  output              — Show output directory stats');
        addTerminalLine('output', '  output-open         — Open output panel');
        addTerminalLine('output', '  output-export       — Export output bundle');
        addTerminalLine('output', '  custom-agents       — List custom agents');
        addTerminalLine('output', '  verbose             — Toggle verbose mode (show agent thinking)');
        addTerminalLine('output', '  verbose on          — Enable verbose mode');
        addTerminalLine('output', '  verbose off         — Disable verbose mode');
        addTerminalLine('output', '  kb                  — Knowledge base stats');
        addTerminalLine('output', '  kb-populate         — Fetch publications for all profiled agents');
        addTerminalLine('output', '  kb-populate <name>  — Fetch publications for a specific agent');
        addTerminalLine('output', '  kb-search <query>   — Search all publications');
        addTerminalLine('output', '  kb-agents           — List agents with knowledge profiles');
        addTerminalLine('output', '  memory              — Show memory database stats');
        addTerminalLine('output', '  memory-open         — Open memory panel');
        addTerminalLine('output', '  memory-export       — Export database file');
        addTerminalLine('output', '  memory-clear        — Clear all memory data');
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
      case 'team':
        if (selectedTeam.length === 0) {
          addTerminalLine('output', 'No agents selected for team.');
          addTerminalLine('output', '  Enable Team Builder mode in the sidebar to select agents.');
        } else {
          addTerminalLine('system', `Team Builder: ${selectedTeam.length} agents selected`);
          addTerminalLine('output', '  Execution Order:');
          selectedTeam.forEach((id, i) => {
            const agent = agents.find(a => a.id === id);
            if (agent) {
              addTerminalLine('output', `    ${i + 1}. ${agent.name} (${agent.model})`);
            }
          });
          addTerminalLine('output', '');
          addTerminalLine('output', '  Use the Team Panel to enter a mission and execute.');
        }
        break;
      case 'team-clear':
        handleClearTeam();
        addTerminalLine('system', 'Team cleared.');
        break;
      case 'hive':
      case 'hive-mind': {
        const missionText = parts.slice(1).join(' ');
        if (!missionText) {
          addTerminalLine('output', `Hive Mind Status: ${isHiveMindActive ? '🟢 Active' : '⚪ Idle'}`);
          if (hiveMindMission) {
            addTerminalLine('output', `Current Mission: ${hiveMindMission}`);
          }
          addTerminalLine('output', 'Usage: hive <mission objective>');
        } else {
          runHiveMindMission(missionText);
        }
        break;
      }
      case 'verbose': {
        const subCommand = parts[1]?.toLowerCase();
        if (subCommand === 'on') {
          setVerboseMode(true);
          addTerminalLine('system', '🧠 Verbose mode ENABLED — Agent thinking will be streamed to terminal');
          logDebug('VERBOSE MODE: Enabled');
        } else if (subCommand === 'off') {
          setVerboseMode(false);
          addTerminalLine('system', '🔇 Verbose mode DISABLED — Agent thinking hidden');
          logDebug('VERBOSE MODE: Disabled');
        } else {
          // Toggle
          setVerboseMode(prev => {
            const newState = !prev;
            addTerminalLine('system', newState 
              ? '🧠 Verbose mode ENABLED — Agent thinking will be streamed to terminal'
              : '🔇 Verbose mode DISABLED — Agent thinking hidden'
            );
            logDebug(`VERBOSE MODE: ${newState ? 'Enabled' : 'Disabled'}`);
            return newState;
          });
        }
        break;
      }
      case 'output':
      case 'outputs': {
        const stats = getOutputStats();
        addTerminalLine('system', '  OUTPUT DIRECTORY');
        addTerminalLine('output', `  Total Files:    ${stats.totalFiles}`);
        addTerminalLine('output', `  Total Size:     ${(stats.totalSize / 1024).toFixed(1)} KB`);
        addTerminalLine('output', `  Custom Agents:  ${stats.customAgents}`);
        addTerminalLine('output', '');
        addTerminalLine('output', '  By Type:');
        addTerminalLine('output', `    Agents:    ${stats.byType.agents}`);
        addTerminalLine('output', `    Code:      ${stats.byType.code}`);
        addTerminalLine('output', `    Data:      ${stats.byType.data}`);
        addTerminalLine('output', `    Workflows: ${stats.byType.workflows}`);
        addTerminalLine('output', `    Logs:      ${stats.byType.logs}`);
        addTerminalLine('output', `    Configs:   ${stats.byType.configs}`);
        addTerminalLine('output', '');
        addTerminalLine('output', '  Use "output-open" to open the Output Panel');
        break;
      }
      case 'output-open':
        setShowOutputPanel(true);
        addTerminalLine('system', 'Output panel opened.');
        break;
      case 'output-export':
        downloadOutputBundle();
        addTerminalLine('system', 'Output bundle exported to downloads.');
        break;
      case 'custom-agents': {
        const loaded = loadCustomAgents();
        if (loaded.length === 0) {
          addTerminalLine('output', 'No custom agents created yet.');
        } else {
          addTerminalLine('system', `  CUSTOM AGENTS (${loaded.length})`);
          loaded.forEach(a => {
            addTerminalLine('output', `    🤖 ${a.name}`);
            addTerminalLine('output', `       Role: ${a.role.slice(0, 50)}...`);
            addTerminalLine('output', `       Model: ${a.model}`);
            addTerminalLine('output', `       Created by: ${a.createdBy?.agentName || 'Manual'}`);
          });
        }
        break;
      }
      case 'kb':
      case 'kb-stats': {
        ensurePublicationsTable();
        const totalPubs = getTotalPublicationCount();
        const pubStats = getAllPublicationStats();
        const profiledAgents = getAgentsWithProfiles();
        addTerminalLine('system', '  ═══ KNOWLEDGE BASE ═══');
        addTerminalLine('output', `  Total Publications:  ${totalPubs}`);
        addTerminalLine('output', `  Profiled Agents:     ${profiledAgents.length}`);
        addTerminalLine('output', `  Sources:             Semantic Scholar, OpenAlex, arXiv`);
        addTerminalLine('output', '');
        if (pubStats.length > 0) {
          addTerminalLine('output', '  AGENT                          PAPERS  SOURCES');
          addTerminalLine('output', '  ' + '─'.repeat(55));
          pubStats.forEach(s => {
            const agentProfile = getAgentProfile(s.agent_id);
            const name = agentProfile?.agentName || s.agent_id;
            addTerminalLine('output', `  ${name.padEnd(32)}${String(s.count).padEnd(8)}${s.sources}`);
          });
        } else {
          addTerminalLine('output', '  No publications fetched yet. Run "kb-populate" to fetch.');
        }
        break;
      }
      case 'kb-populate': {
        ensurePublicationsTable();
        const targetName = parts.slice(1).join(' ');
        if (targetName) {
          // Populate specific agent
          const targetAgent = agents.find(a => a.name.toLowerCase() === targetName.toLowerCase());
          if (!targetAgent) {
            addTerminalLine('error', `Agent not found: ${targetName}`);
            break;
          }
          if (!hasKnowledgeProfile(targetAgent.id)) {
            addTerminalLine('error', `No knowledge profile for ${targetAgent.name}`);
            break;
          }
          addTerminalLine('system', `Fetching publications for ${targetAgent.name}...`);
          logDebug(`KB POPULATE: Starting for ${targetAgent.name}`);
          populateAgentKnowledge(targetAgent.id, (progress) => {
            if (progress.status === 'fetching') {
              addTerminalLine('output', `  📚 Query ${progress.fetched + 1}/${progress.total}...`);
            } else if (progress.status === 'done') {
              const count = getAgentPublicationCount(targetAgent.id);
              addTerminalLine('system', `  ✓ ${targetAgent.name}: ${count} publications stored`);
              logDebug(`KB POPULATE OK: ${targetAgent.name} | ${count} papers`);
            } else if (progress.status === 'error') {
              addTerminalLine('error', `  ✗ ${progress.error}`);
              logDebug(`KB POPULATE ERROR: ${targetAgent.name} | ${progress.error}`);
            }
          });
        } else {
          // Populate ALL profiled agents
          addTerminalLine('system', 'Fetching publications for ALL profiled agents...');
          addTerminalLine('system', `This may take several minutes. ${getAgentsWithProfiles().length} agents to process.`);
          logDebug(`KB POPULATE ALL: Starting for ${getAgentsWithProfiles().length} agents`);
          populateAllAgentKnowledge((progress, index, total) => {
            if (progress.status === 'fetching' && progress.fetched === 0) {
              addTerminalLine('agent', `[${index + 1}/${total}] ${progress.agentName}...`);
            } else if (progress.status === 'done') {
              const count = getAgentPublicationCount(progress.agentId);
              addTerminalLine('output', `  ✓ ${progress.agentName}: ${count} publications`);
            } else if (progress.status === 'error') {
              addTerminalLine('error', `  ✗ ${progress.agentName}: ${progress.error}`);
            }
          }).then(result => {
            addTerminalLine('system', '───────────────────────────────────────────────────────────');
            addTerminalLine('system', `  KB POPULATE COMPLETE: ${result.totalPapers} papers across ${result.agentsProcessed} agents`);
            if (result.errors.length > 0) {
              addTerminalLine('output', `  Errors: ${result.errors.length} (some APIs may have rate limited)`);
            }
            addTerminalLine('system', '═══════════════════════════════════════════════════════════');
            logDebug(`KB POPULATE ALL DONE: ${result.totalPapers} papers, ${result.errors.length} errors`);
          });
        }
        break;
      }
      case 'kb-search': {
        ensurePublicationsTable();
        const searchQuery = parts.slice(1).join(' ');
        if (!searchQuery) {
          addTerminalLine('error', 'Usage: kb-search <query>');
          break;
        }
        const searchResults = searchPublications(searchQuery);
        if (searchResults.length === 0) {
          addTerminalLine('output', `No publications found for: "${searchQuery}"`);
          addTerminalLine('output', '  Run "kb-populate" first to fetch publications.');
        } else {
          addTerminalLine('system', `  Found ${searchResults.length} results for "${searchQuery}":`);
          searchResults.slice(0, 15).forEach((pub, i) => {
            addTerminalLine('output', `  [${i + 1}] "${pub.title}" (${pub.year})`);
            addTerminalLine('output', `      Authors: ${pub.authors.substring(0, 60)}${pub.authors.length > 60 ? '...' : ''}`);
            if (pub.citation_count > 0) addTerminalLine('output', `      Citations: ${pub.citation_count}`);
            if (pub.doi) addTerminalLine('output', `      DOI: ${pub.doi}`);
          });
        }
        break;
      }
      case 'kb-agents': {
        const profiledIds = getAgentsWithProfiles();
        addTerminalLine('system', `  AGENTS WITH KNOWLEDGE PROFILES (${profiledIds.length})`);
        addTerminalLine('output', '');
        profiledIds.forEach(id => {
          const profile = getAgentProfile(id);
          const agent = agents.find(a => a.id === id);
          if (profile) {
            const count = getAgentPublicationCount(id);
            const statusIcon = count > 0 ? '📚' : '📭';
            addTerminalLine('output', `  ${statusIcon} ${profile.agentName.padEnd(32)} ${String(count).padEnd(6)} papers`);
            addTerminalLine('output', `      Domains: ${profile.domains.join(', ')}`);
            addTerminalLine('output', `      Model: ${agent?.model || 'N/A'}`);
          }
        });
        break;
      }
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
          {/* Verbose Mode Toggle */}
          <button
            onClick={() => setVerboseMode(!verboseMode)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all border',
              verboseMode 
                ? 'bg-amber-glow/20 text-amber-glow border-amber-glow/50' 
                : 'bg-surface/50 text-text-muted border-border-dim hover:text-text-secondary'
            )}
            title={verboseMode ? 'Verbose Mode ON - Click to disable' : 'Verbose Mode OFF - Click to enable agent thinking output'}
          >
            {verboseMode ? <Eye size={11} /> : <EyeOff size={11} />}
            <span>{verboseMode ? 'Verbose ON' : 'Verbose'}</span>
          </button>
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
          selectedTeam={selectedTeam}
          onToggleTeamAgent={handleToggleTeamAgent}
          onClearTeam={handleClearTeam}
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
          <button
            onClick={() => {
              setShowTeamPanel(!showTeamPanel);
            }}
            className={cn(
              'p-2 rounded-lg transition-colors relative',
              showTeamPanel ? 'bg-magenta/20 text-magenta' : 'text-text-muted hover:text-text-secondary'
            )}
            title="Team Builder"
          >
            <Users size={16} />
            {selectedTeam.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-magenta text-void text-[8px] font-bold flex items-center justify-center">
                {selectedTeam.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowOutputPanel(!showOutputPanel)}
            className={cn(
              'p-2 rounded-lg transition-colors relative',
              showOutputPanel ? 'bg-violet/20 text-violet' : 'text-text-muted hover:text-text-secondary'
            )}
            title="Output Directory"
          >
            <FolderOutput size={16} />
            {customAgents.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet text-white text-[8px] font-bold flex items-center justify-center">
                {customAgents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowMemoryPanel(!showMemoryPanel)}
            className={cn(
              'p-2 rounded-lg transition-colors relative',
              showMemoryPanel ? 'bg-purple-500/20 text-purple-400' : 'text-text-muted hover:text-text-secondary'
            )}
            title="Memory Database"
          >
            <HardDrive size={16} />
            {database.isReady && database.stats && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white text-[8px] font-bold flex items-center justify-center">
                {database.stats.collective_count + database.stats.simulated_count + database.stats.theoretical_count > 99 
                  ? '99+' 
                  : database.stats.collective_count + database.stats.simulated_count + database.stats.theoretical_count}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTerminalCommand('kb')}
            className={cn(
              'p-2 rounded-lg transition-colors relative',
              'text-text-muted hover:text-emerald-400'
            )}
            title="Knowledge Base — Publications & Research"
          >
            <BookOpen size={16} />
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

        {/* Team Panel */}
        {showTeamPanel && (
          <div className="w-72 flex-shrink-0">
            <TeamPanel
              agents={agents}
              selectedTeam={selectedTeam}
              onToggleAgent={handleToggleTeamAgent}
              onReorderTeam={handleReorderTeam}
              onClearTeam={handleClearTeam}
              onExecuteTeam={handleExecuteTeam}
              isExecuting={isTeamExecuting}
              executionResults={teamExecutionResults}
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

      {/* Output Panel */}
      <OutputPanel
        isOpen={showOutputPanel}
        onClose={() => setShowOutputPanel(false)}
        onImportAgent={(agent) => {
          // Add custom agent to roster if not already present
          const exists = agents.find(a => a.id === agent.id);
          if (!exists) {
            setAgents(prev => [...prev, agent]);
            addTerminalLine('system', `Custom agent "${agent.name}" imported to roster`);
            logDebug(`CUSTOM AGENT IMPORTED: ${agent.name} | Category: ${agent.category}`);
          } else {
            addTerminalLine('output', `Agent "${agent.name}" already in roster`);
          }
        }}
        onRefresh={() => {
          // Reload custom agents from storage
          const loaded = loadCustomAgents();
          setCustomAgents(loaded);
        }}
      />

      {/* Memory Panel */}
      {showMemoryPanel && (
        <div className="fixed right-0 top-0 bottom-0 w-96 z-50 shadow-2xl">
          <MemoryPanel onClose={() => setShowMemoryPanel(false)} />
        </div>
      )}
    </div>
  );
}
