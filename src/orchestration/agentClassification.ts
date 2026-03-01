// ═══════════════════════════════════════════════════════════════════════════
// AGENT CLASSIFICATION MAP
// Defines relationships, roles, and behaviors for all 101 agents
// ═══════════════════════════════════════════════════════════════════════════

import type { AgentClassification, AgentRole } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// ALWAYS-ACTIVE AGENTS
// These agents run in the background during any mission
// ─────────────────────────────────────────────────────────────────────────────

export const ALWAYS_ACTIVE_AGENTS = [
  'agent-49',  // Bug — Live-time error detection
  'agent-4',   // Security_Sentinel_001 — Real-time security monitoring
  'agent-3',   // Logger_001 — Centralized logging
  'agent-45',  // MechanicAgent — Constant upkeep
  'agent-47',  // Checks_and_Balances — Best practice enforcement
];

// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATION AGENTS
// Agents that plan, route, and coordinate
// ─────────────────────────────────────────────────────────────────────────────

export const ORCHESTRATION_AGENTS = [
  'agent-20',  // OrchestratorAlpha — Mission planning
  'agent-50',  // APIGateway — Smart dispatcher
  'agent-1',   // AgentricAI_001 — Mission manager
  'agent-2',   // Gatekeeper_001 — Access control
  'agent-43',  // Doppelganger — Executes directives
];

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION AGENTS
// Agents that validate, verify, and approve
// ─────────────────────────────────────────────────────────────────────────────

export const VALIDATION_AGENTS = [
  'val-01',    // ResponseValidatorAgent
  'agent-sr',  // Self-Review_and_Correction
  'gov-01',    // HumanApprovalGateway
  'gov-02',    // PolicyComplianceGatekeeper
  'ext-eth-01', // EthicalComplianceOfficer
];

// ─────────────────────────────────────────────────────────────────────────────
// CONSCIOUSNESS/MEMORY AGENTS
// Agents that manage state and persistence
// ─────────────────────────────────────────────────────────────────────────────

export const MEMORY_AGENTS = [
  'agent-cc',  // Collective Consciousness
  'agent-sc',  // Simulated Consciousness
  'agent-tc',  // Theoretical Consciousness
];

