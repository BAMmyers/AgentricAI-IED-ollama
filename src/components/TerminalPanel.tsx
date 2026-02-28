import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Maximize2, Minimize2,
  Trash2, TerminalSquare
} from 'lucide-react';
import type { TerminalLine } from '../types';
import { cn } from '../utils/cn';

interface TerminalPanelProps {
  lines: TerminalLine[];
  onCommand: (cmd: string) => void;
  onClear: () => void;
}

export function TerminalPanel({ lines, onCommand, onClear }: TerminalPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [height, setHeight] = useState(220);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory(prev => [...prev, input]);
    setHistoryIdx(-1);
    onCommand(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
      setHistoryIdx(newIdx);
      if (newIdx >= 0) setInput(history[history.length - 1 - newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = historyIdx > 0 ? historyIdx - 1 : -1;
      setHistoryIdx(newIdx);
      setInput(newIdx >= 0 ? history[history.length - 1 - newIdx] : '');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: height };
    const handleMouseMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const newH = dragRef.current.startH - (me.clientY - dragRef.current.startY);
      setHeight(Math.max(100, Math.min(600, newH)));
    };
    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={cn(
        'flex flex-col border-t border-border-dim bg-abyss transition-all',
        collapsed ? 'h-8' : ''
      )}
      style={collapsed ? undefined : { height }}
    >
      {/* Resize Handle */}
      {!collapsed && (
        <div
          className="h-1 cursor-ns-resize hover:bg-cyan/30 transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border-dim flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-text-primary uppercase"
            onClick={() => setCollapsed(!collapsed)}
          >
            <TerminalSquare size={12} className="text-cyan" />
            TERMINAL
            {collapsed ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-muted px-2 py-0.5 bg-surface rounded border border-border-dim">
              bash
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClear} className="p-1 rounded hover:bg-raised text-text-muted hover:text-text-secondary">
            <Trash2 size={11} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-raised text-text-muted hover:text-text-secondary"
          >
            {collapsed ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!collapsed && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed"
            onClick={() => inputRef.current?.focus()}
          >
            {lines.map(line => (
              <div key={line.id} className="flex gap-2">
                {line.type === 'input' && (
                  <span className="text-emerald-glow select-none">❯</span>
                )}
                {line.type === 'agent' && (
                  <span className="select-none" style={{ color: line.agentColor }}>
                    [{line.agentName}]
                  </span>
                )}
                {line.type === 'system' && (
                  <span className="text-cyan select-none">⚡</span>
                )}
                {line.type === 'error' && (
                  <span className="text-red-glow select-none">✗</span>
                )}
                <span className={cn(
                  line.type === 'input' && 'text-text-primary',
                  line.type === 'output' && 'text-text-secondary',
                  line.type === 'error' && 'text-red-glow',
                  line.type === 'system' && 'text-cyan',
                  line.type === 'agent' && 'text-text-primary',
                )}>
                  {line.content}
                </span>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 border-t border-border-dim/50">
            <span className="text-emerald-glow text-xs select-none">❯</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-[11px] text-text-primary placeholder-text-muted focus:outline-none font-mono"
              placeholder="Enter command..."
              spellCheck={false}
            />
          </form>
        </>
      )}
    </div>
  );
}
