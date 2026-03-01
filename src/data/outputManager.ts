/**
 * OutputManager — Handles saving, loading, and managing workflow outputs
 * 
 * Provides a sandboxed output directory system that:
 * - Stores workflow outputs (agents, code, data, logs)
 * - Allows custom agents to be imported into the roster
 * - Keeps core code immutable while enabling runtime evolution
 * - Persists to localStorage with export/import to filesystem
 */

import { OutputFile, CustomAgent, OutputDirectory, WorkflowOutput, Agent } from '../types';
import { DEFAULT_MODEL } from '../hooks/useOllama';

const STORAGE_KEY = 'agentric_output_directory';
const CUSTOM_AGENTS_KEY = 'agentric_custom_agents';

// Initialize empty output directory structure
const createEmptyDirectory = (): OutputDirectory => ({
  agents: [],
  code: [],
  data: [],
  logs: [],
  workflows: [],
  configs: [],
});

/**
 * Load output directory from localStorage
 */
export const loadOutputDirectory = (): OutputDirectory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[OutputManager] Failed to load output directory:', error);
  }
  return createEmptyDirectory();
};

/**
 * Save output directory to localStorage
 */
export const saveOutputDirectory = (directory: OutputDirectory): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(directory));
  } catch (error) {
    console.error('[OutputManager] Failed to save output directory:', error);
  }
};

/**
 * Load custom agents from localStorage
 */
export const loadCustomAgents = (): CustomAgent[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_AGENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[OutputManager] Failed to load custom agents:', error);
  }
  return [];
};

/**
 * Save custom agents to localStorage
 */
export const saveCustomAgents = (agents: CustomAgent[]): void => {
  try {
    localStorage.setItem(CUSTOM_AGENTS_KEY, JSON.stringify(agents));
  } catch (error) {
    console.error('[OutputManager] Failed to save custom agents:', error);
  }
};

/**
 * Generate a unique file ID
 */
const generateFileId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an output file from content
 */
export const createOutputFile = (
  name: string,
  type: OutputFile['type'],
  content: string,
  source: OutputFile['source'],
  options: {
    extension?: string;
    mimeType?: string;
    language?: string;
  } = {}
): OutputFile => {
  const extension = options.extension || getExtensionForType(type);
  const mimeType = options.mimeType || getMimeTypeForExtension(extension);
  
  return {
    id: generateFileId(type),
    name,
    type,
    content,
    extension,
    mimeType,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    source,
    metadata: {
      size: new Blob([content]).size,
      lines: content.split('\n').length,
      language: options.language || getLanguageForExtension(extension),
      isImported: false,
      version: 1,
    },
  };
};

/**
 * Get file extension for output type
 */
const getExtensionForType = (type: OutputFile['type']): string => {
  switch (type) {
    case 'agent': return 'agent.json';
    case 'code': return 'ts';
    case 'data': return 'json';
    case 'log': return 'log';
    case 'workflow': return 'workflow.json';
    case 'config': return 'config.json';
    default: return 'txt';
  }
};

/**
 * Get MIME type for extension
 */
const getMimeTypeForExtension = (extension: string): string => {
  if (extension.includes('json')) return 'application/json';
  if (extension === 'ts' || extension === 'tsx') return 'text/typescript';
  if (extension === 'js' || extension === 'jsx') return 'text/javascript';
  if (extension === 'log' || extension === 'txt') return 'text/plain';
  if (extension === 'md') return 'text/markdown';
  if (extension === 'yaml' || extension === 'yml') return 'text/yaml';
  return 'text/plain';
};

/**
 * Get language for syntax highlighting
 */
const getLanguageForExtension = (extension: string): string => {
  if (extension.includes('json')) return 'json';
  if (extension === 'ts' || extension === 'tsx') return 'typescript';
  if (extension === 'js' || extension === 'jsx') return 'javascript';
  if (extension === 'py') return 'python';
  if (extension === 'md') return 'markdown';
  if (extension === 'yaml' || extension === 'yml') return 'yaml';
  return 'plaintext';
};

/**
 * Save an output file to the directory
 */
export const saveOutputFile = (file: OutputFile): OutputDirectory => {
  const directory = loadOutputDirectory();
  
  // Add to appropriate category
  switch (file.type) {
    case 'agent':
      directory.agents.push(file);
      break;
    case 'code':
      directory.code.push(file);
      break;
    case 'data':
      directory.data.push(file);
      break;
    case 'log':
      directory.logs.push(file);
      break;
    case 'workflow':
      directory.workflows.push(file);
      break;
    case 'config':
      directory.configs.push(file);
      break;
  }
  
  saveOutputDirectory(directory);
  return directory;
};

/**
 * Delete an output file from the directory
 */
export const deleteOutputFile = (fileId: string): OutputDirectory => {
  const directory = loadOutputDirectory();
  
  // Search and remove from all categories
  const categories: (keyof OutputDirectory)[] = ['agents', 'code', 'data', 'logs', 'workflows', 'configs'];
  for (const category of categories) {
    directory[category] = directory[category].filter(f => f.id !== fileId);
  }
  
  saveOutputDirectory(directory);
  return directory;
};

