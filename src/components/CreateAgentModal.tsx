import { useState } from 'react';
import { X, Bot, Sparkles } from 'lucide-react';
import type { Agent, OllamaModel } from '../types';
import { cn } from '../utils/cn';
import { DEFAULT_MODEL, KNOWN_LOCAL_MODELS } from '../hooks/useOllama';
import { CATEGORY_ORDER } from '../data/agentRoster';

const AGENT_COLORS = [
  '#00f0ff', '#ff00ff', '#8b5cf6', '#00ff88',
  '#ffaa00', '#ff3355', '#00aaff', '#ff6600',
];

const ALL_CATEGORIES = [...CATEGORY_ORDER, 'Custom'];

const AGENT_ROLES = [
  { value: 'coder', label: 'Coder', desc: 'Writes and modifies code' },
  { value: 'researcher', label: 'Researcher', desc: 'Gathers information and analyzes' },
  { value: 'writer', label: 'Writer', desc: 'Creates documentation and content' },
  { value: 'executor', label: 'Executor', desc: 'Runs commands and scripts' },
  { value: 'reviewer', label: 'Reviewer', desc: 'Reviews and critiques work' },
  { value: 'architect', label: 'Architect', desc: 'Designs system architecture' },
  { value: 'debugger', label: 'Debugger', desc: 'Finds and fixes bugs' },
];

const TOOLS = [
  'file_read', 'file_write', 'file_create', 'terminal_exec',
  'web_search', 'code_analysis', 'test_runner', 'git_ops',
  'browser_action', 'mcp_client',
];

const DEFAULT_PROMPTS: Record<string, string> = {
  coder: 'You are AgentricAIcody, an expert software engineer. Write clean, efficient, well-documented code. Follow best practices and design patterns. You operate locally via Ollama.',
  researcher: 'You are a thorough researcher running locally. Analyze topics deeply, provide comprehensive findings with sources and evidence.',
  writer: 'You are a skilled technical writer. Create clear, concise documentation and content that is easy to understand.',
  executor: 'You are a command execution specialist. Run commands carefully, handle errors gracefully, and report results clearly.',
  reviewer: 'You are a meticulous code reviewer. Check for bugs, security issues, performance problems, and suggest improvements.',
  architect: 'You are a system architect. Design scalable, maintainable architectures with clear component boundaries and data flow diagrams.',
  debugger: 'You are a debugging expert. Systematically identify root causes, trace execution paths, and propose targeted fixes.',
};

const ROLE_DEFAULT_TOOLS: Record<string, string[]> = {
  coder: ['file_read', 'file_write', 'file_create', 'terminal_exec', 'git_ops'],
  researcher: ['web_search', 'file_read', 'browser_action'],
  writer: ['file_read', 'file_write', 'file_create'],
  executor: ['terminal_exec', 'file_read', 'git_ops', 'mcp_client'],
  reviewer: ['file_read', 'code_analysis', 'test_runner'],
  architect: ['file_read', 'code_analysis', 'file_write'],
  debugger: ['file_read', 'test_runner', 'terminal_exec', 'code_analysis'],
};

const ROLE_DEFAULT_MODELS: Record<string, string> = {
  coder: 'AgentricAIcody',
  researcher: 'dolphin-llama3',
  writer: 'dolphin-llama3',
  executor: 'AgentricAIcody',
  reviewer: 'qwen2.5-coder',
  architect: 'dolphin-llama3',
  debugger: 'qwen2.5-coder',
};

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (agent: Agent) => void;
  models: OllamaModel[];
}

