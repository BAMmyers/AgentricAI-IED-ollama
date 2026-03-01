-- AgentricAI SQLite Schema v1.0
-- Persistent memory for Consciousness agents and system state

-- ============================================================================
-- CONSCIOUSNESS MEMORY TABLES
-- ============================================================================

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

-- Simulated Consciousness: Synthetic and generated data for testing/modeling
CREATE TABLE IF NOT EXISTS simulated_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    simulation_type TEXT DEFAULT 'test',
    parameters TEXT, -- JSON string of simulation params
    source_agent TEXT,
    is_validated INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Theoretical Consciousness: Abstract, creative, and conceptual data
CREATE TABLE IF NOT EXISTS theoretical_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    concept_type TEXT DEFAULT 'idea',
    related_concepts TEXT, -- JSON array of related keys
    maturity_level TEXT DEFAULT 'nascent', -- nascent, developing, mature, proven
    source_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONVERSATION & CONTEXT TABLES
-- ============================================================================

-- Conversation sessions
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

-- Individual messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    thinking_time_ms INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- ============================================================================
-- WORKFLOW & OUTPUT TABLES
-- ============================================================================

-- Saved workflow outputs
CREATE TABLE IF NOT EXISTS workflow_outputs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'workflow', 'team', 'single'
    agents_used TEXT NOT NULL, -- JSON array
    mission TEXT,
    result TEXT NOT NULL, -- Full output content
    execution_time_ms INTEGER,
    success INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Custom agents created at runtime
CREATE TABLE IF NOT EXISTS custom_agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    category TEXT DEFAULT 'Custom',
    model TEXT NOT NULL,
    system_prompt TEXT,
    tools TEXT, -- JSON array
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2048,
    logic TEXT DEFAULT 'local',
    color TEXT DEFAULT '#06b6d4',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TEAM & CONFIGURATION TABLES
-- ============================================================================

-- Saved team configurations
CREATE TABLE IF NOT EXISTS saved_teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    agent_ids TEXT NOT NULL, -- JSON array of agent IDs in order
    default_mission TEXT,
    use_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Application settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- KNOWLEDGE BASE TABLES
-- ============================================================================

-- Documents and knowledge entries
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text', -- text, code, json, markdown
    tags TEXT, -- JSON array
    source TEXT,
    embedding_id TEXT, -- For future vector search
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Academic publications per agent (populated from Semantic Scholar, OpenAlex, arXiv)
CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL DEFAULT '',
    abstract TEXT DEFAULT '',
    year INTEGER DEFAULT 0,
    venue TEXT DEFAULT '',
    doi TEXT,
    url TEXT DEFAULT '',
    citation_count INTEGER DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'semantic_scholar', -- semantic_scholar, openalex, arxiv
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, external_id)
);

-- Agent learning/feedback
CREATE TABLE IF NOT EXISTS agent_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    conversation_id TEXT,
    feedback_type TEXT NOT NULL, -- 'positive', 'negative', 'correction'
    original_response TEXT,
    corrected_response TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_collective_category ON collective_memory(category);
CREATE INDEX IF NOT EXISTS idx_collective_source ON collective_memory(source_agent);
CREATE INDEX IF NOT EXISTS idx_simulated_type ON simulated_memory(simulation_type);
CREATE INDEX IF NOT EXISTS idx_theoretical_type ON theoretical_memory(concept_type);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_type ON workflow_outputs(type);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge_base(tags);
CREATE INDEX IF NOT EXISTS idx_pub_agent ON publications(agent_id);
CREATE INDEX IF NOT EXISTS idx_pub_source ON publications(source);
CREATE INDEX IF NOT EXISTS idx_pub_year ON publications(year);

-- ============================================================================
-- DEFAULT SETTINGS
-- ============================================================================

INSERT OR IGNORE INTO settings (key, value) VALUES ('db_version', '1.0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('verbose_mode', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('default_model', 'AgentricAIcody');
INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_save_conversations', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('memory_retention_days', '90');