/**
 * Get all output files as a flat array
 */
export const getAllOutputFiles = (): OutputFile[] => {
  const directory = loadOutputDirectory();
  return [
    ...directory.agents,
    ...directory.code,
    ...directory.data,
    ...directory.logs,
    ...directory.workflows,
    ...directory.configs,
  ].sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Parse agent definition from LLM output
 */
export const parseAgentFromOutput = (content: string, source: OutputFile['source']): CustomAgent | null => {
  try {
    // Try to find JSON in the content
    const jsonMatch = content.match(/\{[\s\S]*?"name"[\s\S]*?"role"[\s\S]*?\}/);
    if (!jsonMatch) {
      // Try to extract name and role from natural language
      const nameMatch = content.match(/name[:\s]+["']?([^"'\n,]+)["']?/i);
      const roleMatch = content.match(/role[:\s]+["']?([^"'\n]+)["']?/i);
      
      if (nameMatch && roleMatch) {
        return createCustomAgent(
          nameMatch[1].trim(),
          roleMatch[1].trim(),
          source
        );
      }
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.name && parsed.role) {
      return createCustomAgent(
        parsed.name,
        parsed.role,
        source,
        parsed
      );
    }
    return null;
  } catch (error) {
    console.error('[OutputManager] Failed to parse agent from output:', error);
    return null;
  }
};

/**
 * Create a custom agent with defaults
 */
export const createCustomAgent = (
  name: string,
  role: string,
  source: OutputFile['source'],
  overrides: Partial<Agent> = {}
): CustomAgent => {
  const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    role,
    model: overrides.model || DEFAULT_MODEL,
    systemPrompt: overrides.systemPrompt || `You are ${name}. ${role}`,
    status: 'idle',
    color: overrides.color || getRandomColor(),
    icon: overrides.icon || '🤖',
    tools: overrides.tools || [],
    temperature: overrides.temperature ?? 0.7,
    maxTokens: overrides.maxTokens ?? 4096,
    category: overrides.category || 'Custom Agents',
    logic: overrides.logic || 'local',
    isCustom: true,
    outputFileId: id,
    createdBy: {
      workflowId: source.workflowId,
      workflowName: source.workflowName,
      agentId: source.agentId,
      agentName: source.agentName,
    },
  };
};

/**
 * Get a random color for new agents
 */
