import React, { useState, useEffect } from 'react';

export default function PDFViewer({ url }) {
  // We use a unique key to force iframe remount on URL change to avoid caching issues
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    setKey(Date.now());
  }, [url]);

  return (
    <div className="w-full h-full flex flex-col relative bg-[var(--color-bg-elevated)] shadow-2xl rounded-lg overflow-hidden border border-[var(--color-border-subtle)]">
      {/* Top subtle bar for visual balance */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-hover)] opacity-80 shrink-0"></div>
      
      {/* Clean Iframe container without padding or extra borders */}
      <div className="flex-1 w-full bg-zinc-100">
        <iframe
          key={key}
          src={`${url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full bg-zinc-100 border-none outline-none animate-slide-up"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
