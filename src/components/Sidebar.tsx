import { useState, useMemo } from 'react';
import {
  Plus, Zap, Activity, Wifi, WifiOff,
  ChevronRight, ChevronDown, Play, Pause, Trash2,
  Shield, ShieldAlert, FileWarning, ScanEye,
  Landmark, GitMerge, BookOpen, CheckCircle,
  FolderOpen, Folder, Bot, Database, Search,
  Eye, EyeOff, Brain, Cpu, Wrench, Monitor,
  PenTool, LifeBuoy, Atom, GraduationCap, Orbit,
  Code, ChevronUp, ChevronsUpDown, Users, UserPlus, UserMinus,
} from 'lucide-react';
import type { Agent } from '../types';
import { cn } from '../utils/cn';
import { DEFAULT_MODEL } from '../hooks/useOllama';
import { CATEGORY_COLORS, getAgentsByCategory, CATEGORY_ORDER } from '../data/agentRoster';

// ═══════════════════════════════════════════════════
// Category → Icon mapping (React elements)
// ═══════════════════════════════════════════════════
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  'Consciousness':                       <Brain size={13} />,
  'Core \\ System':                      <Cpu size={13} />,
  'Tool-Enabled':                        <Wrench size={13} />,
  'System \\ OS':                        <Monitor size={13} />,
  'Data \\ Integration':                 <Database size={13} />,
  'Development \\ Code':                 <Code size={13} />,
  'Content \\ Language':                 <PenTool size={13} />,
  'Support':                             <LifeBuoy size={13} />,
  'Advanced Research \\ Theory':         <Atom size={13} />,
  'Academic \\ Research':                <GraduationCap size={13} />,
  'Quantum Studies':                     <Orbit size={13} />,
  'Security':                            <Shield size={13} />,
  'Security Enforcement':                <ShieldAlert size={13} />,
  'Security Reporting':                  <FileWarning size={13} />,
  'External Review \\ Impact Analysis':  <ScanEye size={13} />,
  'Governance':                          <Landmark size={13} />,
  'Correlation':                         <GitMerge size={13} />,
  'Playbook Management':                 <BookOpen size={13} />,
  'Validation':                          <CheckCircle size={13} />,
};

interface SidebarProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  onCreateAgent: () => void;
  onDeleteAgent: (id: string) => void;
  onRunAgent: (id: string) => void;
  isConnected: boolean;
  onCheckConnection: () => void;
  // Team selection
  selectedTeam: string[];
  onToggleTeamAgent: (id: string) => void;
  onClearTeam: () => void;
}

