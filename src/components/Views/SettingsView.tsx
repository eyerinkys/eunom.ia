import React from 'react';
import { Key, HardDrive, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '28px' }}>
          <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.1, marginBottom: '6px' }}>
            Node Settings & Security
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Configure local self-hosted instance settings, OPFS storage, and Ed25519 signing keys.
          </p>
        </div>

        {/* Section 1: Cryptographic Keys */}
        <div className="rule-all" style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Key size={18} color="var(--accent-bronze)" />
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
              Authorship Cryptographic Keys
            </h3>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Primary Key Type:</span>
              <span className="font-mono" style={{ fontWeight: 600 }}>RSA-4096 / Ed25519 Pair</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Public Fingerprint:</span>
              <code className="font-mono" style={{ fontSize: '10px' }}>0x82A1-992B-44C1-09FA</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Key Status:</span>
              <span className="badge-valid">ACTIVE & SECURED</span>
            </div>
          </div>
        </div>

        {/* Section 2: Storage & OPFS Cache */}
        <div className="rule-all" style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <HardDrive size={18} color="var(--accent-copper)" />
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
              Origin Private File System (OPFS)
            </h3>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Local Offline OPFS Cache:</span>
              <span className="font-mono" style={{ color: 'var(--accent-olive)', fontWeight: 600 }}>ENABLED (IndexedDB Dexie Sync)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Max Local OPFS Size:</span>
              <span className="font-mono">5.0 GB</span>
            </div>
          </div>
        </div>

        {/* Section 3: Visual Theme */}
        <div className="rule-all" style={{ backgroundColor: 'var(--bg-panel)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Database size={18} color="var(--accent-plum)" />
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
              Design & Palette Specification
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Current Active Theme: <strong>Mineral Archival</strong> (1.5px Rule Line Motif, Outfit & Inter).
          </p>
        </div>

      </div>
    </div>
  );
};
