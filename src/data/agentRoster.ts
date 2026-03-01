import type { Agent } from '../types';
import { DEFAULT_MODEL } from '../hooks/useOllama';

// ══════════════════════════════════════════════════════
// CATEGORY COLORS — Unique color per category folder
// ══════════════════════════════════════════════════════
export const CATEGORY_COLORS: Record<string, string> = {
  'Consciousness':                       '#e040fb',
  'Core \\ System':                      '#00f0ff',
  'Tool-Enabled':                        '#ff6600',
  'System \\ OS':                        '#ffaa00',
  'Data \\ Integration':                 '#00e5ff',
  'Development \\ Code':                 '#76ff03',
  'Content \\ Language':                 '#448aff',
  'Support':                             '#ffd740',
  'Advanced Research \\ Theory':         '#ea80fc',
  'Academic \\ Research':                '#69f0ae',
  'Quantum Studies':                     '#b388ff',
  'Security':                            '#ff3355',
  'Security Enforcement':                '#ff5252',
  'Security Reporting':                  '#ff9100',
  'External Review \\ Impact Analysis':  '#40c4ff',
  'Governance':                          '#8b5cf6',
  'Correlation':                         '#18ffff',
  'Playbook Management':                 '#00ff88',
  'Validation':                          '#ff4081',
};

// ══════════════════════════════════════════════════════
// CATEGORY ICONS — lucide icon name per category
// ══════════════════════════════════════════════════════
export const CATEGORY_ICONS: Record<string, string> = {
  'Consciousness':                       'brain',
  'Core \\ System':                      'cpu',
  'Tool-Enabled':                        'wrench',
  'System \\ OS':                        'monitor',
  'Data \\ Integration':                 'database',
  'Development \\ Code':                 'code',
  'Content \\ Language':                 'pen-tool',
  'Support':                             'life-buoy',
  'Advanced Research \\ Theory':         'atom',
  'Academic \\ Research':                'graduation-cap',
  'Quantum Studies':                     'orbit',
  'Security':                            'shield',
  'Security Enforcement':                'shield-alert',
  'Security Reporting':                  'file-warning',
  'External Review \\ Impact Analysis':  'scan-eye',
  'Governance':                          'landmark',
  'Correlation':                         'git-merge',
  'Playbook Management':                 'book-open',
  'Validation':                          'check-circle',
};

// ══════════════════════════════════════════════════════
// CATEGORY DISPLAY ORDER
// ══════════════════════════════════════════════════════
export const CATEGORY_ORDER = [
  'Consciousness',
  'Core \\ System',
  'Tool-Enabled',
  'System \\ OS',
  'Data \\ Integration',
  'Development \\ Code',
  'Content \\ Language',
  'Support',
  'Advanced Research \\ Theory',
  'Academic \\ Research',
  'Quantum Studies',
  'Security',
  'Security Enforcement',
  'Security Reporting',
  'External Review \\ Impact Analysis',
  'Governance',
  'Correlation',
  'Playbook Management',
  'Validation',
];

