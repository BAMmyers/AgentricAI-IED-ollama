export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  systemPrompt: string;
  status: 'idle' | 'running' | 'success' | 'error';
  color: string;
  icon: string;
  tools: string[];
  temperature: number;
  maxTokens: number;
  category: string;
  logic: 'local' | 'remote' | 'hybrid';
}

export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: number;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  instruction: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  duration?: number;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'agent';
  content: string;
  timestamp: number;
  agentName?: string;
  agentColor?: string;
}

// Output System Types
export interface OutputFile {
  id: string;
  name: string;
  type: 'agent' | 'code' | 'data' | 'log' | 'workflow' | 'config';
  content: string;
  mimeType: string;
  extension: string;
  createdAt: number;
  updatedAt: number;
  source: {
    workflowId?: string;
    workflowName?: string;
    agentId?: string;
    agentName?: string;
    teamExecution?: boolean;
  };
  metadata: {
    size: number;
    lines?: number;
    language?: string;
    isImported?: boolean;
    version?: number;
  };
}

export interface CustomAgent extends Agent {
  isCustom: true;
  outputFileId: string;
  createdBy: {
    workflowId?: string;
    workflowName?: string;
    agentId?: string;
    agentName?: string;
  };
  originalPrompt?: string;
}

export interface OutputDirectory {
  agents: OutputFile[];
  code: OutputFile[];
  data: OutputFile[];
  logs: OutputFile[];
  workflows: OutputFile[];
  configs: OutputFile[];
}

export interface WorkflowOutput {
  workflowId: string;
  workflowName: string;
  executedAt: number;
  duration: number;
  steps: {
    agentId: string;
    agentName: string;
    input: string;
    output: string;
    status: 'completed' | 'failed';
    duration: number;
  }[];
  generatedFiles: OutputFile[];
  customAgents: CustomAgent[];
}
