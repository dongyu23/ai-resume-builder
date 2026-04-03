import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ value, onChange, language }) {
  const handleEditorWillMount = (monaco) => {
    // Custom VSCode-like dark theme
    monaco.editor.defineTheme('lumina-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '0A0A0A' },
        { token: 'comment', foreground: '71717A', fontStyle: 'italic' },
        { token: 'keyword', foreground: '3B82F6' },
        { token: 'string', foreground: '10B981' },
      ],
      colors: {
        'editor.background': '#0A0A0A',
        'editor.foreground': '#FFFFFF',
        'editor.lineHighlightBackground': '#1A1A1A',
        'editorLineNumber.foreground': '#3F3F46',
        'editorLineNumber.activeForeground': '#A1A1AA',
        'editorIndentGuide.background': '#27272A',
        'editorIndentGuide.activeBackground': '#3F3F46',
        'scrollbarSlider.background': '#27272A',
        'scrollbarSlider.hoverBackground': '#3F3F46',
        'scrollbarSlider.activeBackground': '#52525B',
        'editor.selectionBackground': '#2563EB40',
      }
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[var(--color-bg-surface)]">
      <MonacoEditor
        height="100%"
        language={language}
        theme="lumina-dark"
        value={value}
        onChange={onChange}
        beforeMount={handleEditorWillMount}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 24, bottom: 24 },
          lineHeight: 1.6,
          renderLineHighlight: "all",
          hideCursorInOverviewRuler: true,
          matchBrackets: "near",
          overviewRulerBorder: false,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          folding: true,
          renderWhitespace: "none",
        }}
      />
    </div>
  );
}
