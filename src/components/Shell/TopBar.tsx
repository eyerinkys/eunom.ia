import React from 'react';
import { Search, Upload, FolderPlus, LayoutGrid, List, CloudDownload } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const TopBar: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    displayMode, 
    setDisplayMode, 
    setUploadModalOpen,
    setActiveTab,
    createFolder,
    currentFolderId
  } = useEunomiaStore();

  const handleNewFolder = async () => {
    const name = prompt('Enter new folder name:');
    if (name && name.trim() && currentFolderId) {
      await createFolder(name.trim(), currentFolderId);
    } else if (!currentFolderId) {
      alert("No folder is currently selected.");
    }
  };

  return (
    <header 
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-canvas)',
        borderBottom: 'var(--border-rule)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}
    >
      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '480px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            placeholder="SEARCH ARCHIVE BY NAME, HASH, OR AUTHOR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              paddingLeft: '38px',
              paddingRight: '12px',
              backgroundColor: 'var(--bg-panel)',
              border: 'none',
              borderBottom: '1.5px solid #171A1F',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Global Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* View Mode Toggle */}
        <div 
          style={{ 
            display: 'flex', 
            border: 'var(--border-rule)', 
            backgroundColor: 'var(--bg-panel)',
            padding: '2px'
          }}
        >
          <button
            onClick={() => setDisplayMode('table')}
            style={{
              padding: '6px 10px',
              backgroundColor: displayMode === 'table' ? 'var(--bg-canvas)' : 'transparent',
              border: displayMode === 'table' ? '1.5px solid #171A1F' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}
            title="List Table View"
          >
            <List size={14} /> List
          </button>
          <button
            onClick={() => setDisplayMode('grid')}
            style={{
              padding: '6px 10px',
              backgroundColor: displayMode === 'grid' ? 'var(--bg-canvas)' : 'transparent',
              border: displayMode === 'grid' ? '1.5px solid #171A1F' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}
            title="Grid Card View"
          >
            <LayoutGrid size={14} /> Grid
          </button>
        </div>

        <button 
          onClick={handleNewFolder}
          className="btn-secondary"
        >
          <FolderPlus size={15} /> New Folder
        </button>

        <button 
          onClick={() => setActiveTab('drive')}
          className="btn-secondary"
        >
          <CloudDownload size={15} /> Drive Import
        </button>

        <button 
          onClick={() => setUploadModalOpen(true)}
          className="btn-primary"
        >
          <Upload size={15} /> UPLOAD FILE
        </button>
      </div>
    </header>
  );
};
