// ═══════════════════════════════════════════════════════════════════════════
// AGENTRICAI ORCHESTRATION ENGINE — TYPE DEFINITIONS
// Intelligent Multi-Agent Execution with Non-Sequential Workflows
// ═══════════════════════════════════════════════════════════════════════════

// Agent type used in orchestration engine
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Agent as _Agent } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MISSION & TASK TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MissionPriority = 'critical' | 'high' | 'normal' | 'low';
export type MissionStatus = 'planning' | 'executing' | 'validating' | 'completed' | 'failed' | 'paused';
export type TaskStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'retrying' | 'skipped';

export interface Mission {
  id: string;
  objective: string;
  priority: MissionPriority;
  status: MissionStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  
  // Planning
  plan?: MissionPlan;
  
  // Execution state
  currentPhase: number;
  phases: MissionPhase[];
  
  // Results
  output?: string;
  generatedCode?: GeneratedCode[];
  errors: MissionError[];
  
  // Context chain (passed between agents)
  contextChain: ContextEntry[];
}

export interface MissionPlan {
  analyzedBy: string; // OrchestratorAlpha
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedAgents: string[];
  phases: MissionPhaseDefinition[];
  alwaysActiveAgents: string[];
  validationAgents: string[];
}

export interface MissionPhaseDefinition {
  name: string;
  description: string;
  tasks: TaskDefinition[];
  parallel: boolean; // Can tasks run in parallel?
  requiredForNext: boolean; // Must complete before next phase?
}

export interface TaskDefinition {
  agentId: string;
  instruction: string;
  dependsOn?: string[]; // Task IDs that must complete first
  retryOnFailure: boolean;
  maxRetries: number;
  validationRequired: boolean;
}

export interface MissionPhase {
  id: string;
  name: string;
  status: TaskStatus;
  tasks: MissionTask[];
  startedAt?: number;
  completedAt?: number;
}

export interface MissionTask {
  id: string;
  agentId: string;
  agentName: string;
  instruction: string;
  status: TaskStatus;
  
  // Execution
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  retryCount: number;
  maxRetries: number;
  
  // Results
  output?: string;
  error?: string;
  validationResult?: ValidationResult;
  
  // Dependencies
  dependsOn: string[];
  blockedBy: string[]; // Currently blocking tasks
}

export interface ContextEntry {
  agentId: string;
  agentName: string;
  role: string;
  output: string;
  timestamp: number;
}

export interface MissionError {
  taskId: string;
  agentId: string;
  error: string;
  timestamp: number;
  recovered: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  validatedBy: string;
  issues: string[];
  suggestions: string[];
}

export interface GeneratedCode {
  filename: string;
  language: string;
  content: string;
  generatedBy: string;
  validated: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export type AgentRole = 
  | 'orchestrator'     // Plans and coordinates
  | 'executor'         // Does the work
  | 'validator'        // Validates output
  | 'monitor'          // Always active, watches for issues
  | 'memory'           // Manages state/persistence
  | 'gateway'          // Access control / routing
  | 'support'          // Assists other agents
  | 'specialist';      // Domain expert

export interface AgentClassification {
  agentId: string;
  role: AgentRole;
  isAlwaysActive: boolean;
  canRetry: boolean;
  requiresHumanApproval: boolean;
  dependencies: string[]; // Agents this one depends on
  triggers: string[];     // Agents this one can trigger
}

// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATION ENGINE EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export type OrchestrationEventType = 
  | 'mission_created'
  | 'mission_planned'
  | 'mission_started'
  | 'mission_completed'
  | 'mission_failed'
  | 'phase_started'
  | 'phase_completed'
  | 'task_queued'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'task_retrying'
  | 'validation_started'
  | 'validation_completed'
  | 'code_generated'
  | 'agent_thinking'
  | 'context_updated'
  | 'error_detected'
  | 'error_recovered';

export interface OrchestrationEvent {
  type: OrchestrationEventType;
  missionId: string;
  timestamp: number;
  data: {
    phaseId?: string;
    taskId?: string;
    agentId?: string;
    agentName?: string;
    message?: string;
    output?: string;
    error?: string;
    progress?: number;
    thinkingContent?: string;
  };
}

export type OrchestrationEventHandler = (event: OrchestrationEvent) => void;

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW WINDOW
// ─────────────────────────────────────────────────────────────────────────────

export interface PreviewState {
  isOpen: boolean;
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  
  // Content
  htmlContent?: string;
  jsContent?: string;
  cssContent?: string;
  
