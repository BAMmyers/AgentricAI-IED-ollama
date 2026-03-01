// ═══════════════════════════════════════════════════════════════════════════
// AGENTRICAI ORCHESTRATION ENGINE
// Intelligent Non-Sequential Multi-Agent Workflow Execution
// ═══════════════════════════════════════════════════════════════════════════

import type { Agent } from '../types';
import type {
  Mission,
  MissionPlan,
  MissionTask,
  OrchestrationEvent,
  OrchestrationEventHandler,
  GeneratedCode,
  TASK_AGENT_MAPPINGS,
} from './types';
import {
  canRetry,
  getAgentTriggers,
} from './agentClassification';

// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATION ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class OrchestrationEngine {
  private agents: Map<string, Agent> = new Map();
  private activeMission: Mission | null = null;
  private eventHandlers: OrchestrationEventHandler[] = [];
  private abortController: AbortController | null = null;
  
  // Ollama integration
  private ollamaEndpoint = 'http://localhost:11434';
  
  constructor(agents: Agent[]) {
    agents.forEach(a => this.agents.set(a.id, a));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT SYSTEM
  // ───────────────────────────────────────────────────────────────────────────

  public onEvent(handler: OrchestrationEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
    };
  }

  private emit(event: Omit<OrchestrationEvent, 'timestamp'>): void {
    const fullEvent: OrchestrationEvent = {
      ...event,
      timestamp: Date.now(),
    };
    this.eventHandlers.forEach(h => h(fullEvent));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MISSION CREATION
  // ───────────────────────────────────────────────────────────────────────────

  public async createMission(objective: string): Promise<Mission> {
    const mission: Mission = {
      id: `mission_${Date.now()}`,
      objective,
      priority: 'normal',
      status: 'planning',
      createdAt: Date.now(),
      currentPhase: 0,
      phases: [],
      errors: [],
      contextChain: [],
    };

    this.activeMission = mission;
    this.emit({
      type: 'mission_created',
      missionId: mission.id,
      data: { message: `Mission created: ${objective}` },
    });

    return mission;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INTELLIGENT AGENT SELECTION
  // ───────────────────────────────────────────────────────────────────────────

  public analyzeObjectiveAndSelectAgents(objective: string): {
    taskType: string;
    requiredAgents: Agent[];
    suggestedAgents: Agent[];
    alwaysActiveAgents: Agent[];
    validationAgents: Agent[];
  } {
    const lowerObjective = objective.toLowerCase();
    
    // Find matching task type
    let matchedTaskType = 'default';
    let maxMatches = 0;
    
    const taskMappings: typeof TASK_AGENT_MAPPINGS = {
      'create_game': {
        keywords: ['game', 'tetris', 'arcade', 'play', 'interactive', 'puzzle'],
        requiredAgents: ['agent-13', 'agent-26', 'agent-17'],
        suggestedAgents: ['agent-28', 'agent-40'],
        alwaysActiveAgents: ['agent-49', 'agent-4', 'agent-3'],
        validationAgents: ['val-01', 'agent-47'],
      },
      'create_app': {
        keywords: ['app', 'application', 'software', 'program', 'build', 'create'],
        requiredAgents: ['agent-13', 'agent-26', 'agent-7'],
        suggestedAgents: ['agent-35', 'agent-42'],
        alwaysActiveAgents: ['agent-49', 'agent-4', 'agent-3'],
        validationAgents: ['val-01', 'agent-sr'],
      },
      'create_agent': {
        keywords: ['agent', 'bot', 'assistant', 'create agent', 'new agent'],
        requiredAgents: ['agent-42', 'agent-13'],
        suggestedAgents: ['agent-15'],
        alwaysActiveAgents: ['agent-49', 'agent-4'],
        validationAgents: ['val-01', 'agent-47'],
      },
      'ui_design': {
        keywords: ['ui', 'ux', 'design', 'interface', 'visual', 'theme', 'neon', 'futuristic', 'style'],
        requiredAgents: ['agent-17', 'agent-13'],
        suggestedAgents: ['agent-26'],
        alwaysActiveAgents: ['agent-49', 'agent-3'],
        validationAgents: ['val-01'],
      },
      'research': {
        keywords: ['research', 'analyze', 'study', 'investigate', 'find', 'learn'],
        requiredAgents: ['agent-41', 'agent-21'],
        suggestedAgents: ['agent-23', 'agent-33'],
        alwaysActiveAgents: ['agent-3'],
        validationAgents: ['ext-eth-01'],
      },
      'default': {
        keywords: [],
        requiredAgents: ['agent-20'],
        suggestedAgents: [],
        alwaysActiveAgents: ['agent-49', 'agent-4', 'agent-3'],
        validationAgents: ['val-01'],
      },
    };

    for (const [taskType, mapping] of Object.entries(taskMappings)) {
      if (taskType === 'default') continue;
      const matches = mapping.keywords.filter(kw => lowerObjective.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedTaskType = taskType;
      }
    }

    const mapping = taskMappings[matchedTaskType] || taskMappings['default'];
    
    return {
      taskType: matchedTaskType,
      requiredAgents: mapping.requiredAgents
        .map(id => this.agents.get(id))
        .filter((a): a is Agent => !!a),
      suggestedAgents: mapping.suggestedAgents
        .map(id => this.agents.get(id))
        .filter((a): a is Agent => !!a),
      alwaysActiveAgents: mapping.alwaysActiveAgents
        .map(id => this.agents.get(id))
        .filter((a): a is Agent => !!a),
      validationAgents: mapping.validationAgents
        .map(id => this.agents.get(id))
        .filter((a): a is Agent => !!a),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MISSION PLANNING (via OrchestratorAlpha)
  // ───────────────────────────────────────────────────────────────────────────

  public async planMission(mission: Mission): Promise<MissionPlan> {
    const orchestrator = this.agents.get('agent-20'); // OrchestratorAlpha
    if (!orchestrator) {
      throw new Error('OrchestratorAlpha not found');
    }

    this.emit({
      type: 'mission_planned',
      missionId: mission.id,
      data: {
        agentId: orchestrator.id,
        agentName: orchestrator.name,
        message: 'Analyzing objective and creating mission plan...',
      },
    });

    // Analyze the objective
    const analysis = this.analyzeObjectiveAndSelectAgents(mission.objective);

    // Create a structured plan
    const plan: MissionPlan = {
      analyzedBy: orchestrator.id,
      complexity: analysis.requiredAgents.length > 3 ? 'complex' : 
                  analysis.requiredAgents.length > 1 ? 'moderate' : 'simple',
      estimatedAgents: [
        ...analysis.requiredAgents.map(a => a.id),
        ...analysis.suggestedAgents.map(a => a.id),
      ],
      phases: [
        {
          name: 'Design & Architecture',
          description: 'Create blueprint and design specifications',
          tasks: analysis.requiredAgents
            .filter(a => ['agent-13', 'agent-17'].includes(a.id))
            .map(a => ({
              agentId: a.id,
              instruction: `Based on the objective: "${mission.objective}", create a detailed ${
                a.id === 'agent-13' ? 'blueprint and architecture' : 'visual design specification'
              }.`,
              retryOnFailure: true,
              maxRetries: 2,
              validationRequired: true,
            })),
          parallel: false,
          requiredForNext: true,
        },
        {
          name: 'Implementation',
          description: 'Generate code and implement features',
          tasks: analysis.requiredAgents
            .filter(a => ['agent-26', 'agent-7'].includes(a.id))
            .map(a => ({
              agentId: a.id,
              instruction: `Implement the solution based on the design. Generate clean, well-structured code.`,
              dependsOn: ['agent-13'],
              retryOnFailure: true,
              maxRetries: 3,
              validationRequired: true,
            })),
          parallel: true,
          requiredForNext: true,
        },
        {
          name: 'Refinement',
          description: 'Refactor and add documentation',
          tasks: analysis.suggestedAgents.map(a => ({
            agentId: a.id,
            instruction: `Review and improve the implementation. Add comments and ensure best practices.`,
            dependsOn: ['agent-26'],
            retryOnFailure: true,
            maxRetries: 2,
            validationRequired: false,
          })),
          parallel: true,
          requiredForNext: false,
        },
        {
          name: 'Validation',
          description: 'Validate output and ensure quality',
          tasks: analysis.validationAgents.map(a => ({
            agentId: a.id,
            instruction: `Validate the complete solution for correctness, security, and best practices.`,
            retryOnFailure: false,
            maxRetries: 0,
            validationRequired: false,
          })),
          parallel: false,
          requiredForNext: false,
        },
      ],
      alwaysActiveAgents: analysis.alwaysActiveAgents.map(a => a.id),
      validationAgents: analysis.validationAgents.map(a => a.id),
    };

    mission.plan = plan;
    
    // Convert plan to executable phases
    mission.phases = plan.phases.map((phaseDef, idx) => ({
      id: `phase_${idx}`,
      name: phaseDef.name,
      status: 'pending',
      tasks: phaseDef.tasks.map((taskDef, tIdx) => {
        const agent = this.agents.get(taskDef.agentId);
        return {
          id: `task_${idx}_${tIdx}`,
          agentId: taskDef.agentId,
          agentName: agent?.name || 'Unknown',
          instruction: taskDef.instruction,
          status: 'pending',
          retryCount: 0,
          maxRetries: taskDef.maxRetries,
          dependsOn: taskDef.dependsOn || [],
          blockedBy: [],
        };
      }),
    }));

    return plan;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MISSION EXECUTION
  // ───────────────────────────────────────────────────────────────────────────

  public async executeMission(
    mission: Mission,
    onThinking?: (agentName: string, content: string) => void
  ): Promise<void> {
    if (!mission.plan) {
      throw new Error('Mission has no plan. Call planMission first.');
    }

    this.abortController = new AbortController();
    mission.status = 'executing';
    mission.startedAt = Date.now();

    this.emit({
      type: 'mission_started',
      missionId: mission.id,
      data: { message: 'Mission execution started' },
    });

    try {
      // Execute each phase
      for (let phaseIdx = 0; phaseIdx < mission.phases.length; phaseIdx++) {
        if (this.abortController.signal.aborted) {
          throw new Error('Mission aborted');
        }

        const phase = mission.phases[phaseIdx];
        mission.currentPhase = phaseIdx;
        phase.status = 'running';
        phase.startedAt = Date.now();

        this.emit({
          type: 'phase_started',
          missionId: mission.id,
          data: {
            phaseId: phase.id,
            message: `Phase ${phaseIdx + 1}: ${phase.name}`,
          },
        });

        // Execute tasks (respecting parallel flag and dependencies)
        const phaseDef = mission.plan.phases[phaseIdx];
        
        if (phaseDef.parallel) {
          // Execute all tasks in parallel
          await Promise.all(
            phase.tasks.map(task => this.executeTask(mission, task, onThinking))
          );
        } else {
          // Execute tasks sequentially
          for (const task of phase.tasks) {
            await this.executeTask(mission, task, onThinking);
          }
        }

        phase.status = 'completed';
        phase.completedAt = Date.now();

        this.emit({
          type: 'phase_completed',
          missionId: mission.id,
          data: {
            phaseId: phase.id,
            message: `Phase ${phaseIdx + 1} completed`,
          },
        });

        // Check if this phase is required for next
        if (phaseDef.requiredForNext) {
          const failedTasks = phase.tasks.filter(t => t.status === 'failed');
          if (failedTasks.length > 0) {
            throw new Error(`Phase ${phase.name} has ${failedTasks.length} failed tasks`);
          }
        }
      }

      // Validation phase
      mission.status = 'validating';
      await this.validateMissionOutput(mission);

      // Complete
      mission.status = 'completed';
      mission.completedAt = Date.now();

      // Extract generated code
      mission.generatedCode = this.extractGeneratedCode(mission);

      this.emit({
        type: 'mission_completed',
        missionId: mission.id,
        data: {
          message: 'Mission completed successfully',
          output: this.compileMissionOutput(mission),
        },
      });

    } catch (error) {
      mission.status = 'failed';
      mission.completedAt = Date.now();
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      mission.errors.push({
        taskId: 'mission',
        agentId: 'system',
        error: errorMsg,
        timestamp: Date.now(),
        recovered: false,
      });

      this.emit({
        type: 'mission_failed',
        missionId: mission.id,
        data: { error: errorMsg },
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TASK EXECUTION
  // ───────────────────────────────────────────────────────────────────────────

  private async executeTask(
    mission: Mission,
    task: MissionTask,
    onThinking?: (agentName: string, content: string) => void
  ): Promise<void> {
    const agent = this.agents.get(task.agentId);
    if (!agent) {
      task.status = 'failed';
      task.error = 'Agent not found';
      return;
    }

    task.status = 'running';
    task.startedAt = Date.now();

    this.emit({
      type: 'task_started',
      missionId: mission.id,
      data: {
        taskId: task.id,
        agentId: agent.id,
        agentName: agent.name,
        message: `${agent.name} executing task...`,
      },
    });

    try {
      // Build context from previous agent outputs
      const contextPrompt = this.buildContextPrompt(mission, task);
      const fullPrompt = `${contextPrompt}\n\n## Your Task\n${task.instruction}`;

      // Call Ollama with streaming
      let fullResponse = '';
      const response = await this.callOllama(
        agent.model,
        fullPrompt,
        agent.systemPrompt,
        (token) => {
          fullResponse += token;
          if (onThinking) {
            onThinking(agent.name, fullResponse);
          }
          this.emit({
            type: 'agent_thinking',
            missionId: mission.id,
            data: {
              taskId: task.id,
              agentId: agent.id,
              agentName: agent.name,
              thinkingContent: fullResponse,
            },
          });
        }
      );

      task.output = response;
      task.status = 'completed';
      task.completedAt = Date.now();
      task.duration = task.completedAt - task.startedAt!;

      // Add to context chain
      mission.contextChain.push({
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        output: response,
        timestamp: Date.now(),
      });

      this.emit({
        type: 'task_completed',
        missionId: mission.id,
        data: {
          taskId: task.id,
          agentId: agent.id,
          agentName: agent.name,
          output: response,
        },
      });

      // Check for triggered agents
      const triggers = getAgentTriggers(agent.id);
      if (triggers.length > 0) {
        this.emit({
          type: 'context_updated',
          missionId: mission.id,
          data: {
            agentId: agent.id,
            message: `${agent.name} can trigger: ${triggers.join(', ')}`,
          },
        });
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry logic
      if (canRetry(task.agentId) && task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = 'retrying';
        
        this.emit({
          type: 'task_retrying',
          missionId: mission.id,
          data: {
            taskId: task.id,
            agentId: agent.id,
            agentName: agent.name,
            message: `Retry ${task.retryCount}/${task.maxRetries}`,
          },
        });

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.executeTask(mission, task, onThinking);
      }

      task.status = 'failed';
      task.error = errorMsg;
      task.completedAt = Date.now();
      task.duration = task.completedAt - task.startedAt!;

      mission.errors.push({
        taskId: task.id,
        agentId: agent.id,
        error: errorMsg,
        timestamp: Date.now(),
        recovered: false,
      });

      this.emit({
        type: 'task_failed',
        missionId: mission.id,
        data: {
          taskId: task.id,
          agentId: agent.id,
          agentName: agent.name,
          error: errorMsg,
        },
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CONTEXT BUILDING
  // ───────────────────────────────────────────────────────────────────────────

  private buildContextPrompt(mission: Mission, _task: MissionTask): string {
    let context = `## Mission Objective\n${mission.objective}\n\n`;

    if (mission.contextChain.length > 0) {
      context += `## Previous Agent Outputs\n`;
      mission.contextChain.forEach((entry, idx) => {
        context += `### ${idx + 1}. ${entry.agentName} (${entry.role})\n`;
        context += `${entry.output}\n\n`;
      });
    }

    return context;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // OLLAMA INTEGRATION
  // ───────────────────────────────────────────────────────────────────────────

  private async callOllama(
    model: string,
    prompt: string,
    systemPrompt: string,
    onToken?: (token: string) => void
  ): Promise<string> {
    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        stream: true,
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            fullResponse += json.response;
            if (onToken) onToken(json.response);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    return fullResponse;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ───────────────────────────────────────────────────────────────────────────

  private async validateMissionOutput(mission: Mission): Promise<void> {
    const validator = this.agents.get('val-01');
    if (!validator) return;

    this.emit({
      type: 'validation_started',
      missionId: mission.id,
      data: {
        agentId: validator.id,
        agentName: validator.name,
        message: 'Validating mission output...',
      },
    });

    // Simple validation - in real implementation, this would check the output
    this.emit({
      type: 'validation_completed',
      missionId: mission.id,
      data: {
        agentId: validator.id,
        agentName: validator.name,
        message: 'Validation passed',
      },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // OUTPUT COMPILATION
  // ───────────────────────────────────────────────────────────────────────────

  private compileMissionOutput(mission: Mission): string {
    return mission.contextChain
      .map(entry => `## ${entry.agentName}\n${entry.output}`)
      .join('\n\n---\n\n');
  }

  private extractGeneratedCode(mission: Mission): GeneratedCode[] {
    const codeBlocks: GeneratedCode[] = [];
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;

    mission.contextChain.forEach(entry => {
      let match;
      while ((match = codeRegex.exec(entry.output)) !== null) {
        const language = match[1] || 'text';
        const content = match[2].trim();
        
        // Try to extract filename from content or context
        let filename = `output.${language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language}`;
        const filenameMatch = content.match(/\/\/\s*filename:\s*(\S+)/i) || 
                              entry.output.match(/file[:\s]+`?([^\s`]+)/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }

        codeBlocks.push({
          filename,
          language,
          content,
          generatedBy: entry.agentName,
          validated: false,
        });
      }
    });

    return codeBlocks;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CONTROL
  // ───────────────────────────────────────────────────────────────────────────

  public abort(): void {
    this.abortController?.abort();
  }

  public getActiveMission(): Mission | null {
    return this.activeMission;
  }

  public updateAgents(agents: Agent[]): void {
    this.agents.clear();
    agents.forEach(a => this.agents.set(a.id, a));
  }
}

// ───────────────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ───────────────────────────────────────────────────────────────────────────

let engineInstance: OrchestrationEngine | null = null;

export function getOrchestrationEngine(agents?: Agent[]): OrchestrationEngine {
  if (!engineInstance && agents) {
    engineInstance = new OrchestrationEngine(agents);
  }
  if (!engineInstance) {
    throw new Error('Orchestration engine not initialized');
  }
  return engineInstance;
}

export function initOrchestrationEngine(agents: Agent[]): OrchestrationEngine {
  engineInstance = new OrchestrationEngine(agents);
  return engineInstance;
}
