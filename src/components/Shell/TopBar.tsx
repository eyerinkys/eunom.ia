import { Search, Upload, FolderPlus, LayoutGrid, List } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const TopBar: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    displayMode, 
    setDisplayMode, 
    setUploadModalOpen,
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
        gap: '28px',
        flexShrink: 0
      }}
    >
      {/* Search Input (Scaled and bounded to avoid crowding actions) */}
      <div style={{ display: 'flex', alignItems: 'center', flex: '0 1 360px', minWidth: '220px' }}>
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
              height: '36px',
              paddingLeft: '38px',
              paddingRight: '12px',
              backgroundColor: 'var(--bg-panel)',
              border: 'none',
              borderBottom: 'var(--border-rule)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Global Actions & View Mode Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {/* View Mode Toggle (Pushed right with distinct spacing margin) */}
        <div 
          style={{ 
            display: 'flex', 
            border: 'var(--border-rule)', 
            backgroundColor: 'var(--bg-panel)',
            padding: '2px',
            marginLeft: '12px',
            marginRight: '8px',
            flexShrink: 0
          }}
        >
          <button
            onClick={() => setDisplayMode('table')}
            style={{
              padding: '6px 14px',
              backgroundColor: displayMode === 'table' ? 'var(--accent-bronze)' : 'transparent',
              color: displayMode === 'table' ? '#11161D' : 'var(--text-primary)',
              border: displayMode === 'table' ? '1px solid #C69A42' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              flexShrink: 0
            }}
            title="List Table View"
          >
            <List size={14} /> List
          </button>
          <button
            onClick={() => setDisplayMode('grid')}
            style={{
              padding: '6px 14px',
              backgroundColor: displayMode === 'grid' ? 'var(--accent-bronze)' : 'transparent',
              color: displayMode === 'grid' ? '#11161D' : 'var(--text-primary)',
              border: displayMode === 'grid' ? '1px solid #C69A42' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              flexShrink: 0
            }}
            title="Grid Card View"
          >
            <LayoutGrid size={14} /> Grid
          </button>
        </div>

        <button 
          onClick={handleNewFolder}
          className="btn-secondary"
          style={{ flexShrink: 0 }}
        >
          <FolderPlus size={15} /> New Folder
        </button>

        <button 
          onClick={() => setUploadModalOpen(true)}
          className="btn-primary"
          style={{ flexShrink: 0 }}
        >
          <Upload size={15} /> UPLOAD FILE
        </button>
      </div>
    </header>
  );
};
