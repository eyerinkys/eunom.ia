import React from 'react';
import { X, GitCompare } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const DiffModal: React.FC = () => {
  const { isDiffModalOpen, setDiffModalOpen, diffComparison, activeFile } = useEunomiaStore();

  if (!isDiffModalOpen || !diffComparison || !activeFile) return null;

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
          width: '720px',
          backgroundColor: 'var(--bg-modal)',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCompare size={20} color="var(--accent-bronze)" />
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
              Version Text Diff ({diffComparison.oldVersion} vs {diffComparison.newVersion})
            </h3>
          </div>
          <button 
            onClick={() => setDiffModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Target File: {activeFile.name} • SHA-256 CAS Content Comparison
        </p>

        {/* Side-by-side Diff comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, overflowY: 'auto' }}>
          
          {/* Old Version */}
          <div className="rule-all" style={{ padding: '12px', backgroundColor: 'var(--bg-panel)' }}>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-red)' }}>
              VERSION {diffComparison.oldVersion} (PREVIOUS)
            </span>
            <div 
              style={{
                marginTop: '8px',
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                color: 'var(--text-secondary)'
              }}
            >
              {diffComparison.oldSnippet}
            </div>
          </div>

          {/* New Version */}
          <div className="rule-all" style={{ padding: '12px', backgroundColor: 'rgba(85, 107, 47, 0.1)' }}>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-olive)' }}>
              VERSION {diffComparison.newVersion} (ACTIVE)
            </span>
            <div 
              style={{
                marginTop: '8px',
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                color: 'var(--text-primary)'
              }}
            >
              {diffComparison.newSnippet}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
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
