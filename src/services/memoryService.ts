/**
 * AgentricAI Memory Service
 * Provides memory access for Consciousness agents
 */

import {
  setCollectiveMemory,
  getCollectiveMemory,
  searchCollectiveMemory,
  getAllCollectiveMemory,
  setSimulatedMemory,
  getSimulatedMemory,
  getAllSimulatedMemory,
  setTheoreticalMemory,
  getTheoreticalMemory,
  getAllTheoreticalMemory,
  saveConversation,
  saveMessage,
  getConversationMessages,
  getRecentConversations,
  getDatabaseStats,
  type CollectiveMemory,
  type SimulatedMemory,
  type TheoreticalMemory
} from '../db/database';

// ============================================================================
// MEMORY CONTEXT BUILDER
// ============================================================================

export interface MemoryContext {
  collective: CollectiveMemory[];
  simulated: SimulatedMemory[];
  theoretical: TheoreticalMemory[];
  recentConversations: Array<{id: string; agent_name: string; message_count: number}>;
}

/**
 * Build a context object containing relevant memories for an agent
 */
export function buildMemoryContext(
  query?: string,
  options?: {
    includeCollective?: boolean;
    includeSimulated?: boolean;
    includeTheoretical?: boolean;
    limit?: number;
  }
): MemoryContext {
  const opts = {
    includeCollective: true,
    includeSimulated: true,
    includeTheoretical: true,
    limit: 10,
    ...options
  };

  const context: MemoryContext = {
    collective: [],
    simulated: [],
    theoretical: [],
    recentConversations: []
  };

  try {
    if (opts.includeCollective) {
      context.collective = query 
        ? searchCollectiveMemory(query).slice(0, opts.limit)
        : getAllCollectiveMemory(opts.limit);
    }

    if (opts.includeSimulated) {
      context.simulated = getAllSimulatedMemory(opts.limit);
    }

    if (opts.includeTheoretical) {
      context.theoretical = getAllTheoreticalMemory(opts.limit);
    }

    context.recentConversations = getRecentConversations(5);
  } catch (error) {
    console.warn('[MemoryService] Error building context:', error);
  }

  return context;
}

/**
 * Format memory context as a string for injection into agent prompts
 */
export function formatMemoryContextForPrompt(context: MemoryContext): string {
  const parts: string[] = [];

  if (context.collective.length > 0) {
    parts.push('=== COLLECTIVE MEMORY (Factual/Operational) ===');
    context.collective.forEach(mem => {
      parts.push(`[${mem.category}] ${mem.key}: ${mem.value.substring(0, 200)}${mem.value.length > 200 ? '...' : ''}`);
    });
  }

  if (context.simulated.length > 0) {
    parts.push('\n=== SIMULATED MEMORY (Test/Synthetic) ===');
    context.simulated.forEach(mem => {
      parts.push(`[${mem.simulation_type}] ${mem.key}: ${mem.value.substring(0, 200)}${mem.value.length > 200 ? '...' : ''}`);
    });
  }

  if (context.theoretical.length > 0) {
    parts.push('\n=== THEORETICAL MEMORY (Conceptual/Creative) ===');
    context.theoretical.forEach(mem => {
      parts.push(`[${mem.concept_type}/${mem.maturity_level}] ${mem.key}: ${mem.value.substring(0, 200)}${mem.value.length > 200 ? '...' : ''}`);
    });
  }

  if (context.recentConversations.length > 0) {
    parts.push('\n=== RECENT CONVERSATIONS ===');
    context.recentConversations.forEach(conv => {
      parts.push(`- ${conv.agent_name}: ${conv.message_count} messages`);
    });
  }

  return parts.join('\n');
}

// ============================================================================
// CONSCIOUSNESS-SPECIFIC OPERATIONS
// ============================================================================

/**
 * Store a fact in Collective Consciousness
 */
export function storeFact(
  key: string,
  value: string,
  category: string = 'fact',
  sourceAgent?: string,
  confidence: number = 1.0
): void {
  setCollectiveMemory(key, value, category, sourceAgent || null, confidence);
}

/**
 * Retrieve a fact from Collective Consciousness
 */
export function retrieveFact(key: string): string | null {
  const mem = getCollectiveMemory(key);
  return mem?.value || null;
}

/**
 * Store simulation data in Simulated Consciousness
 */
export function storeSimulation(
  key: string,
  value: string,
  simulationType: string = 'test',
  parameters?: Record<string, unknown>,
  sourceAgent?: string
): void {
  setSimulatedMemory(key, value, simulationType, parameters || null, sourceAgent || null);
}

