// ═══════════════════════════════════════════════════════════════════════════
// TEAM MANAGER — Automated Agent Selection & UI Interaction
// This agent analyzes user objectives and automatically selects/orchestrates
// the appropriate team of agents, simulating cursor movements and clicks
// ═══════════════════════════════════════════════════════════════════════════

import type { Agent } from '../types';
import type { AutomationAction, TeamManagerState } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MANAGER CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class TeamManager {
  private state: TeamManagerState;
  private agents: Map<string, Agent> = new Map();
  private onStateChange?: (state: TeamManagerState) => void;
  private onCursorMove?: (x: number, y: number) => void;
  private onActionComplete?: (action: AutomationAction) => void;
  
  // Animation timing
  private typingSpeed = 50; // ms per character
  private clickDelay = 200; // ms

  constructor(agents: Agent[]) {
    agents.forEach(a => this.agents.set(a.id, a));
    this.state = {
      isActive: false,
      actionQueue: [],
      cursorPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      selectedAgents: [],
      generatedPrompt: '',
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ───────────────────────────────────────────────────────────────────────────

  public setOnStateChange(handler: (state: TeamManagerState) => void): void {
    this.onStateChange = handler;
  }

  public setOnCursorMove(handler: (x: number, y: number) => void): void {
    this.onCursorMove = handler;
  }

  public setOnActionComplete(handler: (action: AutomationAction) => void): void {
    this.onActionComplete = handler;
  }

  private updateState(updates: Partial<TeamManagerState>): void {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // OBJECTIVE ANALYSIS
  // ───────────────────────────────────────────────────────────────────────────

  public analyzeObjective(objective: string): {
    taskType: string;
    selectedAgentIds: string[];
    generatedPrompt: string;
  } {
    const lowerObjective = objective.toLowerCase();
    const selectedAgents: string[] = [];
    
    // Task type detection
    let taskType = 'general';
    
    // Game creation
    if (lowerObjective.includes('game') || lowerObjective.includes('tetris') || 
        lowerObjective.includes('arcade') || lowerObjective.includes('play')) {
      taskType = 'game';
      selectedAgents.push(
        'agent-13',  // TheAlchemist — Blueprint
        'agent-17',  // Visualizer — UI Design
        'agent-26',  // SnippetCoder — Code generation
        'agent-28',  // CodeRefactorSuggestor — Refinement
        'agent-40',  // CodeCommenter — Documentation
      );
    }
    
    // App/Software creation
    else if (lowerObjective.includes('app') || lowerObjective.includes('application') ||
             lowerObjective.includes('software') || lowerObjective.includes('build')) {
      taskType = 'application';
      selectedAgents.push(
        'agent-13',  // TheAlchemist
        'agent-26',  // SnippetCoder
        'agent-7',   // PythonInterpreter
        'agent-35',  // API_Doc_Stubber
      );
    }
    
    // Agent creation
    else if (lowerObjective.includes('agent') || lowerObjective.includes('bot') ||
             lowerObjective.includes('assistant')) {
      taskType = 'agent';
      selectedAgents.push(
        'agent-42',  // AgentDesigner
        'agent-13',  // TheAlchemist
        'agent-15',  // PromptRefiner
      );
    }
    
    // Research
    else if (lowerObjective.includes('research') || lowerObjective.includes('analyze') ||
             lowerObjective.includes('study')) {
      taskType = 'research';
      selectedAgents.push(
        'agent-41',  // RecursiveWebCrawler
        'agent-21',  // CollectorAlpha
        'agent-23',  // ContentSummarizer
      );
    }
    
    // Default — use orchestrator
    else {
      selectedAgents.push('agent-20'); // OrchestratorAlpha
    }

    // Add always-active agents
    const alwaysActive = ['agent-49', 'agent-4', 'agent-3']; // Bug, Security, Logger
    selectedAgents.push(...alwaysActive.filter(id => !selectedAgents.includes(id)));

    // Add validation
    selectedAgents.push('val-01'); // ResponseValidatorAgent

    // Generate a refined prompt
    const generatedPrompt = this.generatePrompt(objective, taskType, selectedAgents);

    return {
      taskType,
      selectedAgentIds: selectedAgents.filter(id => this.agents.has(id)),
      generatedPrompt,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PROMPT GENERATION
  // ───────────────────────────────────────────────────────────────────────────

  private generatePrompt(objective: string, taskType: string, agentIds: string[]): string {
    const agentNames = agentIds
      .map(id => this.agents.get(id)?.name)
      .filter(Boolean)
      .slice(0, 5)
      .join(', ');

    let prompt = '';

    switch (taskType) {
      case 'game':
        prompt = `Create a complete, playable ${objective}. 

Requirements:
1. Use HTML5 Canvas for rendering
2. Implement smooth animations at 60fps
3. Add keyboard controls (arrow keys or WASD)
4. Include a scoring system
5. Add game over and restart functionality
6. Apply the requested visual theme throughout

Output Format:
- Single HTML file with embedded CSS and JavaScript
- Self-contained, no external dependencies
- Ready to run in any modern browser

Team: ${agentNames}

Begin by creating the game architecture, then implement each component.`;
        break;

      case 'application':
        prompt = `Build a complete ${objective}.

Requirements:
1. Clean, modular architecture
2. User-friendly interface
3. Error handling
4. Clear documentation

Team: ${agentNames}

Start with the application blueprint, then implement core functionality.`;
        break;

      case 'agent':
        prompt = `Design and create a new AI agent: ${objective}.

Requirements:
1. Clear role definition
2. Specific system prompt
3. Appropriate tool assignments
4. Category classification

Output: JSON agent definition with name, role, systemPrompt, tools, category.

Team: ${agentNames}`;
        break;

      case 'research':
        prompt = `Research and analyze: ${objective}.

Requirements:
1. Comprehensive information gathering
2. Multiple source verification
3. Structured summary
4. Key findings highlighted

Team: ${agentNames}`;
        break;

      default:
        prompt = `Complete the following objective: ${objective}

Analyze the request and provide a comprehensive solution.

Team: ${agentNames}`;
    }

    return prompt;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UI AUTOMATION (Simulated)
  // ───────────────────────────────────────────────────────────────────────────

  public async executeAutomation(
    objective: string,
    agentElements: Map<string, { x: number; y: number }>,
    promptInput: { x: number; y: number },
    executeButton: { x: number; y: number }
  ): Promise<void> {
    this.updateState({ isActive: true });

    // Analyze objective
    const analysis = this.analyzeObjective(objective);
    this.updateState({
      selectedAgents: analysis.selectedAgentIds,
      generatedPrompt: analysis.generatedPrompt,
    });

    // Create action queue
    const actions: AutomationAction[] = [];

    // 1. Move to each agent and click to select
    for (const agentId of analysis.selectedAgentIds) {
      const element = agentElements.get(agentId);
      if (element) {
        actions.push({
          type: 'move_cursor',
          x: element.x,
          y: element.y,
          duration: 500,
        });
        actions.push({
          type: 'click',
          x: element.x,
          y: element.y,
          delay: 100,
        });
        actions.push({
          type: 'wait',
          duration: 200,
        });
      }
    }

    // 2. Move to prompt input
    actions.push({
      type: 'move_cursor',
      x: promptInput.x,
      y: promptInput.y,
      duration: 400,
    });
    actions.push({
      type: 'click',
      x: promptInput.x,
      y: promptInput.y,
    });

    // 3. Type the generated prompt
    actions.push({
      type: 'type_text',
      text: analysis.generatedPrompt,
    });

    // 4. Move to execute button and click
    actions.push({
      type: 'move_cursor',
      x: executeButton.x,
      y: executeButton.y,
      duration: 300,
    });
    actions.push({
      type: 'click',
      x: executeButton.x,
      y: executeButton.y,
    });

    this.updateState({ actionQueue: actions });

    // Execute actions
    for (const action of actions) {
      await this.executeAction(action);
      this.onActionComplete?.(action);
    }

    this.updateState({ isActive: false });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ACTION EXECUTION
  // ───────────────────────────────────────────────────────────────────────────

  private async executeAction(action: AutomationAction): Promise<void> {
    this.updateState({ currentAction: action });

    switch (action.type) {
      case 'move_cursor':
        await this.animateCursorTo(action.x!, action.y!, action.duration || 500);
        break;

      case 'click':
        await this.sleep(action.delay || this.clickDelay);
        // Visual click feedback would be handled by the UI
        break;

      case 'type_text':
        await this.simulateTyping(action.text!);
        break;

      case 'press_key':
        // Simulate key press
        await this.sleep(100);
        break;

      case 'wait':
        await this.sleep(action.duration || 500);
        break;
    }

    this.updateState({ currentAction: undefined });
  }

  private async animateCursorTo(targetX: number, targetY: number, duration: number): Promise<void> {
    const startX = this.state.cursorPosition.x;
    const startY = this.state.cursorPosition.y;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const currentX = startX + (targetX - startX) * eased;
        const currentY = startY + (targetY - startY) * eased;

        this.state.cursorPosition = { x: currentX, y: currentY };
        this.onCursorMove?.(currentX, currentY);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  private async simulateTyping(text: string): Promise<void> {
    // In a real implementation, this would type into a focused input
    // For now, we just simulate the delay
    for (let i = 0; i < text.length; i++) {
      await this.sleep(this.typingSpeed);
      // Emit typing events could be added here
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GETTERS
  // ───────────────────────────────────────────────────────────────────────────

  public getState(): TeamManagerState {
    return this.state;
  }

  public getSelectedAgents(): Agent[] {
    return this.state.selectedAgents
      .map(id => this.agents.get(id))
      .filter((a): a is Agent => !!a);
  }

  public getGeneratedPrompt(): string {
    return this.state.generatedPrompt;
  }

  public isActive(): boolean {
    return this.state.isActive;
  }

  public updateAgents(agents: Agent[]): void {
    this.agents.clear();
    agents.forEach(a => this.agents.set(a.id, a));
  }

  public abort(): void {
    this.updateState({ isActive: false, actionQueue: [] });
  }
}

// ───────────────────────────────────────────────────────────────────────────
// SINGLETON
// ───────────────────────────────────────────────────────────────────────────

let teamManagerInstance: TeamManager | null = null;

export function getTeamManager(agents?: Agent[]): TeamManager {
  if (!teamManagerInstance && agents) {
    teamManagerInstance = new TeamManager(agents);
  }
  if (!teamManagerInstance) {
    throw new Error('TeamManager not initialized');
  }
  return teamManagerInstance;
}

export function initTeamManager(agents: Agent[]): TeamManager {
  teamManagerInstance = new TeamManager(agents);
  return teamManagerInstance;
}
