/**
 * AgentricAI Knowledge Base Service
 * Fetches real publications from public academic APIs (no API keys required):
 *   - Semantic Scholar (api.semanticscholar.org)
 *   - OpenAlex (api.openalex.org)
 *   - arXiv (export.arxiv.org)
 *
 * Stores everything in SQLite for offline access after first fetch.
 */

import { getDatabase, saveDatabase } from '../db/database';
import { getAgentProfile, ALL_KNOWLEDGE_PROFILES } from '../data/agentKnowledge';

// ============================================================================
// TYPES
// ============================================================================

export interface Publication {
  id: number;
  agent_id: string;
  external_id: string;
  title: string;
  authors: string;
  abstract: string;
  year: number;
  venue: string;
  doi: string | null;
  url: string;
  citation_count: number;
  source: 'semantic_scholar' | 'openalex' | 'arxiv' | 'crossref';
  fetched_at: string;
}

export interface FetchProgress {
  agentId: string;
  agentName: string;
  status: 'pending' | 'fetching' | 'done' | 'error';
  fetched: number;
  total: number;
  error?: string;
}

// ============================================================================
// DATABASE TABLE SETUP
// ============================================================================

export function ensurePublicationsTable(): void {
  const db = getDatabase();
  if (!db) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      external_id TEXT NOT NULL,
      title TEXT NOT NULL,
      authors TEXT NOT NULL DEFAULT '',
      abstract TEXT DEFAULT '',
      year INTEGER DEFAULT 0,
      venue TEXT DEFAULT '',
      doi TEXT,
      url TEXT DEFAULT '',
      citation_count INTEGER DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'semantic_scholar',
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(agent_id, external_id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_pub_agent ON publications(agent_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_pub_source ON publications(source)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_pub_year ON publications(year)`);

  saveDatabase();
}

// ============================================================================
// SEMANTIC SCHOLAR API
// ============================================================================

async function fetchFromSemanticScholar(
  query: string,
  limit: number = 10
): Promise<Partial<Publication>[]> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,abstract,year,venue,citationCount,externalIds,url`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited — wait and retry once
      await new Promise(r => setTimeout(r, 3000));
      const retry = await fetch(url);
      if (!retry.ok) throw new Error(`Semantic Scholar rate limited: ${retry.status}`);
      const data = await retry.json();
      return mapSemanticScholarResults(data);
    }
    throw new Error(`Semantic Scholar error: ${response.status}`);
  }

  const data = await response.json();
  return mapSemanticScholarResults(data);
}

function mapSemanticScholarResults(data: { data?: Array<Record<string, unknown>> }): Partial<Publication>[] {
  if (!data.data) return [];

  return data.data.map((paper: Record<string, unknown>) => {
    const authors = Array.isArray(paper.authors)
      ? (paper.authors as Array<{ name?: string }>).map(a => a.name || '').filter(Boolean).join(', ')
      : '';
    const externalIds = paper.externalIds as Record<string, string> | undefined;

    return {
      external_id: `ss-${paper.paperId || Math.random().toString(36).substring(7)}`,
      title: (paper.title as string) || 'Untitled',
      authors,
      abstract: (paper.abstract as string) || '',
      year: (paper.year as number) || 0,
      venue: (paper.venue as string) || '',
      doi: externalIds?.DOI || null,
      url: (paper.url as string) || '',
      citation_count: (paper.citationCount as number) || 0,
      source: 'semantic_scholar' as const
    };
  });
}

// ============================================================================
// OPENALEX API
// ============================================================================

