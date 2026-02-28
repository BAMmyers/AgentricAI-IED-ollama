import { useState } from 'react';
import {
  ChevronRight, File, Folder, FolderOpen,
  FileCode, FileJson, FileText, FileType,
  Image, Settings, Package
} from 'lucide-react';
import type { FileNode } from '../types';
import { cn } from '../utils/cn';

const FILE_ICONS: Record<string, React.ReactNode> = {
  ts: <FileCode size={13} className="text-blue-400" />,
  tsx: <FileCode size={13} className="text-cyan" />,
  js: <FileCode size={13} className="text-amber-glow" />,
  jsx: <FileCode size={13} className="text-amber-glow" />,
  json: <FileJson size={13} className="text-amber-glow" />,
  md: <FileText size={13} className="text-text-secondary" />,
  css: <FileType size={13} className="text-magenta" />,
  html: <FileCode size={13} className="text-red-glow" />,
  py: <FileCode size={13} className="text-emerald-glow" />,
  png: <Image size={13} className="text-violet" />,
  jpg: <Image size={13} className="text-violet" />,
  svg: <Image size={13} className="text-violet" />,
  toml: <Settings size={13} className="text-text-muted" />,
  yaml: <Settings size={13} className="text-text-muted" />,
  lock: <Package size={13} className="text-text-muted" />,
};

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || <File size={13} className="text-text-muted" />;
}

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
}

function TreeNode({ node, depth, selectedPath, onSelect }: TreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-1.5 py-1 px-2 text-[11px] hover:bg-surface/80 transition-colors rounded-sm group',
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <ChevronRight
            size={11}
            className={cn('text-text-muted transition-transform flex-shrink-0', open && 'rotate-90')}
          />
          {open
            ? <FolderOpen size={13} className="text-cyan-dim flex-shrink-0" />
            : <Folder size={13} className="text-cyan-dim flex-shrink-0" />
          }
          <span className="text-text-secondary group-hover:text-text-primary truncate">{node.name}</span>
        </button>
        {open && node.children?.map((child, i) => (
          <TreeNode key={`${child.path}-${i}`} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node)}
      className={cn(
        'w-full flex items-center gap-1.5 py-1 px-2 text-[11px] transition-colors rounded-sm',
        selectedPath === node.path
          ? 'bg-raised text-text-primary'
          : 'hover:bg-surface/80 text-text-secondary hover:text-text-primary'
      )}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}

interface FileTreeProps {
  files: FileNode[];
  selectedPath: string | null;
  onSelectFile: (node: FileNode) => void;
}

export function FileTree({ files, selectedPath, onSelectFile }: FileTreeProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-dim">
        <span className="text-[10px] font-semibold tracking-widest text-text-muted uppercase">
          Explorer
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.map((node, i) => (
          <TreeNode key={`${node.path}-${i}`} node={node} depth={0} selectedPath={selectedPath} onSelect={onSelectFile} />
        ))}
      </div>
    </div>
  );
}
