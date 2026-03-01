// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW WINDOW — Live Output Preview for Generated Applications/Games
// Opens as a separate window with loading animation, then renders output
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import {
  X, Maximize2, Minimize2, RefreshCw, ExternalLink, Download,
  Play, Code2, Eye
} from 'lucide-react';
import { cn } from '../utils/cn';

interface PreviewWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  htmlContent?: string;
  title?: string;
  agentThinking?: {
    agentName: string;
    content: string;
  };
}

// AgentricAI Logo for loading screen
function AgentricLogo({ size = 60 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <defs>
        <linearGradient id="previewLg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#00f0ff'}}/>
          <stop offset="100%" style={{stopColor:'#8b5cf6'}}/>
        </linearGradient>
      </defs>
      <polygon points="256,140 345,190 345,322 256,372 167,322 167,190" fill="none" stroke="url(#previewLg)" strokeWidth="14"/>
      <polygon points="256,195 310,290 202,290" fill="none" stroke="url(#previewLg)" strokeWidth="11"/>
      <circle cx="256" cy="258" r="22" fill="url(#previewLg)" opacity="0.9"/>
      <circle cx="256" cy="258" r="10" fill="#0a0a1a"/>
      <circle cx="256" cy="258" r="5" fill="#00f0ff"/>
    </svg>
  );
}

export function PreviewWindow({
  isOpen,
  onClose,
  isLoading,
  loadingMessage,
  loadingProgress,
  htmlContent,
  title = 'AgentricAI Preview',
  agentThinking,
}: PreviewWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inject HTML content into iframe
  useEffect(() => {
    if (iframeRef.current && htmlContent && !isLoading) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent, isLoading]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  };

  const handleOpenExternal = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Window Container */}
      <div
        className={cn(
          'flex flex-col bg-abyss border border-cyan/30 rounded-lg shadow-2xl overflow-hidden transition-all duration-300',
          isMaximized ? 'w-full h-full rounded-none' : 'w-[900px] h-[700px] max-w-[95vw] max-h-[90vh]'
        )}
        style={{
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.2), 0 0 120px rgba(139, 92, 246, 0.1)',
        }}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-void border-b border-border-dim">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
              />
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors"
              />
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
              />
            </div>
            
            {/* Title */}
            <div className="flex items-center gap-2">
              <AgentricLogo size={18} />
              <span className="text-sm font-medium text-text-secondary">{title}</span>
              {isLoading && (
                <span className="text-xs text-cyan animate-pulse">• Building...</span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCode(!showCode)}
              className={cn(
                'p-1.5 rounded transition-colors',
                showCode ? 'bg-cyan/20 text-cyan' : 'text-text-muted hover:text-text-secondary'
              )}
              title="View Source"
            >
              <Code2 size={14} />
            </button>
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded text-text-muted hover:text-text-secondary transition-colors"
              title="Refresh"
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleOpenExternal}
              className="p-1.5 rounded text-text-muted hover:text-text-secondary transition-colors"
              title="Open in New Window"
              disabled={!htmlContent}
            >
              <ExternalLink size={14} />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded text-text-muted hover:text-text-secondary transition-colors"
              title="Download HTML"
              disabled={!htmlContent}
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded text-text-muted hover:text-text-secondary transition-colors"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-text-muted hover:text-red-400 transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading ? (
            // Loading Screen
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-void">
              {/* Animated Logo */}
              <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping opacity-20">
                  <AgentricLogo size={80} />
                </div>
                <div className="animate-pulse">
                  <AgentricLogo size={80} />
                </div>
                
                {/* Rotating ring */}
                <svg
                  className="absolute -inset-4 animate-spin"
                  style={{ animationDuration: '3s' }}
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#previewLg)"
                    strokeWidth="2"
                    strokeDasharray="70 200"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Progress Bar */}
              <div className="w-64 h-1 bg-surface rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-cyan to-violet transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              {/* Loading Message */}
              <p className="text-text-secondary text-sm mb-2">{loadingMessage}</p>
              <p className="text-text-muted text-xs">{loadingProgress}% complete</p>

              {/* Agent Thinking Output */}
              {agentThinking && (
                <div className="mt-8 w-full max-w-2xl px-8">
                  <div className="bg-surface/50 border border-border-dim rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                      <span className="text-xs font-medium text-cyan">{agentThinking.agentName}</span>
                      <span className="text-xs text-text-muted">thinking...</span>
                    </div>
                    <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap">
                      {agentThinking.content.slice(-500)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : showCode ? (
            // Code View
            <div className="absolute inset-0 overflow-auto bg-surface p-4">
              <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap">
                {htmlContent || '// No content generated'}
              </pre>
            </div>
          ) : (
            // Preview iframe
            <iframe
              ref={iframeRef}
              className="w-full h-full bg-white"
              title={title}
              sandbox="allow-scripts allow-same-origin"
            />
          )}

          {/* Play/Pause overlay for games */}
          {!isLoading && isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <button
                onClick={() => setIsPaused(false)}
                className="flex items-center gap-2 px-6 py-3 bg-cyan text-void rounded-lg font-medium hover:bg-cyan/90 transition-colors"
              >
                <Play size={20} />
                Resume
              </button>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-void border-t border-border-dim text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye size={10} />
              Preview Mode
            </span>
            {htmlContent && (
              <span>{(htmlContent.length / 1024).toFixed(1)} KB</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && htmlContent && (
              <span className="text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewWindow;
