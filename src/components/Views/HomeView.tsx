import React from 'react';
import { 
  FileText, 
  HardDrive, 
  ArrowUpRight, 
  UploadCloud, 
  ShieldCheck, 
  Layers, 
  Activity,
  Folder
} from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const HomeView: React.FC = () => {
  const { 
    files, 
    folderNodes, 
    activities, 
    setActiveTab, 
    setCurrentFolderId, 
    selectFile, 
    setUploadModalOpen 
  } = useEunomiaStore();

  const recentFiles = files.slice(0, 4);

  return (
    <div style={{ padding: '28px', height: '100%', overflowY: 'auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.1, marginBottom: '6px' }}>
          Archival System Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Self-hosted content-addressed workspace • Cryptographic provenance & version history active.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <div className="rule-all" style={{ padding: '16px', backgroundColor: 'var(--bg-panel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL LOGICAL FILES</span>
            <FileText size={16} color="var(--accent-bronze)" />
          </div>
          <h3 className="font-serif" style={{ fontSize: '28px', fontWeight: 700 }}>{files.length} Items</h3>
          <p className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-olive)' }}>+100% Ingested & Hashed</p>
        </div>

        <div className="rule-all" style={{ padding: '16px', backgroundColor: 'var(--bg-panel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PHYSICAL CAS STORAGE</span>
            <HardDrive size={16} color="var(--accent-copper)" />
          </div>
          <h3 className="font-serif" style={{ fontSize: '28px', fontWeight: 700 }}>297.0 MB</h3>
          <p className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>48.9 MB CAS Deduplication</p>
        </div>

        <div className="rule-all" style={{ padding: '16px', backgroundColor: 'var(--bg-panel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PROVENANCE STATUS</span>
            <ShieldCheck size={16} color="var(--accent-olive)" />
          </div>
          <h3 className="font-serif" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-olive)' }}>96.5% Intact</h3>
          <p className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-red)' }}>1 Hash Mismatch Alert</p>
        </div>

        <div className="rule-all" style={{ padding: '16px', backgroundColor: 'var(--bg-panel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FOLDERS & PATHS</span>
            <Layers size={16} color="var(--accent-plum)" />
          </div>
          <h3 className="font-serif" style={{ fontSize: '28px', fontWeight: 700 }}>{folderNodes.length} Directories</h3>
          <p className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Graph Physics Disabled</p>
        </div>
      </div>

      {/* Main Split Content: Continue Working & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Continue Working & Folder Shortcuts */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="font-serif" style={{ fontSize: '20px', fontWeight: 700 }}>
              Continue Working
            </h2>
            <button 
              onClick={() => setActiveTab('files')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-bronze)', fontFamily: 'var(--font-sans)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Browse All Files <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {recentFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  selectFile(file);
                  setActiveTab('files');
                }}
                className="rule-all row-hover"
                style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={18} color="var(--accent-bronze)" />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{file.name}</h4>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {file.path} • {file.sizeFormatted} • Modified {file.modifiedAt}
                    </span>
                  </div>
                </div>
                {file.provenanceStatus === 'VALID' ? (
                  <span className="badge-valid">VALIDATED</span>
                ) : (
                  <span className="badge-tampered">ALERT</span>
                )}
              </div>
            ))}
          </div>

          {/* Quick Folder Access */}
          <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
            Primary Archival Folders
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {folderNodes.slice(0, 3).map((folder: any) => (
              <div
                key={folder.id}
                onClick={() => {
                  setCurrentFolderId(folder.id);
                  setActiveTab('files');
                }}
                className="rule-all row-hover"
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-panel)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Folder size={18} color="var(--accent-bronze)" />
                  <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>{folder.name}</span>
                </div>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Modified {folder.updatedAt?.slice(0, 10)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed & Direct Ingestion */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} color="var(--accent-copper)" />
            <h2 className="font-serif" style={{ fontSize: '20px', fontWeight: 700 }}>
              System Activity
            </h2>
          </div>

          <div 
            className="rule-all" 
            style={{ 
              backgroundColor: 'var(--bg-panel)', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginBottom: '24px'
            }}
          >
            {activities.map((act) => (
              <div 
                key={act.id} 
                style={{ 
                  borderBottom: 'var(--border-rule)', 
                  paddingBottom: '12px' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700 }}>
                    {act.title}
                  </span>
                  <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {act.timestamp.slice(11)}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{act.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Drop Zone */}
          <div
            onClick={() => setUploadModalOpen(true)}
            className="rule-all"
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-panel)',
              borderStyle: 'dashed',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <UploadCloud size={32} color="var(--accent-bronze)" style={{ marginBottom: '8px' }} />
            <h4 className="font-mono" style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
              INGEST FILES TO LOCAL CAS
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Click to upload document or code blobs to self-hosted content-addressed storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
