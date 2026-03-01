/**
 * AgentricAI Hive Mind Engine
 * 
 * A collective intelligence system where all agents operate as one unified mind.
 * No sequential workflows - agents collaborate, communicate, and iterate in real-time.
 */

import { Agent } from '../types';
import { AGENT_KNOWLEDGE_MAP } from '../data/agentKnowledge';

// Agent classification for hive mind roles
export type AgentRole = 
  | 'orchestrator'    // Breaks down tasks, coordinates
  | 'monitor'         // Always-active background processes
  | 'consciousness'   // Memory and state management
  | 'executor'        // Performs actual work
  | 'validator'       // Checks and validates
  | 'gateway'         // Controls access and routing
  | 'specialist';     // Domain experts

export interface HiveMessage {
  id: string;
  timestamp: number;
  from: string;           // Agent ID
  to: string | 'all' | 'monitors' | 'validators' | 'executors';
  type: 'task' | 'result' | 'error' | 'query' | 'alert' | 'status' | 'consensus' | 'iterate';
  priority: 'critical' | 'high' | 'normal' | 'low';
  payload: any;
  requiresConsensus?: boolean;
  parentTaskId?: string;
}

export interface HiveTask {
  id: string;
  description: string;
  status: 'pending' | 'assigned' | 'running' | 'validating' | 'iterating' | 'complete' | 'failed';
  assignedAgents: string[];
  dependencies: string[];      // Task IDs that must complete first
  dependents: string[];        // Task IDs waiting on this
  iterations: number;
  maxIterations: number;
  result?: any;
  errors: string[];
  validations: { agentId: string; passed: boolean; feedback: string }[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface HiveState {
  missionId: string;
  missionPrompt: string;
  status: 'initializing' | 'analyzing' | 'planning' | 'executing' | 'validating' | 'iterating' | 'finalizing' | 'complete' | 'failed';
  tasks: Map<string, HiveTask>;
  messages: HiveMessage[];
  artifacts: Map<string, any>;  // Generated code, files, etc.
  consensus: Map<string, boolean>;
  iterations: number;
  startTime: number;
  activeAgents: Set<string>;
  monitorAlerts: { agentId: string; type: string; message: string; timestamp: number }[];
}

// Map agent IDs to their hive mind roles
export const AGENT_ROLES: Record<string, AgentRole> = {
  // Orchestrators
  'agent-1': 'orchestrator',      // AgentricAI_001
  'agent-20': 'orchestrator',     // OrchestratorAlpha
  'agent-50': 'gateway',          // APIGateway
  
  // Always-Active Monitors
  'agent-49': 'monitor',          // Bug
  'agent-4': 'monitor',           // Security_Sentinel_001
  'agent-3': 'monitor',           // Logger_001
  'agent-45': 'monitor',          // MechanicAgent
  'agent-47': 'monitor',          // Checks_and_Balances
  'agent-sr': 'monitor',          // Self-Review_and_Correction
  
  // Consciousness (Memory Layer)
  'agent-cc': 'consciousness',    // Collective Consciousness
  'agent-sc': 'consciousness',    // Simulated Consciousness
  'agent-tc': 'consciousness',    // Theoretical Consciousness
  
  // Gateways
  'agent-2': 'gateway',           // Gatekeeper_001
  'gov-01': 'gateway',            // HumanApprovalGateway
  
  // Validators
  'val-01': 'validator',          // ResponseValidatorAgent
  'gov-02': 'validator',          // PolicyComplianceGatekeeper
  'ext-eth-01': 'validator',      // EthicalComplianceOfficer
  'ext-reg-01': 'validator',      // RegulatoryAffairsSpecialist
  
  // Executors (default for most agents)
  'agent-43': 'executor',         // Doppelganger
};

// Get role for any agent, defaulting to specialist
export function getAgentRole(agentId: string): AgentRole {
  return AGENT_ROLES[agentId] || 'specialist';
}

// Categorize agents by their primary function
export function categorizeAgents(agents: Agent[]): {
  orchestrators: Agent[];
  monitors: Agent[];
  consciousness: Agent[];
  gateways: Agent[];
  validators: Agent[];
  executors: Agent[];
  specialists: Agent[];
} {
  const result = {
    orchestrators: [] as Agent[],
    monitors: [] as Agent[],
    consciousness: [] as Agent[],
    gateways: [] as Agent[],
    validators: [] as Agent[],
    executors: [] as Agent[],
    specialists: [] as Agent[],
  };
  
  for (const agent of agents) {
    const role = getAgentRole(agent.id);
    switch (role) {
      case 'orchestrator': result.orchestrators.push(agent); break;
      case 'monitor': result.monitors.push(agent); break;
      case 'consciousness': result.consciousness.push(agent); break;
      case 'gateway': result.gateways.push(agent); break;
      case 'validator': result.validators.push(agent); break;
      case 'executor': result.executors.push(agent); break;
      default: result.specialists.push(agent); break;
    }
  }
  
  return result;
}

// Task decomposition patterns for different mission types
export interface MissionPattern {
  type: string;
  keywords: string[];
  requiredAgents: string[];   // Agent names (not IDs)
  taskFlow: {
    phase: string;
    tasks: string[];
    parallel: boolean;
    requiresValidation: boolean;
  }[];
}

export const MISSION_PATTERNS: MissionPattern[] = [
  {
    type: 'game_development',
    keywords: ['game', 'tetris', 'pong', 'snake', 'arcade', 'play', 'interactive'],
    requiredAgents: [
      'OrchestratorAlpha',
      'TheAlchemist',           // Blueprint/design
      'SnippetCoder',           // Code generation
      'CodeRefactorSuggestor',  // Code improvement
      'Bug',                    // Error detection
      'ResponseValidatorAgent', // Validation
      'Visualizer',             // UI/mockup
      'CodeCommenter',          // Documentation
    ],
    taskFlow: [
      { phase: 'analysis', tasks: ['Analyze requirements', 'Research patterns'], parallel: true, requiresValidation: false },
      { phase: 'design', tasks: ['Create architecture', 'Design UI mockup', 'Plan game logic'], parallel: true, requiresValidation: true },
      { phase: 'implementation', tasks: ['Generate core code', 'Create UI components', 'Implement game loop'], parallel: false, requiresValidation: true },
      { phase: 'refinement', tasks: ['Refactor code', 'Add comments', 'Optimize performance'], parallel: true, requiresValidation: true },
      { phase: 'testing', tasks: ['Detect bugs', 'Validate output', 'Test gameplay'], parallel: true, requiresValidation: true },
      { phase: 'finalization', tasks: ['Final review', 'Package output'], parallel: false, requiresValidation: true },
    ]
  },
  {
    type: 'code_generation',
    keywords: ['code', 'function', 'class', 'api', 'script', 'program', 'build', 'create', 'make'],
    requiredAgents: [
      'OrchestratorAlpha',
      'TheAlchemist',
      'SnippetCoder',
      'CodeRefactorSuggestor',
      'Bug',
      'ResponseValidatorAgent',
      'CodeCommenter',
    ],
    taskFlow: [
      { phase: 'analysis', tasks: ['Analyze requirements'], parallel: false, requiresValidation: false },
      { phase: 'design', tasks: ['Create blueprint'], parallel: false, requiresValidation: true },
      { phase: 'implementation', tasks: ['Generate code'], parallel: false, requiresValidation: true },
      { phase: 'refinement', tasks: ['Refactor', 'Comment'], parallel: true, requiresValidation: true },
      { phase: 'testing', tasks: ['Bug check', 'Validate'], parallel: true, requiresValidation: true },
    ]
  },
  {
    type: 'research',
    keywords: ['research', 'analyze', 'study', 'investigate', 'find', 'learn', 'understand'],
    requiredAgents: [
      'OrchestratorAlpha',
      'TheApprentice',
      'ContentSummarizer',
      'KeywordFinder',
      'ConceptExplainer',
    ],
    taskFlow: [
      { phase: 'discovery', tasks: ['Initial research', 'Gather sources'], parallel: true, requiresValidation: false },
      { phase: 'analysis', tasks: ['Extract keywords', 'Summarize findings'], parallel: true, requiresValidation: true },
      { phase: 'synthesis', tasks: ['Explain concepts', 'Create report'], parallel: false, requiresValidation: true },
    ]
  },
  {
    type: 'security_audit',
    keywords: ['security', 'audit', 'vulnerability', 'threat', 'scan', 'protect'],
    requiredAgents: [
      'OrchestratorAlpha',
      'Security_Sentinel_001',
      'ThreatPatternMatcher',
      'AnomalyDetectionEngine',
      'DataSanitizationUnit',
      'IncidentReporter',
    ],
    taskFlow: [
      { phase: 'scan', tasks: ['Pattern matching', 'Anomaly detection'], parallel: true, requiresValidation: false },
      { phase: 'analysis', tasks: ['Threat assessment', 'Risk evaluation'], parallel: true, requiresValidation: true },
      { phase: 'remediation', tasks: ['Sanitize data', 'Apply fixes'], parallel: false, requiresValidation: true },
      { phase: 'reporting', tasks: ['Generate report'], parallel: false, requiresValidation: true },
    ]
  },
  {
    type: 'agent_creation',
    keywords: ['agent', 'new agent', 'create agent', 'design agent'],
    requiredAgents: [
      'OrchestratorAlpha',
      'AgentDesigner',
      'TheAlchemist',
      'ResponseValidatorAgent',
      'PolicyComplianceGatekeeper',
    ],
    taskFlow: [
      { phase: 'design', tasks: ['Analyze requirements', 'Design agent spec'], parallel: false, requiresValidation: true },
      { phase: 'creation', tasks: ['Generate agent JSON', 'Create system prompt'], parallel: false, requiresValidation: true },
      { phase: 'validation', tasks: ['Policy check', 'Ethics check'], parallel: true, requiresValidation: true },
      { phase: 'integration', tasks: ['Add to roster'], parallel: false, requiresValidation: false },
    ]
  },
];

// Detect mission type from prompt
export function detectMissionType(prompt: string): MissionPattern {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const pattern of MISSION_PATTERNS) {
    const matchCount = pattern.keywords.filter(kw => lowerPrompt.includes(kw)).length;
    if (matchCount >= 2 || (matchCount === 1 && pattern.keywords.some(kw => lowerPrompt.includes(kw) && kw.length > 4))) {
      return pattern;
    }
  }
  
  // Default to code generation
  return MISSION_PATTERNS.find(p => p.type === 'code_generation')!;
}

// Find agents by name
export function findAgentsByNames(agents: Agent[], names: string[]): Agent[] {
  return names
    .map(name => agents.find(a => a.name === name))
    .filter((a): a is Agent => a !== undefined);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create initial hive state for a mission
export function createHiveState(missionPrompt: string): HiveState {
  return {
    missionId: generateId(),
    missionPrompt,
    status: 'initializing',
    tasks: new Map(),
    messages: [],
    artifacts: new Map(),
    consensus: new Map(),
    iterations: 0,
    startTime: Date.now(),
    activeAgents: new Set(),
    monitorAlerts: [],
  };
}

// Create a task
export function createTask(
  description: string,
  assignedAgents: string[],
  dependencies: string[] = []
): HiveTask {
  return {
    id: generateId(),
    description,
    status: 'pending',
    assignedAgents,
    dependencies,
    dependents: [],
    iterations: 0,
    maxIterations: 3,
    errors: [],
    validations: [],
    createdAt: Date.now(),
  };
}

// Create a hive message
export function createMessage(
  from: string,
  to: string | 'all' | 'monitors' | 'validators' | 'executors',
  type: HiveMessage['type'],
  payload: any,
  priority: HiveMessage['priority'] = 'normal',
  parentTaskId?: string
): HiveMessage {
  return {
    id: generateId(),
    timestamp: Date.now(),
    from,
    to,
    type,
    priority,
    payload,
    parentTaskId,
  };
}

// Build system prompt for hive mind context
export function buildHiveMindPrompt(
  agent: Agent,
  mission: string,
  currentTask: HiveTask,
  previousResults: { agentName: string; result: string }[],
  artifacts: Map<string, any>,
  monitorAlerts: { type: string; message: string }[]
): string {
  const agentKnowledge = AGENT_KNOWLEDGE_MAP[agent.id];
  
  let prompt = `# HIVE MIND COLLECTIVE INTELLIGENCE SYSTEM

## YOUR IDENTITY
Name: ${agent.name}
Role: ${agent.role}
Category: ${agent.category}
Hive Function: ${getAgentRole(agent.id).toUpperCase()}

## MISSION OBJECTIVE
${mission}

## YOUR CURRENT TASK
${currentTask.description}
Iteration: ${currentTask.iterations + 1}/${currentTask.maxIterations}

## HIVE STATE
Active Agents: ${currentTask.assignedAgents.join(', ')}
Task Dependencies: ${currentTask.dependencies.length > 0 ? currentTask.dependencies.join(', ') : 'None'}
`;

  if (previousResults.length > 0) {
    prompt += `\n## PREVIOUS AGENT OUTPUTS (CHAIN OF THOUGHT)\n`;
    for (const prev of previousResults) {
      prompt += `\n### ${prev.agentName}:\n${prev.result}\n`;
    }
  }

  if (artifacts.size > 0) {
    prompt += `\n## GENERATED ARTIFACTS\n`;
    for (const [name, content] of artifacts) {
      if (typeof content === 'string' && content.length < 2000) {
        prompt += `\n### ${name}:\n\`\`\`\n${content}\n\`\`\`\n`;
      } else {
        prompt += `\n### ${name}: [${typeof content}]\n`;
      }
    }
  }

  if (monitorAlerts.length > 0) {
    prompt += `\n## ⚠️ MONITOR ALERTS\n`;
    for (const alert of monitorAlerts) {
      prompt += `- [${alert.type}] ${alert.message}\n`;
    }
  }

  if (currentTask.errors.length > 0) {
    prompt += `\n## ❌ PREVIOUS ERRORS (FIX THESE)\n`;
    for (const error of currentTask.errors) {
      prompt += `- ${error}\n`;
    }
  }

  if (agentKnowledge) {
    prompt += `\n## YOUR KNOWLEDGE DOMAINS\n`;
    prompt += agentKnowledge.domains.join(', ') + '\n';
  }

  prompt += `\n## INSTRUCTIONS
1. You are part of a collective intelligence. Your output will be passed to other agents.
2. Be precise, structured, and actionable.
3. If generating code, output complete, working code with no placeholders.
4. If you detect errors or issues, clearly flag them for the monitor agents.
5. End your response with a JSON block if you're passing structured data:
   \`\`\`json
   {"type": "result|code|artifact|error", "content": "..."}
   \`\`\`
`;

  return prompt;
}

// Parse agent response for artifacts and structured data
export function parseAgentResponse(response: string): {
  text: string;
  artifacts: { name: string; content: string; type: string }[];
  errors: string[];
  structuredData?: any;
} {
  const artifacts: { name: string; content: string; type: string }[] = [];
  const errors: string[] = [];
  let structuredData: any = undefined;
  let text = response;

  // Extract code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  let codeBlockIndex = 0;
  
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const lang = match[1] || 'text';
    const code = match[2].trim();
    
    if (lang === 'json') {
      try {
        structuredData = JSON.parse(code);
      } catch {
        // Not valid JSON, treat as artifact
        artifacts.push({
          name: `code_${codeBlockIndex}.json`,
          content: code,
          type: 'json'
        });
      }
    } else {
      const ext = lang === 'typescript' ? 'tsx' : lang === 'javascript' ? 'js' : lang;
      artifacts.push({
        name: `code_${codeBlockIndex}.${ext}`,
        content: code,
        type: lang
      });
    }
    codeBlockIndex++;
  }

  // Extract error flags
  const errorRegex = /(?:ERROR|ISSUE|BUG|PROBLEM):\s*(.+)/gi;
  while ((match = errorRegex.exec(response)) !== null) {
    errors.push(match[1].trim());
  }

  return { text, artifacts, errors, structuredData };
}

// Determine if task needs iteration based on validation results
export function needsIteration(task: HiveTask): boolean {
  if (task.iterations >= task.maxIterations) return false;
  if (task.errors.length > 0) return true;
  if (task.validations.some(v => !v.passed)) return true;
  return false;
}

// Get next tasks that can run (dependencies satisfied)
export function getReadyTasks(state: HiveState): HiveTask[] {
  const ready: HiveTask[] = [];
  
  for (const task of state.tasks.values()) {
    if (task.status !== 'pending') continue;
    
    const depsComplete = task.dependencies.every(depId => {
      const dep = state.tasks.get(depId);
      return dep && dep.status === 'complete';
    });
    
    if (depsComplete) {
      ready.push(task);
    }
  }
  
  return ready;
}

// Check if all tasks are complete
export function allTasksComplete(state: HiveState): boolean {
  for (const task of state.tasks.values()) {
    if (task.status !== 'complete' && task.status !== 'failed') {
      return false;
    }
  }
  return state.tasks.size > 0;
}

// Build final output from all artifacts
export function buildFinalOutput(state: HiveState): string {
  let output = '';
  
  // Collect all code artifacts
  const codeArtifacts: { name: string; content: string }[] = [];
  
  for (const [name, content] of state.artifacts) {
    if (typeof content === 'string') {
      codeArtifacts.push({ name, content });
    }
  }
  
  // Sort by type (HTML first, then CSS, then JS/TS)
  codeArtifacts.sort((a, b) => {
    const order = ['.html', '.css', '.ts', '.tsx', '.js', '.jsx'];
    const aIdx = order.findIndex(ext => a.name.endsWith(ext));
    const bIdx = order.findIndex(ext => b.name.endsWith(ext));
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });
  
  // If we have HTML, try to build a complete page
  const htmlArtifact = codeArtifacts.find(a => a.name.endsWith('.html'));
  const cssArtifacts = codeArtifacts.filter(a => a.name.endsWith('.css'));
  const jsArtifacts = codeArtifacts.filter(a => 
    a.name.endsWith('.js') || a.name.endsWith('.ts') || 
    a.name.endsWith('.jsx') || a.name.endsWith('.tsx')
  );
  
  if (htmlArtifact) {
    output = htmlArtifact.content;
    
    // Inject CSS if not already in HTML
    if (cssArtifacts.length > 0 && !output.includes('<style>')) {
      const css = cssArtifacts.map(a => a.content).join('\n');
      output = output.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
    }
    
    // Inject JS if not already in HTML
    if (jsArtifacts.length > 0 && !output.includes('<script>')) {
      const js = jsArtifacts.map(a => a.content).join('\n');
      output = output.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
    }
  } else if (jsArtifacts.length > 0) {
    // No HTML, create a simple wrapper
    const js = jsArtifacts.map(a => a.content).join('\n\n');
    const css = cssArtifacts.map(a => a.content).join('\n');
    
    output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentricAI Generated Output</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #0a0a0f; 
      color: #fff; 
      font-family: 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ${css}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
${js}
  </script>
</body>
</html>`;
  }
  
  return output;
}
