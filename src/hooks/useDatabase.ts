/**
 * React Hook for AgentricAI Database
 */

import { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
  getDatabase,
  getDatabaseStats,
  getAllCollectiveMemory,
  getAllSimulatedMemory,
  getAllTheoreticalMemory,
  getCustomAgents,
  getSavedTeams,
  getWorkflowOutputs,
  saveCustomAgent,
  deleteCustomAgent,
  saveTeam,
  saveWorkflowOutput,
  getSetting,
  setSetting,
  clearAllData,
  exportDatabase,
  importDatabase,
  type CollectiveMemory,
  type SimulatedMemory,
  type TheoreticalMemory
} from '../db/database';

export interface DatabaseStats {
  collective_count: number;
  simulated_count: number;
  theoretical_count: number;
  conversations_count: number;
  messages_count: number;
  custom_agents_count: number;
  saved_teams_count: number;
  workflow_outputs_count: number;
}

export interface UseDatabase {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  stats: DatabaseStats | null;
  
  // Memory access
  collectiveMemory: CollectiveMemory[];
  simulatedMemory: SimulatedMemory[];
  theoreticalMemory: TheoreticalMemory[];
  
  // Custom agents
  customAgents: ReturnType<typeof getCustomAgents>;
  savedTeams: ReturnType<typeof getSavedTeams>;
  workflowOutputs: ReturnType<typeof getWorkflowOutputs>;
  
  // Actions
  refresh: () => Promise<void>;
  saveAgent: typeof saveCustomAgent;
  removeAgent: typeof deleteCustomAgent;
  saveTeamConfig: typeof saveTeam;
  saveOutput: typeof saveWorkflowOutput;
  getSetting: typeof getSetting;
  setSetting: typeof setSetting;
  clearAll: () => Promise<void>;
  exportDb: () => Uint8Array | null;
  importDb: (data: Uint8Array) => Promise<void>;
}

export function useDatabase(): UseDatabase {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  
  const [collectiveMemory, setCollectiveMemory] = useState<CollectiveMemory[]>([]);
  const [simulatedMemory, setSimulatedMemory] = useState<SimulatedMemory[]>([]);
  const [theoreticalMemory, setTheoreticalMemory] = useState<TheoreticalMemory[]>([]);
  const [customAgents, setCustomAgents] = useState<ReturnType<typeof getCustomAgents>>([]);
  const [savedTeams, setSavedTeams] = useState<ReturnType<typeof getSavedTeams>>([]);
  const [workflowOutputs, setWorkflowOutputs] = useState<ReturnType<typeof getWorkflowOutputs>>([]);

  // Initialize database
  useEffect(() => {
    let mounted = true;
    
    async function init() {
      try {
        setIsLoading(true);
        await initDatabase();
        
        if (mounted) {
          setIsReady(true);
          setError(null);
          await refreshData();
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize database');
          setIsReady(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!getDatabase()) return;
    
    try {
      setStats(getDatabaseStats());
      setCollectiveMemory(getAllCollectiveMemory(100));
      setSimulatedMemory(getAllSimulatedMemory(100));
      setTheoreticalMemory(getAllTheoreticalMemory(100));
      setCustomAgents(getCustomAgents());
      setSavedTeams(getSavedTeams());
      setWorkflowOutputs(getWorkflowOutputs(50));
    } catch (err) {
      console.error('[useDatabase] Refresh error:', err);
    }
  }, []);

  // Wrapper functions that refresh after mutation
  const saveAgentWrapper: typeof saveCustomAgent = useCallback((agent) => {
    saveCustomAgent(agent);
    refreshData();
  }, [refreshData]);

  const removeAgentWrapper: typeof deleteCustomAgent = useCallback((id) => {
    deleteCustomAgent(id);
    refreshData();
  }, [refreshData]);

  const saveTeamWrapper: typeof saveTeam = useCallback((id, name, description, agentIds, defaultMission) => {
    saveTeam(id, name, description, agentIds, defaultMission);
    refreshData();
  }, [refreshData]);

  const saveOutputWrapper: typeof saveWorkflowOutput = useCallback((output) => {
    saveWorkflowOutput(output);
    refreshData();
  }, [refreshData]);

  const setSettingWrapper: typeof setSetting = useCallback((key, value) => {
    setSetting(key, value);
  }, []);

  const clearAllWrapper = useCallback(async () => {
    clearAllData();
    await refreshData();
  }, [refreshData]);

  const importDbWrapper = useCallback(async (data: Uint8Array) => {
    await importDatabase(data);
    await refreshData();
  }, [refreshData]);

  return {
    isReady,
    isLoading,
    error,
    stats,
    collectiveMemory,
    simulatedMemory,
    theoreticalMemory,
    customAgents,
    savedTeams,
    workflowOutputs,
    refresh: refreshData,
    saveAgent: saveAgentWrapper,
    removeAgent: removeAgentWrapper,
    saveTeamConfig: saveTeamWrapper,
    saveOutput: saveOutputWrapper,
    getSetting,
    setSetting: setSettingWrapper,
    clearAll: clearAllWrapper,
    exportDb: exportDatabase,
    importDb: importDbWrapper
  };
}
