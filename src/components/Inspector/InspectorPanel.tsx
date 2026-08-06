import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Copy, 
  ShieldCheck,
  Zap,
  Trash2,
  User,
  GitCompare,
  RotateCcw,
  Download,
  FilePlus,
  FileUp,
  RotateCw,
  Edit3
} from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import { animate, stagger } from 'animejs';

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  file_created:     { label: 'Initial File Uploaded',  icon: <FilePlus size={12} />,  color: 'var(--accent-olive)' },
  version_created:  { label: 'New Revision Added',     icon: <FileUp size={12} />,   color: 'var(--accent-bronze)' },
  version_restored: { label: 'Restored Previous Version', icon: <RotateCw size={12} />, color: 'var(--accent-copper)' },
  metadata_updated: { label: 'File Renamed',          icon: <Edit3 size={12} />,    color: 'var(--accent-plum)' },
};

export const InspectorPanel: React.FC = () => {
  const { 
    activeFile, 
    inspectorTab, 
    setInspectorTab, 
    isVerifying, 
    triggerProvenanceVerification,
    setDiffModalOpen,
    uploadVersion,
    restoreVersion,
    deleteVersion,
    deleteFile,
    provenanceEvents,
    provenanceVerificationResult,
    isProvenanceLoading,
    fetchProvenance
  } = useEunomiaStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadVersion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && activeFile) {
      uploadVersion(activeFile.id, e.target.files[0]);
      e.target.value = '';
    }
  };

  // Anime.js verification line animation ref
  const verifyLineRef = React.useRef<HTMLDivElement>(null);
  const verifyNodesRef = React.useRef<(HTMLDivElement | null)[]>([]);

  // Fetch provenance events when switching to provenance tab
  React.useEffect(() => {
    if (inspectorTab === 'provenance' && activeFile) {
      fetchProvenance(activeFile.id);
    }
  }, [inspectorTab, activeFile?.id, fetchProvenance]);

  // Anime.js verification animation
  React.useEffect(() => {
    if (isVerifying && verifyLineRef.current) {
      // Animate the verification scanning line
      animate(verifyLineRef.current, {
        scaleY: [0, 1],
        duration: 800,
        ease: 'outExpo',
      });
      // Stagger-pulse each node dot
      const validNodes = verifyNodesRef.current.filter(Boolean) as HTMLDivElement[];
      if (validNodes.length > 0) {
        animate(validNodes, {
          scale: [0.5, 1.2, 1],
          duration: 400,
          delay: stagger(150),
          ease: 'outElastic(1, .6)',
        });
      }
    }
  }, [isVerifying]);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <FileText size={20} color="var(--accent-bronze)" style={{ flexShrink: 0 }} />
            <h2 
              className="font-serif" 
              style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis'
              }}
            >
              {activeFile.name}
            </h2>
          </div>
          <button
            onClick={() => deleteFile(activeFile.id)}
            title="Delete File"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--accent-red, #BA1A1A)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={16} />
          </button>
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

            {/* Delete Button in Details Tab */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: 'var(--border-rule)' }}>
              <button
                onClick={() => deleteFile(activeFile.id)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '8px',
                  color: '#FF8888',
                  borderColor: 'var(--accent-red)',
                  backgroundColor: 'rgba(224, 62, 62, 0.15)',
                  fontWeight: 600,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                <Trash2 size={14} />
                Delete File
              </button>
            </div>
          </div>
        )}

        {inspectorTab === 'versions' && (() => {
          const displayVersions = (activeFile.versions && activeFile.versions.length > 0)
            ? activeFile.versions
            : [{
                id: `v1-${activeFile.id}`,
                version: 'v1',
                timestamp: activeFile.modifiedAt || 'Initial version',
                sizeFormatted: activeFile.sizeFormatted || '0 B',
                sizeBytes: activeFile.sizeBytes || 0,
                author: activeFile.owner || 'User',
                commitNote: 'Initial version creation',
                hash: activeFile.hash || '',
                parentHash: ''
              }];

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    VERSION HISTORY ({displayVersions.length})
                  </span>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  + Upload Version
                </button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadVersion} />
              </div>

              {/* GitHub-style Commit History Timeline */}
              <div style={{ position: 'relative', paddingLeft: '18px', marginTop: '4px' }}>
                <div 
                  style={{
                    position: 'absolute',
                    left: '5px',
                    top: '12px',
                    bottom: '12px',
                    width: '2px',
                    backgroundColor: '#2E3746'
                  }}
                />

                {displayVersions.map((ver, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div 
                      key={ver.id || idx}
                      style={{
                        position: 'relative',
                        marginBottom: '14px',
                        backgroundColor: 'var(--bg-panel)',
                        border: 'var(--border-rule)',
                        borderRadius: '2px',
                        padding: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* Timeline Dot */}
                      <div 
                        style={{
                          position: 'absolute',
                          left: '-18px',
                          top: '14px',
                          width: '10px',
                          height: '10px',
                          backgroundColor: isLatest ? 'var(--accent-bronze)' : 'var(--text-muted)',
                          border: '2px solid var(--bg-panel)',
                          borderRadius: '50%',
                          zIndex: 1
                        }}
                      />

                      {/* Row 1: Tag + Status + Timestamp */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span 
                            className="font-mono" 
                            style={{ 
                              fontWeight: 700, 
                              fontSize: '11px', 
                              color: 'var(--accent-bronze)',
                              backgroundColor: 'rgba(198, 154, 66, 0.15)',
                              border: '1px solid var(--accent-bronze)',
                              padding: '1px 6px',
                              borderRadius: '2px'
                            }}
                          >
                            {ver.version}
                          </span>
                          {isLatest && (
                            <span className="badge-valid font-mono" style={{ fontSize: '9px', padding: '1px 5px' }}>
                              CURRENT
                            </span>
                          )}
                        </div>
                        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {ver.timestamp}
                        </span>
                      </div>

                      {/* Row 2: Author & Size */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <User size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{ver.author || 'System'}</span>
                        <span>•</span>
                        <span className="font-mono">{ver.sizeFormatted}</span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px', borderTop: 'var(--border-rule)' }}>
                        {!isLatest && (
                          <button 
                            className="btn-secondary" 
                            style={{ flex: '1 1 auto', justifyContent: 'center', padding: '4px 6px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => restoreVersion(activeFile.id, ver.id)}
                            title="Restore this version as current"
                          >
                            <RotateCcw size={10} />
                            Restore
                          </button>
                        )}
                        {displayVersions.length >= 2 && (
                          <button 
                            className="btn-secondary" 
                            style={{ flex: '1 1 auto', justifyContent: 'center', padding: '4px 6px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              const oldSnippet = ('contentSnippet' in ver && ver.contentSnippet) ? ver.contentSnippet : (ver.version === 'v1' ? `# ${activeFile.name}\n\nInitial version draft content.` : `# ${activeFile.name}\n\nVersion ${ver.version} content.`);
                              const newSnippet = (displayVersions[0] && 'contentSnippet' in displayVersions[0] && displayVersions[0].contentSnippet) ? displayVersions[0].contentSnippet : (activeFile.contentSnippet || `# ${activeFile.name}\n\nCurrent version active content.`);
                              setDiffModalOpen(true, {
                                oldVersion: ver.version,
                                newVersion: displayVersions[0]?.version || 'Current',
                                oldSnippet,
                                newSnippet
                              });
                            }}
                          >
                            <GitCompare size={10} />
                            Diff
                          </button>
                        )}
                        {ver.id && !ver.id.startsWith('v1-') && (
                          <a 
                            className="btn-secondary" 
                            style={{ flex: '1 1 auto', justifyContent: 'center', padding: '4px 6px', fontSize: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            href={`/api/files/${activeFile.id}/versions/${ver.id}/download`}
                            download
                          >
                            <Download size={10} />
                            Download
                          </a>
                        )}
                        {ver.version !== 'v1' && !ver.id.startsWith('v1-') && (
                          <button 
                            className="btn-secondary" 
                            style={{ flex: '1 1 auto', justifyContent: 'center', padding: '4px 6px', fontSize: '10px', color: 'var(--accent-red)', borderColor: 'rgba(186,26,26,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => deleteVersion(activeFile.id, ver.id)}
                            title="Delete this revision"
                          >
                            <Trash2 size={10} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

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
              <h4 className="font-serif" style={{ fontSize: '14px', marginBottom: '4px' }}>
                File History & Proof of Work
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                Check that your file history is genuine and has not been altered or corrupted.
              </p>
              <button 
                onClick={triggerProvenanceVerification}
                disabled={isVerifying}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Zap size={15} /> {isVerifying ? `CHECKING INTEGRITY...` : 'CHECK FILE INTEGRITY'}
              </button>
            </div>

            {/* Verification Result Banner */}
            {provenanceVerificationResult && !isVerifying && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: provenanceVerificationResult.isValid ? 'rgba(85,107,47,0.15)' : 'rgba(186,26,26,0.15)',
                border: `1.5px solid ${provenanceVerificationResult.isValid ? 'var(--accent-olive)' : 'var(--accent-red)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {provenanceVerificationResult.isValid ? (
                  <CheckCircle2 size={18} color="var(--accent-olive)" />
                ) : (
                  <AlertTriangle size={18} color="var(--accent-red)" />
                )}
                <div style={{ flex: 1 }}>
                  <span className="font-sans" style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: provenanceVerificationResult.isValid ? 'var(--accent-olive)' : 'var(--accent-red)'
                  }}>
                    {provenanceVerificationResult.isValid ? 'ALL REVISIONS AUTHENTIC' : 'UNAUTHORIZED CHANGE DETECTED'}
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {provenanceVerificationResult.isValid
                      ? `${provenanceVerificationResult.eventsCount} file events verified — your work history is genuine.`
                      : `A file modification or record change was detected.`}
                  </p>
                </div>
              </div>
            )}

            {/* Real Event Timeline */}
            {isProvenanceLoading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                <span className="font-sans" style={{ fontSize: '11px' }}>Loading history...</span>
              </div>
            ) : provenanceEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                <ShieldCheck size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '12px' }}>No history recorded yet.</p>
                <p style={{ fontSize: '10px', marginTop: '4px' }}>Upload a file to start tracking your work history.</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Animated verification axis line */}
                <div 
                  ref={verifyLineRef}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '10px',
                    bottom: '10px',
                    width: '2px',
                    transformOrigin: 'top',
                    backgroundColor: isVerifying ? 'var(--accent-bronze)' : (activeFile.provenanceStatus === 'VALID' ? 'var(--accent-olive)' : activeFile.provenanceStatus === 'TAMPERED' ? 'var(--accent-red)' : 'var(--text-muted)')
                  }}
                />

                {provenanceEvents.map((evt, i) => {
                  const meta = ACTION_META[evt.action] || ACTION_META['file_created'];
                  const isFailed = provenanceVerificationResult && !provenanceVerificationResult.isValid && provenanceVerificationResult.failedEventId === evt.id;
                  const dotColor = isFailed ? 'var(--accent-red)' : meta.color;

                  return (
                    <div 
                      key={evt.id} 
                      style={{ marginBottom: i < provenanceEvents.length - 1 ? '16px' : '0', position: 'relative' }}
                    >
                      {/* Timeline dot */}
                      <div 
                        ref={el => { verifyNodesRef.current[i] = el; }}
                        style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '4px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: dotColor,
                          border: '2px solid var(--bg-canvas)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />

                      {/* Event header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ color: dotColor }}>{meta.icon}</span>
                        <span className="font-sans" style={{ fontSize: '11px', color: dotColor, fontWeight: 700 }}>
                          {meta.label}
                        </span>
                      </div>

                      {/* Actor and timestamp */}
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        By {evt.actorName || 'You'} — {new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>

                      {/* Status pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 6px',
                          borderRadius: '2px',
                          backgroundColor: isFailed ? 'rgba(186,26,26,0.12)' : 'rgba(85,107,47,0.12)',
                          color: isFailed ? 'var(--accent-red)' : 'var(--accent-olive)',
                          fontWeight: 600
                        }}>
                          {isFailed ? '⚠️ Modified' : '✓ Verified Authentic'}
                        </span>
                      </div>

                      {/* Tamper alert detail */}
                      {isFailed && (
                        <div style={{
                          marginTop: '6px',
                          padding: '6px 10px',
                          backgroundColor: 'rgba(186,26,26,0.12)',
                          border: '1px solid var(--accent-red)',
                          fontSize: '11px',
                          color: 'var(--accent-red)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <AlertTriangle size={12} />
                          <span>This step has been modified or corrupted.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