export function CreateAgentModal({ open, onClose, onCreate, models }: CreateAgentModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('coder');
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [color, setColor] = useState(AGENT_COLORS[0]);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPTS.coder);
  const [selectedTools, setSelectedTools] = useState<string[]>(ROLE_DEFAULT_TOOLS.coder);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [category, setCategory] = useState('Security');
  const [logic, setLogic] = useState<'local' | 'remote' | 'hybrid'>('local');

  if (!open) return null;

  // Merge live models with known models
  const liveNames = new Set(models.map(m => m.name));
  const allModels = [
    ...models,
    ...KNOWN_LOCAL_MODELS.filter(m => !liveNames.has(m.name)),
  ];

  // Separate library models from namespaced models
  const libraryModels = allModels.filter(m => !m.name.includes('/'));
  const namespacedModels = allModels.filter(m => m.name.includes('/'));

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setSystemPrompt(DEFAULT_PROMPTS[newRole] || '');
    setSelectedTools(ROLE_DEFAULT_TOOLS[newRole] || ['file_read']);
    setModel(ROLE_DEFAULT_MODELS[newRole] || DEFAULT_MODEL);
  };

  const toggleTool = (tool: string) => {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const agent: Agent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      role,
      model,
      systemPrompt,
      status: 'idle',
      color,
      icon: role,
      tools: selectedTools,
      temperature,
      maxTokens,
      category,
      logic,
    };
    onCreate(agent);
    setName('');
    setRole('coder');
    setModel(DEFAULT_MODEL);
    setSystemPrompt(DEFAULT_PROMPTS.coder);
    setSelectedTools(ROLE_DEFAULT_TOOLS.coder);
    setCategory('Security');
    setLogic('local');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm">
      <div className="bg-deep border border-border-dim rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-dim">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-violet flex items-center justify-center">
              <Sparkles size={16} className="text-void" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                CREATE AGENT
              </h2>
              <p className="text-[10px] text-text-muted">Configure a new AI agent · Powered by Ollama</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-raised text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name + Color */}
          <div>
            <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 block">
              Agent Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. CodeWeaver, DataMiner..."
                className="flex-1 bg-surface border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:border-cyan/50 focus:outline-none transition-colors"
              />
              <div className="flex gap-1">
                {AGENT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-7 h-7 rounded-md transition-all',
                      color === c ? 'ring-2 ring-white/50 scale-110' : 'hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 block">
              Role
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {AGENT_ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => handleRoleChange(r.value)}
                  className={cn(
                    'px-2 py-2 rounded-md text-[10px] font-medium transition-all border flex flex-col items-center gap-0.5',
                    role === r.value
                      ? 'bg-cyan/20 border-cyan/40 text-cyan'
                      : 'bg-surface border-border-dim text-text-secondary hover:border-border-glow/30'
                  )}
                >
                  <span className="font-semibold">{r.label}</span>
                  <span className="text-[8px] text-text-muted">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category + Logic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 block">
                Category Folder
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-surface border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary focus:border-cyan/50 focus:outline-none"
              >
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 block">
                Logic Mode
              </label>
              <div className="flex gap-1.5">
                {(['local', 'remote', 'hybrid'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLogic(l)}
                    className={cn(
                      'flex-1 px-2 py-2 rounded-md text-[10px] font-medium transition-all border text-center capitalize',
                      logic === l
                        ? 'bg-cyan/20 border-cyan/40 text-cyan'
                        : 'bg-surface border-border-dim text-text-secondary hover:border-border-glow/30'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 flex items-center gap-2">
              <span>Ollama Model</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan/10 text-cyan font-normal normal-case tracking-normal">
                default: {DEFAULT_MODEL}
              </span>
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-surface border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary focus:border-cyan/50 focus:outline-none"
            >
              <optgroup label="⚡ Library Models">
                {libraryModels.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}{m.size > 0 ? ` (${(m.size / 1e9).toFixed(1)}GB)` : ''}{m.name === DEFAULT_MODEL ? ' ★ DEFAULT' : ''}
                  </option>
                ))}
              </optgroup>
              {namespacedModels.length > 0 && (
                <optgroup label="🔧 Custom / Namespaced">
                  {namespacedModels.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name}{m.size > 0 ? ` (${(m.size / 1e9).toFixed(1)}GB)` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Tools */}
          <div>
            <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 block">
              Tools & Capabilities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TOOLS.map(tool => (
                <button
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-md text-[10px] font-mono transition-all border',
                    selectedTools.includes(tool)
                      ? 'bg-violet/20 border-violet/40 text-violet'
                      : 'bg-surface border-border-dim text-text-muted hover:text-text-secondary'
                  )}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature + Tokens */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 flex items-center justify-between">
                <span>Temperature</span>
                <span className="text-cyan">{temperature}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 flex items-center justify-between">
                <span>Max Tokens</span>
                <span className="text-cyan">{maxTokens}</span>
              </label>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-cyan"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1.5 block">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full bg-surface border border-border-dim rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:border-cyan/50 focus:outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border-dim">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface border border-border-dim"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-medium transition-all',
              'bg-gradient-to-r from-cyan to-violet text-void',
              'hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Bot size={13} />
              Deploy Agent
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
