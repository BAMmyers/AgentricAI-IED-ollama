import { useState, useRef, useEffect } from 'react';
import {
  X, Code, MessageSquare, Send, StopCircle, Loader2,
  Copy, Check, Maximize2, Minimize2
} from 'lucide-react';
import type { Agent, ChatMessage, FileNode } from '../types';
import { cn } from '../utils/cn';

interface Tab {
  id: string;
  type: 'file' | 'chat';
  label: string;
  filePath?: string;
  agentId?: string;
}

interface CodeWorkspaceProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  activeFile: FileNode | null;
  messages: ChatMessage[];
  onSendMessage: (agentId: string, message: string) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  streamingContent: string;
  onUpdateFileContent: (path: string, content: string) => void;
  files: Map<string, string>;
}

export function CodeWorkspace({
  agents,
  selectedAgent,
  activeFile,
  messages,
  onSendMessage,
  onStopGeneration,
  isGenerating,
  streamingContent,
  onUpdateFileContent,
  files,
}: CodeWorkspaceProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add file tab when file selected
  useEffect(() => {
    if (activeFile && activeFile.type === 'file') {
      setTabs(prev => {
        const existingTab = prev.find(t => t.filePath === activeFile.path);
        if (!existingTab) {
          const newTab: Tab = {
            id: `file_${activeFile.path}`,
            type: 'file',
            label: activeFile.name,
            filePath: activeFile.path,
          };
          setActiveTabId(newTab.id);
          return [...prev, newTab];
        }
        setActiveTabId(existingTab.id);
        return prev;
      });
    }
  }, [activeFile]);

  // Add chat tab for selected agent
  useEffect(() => {
    if (selectedAgent) {
      setTabs(prev => {
        const existingTab = prev.find(t => t.agentId === selectedAgent.id);
        if (!existingTab) {
          const newTab: Tab = {
            id: `chat_${selectedAgent.id}`,
            type: 'chat',
            label: `💬 ${selectedAgent.name}`,
            agentId: selectedAgent.id,
          };
          setActiveTabId(newTab.id);
          return [...prev, newTab];
        }
        setActiveTabId(existingTab.id);
        return prev;
      });
    }
  }, [selectedAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => {
      const next = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleSend = () => {
    if (!input.trim() || !activeTab?.agentId) return;
    onSendMessage(activeTab.agentId, input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const agentMessages = activeTab?.agentId
    ? messages.filter(m => m.agentId === activeTab.agentId)
    : [];

  const fileContent = activeTab?.filePath
    ? files.get(activeTab.filePath) || ''
    : '';

  const currentAgent = activeTab?.agentId
    ? agents.find(a => a.id === activeTab.agentId)
    : null;

  return (
    <div className="flex flex-col h-full bg-deep">
      {/* Tab Bar */}
      <div className="flex items-center bg-abyss border-b border-border-dim overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-[11px] border-r border-border-dim min-w-0 group transition-colors',
              activeTabId === tab.id
                ? 'bg-deep text-text-primary border-t-2 border-t-cyan'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface'
            )}
          >
            {tab.type === 'file' ? <Code size={11} /> : <MessageSquare size={11} />}
            <span className="truncate max-w-[120px]">{tab.label}</span>
            <button
              onClick={e => closeTab(tab.id, e)}
              className="ml-1 p-0.5 rounded hover:bg-raised opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </button>
        ))}
        <div className="flex-1" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {!activeTab ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-text-muted grid-bg">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan/10 to-violet/10 border border-cyan/20 flex items-center justify-center mb-4">
              <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-50">
                <defs>
                  <linearGradient id="wsg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#00f0ff'}}/>
                    <stop offset="100%" style={{stopColor:'#8b5cf6'}}/>
                  </linearGradient>
                </defs>
                <polygon points="256,140 345,190 345,322 256,372 167,322 167,190" fill="none" stroke="url(#wsg)" strokeWidth="14"/>
                <polygon points="256,195 310,290 202,290" fill="none" stroke="url(#wsg)" strokeWidth="11"/>
                <circle cx="256" cy="258" r="22" fill="url(#wsg)" opacity="0.9"/>
                <circle cx="256" cy="258" r="10" fill="#0a0a1a"/>
                <circle cx="256" cy="258" r="5" fill="#00f0ff"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-text-secondary mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              AGENTR<span className="text-cyan">IC</span><span className="text-violet">AI</span> WORKSPACE
            </p>
            <p className="text-[11px] text-text-muted text-center max-w-xs">
              Select an agent to chat or open a file from the explorer. All inference runs locally via Ollama.
            </p>
            <div className="flex gap-4 mt-6 text-[10px] text-text-muted">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-lg border border-border-dim">
                <kbd className="px-1.5 py-0.5 bg-raised rounded text-[9px] font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-raised rounded text-[9px] font-mono">N</kbd>
                <span className="ml-1">New Agent</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-lg border border-border-dim">
                <kbd className="px-1.5 py-0.5 bg-raised rounded text-[9px] font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-raised rounded text-[9px] font-mono">P</kbd>
                <span className="ml-1">Quick Open</span>
              </div>
            </div>
          </div>
        ) : activeTab.type === 'chat' ? (
          /* Chat View */
          <div className="flex flex-col h-full">
            {/* Agent Header Bar */}
            {currentAgent && (
              <div className="flex items-center gap-3 px-4 py-2 bg-surface/50 border-b border-border-dim">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-void text-[10px] font-bold"
                  style={{ backgroundColor: currentAgent.color }}
                >
                  {currentAgent.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-text-primary">{currentAgent.name}</span>
                  <span className="text-[10px] text-text-muted ml-2 capitalize">
                    {currentAgent.role}
                  </span>
                  <span className="text-[9px] text-cyan-dim font-mono ml-1.5 bg-surface px-1.5 py-0.5 rounded border border-border-dim">
                    {currentAgent.model}
                  </span>
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full',
                  currentAgent.status === 'running' ? 'bg-emerald-glow/10 text-emerald-glow' : 'bg-surface text-text-muted'
                )}>
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    currentAgent.status === 'running' ? 'bg-emerald-glow animate-pulse' : 'bg-text-muted'
                  )} />
                  {currentAgent.status}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {agentMessages.length === 0 && !streamingContent && (
                <div className="flex flex-col items-center justify-center h-full text-text-muted">
                  <MessageSquare size={24} className="mb-2 opacity-30" />
                  <p className="text-xs">Start a conversation with {currentAgent?.name}</p>
                  <p className="text-[10px] mt-1">Messages are processed locally via Ollama</p>
                </div>
              )}
              {agentMessages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'group animate-fade-in-up',
                    msg.role === 'user' ? 'flex justify-end' : ''
                  )}
                >
                  <div className={cn(
                    'max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed relative',
                    msg.role === 'user'
                      ? 'bg-cyan/15 border border-cyan/20 text-text-primary'
                      : 'bg-surface border border-border-dim text-text-primary'
                  )}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center text-void text-[8px] font-bold"
                          style={{ backgroundColor: currentAgent?.color }}
                        >
                          {msg.agentName[0]}
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: currentAgent?.color }}>
                          {msg.agentName}
                        </span>
                        <span className="text-[9px] text-text-muted">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-mono text-[11px]">{msg.content}</div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-raised transition-all"
                      >
                        {copied ? <Check size={11} className="text-emerald-glow" /> : <Copy size={11} className="text-text-muted" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {streamingContent && activeTab.agentId && (
                <div className="animate-fade-in-up">
                  <div className="max-w-[85%] rounded-xl px-3.5 py-2.5 bg-surface border border-border-dim">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center text-void text-[8px] font-bold"
                        style={{ backgroundColor: currentAgent?.color }}
                      >
                        {currentAgent?.name[0]}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: currentAgent?.color }}>
                        {currentAgent?.name}
                      </span>
                      <Loader2 size={10} className="animate-spin text-cyan" />
                    </div>
                    <div className="whitespace-pre-wrap font-mono text-[11px] text-text-primary">
                      {streamingContent}
                      <span className="inline-block w-1.5 h-3.5 bg-cyan animate-pulse ml-0.5" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border-dim p-3">
              <div className="flex items-end gap-2 bg-surface rounded-xl border border-border-dim focus-within:border-cyan/30 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${currentAgent?.name || 'agent'}... (Shift+Enter for new line)`}
                  rows={1}
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none resize-none max-h-32"
                  style={{ minHeight: '36px' }}
                />
                <div className="flex items-center gap-1 pr-2 pb-2">
                  {isGenerating ? (
                    <button
                      onClick={onStopGeneration}
                      className="p-1.5 rounded-lg bg-red-glow/20 text-red-glow hover:bg-red-glow/30 transition-colors"
                    >
                      <StopCircle size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className={cn(
                        'p-1.5 rounded-lg transition-all',
                        input.trim()
                          ? 'bg-cyan/20 text-cyan hover:bg-cyan/30'
                          : 'text-text-muted cursor-not-allowed'
                      )}
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* File Editor View */
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-1.5 bg-surface/30 border-b border-border-dim">
              <span className="text-[10px] text-text-muted font-mono">{activeTab.filePath}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1 rounded hover:bg-raised text-text-muted"
                >
                  {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto code-editor">
              <div className="flex min-h-full">
                {/* Line Numbers */}
                <div className="flex-shrink-0 py-3 px-2 text-right select-none bg-abyss/50 border-r border-border-dim">
                  {fileContent.split('\n').map((_, i) => (
                    <div key={i} className="text-[11px] leading-[1.6] text-text-muted/40 font-mono px-1">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code Content */}
                <textarea
                  value={fileContent}
                  onChange={e => {
                    if (activeTab.filePath) {
                      onUpdateFileContent(activeTab.filePath, e.target.value);
                    }
                  }}
                  spellCheck={false}
                  className="flex-1 bg-transparent py-3 px-4 text-text-primary focus:outline-none resize-none font-mono text-[12px] leading-[1.6]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