  // Status
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MANAGER AUTOMATION
// ─────────────────────────────────────────────────────────────────────────────

export interface AutomationAction {
  type: 'move_cursor' | 'click' | 'type_text' | 'press_key' | 'wait' | 'scroll';
  target?: string;           // Element selector or coordinates
  x?: number;
  y?: number;
  text?: string;
  key?: string;
  duration?: number;
  delay?: number;
}

export interface TeamManagerState {
  isActive: boolean;
  currentAction?: AutomationAction;
  actionQueue: AutomationAction[];
  cursorPosition: { x: number; y: number };
  selectedAgents: string[];
  generatedPrompt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT TASK MAPPING
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentTaskMapping {
  keywords: string[];
  requiredAgents: string[];      // Must be included
  suggestedAgents: string[];     // Recommended
  alwaysActiveAgents: string[];  // Run in background
  validationAgents: string[];    // Validate output
}

// Mapping of task types to agent requirements
export const TASK_AGENT_MAPPINGS: Record<string, AgentTaskMapping> = {
  'create_game': {
    keywords: ['game', 'tetris', 'arcade', 'play', 'interactive'],
    requiredAgents: ['agent-13', 'agent-26', 'agent-17'], // TheAlchemist, SnippetCoder, Visualizer
    suggestedAgents: ['agent-28', 'agent-40'], // CodeRefactorSuggestor, CodeCommenter
    alwaysActiveAgents: ['agent-49', 'agent-4', 'agent-3'], // Bug, Security_Sentinel, Logger
    validationAgents: ['val-01', 'agent-47'], // ResponseValidator, Checks_and_Balances
  },
  'create_app': {
    keywords: ['app', 'application', 'software', 'program', 'build'],
    requiredAgents: ['agent-13', 'agent-26', 'agent-7'], // TheAlchemist, SnippetCoder, PythonInterpreter
    suggestedAgents: ['agent-35', 'agent-42'], // API_Doc_Stubber, AgentDesigner
    alwaysActiveAgents: ['agent-49', 'agent-4', 'agent-3'],
    validationAgents: ['val-01', 'agent-sr'], // ResponseValidator, Self-Review
  },
  'create_agent': {
    keywords: ['agent', 'bot', 'assistant', 'create agent', 'new agent'],
    requiredAgents: ['agent-42', 'agent-13'], // AgentDesigner, TheAlchemist
    suggestedAgents: ['agent-15'], // PromptRefiner
    alwaysActiveAgents: ['agent-49', 'agent-4'],
    validationAgents: ['val-01', 'agent-47'],
  },
  'research': {
    keywords: ['research', 'analyze', 'study', 'investigate', 'find'],
    requiredAgents: ['agent-41', 'agent-21'], // RecursiveWebCrawler, CollectorAlpha
    suggestedAgents: ['agent-23', 'agent-33'], // ContentSummarizer, KeywordFinder
    alwaysActiveAgents: ['agent-3'],
    validationAgents: ['ext-eth-01'], // EthicalComplianceOfficer
  },
  'code_review': {
    keywords: ['review', 'check', 'audit', 'quality', 'refactor'],
    requiredAgents: ['agent-28', 'agent-49'], // CodeRefactorSuggestor, Bug
    suggestedAgents: ['agent-40', 'agent-27'], // CodeCommenter, SQLQueryExplainer
    alwaysActiveAgents: ['agent-4'],
    validationAgents: ['val-01', 'agent-sr'],
  },
  'security': {
    keywords: ['security', 'secure', 'protect', 'vulnerability', 'threat'],
    requiredAgents: ['tool-1', 'tool-2', 'agent-4'], // ThreatPatternMatcher, AnomalyDetection, Security_Sentinel
    suggestedAgents: ['tool-3', 'tool-5'], // RapidResponse, TamperDetector
    alwaysActiveAgents: ['agent-4', 'agent-3', 'agent-49'],
    validationAgents: ['gov-02'], // PolicyComplianceGatekeeper
  },
  'documentation': {
    keywords: ['document', 'docs', 'readme', 'manual', 'explain'],
    requiredAgents: ['agent-5', 'agent-35'], // TheScribe, API_Doc_Stubber
    suggestedAgents: ['agent-40', 'agent-34'], // CodeCommenter, ConceptExplainer
    alwaysActiveAgents: ['agent-3'],
    validationAgents: ['val-01'],
  },
  'default': {
    keywords: [],
    requiredAgents: ['agent-20'], // OrchestratorAlpha
    suggestedAgents: [],
    alwaysActiveAgents: ['agent-49', 'agent-4', 'agent-3'],
    validationAgents: ['val-01'],
  },
};
