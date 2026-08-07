import React from 'react';
import { 
  FileText, 
  FileCode, 
  Archive, 
  Filter, 
  Download, 
  Users, 
  Eye, 
  Edit3,
  ArrowUpDown
} from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import { getDownloadUrl, downloadZip } from '../../api/files';

const getFileIcon = (type: string) => {
  switch (type) {
    case 'code': return <FileCode size={16} color="var(--accent-bronze)" />;
    case 'archive': return <Archive size={16} color="var(--accent-bronze)" />;
    default: return <FileText size={16} color="var(--accent-bronze)" />;
  }
};

export const SharedWithMeView: React.FC = () => {
  const { 
    files, 
    searchQuery, 
    selectedFileIds, 
    toggleFileSelection, 
    clearSelection, 
    selectFile, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter 
  } = useEunomiaStore();

  // Filter files that are shared with the user (e.g., currentUserPermission === 'editor' or 'viewer' or folderId === 'shared_external')
  let sharedFiles = files.filter(f => 
    f.currentUserPermission === 'editor' || 
    f.currentUserPermission === 'viewer' || 
    f.folderId === 'shared_external'
  );

  // Apply search query filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    sharedFiles = sharedFiles.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.owner.toLowerCase().includes(q) ||
      f.hash.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (selectedCategoryFilter !== 'all') {
    sharedFiles = sharedFiles.filter(f => f.type === selectedCategoryFilter);
  }

  const allSelected = sharedFiles.length > 0 && sharedFiles.every(f => selectedFileIds.includes(f.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      sharedFiles.forEach(f => {
        if (!selectedFileIds.includes(f.id)) {
          toggleFileSelection(f.id);
        }
      });
    }
  };

  const handleDownloadSelected = () => {
    if (selectedFileIds.length === 0) return;
    if (selectedFileIds.length === 1) {
      window.open(getDownloadUrl(selectedFileIds[0]), '_blank');
    } else {
      downloadZip(selectedFileIds).catch(err => alert(err.message));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Category Filter Pills & Multi-Select Action Bar */}
      <div 
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--bg-panel)',
          borderBottom: 'var(--border-rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} /> FILTER:
          </span>
          {['all', 'markdown', 'pdf', 'code', 'archive'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              style={{
                padding: '4px 10px',
                backgroundColor: selectedCategoryFilter === cat ? 'var(--accent-bronze)' : 'var(--bg-canvas)',
                color: selectedCategoryFilter === cat ? '#11161D' : 'var(--text-primary)',
                border: 'var(--border-rule)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {selectedFileIds.length > 0 && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              backgroundColor: 'var(--bg-canvas)',
              border: 'var(--border-rule)',
              padding: '4px 12px'
            }}
          >
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-bronze)' }}>
              {selectedFileIds.length} ITEM(S) SELECTED
            </span>
            <button 
              className="btn-secondary" 
              style={{ padding: '2px 8px', fontSize: '10px' }}
              onClick={handleDownloadSelected}
            >
              <Download size={12} /> Download Selected
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: '2px 8px', fontSize: '10px' }}
              onClick={clearSelection}
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Main Table Workspace Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
        {sharedFiles.length === 0 ? (
          /* Empty State matching Mineral Archival design language */
          <div 
            className="rule-all" 
            style={{ 
              padding: '48px 32px', 
              textAlign: 'center', 
              backgroundColor: 'var(--bg-panel)',
              maxWidth: '540px',
              margin: '40px auto 0'
            }}
          >
            <Users size={36} color="var(--accent-bronze)" style={{ marginBottom: '12px', opacity: 0.8 }} />
            <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              No shared files yet
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              When someone shares a file with you, it will appear here.
            </p>
          </div>
        ) : (
          <div className="rule-all" style={{ backgroundColor: 'var(--bg-canvas)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr className="rule-b" style={{ backgroundColor: 'var(--bg-panel)', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 12px', width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={allSelected} 
                      onChange={toggleSelectAll} 
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '10px 12px' }}>
                    NAME <ArrowUpDown size={10} />
                  </th>
                  <th style={{ padding: '10px 12px' }}>OWNER</th>
                  <th style={{ padding: '10px 12px' }}>YOUR PERMISSION</th>
                  <th style={{ padding: '10px 12px' }}>LAST MODIFIED</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>SIZE</th>
                </tr>
              </thead>
              <tbody>
                {sharedFiles.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);
                  const perm = file.currentUserPermission || 'editor';
                  const isEditor = perm === 'editor';

                  return (
                    <tr 
                      key={file.id} 
                      className={`rule-b row-hover ${isSelected ? 'row-selected' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        if (e.target instanceof HTMLInputElement) return;
                        selectFile(file, e.metaKey || e.ctrlKey);
                      }}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleFileSelection(file.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getFileIcon(file.type)}
                          {file.name}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>
                        {file.owner}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span 
                          className="font-mono"
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 8px', 
                            borderRadius: '2px', 
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: isEditor ? 'rgba(198, 154, 66, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                            color: isEditor ? 'var(--accent-bronze)' : 'var(--text-secondary)',
                            border: `1px solid ${isEditor ? 'var(--accent-bronze)' : 'var(--border-rule)'}`
                          }}
                        >
                          {isEditor ? <Edit3 size={10} /> : <Eye size={10} />}
                          {perm.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {file.modifiedAt}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {file.sizeFormatted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
