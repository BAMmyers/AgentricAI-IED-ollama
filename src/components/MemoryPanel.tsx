/**
 * Memory Panel - Visualize and manage the SQLite database
 */

import React, { useState } from 'react';
import {
  Database,
  Brain,
  Beaker,
  Lightbulb,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Search,
  HardDrive,
  MessageSquare,
  Users,
  Workflow,
  X,
  Plus
} from 'lucide-react';
import { useDatabase, type DatabaseStats } from '../hooks/useDatabase';
import {
  setCollectiveMemory,
  setSimulatedMemory,
  setTheoreticalMemory,
  type CollectiveMemory,
  type SimulatedMemory,
  type TheoreticalMemory
} from '../db/database';

interface MemoryPanelProps {
  onClose: () => void;
}

type TabType = 'overview' | 'collective' | 'simulated' | 'theoretical' | 'conversations' | 'settings';

export const MemoryPanel: React.FC<MemoryPanelProps> = ({ onClose }) => {
  const db = useDatabase();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['collective', 'simulated', 'theoretical']));
  const [showAddModal, setShowAddModal] = useState<'collective' | 'simulated' | 'theoretical' | null>(null);
  const [newMemory, setNewMemory] = useState({ key: '', value: '', category: 'general' });

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections);
    if (next.has(section)) {
      next.delete(section);
    } else {
      next.add(section);
    }
    setExpandedSections(next);
  };

  const handleExport = () => {
    const data = db.exportDb();
    if (data) {
      // Convert to regular array to avoid SharedArrayBuffer issues
      const blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentric-ai-memory-${new Date().toISOString().split('T')[0]}.db`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.db';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const buffer = await file.arrayBuffer();
        await db.importDb(new Uint8Array(buffer));
      }
    };
    input.click();
  };

  const handleAddMemory = () => {
    if (!showAddModal || !newMemory.key || !newMemory.value) return;
    
    switch (showAddModal) {
      case 'collective':
        setCollectiveMemory(newMemory.key, newMemory.value, newMemory.category, 'manual');
        break;
      case 'simulated':
        setSimulatedMemory(newMemory.key, newMemory.value, 'manual');
        break;
      case 'theoretical':
        setTheoreticalMemory(newMemory.key, newMemory.value, 'idea', [], 'nascent', 'manual');
        break;
    }
    
    setShowAddModal(null);
    setNewMemory({ key: '', value: '', category: 'general' });
    db.refresh();
  };

  const filterMemories = <T extends { key: string; value: string }>(memories: T[]): T[] => {
    if (!searchQuery) return memories;
    const q = searchQuery.toLowerCase();
    return memories.filter(m => 
      m.key.toLowerCase().includes(q) || 
      m.value.toLowerCase().includes(q)
    );
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Database size={14} /> },
    { id: 'collective', label: 'Collective', icon: <Brain size={14} /> },
    { id: 'simulated', label: 'Simulated', icon: <Beaker size={14} /> },
    { id: 'theoretical', label: 'Theoretical', icon: <Lightbulb size={14} /> },
  ];

  const renderStats = (stats: DatabaseStats | null) => {
    if (!stats) return null;
    
    const items = [
      { label: 'Collective Memory', value: stats.collective_count, icon: <Brain size={16} className="text-purple-400" />, color: 'purple' },
      { label: 'Simulated Memory', value: stats.simulated_count, icon: <Beaker size={16} className="text-cyan-400" />, color: 'cyan' },
      { label: 'Theoretical Memory', value: stats.theoretical_count, icon: <Lightbulb size={16} className="text-yellow-400" />, color: 'yellow' },
      { label: 'Conversations', value: stats.conversations_count, icon: <MessageSquare size={16} className="text-green-400" />, color: 'green' },
      { label: 'Messages', value: stats.messages_count, icon: <MessageSquare size={16} className="text-green-400" />, color: 'green' },
      { label: 'Custom Agents', value: stats.custom_agents_count, icon: <Users size={16} className="text-blue-400" />, color: 'blue' },
      { label: 'Saved Teams', value: stats.saved_teams_count, icon: <Users size={16} className="text-indigo-400" />, color: 'indigo' },
      { label: 'Workflow Outputs', value: stats.workflow_outputs_count, icon: <Workflow size={16} className="text-orange-400" />, color: 'orange' },
    ];

    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div
            key={item.label}
            className="bg-void-800/50 border border-void-700 rounded-lg p-3 flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-void-900/50">
              {item.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{item.value}</div>
              <div className="text-xs text-void-400">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMemoryList = (
    memories: (CollectiveMemory | SimulatedMemory | TheoreticalMemory)[],
    type: 'collective' | 'simulated' | 'theoretical'
  ) => {
    const filtered = filterMemories(memories);
    const colors = {
      collective: 'purple',
      simulated: 'cyan',
      theoretical: 'yellow'
    };
    const color = colors[type];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-void-400">{filtered.length} entries</span>
          <button
            onClick={() => setShowAddModal(type)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs bg-${color}-500/20 text-${color}-400 hover:bg-${color}-500/30`}
          >
            <Plus size={12} />
            Add
          </button>
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-void-500">
            No memories found
          </div>
        ) : (
          filtered.map((mem, i) => (
            <div
              key={mem.key + i}
              className={`bg-void-800/30 border border-void-700 rounded-lg p-3 hover:border-${color}-500/50 transition-colors`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`font-mono text-sm text-${color}-400 font-medium`}>
                  {mem.key}
                </div>
                <div className="text-xs text-void-500">
                  {'category' in mem ? mem.category : ('simulation_type' in mem ? mem.simulation_type : ('concept_type' in mem ? mem.concept_type : ''))}
                </div>
              </div>
              <div className="text-sm text-void-300 mt-2 line-clamp-3">
                {mem.value}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-void-500">
                {mem.source_agent && (
                  <span>Source: {mem.source_agent}</span>
                )}
                <span>{new Date(mem.created_at).toLocaleDateString()}</span>
                {'access_count' in mem && (
                  <span>Accessed: {mem.access_count}x</span>
                )}
                {'maturity_level' in mem && (
                  <span className={`px-1.5 py-0.5 rounded text-${color}-400 bg-${color}-500/20`}>
                    {mem.maturity_level}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-void-900 border-l border-void-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-void-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-cyan-400" />
            <span className="font-semibold text-white">Memory Database</span>
            {db.isReady && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                Connected
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => db.refresh()}
              className="p-1.5 rounded hover:bg-void-700 text-void-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleExport}
              className="p-1.5 rounded hover:bg-void-700 text-void-400 hover:text-white"
              title="Export Database"
            >
              <Download size={14} />
            </button>
            <button
              onClick={handleImport}
              className="p-1.5 rounded hover:bg-void-700 text-void-400 hover:text-white"
              title="Import Database"
            >
              <Upload size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-void-700 text-void-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-void-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-void-800 border border-void-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-void-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-void-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-void-800/50'
                : 'text-void-400 hover:text-white hover:bg-void-800/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {db.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={24} className="animate-spin text-cyan-400" />
          </div>
        ) : db.error ? (
          <div className="text-center py-8 text-red-400">
            <Database size={32} className="mx-auto mb-2 opacity-50" />
            <p>{db.error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-void-300 mb-3">Database Statistics</h3>
                  {renderStats(db.stats)}
                </div>

                {/* Consciousness Summary */}
                <div>
                  <h3 className="text-sm font-medium text-void-300 mb-3">Consciousness Modules</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Collective Consciousness', desc: 'Factual & operational data', icon: <Brain />, color: 'purple', count: db.stats?.collective_count || 0 },
                      { name: 'Simulated Consciousness', desc: 'Synthetic & test data', icon: <Beaker />, color: 'cyan', count: db.stats?.simulated_count || 0 },
                      { name: 'Theoretical Consciousness', desc: 'Conceptual & creative data', icon: <Lightbulb />, color: 'yellow', count: db.stats?.theoretical_count || 0 },
                    ].map(mod => (
                      <div
                        key={mod.name}
                        onClick={() => toggleSection(mod.name)}
                        className={`bg-void-800/50 border border-void-700 rounded-lg p-3 cursor-pointer hover:border-${mod.color}-500/50`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${mod.color}-500/20 text-${mod.color}-400`}>
                              {mod.icon}
                            </div>
                            <div>
                              <div className="font-medium text-white">{mod.name}</div>
                              <div className="text-xs text-void-400">{mod.desc}</div>
                            </div>
                          </div>
                          <div className={`text-lg font-bold text-${mod.color}-400`}>
                            {mod.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-void-700">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear ALL memory data? This cannot be undone.')) {
                        db.clearAll();
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
                  >
                    <Trash2 size={14} />
                    Clear All Memory Data
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'collective' && renderMemoryList(db.collectiveMemory, 'collective')}
            {activeTab === 'simulated' && renderMemoryList(db.simulatedMemory, 'simulated')}
            {activeTab === 'theoretical' && renderMemoryList(db.theoreticalMemory, 'theoretical')}
          </>
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-void-800 border border-void-600 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add to {showAddModal.charAt(0).toUpperCase() + showAddModal.slice(1)} Memory
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-void-400 mb-1">Key</label>
                <input
                  type="text"
                  value={newMemory.key}
                  onChange={(e) => setNewMemory({ ...newMemory, key: e.target.value })}
                  placeholder="memory_key"
                  className="w-full bg-void-900 border border-void-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-void-400 mb-1">Value</label>
                <textarea
                  value={newMemory.value}
                  onChange={(e) => setNewMemory({ ...newMemory, value: e.target.value })}
                  placeholder="Memory content..."
                  rows={4}
                  className="w-full bg-void-900 border border-void-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {showAddModal === 'collective' && (
                <div>
                  <label className="block text-sm text-void-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newMemory.category}
                    onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value })}
                    placeholder="general"
                    className="w-full bg-void-900 border border-void-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(null)}
                className="px-4 py-2 rounded-lg bg-void-700 text-void-300 hover:bg-void-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                disabled={!newMemory.key || !newMemory.value}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