export function Sidebar({
  agents,
  selectedAgentId,
  onSelectAgent,
  onCreateAgent,
  onDeleteAgent,
  onRunAgent,
  isConnected,
  onCheckConnection,
  selectedTeam,
  onToggleTeamAgent,
  onClearTeam,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(['Consciousness', 'Core \\ System']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);

  const groupedAgents = useMemo(() => getAgentsByCategory(agents), [agents]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedAgents;
    const q = searchQuery.toLowerCase();
    const result = new Map<string, Agent[]>();
    for (const [cat, catAgents] of groupedAgents) {
      const filtered = catAgents.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
      if (filtered.length > 0) result.set(cat, filtered);
    }
    return result;
  }, [groupedAgents, searchQuery]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
      setAllExpanded(false);
    } else {
      setExpandedCategories(new Set(CATEGORY_ORDER));
      setAllExpanded(true);
    }
  };

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'running').length;

  const orderedCategories = useMemo(() => {
    const known = CATEGORY_ORDER.filter(c => filteredGroups.has(c));
    const extra = [...filteredGroups.keys()].filter(c => !CATEGORY_ORDER.includes(c));
    return [...known, ...extra];
  }, [filteredGroups]);

  return (
    <div
      className={cn(
        'flex flex-col h-full border-r border-border-dim bg-abyss transition-all duration-300 relative',
        collapsed ? 'w-14' : 'w-80'
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2 p-2.5 border-b border-border-dim">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <defs>
                  <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#00f0ff'}}/>
                    <stop offset="100%" style={{stopColor:'#8b5cf6'}}/>
                  </linearGradient>
                </defs>
                <polygon points="256,160 330,198 330,314 256,352 182,314 182,198" fill="none" stroke="url(#sg)" strokeWidth="12"/>
                <polygon points="256,200 300,280 212,280" fill="none" stroke="url(#sg)" strokeWidth="10"/>
                <circle cx="256" cy="255" r="20" fill="url(#sg)" opacity="0.9"/>
                <circle cx="256" cy="255" r="9" fill="#0a0a1a"/>
                <circle cx="256" cy="255" r="4" fill="#00f0ff"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-[10px] font-bold tracking-wider text-text-primary truncate" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                AGENTR<span className="text-cyan">IC</span><span className="text-violet">AI</span>
              </h1>
              <p className="text-[8px] text-text-muted tracking-widest">AGENT COMMAND CENTER</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-raised text-text-secondary hover:text-cyan transition-colors flex-shrink-0"
        >
          <ChevronRight size={13} className={cn('transition-transform', collapsed ? '' : 'rotate-180')} />
        </button>
      </div>

      {/* ── Connection Status ── */}
      <button
        onClick={onCheckConnection}
        className={cn(
          'flex items-center gap-2 mx-2 mt-2 px-2.5 py-1.5 rounded-lg text-[10px] transition-all',
          isConnected
            ? 'bg-emerald-glow/10 text-emerald-glow border border-emerald-glow/20'
            : 'bg-red-glow/10 text-red-glow border border-red-glow/20 animate-pulse'
        )}
      >
        {isConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
        {!collapsed && (
          <span>{isConnected ? 'Ollama Connected' : 'Ollama Offline'}</span>
        )}
      </button>

      {/* ── Default Model Badge ── */}
      {!collapsed && (
        <div className="mx-2 mt-1.5 px-2.5 py-1 rounded-lg bg-surface/50 border border-border-dim flex items-center gap-1.5">
          <Database size={9} className="text-cyan" />
          <span className="text-[8px] text-text-muted">Default:</span>
          <span className="text-[8px] text-cyan font-mono font-medium">{DEFAULT_MODEL}</span>
        </div>
      )}

      {/* ── Create Agent Button ── */}
      <div className="px-2 mt-2.5">
        <button
          onClick={onCreateAgent}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-[10px]',
            'bg-gradient-to-r from-cyan/20 to-magenta/20 border border-cyan/30',
            'hover:from-cyan/30 hover:to-magenta/30 hover:border-cyan/50',
            'text-cyan transition-all duration-200 group'
          )}
        >
          <Plus size={13} className="group-hover:rotate-90 transition-transform duration-200" />
          {!collapsed && <span>Create Agent</span>}
        </button>
      </div>

      {/* ── Search ── */}
      {!collapsed && (
        <div className="px-2 mt-2">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 101 agents..."
              className="w-full bg-surface/60 border border-border-dim rounded-lg pl-7 pr-3 py-1.5 text-[10px] text-text-primary placeholder-text-muted focus:border-cyan/40 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* ── Team Selection Status ── */}
      {!collapsed && selectedTeam.length > 0 && (
        <div className="px-2 mt-2">
          <div className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-magenta/10 border border-magenta/30">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-magenta" />
              <span className="text-[10px] font-semibold text-magenta">Team Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-full bg-magenta/20 text-magenta text-[8px] font-bold">
                {selectedTeam.length} agents
              </span>
              <button
                onClick={onClearTeam}
                className="p-1 rounded hover:bg-magenta/20 text-magenta/70 hover:text-magenta transition-colors"
                title="Clear team selection"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Agent Roster Header ── */}
      {!collapsed && (
        <div className="flex items-center justify-between px-3 mt-3 mb-1">
          <div className="flex items-center gap-1.5">
            <Bot size={10} className="text-text-muted" />
            <span className="text-[9px] font-semibold tracking-widest text-text-muted uppercase">
              Agent Roster
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-surface text-cyan font-mono font-bold border border-cyan/20">
              {totalAgents}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleAll}
              className="p-0.5 rounded hover:bg-surface text-text-muted hover:text-cyan transition-colors"
              title={allExpanded ? 'Collapse all' : 'Expand all'}
            >
              {allExpanded ? <ChevronsUpDown size={10} /> : <ChevronUp size={10} />}
            </button>
            <button
              onClick={() => setShowAllDetails(!showAllDetails)}
              className="p-0.5 rounded hover:bg-surface text-text-muted hover:text-cyan transition-colors"
              title={showAllDetails ? 'Compact view' : 'Detailed view'}
            >
              {showAllDetails ? <Eye size={10} /> : <EyeOff size={10} />}
            </button>
          </div>
        </div>
      )}

      {/* ── Category Folders ── */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5 scrollbar-thin">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 pt-1">
            {orderedCategories.map(cat => {
              const catAgents = filteredGroups.get(cat) || [];
              const color = CATEGORY_COLORS[cat] || '#00f0ff';
              const hasActive = catAgents.some(a => a.status === 'running');
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCollapsed(false);
                    setExpandedCategories(prev => new Set([...prev, cat]));
                  }}
                  className="relative p-1.5 rounded-lg hover:bg-surface transition-colors group"
                  title={`${cat} (${catAgents.length})`}
                >
                  <div style={{ color }}>{CATEGORY_ICON_MAP[cat] || <Folder size={13} />}</div>
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-surface border border-border-dim text-[7px] font-bold flex items-center justify-center text-text-muted">
                    {catAgents.length}
                  </span>
                  {hasActive && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-glow animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          orderedCategories.map(cat => {
            const catAgents = filteredGroups.get(cat) || [];
            const isExpanded = expandedCategories.has(cat);
            const color = CATEGORY_COLORS[cat] || '#00f0ff';
            const activeCount = catAgents.filter(a => a.status === 'running').length;
            const icon = CATEGORY_ICON_MAP[cat] || <Folder size={13} />;

            return (
              <div key={cat} className="mb-0.5">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all group',
                    'hover:bg-surface/80',
                    isExpanded ? 'bg-surface/40' : ''
                  )}
                >
                  <span className="text-text-muted flex-shrink-0">
                    {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </span>

                  <span className="flex-shrink-0" style={{ color }}>
                    {isExpanded ? <FolderOpen size={13} /> : icon}
                  </span>

                  <span
                    className="flex-1 text-[10px] font-semibold tracking-wide truncate"
                    style={{ color: isExpanded ? color : 'var(--text-secondary, #8899aa)' }}
                  >
                    {cat}
                  </span>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {activeCount > 0 && (
                      <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-glow/15 text-emerald-glow text-[7px] font-bold">
                        <Zap size={7} />
                        {activeCount}
                      </span>
                    )}
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border"
                      style={{
                        backgroundColor: `${color}10`,
                        borderColor: `${color}30`,
                        color: color,
                      }}
                    >
                      {catAgents.length}
                    </span>
                  </div>
                </button>

                {/* Agent List */}
                {isExpanded && (
                  <div className="ml-3 pl-2 border-l space-y-px mt-0.5 mb-1" style={{ borderColor: `${color}25` }}>
                    {catAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        isSelected={selectedAgentId === agent.id}
                        showDetails={showAllDetails}
                        categoryColor={color}
                        onSelect={() => onSelectAgent(agent.id)}
                        onRun={() => onRunAgent(agent.id)}
                        onDelete={() => onDeleteAgent(agent.id)}
                        isInTeam={selectedTeam.includes(agent.id)}
                        teamOrder={selectedTeam.indexOf(agent.id) + 1}
                        onToggleTeam={() => onToggleTeamAgent(agent.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {filteredGroups.size === 0 && !collapsed && (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <Bot size={22} className="mb-2 opacity-30" />
            <p className="text-[9px] text-center">
              {searchQuery ? 'No agents match your search.' : 'No agents created yet.'}
              <br />
              {!searchQuery && 'Click "Create Agent" to begin.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Footer Status ── */}
      <div className="border-t border-border-dim px-2 py-1.5">
        <div className="flex items-center justify-center gap-2">
          {!collapsed ? (
            <>
              <Activity size={10} className="text-cyan" />
              <span className="text-[9px] text-text-muted">
                {activeAgents} active
              </span>
              <span className="text-border-dim text-[8px]">│</span>
              <Zap size={10} className="text-amber-glow" />
              <span className="text-[9px] text-text-muted">{totalAgents} agents</span>
              <span className="text-border-dim text-[8px]">│</span>
              <Folder size={10} className="text-violet" />
              <span className="text-[8px] text-text-muted font-mono">{orderedCategories.length} groups</span>
            </>
          ) : (
            <Bot size={13} className="text-text-muted" />
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Agent Card Component
// ══════════════════════════════════════════════════════
function AgentCard({
  agent,
  isSelected,
  showDetails,
  categoryColor,
  onSelect,
  onRun,
  onDelete,
  isInTeam,
  teamOrder,
  onToggleTeam,
}: {
  agent: Agent;
  isSelected: boolean;
  showDetails: boolean;
  categoryColor: string;
  onSelect: () => void;
  onRun: () => void;
  onDelete: () => void;
  isInTeam: boolean;
  teamOrder: number;
  onToggleTeam: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150',
        isSelected
          ? 'bg-raised border border-border-glow/40'
          : 'hover:bg-surface/60 border border-transparent',
        isInTeam && 'ring-1 ring-magenta/50 bg-magenta/5'
      )}
    >
      {/* Team Order Badge - shows when agent is in team */}
      {isInTeam && (
        <div 
          className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-magenta text-void text-[8px] font-bold flex items-center justify-center shadow-lg shadow-magenta/30 z-10"
          title={`Team position #${teamOrder}`}
        >
          {teamOrder}
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
        <div
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center text-void text-[10px] font-bold transition-all",
            isInTeam && "ring-2 ring-magenta ring-offset-1 ring-offset-void"
          )}
          style={{ backgroundColor: categoryColor }}
        >
          {agent.name.charAt(0)}
        </div>
        <div className={cn(
          'w-1.5 h-1.5 rounded-full',
          agent.status === 'idle' && 'bg-text-muted/50',
          agent.status === 'running' && 'bg-emerald-glow animate-pulse',
          agent.status === 'success' && 'bg-cyan',
          agent.status === 'error' && 'bg-red-glow',
        )} />
      </div>

      {/* Agent info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn(
            'text-[10px] font-semibold truncate leading-tight',
            isInTeam ? 'text-magenta' : 'text-text-primary'
          )}>
            {agent.name}
          </p>
          {isInTeam && (
            <span className="text-[7px] px-1 py-px rounded bg-magenta/20 text-magenta font-semibold uppercase tracking-wider">
              Team
            </span>
          )}
        </div>
        {showDetails && (
          <>
            <p className="text-[8px] text-text-muted leading-snug mt-0.5 line-clamp-2">{agent.role}</p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className="text-[7px] px-1 py-px rounded bg-surface font-mono text-cyan border border-border-dim truncate max-w-[90px]">
                {agent.model}
              </span>
              <span className="text-[7px] px-1 py-px rounded bg-surface font-mono text-text-muted border border-border-dim">
                {agent.logic}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons - visible on hover */}
      <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
        {/* Run/Pause Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRun(); }}
          className="p-1 rounded hover:bg-emerald-glow/20 text-emerald-glow transition-colors"
          title={agent.status === 'running' ? 'Pause agent' : 'Run agent'}
        >
          {agent.status === 'running' ? <Pause size={10} /> : <Play size={10} />}
        </button>
        
        {/* Select/Deselect for Team Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleTeam(); }}
          className={cn(
            "p-1 rounded transition-colors",
            isInTeam 
              ? "bg-magenta/20 text-magenta hover:bg-magenta/30" 
              : "hover:bg-magenta/20 text-text-muted hover:text-magenta"
          )}
          title={isInTeam ? 'Remove from team' : 'Add to team'}
        >
          {isInTeam ? <UserMinus size={10} /> : <UserPlus size={10} />}
        </button>
        
        {/* Delete Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-red-glow/20 text-red-glow transition-colors"
          title="Delete agent"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}
