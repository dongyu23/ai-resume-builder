import React from 'react';
import { FileCode, FileJson, FileText, ChevronRight, Folder } from 'lucide-react';

export default function FileTree({ files, activeFile, onSelect }) {
  const getIcon = (filename) => {
    if (filename.endsWith('.tex')) return <FileCode className="w-3.5 h-3.5" />;
    if (filename.endsWith('.json')) return <FileJson className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex flex-col h-full select-none py-2">
      <div className="px-4 py-2 flex items-center gap-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">
        <Folder className="w-3.5 h-3.5" />
        Project Files
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin">
        {files.map((file) => {
          const isActive = activeFile === file.path;
          const depth = (file.path.match(/\//g) || []).length;
          const name = file.path.split('/').pop();
          
          return (
            <div
              key={file.path}
              onClick={() => onSelect(file.path)}
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
              className={`group flex items-center gap-2.5 py-1.5 pr-3 rounded-md cursor-pointer text-[13px] font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]' 
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <span className={`transition-colors ${isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'}`}>
                {getIcon(name)}
              </span>
              <span className="truncate tracking-wide">{name}</span>
              
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-[var(--color-accent-primary)] shadow-[0_0_8px_var(--color-accent-primary)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
