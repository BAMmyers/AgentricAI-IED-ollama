import { useState, useCallback, useRef } from 'react';
import type { OllamaModel } from '../types';

const OLLAMA_BASE = 'http://localhost:11434';

// All locally installed models from user's Ollama registry
export const KNOWN_LOCAL_MODELS: OllamaModel[] = [
  { name: 'AgentricAIcody', size: 0, digest: '', modified_at: '' },
  { name: 'AgentricAI', size: 0, digest: '', modified_at: '' },
  { name: 'qwen2.5-coder', size: 0, digest: '', modified_at: '' },
  { name: 'dolphin-llama3', size: 0, digest: '', modified_at: '' },
  { name: 'dolphin-phi', size: 0, digest: '', modified_at: '' },
  { name: 'dolphin-uncensored', size: 0, digest: '', modified_at: '' },
  { name: 'glm-4.7-flash', size: 0, digest: '', modified_at: '' },
  { name: 'llama2-uncensored', size: 0, digest: '', modified_at: '' },
  { name: 'lacy', size: 0, digest: '', modified_at: '' },
  { name: 'nomic-embed-text', size: 0, digest: '', modified_at: '' },
  { name: 'AgentricAi/AgentricAI_LLaVa', size: 0, digest: '', modified_at: '' },
  { name: 'AgentricAi/AgentricAI_TLM', size: 0, digest: '', modified_at: '' },
  { name: 'AgentricAi/lacy', size: 0, digest: '', modified_at: '' },
  { name: 'CrimsonDragonX7/Luna', size: 0, digest: '', modified_at: '' },
];

export const DEFAULT_MODEL = 'AgentricAIcody';

export function useOllama() {
  const [models, setModels] = useState<OllamaModel[]>(KNOWN_LOCAL_MODELS);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const liveModels: OllamaModel[] = data.models || [];
        // Merge live models with known models (live takes priority)
        const liveNames = new Set(liveModels.map((m: OllamaModel) => m.name));
        const merged = [
          ...liveModels,
          ...KNOWN_LOCAL_MODELS.filter(m => !liveNames.has(m.name)),
        ];
        setModels(merged);
        setIsConnected(true);
        return true;
      }
    } catch {
      setIsConnected(false);
      // Keep known models even offline
      setModels(prev => prev.length === 0 ? KNOWN_LOCAL_MODELS : prev);
    }
    return false;
  }, []);

  const generate = useCallback(async (
    model: string,
    prompt: string,
    systemPrompt: string,
    onToken?: (token: string) => void,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<string> => {
    setIsLoading(true);
    abortRef.current = new AbortController();
    
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: systemPrompt,
          stream: true,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullResponse += json.response;
              onToken?.(json.response);
            }
          } catch {
            // skip malformed json
          }
        }
      }
      
      return fullResponse;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return '';
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chat = useCallback(async (
    model: string,
    messages: Array<{ role: string; content: string }>,
    onToken?: (token: string) => void,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<string> => {
    setIsLoading(true);
    abortRef.current = new AbortController();
    
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullResponse += json.message.content;
              onToken?.(json.message.content);
            }
          } catch {
            // skip
          }
        }
      }
      
      return fullResponse;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return '';
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pullModel = useCallback(async (
    modelName: string,
    onProgress?: (status: string, completed?: number, total?: number) => void
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: true }),
      });

      if (!res.ok) return false;

      const reader = res.body?.getReader();
      if (!reader) return false;

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            onProgress?.(json.status, json.completed, json.total);
          } catch {
            // skip
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { models, isConnected, isLoading, checkConnection, generate, chat, pullModel, abort };
}
