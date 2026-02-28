import { useState } from 'react';
import {
  Play, Plus, Trash2, ChevronDown, ChevronRight,
  Loader2, CheckCircle, XCircle, Circle,
  GitBranch, Workflow, Zap, Clock, RotateCcw
} from 'lucide-react';
import type { Agent, Workflow as WorkflowType, WorkflowStep } from '../types';
import { cn } from '../utils/cn';

interface WorkflowPanelProps {
  agents: Agent[];
  workflows: WorkflowType[];
  onCreateWorkflow: (name: string, steps: Omit<WorkflowStep, 'id' | 'status'>[]) => void;
  onRunWorkflow: (id: string) => void;
  onDeleteWorkflow: (id: string) => void;
  activeView: string;
}

export function WorkflowPanel({
  agents,
  workflows,
  onCreateWorkflow,
  onRunWorkflow,
  onDeleteWorkflow,
  activeView,
}: WorkflowPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [steps, setSteps] = useState<Array<{ agentId: string; instruction: string }>>([]);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  const addStep = () => {
    if (agents.length === 0) return;
    setSteps(prev => [...prev, { agentId: agents[0].id, instruction: '' }]);
  };

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const updateStep = (idx: number, field: 'agentId' | 'instruction', value: string) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleCreate = () => {
    if (!newName.trim() || steps.length === 0) return;
    onCreateWorkflow(
      newName.trim(),
      steps.map(s => ({ agentId: s.agentId, instruction: s.instruction }))
    );
    setNewName('');
    setSteps([]);
    setIsCreating(false);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Circle size={12} className="text-text-muted" />;
      case 'running': return <Loader2 size={12} className="text-cyan animate-spin" />;
      case 'completed': return <CheckCircle size={12} className="text-emerald-glow" />;
      case 'failed': return <XCircle size={12} className="text-red-glow" />;
      default: return <Circle size={12} className="text-text-muted" />;
    }
  };

  if (activeView !== 'workflows') return null;

  return (
    <div className="flex flex-col h-full bg-deep">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
        <div className="flex items-center gap-2">
          <Workflow size={14} className="text-violet" />
          <span className="text-xs font-bold tracking-wider text-text-primary" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            WORKFLOWS
          </span>
          <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded">
            {workflows.length}
          </span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-violet/20 text-violet border border-violet/30 hover:bg-violet/30 transition-colors"
        >
          <Plus size={11} />
          New Workflow
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Create Workflow Form */}
        {isCreating && (
          <div className="bg-surface border border-border-dim rounded-xl p-4 space-y-3 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <GitBranch size={14} className="text-cyan" />
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Workflow name..."
                className="flex-1 bg-transparent text-xs text-text-primary placeholder-text-muted focus:outline-none"
              />
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 bg-abyss rounded-lg p-2 border border-border-dim">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-raised flex items-center justify-center text-[9px] text-text-muted font-bold">
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && <div className="w-px h-4 bg-border-dim mt-1" />}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <select
                      value={step.agentId}
                      onChange={e => updateStep(i, 'agentId', e.target.value)}
                      className="w-full bg-surface border border-border-dim rounded px-2 py-1 text-[10px] text-text-primary focus:outline-none focus:border-cyan/30"
                    >
                      {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                      ))}
                    </select>
                    <input
                      value={step.instruction}
                      onChange={e => updateStep(i, 'instruction', e.target.value)}
                      placeholder="Step instruction..."
                      className="w-full bg-surface border border-border-dim rounded px-2 py-1 text-[10px] text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan/30"
                    />
                  </div>
                  <button
                    onClick={() => removeStep(i)}
                    className="p-1 rounded hover:bg-raised text-text-muted hover:text-red-glow"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addStep}
              disabled={agents.length === 0}
              className="w-full py-1.5 rounded-lg border border-dashed border-border-dim text-[10px] text-text-muted hover:text-cyan hover:border-cyan/30 transition-colors disabled:opacity-30"
            >
              + Add Step
            </button>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setIsCreating(false); setSteps([]); setNewName(''); }}
                className="px-3 py-1.5 rounded-lg text-[10px] text-text-secondary hover:bg-raised"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || steps.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-violet text-void hover:opacity-90 disabled:opacity-30"
              >
                <Zap size={10} />
                Create
              </button>
            </div>
          </div>
        )}

        {/* Workflow List */}
        {workflows.map(wf => (
          <div key={wf.id} className="bg-surface border border-border-dim rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedWorkflow(expandedWorkflow === wf.id ? null : wf.id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-raised/50 transition-colors"
            >
              {expandedWorkflow === wf.id
                ? <ChevronDown size={11} className="text-text-muted" />
                : <ChevronRight size={11} className="text-text-muted" />
              }
              <GitBranch size={12} className="text-violet" />
              <span className="text-xs font-medium text-text-primary flex-1 text-left">{wf.name}</span>
              <div className={cn(
                'px-1.5 py-0.5 rounded text-[9px] font-medium',
                wf.status === 'idle' && 'bg-surface text-text-muted',
                wf.status === 'running' && 'bg-cyan/20 text-cyan',
                wf.status === 'completed' && 'bg-emerald-glow/20 text-emerald-glow',
                wf.status === 'failed' && 'bg-red-glow/20 text-red-glow',
              )}>
                {wf.status}
              </div>
              <span className="text-[9px] text-text-muted">{wf.steps.length} steps</span>
            </button>

            {expandedWorkflow === wf.id && (
              <div className="px-3 pb-3 space-y-1.5 border-t border-border-dim pt-2">
                {wf.steps.map((step) => {
                  const agent = agents.find(a => a.id === step.agentId);
                  return (
                    <div key={step.id} className="flex items-center gap-2">
                      {getStepIcon(step.status)}
                      <div
                        className="w-3 h-3 rounded flex-shrink-0"
                        style={{ backgroundColor: agent?.color || '#555' }}
                      />
                      <span className="text-[10px] text-text-secondary flex-1 truncate">
                        <span className="text-text-primary font-medium">{agent?.name || 'Unknown'}</span>
                        {' → '}
                        {step.instruction || 'Execute'}
                      </span>
                      {step.duration && (
                        <span className="text-[9px] text-text-muted flex items-center gap-0.5">
                          <Clock size={8} />
                          {(step.duration / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="flex items-center gap-2 pt-2 border-t border-border-dim/50">
                  <button
                    onClick={() => onRunWorkflow(wf.id)}
                    disabled={wf.status === 'running'}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-emerald-glow/20 text-emerald-glow border border-emerald-glow/30 hover:bg-emerald-glow/30 disabled:opacity-30"
                  >
                    {wf.status === 'running' ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                    {wf.status === 'running' ? 'Running...' : 'Run'}
                  </button>
                  {wf.status === 'completed' || wf.status === 'failed' ? (
                    <button
                      onClick={() => onRunWorkflow(wf.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-text-muted hover:text-cyan border border-border-dim hover:border-cyan/30"
                    >
                      <RotateCcw size={10} />
                      Re-run
                    </button>
                  ) : null}
                  <div className="flex-1" />
                  <button
                    onClick={() => onDeleteWorkflow(wf.id)}
                    className="p-1 rounded hover:bg-raised text-text-muted hover:text-red-glow"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {workflows.length === 0 && !isCreating && (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Workflow size={28} className="mb-2 opacity-20" />
            <p className="text-xs">No workflows yet</p>
            <p className="text-[10px] mt-1">Create a workflow to chain agents together</p>
          </div>
        )}
      </div>
    </div>
  );
}
