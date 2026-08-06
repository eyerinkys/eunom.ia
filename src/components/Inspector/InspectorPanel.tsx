import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Copy, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const InspectorPanel: React.FC = () => {
  const { 
    activeFile, 
    inspectorTab, 
    setInspectorTab, 
    isVerifying, 
    verificationStep, 
    triggerProvenanceVerification,
    setDiffModalOpen
  } = useEunomiaStore();

  if (!activeFile) {
    return (
      <aside 
        style={{
          width: 'var(--inspector-width)',
          backgroundColor: 'var(--bg-panel)',
          borderLeft: 'var(--border-rule)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}
      >
        <FileText size={48} strokeWidth={1} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
        <h3 className="font-serif" style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          No File Selected
        </h3>
        <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
          Click any file in the workspace to inspect cryptographic provenance, version history, and CAS blob details.
        </p>
      </aside>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied SHA-256 hash to clipboard!');
  };

  const handleExportPDF = () => {
    alert(`Generating & Exporting Cryptographic Provenance PDF for "${activeFile.name}"...`);
  };

  return (
    <aside 
      style={{
        width: 'var(--inspector-width)',
        backgroundColor: 'var(--bg-canvas)',
        borderLeft: 'var(--border-rule)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}
    >
      {/* Inspector Header */}
      <div 
        style={{
          padding: '16px 20px',
          borderBottom: 'var(--border-rule)',
          backgroundColor: 'var(--bg-panel)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <FileText size={20} color="var(--accent-bronze)" />
          <h2 
            className="font-serif" 
            style={{ 
              fontSize: '16px', 
              fontWeight: 700, 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              flex: 1 
            }}
          >
            {activeFile.name}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {activeFile.type.toUpperCase()} • {activeFile.sizeFormatted}
          </span>
          {activeFile.provenanceStatus === 'VALID' ? (
            <span className="badge-valid" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> PROVENANCE INTACT
            </span>
          ) : (
            <span className="badge-tampered" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> TAMPER DETECTED
            </span>
          )}
        </div>
      </div>

      {/* 3-Tab Selector */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: 'var(--border-rule)',
          backgroundColor: 'var(--bg-panel)'
        }}
      >
        <button
          onClick={() => setInspectorTab('details')}
          style={{
            padding: '10px 4px',
            backgroundColor: inspectorTab === 'details' ? 'var(--bg-canvas)' : 'transparent',
            border: 'none',
            borderBottom: inspectorTab === 'details' ? '3px solid var(--accent-bronze)' : '3px solid transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            color: inspectorTab === 'details' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          DETAILS
        </button>
        <button
          onClick={() => setInspectorTab('versions')}
          style={{
            padding: '10px 4px',
            backgroundColor: inspectorTab === 'versions' ? 'var(--bg-canvas)' : 'transparent',
            border: 'none',
            borderBottom: inspectorTab === 'versions' ? '3px solid var(--accent-bronze)' : '3px solid transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            color: inspectorTab === 'versions' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          VERSIONS ({activeFile.versionCount})
        </button>
        <button
          onClick={() => setInspectorTab('provenance')}
          style={{
            padding: '10px 4px',
            backgroundColor: inspectorTab === 'provenance' ? 'var(--bg-canvas)' : 'transparent',
            border: 'none',
            borderBottom: inspectorTab === 'provenance' ? '3px solid var(--accent-bronze)' : '3px solid transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            color: inspectorTab === 'provenance' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          PROVENANCE
        </button>
      </div>

      {/* Tab Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {inspectorTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Hash Display */}
            <div>
              <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Content Hash (SHA-256)
              </label>
              <div 
                style={{ 
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-panel)',
                  padding: '8px 10px',
                  border: 'var(--border-rule)'
                }}
              >
                <code className="font-mono" style={{ fontSize: '10px', wordBreak: 'break-all', flex: 1 }}>
                  {activeFile.hash}
                </code>
                <button 
                  onClick={() => copyToClipboard(activeFile.hash)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                  title="Copy Hash"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Field Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OWNER AUTHOR</span>
                <p style={{ fontWeight: 600 }}>{activeFile.owner}</p>
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LAST MODIFIED</span>
                <p className="font-mono">{activeFile.modifiedAt}</p>
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>STORAGE PATH</span>
                <p className="font-mono" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{activeFile.path}</p>
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OPFS CACHE</span>
                <p style={{ fontWeight: 600, color: activeFile.opfsCached ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                  {activeFile.opfsCached ? 'LOCAL OPFS READY' : 'REMOTE BLOB'}
                </p>
              </div>
            </div>

            {/* Signature Box */}
            <div 
              style={{
                backgroundColor: 'var(--bg-panel)',
                padding: '12px',
                border: 'var(--border-rule)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                <ShieldCheck size={14} color="var(--accent-bronze)" /> RSA-4096 / Ed25519 Signature
              </div>
              <code className="font-code" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                {activeFile.authorSignature}
              </code>
            </div>

            {/* Content Snippet Preview */}
            {activeFile.contentSnippet && (
              <div>
                <label className="font-sans" style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Document Abstract / Preview
                </label>
                <div 
                  style={{
                    marginTop: '4px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: 'var(--border-rule)',
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary)'
                  }}
                >
                  {activeFile.contentSnippet}
                </div>
              </div>
            )}
          </div>
        )}

        {inspectorTab === 'versions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600 }}>CHRONOLOGICAL TIMELINE</span>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '10px' }}
                onClick={() => alert(`Create new version for ${activeFile.name}`)}
              >
                + Upload Version
              </button>
            </div>

            {/* Vertical Version Axis */}
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              <div 
                style={{
                  position: 'absolute',
                  left: '6px',
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  backgroundColor: 'var(--accent-bronze)'
                }}
              />

              {activeFile.versions.map((ver) => (
                <div 
                  key={ver.id}
                  style={{
                    position: 'relative',
                    marginBottom: '16px',
                    backgroundColor: 'var(--bg-panel)',
                    border: 'var(--border-rule)',
                    padding: '12px'
                  }}
                >
                  <div 
                    style={{
                      position: 'absolute',
                      left: '-20px',
                      top: '12px',
                      width: '10px',
                      height: '10px',
                      backgroundColor: 'var(--accent-bronze)',
                      border: '2px solid var(--bg-canvas)',
                      borderRadius: '50%'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent-bronze)' }}>
                      {ver.version}
                    </span>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {ver.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>{ver.commitNote}</p>
                  <p className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    Author: {ver.author} • {ver.sizeFormatted}
                  </p>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '2px 8px', fontSize: '10px' }}
                      onClick={() => setDiffModalOpen(true, {
                        oldVersion: 'v2',
                        newVersion: ver.version,
                        oldSnippet: 'Initial drafting of quantum limits in phase noise estimation.',
                        newSnippet: ver.contentSnippet || 'Updated equation details.'
                      })}
                    >
                      Compare Diff
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '2px 8px', fontSize: '10px' }}
                      onClick={() => alert(`Restoring ${ver.version} as current active version!`)}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inspectorTab === 'provenance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Interactive Verification Playback Trigger */}
            <div 
              style={{
                backgroundColor: 'var(--bg-panel)',
                padding: '16px',
                border: 'var(--border-rule)',
                textAlign: 'center'
              }}
            >
              <h4 className="font-serif" style={{ fontSize: '14px', marginBottom: '6px' }}>
                Cryptographic Chain Verification
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Validate the SHA-256 block hash graph and author digital key signature.
              </p>
              <button 
                onClick={triggerProvenanceVerification}
                disabled={isVerifying}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Zap size={15} /> {isVerifying ? `VERIFYING STEP ${verificationStep}/4...` : 'VERIFY PROVENANCE NOW'}
              </button>
            </div>

            {/* Status Axis */}
            <div style={{ position: 'relative', paddingLeft: '24px' }}>
              <div 
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '10px',
                  bottom: '10px',
                  width: '2px',
                  backgroundColor: isVerifying ? 'var(--accent-bronze)' : (activeFile.provenanceStatus === 'VALID' ? 'var(--accent-olive)' : 'var(--accent-red)')
                }}
              />

              {/* Node 1 */}
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <div 
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'var(--accent-olive)',
                    border: '2px solid #FFF'
                  }}
                />
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-olive)', fontWeight: 700 }}>
                  NODE 1 • CAS INGESTION
                </span>
                <p style={{ fontSize: '11px', fontWeight: 600 }}>Initial Blob Hashed to CAS Store</p>
                <code className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  0x7f83b1657ff1fc5...
                </code>
              </div>

              {/* Node 2 */}
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <div 
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'var(--accent-bronze)',
                    border: '2px solid #FFF'
                  }}
                />
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-bronze)', fontWeight: 700 }}>
                  NODE 2 • REVISION VERIFIED
                </span>
                <p style={{ fontSize: '11px', fontWeight: 600 }}>RSA-4096 Signature Seal Applied</p>
                <code className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {activeFile.authorSignature}
                </code>
              </div>

              {/* Node 3 */}
              <div style={{ position: 'relative' }}>
                <div 
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: activeFile.provenanceStatus === 'VALID' ? 'var(--accent-olive)' : 'var(--accent-red)',
                    border: '2px solid #FFF'
                  }}
                />
                <span className="font-mono" style={{ fontSize: '10px', color: activeFile.provenanceStatus === 'VALID' ? 'var(--accent-olive)' : 'var(--accent-red)', fontWeight: 700 }}>
                  NODE 3 • CURRENT CHAIN SEAL
                </span>
                <p style={{ fontSize: '11px', fontWeight: 600 }}>
                  {activeFile.provenanceStatus === 'VALID' ? 'INTEGRITY SEAL INTACT' : 'TAMPER ALERT: HASH MISMATCH'}
                </p>
                <code className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {activeFile.hash.slice(0, 24)}...
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Export Action */}
      <div 
        style={{
          padding: '16px',
          borderTop: 'var(--border-rule)',
          backgroundColor: 'var(--bg-panel)'
        }}
      >
        <button 
          onClick={handleExportPDF}
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <FileCheck size={16} /> Export Provenance PDF
        </button>
      </div>
    </aside>
  );
};
