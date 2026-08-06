import React from 'react';
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

import { useEunomiaStore } from './store/useEunomiaStore';

export const App: React.FC = () => {
  const { activeTab } = useEunomiaStore();

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
