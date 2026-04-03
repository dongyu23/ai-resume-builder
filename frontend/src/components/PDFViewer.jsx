import React from 'react';

export default function PDFViewer({ url }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-border-strong)] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-border-strong)] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-border-strong)] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-border-strong)] pointer-events-none"></div>
      
      <div className="w-full h-full p-2 bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)] rounded-lg shadow-2xl">
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full bg-white rounded transition-opacity duration-700 animate-slide-up"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
