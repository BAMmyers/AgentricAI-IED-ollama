import { useState } from 'react';
import {
  Users, Trash2, ChevronUp, ChevronDown,
  Zap, Clock, CheckCircle, XCircle, Loader2,
  GripVertical, Target, X, AlertTriangle,
  Rocket
} from 'lucide-react';
import type { Agent } from '../types';
import { cn } from '../utils/cn';
import { CATEGORY_COLORS } from '../data/agentRoster';

export interface TeamExecutionResult {
  agentId: string;
  agentName: string;
  model: string;
  status: 'pending' | 'running' | 'success' | 'error';
  response?: string;
  duration?: number;
  error?: string;
}

interface TeamPanelProps {
  agents: Agent[];
  selectedTeam: string[];
  onToggleAgent: (id: string) => void;
  onReorderTeam: (team: string[]) => void;
  onClearTeam: () => void;
  onExecuteTeam: (mission: string) => Promise<void>;
  isExecuting: boolean;
  executionResults: TeamExecutionResult[];
}

export function TeamPanel({
  agents,
  selectedTeam,
  onToggleAgent,
  onReorderTeam,
  onClearTeam,
  onExecuteTeam,
  isExecuting,
  executionResults,
}: TeamPanelProps) {
  const [mission, setMission] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const teamAgents = selectedTeam
    .map(id => agents.find(a => a.id === id))
    .filter((a): a is Agent => !!a);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTeam = [...selectedTeam];
    const [removed] = newTeam.splice(draggedIndex, 1);
    newTeam.splice(index, 0, removed);
    onReorderTeam(newTeam);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveAgent = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedTeam.length) return;

    const newTeam = [...selectedTeam];
    [newTeam[index], newTeam[newIndex]] = [newTeam[newIndex], newTeam[index]];
    onReorderTeam(newTeam);
  };

  const handleExecute = () => {
    if (!mission.trim() || selectedTeam.length === 0 || isExecuting) return;
    onExecuteTeam(mission.trim());
  };

  const getResultForAgent = (agentId: string) => {
    return executionResults.find(r => r.agentId === agentId);
  };

  const completedCount = executionResults.filter(r => r.status === 'success').length;
  const failedCount = executionResults.filter(r => r.status === 'error').length;
  const totalDuration = executionResults.reduce((sum, r) => sum + (r.duration || 0), 0);

  return (
    <div className="flex flex-col h-full bg-abyss border-l border-border-dim">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-dim bg-void/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-magenta/20 to-violet/20 border border-magenta/30 flex items-center justify-center">
            <Users size={14} className="text-magenta" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold tracking-wide text-text-primary" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              TEAM BUILDER
            </h2>
            <p className="text-[8px] text-text-muted">Multi-Agent Execution</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {selectedTeam.length > 0 && (
            <button
              onClick={onClearTeam}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-glow hover:bg-red-glow/10 transition-colors"
              title="Clear team"
            >
              <Trash2 size={12} />
            </button>
          )}
          <span className="px-2 py-0.5 rounded-full bg-magenta/15 text-magenta text-[10px] font-bold border border-magenta/25">
            {selectedTeam.length} selected
          </span>
        </div>
      </div>

      {/* Team Queue */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {teamAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-surface/50 border border-border-dim flex items-center justify-center mb-3">
              <Target size={20} className="text-text-muted/50" />
            </div>
            <p className="text-[11px] text-text-muted mb-1">No agents selected</p>
            <p className="text-[9px] text-text-muted/70">
              Toggle agents in the roster to add them to your team.
              They will execute in order from top to bottom.
            </p>
          </div>
        ) : (
          <>
            {/* Execution Order Label */}
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-text-muted">
              <Zap size={9} />
              <span>Execution Order (drag to reorder)</span>
            </div>

            {/* Team Members */}
            {teamAgents.map((agent, index) => {
              const result = getResultForAgent(agent.id);
              const categoryColor = CATEGORY_COLORS[agent.category] || '#00f0ff';

              return (
                <div
                  key={agent.id}
                  draggable={!isExecuting}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-move',
                    draggedIndex === index
                      ? 'border-magenta/50 bg-magenta/10 scale-[1.02]'
                      : 'border-border-dim bg-surface/40 hover:bg-surface/60',
                    result?.status === 'running' && 'border-amber-glow/50 bg-amber-glow/5',
                    result?.status === 'success' && 'border-emerald-glow/50 bg-emerald-glow/5',
                    result?.status === 'error' && 'border-red-glow/50 bg-red-glow/5'
                  )}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0 text-text-muted/50">
                    <GripVertical size={12} />
                  </div>

                  {/* Order Number */}
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ backgroundColor: categoryColor, color: '#0a0a1a' }}
                  >
                    {index + 1}
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-text-primary truncate">{agent.name}</p>
                    <p className="text-[8px] text-text-muted truncate">{agent.model}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {result?.status === 'pending' && (
                      <Clock size={11} className="text-text-muted" />
                    )}
                    {result?.status === 'running' && (
                      <Loader2 size={11} className="text-amber-glow animate-spin" />
                    )}
                    {result?.status === 'success' && (
                      <CheckCircle size={11} className="text-emerald-glow" />
                    )}
                    {result?.status === 'error' && (
                      <XCircle size={11} className="text-red-glow" />
                    )}
                    {result?.duration && (
                      <span className="text-[8px] text-text-muted font-mono">
                        {(result.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>

                  {/* Move Buttons */}
                  {!isExecuting && (
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveAgent(index, 'up')}
                        disabled={index === 0}
                        className="p-0.5 rounded hover:bg-highlight text-text-muted hover:text-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={10} />
                      </button>
                      <button
                        onClick={() => moveAgent(index, 'down')}
                        disabled={index === teamAgents.length - 1}
                        className="p-0.5 rounded hover:bg-highlight text-text-muted hover:text-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown size={10} />
                      </button>
                    </div>
                  )}

                  {/* Remove Button */}
                  {!isExecuting && (
                    <button
                      onClick={() => onToggleAgent(agent.id)}
                      className="p-1 rounded hover:bg-red-glow/10 text-text-muted hover:text-red-glow opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Execution Results Summary */}
            {executionResults.length > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-surface/30 border border-border-dim">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-text-muted">Execution Summary</span>
                  <div className="flex items-center gap-2">
                    {completedCount > 0 && (
                      <span className="text-emerald-glow">✓ {completedCount}</span>
                    )}
                    {failedCount > 0 && (
                      <span className="text-red-glow">✗ {failedCount}</span>
                    )}
                    <span className="text-text-muted font-mono">{(totalDuration / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mission Input */}
      <div className="border-t border-border-dim p-3 bg-void/30">
        <div className="flex items-center gap-2 mb-2">
          <Target size={11} className="text-magenta" />
          <span className="text-[10px] font-semibold text-text-secondary">Mission Objective</span>
        </div>
        <textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="Describe the task for your agent team..."
          disabled={isExecuting}
          className={cn(
            'w-full h-20 bg-surface/60 border border-border-dim rounded-lg px-3 py-2',
            'text-[11px] text-text-primary placeholder-text-muted resize-none',
            'focus:border-magenta/40 focus:outline-none transition-colors',
            isExecuting && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={!mission.trim() || selectedTeam.length === 0 || isExecuting}
          className={cn(
            'w-full flex items-center justify-center gap-2 mt-2 py-2.5 rounded-lg font-semibold text-[11px] transition-all',
            !mission.trim() || selectedTeam.length === 0 || isExecuting
              ? 'bg-surface text-text-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-magenta/80 to-violet/80 text-white hover:from-magenta hover:to-violet shadow-lg shadow-magenta/20'
          )}
        >
          {isExecuting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Executing Team...
            </>
          ) : (
            <>
              <Rocket size={14} />
              Execute Team ({selectedTeam.length} agents)
            </>
          )}
        </button>

        {/* Warning */}
        {selectedTeam.length > 0 && !isExecuting && (
          <div className="flex items-start gap-1.5 mt-2 text-[8px] text-text-muted">
            <AlertTriangle size={9} className="flex-shrink-0 mt-0.5 text-amber-glow" />
            <span>
              Agents will execute sequentially. Each agent receives the mission objective
              plus all previous agent responses for context.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
