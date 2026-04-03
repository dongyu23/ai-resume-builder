import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles, AlertCircle, ArrowRight, Check, Target } from 'lucide-react';

export default function JDOptimizer({ onClose, files, setFiles, onCompile }) {
  const [jdText, setJdText] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setError(null);
    try {
      const res = await axios.post('/api/ai/optimize', {
        job_description: jdText,
        files: files.filter(f => !f.is_base64),
        model: 'Qwen3-Coder'
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (result && result.optimizedFiles) {
      setFiles(prev => prev.map(f => {
        const opt = result.optimizedFiles.find(optF => optF.path === f.path);
        return opt ? { ...f, content: opt.content } : f;
      }));
      onCompile();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-5xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-elevated)]/50 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-accent-primary)] shadow-[0_0_15px_var(--color-accent-glow)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-[var(--color-text-primary)] tracking-wide">
                Target Alignment
              </h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1 font-mono tracking-widest uppercase">
                AI-powered resume optimization
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--color-bg-base)]">
          <div className="space-y-8">
            
            {/* Input Area */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-secondary)] mb-3 uppercase tracking-widest group-focus-within:text-[var(--color-accent-primary)] transition-colors">
                <span className="w-1 h-1 rounded-full bg-current"></span>
                Job Description
              </label>
              <div className="relative">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full h-32 p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg focus:ring-1 focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] outline-none resize-none text-[var(--color-text-primary)] text-sm leading-relaxed transition-all placeholder:text-[var(--color-text-tertiary)] scrollbar-thin"
                  placeholder="Paste the job requirements here..."
                />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[var(--color-bg-elevated)] to-transparent pointer-events-none rounded-b-lg opacity-20"></div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg flex items-start gap-3 text-sm animate-slide-up">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {result && (
              <div className="animate-slide-up space-y-5 pt-6 border-t border-[var(--color-border-subtle)]">
                <h3 className="text-xs font-mono text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]"></span>
                  Optimization Diff
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] ml-auto">
                    ANALYSIS COMPLETE
                  </span>
                </h3>
                
                <div className="grid gap-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                  {result.explanations?.map((exp, i) => (
                    <div key={i} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg overflow-hidden group hover:border-[var(--color-border-strong)] transition-colors">
                      {/* Rule Header */}
                      <div className="px-5 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-hover)] flex items-start gap-3">
                        <div className="mt-0.5 text-[var(--color-accent-primary)]">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">{exp.rule}</div>
                          <div className="text-xs text-[var(--color-text-tertiary)] mt-1">{exp.reason}</div>
                        </div>
                      </div>
                      
                      {/* Diff Viewer */}
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-subtle)] font-mono text-[11px] leading-relaxed">
                        <div className="p-4 bg-red-950/10 text-red-300/80">
                          <div className="mb-2 text-[10px] text-red-500/50 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-[1px] bg-current"></span>
                            Original
                          </div>
                          <div className="whitespace-pre-wrap">{exp.original}</div>
                        </div>
                        <div className="p-4 bg-emerald-950/10 text-emerald-300/90 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
                          <div className="mb-2 text-[10px] text-emerald-500/50 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-[1px] bg-current"></span>
                            Optimized
                          </div>
                          <div className="whitespace-pre-wrap">{exp.new}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/50 backdrop-blur flex justify-between items-center shrink-0">
          <div className="text-[10px] text-[var(--color-text-tertiary)] font-mono uppercase tracking-widest">
            {isOptimizing ? 'Processing data...' : result ? 'Ready to apply changes' : 'Awaiting input'}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
            
            {!result ? (
              <button 
                onClick={handleOptimize}
                disabled={!jdText.trim() || isOptimizing}
                className={`px-5 py-2 rounded text-sm font-medium flex items-center gap-2 transition-all ${
                  isOptimizing || !jdText.trim() 
                    ? 'bg-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] cursor-not-allowed' 
                    : 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:bg-white/90 shadow-[0_0_15px_var(--color-text-primary)]/20'
                }`}
              >
                {isOptimizing ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Target className="w-4 h-4" />}
                {isOptimizing ? 'Analyzing...' : 'Align with JD'}
              </button>
            ) : (
              <button 
                onClick={handleApply}
                className="px-5 py-2 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] shadow-[0_0_15px_var(--color-accent-glow)] rounded text-white text-sm font-medium flex items-center gap-2 transition-all"
              >
                Apply & Rebuild
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
