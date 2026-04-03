import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, Sparkles, FileText, LayoutPanelLeft, Code2, Terminal, PanelRightClose, BookOpen } from 'lucide-react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import PDFViewer from './components/PDFViewer';
import JDOptimizer from './components/JDOptimizer';

// 初始占位模板，等待从后端加载真实模板
const INITIAL_TEMPLATES = {
  'hijiangtao': [
    { path: 'main.tex', content: '% Loading template from server...', is_base64: false }
  ],
  'awesome-cv': [
    { path: 'main.tex', content: '% Loading template from server...', is_base64: false }
  ]
};

function App() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [currentTemplate, setCurrentTemplate] = useState('hijiangtao');
  const [files, setFiles] = useState(INITIAL_TEMPLATES['hijiangtao']);
  const [activeFile, setActiveFile] = useState('main.tex');
  const [projectId] = useState('test-project-1');
  const [compileId, setCompileId] = useState(null);
  const [logs, setLogs] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [showJDOptimizer, setShowJDOptimizer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const compileTimerRef = useRef(null);
  
  // Create a ref for the terminal container to auto-scroll
  const terminalRef = useRef(null);

  // 加载后端真实模板
  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await axios.get('/api/templates/');
        setTemplates(res.data);
        setFiles(res.data['hijiangtao']);
        setLogs('> [SYSTEM] Successfully loaded authentic LaTeX templates from server.\n');
      } catch (err) {
        setLogs(`> [ERROR] Failed to load templates: ${err.message}\n`);
      }
    }
    loadTemplates();
  }, []);

  const handleTemplateChange = (templateName) => {
    setCurrentTemplate(templateName);
    setFiles(templates[templateName]);
    setActiveFile('main.tex');
    setLogs(`> [SYSTEM] Switched to template: ${templateName}\n`);
    setCompileId(null);
  };

  const handleFileContentChange = (path, newContent) => {
    setFiles(prevFiles => prevFiles.map(f => f.path === path ? { ...f, content: newContent } : f));
    
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    compileTimerRef.current = setTimeout(() => {
      handleCompile(files.map(f => f.path === path ? { ...f, content: newContent } : f));
    }, 1200);
  };

  const handleCompile = async (currentFiles = files, targetMainTex = activeFile) => {
    setIsCompiling(true);
    setLogs('> [SYSTEM] Initiating build sequence...\n');

    let compileTarget = 'main.tex';
    if (targetMainTex && targetMainTex.endsWith('.tex') && targetMainTex.includes('main')) {
      compileTarget = targetMainTex;
    }

    try {
      const res = await axios.post('/api/compile/', {
        project_id: projectId,
        files: currentFiles,
        main_tex: compileTarget,
        compiler: 'xelatex'
      });
      setCompileId(res.data.compile_id);
    } catch (err) {
      setLogs(prev => prev + `> [ERROR] Build failed: ${err.message}\n`);
      setIsCompiling(false);
    }
  };

  // Auto-scroll terminal when logs update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!compileId) return;
    
    const eventSource = new EventSource(`/api/compile/${projectId}/${compileId}/logs`);
    eventSource.onmessage = (event) => {
      // Filter out overly verbose font warnings from Tectonic to keep terminal clean
      const text = event.data;
      if (!text.includes('Metric (TFM) file or installed font not found') && 
          !text.includes('Package fontspec Error') &&
          !text.includes('For immediate help type H')) {
        setLogs(prev => prev + text + '\n');
      }
    };
    eventSource.onerror = (err) => {
      eventSource.close();
      setIsCompiling(false);
    };

    return () => eventSource.close();
  }, [compileId, projectId]);

  const activeContent = files.find(f => f.path === activeFile)?.content || '';

  return (
    <div className="flex h-screen w-screen overflow-hidden selection:bg-[var(--color-accent-glow)] selection:text-[var(--color-accent-primary)]">
      
      {/* Left Sidebar (Explorer) */}
      <aside className={`bg-[var(--color-bg-base)] border-r border-[var(--color-border-subtle)] flex flex-col shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0 opacity-0 overflow-hidden'}`}>
        {/* App Branding */}
        <div className="h-12 flex items-center px-4 shrink-0 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-[var(--color-text-primary)]">
              <FileText className="w-3 h-3 text-[var(--color-bg-base)]" strokeWidth={3} />
            </div>
            <span className="font-bold tracking-wide text-sm">Lumina</span>
          </div>
        </div>
        
        {/* Template Selector */}
        <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            Template
          </label>
          <select 
            value={currentTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] text-xs rounded px-2 py-1.5 outline-none focus:border-[var(--color-accent-primary)] cursor-pointer"
          >
            <option value="hijiangtao">Classic Hijiangtao (中文经典)</option>
            <option value="awesome-cv">Awesome-CV (现代风格)</option>
          </select>
        </div>
        
        {/* File Tree Area */}
        <div className="flex-1 overflow-hidden">
          <FileTree files={files} activeFile={activeFile} onSelect={setActiveFile} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-base)] relative">
        
        {/* Top Header / Toolbar */}
        <header className="h-12 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 shrink-0 bg-[var(--color-bg-base)]/80 backdrop-blur z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded hover:bg-[var(--color-bg-hover)]"
              title="Toggle Sidebar"
            >
              <LayoutPanelLeft className="w-4 h-4" />
            </button>
            
            {/* Editor Tabs Mockup */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Code2 className="w-3.5 h-3.5" />
              <span className="font-mono text-[13px]">{activeFile}</span>
              {isCompiling && <span className="flex h-2 w-2 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-primary)]"></span>
              </span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowJDOptimizer(true)} 
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-text-tertiary)] transition-all text-[13px] font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              Optimize JD
            </button>

            {compileId && !isCompiling && (
              <a 
                href={`/api/compile/${projectId}/${compileId}/pdf`}
                download="resume.pdf"
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-md hover:border-[var(--color-accent-primary)] transition-all text-[13px] font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download PDF
              </a>
            )}

            <button 
              onClick={() => handleCompile()} 
              disabled={isCompiling} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all font-semibold text-[13px] ${
                isCompiling 
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed border border-[var(--color-border-subtle)]' 
                  : 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:bg-white/90 shadow-[0_0_15px_var(--color-accent-glow)]'
              }`}
            >
              <Play className={`w-3 h-3 ${isCompiling ? 'animate-pulse' : ''}`} fill={isCompiling ? "none" : "currentColor"} />
              {isCompiling ? 'Building...' : 'Compile'}
            </button>
          </div>
        </header>

        {/* Editor & Preview Split */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Editor Container */}
          <div className="flex-1 relative border-r border-[var(--color-border-subtle)] z-10">
            <Editor 
              value={activeContent} 
              onChange={(val) => handleFileContentChange(activeFile, val)} 
              language={activeFile.endsWith('.tex') || activeFile.endsWith('.cls') || activeFile.endsWith('.sty') ? 'latex' : 'plaintext'}
            />
          </div>

          {/* Preview Container */}
          <div className="w-[45%] min-w-[450px] flex flex-col bg-[var(--color-bg-elevated)] relative shrink-0">
            <div className="absolute inset-0 bg-dots opacity-[0.15] pointer-events-none"></div>
            
            {/* PDF View */}
            <div className="flex-1 relative flex items-center justify-center p-0 overflow-hidden z-10">
              {compileId && !isCompiling ? (
                <div className="w-full h-full relative group">
                  <PDFViewer url={`/api/compile/${projectId}/${compileId}/pdf`} />
                  {/* Subtle success glow behind PDF */}
                  <div className="absolute inset-0 -z-10 bg-[var(--color-accent-primary)] opacity-5 blur-[100px] pointer-events-none transition-opacity group-hover:opacity-10"></div>
                </div>
              ) : isCompiling ? (
                <div className="flex flex-col items-center gap-4 animate-slide-up text-[var(--color-text-secondary)]">
                  <div className="w-8 h-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
                  <p className="font-mono text-xs tracking-widest uppercase">Rendering PDF...</p>
                </div>
              ) : (
                <div className="text-center text-[var(--color-text-tertiary)] animate-slide-up">
                  <PanelRightClose className="w-12 h-12 mx-auto mb-4 opacity-20" strokeWidth={1} />
                  <p className="font-serif italic text-lg text-[var(--color-text-secondary)]">Canvas is empty</p>
                  <p className="text-[11px] font-mono mt-2 uppercase tracking-widest">Hit compile to generate</p>
                </div>
              )}
            </div>

            {/* Terminal Drawer */}
            <div className="h-48 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] flex flex-col z-20 shrink-0">
              <div className="h-8 flex items-center px-4 border-b border-[var(--color-border-subtle)] gap-2 text-[11px] font-mono text-[var(--color-text-tertiary)] tracking-widest uppercase">
                <Terminal className="w-3 h-3" />
                Output
                <span className="ml-auto flex items-center gap-2">
                  <span className="capitalize normal-case">Status:</span>
                  <span className={`${isCompiling ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isCompiling ? 'Building' : 'Idle'}
                  </span>
                </span>
              </div>
              <div 
                ref={terminalRef}
                className="flex-1 p-4 font-mono text-[11px] text-[var(--color-text-secondary)] overflow-y-auto scrollbar-thin leading-relaxed scroll-smooth"
              >
                {logs || '> Waiting for instructions...'}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showJDOptimizer && (
        <JDOptimizer 
          onClose={() => setShowJDOptimizer(false)} 
          files={files}
          setFiles={setFiles}
          setActiveFile={setActiveFile}
          onCompile={handleCompile}
        />
      )}
    </div>
  );
}

export default App;
