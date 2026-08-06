import { create } from 'zustand';
import type { ViewTab, DisplayMode, FileItem, FolderItem, StorageCategory, ActivityLog, GraphNode } from '../types/eunomia';
import { INITIAL_FILES, INITIAL_FOLDERS, STORAGE_CATEGORIES, INITIAL_ACTIVITIES, INITIAL_GRAPH_NODES } from '../data/mockData';

interface EunomiaState {
  activeTab: ViewTab;
  currentFolderId: string;
  displayMode: DisplayMode;
  searchQuery: string;
  selectedFileIds: string[];
  activeFile: FileItem | null;
  inspectorTab: 'details' | 'versions' | 'provenance';
  isVerifying: boolean;
  verificationStep: number;
  
  // Data
  files: FileItem[];
  folders: FolderItem[];
  storageCategories: StorageCategory[];
  activities: ActivityLog[];
  graphNodes: GraphNode[];
  
  // Modals
  isUploadModalOpen: boolean;
  isDiffModalOpen: boolean;
  diffComparison: { oldVersion: string; newVersion: string; oldSnippet: string; newSnippet: string } | null;
  selectedCategoryFilter: string;

  // Actions
  setActiveTab: (tab: ViewTab) => void;
  setCurrentFolderId: (folderId: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setSearchQuery: (query: string) => void;
  selectFile: (file: FileItem | null, isMulti?: boolean) => void;
  toggleFileSelection: (fileId: string) => void;
  clearSelection: () => void;
  setInspectorTab: (tab: 'details' | 'versions' | 'provenance') => void;
  triggerProvenanceVerification: () => void;
  setUploadModalOpen: (open: boolean) => void;
  setDiffModalOpen: (open: boolean, diffData?: any) => void;
  setSelectedCategoryFilter: (cat: string) => void;
  addUploadedFile: (name: string, type: FileItem['type'], sizeBytes: number) => void;
  addFolder: (name: string) => void;
}

export const useEunomiaStore = create<EunomiaState>((set, get) => ({
  activeTab: 'files',
  currentFolderId: 'root',
  displayMode: 'table',
  searchQuery: '',
  selectedFileIds: ['f1'],
  activeFile: INITIAL_FILES[0],
  inspectorTab: 'details',
  isVerifying: false,
  verificationStep: 0,
  
  files: INITIAL_FILES,
  folders: INITIAL_FOLDERS,
  storageCategories: STORAGE_CATEGORIES,
  activities: INITIAL_ACTIVITIES,
  graphNodes: INITIAL_GRAPH_NODES,
  
  isUploadModalOpen: false,
  isDiffModalOpen: false,
  diffComparison: null,
  selectedCategoryFilter: 'all',

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setCurrentFolderId: (folderId) => set({ currentFolderId: folderId, selectedFileIds: [] }),
  
  setDisplayMode: (mode) => set({ displayMode: mode }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  selectFile: (file, isMulti = false) => {
    if (!file) {
      set({ selectedFileIds: [], activeFile: null });
      return;
    }
    if (isMulti) {
      const current = get().selectedFileIds;
      const exists = current.includes(file.id);
      const next = exists ? current.filter(id => id !== file.id) : [...current, file.id];
      set({ selectedFileIds: next, activeFile: file });
    } else {
      set({ selectedFileIds: [file.id], activeFile: file });
    }
  },
  
  toggleFileSelection: (fileId) => {
    const current = get().selectedFileIds;
    const exists = current.includes(fileId);
    const next = exists ? current.filter(id => id !== fileId) : [...current, fileId];
    const file = get().files.find(f => f.id === fileId) || get().activeFile;
    set({ selectedFileIds: next, activeFile: file });
  },
  
  clearSelection: () => set({ selectedFileIds: [], activeFile: null }),
  
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  
  triggerProvenanceVerification: () => {
    set({ isVerifying: true, verificationStep: 1 });
    setTimeout(() => set({ verificationStep: 2 }), 400);
    setTimeout(() => set({ verificationStep: 3 }), 800);
    setTimeout(() => set({ isVerifying: false, verificationStep: 4 }), 1200);
  },
  
  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
  
  setDiffModalOpen: (open, diffData = null) => set({ isDiffModalOpen: open, diffComparison: diffData }),
  
  setSelectedCategoryFilter: (cat) => set({ selectedCategoryFilter: cat }),
  
  addUploadedFile: (name, type, sizeBytes) => {
    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const newFile: FileItem = {
      id: `f-${Date.now()}`,
      name,
      folderId: get().currentFolderId,
      path: `/${name}`,
      type,
      extension: `.${name.split('.').pop() || 'bin'}`,
      sizeFormatted: formatSize(sizeBytes),
      sizeBytes,
      owner: 'You',
      modifiedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      provenanceStatus: 'VALID',
      versionCount: 1,
      authorSignature: 'SIG_ED25519_USER_OK',
      opfsCached: true,
      versions: [
        {
          id: `v1-${Date.now()}`,
          version: 'v1',
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          sizeFormatted: formatSize(sizeBytes),
          sizeBytes,
          author: 'You',
          commitNote: 'Initial upload & CAS hashing',
          hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          parentHash: '0000000000000000000000000000000000000000000000000000000000000000'
        }
      ]
    };

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'upload',
      title: 'Uploaded & Content-Addressed',
      description: `Ingested ${name} (${formatSize(sizeBytes)}) into local CAS store`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      statusBadge: 'HASH OK',
      fileId: newFile.id
    };

    set({
      files: [newFile, ...get().files],
      activities: [newActivity, ...get().activities],
      activeFile: newFile,
      selectedFileIds: [newFile.id]
    });
  },

  addFolder: (name) => {
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name,
      parentId: get().currentFolderId,
      path: `/${name}`,
      itemCount: 0,
      modifiedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    set({ folders: [...get().folders, newFolder] });
  }
}));
