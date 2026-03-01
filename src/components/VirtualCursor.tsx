// ═══════════════════════════════════════════════════════════════════════════
// VIRTUAL CURSOR — Animated cursor for TeamManager automation
// Shows cursor movements, clicks, and typing animations
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

interface VirtualCursorProps {
  x: number;
  y: number;
  isActive: boolean;
  isClicking?: boolean;
  isTyping?: boolean;
}

export function VirtualCursor({ x, y, isActive, isClicking, isTyping }: VirtualCursorProps) {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  // Create trailing effect
  useEffect(() => {
    if (isActive) {
      setTrail(prev => {
        const newTrail = [...prev, { x, y, id: Date.now() }].slice(-8);
        return newTrail;
      });
    }
  }, [x, y, isActive]);

  // Clear trail when inactive
  useEffect(() => {
    if (!isActive) {
      setTrail([]);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {/* Trail */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute w-2 h-2 rounded-full bg-cyan/30"
          style={{
            left: point.x,
            top: point.y,
            transform: 'translate(-50%, -50%)',
            opacity: (index + 1) / trail.length * 0.5,
            scale: (index + 1) / trail.length * 0.5 + 0.5,
          }}
        />
      ))}

      {/* Main Cursor */}
      <div
        className={cn(
          'absolute transition-transform duration-75',
          isClicking && 'scale-75'
        )}
        style={{
          left: x,
          top: y,
          transform: 'translate(-2px, -2px)',
        }}
      >
        {/* Cursor SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <path
            d="M5 3L19 12L12 13L9 20L5 3Z"
            fill="url(#cursorGradient)"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="cursorGradient" x1="5" y1="3" x2="19" y2="20">
              <stop stopColor="#00f0ff" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Click ripple */}
        {isClicking && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full border-2 border-cyan animate-ping" />
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="absolute left-6 top-0 flex items-center gap-1 bg-void/90 px-2 py-1 rounded-md border border-cyan/30">
            <span className="text-[10px] text-cyan font-mono">typing</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Glow effect */}
      <div
        className="absolute w-16 h-16 rounded-full bg-cyan/10 blur-xl"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}

export default VirtualCursor;
