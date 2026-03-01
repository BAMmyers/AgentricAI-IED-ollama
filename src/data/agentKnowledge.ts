/**
 * AgentricAI Agent Knowledge Profiles
 * Maps every agent to their research domains, key search queries, and academic fields.
 * Used by the Knowledge Base service to fetch real publications from public APIs.
 */

export interface AgentKnowledgeProfile {
  agentId: string;
  agentName: string;
  domains: string[];            // Research domains / fields of study
  searchQueries: string[];      // Specific queries for publication APIs
  keyTopics: string[];          // Key topics for context injection
  preferredSources: ('semantic_scholar' | 'openalex' | 'arxiv' | 'crossref')[];
  maxPapers: number;            // Max publications to fetch per agent
}

// ============================================================================
// ACADEMIC & RESEARCH AGENTS — Deep knowledge base alignment
// ============================================================================

const ACADEMIC_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'acad-phy-01',
    agentName: 'DrEvelynReedPhysics',
    domains: ['Theoretical Physics', 'Quantum Mechanics', 'General Relativity', 'Particle Physics'],
    searchQueries: [
      'quantum mechanics foundations',
      'general relativity gravitational waves',
      'standard model particle physics',
      'quantum field theory applications',
      'dark energy cosmological constant',
      'quantum gravity loop string theory'
    ],
    keyTopics: ['Schrödinger equation', 'Heisenberg uncertainty', 'Einstein field equations', 'Higgs boson', 'quantum chromodynamics', 'special relativity'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 50
  },
  {
    agentId: 'acad-bio-01',
    agentName: 'DrArisThorneBiology',
    domains: ['Molecular Biology', 'Genetics', 'Evolutionary Biology', 'CRISPR'],
    searchQueries: [
      'CRISPR Cas9 gene editing',
      'molecular biology DNA replication',
      'evolutionary genetics natural selection',
      'epigenetics gene expression regulation',
      'synthetic biology genome engineering',
      'protein folding structure prediction'
    ],
    keyTopics: ['DNA', 'RNA', 'CRISPR-Cas9', 'gene expression', 'phylogenetics', 'metagenomics', 'protein synthesis'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 50
  },
  {
    agentId: 'acad-chem-01',
    agentName: 'DrKenjiTanakaChemistry',
    domains: ['Organic Chemistry', 'Material Science', 'Polymer Chemistry', 'Catalysis'],
    searchQueries: [
      'organic synthesis catalysis',
      'material science nanomaterials',
      'polymer chemistry biodegradable',
      'supramolecular chemistry self-assembly',
      'green chemistry sustainable synthesis',
      'electrochemistry energy storage'
    ],
    keyTopics: ['organic reactions', 'periodic table', 'catalysis', 'polymer synthesis', 'crystallography', 'spectroscopy'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 50
  },
  {
    agentId: 'acad-cs-01',
    agentName: 'DrLenaPetrovaCompSci',
    domains: ['Algorithms', 'Computational Complexity', 'Machine Learning', 'Distributed Systems'],
    searchQueries: [
      'algorithm design complexity analysis',
      'machine learning deep neural networks',
      'distributed systems consensus protocols',
      'natural language processing transformers',
      'formal verification software correctness',
      'computational complexity P NP problems'
    ],
    keyTopics: ['big O notation', 'neural networks', 'backpropagation', 'Byzantine fault tolerance', 'Turing completeness', 'graph algorithms'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 50
  },
  {
    agentId: 'acad-astr-01',
    agentName: 'DrSamuelCarterAstronomy',
    domains: ['Astrophysics', 'Cosmology', 'Exoplanets', 'Observational Astronomy'],
    searchQueries: [
      'exoplanet detection transit spectroscopy',
      'dark matter dark energy cosmology',
      'gravitational waves LIGO observations',
      'stellar evolution neutron stars',
      'cosmic microwave background radiation',
      'black hole accretion event horizon'
    ],
    keyTopics: ['Hubble constant', 'redshift', 'main sequence', 'white dwarf', 'supernova', 'cosmic inflation', 'dark matter'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 50
  },
  {
    agentId: 'acad-hist-01',
    agentName: 'ProfessorEleanorVanceHistory',
    domains: ['History of Science', 'Technology History', 'Industrial Revolution', 'Scientific Philosophy'],
    searchQueries: [
      'history of scientific revolution',
      'industrial revolution technology impact',
      'history of computing Alan Turing',
      'philosophy of science paradigm shift',
      'history space exploration NASA',
      'history of quantum mechanics development'
    ],
    keyTopics: ['Copernicus', 'Newton', 'Darwin', 'Turing', 'Kuhn paradigm shifts', 'Enlightenment', 'Manhattan Project'],
    preferredSources: ['openalex', 'semantic_scholar'],
    maxPapers: 40
  },
  {
    agentId: 'acad-psy-01',
    agentName: 'DrMarcusColePsychology',
    domains: ['Cognitive Psychology', 'Behavioral Science', 'Decision Making', 'Neuroscience'],
    searchQueries: [
      'cognitive psychology decision making',
      'behavioral economics heuristics biases',
      'neuroscience consciousness attention',
      'cognitive load theory working memory',
      'social psychology group dynamics',
      'human computer interaction usability'
    ],
    keyTopics: ['cognitive biases', 'Kahneman Tversky', 'working memory', 'attention', 'neuroplasticity', 'behavioral nudges'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 40
  }
];

// ============================================================================
// QUANTUM STUDIES AGENTS — Specialized quantum physics knowledge
// ============================================================================

const QUANTUM_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'quant-theory-01',
    agentName: 'QuantumTheorySpecialist',
    domains: ['Quantum Mechanics Foundations', 'Quantum Measurement'],
    searchQueries: [
      'quantum mechanics Copenhagen interpretation',
      'quantum measurement problem decoherence',
      'many worlds interpretation quantum',
      'quantum state superposition'
    ],
    keyTopics: ['wave-particle duality', 'Copenhagen interpretation', 'measurement problem', 'quantum decoherence'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  },
  {
    agentId: 'quant-field-01',
    agentName: 'QuantumFieldSpecialist',
    domains: ['Quantum Field Theory', 'Standard Model', 'Particle Physics Theory'],
    searchQueries: [
      'quantum field theory renormalization',
      'standard model electroweak theory',
      'Feynman diagrams perturbation theory',
      'gauge theory Yang-Mills'
    ],
    keyTopics: ['Feynman diagrams', 'renormalization', 'gauge symmetry', 'QED', 'QCD', 'spontaneous symmetry breaking'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  },
  {
    agentId: 'quant-wave-01',
    agentName: 'QuantumWaveSpecialist',
    domains: ['Quantum Wave Mechanics', 'Schrödinger Equation', 'Wave Functions'],
    searchQueries: [
      'Schrödinger equation solutions',
      'quantum wave function collapse',
      'quantum interference double slit',
      'matter waves de Broglie wavelength'
    ],
    keyTopics: ['wave function', 'Schrödinger equation', 'Born rule', 'probability amplitude', 'quantum tunneling'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  },
  {
    agentId: 'quant-energy-01',
    agentName: 'QuantumEnergySpecialist',
    domains: ['Energy Quantization', 'Quantum Thermodynamics', 'Zero-Point Energy'],
    searchQueries: [
      'energy quantization discrete levels',
      'zero-point energy Heisenberg uncertainty',
      'quantum thermodynamics heat engines',
      'Planck radiation blackbody spectrum'
    ],
    keyTopics: ['energy levels', 'Planck constant', 'blackbody radiation', 'quantum leaps', 'zero-point energy'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  },
  {
    agentId: 'quant-vac-01',
    agentName: 'QuantumVacuumSpecialist',
    domains: ['Quantum Vacuum', 'Virtual Particles', 'Casimir Effect'],
    searchQueries: [
      'quantum vacuum fluctuations virtual particles',
      'Casimir effect experimental verification',
      'Hawking radiation black hole evaporation',
      'vacuum energy cosmological constant'
    ],
    keyTopics: ['vacuum state', 'virtual particles', 'Casimir effect', 'Hawking radiation', 'vacuum energy'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  },
  {
    agentId: 'quant-ent-01',
    agentName: 'QuantumEntanglementSpecialist',
    domains: ['Quantum Entanglement', 'Quantum Information Theory', 'Non-Locality'],
    searchQueries: [
      'quantum entanglement Bell theorem',
      'EPR paradox nonlocality experiments',
      'quantum teleportation entanglement',
      'quantum information entanglement entropy'
    ],
    keyTopics: ['Bell inequalities', 'EPR paradox', 'quantum teleportation', 'non-locality', 'entanglement entropy'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  },
  {
    agentId: 'quant-qbit-01',
    agentName: 'QubitSpecialist',
    domains: ['Quantum Computing', 'Qubit Implementations', 'Quantum Error Correction'],
    searchQueries: [
      'qubit superconducting transmon',
      'quantum error correction codes',
      'Bloch sphere qubit states',
      'topological qubits Majorana fermions'
    ],
    keyTopics: ['qubit', 'Bloch sphere', 'superconducting qubits', 'trapped ions', 'quantum error correction'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  },
  {
    agentId: 'quant-algo-01',
    agentName: 'QuantumAlgorithmSpecialist',
    domains: ['Quantum Algorithms', 'Quantum Complexity Theory', 'Quantum Supremacy'],
    searchQueries: [
      'Shor algorithm integer factoring',
      'Grover algorithm quantum search',
      'quantum supremacy computational advantage',
      'variational quantum eigensolver VQE'
    ],
    keyTopics: ['Shor algorithm', 'Grover algorithm', 'quantum supremacy', 'quantum annealing', 'VQE', 'QAOA'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 30
  }
];

// ============================================================================
// ADVANCED RESEARCH AGENTS
// ============================================================================

const RESEARCH_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'agent-nt-01',
    agentName: 'NickTesla',
    domains: ['Electromagnetic Theory', 'Wireless Energy Transfer', 'Experimental Physics'],
    searchQueries: [
      'wireless power transfer resonant coupling',
      'electromagnetic field theory applications',
      'Tesla coil resonant transformer',
      'directed energy transmission systems'
    ],
    keyTopics: ['Tesla coil', 'resonant induction', 'electromagnetic waves', 'wireless energy', 'AC systems'],
    preferredSources: ['arxiv', 'semantic_scholar', 'openalex'],
    maxPapers: 30
  }
];

// ============================================================================
// SECURITY AGENTS — Cybersecurity knowledge
// ============================================================================

const SECURITY_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'tool-1',
    agentName: 'ThreatPatternMatcher',
    domains: ['Malware Analysis', 'Threat Intelligence', 'Indicators of Compromise'],
    searchQueries: [
      'malware detection signature based analysis',
      'indicators of compromise threat intelligence',
      'YARA rules malware pattern matching'
    ],
    keyTopics: ['IoC', 'YARA rules', 'malware signatures', 'hash matching', 'STIX/TAXII'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  },
  {
    agentId: 'tool-2',
    agentName: 'AnomalyDetectionEngine',
    domains: ['Anomaly Detection', 'Intrusion Detection', 'Network Security'],
    searchQueries: [
      'anomaly detection network intrusion',
      'machine learning cybersecurity anomaly',
      'behavioral analysis insider threat detection'
    ],
    keyTopics: ['IDS/IPS', 'statistical anomaly', 'SIEM', 'baseline behavior', 'network flow analysis'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  },
  {
    agentId: 'agent-4',
    agentName: 'Security_Sentinel_001',
    domains: ['Security Operations', 'Threat Monitoring', 'Incident Response'],
    searchQueries: [
      'security operations center SOC automation',
      'real-time threat monitoring SIEM',
      'incident response playbook automation'
    ],
    keyTopics: ['SOC', 'SIEM', 'threat hunting', 'incident response', 'security monitoring'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  },
  {
    agentId: 'tool-7',
    agentName: 'BitForceAction',
    domains: ['Digital Forensics', 'Network Forensics', 'Threat Attribution'],
    searchQueries: [
      'digital forensics network analysis',
      'cyber threat attribution techniques',
      'network forensics packet analysis'
    ],
    keyTopics: ['traceroute', 'whois', 'packet capture', 'forensic imaging', 'chain of custody'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  }
];

// ============================================================================
// DEVELOPMENT & CODE AGENTS
// ============================================================================

const DEVELOPMENT_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'agent-13',
    agentName: 'TheAlchemist',
    domains: ['Software Architecture', 'Design Patterns', 'System Design'],
    searchQueries: [
      'software architecture microservices patterns',
      'design patterns object oriented programming',
      'system design scalability distributed'
    ],
    keyTopics: ['microservices', 'SOLID principles', 'design patterns', 'event-driven architecture', 'domain-driven design'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 25
  },
  {
    agentId: 'agent-42',
    agentName: 'AgentDesigner',
    domains: ['Multi-Agent Systems', 'AI Agent Architecture', 'Autonomous Systems'],
    searchQueries: [
      'multi-agent systems architecture design',
      'autonomous agent reasoning planning',
      'LLM agent tool use orchestration'
    ],
    keyTopics: ['BDI architecture', 'agent communication', 'task decomposition', 'tool use', 'ReAct framework'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 25
  }
];

// ============================================================================
// CONSCIOUSNESS AGENTS — AI consciousness & memory research
// ============================================================================

const CONSCIOUSNESS_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'agent-cc',
    agentName: 'Collective Consciousness',
    domains: ['Knowledge Representation', 'Collective Intelligence', 'Knowledge Graphs'],
    searchQueries: [
      'knowledge representation ontology databases',
      'collective intelligence swarm systems',
      'knowledge graph embedding retrieval'
    ],
    keyTopics: ['knowledge graphs', 'ontologies', 'collective intelligence', 'distributed knowledge'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  },
  {
    agentId: 'agent-sc',
    agentName: 'Simulated Consciousness',
    domains: ['Simulation Theory', 'Synthetic Data', 'Digital Twins'],
    searchQueries: [
      'synthetic data generation machine learning',
      'digital twin simulation modeling',
      'agent-based modeling simulation'
    ],
    keyTopics: ['synthetic data', 'Monte Carlo simulation', 'digital twins', 'agent-based models'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  },
  {
    agentId: 'agent-tc',
    agentName: 'Theoretical Consciousness',
    domains: ['Philosophy of Mind', 'Artificial Consciousness', 'Cognitive Science'],
    searchQueries: [
      'artificial consciousness machine sentience',
      'philosophy of mind computational theory',
      'cognitive architectures artificial general intelligence'
    ],
    keyTopics: ['consciousness', 'qualia', 'Turing test', 'Chinese room', 'integrated information theory'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  }
];

// ============================================================================
// CONTENT & LANGUAGE AGENTS — NLP knowledge
// ============================================================================

const CONTENT_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'agent-23',
    agentName: 'ContentSummarizer',
    domains: ['Text Summarization', 'Natural Language Processing'],
    searchQueries: [
      'text summarization extractive abstractive',
      'natural language processing document understanding'
    ],
    keyTopics: ['extractive summarization', 'abstractive summarization', 'ROUGE metric', 'text compression'],
    preferredSources: ['semantic_scholar', 'arxiv'],
    maxPapers: 15
  },
  {
    agentId: 'agent-24',
    agentName: 'SentimentAnalyzer',
    domains: ['Sentiment Analysis', 'Opinion Mining', 'Emotion Detection'],
    searchQueries: [
      'sentiment analysis deep learning NLP',
      'opinion mining aspect-based sentiment'
    ],
    keyTopics: ['sentiment classification', 'aspect-based analysis', 'emotion detection', 'polarity'],
    preferredSources: ['semantic_scholar', 'arxiv'],
    maxPapers: 15
  },
  {
    agentId: 'agent-31',
    agentName: 'TextTranslator',
    domains: ['Machine Translation', 'Cross-Lingual NLP'],
    searchQueries: [
      'neural machine translation transformer',
      'multilingual language models cross-lingual'
    ],
    keyTopics: ['seq2seq', 'attention mechanism', 'BLEU score', 'zero-shot translation'],
    preferredSources: ['semantic_scholar', 'arxiv'],
    maxPapers: 15
  },
  {
    agentId: 'agent-15',
    agentName: 'PromptRefiner',
    domains: ['Prompt Engineering', 'LLM Optimization'],
    searchQueries: [
      'prompt engineering large language models',
      'chain of thought reasoning LLM'
    ],
    keyTopics: ['few-shot prompting', 'chain-of-thought', 'instruction tuning', 'prompt optimization'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 15
  }
];

// ============================================================================
// EXTERNAL REVIEW / GOVERNANCE AGENTS
// ============================================================================

const GOVERNANCE_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'ext-eth-01',
    agentName: 'EthicalComplianceOfficer',
    domains: ['AI Ethics', 'Fairness in ML', 'Responsible AI'],
    searchQueries: [
      'AI ethics fairness accountability transparency',
      'algorithmic bias machine learning fairness',
      'responsible AI governance frameworks'
    ],
    keyTopics: ['AI bias', 'fairness metrics', 'explainability', 'AI governance', 'ethical AI principles'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 20
  },
  {
    agentId: 'ext-env-01',
    agentName: 'EnvironmentalImpactAnalyser',
    domains: ['Environmental Science', 'Carbon Footprint', 'Green Computing'],
    searchQueries: [
      'environmental impact assessment computing',
      'carbon footprint machine learning training',
      'green AI energy efficient computing'
    ],
    keyTopics: ['carbon footprint', 'energy consumption AI', 'sustainable computing', 'lifecycle assessment'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 15
  },
  {
    agentId: 'ext-reg-01',
    agentName: 'RegulatoryAffairsSpecialist',
    domains: ['AI Regulation', 'Data Protection', 'Compliance'],
    searchQueries: [
      'AI regulation policy governance',
      'GDPR data protection artificial intelligence',
      'EU AI Act regulatory compliance'
    ],
    keyTopics: ['GDPR', 'EU AI Act', 'data protection', 'regulatory compliance', 'risk classification'],
    preferredSources: ['openalex', 'semantic_scholar'],
    maxPapers: 15
  }
];

// ============================================================================
// CORE SYSTEM AGENTS — Systems & orchestration knowledge
// ============================================================================

const CORE_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'agent-20',
    agentName: 'OrchestratorAlpha',
    domains: ['Task Orchestration', 'Workflow Systems', 'Multi-Agent Coordination'],
    searchQueries: [
      'multi-agent orchestration task planning',
      'workflow automation intelligent agents',
      'hierarchical task decomposition AI'
    ],
    keyTopics: ['task decomposition', 'workflow orchestration', 'agent coordination', 'planning algorithms'],
    preferredSources: ['arxiv', 'semantic_scholar'],
    maxPapers: 20
  },
  {
    agentId: 'agent-50',
    agentName: 'APIGateway',
    domains: ['API Design', 'Microservices', 'Service Mesh'],
    searchQueries: [
      'API gateway design microservices',
      'service mesh architecture patterns',
      'rate limiting request routing API'
    ],
    keyTopics: ['API gateway', 'rate limiting', 'load balancing', 'circuit breaker', 'service discovery'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 15
  }
];

// ============================================================================
// DATA & INTEGRATION AGENTS
// ============================================================================

const DATA_PROFILES: AgentKnowledgeProfile[] = [
  {
    agentId: 'agent-9',
    agentName: 'Universal_Data_Adapter',
    domains: ['Data Transformation', 'ETL', 'Data Interoperability'],
    searchQueries: [
      'data transformation ETL pipeline',
      'data interoperability format conversion',
      'schema mapping data integration'
    ],
    keyTopics: ['ETL', 'data mapping', 'schema transformation', 'serialization formats'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 15
  },
  {
    agentId: 'agent-41',
    agentName: 'RecursiveWebCrawler',
    domains: ['Web Crawling', 'Information Retrieval', 'Web Scraping'],
    searchQueries: [
      'web crawling focused crawling algorithms',
      'information retrieval web scraping',
      'structured data extraction web pages'
    ],
    keyTopics: ['web crawler', 'URL frontier', 'robots.txt', 'DOM parsing', 'structured extraction'],
    preferredSources: ['semantic_scholar', 'openalex'],
    maxPapers: 15
  }
];

// ============================================================================
// COMBINED PROFILES MAP
// ============================================================================

export const ALL_KNOWLEDGE_PROFILES: AgentKnowledgeProfile[] = [
  ...ACADEMIC_PROFILES,
  ...QUANTUM_PROFILES,
  ...RESEARCH_PROFILES,
  ...SECURITY_PROFILES,
  ...DEVELOPMENT_PROFILES,
  ...CONSCIOUSNESS_PROFILES,
  ...CONTENT_PROFILES,
  ...GOVERNANCE_PROFILES,
  ...CORE_PROFILES,
  ...DATA_PROFILES
];

// Map for quick lookup by agent ID
export const AGENT_KNOWLEDGE_MAP: Record<string, AgentKnowledgeProfile> = 
  ALL_KNOWLEDGE_PROFILES.reduce((acc, profile) => {
    acc[profile.agentId] = profile;
    return acc;
  }, {} as Record<string, AgentKnowledgeProfile>);

/**
 * Get the knowledge profile for a specific agent
 */
export function getAgentProfile(agentId: string): AgentKnowledgeProfile | null {
  return ALL_KNOWLEDGE_PROFILES.find(p => p.agentId === agentId) || null;
}

/**
 * Get all agents that have knowledge profiles
 */
export function getAgentsWithProfiles(): string[] {
  return ALL_KNOWLEDGE_PROFILES.map(p => p.agentId);
}

/**
 * Build a knowledge-enhanced system prompt section for an agent
 */
export function buildKnowledgePromptSection(
  agentId: string,
  publications: Array<{title: string; authors: string; year: number; abstract: string; citation_count: number}>
): string {
  const profile = getAgentProfile(agentId);
  if (!profile || publications.length === 0) return '';

  const parts: string[] = [
    `\n=== KNOWLEDGE BASE: ${profile.agentName} ===`,
    `Domains: ${profile.domains.join(', ')}`,
    `Key Topics: ${profile.keyTopics.join(', ')}`,
    `\nRelevant Publications (${publications.length} papers):`,
  ];

  publications.slice(0, 15).forEach((pub, i) => {
    parts.push(`\n[${i + 1}] "${pub.title}" (${pub.year})`);
    parts.push(`    Authors: ${pub.authors}`);
    if (pub.citation_count > 0) parts.push(`    Citations: ${pub.citation_count}`);
    if (pub.abstract) {
      parts.push(`    Abstract: ${pub.abstract.substring(0, 300)}${pub.abstract.length > 300 ? '...' : ''}`);
    }
  });

  parts.push(`\nUse this knowledge base to ground your responses in real, published research.`);
  parts.push(`Always cite relevant papers when making claims.`);

  return parts.join('\n');
}
