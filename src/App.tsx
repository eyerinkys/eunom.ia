import React, { useEffect } from 'react';
import { Sidebar } from './components/Shell/Sidebar';
import { TopBar } from './components/Shell/TopBar';
import { BreadcrumbBar } from './components/Shell/BreadcrumbBar';
import { InspectorPanel } from './components/Inspector/InspectorPanel';

import { HomeView } from './components/Views/HomeView';
import { MyFilesView } from './components/Views/MyFilesView';
import { StorageVisualizerView } from './components/Views/StorageVisualizerView';
import { StructuralFileGraphView } from './components/Views/StructuralFileGraphView';
import { DriveImportView } from './components/Views/DriveImportView';
import { SettingsView } from './components/Views/SettingsView';

import { UploadModal } from './components/Modals/UploadModal';
import { DiffModal } from './components/Modals/DiffModal';
import { LoginView } from './components/Views/LoginView';

import { useEunomiaStore } from './store/useEunomiaStore';

export const App: React.FC = () => {
  const { activeTab, user, isAuthLoading, checkAuth, fetchFolders } = useEunomiaStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      // Start by loading the root folder contents
      fetchFolders('root'); // Our mock data implies root folder exists, but the DB creates it with an ID.
                            // We need to fetch the root folder. We can assume parentId=null means root, 
                            // but our endpoint requires parent_id. Wait, how do we get the root folder id?
                            // Actually, in Phase 1, our users are created with a root folder. We can either
                            // update the backend to support `parent_id=root` as a special case or query
                            // nodes with parent_id IS NULL.
    }
  }, [user, fetchFolders]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'files':
        return <MyFilesView />;
      case 'storage':
        return <StorageVisualizerView />;
      case 'graph':
        return <StructuralFileGraphView />;
      case 'drive':
        return <DriveImportView />;
      case 'settings':
        return <SettingsView />;
      case 'trash':
        return (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h2 className="font-serif" style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Trash / Retention Quarantine
            </h2>
            <p>No deleted blobs currently pending garbage collection.</p>
          </div>
        );
      default:
        return <MyFilesView />;
    }
  };

  if (isAuthLoading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-canvas)' }}>
        <p className="font-mono">INITIALIZING EUNOMIA...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* 1. Global Navigation Sidebar (Fixed 280px) */}
      <Sidebar />

      {/* 2. Central Workspace Container (Fluid) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <TopBar />
        <BreadcrumbBar />
        
        <main style={{ flex: 1, overflow: 'hidden', backgroundColor: 'var(--bg-canvas)' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* 3. Stationary File Inspector Drawer (Fixed 360px) */}
      <InspectorPanel />

      {/* Overlays / Modals */}
      <UploadModal />
      <DiffModal />
    </div>
  );
};

export default App;