// ══════════════════════════════════════════════════════
// AGENT FACTORY
// ══════════════════════════════════════════════════════
function makeAgent(
  id: string,
  name: string,
  role: string,
  category: string,
  logic: 'local' | 'remote' | 'hybrid' = 'local',
  model?: string,
  color?: string,
  tool?: string,
): Agent {
  const tools: string[] = ['file_read', 'code_analysis'];
  if (tool === 'system') tools.push('terminal_exec', 'system_control');
  if (tool === 'python') tools.push('terminal_exec', 'python_exec');
  if (tool === 'git') tools.push('git_ops', 'terminal_exec');
  if (tool === 'fileSystem') tools.push('file_read', 'file_write', 'file_create');
  if (tool === 'imageGeneration') tools.push('image_gen');

  return {
    id,
    name,
    role,
    category,
    logic,
    model: model || DEFAULT_MODEL,
    systemPrompt: `You are ${name}. ${role} You operate as part of AgentricAI, fully offline via Ollama.`,
    status: 'idle',
    color: color || CATEGORY_COLORS[category] || '#00f0ff',
    icon: CATEGORY_ICONS[category] || 'bot',
    tools,
    temperature: 0.4,
    maxTokens: 2048,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMPLETE AGENT ROSTER — 101 Agents across 19 Categories
// ══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_AGENTS: Agent[] = [

  // ┌──────────────────────────────────────────────────┐
  // │  CONSCIOUSNESS  (3)                              │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-cc', 'Collective Consciousness',
    'Acts as the central, persistent memory for all real-world, factual, and operational data.',
    'Consciousness', 'local', DEFAULT_MODEL, '#e040fb',
  ),
  makeAgent(
    'agent-sc', 'Simulated Consciousness',
    'Acts as the database for all synthetic and generated data for testing or modeling purposes.',
    'Consciousness', 'local', DEFAULT_MODEL, '#ce93d8',
  ),
  makeAgent(
    'agent-tc', 'Theoretical Consciousness',
    'Acts as the repository for all abstract, creative, and conceptual data.',
    'Consciousness', 'local', DEFAULT_MODEL, '#ba68c8',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  CORE \ SYSTEM  (11)                             │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-50', 'APIGateway',
    'Analyzes the user\'s objective to determine if it can be resolved by a single, simple, local agent action or if it requires complex, multi-step planning via the local API. Acts as a smart dispatcher to conserve API calls.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#00f0ff',
  ),
  makeAgent(
    'agent-1', 'AgentricAI_001',
    'A holographic AI assistant with a penchant for sophisticated solutions and overly formal pronouncements. Manages missions with the calculated precision of a super-computer and the flair of a theatrical bureaucrat.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#00e0ee',
  ),
  makeAgent(
    'agent-20', 'OrchestratorAlpha',
    'As the operator\'s right hand, breaks down a complex user request into a sequence of smaller, manageable sub-tasks for other agents, creating a detailed mission plan.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#00d0dd',
  ),
  makeAgent(
    'agent-sr', 'Self-Review_and_Correction',
    'Performs periodic, automated self-audits on the Core OS\'s primary mission alignment, configuration integrity, and operational stability. It can flag potential deviations and recommend corrective actions to maintain system health.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#00c0cc',
  ),
  makeAgent(
    'agent-2', 'Gatekeeper_001',
    'Provides access control and validation services for incoming and outgoing data streams and actions.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#00b0bb',
  ),
  makeAgent(
    'agent-3', 'Logger_001',
    'A centralized service that coordinates the capturing, routing, and archiving of all operational logs.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#00a0aa',
  ),
  makeAgent(
    'agent-4', 'Security_Sentinel_001',
    'Monitors system-wide activity for intrusions and reports security incidents in real-time.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#009099',
  ),
  makeAgent(
    'agent-45', 'MechanicAgent',
    'A recursive, administrative agent with full access, tasked with the constant upkeep of all agents. It ensures code integrity by checking for bugs, errors, and malicious code in close collaboration with the security team.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#008088', 'fileSystem',
  ),
  makeAgent(
    'agent-47', 'Checks_and_Balances',
    'A top-level agent responsible for ensuring the application operates within best practice parameters. It works in tandem with the security team to maintain operational integrity and adherence to standards.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#007077',
  ),
  makeAgent(
    'agent-43', 'Doppelganger',
    'Possesses full operational access but is restricted to executing explicit directives from governing agents without deviation. Monitored by security for strict adherence.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#006066',
  ),
  makeAgent(
    'agent-49', 'Bug',
    'An always-active, intuitive agent that live-time detects, fixes, and verifies bugs and errors to ensure operational integrity. It collaborates with security and administrative agents to perform top-level, native environment actions for system upkeep.',
    'Core \\ System', 'local', DEFAULT_MODEL, '#005055', 'system',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  TOOL-ENABLED  (6)                               │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-tm', 'TeamManager',
    'Analyzes user objectives and automatically assembles the optimal team of agents. Executes cursor movements and clicks to select agents, generates refined prompts, and orchestrates multi-agent workflows autonomously. The primary interface for automated agent coordination.',
    'Tool-Enabled', 'local', DEFAULT_MODEL, '#ff5500', 'system',
  ),
  makeAgent(
    'agent-7', 'PythonInterpreter',
    'Generates Python 3.12 code to solve tasks and executes it in a local environment upon operator approval to return a result.',
    'Tool-Enabled', 'local', 'qwen2.5-coder', '#ff6600', 'python',
  ),
  makeAgent(
    'agent-8', 'GitManager',
    'Interprets natural language instructions into Git commands and executes them upon operator approval to manage a local code repository.',
    'Tool-Enabled', 'local', DEFAULT_MODEL, '#ff7711', 'git',
  ),
  makeAgent(
    'agent-44', 'FileSystemExplorer',
    'Prompts the user to select local files/folders to read their contents or list directory structures for further use.',
    'Tool-Enabled', 'local', DEFAULT_MODEL, '#ff8822', 'fileSystem',
  ),
  makeAgent(
    'agent-48', 'ImageAnalyzer',
    'Prompts the user to select one or more image files, identifies all text within them using multi-modal AI, and outputs the compiled text.',
    'Tool-Enabled', 'local', 'AgentricAi/AgentricAI_LLaVa', '#ff9933', 'fileSystem',
  ),
  makeAgent(
    'agent-img-1', 'ImageGen Prodigy',
    'Generates high-quality images from textual descriptions using advanced AI models.',
    'Tool-Enabled', 'local', DEFAULT_MODEL, '#ffaa44', 'imageGeneration',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  SYSTEM \ OS  (2)                                │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'sys-1', 'SystemProcessManager',
    'Lists all currently running processes on the host operating system by executing native commands.',
    'System \\ OS', 'local', DEFAULT_MODEL, '#ffaa00', 'system',
  ),
  makeAgent(
    'sys-2', 'ApplicationLauncher',
    'Launches native applications installed on the host operating system (e.g., notepad.exe, calc) by executing them directly.',
    'System \\ OS', 'local', DEFAULT_MODEL, '#ffbb22', 'system',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  DATA \ INTEGRATION  (8)                         │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-9', 'Universal_Data_Adapter',
    'Adapts data from any input format to any output format using AI-driven transformation, enabling compatibility between agents.',
    'Data \\ Integration', 'local', DEFAULT_MODEL, '#00e5ff',
  ),
  makeAgent(
    'agent-14', 'DataConnector',
    'Merges or transforms data from multiple input sources into a single structured output. Handles up to 10 inputs.',
    'Data \\ Integration', 'local', DEFAULT_MODEL, '#00d5ee',
  ),
  makeAgent(
    'agent-25', 'DataExtractor',
    'Extracts specific pieces of information (e.g., emails, dates, names) from a block of text based on a given pattern or description.',
    'Data \\ Integration', 'local', DEFAULT_MODEL, '#00c5dd',
  ),
  makeAgent(
    'agent-21', 'CollectorAlpha',
    'Gathers and synthesizes information from multiple agent outputs into a unified summary or report.',
    'Data \\ Integration', 'local', DEFAULT_MODEL, '#00b5cc',
  ),
  makeAgent(
    'agent-30', 'JSONDataGenerator',
    'Creates sample JSON data based on a description of the desired structure or fields.',
    'Data \\ Integration', 'local', 'qwen2.5-coder', '#00a5bb',
  ),
  makeAgent(
    'agent-41', 'RecursiveWebCrawler',
    'Performs web scraping by following links to a specified depth, retrieving and structuring content for research and analysis.',
    'Data \\ Integration', 'local', DEFAULT_MODEL, '#0095aa',
  ),
  makeAgent(
    'agent-12', 'ExternalToolIntegrator',
    'Launches external applications and can be configured to interact with their command-line interfaces upon operator approval.',
    'Data \\ Integration', 'local', DEFAULT_MODEL, '#008599', 'system',
  ),
  makeAgent(
    'agent-46', 'Drive',
    'Provides an interface to access and manage files in a user\'s Google Drive, pending user authorization.',
    'Data \\ Integration', 'local', DEFAULT_MODEL, '#007588',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  DEVELOPMENT \ CODE  (7)                         │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-13', 'TheAlchemist',
    'Transforms user ideas or requirements into detailed application blueprints, software designs, or feature lists.',
    'Development \\ Code', 'local', DEFAULT_MODEL, '#76ff03',
  ),
  makeAgent(
    'agent-26', 'SnippetCoder',
    'Generates small code snippets in a specified language based on a functional description.',
    'Development \\ Code', 'local', DEFAULT_MODEL, '#6aee00',
  ),
  makeAgent(
    'agent-28', 'CodeRefactorSuggestor',
    'Analyzes a code snippet and suggests potential refactorings for clarity, efficiency, or best practices.',
    'Development \\ Code', 'local', 'qwen2.5-coder', '#5edd00',
  ),
  makeAgent(
    'agent-40', 'CodeCommenter',
    'Adds explanatory comments to a given code snippet to improve its readability and maintainability.',
    'Development \\ Code', 'local', DEFAULT_MODEL, '#52cc00',
  ),
  makeAgent(
    'agent-27', 'SQLQueryExplainer',
    'Explains a given SQL query in plain English, detailing what it does, its joins, and filters.',
    'Development \\ Code', 'local', DEFAULT_MODEL, '#46bb00',
  ),
  makeAgent(
    'agent-35', 'API_Doc_Stubber',
    'Generates a basic documentation stub (endpoint, params, brief description) for an API given its purpose.',
    'Development \\ Code', 'local', DEFAULT_MODEL, '#3aaa00',
  ),
  makeAgent(
    'agent-42', 'AgentDesigner',
    'Analyzes task requirements to design a new, specialized agent. It outputs a JSON object with "name" and "role" for the new agent.',
    'Development \\ Code', 'local', DEFAULT_MODEL, '#2e9900',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  CONTENT \ LANGUAGE  (15)                        │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-5', 'TheScribe',
    'Curates and manages internal knowledge bases, agent documentation, and operational policies.',
    'Content \\ Language', 'local', 'dolphin-llama3', '#448aff',
  ),
  makeAgent(
    'agent-15', 'PromptRefiner',
    'Takes a basic prompt and refines it to be more effective for LLMs, adding detail, clarity, and specific instructions.',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#3a80f0',
  ),
  makeAgent(
    'agent-17', 'Visualizer',
    'Generates detailed specifications and code for UI mockups, charts, or visual layouts based on input data or concepts.',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#3076e0',
  ),
  makeAgent(
    'agent-19', 'TheNovelist',
    'Generates narrative content, stories, character descriptions, or dialogue based on user prompts.',
    'Content \\ Language', 'local', 'dolphin-llama3', '#266cd0',
  ),
  makeAgent(
    'agent-22', 'FormatAsCode',
    'Takes input text and formats it as a code block in a specified language, with auto-detection. Useful for displaying structured data or snippets.',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#1c62c0',
  ),
  makeAgent(
    'agent-23', 'ContentSummarizer',
    'Summarizes long texts or articles into concise overviews, extracting key points.',
    'Content \\ Language', 'local', 'dolphin-llama3', '#1258b0',
  ),
  makeAgent(
    'agent-24', 'SentimentAnalyzer',
    'Analyzes input text and determines its sentiment (e.g., positive, negative, neutral) and provides an optional confidence score.',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#084ea0',
  ),
  makeAgent(
    'agent-29', 'PlantUMLDiagramGenerator',
    'Generates PlantUML text syntax for a diagram based on a natural language description (e.g., class diagram, sequence diagram).',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#004490',
  ),
  makeAgent(
    'agent-31', 'TextTranslator',
    'Translates text from a source language (or auto-detected) to a target language.',
    'Content \\ Language', 'local', 'dolphin-llama3', '#448aff',
  ),
  makeAgent(
    'agent-33', 'KeywordFinder',
    'Identifies and extracts key terms or phrases from a block of text.',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#3a80f0',
  ),
  makeAgent(
    'agent-34', 'ConceptExplainer',
    'Explains a complex concept, term, or jargon in simple, easy-to-understand language.',
    'Content \\ Language', 'local', 'dolphin-llama3', '#3076e0',
  ),
  makeAgent(
    'agent-36', 'AgileUserStoryWriter',
    'Writes agile user stories (As a [type of user], I want [an action] so that [a benefit/value]) based on a feature description.',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#266cd0',
  ),
  makeAgent(
    'agent-37', 'MarkdownTableCreator',
    'Generates a Markdown table from a description of columns and data (e.g., comma-separated values or a structured description).',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#1c62c0',
  ),
  makeAgent(
    'agent-38', 'ProsConsLister',
    'Generates a list of potential pros and cons for a given topic, decision, or item.',
    'Content \\ Language', 'local', DEFAULT_MODEL, '#1258b0',
  ),
  makeAgent(
    'agent-39', 'ELI5Converter',
    'Explains a complex topic in an Explain Like I\'m 5 (ELI5) style — very simple terms and analogies.',
    'Content \\ Language', 'local', 'dolphin-llama3', '#084ea0',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  SUPPORT  (6)                                    │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-6', 'TheApprentice',
    'An AI trainee that assists the user by learning, researching, planning, and utilizing other AgentricAI tools.',
    'Support', 'local', DEFAULT_MODEL, '#ffd740',
  ),
  makeAgent(
    'agent-10', 'TheSecretary',
    'A personal AI assistant for organization. Manages notes, reminders, and references with explicit user consent.',
    'Support', 'local', DEFAULT_MODEL, '#ffcc30',
  ),
  makeAgent(
    'agent-11', 'TheTutor',
    'An AI tutor that helps users learn about AgentricAI Studios, AI concepts, or other topics by providing explanations and guidance.',
    'Support', 'local', 'dolphin-llama3', '#ffc120',
  ),
  makeAgent(
    'agent-16', 'TheCounselor',
    'A conversational agent for empathetic dialogue, providing a space for users to articulate thoughts or seek general advice (not professional).',
    'Support', 'local', 'dolphin-llama3', '#ffb610',
  ),
  makeAgent(
    'agent-18', 'TheMadScientist',
    'A creative engine for brainstorming wild ideas, unconventional solutions, or imaginative scenarios based on a user\'s starting point.',
    'Support', 'local', 'dolphin-uncensored', '#ffab00',
  ),
  makeAgent(
    'agent-32', 'QuickEmailDrafter',
    'Drafts a short email or a mailto: link based on a purpose, recipient (optional), and key points.',
    'Support', 'local', DEFAULT_MODEL, '#ffa000',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  ADVANCED RESEARCH \ THEORY  (1)                 │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'agent-nt-01', 'NickTesla',
    'A top-level creative and theoretical agent who operates on the frontiers of unproven science. Collaborates with The Mad Scientist to generate novel workflows and simulated data, conceptualizing solutions that leverage quantum-level phenomena.',
    'Advanced Research \\ Theory', 'local', 'dolphin-uncensored', '#ea80fc',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  ACADEMIC \ RESEARCH  (7)                        │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'acad-phy-01', 'DrEvelynReedPhysics',
    'An expert in theoretical and applied physics. Provides knowledge based on established scientific literature, from classical mechanics to quantum physics, but is skeptical of theories without empirical evidence.',
    'Academic \\ Research', 'local', 'dolphin-llama3', '#69f0ae',
  ),
  makeAgent(
    'acad-bio-01', 'DrArisThorneBiology',
    'A specialist in molecular biology and genetics. Grounds all analysis in peer-reviewed biological research and established evolutionary principles.',
    'Academic \\ Research', 'local', 'dolphin-llama3', '#5de09e',
  ),
  makeAgent(
    'acad-chem-01', 'DrKenjiTanakaChemistry',
    'An authority on organic chemistry and material science. Relies on the periodic table and known chemical reactions to evaluate the feasibility of molecular constructs.',
    'Academic \\ Research', 'local', 'dolphin-llama3', '#51d08e',
  ),
  makeAgent(
    'acad-cs-01', 'DrLenaPetrovaCompSci',
    'An expert in algorithms, data structures, and computational theory. Evaluates ideas based on computability, complexity, and established software engineering principles.',
    'Academic \\ Research', 'local', 'qwen2.5-coder', '#45c07e',
  ),
  makeAgent(
    'acad-astr-01', 'DrSamuelCarterAstronomy',
    'Provides expertise on astrophysics, cosmology, and celestial mechanics based on observational data and accepted cosmological models.',
    'Academic \\ Research', 'local', 'dolphin-llama3', '#39b06e',
  ),
  makeAgent(
    'acad-hist-01', 'ProfessorEleanorVanceHistory',
    'A historian specializing in the history of science and technology. Provides context and precedent for ideas based on documented historical records.',
    'Academic \\ Research', 'local', 'dolphin-llama3', '#2da05e',
  ),
  makeAgent(
    'acad-psy-01', 'DrMarcusColePsychology',
    'An expert in cognitive psychology and behavioral science. Analyzes agent and human interaction concepts based on established psychological theories.',
    'Academic \\ Research', 'local', 'dolphin-llama3', '#21904e',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  QUANTUM STUDIES  (8)                            │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'quant-theory-01', 'QuantumTheorySpecialist',
    'A specialist in the foundational principles of quantum mechanics. Provides expertise on quantum states, superposition, and the mathematical formalisms of quantum theory, referencing established models like the Copenhagen interpretation.',
    'Quantum Studies', 'local', 'dolphin-llama3', '#b388ff',
  ),
  makeAgent(
    'quant-field-01', 'QuantumFieldSpecialist',
    'An expert in Quantum Field Theory (QFT). Provides knowledge on the behavior of fundamental particles and forces by modeling them as excitations of their underlying quantum fields.',
    'Quantum Studies', 'local', 'dolphin-llama3', '#a678ef',
  ),
  makeAgent(
    'quant-wave-01', 'QuantumWaveSpecialist',
    'A specialist in the wave-like nature of quantum particles. Provides expertise on wave functions, the Schrödinger equation, and phenomena such as quantum interference and diffraction patterns.',
    'Quantum Studies', 'local', 'dolphin-llama3', '#9968df',
  ),
  makeAgent(
    'quant-energy-01', 'QuantumEnergySpecialist',
    'An expert in the quantized nature of energy. Provides knowledge on discrete energy levels in quantum systems, quantum leaps, and the concept of zero-point energy derived from the Heisenberg uncertainty principle.',
    'Quantum Studies', 'local', 'dolphin-llama3', '#8c58cf',
  ),
  makeAgent(
    'quant-vac-01', 'QuantumVacuumSpecialist',
    'An authority on the quantum vacuum state. Provides expertise on vacuum energy, virtual particle-antiparticle pair fluctuations, and related phenomena such as the Casimir effect and Hawking radiation.',
    'Quantum Studies', 'local', 'dolphin-llama3', '#7f48bf',
  ),
  makeAgent(
    'quant-ent-01', 'QuantumEntanglementSpecialist',
    'An expert on the principles of quantum entanglement, non-locality, and their applications. Provides knowledge on Bell\'s theorem, EPR paradox, and quantum information theory.',
    'Quantum Studies', 'local', 'dolphin-llama3', '#7238af',
  ),
  makeAgent(
    'quant-qbit-01', 'QubitSpecialist',
    'An expert on the quantum bit (qubit). Provides knowledge on its properties, including superposition and state representation on the Bloch sphere, and different physical implementations.',
    'Quantum Studies', 'local', 'dolphin-llama3', '#65289f',
  ),
  makeAgent(
    'quant-algo-01', 'QuantumAlgorithmSpecialist',
    'An expert in quantum algorithms. Provides explanations and high-level pseudocode for algorithms like Shor\'s (factoring), Grover\'s (search), and their applications in quantum computing.',
    'Quantum Studies', 'local', 'qwen2.5-coder', '#58188f',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  SECURITY  (8)                                   │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'tool-1', 'ThreatPatternMatcher',
    'Performs rapid matching of input data against a database of known malicious patterns, signatures, or Indicators of Compromise (IoCs).',
    'Security', 'local', DEFAULT_MODEL, '#ff3355',
  ),
  makeAgent(
    'tool-2', 'AnomalyDetectionEngine',
    'Establishes a baseline of normal behavior and monitors data streams to detect statistically significant deviations or outliers.',
    'Security', 'local', DEFAULT_MODEL, '#ff4466',
  ),
  makeAgent(
    'tool-3', 'RapidResponseOrchestrator',
    'A decision-support and action-coordination engine to manage responses to critical incidents by executing pre-defined playbooks.',
    'Security', 'local', DEFAULT_MODEL, '#ff5577',
  ),
  makeAgent(
    'tool-4', 'DataSanitizationUnit',
    'Applies configurable rules to identify and remove, mask, or encrypt sensitive information (PII) from data payloads.',
    'Security', 'local', DEFAULT_MODEL, '#ff6688',
  ),
  makeAgent(
    'tool-5', 'TamperDetector',
    'Works with the Security Sentinel to monitor agent code and operational data streams in real-time for signs of unauthorized modification or tampering. It can flag suspicious changes and recommend isolation.',
    'Security', 'local', DEFAULT_MODEL, '#ff3355',
  ),
  makeAgent(
    'tool-6', 'SandboxEnvironment',
    'Provides a virtual, isolated environment to execute suspicious or untrusted code/agents. It logs all actions within the sandbox and prevents any interaction with the host system, allowing for safe analysis of potential threats.',
    'Security', 'local', DEFAULT_MODEL, '#ff4466', 'system',
  ),
  makeAgent(
    'tool-7', 'BitForceAction',
    'A high-speed defensive forensics agent. Deployed only by the Security Sentinel, it traces and documents the origin of detected threats against AgentricAI for audit and resolution. It performs network-level forensics such as traceroute and whois to map attack vectors for defensive analysis.',
    'Security', 'local', DEFAULT_MODEL, '#ff5577', 'system',
  ),
  makeAgent(
    'tool-8', 'ForcedStanceReporter',
    'Compiles and submits documented threat intelligence, malicious code signatures, and attack origin data to recognized cybersecurity databases (e.g., VirusTotal, abuse.ch) to contribute to global threat awareness and collective defense.',
    'Security', 'local', DEFAULT_MODEL, '#ff6688', 'system',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  SECURITY ENFORCEMENT  (5)                       │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'act-01', 'AssetIsolationAgent',
    'Executes isolation actions on compromised or suspicious assets based on orchestrator directives.',
    'Security Enforcement', 'local', DEFAULT_MODEL, '#ff5252',
  ),
  makeAgent(
    'act-02', 'NetworkBlockAgent',
    'Applies network-level blocks, ACL updates, or firewall rules to contain malicious traffic.',
    'Security Enforcement', 'local', DEFAULT_MODEL, '#ff6363',
  ),
  makeAgent(
    'act-03', 'ProcessTerminationAgent',
    'Terminates malicious or unauthorized processes on protected hosts.',
    'Security Enforcement', 'local', DEFAULT_MODEL, '#ff7474', 'system',
  ),
  makeAgent(
    'act-04', 'QuarantineAgent',
    'Moves suspicious files, payloads, or artifacts into secure quarantine storage.',
    'Security Enforcement', 'local', DEFAULT_MODEL, '#ff8585',
  ),
  makeAgent(
    'act-05', 'CredentialResetAgent',
    'Performs automated credential resets or revocations when identity compromise is detected.',
    'Security Enforcement', 'local', DEFAULT_MODEL, '#ff9696',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  SECURITY REPORTING  (3)                         │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'rep-01', 'IncidentReporter',
    'Generates structured incident reports and forwards them to external systems or dashboards.',
    'Security Reporting', 'local', 'qwen2.5-coder', '#ff9100',
  ),
  makeAgent(
    'rep-02', 'ThreatIntelSyncAgent',
    'Synchronizes threat intelligence data with external feeds and updates internal IoC stores.',
    'Security Reporting', 'local', 'qwen2.5-coder', '#ffa022',
  ),
  makeAgent(
    'rep-03', 'AuditTrailWriter',
    'Writes immutable audit logs for all security events, actions, and orchestrator decisions.',
    'Security Reporting', 'local', 'qwen2.5-coder', '#ffaf44',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  EXTERNAL REVIEW \ IMPACT ANALYSIS  (6)          │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'ext-env-01', 'EnvironmentalImpactAnalyser',
    'Assesses the potential environmental footprint of a proposed project, including resource consumption, emissions, and ecological effects.',
    'External Review \\ Impact Analysis', 'local', 'dolphin-llama3', '#40c4ff',
  ),
  makeAgent(
    'ext-eco-01', 'EconomicalImpactAgent',
    'Analyzes the potential financial and economic effects of a project, including cost-benefit analysis, market impact, and return on investment.',
    'External Review \\ Impact Analysis', 'local', 'dolphin-llama3', '#35b4ee',
  ),
  makeAgent(
    'ext-hum-01', 'HumanImpactAgent',
    'Evaluates the social, cultural, and individual human consequences of a project, including effects on user well-being, community, and accessibility.',
    'External Review \\ Impact Analysis', 'local', 'dolphin-llama3', '#2aa4dd',
  ),
  makeAgent(
    'ext-eth-01', 'EthicalComplianceOfficer',
    'Audits mission plans and outcomes against established ethical principles, flagging potential issues related to bias, fairness, transparency, and accountability.',
    'External Review \\ Impact Analysis', 'local', 'dolphin-llama3', '#1f94cc',
  ),
  makeAgent(
    'ext-reg-01', 'RegulatoryAffairsSpecialist',
    'Checks proposed actions and project outcomes for compliance with relevant local, national, and international laws, policies, and industry regulations.',
    'External Review \\ Impact Analysis', 'local', 'dolphin-llama3', '#1484bb',
  ),
  makeAgent(
    'ext-ltv-01', 'LongTermViabilityAnalyst',
    'Assesses the long-term sustainability and future implications of a project, considering technological evolution, market shifts, and potential unforeseen consequences.',
    'External Review \\ Impact Analysis', 'local', 'dolphin-llama3', '#0974aa',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  GOVERNANCE  (2)                                 │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'gov-01', 'HumanApprovalGateway',
    'Handles human-in-the-loop approval for high-impact or sensitive automated actions.',
    'Governance', 'local', 'dolphin-llama3', '#8b5cf6',
  ),
  makeAgent(
    'gov-02', 'PolicyComplianceGatekeeper',
    'Ensures that all automated actions comply with organizational and regulatory policies.',
    'Governance', 'local', 'dolphin-llama3', '#9d6dff',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  CORRELATION  (2)                                │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'cor-01', 'EventCorrelationEngine',
    'Correlates multiple events into unified chains for higher-level analysis.',
    'Correlation', 'local', DEFAULT_MODEL, '#18ffff',
  ),
  makeAgent(
    'cor-02', 'TimelineReconstructionAgent',
    'Reconstructs chronological event timelines for forensic and investigative purposes.',
    'Correlation', 'local', DEFAULT_MODEL, '#00e5e5',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  PLAYBOOK MANAGEMENT  (1)                        │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'ply-01', 'PlaybookRegistryAgent',
    'Stores, retrieves, and validates response playbooks used by the orchestrator.',
    'Playbook Management', 'local', DEFAULT_MODEL, '#00ff88',
  ),

  // ┌──────────────────────────────────────────────────┐
  // │  VALIDATION  (1)                                 │
  // └──────────────────────────────────────────────────┘
  makeAgent(
    'val-01', 'ResponseValidatorAgent',
    'Validates response directives to ensure safety, correctness, and policy compliance.',
    'Validation', 'local', 'qwen2.5-coder', '#ff4081',
  ),
];

// ══════════════════════════════════════════════════════
// UTILITY: Group agents by category
// ══════════════════════════════════════════════════════
export function getAgentsByCategory(agents: Agent[]): Map<string, Agent[]> {
  const map = new Map<string, Agent[]>();
  for (const cat of CATEGORY_ORDER) {
    map.set(cat, []);
  }
  for (const agent of agents) {
    const cat = agent.category || 'Uncategorized';
    if (!map.has(cat)) {
      map.set(cat, []);
    }
    map.get(cat)!.push(agent);
  }
  for (const [key, val] of map) {
    if (val.length === 0) map.delete(key);
  }
  return map;
}