async function fetchFromOpenAlex(
  query: string,
  limit: number = 10
): Promise<Partial<Publication>[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${limit}&sort=cited_by_count:desc&mailto=agentric@localhost`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`OpenAlex error: ${response.status}`);

  const data = await response.json();
  if (!data.results) return [];

  return data.results.map((work: Record<string, unknown>) => {
    const authorships = Array.isArray(work.authorships)
      ? (work.authorships as Array<{ author?: { display_name?: string } }>)
          .map(a => a.author?.display_name || '')
          .filter(Boolean)
          .slice(0, 10)
          .join(', ')
      : '';

    const ids = work.ids as Record<string, string> | undefined;
    const biblio = work.biblio as Record<string, string> | undefined;
    const primaryLocation = work.primary_location as Record<string, unknown> | undefined;
    const source = primaryLocation?.source as Record<string, string> | undefined;

    return {
      external_id: `oa-${(work.id as string || '').replace('https://openalex.org/', '')}`,
      title: (work.display_name as string) || (work.title as string) || 'Untitled',
      authors: authorships,
      abstract: '', // OpenAlex doesn't always return full abstracts
      year: (work.publication_year as number) || 0,
      venue: source?.display_name || biblio?.journal || '',
      doi: ids?.doi || (work.doi as string) || null,
      url: (work.id as string) || '',
      citation_count: (work.cited_by_count as number) || 0,
      source: 'openalex' as const
    };
  });
}

// ============================================================================
// ARXIV API
// ============================================================================

async function fetchFromArxiv(
  query: string,
  limit: number = 10
): Promise<Partial<Publication>[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=relevance&sortOrder=descending`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`arXiv error: ${response.status}`);

  const text = await response.text();
  return parseArxivXml(text);
}

function parseArxivXml(xml: string): Partial<Publication>[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const entries = doc.querySelectorAll('entry');

  const results: Partial<Publication>[] = [];

  entries.forEach(entry => {
    const id = entry.querySelector('id')?.textContent || '';
    const title = (entry.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
    const summary = (entry.querySelector('summary')?.textContent || '').replace(/\s+/g, ' ').trim();
    const published = entry.querySelector('published')?.textContent || '';
    const year = published ? new Date(published).getFullYear() : 0;

    const authorElements = entry.querySelectorAll('author name');
    const authors: string[] = [];
    authorElements.forEach(a => {
      if (a.textContent) authors.push(a.textContent);
    });

    // Extract arXiv ID
    const arxivId = id.replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '');

    // Find DOI link
    const links = entry.querySelectorAll('link');
    let doi: string | null = null;
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('doi.org')) {
        doi = href.replace('http://dx.doi.org/', '').replace('https://doi.org/', '');
      }
    });

    results.push({
      external_id: `arxiv-${arxivId}`,
      title,
      authors: authors.slice(0, 10).join(', '),
      abstract: summary,
      year,
      venue: 'arXiv',
      doi,
      url: id,
      citation_count: 0,
      source: 'arxiv' as const
    });
  });

  return results;
}

// ============================================================================
// STORAGE — Save/Load from SQLite
// ============================================================================

function savePublications(agentId: string, pubs: Partial<Publication>[]): number {
  const db = getDatabase();
  if (!db) return 0;

  let saved = 0;
  for (const pub of pubs) {
    try {
      db.run(`
        INSERT INTO publications (agent_id, external_id, title, authors, abstract, year, venue, doi, url, citation_count, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(agent_id, external_id) DO UPDATE SET
          citation_count = excluded.citation_count,
          fetched_at = CURRENT_TIMESTAMP
      `, [
        agentId,
        pub.external_id || `gen-${Math.random().toString(36).substring(7)}`,
        pub.title || 'Untitled',
        pub.authors || '',
        pub.abstract || '',
        pub.year || 0,
        pub.venue || '',
        pub.doi || null,
        pub.url || '',
        pub.citation_count || 0,
        pub.source || 'semantic_scholar'
      ]);
      saved++;
    } catch {
      // Skip duplicate or invalid entries
    }
  }

  saveDatabase();
  return saved;
}

export function getAgentPublications(agentId: string, limit: number = 100): Publication[] {
  const db = getDatabase();
  if (!db) return [];

  const result = db.exec(`
    SELECT * FROM publications
    WHERE agent_id = ?
    ORDER BY citation_count DESC, year DESC
    LIMIT ?
  `, [agentId, limit]);

  if (result.length === 0) return [];

  return result[0].values.map(row =>
    Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
  ) as unknown as Publication[];
}