// ─────────────────────────────────────────────────────────────────────────────
// FULL CLASSIFICATION MAP
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_CLASSIFICATIONS: Record<string, AgentClassification> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CONSCIOUSNESS (Memory/State)
  // ═══════════════════════════════════════════════════════════════════════════
  'agent-cc': {
    agentId: 'agent-cc',
    role: 'memory',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-sc': {
    agentId: 'agent-sc',
    role: 'memory',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-tc': {
    agentId: 'agent-tc',
    role: 'memory',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE SYSTEM (Orchestration)
  // ═══════════════════════════════════════════════════════════════════════════
  'agent-50': {
    agentId: 'agent-50',
    role: 'gateway',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: ['agent-20', 'agent-1'], // Can trigger Orchestrator or AgentricAI_001
  },
  'agent-1': {
    agentId: 'agent-1',
    role: 'orchestrator',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: ['agent-50'],
    triggers: ['agent-20'],
  },
  'agent-20': {
    agentId: 'agent-20',
    role: 'orchestrator',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-50', 'agent-1'],
    triggers: [], // Triggers any agent based on plan
  },
  'agent-sr': {
    agentId: 'agent-sr',
    role: 'validator',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: ['agent-45', 'agent-49'], // Can trigger MechanicAgent or Bug
  },
  'agent-2': {
    agentId: 'agent-2',
    role: 'gateway',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: ['agent-4'], // Works with Security Sentinel
    triggers: [],
  },
  'agent-3': {
    agentId: 'agent-3',
    role: 'monitor',
    isAlwaysActive: true,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-4': {
    agentId: 'agent-4',
    role: 'monitor',
    isAlwaysActive: true,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: ['tool-7', 'act-01', 'act-02'], // Can trigger BitForce, Isolation, NetworkBlock
  },
  'agent-45': {
    agentId: 'agent-45',
    role: 'monitor',
    isAlwaysActive: true,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-4'],
    triggers: ['agent-49'], // Can trigger Bug
  },
  'agent-47': {
    agentId: 'agent-47',
    role: 'validator',
    isAlwaysActive: true,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: ['agent-4'],
    triggers: ['agent-sr'], // Can trigger Self-Review
  },
  'agent-43': {
    agentId: 'agent-43',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-20', 'agent-4'], // Only acts on orchestrator directives, monitored by security
    triggers: [],
  },
  'agent-49': {
    agentId: 'agent-49',
    role: 'monitor',
    isAlwaysActive: true,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-4', 'agent-45'],
    triggers: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOOL-ENABLED (Executors)
  // ═══════════════════════════════════════════════════════════════════════════
  'agent-7': {
    agentId: 'agent-7',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: true, // Executes code — needs approval
    dependencies: [],
    triggers: [],
  },
  'agent-8': {
    agentId: 'agent-8',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: true, // Executes git commands
    dependencies: [],
    triggers: [],
  },
  'agent-44': {
    agentId: 'agent-44',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: true, // Accesses filesystem
    dependencies: [],
    triggers: [],
  },
  'agent-48': {
    agentId: 'agent-48',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: true,
    dependencies: [],
    triggers: [],
  },
  'agent-img-1': {
    agentId: 'agent-img-1',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVELOPMENT / CODE (Specialists)
  // ═══════════════════════════════════════════════════════════════════════════
  'agent-13': {
    agentId: 'agent-13',
    role: 'specialist',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: ['agent-26', 'agent-17'], // Triggers SnippetCoder, Visualizer after blueprints
  },
  'agent-26': {
    agentId: 'agent-26',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-13'], // Needs blueprint first
    triggers: ['agent-28', 'agent-40'], // Then refactor and comment
  },
  'agent-28': {
    agentId: 'agent-28',
    role: 'validator',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-26'],
    triggers: [],
  },
  'agent-40': {
    agentId: 'agent-40',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-26'],
    triggers: [],
  },
  'agent-27': {
    agentId: 'agent-27',
    role: 'specialist',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-35': {
    agentId: 'agent-35',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-42': {
    agentId: 'agent-42',
    role: 'specialist',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT / LANGUAGE (Specialists)
  // ═══════════════════════════════════════════════════════════════════════════
  'agent-5': {
    agentId: 'agent-5',
    role: 'specialist',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-15': {
    agentId: 'agent-15',
    role: 'specialist',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-17': {
    agentId: 'agent-17',
    role: 'specialist',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-13'], // Works after TheAlchemist blueprint
    triggers: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPPORT (Support Agents)
  // ═══════════════════════════════════════════════════════════════════════════
  'agent-6': {
    agentId: 'agent-6',
    role: 'support',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },
  'agent-18': {
    agentId: 'agent-18',
    role: 'specialist',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: ['agent-tc'], // Feeds into Theoretical Consciousness
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY (Monitors & Executors)
  // ═══════════════════════════════════════════════════════════════════════════
  'tool-1': {
    agentId: 'tool-1',
    role: 'monitor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-4'],
    triggers: ['tool-3'], // Can trigger RapidResponse
  },
  'tool-2': {
    agentId: 'tool-2',
    role: 'monitor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-4'],
    triggers: ['tool-3'],
  },
  'tool-3': {
    agentId: 'tool-3',
    role: 'orchestrator',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['tool-1', 'tool-2'],
    triggers: ['act-01', 'act-02', 'act-03', 'act-04', 'act-05'], // Triggers enforcement agents
  },
  'tool-7': {
    agentId: 'tool-7',
    role: 'executor',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: ['agent-4'], // Only deployed by Security Sentinel
    triggers: ['tool-8'], // Then reports
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERNANCE (Validators)
  // ═══════════════════════════════════════════════════════════════════════════
  'gov-01': {
    agentId: 'gov-01',
    role: 'gateway',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: true, // This IS the human approval gateway
    dependencies: [],
    triggers: [],
  },
  'gov-02': {
    agentId: 'gov-02',
    role: 'validator',
    isAlwaysActive: false,
    canRetry: false,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'val-01': {
    agentId: 'val-01',
    role: 'validator',
    isAlwaysActive: false,
    canRetry: true,
    requiresHumanApproval: false,
    dependencies: [],
    triggers: ['agent-49'], // Can trigger Bug if issues found
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function getAgentClassification(agentId: string): AgentClassification | undefined {
  return AGENT_CLASSIFICATIONS[agentId];
}

export function getAgentRole(agentId: string): AgentRole {
  return AGENT_CLASSIFICATIONS[agentId]?.role || 'executor';
}

export function isAlwaysActive(agentId: string): boolean {
  return ALWAYS_ACTIVE_AGENTS.includes(agentId);
}

export function isOrchestrationAgent(agentId: string): boolean {
  return ORCHESTRATION_AGENTS.includes(agentId);
}

export function isValidationAgent(agentId: string): boolean {
  return VALIDATION_AGENTS.includes(agentId);
}

export function isMemoryAgent(agentId: string): boolean {
  return MEMORY_AGENTS.includes(agentId);
}

export function getAgentDependencies(agentId: string): string[] {
  return AGENT_CLASSIFICATIONS[agentId]?.dependencies || [];
}

export function getAgentTriggers(agentId: string): string[] {
  return AGENT_CLASSIFICATIONS[agentId]?.triggers || [];
}

export function canRetry(agentId: string): boolean {
  return AGENT_CLASSIFICATIONS[agentId]?.canRetry ?? true;
}

export function requiresHumanApproval(agentId: string): boolean {
  return AGENT_CLASSIFICATIONS[agentId]?.requiresHumanApproval ?? false;
}
