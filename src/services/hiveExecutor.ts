/**
 * AgentricAI Hive Executor
 * 
 * The core execution engine for multi-agent workflows.
 * Delegates tasks by agent NAME for simplicity.
 * All data flows through Ollama LLM calls.
 */

import { Agent } from '../types';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface HiveContext {
  mission: string;
  artifacts: Record<string, string>;      // Generated code, files, etc.
  agentOutputs: AgentOutput[];            // All agent responses in order
  errors: string[];                       // Accumulated errors
  status: 'idle' | 'analyzing' | 'running' | 'executing' | 'validating' | 'finalizing' | 'complete' | 'failed';
  currentPhase: string;
  startTime: number;
  endTime?: number;
}

export interface AgentOutput {
  agentId: string;
  agentName: string;
  task: string;
  response: string;
  artifacts: ExtractedArtifact[];
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}

export interface ExtractedArtifact {
  name: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'ts' | 'tsx' | 'json' | 'text';
}

export interface TaskPlan {
  phase: string;
  tasks: PlannedTask[];
}

export interface PlannedTask {
  agentName: string;
  task: string;
  dependsOn?: string[];  // Agent names that must complete first
}

// ═══════════════════════════════════════════════════════════════════
// AGENT NAME TO ROLE MAPPING
// ═══════════════════════════════════════════════════════════════════

export const AGENT_FUNCTIONS: Record<string, string> = {
  // Orchestration
  'OrchestratorAlpha': 'PLANNER',
  'AgentricAI_001': 'COORDINATOR',
  'APIGateway': 'DISPATCHER',
  
  // Always-Active Monitors (run in background)
  'Bug': 'MONITOR_BUG',
  'Security_Sentinel_001': 'MONITOR_SECURITY',
  'Logger_001': 'MONITOR_LOG',
  'MechanicAgent': 'MONITOR_INTEGRITY',
  'Checks_and_Balances': 'MONITOR_COMPLIANCE',
  
  // Memory Layer
  'Collective Consciousness': 'MEMORY_FACTUAL',
  'Simulated Consciousness': 'MEMORY_SYNTHETIC',
  'Theoretical Consciousness': 'MEMORY_ABSTRACT',
  
  // Validators (run at end of each phase)
  'ResponseValidatorAgent': 'VALIDATOR',
  'PolicyComplianceGatekeeper': 'VALIDATOR',
  'EthicalComplianceOfficer': 'VALIDATOR',
  
  // Code Generation
  'TheAlchemist': 'DESIGNER',
  'SnippetCoder': 'CODER',
  'CodeRefactorSuggestor': 'REFACTOR',
  'CodeCommenter': 'DOCUMENTER',
  'Visualizer': 'UI_DESIGNER',
  
  // Support
  'PromptRefiner': 'PROMPT_ENGINEER',
  'ContentSummarizer': 'SUMMARIZER',
  'CollectorAlpha': 'AGGREGATOR',
};

// ═══════════════════════════════════════════════════════════════════
// TASK PLANNING PROMPTS
// ═══════════════════════════════════════════════════════════════════

export function buildPlannerPrompt(mission: string, availableAgents: string[]): string {
  return `# ORCHESTRATOR ALPHA — MISSION PLANNING

## YOUR ROLE
You are OrchestratorAlpha, the mission planner for AgentricAI. Your job is to break down the user's request into specific tasks and assign each task to the best agent BY NAME.

## USER'S MISSION
${mission}

## AVAILABLE AGENTS
${availableAgents.join('\n')}

## INSTRUCTIONS
Create a task plan as a JSON array. Each task must specify:
- "agentName": The exact name of the agent (from the list above)
- "task": A clear, specific instruction for that agent
- "dependsOn": Array of agent names whose output this task needs (optional)

## RULES
1. Assign tasks to agents whose role matches the task
2. For code generation: Use TheAlchemist for design, SnippetCoder for code, Bug for testing
3. For UI: Use Visualizer
4. Always end with ResponseValidatorAgent for final validation
5. Order tasks logically - dependent tasks come after their dependencies

## OUTPUT FORMAT
Respond ONLY with a JSON array, no other text:
\`\`\`json
[
  {"agentName": "TheAlchemist", "task": "Design the architecture for...", "dependsOn": []},
  {"agentName": "SnippetCoder", "task": "Generate the code for...", "dependsOn": ["TheAlchemist"]},
  {"agentName": "Bug", "task": "Check the code for errors", "dependsOn": ["SnippetCoder"]},
  {"agentName": "ResponseValidatorAgent", "task": "Validate the final output", "dependsOn": ["Bug"]}
]
\`\`\``;
}