export function getAgentPublicationCount(agentId: string): number {
  const db = getDatabase();
  if (!db) return 0;

  const result = db.exec(`SELECT COUNT(*) FROM publications WHERE agent_id = ?`, [agentId]);
  if (result.length === 0) return 0;
  return result[0].values[0][0] as number;
}

export function getAllPublicationStats(): Array<{agent_id: string; count: number; sources: string}> {
  const db = getDatabase();
  if (!db) return [];

  const result = db.exec(`
    SELECT agent_id, COUNT(*) as count, GROUP_CONCAT(DISTINCT source) as sources
    FROM publications
    GROUP BY agent_id
    ORDER BY count DESC
  `);

  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    agent_id: row[0] as string,
    count: row[1] as number,
    sources: row[2] as string
  }));
}

export function searchPublications(query: string, agentId?: string): Publication[] {
  const db = getDatabase();
  if (!db) return [];

  let sql = `SELECT * FROM publications WHERE (title LIKE ? OR authors LIKE ? OR abstract LIKE ?)`;
  const params: (string | number)[] = [`%${query}%`, `%${query}%`, `%${query}%`];

  if (agentId) {
    sql += ` AND agent_id = ?`;
    params.push(agentId);
  }

  sql += ` ORDER BY citation_count DESC LIMIT 50`;

  const result = db.exec(sql, params);
  if (result.length === 0) return [];

  return result[0].values.map(row =>
    Object.fromEntries(result[0].columns.map((col, i) => [col, row[i]]))
  ) as unknown as Publication[];
}

export function getTotalPublicationCount(): number {
  const db = getDatabase();
  if (!db) return 0;

  const result = db.exec(`SELECT COUNT(*) FROM publications`);
  if (result.length === 0) return 0;
  return result[0].values[0][0] as number;
}

// ============================================================================
// FETCH ORCHESTRATOR — Populates an agent's knowledge base
// ============================================================================

export async function populateAgentKnowledge(
  agentId: string,
  onProgress?: (progress: FetchProgress) => void
): Promise<{ total: number; errors: string[] }> {
  const profile = getAgentProfile(agentId);
  if (!profile) {
    return { total: 0, errors: [`No knowledge profile found for agent: ${agentId}`] };
  }

  ensurePublicationsTable();

  const progress: FetchProgress = {
    agentId,
    agentName: profile.agentName,
    status: 'fetching',
    fetched: 0,
    total: profile.searchQueries.length
  };

  onProgress?.(progress);

  let totalSaved = 0;
  const errors: string[] = [];
  const perQueryLimit = Math.ceil(profile.maxPapers / profile.searchQueries.length);

  for (let i = 0; i < profile.searchQueries.length; i++) {
    const query = profile.searchQueries[i];
    progress.fetched = i;
    onProgress?.(progress);

    for (const source of profile.preferredSources) {
      try {
        let pubs: Partial<Publication>[] = [];

        switch (source) {
          case 'semantic_scholar':
            pubs = await fetchFromSemanticScholar(query, perQueryLimit);
            break;
          case 'openalex':
            pubs = await fetchFromOpenAlex(query, perQueryLimit);
            break;
          case 'arxiv':
            pubs = await fetchFromArxiv(query, perQueryLimit);
            break;
        }

        const saved = savePublications(agentId, pubs);
        totalSaved += saved;

        // Rate limiting: small delay between API calls
        await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        const msg = `${profile.agentName} [${source}] "${query}": ${err instanceof Error ? err.message : 'Unknown error'}`;
        errors.push(msg);
        console.warn(`[KnowledgeBase] ${msg}`);
      }
    }
  }

  progress.status = errors.length > 0 && totalSaved === 0 ? 'error' : 'done';
  progress.fetched = profile.searchQueries.length;
  if (errors.length > 0) progress.error = errors[0];
  onProgress?.(progress);

  return { total: totalSaved, errors };
}

