import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setUploadModalOpen, addUploadedFile } = useEunomiaStore();
  const [filename, setFilename] = useState('');
  const [fileType, setFileType] = useState<'markdown' | 'pdf' | 'code' | 'archive'>('markdown');
  const [sizeKb, setSizeKb] = useState(120);

  if (!isUploadModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) return;

    addUploadedFile(filename.trim(), fileType, sizeKb * 1024);
    setUploadModalOpen(false);
    setFilename('');
  };

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
          width: '460px',
          backgroundColor: '#FFF',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="var(--accent-bronze)" />
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
              Upload & Content-Address File
            </h3>
          </div>
          <button 
            onClick={() => setUploadModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="font-mono" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              FILE NAME & EXTENSION
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Research_Analysis_Draft.md" 
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '4px',
                border: '1.5px solid #171A1F',
                backgroundColor: 'var(--bg-panel)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label className="font-mono" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              FILE CATEGORY TYPE
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '4px',
                border: '1.5px solid #171A1F',
                backgroundColor: 'var(--bg-panel)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="markdown">Markdown Document (.md)</option>
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="code">Code / Data Script (.py, .ts, .csv)</option>
              <option value="archive">Archive Package (.tar.gz, .zip)</option>
            </select>
          </div>

          <div>
            <label className="font-mono" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              SIMULATED FILE SIZE (KB)
            </label>
            <input 
              type="number" 
              value={sizeKb}
              onChange={(e) => setSizeKb(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '4px',
                border: '1.5px solid #171A1F',
                backgroundColor: 'var(--bg-panel)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button"
              className="btn-secondary"
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
            >
              <CheckCircle2 size={16} /> Compute SHA-256 & Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
