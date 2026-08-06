import React, { useState } from 'react';
import { X, GitCompare, FileText } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

function computeLineDiff(oldText: string, newText: string) {
  const oldLines = oldText ? oldText.split('\n') : [];
  const newLines = newText ? newText.split('\n') : [];
  
  const diffResult: { type: 'added' | 'removed' | 'same'; text: string }[] = [];

  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      diffResult.push({ type: 'same', text: oldLines[i] });
      i++;
      j++;
    } else if (j < newLines.length && !oldLines.slice(i).includes(newLines[j])) {
      diffResult.push({ type: 'added', text: newLines[j] });
      j++;
    } else if (i < oldLines.length) {
      diffResult.push({ type: 'removed', text: oldLines[i] });
      i++;
    } else {
      diffResult.push({ type: 'added', text: newLines[j] });
      j++;
    }
  }

  return diffResult;
}

export const DiffModal: React.FC = () => {
  const { isDiffModalOpen, setDiffModalOpen, diffComparison, activeFile } = useEunomiaStore();
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  if (!isDiffModalOpen || !diffComparison || !activeFile) return null;

  const oldText = diffComparison.oldSnippet || 'Initial file snapshot.';
  const newText = diffComparison.newSnippet || activeFile.contentSnippet || 'Current version snapshot.';
  const diffLines = computeLineDiff(oldText, newText);

  const additions = diffLines.filter(l => l.type === 'added').length;
  const deletions = diffLines.filter(l => l.type === 'removed').length;

  const isTextFile = 
    activeFile.type === 'markdown' || 
    activeFile.type === 'code' || 
    activeFile.name.endsWith('.txt') || 
    activeFile.name.endsWith('.md') || 
    activeFile.name.endsWith('.json') || 
    activeFile.name.endsWith('.js') || 
    activeFile.name.endsWith('.ts') || 
    activeFile.name.endsWith('.css') || 
    activeFile.name.endsWith('.html') ||
    activeFile.name.endsWith('.py');

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 28, 33, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
    >
      <div 
        className="rule-all"
        style={{
          width: '780px',
          backgroundColor: 'var(--bg-modal)',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCompare size={20} color="var(--accent-bronze)" />
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
              Version Content Diff ({diffComparison.oldVersion} vs {diffComparison.newVersion})
            </h3>
          </div>
          <button 
            onClick={() => setDiffModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Subtitle & Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              File: {activeFile.name}
            </span>
            {isTextFile && (
              <>
                <span className="font-mono" style={{ fontSize: '10px', backgroundColor: 'rgba(39, 83, 77, 0.4)', color: '#88F0DC', border: '1px solid #27534D', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  +{additions} additions
                </span>
                <span className="font-mono" style={{ fontSize: '10px', backgroundColor: 'rgba(224, 62, 62, 0.3)', color: '#FF8888', border: '1px solid var(--accent-red)', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  -{deletions} deletions
                </span>
              </>
            )}
          </div>

          {isTextFile && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode('unified')}
                className="btn-secondary"
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  backgroundColor: viewMode === 'unified' ? 'var(--accent-bronze)' : 'transparent',
                  color: viewMode === 'unified' ? '#11161D' : 'var(--text-primary)'
                }}
              >
                Unified Line Diff
              </button>
              <button
                onClick={() => setViewMode('split')}
                className="btn-secondary"
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  backgroundColor: viewMode === 'split' ? 'var(--accent-bronze)' : 'transparent',
                  color: viewMode === 'split' ? '#11161D' : 'var(--text-primary)'
                }}
              >
                Side-by-Side
              </button>
            </div>
          )}
        </div>

        {/* Diff View Area */}
        {!isTextFile ? (
          <div style={{ flex: 1, padding: '16px', border: 'var(--border-rule)', borderRadius: '2px', backgroundColor: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-panel)', border: 'var(--border-rule)', borderRadius: '2px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="var(--accent-bronze)" />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Binary & Media Snapshot Comparison ({activeFile.name})
                </span>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Line-by-line text diff is disabled for non-text binary files ({activeFile.extension || activeFile.type}). Metadata and snapshot attributes are compared below.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1 }}>
              <div style={{ border: 'var(--border-rule)', borderRadius: '2px', padding: '16px', backgroundColor: 'rgba(224, 62, 62, 0.1)' }}>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: '#FF8888', display: 'block', marginBottom: '12px' }}>
                  VERSION {diffComparison.oldVersion} (PREVIOUS SNAPSHOT)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FILE NAME</span>
                    <p style={{ fontWeight: 600, margin: 0 }}>{activeFile.name}</p>
                  </div>
                  <div>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FILE SIZE</span>
                    <p className="font-mono" style={{ fontWeight: 600, margin: 0 }}>{activeFile.sizeFormatted}</p>
                  </div>
                  <div>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CONTENT TYPE</span>
                    <p className="font-mono" style={{ margin: 0 }}>{activeFile.type.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div style={{ border: 'var(--border-rule)', borderRadius: '2px', padding: '16px', backgroundColor: 'rgba(39, 83, 77, 0.1)' }}>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: '#88F0DC', display: 'block', marginBottom: '12px' }}>
                  VERSION {diffComparison.newVersion} (ACTIVE SNAPSHOT)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FILE NAME</span>
                    <p style={{ fontWeight: 600, margin: 0 }}>{activeFile.name}</p>
                  </div>
                  <div>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FILE SIZE</span>
                    <p className="font-mono" style={{ fontWeight: 600, margin: 0 }}>{activeFile.sizeFormatted}</p>
                  </div>
                  <div>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CONTENT TYPE</span>
                    <p className="font-mono" style={{ margin: 0 }}>{activeFile.type.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', border: 'var(--border-rule)', borderRadius: '2px', backgroundColor: 'var(--bg-canvas)', minHeight: '200px' }}>
            {viewMode === 'unified' ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6 }}>
                {diffLines.map((line, idx) => {
                  const isAdded = line.type === 'added';
                  const isRemoved = line.type === 'removed';
                  const bgColor = isAdded ? 'rgba(39, 83, 77, 0.3)' : isRemoved ? 'rgba(224, 62, 62, 0.25)' : 'transparent';
                  const textColor = isAdded ? '#88F0DC' : isRemoved ? '#FF8888' : 'var(--text-primary)';

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        backgroundColor: bgColor, 
                        color: textColor, 
                        padding: '4px 12px', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <span style={{ userSelect: 'none', opacity: 0.8, width: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {isAdded ? '+' : isRemoved ? '-' : ''}
                      </span>
                      <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {line.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
                <div style={{ padding: '12px', borderRight: 'var(--border-rule)', backgroundColor: 'rgba(224, 62, 62, 0.1)', overflowY: 'auto' }}>
                  <span className="font-mono" style={{ fontSize: '10px', fontWeight: 700, color: '#FF8888', display: 'block', marginBottom: '8px' }}>
                    VERSION {diffComparison.oldVersion}
                  </span>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'pre-wrap', color: '#FF8888', margin: 0 }}>
                    {oldText}
                  </pre>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'rgba(39, 83, 77, 0.1)', overflowY: 'auto' }}>
                  <span className="font-mono" style={{ fontSize: '10px', fontWeight: 700, color: '#88F0DC', display: 'block', marginBottom: '8px' }}>
                    VERSION {diffComparison.newVersion}
                  </span>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'pre-wrap', color: '#88F0DC', margin: 0 }}>
                    {newText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-primary"
            onClick={() => setDiffModalOpen(false)}
          >
            Close Diff View
          </button>
        </div>
      </div>
    </div>
  );
};
