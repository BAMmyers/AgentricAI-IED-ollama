/**
 * AgentricAI SQLite Database Manager
 * Uses sql.js (SQLite compiled to WebAssembly) with IndexedDB persistence
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

// Database singleton
let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

const DB_NAME = 'agentric_ai_db';
const DB_STORE = 'database';

// ============================================================================
// INDEXEDDB PERSISTENCE
// ============================================================================

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains(DB_STORE)) {
        idb.createObjectStore(DB_STORE);
      }
    };
    
    request.onsuccess = () => {
      const idb = request.result;
      const tx = idb.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put(data, 'db_data');
      tx.oncomplete = () => {
        idb.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains(DB_STORE)) {
        idb.createObjectStore(DB_STORE);
      }
    };
    
    request.onsuccess = () => {
      const idb = request.result;
      const tx = idb.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const getRequest = store.get('db_data');
      
      getRequest.onsuccess = () => {
        idb.close();
        resolve(getRequest.result || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

const SCHEMA = `
-- Collective Consciousness: Real-world, factual, operational data
CREATE TABLE IF NOT EXISTS collective_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    source_agent TEXT,
    confidence REAL DEFAULT 1.0,
    access_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL
);

-- Simulated Consciousness: Synthetic and generated data
CREATE TABLE IF NOT EXISTS simulated_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    simulation_type TEXT DEFAULT 'test',
    parameters TEXT,
    source_agent TEXT,
    is_validated INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Theoretical Consciousness: Abstract, creative, conceptual data
CREATE TABLE IF NOT EXISTS theoretical_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    concept_type TEXT DEFAULT 'idea',
    related_concepts TEXT,
    maturity_level TEXT DEFAULT 'nascent',
    source_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    model TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    context_summary TEXT,
    is_archived INTEGER DEFAULT 0
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    thinking_time_ms INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workflow outputs
CREATE TABLE IF NOT EXISTS workflow_outputs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    agents_used TEXT NOT NULL,
    mission TEXT,
    result TEXT NOT NULL,
    execution_time_ms INTEGER,
    success INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Custom agents
CREATE TABLE IF NOT EXISTS custom_agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    category TEXT DEFAULT 'Custom',
    model TEXT NOT NULL,
    system_prompt TEXT,
    tools TEXT,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2048,
    logic TEXT DEFAULT 'local',
    color TEXT DEFAULT '#06b6d4',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved teams
CREATE TABLE IF NOT EXISTS saved_teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    agent_ids TEXT NOT NULL,
    default_mission TEXT,
    use_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    tags TEXT,
    source TEXT,
    embedding_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agent feedback
CREATE TABLE IF NOT EXISTS agent_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    conversation_id TEXT,
    feedback_type TEXT NOT NULL,
    original_response TEXT,
    corrected_response TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collective_category ON collective_memory(category);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('db_version', '1.0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('verbose_mode', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('default_model', 'AgentricAIcody');
INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_save_conversations', 'true');
`;

export async function initDatabase(): Promise<Database> {
  if (db) return db;
  
  // Initialize sql.js
  SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
  });
  
  // Try to load existing database from IndexedDB
  const savedData = await loadFromIndexedDB();
  
  if (savedData) {
    db = new SQL.Database(savedData);
    console.log('[AgentricAI DB] Loaded existing database from IndexedDB');
  } else {
    db = new SQL.Database();
    db.run(SCHEMA);
    await saveDatabase();
    console.log('[AgentricAI DB] Created new database with schema');
  }
  
  return db;
}

export async function saveDatabase(): Promise<void> {
  if (!db) return;
  const data = db.export();
  await saveToIndexedDB(data);
  console.log('[AgentricAI DB] Saved to IndexedDB');
}

export function getDatabase(): Database | null {
  return db;
}

// ============================================================================
// MEMORY OPERATIONS - COLLECTIVE CONSCIOUSNESS
// ============================================================================

export interface CollectiveMemory {
  id: number;
  key: string;
  value: string;
  category: string;
  source_agent: string | null;
  confidence: number;
  access_count: number;
  created_at: string;
  updated_at: string;
}

export function setCollectiveMemory(
  key: string,
  value: string,
  category: string = 'general',
  sourceAgent: string | null = null,
  confidence: number = 1.0
): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO collective_memory (key, value, category, source_agent, confidence, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      category = excluded.category,
      confidence = excluded.confidence,
      access_count = access_count + 1,
      updated_at = CURRENT_TIMESTAMP
  `, [key, value, category, sourceAgent, confidence]);
  
  saveDatabase();
}

export function getCollectiveMemory(key: string): CollectiveMemory | null {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`
    SELECT * FROM collective_memory WHERE key = ?
  `, [key]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  const columns = result[0].columns;
  
  // Update access count
  db.run(`UPDATE collective_memory SET access_count = access_count + 1 WHERE key = ?`, [key]);
  
  return Object.fromEntries(columns.map((col, i) => [col, row[i]])) as unknown as CollectiveMemory;
}

export function searchCollectiveMemory(query: string, category?: string): CollectiveMemory[] {
  if (!db) throw new Error('Database not initialized');
  
  let sql = `SELECT * FROM collective_memory WHERE (key LIKE ? OR value LIKE ?)`;
  const params: string[] = [`%${query}%`, `%${query}%`];
  
  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }
  
  sql += ` ORDER BY access_count DESC, updated_at DESC LIMIT 50`;
  
  const result = db.exec(sql, params);
  if (result.length === 0) return [];
  
  return result[0].values.map(row => 
    Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
  ) as unknown as CollectiveMemory[];
}

export function getAllCollectiveMemory(limit: number = 100): CollectiveMemory[] {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`
    SELECT * FROM collective_memory 
    ORDER BY updated_at DESC 
    LIMIT ?
  `, [limit]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row =>
    Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
  ) as unknown as CollectiveMemory[];
}

// ============================================================================
// MEMORY OPERATIONS - SIMULATED CONSCIOUSNESS
// ============================================================================

export interface SimulatedMemory {
  id: number;
  key: string;
  value: string;
  simulation_type: string;
  parameters: string | null;
  source_agent: string | null;
  is_validated: number;
  created_at: string;
  updated_at: string;
}

export function setSimulatedMemory(
  key: string,
  value: string,
  simulationType: string = 'test',
  parameters: Record<string, unknown> | null = null,
  sourceAgent: string | null = null
): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO simulated_memory (key, value, simulation_type, parameters, source_agent, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      simulation_type = excluded.simulation_type,
      parameters = excluded.parameters,
      updated_at = CURRENT_TIMESTAMP
  `, [key, value, simulationType, parameters ? JSON.stringify(parameters) : null, sourceAgent]);
  
  saveDatabase();
}

export function getSimulatedMemory(key: string): SimulatedMemory | null {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT * FROM simulated_memory WHERE key = ?`, [key]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  return Object.fromEntries(
    result[0].columns.map((col, i) => [col, result[0].values[0][i]])
  ) as unknown as SimulatedMemory;
}

export function getAllSimulatedMemory(limit: number = 100): SimulatedMemory[] {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT * FROM simulated_memory ORDER BY updated_at DESC LIMIT ?`, [limit]);
  if (result.length === 0) return [];
  
  return result[0].values.map(row =>
    Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
  ) as unknown as SimulatedMemory[];
}

// ============================================================================
// MEMORY OPERATIONS - THEORETICAL CONSCIOUSNESS
// ============================================================================

export interface TheoreticalMemory {
  id: number;
  key: string;
  value: string;
  concept_type: string;
  related_concepts: string | null;
  maturity_level: string;
  source_agent: string | null;
  created_at: string;
  updated_at: string;
}

export function setTheoreticalMemory(
  key: string,
  value: string,
  conceptType: string = 'idea',
  relatedConcepts: string[] = [],
  maturityLevel: string = 'nascent',
  sourceAgent: string | null = null
): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO theoretical_memory (key, value, concept_type, related_concepts, maturity_level, source_agent, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      concept_type = excluded.concept_type,
      related_concepts = excluded.related_concepts,
      maturity_level = excluded.maturity_level,
      updated_at = CURRENT_TIMESTAMP
  `, [key, value, conceptType, JSON.stringify(relatedConcepts), maturityLevel, sourceAgent]);
  
  saveDatabase();
}

export function getTheoreticalMemory(key: string): TheoreticalMemory | null {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT * FROM theoretical_memory WHERE key = ?`, [key]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  return Object.fromEntries(
    result[0].columns.map((col, i) => [col, result[0].values[0][i]])
  ) as unknown as TheoreticalMemory;
}

export function getAllTheoreticalMemory(limit: number = 100): TheoreticalMemory[] {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT * FROM theoretical_memory ORDER BY updated_at DESC LIMIT ?`, [limit]);
  if (result.length === 0) return [];
  
  return result[0].values.map(row =>
    Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
  ) as unknown as TheoreticalMemory[];
}

// ============================================================================
// CONVERSATION OPERATIONS
// ============================================================================

export function saveConversation(
  id: string,
  agentId: string,
  agentName: string,
  model: string
): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO conversations (id, agent_id, agent_name, model)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      last_message_at = CURRENT_TIMESTAMP,
      message_count = message_count + 1
  `, [id, agentId, agentName, model]);
  
  saveDatabase();
}

export function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokens: number = 0,
  thinkingTimeMs: number = 0
): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO messages (conversation_id, role, content, tokens, thinking_time_ms)
    VALUES (?, ?, ?, ?, ?)
  `, [conversationId, role, content, tokens, thinkingTimeMs]);
  
  // Update conversation
  db.run(`
    UPDATE conversations 
    SET last_message_at = CURRENT_TIMESTAMP, message_count = message_count + 1 
    WHERE id = ?
  `, [conversationId]);
  
  saveDatabase();
}

export function getConversationMessages(conversationId: string): Array<{role: string; content: string; created_at: string}> {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`
    SELECT role, content, created_at FROM messages 
    WHERE conversation_id = ? 
    ORDER BY created_at ASC
  `, [conversationId]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    role: row[0] as string,
    content: row[1] as string,
    created_at: row[2] as string
  }));
}

export function getRecentConversations(limit: number = 20): Array<{id: string; agent_name: string; model: string; message_count: number; last_message_at: string}> {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`
    SELECT id, agent_name, model, message_count, last_message_at 
    FROM conversations 
    WHERE is_archived = 0
    ORDER BY last_message_at DESC 
    LIMIT ?
  `, [limit]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    agent_name: row[1] as string,
    model: row[2] as string,
    message_count: row[3] as number,
    last_message_at: row[4] as string
  }));
}

// ============================================================================
// CUSTOM AGENTS
// ============================================================================

export function saveCustomAgent(agent: {
  id: string;
  name: string;
  role: string;
  category?: string;
  model: string;
  systemPrompt?: string;
  tools?: string[];
  temperature?: number;
  maxTokens?: number;
  logic?: string;
  color?: string;
}): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO custom_agents (id, name, role, category, model, system_prompt, tools, temperature, max_tokens, logic, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      role = excluded.role,
      category = excluded.category,
      model = excluded.model,
      system_prompt = excluded.system_prompt,
      tools = excluded.tools,
      temperature = excluded.temperature,
      max_tokens = excluded.max_tokens,
      logic = excluded.logic,
      color = excluded.color,
      updated_at = CURRENT_TIMESTAMP
  `, [
    agent.id,
    agent.name,
    agent.role,
    agent.category || 'Custom',
    agent.model,
    agent.systemPrompt || null,
    agent.tools ? JSON.stringify(agent.tools) : null,
    agent.temperature || 0.7,
    agent.maxTokens || 2048,
    agent.logic || 'local',
    agent.color || '#06b6d4'
  ]);
  
  saveDatabase();
}

export function getCustomAgents(): Array<{
  id: string;
  name: string;
  role: string;
  category: string;
  model: string;
  system_prompt: string | null;
  tools: string | null;
  temperature: number;
  max_tokens: number;
  logic: string;
  color: string;
}> {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT * FROM custom_agents WHERE is_active = 1 ORDER BY created_at DESC`);
  if (result.length === 0) return [];
  
  return result[0].values.map(row =>
    Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
  ) as unknown as Array<{
    id: string;
    name: string;
    role: string;
    category: string;
    model: string;
    system_prompt: string | null;
    tools: string | null;
    temperature: number;
    max_tokens: number;
    logic: string;
    color: string;
  }>;
}

export function deleteCustomAgent(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.run(`UPDATE custom_agents SET is_active = 0 WHERE id = ?`, [id]);
  saveDatabase();
}

// ============================================================================
// SAVED TEAMS
// ============================================================================

export function saveTeam(
  id: string,
  name: string,
  description: string,
  agentIds: string[],
  defaultMission?: string
): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO saved_teams (id, name, description, agent_ids, default_mission)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      agent_ids = excluded.agent_ids,
      default_mission = excluded.default_mission,
      updated_at = CURRENT_TIMESTAMP
  `, [id, name, description, JSON.stringify(agentIds), defaultMission || null]);
  
  saveDatabase();
}

export function getSavedTeams(): Array<{id: string; name: string; description: string; agent_ids: string[]; use_count: number}> {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT id, name, description, agent_ids, use_count FROM saved_teams ORDER BY use_count DESC`);
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    name: row[1] as string,
    description: row[2] as string,
    agent_ids: JSON.parse(row[3] as string),
    use_count: row[4] as number
  }));
}

export function incrementTeamUseCount(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.run(`UPDATE saved_teams SET use_count = use_count + 1 WHERE id = ?`, [id]);
  saveDatabase();
}

// ============================================================================
// SETTINGS
// ============================================================================

export function getSetting(key: string): string | null {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT value FROM settings WHERE key = ?`, [key]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  return result[0].values[0][0] as string;
}

export function setSetting(key: string, value: string): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `, [key, value]);
  
  saveDatabase();
}

// ============================================================================
// WORKFLOW OUTPUTS
// ============================================================================

export function saveWorkflowOutput(output: {
  id: string;
  name: string;
  type: 'workflow' | 'team' | 'single';
  agentsUsed: string[];
  mission?: string;
  result: string;
  executionTimeMs?: number;
  success?: boolean;
}): void {
  if (!db) throw new Error('Database not initialized');
  
  db.run(`
    INSERT INTO workflow_outputs (id, name, type, agents_used, mission, result, execution_time_ms, success)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    output.id,
    output.name,
    output.type,
    JSON.stringify(output.agentsUsed),
    output.mission || null,
    output.result,
    output.executionTimeMs || 0,
    output.success !== false ? 1 : 0
  ]);
  
  saveDatabase();
}

export function getWorkflowOutputs(limit: number = 50): Array<{
  id: string;
  name: string;
  type: string;
  agents_used: string[];
  mission: string | null;
  result: string;
  execution_time_ms: number;
  success: boolean;
  created_at: string;
}> {
  if (!db) throw new Error('Database not initialized');
  
  const result = db.exec(`SELECT * FROM workflow_outputs ORDER BY created_at DESC LIMIT ?`, [limit]);
  if (result.length === 0) return [];
  
  return result[0].values.map(row => {
    const obj = Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]));
    return {
      ...obj,
      agents_used: JSON.parse(obj.agents_used as string),
      success: obj.success === 1
    };
  }) as unknown as Array<{
    id: string;
    name: string;
    type: string;
    agents_used: string[];
    mission: string | null;
    result: string;
    execution_time_ms: number;
    success: boolean;
    created_at: string;
  }>;
}

// ============================================================================
// DATABASE STATS
// ============================================================================

export function getDatabaseStats(): {
  collective_count: number;
  simulated_count: number;
  theoretical_count: number;
  conversations_count: number;
  messages_count: number;
  custom_agents_count: number;
  saved_teams_count: number;
  workflow_outputs_count: number;
} {
  if (!db) throw new Error('Database not initialized');
  
  const counts = {
    collective_count: 0,
    simulated_count: 0,
    theoretical_count: 0,
    conversations_count: 0,
    messages_count: 0,
    custom_agents_count: 0,
    saved_teams_count: 0,
    workflow_outputs_count: 0
  };
  
  const tables = [
    ['collective_memory', 'collective_count'],
    ['simulated_memory', 'simulated_count'],
    ['theoretical_memory', 'theoretical_count'],
    ['conversations', 'conversations_count'],
    ['messages', 'messages_count'],
    ['custom_agents', 'custom_agents_count'],
    ['saved_teams', 'saved_teams_count'],
    ['workflow_outputs', 'workflow_outputs_count']
  ] as const;
  
  for (const [table, key] of tables) {
    const result = db.exec(`SELECT COUNT(*) FROM ${table}`);
    if (result.length > 0) {
      counts[key] = result[0].values[0][0] as number;
    }
  }
  
  return counts;
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

export function exportDatabase(): Uint8Array | null {
  if (!db) return null;
  return db.export();
}

export async function importDatabase(data: Uint8Array): Promise<void> {
  if (!SQL) throw new Error('SQL.js not initialized');
  
  db = new SQL.Database(data);
  await saveDatabase();
}

export function clearAllData(): void {
  if (!db) throw new Error('Database not initialized');
  
  const tables = [
    'collective_memory',
    'simulated_memory', 
    'theoretical_memory',
    'messages',
    'conversations',
    'workflow_outputs',
    'custom_agents',
    'saved_teams',
    'agent_feedback',
    'knowledge_base'
  ];
  
  for (const table of tables) {
    db.run(`DELETE FROM ${table}`);
  }
  
  saveDatabase();
}
