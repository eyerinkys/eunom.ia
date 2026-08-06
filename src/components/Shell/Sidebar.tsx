import React from 'react';
import { 
  Home, 
  FolderGit2, 
  PieChart, 
  Network, 
  CloudDownload, 
  Trash2, 
  Settings, 
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import type { ViewTab } from '../../types/eunomia';
import { LogOut, User as UserIcon } from 'lucide-react';

import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user, logoutUser } = useEunomiaStore();

  const mainNavItems: { tab: ViewTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Home', icon: <Home size={18} /> },
    { tab: 'files', label: 'My Files & Provenance', icon: <FolderGit2 size={18} /> },
    { tab: 'storage', label: 'Storage Visualiser', icon: <PieChart size={18} /> },
    { tab: 'graph', label: 'Structural File Graph', icon: <Network size={18} /> },
    { tab: 'drive', label: 'Google Drive Import', icon: <CloudDownload size={18} /> },
    { tab: 'trash', label: 'Trash', icon: <Trash2 size={18} /> },
  ];

  return (
    <aside 
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        color: 'var(--text-on-dark)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 'var(--border-rule)',
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Brand Header */}
      <div 
        style={{
          padding: '20px 24px',
          borderBottom: '1.5px solid rgba(248, 249, 255, 0.15)'
        }}
      >
        <Logo size={32} variant="full" />
        <p 
          className="font-mono"
          style={{
            fontSize: '9px',
            color: 'var(--text-on-dark-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: '6px'
          }}
        >
          CAS Archival System v1.0
        </p>
      </div>

      {/* Main Navigation Group */}
      <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 24px 8px', fontSize: '10px', color: 'var(--text-on-dark-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}>
          LOCATIONS & VIEWS
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  backgroundColor: isActive ? 'rgba(225, 226, 233, 0.12)' : 'transparent',
                  color: isActive ? '#FFF' : 'var(--text-on-dark-muted)',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--accent-bronze)' : '3px solid transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ color: isActive ? 'var(--accent-bronze-fixed)' : 'inherit' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Storage Gauge Widget */}
      <div 
        style={{
          margin: '16px 20px',
          padding: '16px',
          backgroundColor: 'rgba(248, 249, 255, 0.05)',
          border: '1.5px solid rgba(248, 249, 255, 0.12)',
          borderRadius: '2px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-sans)', color: 'var(--text-on-dark)' }}>
            <HardDrive size={14} color="var(--accent-bronze-fixed)" /> Self-Hosted Storage
          </span>
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-bronze-fixed)' }}>
            345.9 MB / 1.0 GB
          </span>
        </div>
        <div 
          style={{
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            marginBottom: '8px'
          }}
        >
          <div style={{ width: '34%', height: '100%', backgroundColor: 'var(--accent-bronze)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-sans)', color: 'var(--text-on-dark-muted)' }}>
          <span>CAS Dedup: 48.9 MB</span>
          <span style={{ color: 'var(--accent-olive)' }}>34% Used</span>
        </div>
      </div>

      {/* System Settings Footer */}
      <div 
        style={{
          padding: '16px 24px',
          borderTop: '1.5px solid rgba(248, 249, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: activeTab === 'settings' ? '#FFF' : 'var(--text-on-dark-muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <Settings size={16} /> Node Settings
        </button>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--accent-olive)', fontFamily: 'var(--font-sans)' }}
          title="Cryptographic RSA/Ed25519 node online"
        >
          <ShieldCheck size={14} /> SECURE
        </div>
      </div>
      
      {/* User Profile / Logout */}
      {user && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1.5px solid rgba(248, 249, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(248, 249, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
            <UserIcon size={14} />
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600 }}>{user.displayName.toUpperCase()}</span>
          </div>
          <button
            onClick={() => logoutUser()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-on-dark-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Disconnect & Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </aside>
  );
};