const getRandomColor = (): string => {
  const colors = [
    '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
    '#6366f1', '#14b8a6', '#f43f5e', '#84cc16', '#a855f7',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Save workflow output (complete execution result)
 */
export const saveWorkflowOutput = (output: WorkflowOutput): void => {
  // Save workflow log
  const logFile = createOutputFile(
    `${output.workflowName}-${new Date(output.executedAt).toISOString().split('T')[0]}`,
    'log',
    formatWorkflowLog(output),
    { workflowId: output.workflowId, workflowName: output.workflowName }
  );
  saveOutputFile(logFile);
  
  // Save workflow definition
  const workflowFile = createOutputFile(
    output.workflowName,
    'workflow',
    JSON.stringify(output, null, 2),
    { workflowId: output.workflowId, workflowName: output.workflowName }
  );
  saveOutputFile(workflowFile);
  
  // Save any generated files
  output.generatedFiles.forEach(file => {
    saveOutputFile(file);
  });
  
  // Save custom agents
  if (output.customAgents.length > 0) {
    const existingAgents = loadCustomAgents();
    const newAgents = [...existingAgents, ...output.customAgents];
    saveCustomAgents(newAgents);
    
    // Also save agent definitions as files
    output.customAgents.forEach(agent => {
      const agentFile = createOutputFile(
        agent.name,
        'agent',
        JSON.stringify(agent, null, 2),
        { workflowId: output.workflowId, workflowName: output.workflowName, agentId: agent.id, agentName: agent.name }
      );
      saveOutputFile(agentFile);
    });
  }
};

/**
 * Format workflow output as a readable log
 */
const formatWorkflowLog = (output: WorkflowOutput): string => {
  const lines: string[] = [
    '═'.repeat(80),
    `WORKFLOW EXECUTION LOG`,
    '═'.repeat(80),
    ``,
    `Workflow: ${output.workflowName}`,
    `ID: ${output.workflowId}`,
    `Executed: ${new Date(output.executedAt).toISOString()}`,
    `Duration: ${(output.duration / 1000).toFixed(2)}s`,
    `Steps: ${output.steps.length}`,
    ``,
    '─'.repeat(80),
    `EXECUTION STEPS`,
    '─'.repeat(80),
    ``,
  ];
  
  output.steps.forEach((step, index) => {
    lines.push(`[Step ${index + 1}] ${step.agentName}`);
    lines.push(`Status: ${step.status.toUpperCase()}`);
    lines.push(`Duration: ${(step.duration / 1000).toFixed(2)}s`);
    lines.push(`Input: ${step.input}`);
    lines.push(`Output:`);
    lines.push(step.output);
    lines.push(``);
    lines.push('─'.repeat(40));
    lines.push(``);
  });
  
  if (output.generatedFiles.length > 0) {
    lines.push('─'.repeat(80));
    lines.push(`GENERATED FILES`);
    lines.push('─'.repeat(80));
    lines.push(``);
    output.generatedFiles.forEach(file => {
      lines.push(`• ${file.name}.${file.extension} (${file.type}) - ${file.metadata.size} bytes`);
    });
    lines.push(``);
  }
  
  if (output.customAgents.length > 0) {
    lines.push('─'.repeat(80));
    lines.push(`CUSTOM AGENTS CREATED`);
    lines.push('─'.repeat(80));
    lines.push(``);
    output.customAgents.forEach(agent => {
      lines.push(`• ${agent.name}`);
      lines.push(`  Role: ${agent.role}`);
      lines.push(`  Model: ${agent.model}`);
      lines.push(`  Category: ${agent.category}`);
      lines.push(``);
    });
  }
  
  lines.push('═'.repeat(80));
  lines.push(`END OF LOG`);
  lines.push('═'.repeat(80));
  
  return lines.join('\n');
};

/**
 * Download a file to the user's filesystem
 */
export const downloadFile = (file: OutputFile): void => {
  const blob = new Blob([file.content], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${file.name}.${file.extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Download entire output directory as a ZIP-like structure (JSON bundle)
 */
export const downloadOutputBundle = (): void => {
  const directory = loadOutputDirectory();
  const customAgents = loadCustomAgents();
  
  const bundle = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    directory,
    customAgents,
  };
  
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agentric-output-${new Date().toISOString().split('T')[0]}.bundle.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Import an output bundle
 */
export const importOutputBundle = (bundleJson: string): { directory: OutputDirectory; customAgents: CustomAgent[] } => {
  const bundle = JSON.parse(bundleJson);
  
  // Merge with existing
  const existingDirectory = loadOutputDirectory();
  const existingAgents = loadCustomAgents();
  
  const mergedDirectory: OutputDirectory = {
    agents: [...existingDirectory.agents, ...bundle.directory.agents],
    code: [...existingDirectory.code, ...bundle.directory.code],
    data: [...existingDirectory.data, ...bundle.directory.data],
    logs: [...existingDirectory.logs, ...bundle.directory.logs],
    workflows: [...existingDirectory.workflows, ...bundle.directory.workflows],
    configs: [...existingDirectory.configs, ...bundle.directory.configs],
  };
  
  // Dedupe by ID
  const dedupeById = <T extends { id: string }>(arr: T[]): T[] => {
    const seen = new Set<string>();
    return arr.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };
  
  mergedDirectory.agents = dedupeById(mergedDirectory.agents);
  mergedDirectory.code = dedupeById(mergedDirectory.code);
  mergedDirectory.data = dedupeById(mergedDirectory.data);
  mergedDirectory.logs = dedupeById(mergedDirectory.logs);
  mergedDirectory.workflows = dedupeById(mergedDirectory.workflows);
  mergedDirectory.configs = dedupeById(mergedDirectory.configs);
  
  const mergedAgents = dedupeById([...existingAgents, ...bundle.customAgents]);
  
  saveOutputDirectory(mergedDirectory);
  saveCustomAgents(mergedAgents);
  
  return { directory: mergedDirectory, customAgents: mergedAgents };
};

/**
 * Clear all output data
 */
export const clearAllOutputs = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CUSTOM_AGENTS_KEY);
};

/**
 * Get output directory stats
 */
export const getOutputStats = (): {
  totalFiles: number;
  totalSize: number;
  customAgents: number;
  byType: Record<string, number>;
} => {
  const directory = loadOutputDirectory();
  const customAgents = loadCustomAgents();
  const allFiles = getAllOutputFiles();
  
  return {
    totalFiles: allFiles.length,
    totalSize: allFiles.reduce((sum, f) => sum + f.metadata.size, 0),
    customAgents: customAgents.length,
    byType: {
      agents: directory.agents.length,
      code: directory.code.length,
      data: directory.data.length,
      logs: directory.logs.length,
      workflows: directory.workflows.length,
      configs: directory.configs.length,
    },
  };
};

/**
 * Detect and extract code blocks from LLM output
 */
export const extractCodeFromOutput = (content: string): { language: string; code: string }[] => {
  const codeBlocks: { language: string; code: string }[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'plaintext',
      code: match[2].trim(),
    });
  }
  
  return codeBlocks;
};

/**
 * Auto-detect output type from content
 */
export const detectOutputType = (content: string): OutputFile['type'] => {
  // Check for agent definition
  if (content.includes('"name"') && content.includes('"role"') && 
      (content.includes('"model"') || content.includes('"systemPrompt"'))) {
    return 'agent';
  }
  
  // Check for workflow definition
  if (content.includes('"steps"') && content.includes('"agentId"')) {
    return 'workflow';
  }
  
  // Check for code (has function/class definitions)
  if (content.includes('function ') || content.includes('class ') || 
      content.includes('const ') || content.includes('import ')) {
    return 'code';
  }
  
  // Check for JSON data
  try {
    JSON.parse(content);
    return 'data';
  } catch {
    // Not JSON
  }
  
  // Default to log
  return 'log';
};