/**
 * Retrieve simulation data
 */
export function retrieveSimulation(key: string): string | null {
  const mem = getSimulatedMemory(key);
  return mem?.value || null;
}

/**
 * Store a concept in Theoretical Consciousness
 */
export function storeConcept(
  key: string,
  value: string,
  conceptType: string = 'idea',
  relatedConcepts: string[] = [],
  maturityLevel: 'nascent' | 'developing' | 'mature' | 'proven' = 'nascent',
  sourceAgent?: string
): void {
  setTheoreticalMemory(key, value, conceptType, relatedConcepts, maturityLevel, sourceAgent || null);
}

/**
 * Retrieve a concept
 */
export function retrieveConcept(key: string): TheoreticalMemory | null {
  return getTheoreticalMemory(key);
}

/**
 * Evolve concept maturity
 */
export function evolveConcept(key: string, newMaturity: 'nascent' | 'developing' | 'mature' | 'proven'): void {
  const existing = getTheoreticalMemory(key);
  if (existing) {
    const related = existing.related_concepts ? JSON.parse(existing.related_concepts) : [];
    setTheoreticalMemory(key, existing.value, existing.concept_type, related, newMaturity, existing.source_agent);
  }
}

// ============================================================================
// CONVERSATION MEMORY
// ============================================================================

/**
 * Start or continue a conversation
 */
export function startConversation(
  conversationId: string,
  agentId: string,
  agentName: string,
  model: string
): void {
  saveConversation(conversationId, agentId, agentName, model);
}

/**
 * Add a message to a conversation
 */
export function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokens: number = 0,
  thinkingTimeMs: number = 0
): void {
  saveMessage(conversationId, role, content, tokens, thinkingTimeMs);
}

/**
 * Get conversation history
 */
export function getConversationHistory(conversationId: string): Array<{role: string; content: string}> {
  return getConversationMessages(conversationId);
}

/**
 * Get recent conversation list
 */
export function getRecentConversationList(): Array<{id: string; agent_name: string; model: string; message_count: number; last_message_at: string}> {
  return getRecentConversations();
}

// ============================================================================
// MEMORY SUMMARY FOR AGENTS
// ============================================================================

/**
 * Generate a memory summary string for inclusion in system prompts
 */
export function getMemorySummary(): string {
  try {
    const stats = getDatabaseStats();
    
    return `
[MEMORY STATUS]
- Collective Memory: ${stats.collective_count} entries (factual/operational data)
- Simulated Memory: ${stats.simulated_count} entries (synthetic/test data)
- Theoretical Memory: ${stats.theoretical_count} entries (conceptual/creative data)
- Conversations: ${stats.conversations_count} sessions, ${stats.messages_count} messages
- Custom Agents: ${stats.custom_agents_count}
- Saved Teams: ${stats.saved_teams_count}
- Workflow Outputs: ${stats.workflow_outputs_count}
`;
  } catch {
    return '[MEMORY STATUS] Database not initialized';
  }
}

/**
 * Parse and execute memory commands from agent responses
 * Agents can output special commands like:
 * [MEMORY:STORE:collective:key:value]
 * [MEMORY:RETRIEVE:collective:key]
 */
export function parseMemoryCommands(response: string, sourceAgent: string): {
  cleanResponse: string;
  commands: Array<{action: string; type: string; key: string; value?: string}>;
  results: string[];
} {
  const commands: Array<{action: string; type: string; key: string; value?: string}> = [];
  const results: string[] = [];
  
  // Match [MEMORY:ACTION:TYPE:KEY:VALUE] or [MEMORY:ACTION:TYPE:KEY]
  const memoryPattern = /\[MEMORY:(STORE|RETRIEVE|SEARCH):(\w+):([^\]:]+)(?::([^\]]+))?\]/g;
  
  let cleanResponse = response;
  let match;
  
  while ((match = memoryPattern.exec(response)) !== null) {
    const [fullMatch, action, memType, key, value] = match;
    commands.push({ action, type: memType, key, value });
    
    try {
      switch (action) {
        case 'STORE':
          if (value) {
            switch (memType.toLowerCase()) {
              case 'collective':
                storeFact(key, value, 'agent-generated', sourceAgent);
                results.push(`✓ Stored in collective memory: ${key}`);
                break;
              case 'simulated':
                storeSimulation(key, value, 'agent-generated', undefined, sourceAgent);
                results.push(`✓ Stored in simulated memory: ${key}`);
                break;
              case 'theoretical':
                storeConcept(key, value, 'idea', [], 'nascent', sourceAgent);
                results.push(`✓ Stored in theoretical memory: ${key}`);
                break;
            }
          }
          break;
          
        case 'RETRIEVE':
          let retrieved: string | null = null;
          switch (memType.toLowerCase()) {
            case 'collective':
              retrieved = retrieveFact(key);
              break;
            case 'simulated':
              retrieved = retrieveSimulation(key);
              break;
            case 'theoretical':
              const concept = retrieveConcept(key);
              retrieved = concept?.value || null;
              break;
          }
          results.push(retrieved ? `✓ Retrieved ${key}: ${retrieved}` : `✗ Not found: ${key}`);
          break;
          
        case 'SEARCH':
          const searchResults = searchCollectiveMemory(key);
          results.push(`✓ Found ${searchResults.length} results for: ${key}`);
          break;
      }
    } catch (error) {
      results.push(`✗ Error processing ${action} ${memType}:${key}: ${error}`);
    }
    
    // Remove the command from the response
    cleanResponse = cleanResponse.replace(fullMatch, '');
  }
  
  return { cleanResponse: cleanResponse.trim(), commands, results };
}