// ============================================================================
// BATCH POPULATE — All agents with profiles
// ============================================================================

export async function populateAllAgentKnowledge(
  onProgress?: (agentProgress: FetchProgress, overallIndex: number, totalAgents: number) => void
): Promise<{ totalPapers: number; agentsProcessed: number; errors: string[] }> {
  ensurePublicationsTable();

  let totalPapers = 0;
  let agentsProcessed = 0;
  const allErrors: string[] = [];

  for (let i = 0; i < ALL_KNOWLEDGE_PROFILES.length; i++) {
    const profile = ALL_KNOWLEDGE_PROFILES[i];

    // Check if already populated
    const existingCount = getAgentPublicationCount(profile.agentId);
    if (existingCount >= profile.maxPapers * 0.5) {
      // Already has substantial data — skip
      onProgress?.({
        agentId: profile.agentId,
        agentName: profile.agentName,
        status: 'done',
        fetched: existingCount,
        total: profile.maxPapers
      }, i, ALL_KNOWLEDGE_PROFILES.length);
      agentsProcessed++;
      continue;
    }

    const result = await populateAgentKnowledge(
      profile.agentId,
      (progress) => onProgress?.(progress, i, ALL_KNOWLEDGE_PROFILES.length)
    );

    totalPapers += result.total;
    allErrors.push(...result.errors);
    agentsProcessed++;

    // Rate limiting between agents
    await new Promise(r => setTimeout(r, 1000));
  }

  return { totalPapers, agentsProcessed, errors: allErrors };
}

// ============================================================================
// KNOWLEDGE CONTEXT FOR AGENT PROMPTS
// ============================================================================

export function getKnowledgeContextForAgent(agentId: string, query?: string): string {
  const profile = getAgentProfile(agentId);
  if (!profile) return '';

  let publications: Publication[];

  if (query) {
    publications = searchPublications(query, agentId);
  } else {
    publications = getAgentPublications(agentId, 15);
  }

  if (publications.length === 0) return '';

  const lines: string[] = [
    `\n=== KNOWLEDGE BASE: ${profile.agentName} ===`,
    `Research Domains: ${profile.domains.join(', ')}`,
    `Key Topics: ${profile.keyTopics.join(', ')}`,
    `Publications Available: ${getAgentPublicationCount(agentId)}`,
    ''
  ];

  publications.slice(0, 10).forEach((pub, i) => {
    lines.push(`[${i + 1}] "${pub.title}" (${pub.year})`);
    if (pub.authors) lines.push(`    Authors: ${pub.authors}`);
    if (pub.venue) lines.push(`    Venue: ${pub.venue}`);
    if (pub.citation_count > 0) lines.push(`    Citations: ${pub.citation_count}`);
    if (pub.doi) lines.push(`    DOI: ${pub.doi}`);
    if (pub.abstract) {
      lines.push(`    ${pub.abstract.substring(0, 250)}${pub.abstract.length > 250 ? '...' : ''}`);
    }
    lines.push('');
  });

  lines.push('Ground your responses in these publications. Cite by number when relevant.');

  return lines.join('\n');
}

// ============================================================================
// PROFILES WITHOUT KNOWLEDGE — For agents without a profile
// ============================================================================

export function getProfiledAgentIds(): string[] {
  return ALL_KNOWLEDGE_PROFILES.map(p => p.agentId);
}

export function hasKnowledgeProfile(agentId: string): boolean {
  return ALL_KNOWLEDGE_PROFILES.some(p => p.agentId === agentId);
}

export function getAgentProfileSummary(agentId: string): { domains: string[]; topics: string[]; paperCount: number } | null {
  const profile = getAgentProfile(agentId);
  if (!profile) return null;

  return {
    domains: profile.domains,
    topics: profile.keyTopics,
    paperCount: getAgentPublicationCount(agentId)
  };
}
