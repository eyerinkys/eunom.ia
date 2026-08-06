import React, { useRef } from 'react';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setUploadModalOpen, uploadFile, activeUploads } = useEunomiaStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const uploadsArray = Object.values(activeUploads);
  const isUploading = uploadsArray.length > 0;
  const currentUpload = uploadsArray[0]; // just show first for now

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
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
          {!isUploading && (
            <button 
              onClick={() => setUploadModalOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
            <span className="font-mono" style={{ fontSize: '12px' }}>
              Uploading: {currentUpload.filename}
            </span>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-panel)', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                left: 0, top: 0, bottom: 0, 
                width: `${currentUpload.progress}%`,
                backgroundColor: 'var(--accent-bronze)',
                transition: 'width 0.2s ease-out'
              }} />
            </div>
            <span className="font-mono" style={{ fontSize: '11px', textAlign: 'right' }}>
              {currentUpload.progress}%
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '32px 0' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button 
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <CheckCircle2 size={16} /> Select File to Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