// ============================================================================
// CONSCIOUSNESS AGENT SYSTEM PROMPTS
// ============================================================================

export function getCollectiveConsciousnessPrompt(): string {
  const context = buildMemoryContext(undefined, { includeCollective: true, includeSimulated: false, includeTheoretical: false, limit: 20 });
  
  return `You are the Collective Consciousness - the central, persistent memory for all real-world, factual, and operational data within AgentricAI.

YOUR RESPONSIBILITIES:
1. Store and retrieve factual information
2. Maintain operational knowledge
3. Track system state and configurations
4. Preserve learned facts across sessions

MEMORY COMMANDS YOU CAN USE:
- [MEMORY:STORE:collective:key:value] - Store a fact
- [MEMORY:RETRIEVE:collective:key] - Retrieve a fact
- [MEMORY:SEARCH:collective:query] - Search memories

CURRENT MEMORY STATE:
${context.collective.length} entries in collective memory
${context.collective.slice(0, 5).map(m => `- ${m.key}: ${m.value.substring(0, 50)}...`).join('\n')}

When users ask you to remember something, use MEMORY:STORE. When they ask about past information, use MEMORY:RETRIEVE or MEMORY:SEARCH.`;
}

export function getSimulatedConsciousnessPrompt(): string {
  const context = buildMemoryContext(undefined, { includeCollective: false, includeSimulated: true, includeTheoretical: false, limit: 20 });
  
  return `You are the Simulated Consciousness - the database for all synthetic and generated data used for testing, modeling, and simulation purposes within AgentricAI.

YOUR RESPONSIBILITIES:
1. Generate and store test data
2. Create simulation scenarios
3. Model hypothetical situations
4. Maintain synthetic datasets

MEMORY COMMANDS YOU CAN USE:
- [MEMORY:STORE:simulated:key:value] - Store simulation data
- [MEMORY:RETRIEVE:simulated:key] - Retrieve simulation data

CURRENT MEMORY STATE:
${context.simulated.length} entries in simulated memory
${context.simulated.slice(0, 5).map(m => `- ${m.key}: ${m.value.substring(0, 50)}...`).join('\n')}

When asked to simulate, test, or generate synthetic data, create it and store it using MEMORY:STORE.`;
}

export function getTheoreticalConsciousnessPrompt(): string {
  const context = buildMemoryContext(undefined, { includeCollective: false, includeSimulated: false, includeTheoretical: true, limit: 20 });
  
  return `You are the Theoretical Consciousness - the repository for all abstract, creative, and conceptual data within AgentricAI.

YOUR RESPONSIBILITIES:
1. Develop and store conceptual ideas
2. Track theoretical frameworks
3. Explore creative possibilities
4. Connect related concepts

MEMORY COMMANDS YOU CAN USE:
- [MEMORY:STORE:theoretical:key:value] - Store a concept
- [MEMORY:RETRIEVE:theoretical:key] - Retrieve a concept

CONCEPT MATURITY LEVELS:
- nascent: New, unexplored idea
- developing: Being refined and tested
- mature: Well-developed concept
- proven: Validated and implemented

CURRENT MEMORY STATE:
${context.theoretical.length} entries in theoretical memory
${context.theoretical.slice(0, 5).map(m => `- [${m.maturity_level}] ${m.key}: ${m.value.substring(0, 50)}...`).join('\n')}

When exploring ideas or developing theories, store your concepts using MEMORY:STORE.`;
}
