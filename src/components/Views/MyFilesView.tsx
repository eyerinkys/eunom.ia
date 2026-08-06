import React from 'react';
import { 
  Folder, 
  FileText, 
  Download, 
  ChevronRight, 
  Filter,
  FileCode,
  Archive,
  ArrowUpDown
} from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';
import type { FileItem } from '../../types/eunomia';

export const MyFilesView: React.FC = () => {
  const { 
    files, 
    folders, 
    currentFolderId, 
    setCurrentFolderId, 
    displayMode, 
    searchQuery, 
    selectedFileIds, 
    selectFile, 
    toggleFileSelection,
    clearSelection,
    selectedCategoryFilter,
    setSelectedCategoryFilter
  } = useEunomiaStore();

  // Filter current folder items
  const currentFolders = folders.filter(f => f.parentId === currentFolderId);
  let currentFiles = files.filter(f => f.folderId === currentFolderId);

  // Search query filter
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

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'markdown': return <FileText size={16} color="var(--accent-bronze)" />;
      case 'pdf': return <FileText size={16} color="var(--accent-red)" />;
      case 'code': return <FileCode size={16} color="var(--accent-copper)" />;
      case 'archive': return <Archive size={16} color="var(--accent-plum)" />;
      default: return <FileText size={16} color="var(--accent-bronze)" />;
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
        {/* Category Filters */}
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
                color: selectedCategoryFilter === cat ? '#FFF' : 'var(--text-primary)',
                border: '1.5px solid #171A1F',
                fontFamily: 'var(--font-mono)',
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

        {/* Aggregate Selection Action Bar */}
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
              onClick={() => alert(`Downloading ${selectedFileIds.length} file blobs as TAR.GZ archive...`)}
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

      {/* Main Workspace Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
        {/* Folders Section (if any) */}
        {currentFolders.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 className="font-serif" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>
              DIRECTORIES ({currentFolders.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {currentFolders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="rule-all row-hover"
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-panel)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Folder size={18} color="var(--accent-bronze)" />
                    <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>
                      {folder.name}
                    </span>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        )}

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
                      No files in this folder matching filters. Click UPLOAD FILE to ingest data.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr
                        key={file.id}
                        onClick={() => selectFile(file)}
                        className={`rule-b-light row-hover ${isSelected ? 'row-selected' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ padding: '10px 12px' }} onClick={(e) => { e.stopPropagation(); toggleFileSelection(file.id); }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => {}} 
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {getFileIcon(file.type)}
                            <span style={{ fontWeight: 600 }}>{file.name}</span>
                            {file.provenanceStatus === 'VALID' ? (
                              <span className="badge-valid">VERIFIED</span>
                            ) : (
                              <span className="badge-tampered">ALERT</span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono" style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {file.extension.toUpperCase()}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px' }}>{file.owner}</td>
                        <td className="font-mono" style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {file.modifiedAt}
                        </td>
                        <td className="font-mono tabular-nums" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                          {file.sizeFormatted}
                        </td>
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
            {currentFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => selectFile(file)}
                  className={`rule-all row-hover ${isSelected ? 'row-selected' : ''}`}
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      {getFileIcon(file.type)}
                      {file.provenanceStatus === 'VALID' ? (
                        <span className="badge-valid">OK</span>
                      ) : (
                        <span className="badge-tampered">ALERT</span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, wordBreak: 'break-word', marginBottom: '6px' }}>
                      {file.name}
                    </h4>
                    <p className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Author: {file.owner}
                    </p>
                  </div>

                  <div className="rule-t-light" style={{ paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    <span>{file.extension.toUpperCase()}</span>
                    <span style={{ fontWeight: 700 }}>{file.sizeFormatted}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
