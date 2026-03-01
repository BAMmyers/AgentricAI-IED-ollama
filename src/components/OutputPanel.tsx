import React, { useState } from 'react';
import {
  FolderOutput,
  FileCode,
  FileJson,
  FileText,
  Bot,
  Download,
  Trash2,
  Import,
  Package,
  Clock,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import { OutputFile, OutputDirectory, CustomAgent } from '../types';
import {
  loadOutputDirectory,
  loadCustomAgents,
  deleteOutputFile,
  downloadFile,
  downloadOutputBundle,
  importOutputBundle,
  clearAllOutputs,
  getOutputStats,
} from '../data/outputManager';

interface OutputPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAgent: (agent: CustomAgent) => void;
  onRefresh: () => void;
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  isOpen,
  onClose,
  onImportAgent,
  onRefresh,
}) => {
  const [directory, setDirectory] = useState<OutputDirectory>(loadOutputDirectory());
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>(loadCustomAgents());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    agents: true,
    code: true,
    customAgents: true,
  });
  const [selectedFile, setSelectedFile] = useState<OutputFile | null>(null);
  const [importing, setImporting] = useState(false);

  const stats = getOutputStats();

  const refresh = () => {
    setDirectory(loadOutputDirectory());
    setCustomAgents(loadCustomAgents());
    onRefresh();
  };

  const handleDeleteFile = (fileId: string) => {
    deleteOutputFile(fileId);
    refresh();
  };

  const handleImportBundle = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImporting(true);
        try {
          const text = await file.text();
          importOutputBundle(text);
          refresh();
        } catch (error) {
          console.error('Failed to import bundle:', error);
        }
        setImporting(false);
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all outputs? This cannot be undone.')) {
      clearAllOutputs();
      refresh();
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getFileIcon = (type: OutputFile['type']) => {
    switch (type) {
      case 'agent': return <Bot className="w-4 h-4 text-violet-400" />;
      case 'code': return <FileCode className="w-4 h-4 text-green-400" />;
      case 'data': return <FileJson className="w-4 h-4 text-yellow-400" />;
      case 'log': return <FileText className="w-4 h-4 text-gray-400" />;
      case 'workflow': return <FolderOutput className="w-4 h-4 text-cyan-400" />;
      case 'config': return <FileJson className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const renderFileList = (files: OutputFile[], sectionKey: string, title: string, icon: React.ReactNode) => (
    <div className="mb-3">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-white/5 rounded text-left"
      >
        {expandedSections[sectionKey] ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        {icon}
        <span className="text-sm text-gray-300">{title}</span>
        <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-1.5 rounded">
          {files.length}
        </span>
      </button>
      
      {expandedSections[sectionKey] && files.length > 0 && (
        <div className="ml-4 mt-1 space-y-1">
          {files.map(file => (
            <div
              key={file.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                selectedFile?.id === file.id
                  ? 'bg-cyan-500/20 border border-cyan-500/30'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
              onClick={() => setSelectedFile(file)}
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-300 truncate">
                  {file.name}.{file.extension}
                </div>
                <div className="text-[10px] text-gray-500">
                  {formatSize(file.metadata.size)} • {formatDate(file.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                  className="p-1 hover:bg-white/10 rounded"
                  title="Download"
                >
                  <Download className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                  className="p-1 hover:bg-red-500/20 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {expandedSections[sectionKey] && files.length === 0 && (
        <div className="ml-6 text-xs text-gray-600 py-1">No files</div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[900px] h-[700px] bg-[#0a0a0f] border border-gray-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-violet-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3">
            <FolderOutput className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Output Directory</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              {stats.totalFiles} files • {formatSize(stats.totalSize)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* File Tree */}
          <div className="w-64 border-r border-gray-800 overflow-y-auto p-2">
            {/* Actions */}
            <div className="flex items-center gap-1 mb-3 pb-2 border-b border-gray-800">
              <button
                onClick={downloadOutputBundle}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded hover:bg-violet-500/30 transition-colors"
                title="Export all outputs as bundle"
              >
                <Package className="w-3 h-3" />
                Export
              </button>
              <button
                onClick={handleImportBundle}
                disabled={importing}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                title="Import output bundle"
              >
                <Import className="w-3 h-3" />
                Import
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors ml-auto"
                title="Clear all outputs"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Custom Agents */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('customAgents')}
                className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-white/5 rounded text-left"
              >
                {expandedSections['customAgents'] ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">Custom Agents</span>
                <span className="ml-auto text-xs text-emerald-500 bg-emerald-500/20 px-1.5 rounded">
                  {customAgents.length}
                </span>
              </button>
              
              {expandedSections['customAgents'] && customAgents.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {customAgents.map(agent => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 border border-transparent group"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: agent.color + '30', color: agent.color }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-300 truncate">{agent.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{agent.role.slice(0, 40)}...</div>
                      </div>
                      <button
                        onClick={() => onImportAgent(agent)}
                        className="p-1 hover:bg-emerald-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add to roster"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {expandedSections['customAgents'] && customAgents.length === 0 && (
                <div className="ml-6 text-xs text-gray-600 py-1">
                  No custom agents yet
                </div>
              )}
            </div>

            {/* File Categories */}
            {renderFileList(directory.agents, 'agents', 'Agent Definitions', <Bot className="w-4 h-4 text-violet-400" />)}
            {renderFileList(directory.code, 'code', 'Code', <FileCode className="w-4 h-4 text-green-400" />)}
            {renderFileList(directory.data, 'data', 'Data', <FileJson className="w-4 h-4 text-yellow-400" />)}
            {renderFileList(directory.workflows, 'workflows', 'Workflows', <FolderOutput className="w-4 h-4 text-cyan-400" />)}
            {renderFileList(directory.logs, 'logs', 'Logs', <FileText className="w-4 h-4 text-gray-400" />)}
            {renderFileList(directory.configs, 'configs', 'Configs', <FileJson className="w-4 h-4 text-orange-400" />)}
          </div>

          {/* File Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedFile ? (
              <>
                {/* File Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
                  <div className="flex items-center gap-2">
                    {getFileIcon(selectedFile.type)}
                    <span className="text-sm text-white">
                      {selectedFile.name}.{selectedFile.extension}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatSize(selectedFile.metadata.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadFile(selectedFile)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
                
                {/* File Metadata */}
                <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Created: {formatDate(selectedFile.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {selectedFile.metadata.lines} lines
                  </div>
                  {selectedFile.source.workflowName && (
                    <div className="flex items-center gap-1">
                      <FolderOutput className="w-3 h-3" />
                      From: {selectedFile.source.workflowName}
                    </div>
                  )}
                  {selectedFile.source.agentName && (
                    <div className="flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      By: {selectedFile.source.agentName}
                    </div>
                  )}
                </div>
                
                {/* File Content */}
                <div className="flex-1 overflow-auto p-4 bg-[#0d0d12]">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                    {selectedFile.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a file to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 bg-gray-900/30 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Agents: {stats.byType.agents}</span>
            <span>Code: {stats.byType.code}</span>
            <span>Data: {stats.byType.data}</span>
            <span>Workflows: {stats.byType.workflows}</span>
            <span>Logs: {stats.byType.logs}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">{stats.customAgents} custom agents loaded</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
