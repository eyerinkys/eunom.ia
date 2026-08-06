import React, { useState } from 'react';
import { CloudDownload, CheckCircle2, RefreshCw, Lock, ShieldCheck } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const DriveImportView: React.FC = () => {
  const { addUploadedFile } = useEunomiaStore();
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const handleStartImport = () => {
    setImporting(true);
    setTimeout(() => {
      addUploadedFile('Google_Drive_Lecture_Notes_2026.pdf', 'pdf', 5242880);
      setImporting(false);
      setImported(true);
    }, 1500);
  };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div 
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--bg-panel)',
              border: 'var(--border-rule)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <CloudDownload size={28} color="var(--accent-bronze)" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.1, marginBottom: '8px' }}>
            Google Drive Batch Import
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Import remote cloud archives directly into your self-hosted content-addressed Eunomia vault with automatic cryptographic hashing.
          </p>
        </div>

        {/* Status Card */}
        <div className="rule-all" style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700 }}>OAUTH 2.0 CLOUD CONNECTION</span>
            <span className="badge-valid" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> CONNECTED: user@university.edu
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Target Collection Folder:</span>
              <code className="font-mono" style={{ fontWeight: 600 }}>/ROOT/DRIVE_IMPORTS</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Hash Verification Mode:</span>
              <span className="font-mono" style={{ color: 'var(--accent-olive)', fontWeight: 600 }}>SHA-256 CAS Direct Hash</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Found Cloud Items:</span>
              <span className="font-mono" style={{ fontWeight: 600 }}>12 Files (45.2 MB)</span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleStartImport}
              disabled={importing || imported}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              {importing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> IMPORTING & HASHING BLOBS...
                </>
              ) : imported ? (
                <>
                  <CheckCircle2 size={16} /> BATCH IMPORT COMPLETE & INTACT
                </>
              ) : (
                <>
                  <CloudDownload size={16} /> START BATCH IMPORT NOW
                </>
              )}
            </button>
          </div>
        </div>

        {imported && (
          <div className="rule-all" style={{ backgroundColor: '#FFF', padding: '20px', textAlign: 'center' }}>
            <ShieldCheck size={32} color="var(--accent-olive)" style={{ marginBottom: '8px' }} />
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Google_Drive_Lecture_Notes_2026.pdf Imported
            </h3>
            <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              CAS Hash: 0x82f9a1... • Cryptographic signature seal assigned
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