export function buildAgentPrompt(
  agent: Agent,
  task: string,
  context: HiveContext
): string {
  let prompt = `# ${agent.name.toUpperCase()} — HIVE MIND TASK

## YOUR IDENTITY
Name: ${agent.name}
Role: ${agent.role}
Category: ${agent.category}

## YOUR TASK
${task}

## MISSION CONTEXT
Original Mission: ${context.mission}
Current Phase: ${context.currentPhase}
`;

  // Add previous agent outputs for context
  if (context.agentOutputs.length > 0) {
    prompt += `\n## PREVIOUS AGENT OUTPUTS (USE THIS CONTEXT)\n`;
    for (const output of context.agentOutputs) {
      if (output.success) {
        prompt += `\n### ${output.agentName} — ${output.task}\n`;
        prompt += output.response.substring(0, 2000);
        if (output.response.length > 2000) prompt += '\n... [truncated]';
        prompt += '\n';
      }
    }
  }

  // Add existing artifacts
  if (Object.keys(context.artifacts).length > 0) {
    prompt += `\n## GENERATED ARTIFACTS SO FAR\n`;
    for (const [name, content] of Object.entries(context.artifacts)) {
      prompt += `\n### ${name}\n\`\`\`\n${content.substring(0, 1500)}\n\`\`\`\n`;
    }
  }

  // Add errors that need fixing
  if (context.errors.length > 0) {
    prompt += `\n## ⚠️ ERRORS TO FIX\n`;
    for (const error of context.errors) {
      prompt += `- ${error}\n`;
    }
  }

  prompt += `\n## INSTRUCTIONS
1. Complete your task thoroughly
2. If generating code, output COMPLETE, WORKING code (no placeholders, no "// TODO")
3. Wrap code in appropriate code blocks with language tags
4. If you detect issues, prefix with "ERROR:" so Bug agent can catch them
5. Be specific and actionable — your output goes to other agents
`;

  return prompt;
}

export function buildValidatorPrompt(
  context: HiveContext
): string {
  return `# RESPONSE VALIDATOR — FINAL CHECK

## MISSION
${context.mission}

## ALL ARTIFACTS GENERATED
${Object.entries(context.artifacts).map(([name, content]) => 
  `### ${name}\n\`\`\`\n${content}\n\`\`\``
).join('\n\n')}

## YOUR TASK
Validate that:
1. The artifacts fulfill the original mission
2. Code is complete and functional (no placeholders)
3. No obvious bugs or errors
4. All required components are present

## OUTPUT FORMAT
Respond with a JSON object:
\`\`\`json
{
  "valid": true/false,
  "issues": ["list of issues if any"],
  "suggestions": ["improvements if any"],
  "ready": true/false
}
\`\`\``;
}

export function buildBugCheckPrompt(
  code: string,
  language: string
): string {
  return `# BUG DETECTION AGENT

## CODE TO CHECK (${language})
\`\`\`${language}
${code}
\`\`\`

## YOUR TASK
1. Analyze this code for bugs, errors, and issues
2. Check for: syntax errors, logic errors, missing edge cases, potential crashes
3. Verify the code is complete (no placeholders, no "// TODO")

## OUTPUT FORMAT
\`\`\`json
{
  "hasBugs": true/false,
  "bugs": [
    {"line": 1, "issue": "description", "severity": "error|warning|info"}
  ],
  "fixedCode": "... corrected code if needed ..."
}
\`\`\``;
}

