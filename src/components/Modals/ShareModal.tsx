import React, { useState, useEffect, useRef } from 'react';
import { Share2, X, UserPlus, Check, Shield } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import type { SharePermission } from '../../types/eunomia';
import { animate } from 'animejs';

const DIRECTORY_USERS = [
  { id: 'dir-1', username: 'Dr. Elena Rostova', email: 'elena@eunomia.local' },
  { id: 'dir-2', username: 'Prof. Miller', email: 'miller@eunomia.local' },
  { id: 'dir-3', username: 'Archivist Sarah', email: 'sarah@eunomia.local' },
  { id: 'dir-4', username: 'Lab Station 4', email: 'lab4@eunomia.local' },
  { id: 'dir-5', username: 'Researcher Aris', email: 'aris@eunomia.local' },
];

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ShareModal: React.FC = () => {
  const { 
    isShareModalOpen, 
    setShareModalOpen, 
    activeFile, 
    shareFileWithUser, 
    updateUserPermission, 
    removeUserAccess 
  } = useEunomiaStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'editor' | 'viewer'>('viewer');
  const [addedAnimationUser, setAddedAnimationUser] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isShareModalOpen && modalRef.current) {
      animate(modalRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 220,
        ease: 'outQuad',
      });
    }
  }, [isShareModalOpen]);

  if (!isShareModalOpen || !activeFile) return null;

  const userPerm: SharePermission = activeFile.currentUserPermission || 'owner';
  const isOwner = userPerm === 'owner';
  const isViewer = userPerm === 'viewer';

  const currentAccessList = activeFile.accessList || [
    {
      userId: 'u-owner',
      username: activeFile.owner || 'You',
      email: `${(activeFile.owner || 'you').toLowerCase().replace(/\s+/g, '')}@eunomia.local`,
      permission: 'owner' as const,
    },
  ];

  // Filter search results
  const searchResults = searchQuery.trim()
    ? DIRECTORY_USERS.filter(
        u =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleAddShare = (emailOrName: string) => {
    if (!emailOrName.trim()) return;
    shareFileWithUser(activeFile.id, emailOrName, selectedPermission);
    setAddedAnimationUser(emailOrName);
    setTimeout(() => setAddedAnimationUser(null), 1200);
    setSearchQuery('');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 28, 33, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShareModalOpen(false);
      }}
    >
      <div 
        ref={modalRef}
        className="rule-all"
        style={{
          width: '520px',
          backgroundColor: 'var(--bg-modal)',
          padding: '24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 size={20} color="var(--accent-bronze)" />
            <div>
              <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Share File
              </h3>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {activeFile.name}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShareModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Share Search & Add Inputs */}
        <div>
          <label className="font-sans" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
            Add People & Permissions
          </label>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isViewer ? "Viewers cannot share this file" : "Enter username or email..."}
                disabled={isViewer}
                className="font-sans rule-all"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  opacity: isViewer ? 0.5 : 1,
                  cursor: isViewer ? 'not-allowed' : 'text'
                }}
              />

              {/* Autocomplete Search Dropdown */}
              {searchResults.length > 0 && !isViewer && (
                <div 
                  className="rule-all"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'var(--bg-panel)',
                    zIndex: 20,
                    maxHeight: '160px',
                    overflowY: 'auto',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                  }}
                >
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleAddShare(user.email)}
                      className="row-hover"
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '12px',
                        borderBottom: 'var(--border-rule)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--accent-bronze)' }}>
                          {getInitials(user.username)}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: 'block' }}>{user.username}</span>
                          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{user.email}</span>
                        </div>
                      </div>
                      <UserPlus size={14} color="var(--accent-bronze)" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value as 'editor' | 'viewer')}
              disabled={isViewer}
              className="font-sans rule-all"
              style={{
                padding: '8px 8px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                cursor: isViewer ? 'not-allowed' : 'pointer',
                opacity: isViewer ? 0.5 : 1
              }}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>

            <button
              onClick={() => handleAddShare(searchQuery)}
              disabled={isViewer || !searchQuery.trim()}
              className="btn-primary"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                opacity: isViewer || !searchQuery.trim() ? 0.5 : 1,
                cursor: isViewer || !searchQuery.trim() ? 'not-allowed' : 'pointer'
              }}
              title={isViewer ? "Viewers cannot share files" : "Share with user"}
            >
              Share
            </button>
          </div>

          {addedAnimationUser && (
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-olive)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} /> Shared access granted to {addedAnimationUser}
            </span>
          )}
        </div>

        {/* Access List Table ("People with Access") */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="font-sans" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              People with Access ({currentAccessList.length})
            </label>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={10} color="var(--accent-bronze)" /> PERMISSION STATE: {userPerm.toUpperCase()}
            </span>
          </div>

          <div 
            className="rule-all" 
            style={{ 
              backgroundColor: 'var(--bg-canvas)', 
              maxHeight: '220px', 
              overflowY: 'auto' 
            }}
          >
            {currentAccessList.map((access, idx) => {
              const isUserOwner = access.permission === 'owner';
              return (
                <div
                  key={access.userId || idx}
                  className="rule-b row-hover"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {/* User Profile Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--bg-panel)', 
                        border: 'var(--border-rule)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '10px', 
                        fontWeight: 700,
                        color: isUserOwner ? 'var(--accent-bronze)' : 'var(--text-primary)',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(access.username)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {access.username}
                        </span>
                        {isUserOwner && (
                          <span className="badge-valid font-mono" style={{ fontSize: '9px', padding: '1px 5px' }}>
                            OWNER
                          </span>
                        )}
                      </div>
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                        {access.email}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isUserOwner ? (
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Owner
                      </span>
                    ) : (
                      <>
                        <select
                          value={access.permission}
                          disabled={!isOwner}
                          onChange={(e) => updateUserPermission(activeFile.id, access.userId, e.target.value as 'editor' | 'viewer')}
                          className="font-sans rule-all"
                          style={{
                            padding: '3px 6px',
                            fontSize: '11px',
                            backgroundColor: 'var(--bg-panel)',
                            color: 'var(--text-primary)',
                            opacity: !isOwner ? 0.6 : 1,
                            cursor: !isOwner ? 'not-allowed' : 'pointer'
                          }}
                          title={!isOwner ? "Only file owners can change permissions" : "Change user permission"}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>

                        <button
                          onClick={() => removeUserAccess(activeFile.id, access.userId)}
                          disabled={!isOwner}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: !isOwner ? 'not-allowed' : 'pointer',
                            color: 'var(--accent-red)',
                            opacity: !isOwner ? 0.4 : 1,
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={!isOwner ? "Only file owners can remove user access" : "Remove access"}
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button 
            className="btn-secondary"
            onClick={() => setShareModalOpen(false)}
            style={{ padding: '6px 16px', fontSize: '12px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
