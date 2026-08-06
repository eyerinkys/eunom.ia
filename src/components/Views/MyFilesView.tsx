import React, { useState } from 'react';
import { 
  Folder, 
  Download, 
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Move,
  FileText
} from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import type { ApiNode } from '../../types/eunomia';
import { getDownloadUrl, downloadZip } from '../../api/files';

export const MyFilesView: React.FC = () => {
  const { 
    files, 
    folderNodes,
    isFoldersLoading,
    foldersError,
    currentFolderId, 
    setCurrentFolderId, 
    displayMode, 
    searchQuery, 
    selectedFileIds, 
    toggleFileSelection,
    clearSelection,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    renameFolder,
    deleteFolder,
    moveFolder,
    uploadFile,
    selectFile,
    deleteFile
  } = useEunomiaStore();

  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Search query filter (only for mock files in phase 1)
  let currentFiles = files.filter(f => f.folderId === currentFolderId);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    currentFiles = files.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.hash.toLowerCase().includes(q) ||
      f.owner.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (selectedCategoryFilter !== 'all') {
    currentFiles = currentFiles.filter(f => f.type === selectedCategoryFilter);
  }

  const allSelected = currentFiles.length > 0 && currentFiles.every(f => selectedFileIds.includes(f.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      currentFiles.forEach(f => {
        if (!selectedFileIds.includes(f.id)) {
          toggleFileSelection(f.id);
        }
      });
    }
  };



  const handleRenameSubmit = async (folder: ApiNode) => {
    if (renameInput.trim() && renameInput !== folder.name) {
      await renameFolder(folder.id, renameInput);
    }
    setRenamingFolderId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => {
      uploadFile(file);
    });
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
      
      {/* Category Filter Pills & Multi-Select Bar */}
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
              disabled={true}
              title="File upload and filtering coming in Phase 2"
              style={{
                padding: '4px 10px',
                backgroundColor: selectedCategoryFilter === cat ? 'var(--accent-bronze)' : 'var(--bg-canvas)',
                color: selectedCategoryFilter === cat ? '#FFF' : 'var(--text-muted)',
                border: '1.5px solid #171A1F',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: 'not-allowed',
                opacity: 0.6
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
              border: '1.5px solid #171A1F',
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
              style={{ padding: '2px 8px', fontSize: '10px', color: '#BA1A1A', borderColor: '#F2B8B5', backgroundColor: '#FFF0F0' }}
              onClick={() => {
                if (confirm(`Delete ${selectedFileIds.length} selected item(s)?`)) {
                  selectedFileIds.forEach(id => deleteFile(id));
                }
              }}
            >
              <Trash2 size={12} /> Delete Selected
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

      {/* Main Workspace Area */}
      <div 
        style={{ flex: 1, overflowY: 'auto', padding: '20px' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        
        {foldersError && (
          <div className="badge-tampered" style={{ marginBottom: '24px', padding: '12px' }}>
            {foldersError}
          </div>
        )}

        {isFoldersLoading ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Skeletons */}
            {[1, 2, 3].map(i => (
              <div key={i} className="rule-all" style={{ width: '220px', height: '46px', backgroundColor: 'var(--bg-panel)', opacity: 0.5 }} />
            ))}
          </div>
        ) : folderNodes.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            <h3 className="font-serif" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>
              DIRECTORIES ({folderNodes.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {folderNodes.map(folder => (
                <div
                  key={folder.id}
                  className="rule-all row-hover"
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-panel)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {renamingFolderId === folder.id ? (
                    <input 
                      autoFocus
                      value={renameInput}
                      onChange={e => setRenameInput(e.target.value)}
                      onBlur={() => handleRenameSubmit(folder)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameSubmit(folder);
                        if (e.key === 'Escape') setRenamingFolderId(null);
                      }}
                      className="font-mono rule-all"
                      style={{ fontSize: '12px', padding: '2px 6px', width: '120px' }}
                    />
                  ) : (
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                      onClick={() => setCurrentFolderId(folder.id)}
                    >
                      <Folder size={18} color="var(--accent-bronze)" />
                      <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {folder.name}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button 
                      onClick={() => {
                        setRenamingFolderId(folder.id);
                        setRenameInput(folder.name);
                      }} 
                      title="Rename"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => {
                        const target = prompt('Enter new parent folder ID (or "root"):');
                        if (target) moveFolder(folder.id, target);
                      }}
                      title="Move"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <Move size={12} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Delete folder "${folder.name}"?`)) deleteFolder(folder.id);
                      }}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Files Display: Table Mode */}
        {displayMode === 'table' ? (
          <div className="rule-all" style={{ backgroundColor: 'var(--bg-canvas)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr className="rule-b" style={{ backgroundColor: 'var(--bg-panel)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
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
                  <th style={{ padding: '10px 12px' }}>TYPE</th>
                  <th style={{ padding: '10px 12px' }}>OWNER AUTHOR</th>
                  <th style={{ padding: '10px 12px' }}>LAST MODIFIED</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>SIZE</th>
                </tr>
              </thead>
              <tbody>
                {currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No files found. Drag and drop files here to upload.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr 
                        key={file.id} 
                        className={`rule-b row-hover ${isSelected ? 'row-selected' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          if (e.target instanceof HTMLInputElement) return; // let checkbox handle it
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
                            <FileText size={14} color="var(--accent-bronze)" />
                            {file.name}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          <span className="badge-valid" style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-secondary)' }}>
                            {file.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{file.owner}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{file.modifiedAt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{file.sizeFormatted}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View Mode */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {currentFiles.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                No files found. Drag and drop files here to upload.
              </div>
            ) : (
              currentFiles.map(file => (
                <div 
                  key={file.id}
                  className={`rule-all row-hover ${selectedFileIds.includes(file.id) ? 'row-selected' : ''}`}
                  style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
                  onClick={(e) => selectFile(file, e.metaKey || e.ctrlKey)}
                >
                  <FileText size={32} color="var(--accent-bronze)" />
                  <span className="font-sans" style={{ fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</span>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{file.sizeFormatted}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