// ═══════════════════════════════════════════════════════════════════
// ARTIFACT EXTRACTION
// ═══════════════════════════════════════════════════════════════════

export function extractArtifacts(response: string): ExtractedArtifact[] {
  const artifacts: ExtractedArtifact[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let match;
  let index = 0;
  
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const lang = (match[1] || 'text').toLowerCase();
    const content = match[2].trim();
    
    // Skip empty or very short blocks
    if (content.length < 10) continue;
    
    // Skip JSON that looks like instructions/metadata
    if (lang === 'json' && (content.includes('"agentName"') || content.includes('"valid"'))) {
      continue;
    }
    
    // Determine file extension
    let type: ExtractedArtifact['type'] = 'text';
    let ext = 'txt';
    
    switch (lang) {
      case 'html':
        type = 'html'; ext = 'html'; break;
      case 'css':
        type = 'css'; ext = 'css'; break;
      case 'javascript':
      case 'js':
        type = 'js'; ext = 'js'; break;
      case 'typescript':
      case 'ts':
        type = 'ts'; ext = 'ts'; break;
      case 'tsx':
        type = 'tsx'; ext = 'tsx'; break;
      case 'json':
        type = 'json'; ext = 'json'; break;
      default:
        type = 'text'; ext = 'txt';
    }
    
    // Try to extract filename from content or preceding text
    let name = `code_${index}.${ext}`;
    
    // Look for filename hints in the content
    const filenameMatch = content.match(/(?:\/\/|#|<!--)\s*(?:file(?:name)?:?\s*)?(\S+\.\w+)/i);
    if (filenameMatch) {
      name = filenameMatch[1];
    }
    
    artifacts.push({ name, content, type });
    index++;
  }
  
  return artifacts;
}

// ═══════════════════════════════════════════════════════════════════
// PARSE TASK PLAN FROM ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════

export function parseTaskPlan(response: string): PlannedTask[] {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/```json\n?([\s\S]*?)```/) || 
                      response.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      console.error('No task plan JSON found in response');
      return [];
    }
    
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const tasks = JSON.parse(jsonStr);
    
    if (!Array.isArray(tasks)) {
      console.error('Task plan is not an array');
      return [];
    }
    
    return tasks.map(t => ({
      agentName: t.agentName || '',
      task: t.task || '',
      dependsOn: t.dependsOn || [],
    })).filter(t => t.agentName && t.task);
    
  } catch (e) {
    console.error('Failed to parse task plan:', e);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════
// BUILD FINAL OUTPUT
// ═══════════════════════════════════════════════════════════════════

export function buildFinalOutput(context: HiveContext): string {
  const html = context.artifacts['index.html'] || context.artifacts['code_0.html'];
  const css = Object.entries(context.artifacts)
    .filter(([name]) => name.endsWith('.css'))
    .map(([, content]) => content)
    .join('\n');
  const js = Object.entries(context.artifacts)
    .filter(([name]) => name.endsWith('.js') || name.endsWith('.ts'))
    .map(([, content]) => content)
    .join('\n');
  
  if (html) {
    let output = html;
    // Inject CSS if not already present
    if (css && !output.includes('<style>')) {
      output = output.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
    }
    // Inject JS if not already present
    if (js && !output.includes('<script>')) {
      output = output.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
    }
    return output;
  }
  
  // If no HTML, create a wrapper
  if (js || css) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentricAI Output</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #0a0a0f; 
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      min-height: 100vh;
    }
    ${css}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
${js}
  </script>
</body>
</html>`;
  }
  
  // Return raw text if no code
  return context.agentOutputs
    .filter(o => o.success)
    .map(o => `## ${o.agentName}\n${o.response}`)
    .join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════
// CREATE INITIAL CONTEXT
// ═══════════════════════════════════════════════════════════════════

export function createContext(mission: string): HiveContext {
  return {
    mission,
    artifacts: {},
    agentOutputs: [],
    errors: [],
    status: 'idle',
    currentPhase: 'initializing',
    startTime: Date.now(),
  };
}
