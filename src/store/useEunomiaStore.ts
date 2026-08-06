import { create } from 'zustand';
import type { ViewTab, DisplayMode, FileItem, FolderItem, StorageCategory, ActivityLog, GraphNode, User, ApiNode, Breadcrumb } from '../types/eunomia';
import { INITIAL_FILES, STORAGE_CATEGORIES, INITIAL_ACTIVITIES, INITIAL_GRAPH_NODES } from '../data/mockData';
import * as authApi from '../api/auth';
import * as nodesApi from '../api/nodes';

interface EunomiaState {
  activeTab: ViewTab;
  currentFolderId: string | null;
  displayMode: DisplayMode;
  searchQuery: string;
  selectedFileIds: string[];
  activeFile: FileItem | null;
  inspectorTab: 'details' | 'versions' | 'provenance';
  isVerifying: boolean;
  verificationStep: number;
  
  // Auth State
  user: User | null;
  isAuthLoading: boolean;
  authError: string | null;

  // Folder State
  folderNodes: ApiNode[];
  breadcrumbs: Breadcrumb[];
  isFoldersLoading: boolean;
  foldersError: string | null;

  // Visual/Mock Data for Phase 1 (until file upload is implemented)
  files: FileItem[];
  storageCategories: StorageCategory[];
  activities: ActivityLog[];
  graphNodes: GraphNode[];
  
  // Modals
  isUploadModalOpen: boolean;
  isDiffModalOpen: boolean;
  diffComparison: { oldVersion: string; newVersion: string; oldSnippet: string; newSnippet: string } | null;

  // Auth Actions
  checkAuth: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, displayName: string) => Promise<void>;
  logoutUser: () => Promise<void>;

  // Node Actions
  fetchFolders: (parentId: string) => Promise<void>;
  createFolder: (name: string, parentId: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  moveFolder: (id: string, newParentId: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;

  // UI Actions
  setActiveTab: (tab: ViewTab) => void;
  setCurrentFolderId: (folderId: string | null) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setSearchQuery: (query: string) => void;
  selectFile: (file: FileItem | null, isMulti?: boolean) => void;
  toggleFileSelection: (fileId: string) => void;
  clearSelection: () => void;
  setInspectorTab: (tab: 'details' | 'versions' | 'provenance') => void;
  triggerProvenanceVerification: () => void;
  setUploadModalOpen: (open: boolean) => void;
  setDiffModalOpen: (open: boolean, diffData?: any) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  // Stubs for Phase 1
  addUploadedFile: (name: string, type: FileItem['type'], sizeBytes: number) => void;
  folders: FolderItem[];
}

export const useEunomiaStore = create<EunomiaState>((set, get) => ({
  activeTab: 'files',
  currentFolderId: null, // Will be set to root when user logs in and loads data
  displayMode: 'table',
  searchQuery: '',
  selectedFileIds: [],
  activeFile: null,
  inspectorTab: 'details',
  isVerifying: false,
  verificationStep: 0,
  
  user: null,
  isAuthLoading: true, // Start loading to check session
  authError: null,

  folderNodes: [],
  breadcrumbs: [],
  isFoldersLoading: false,
  foldersError: null,

  // Keep mock files for now to avoid breaking UI layout
  files: INITIAL_FILES,
  storageCategories: STORAGE_CATEGORIES,
  activities: INITIAL_ACTIVITIES,
  graphNodes: INITIAL_GRAPH_NODES,
  
  isUploadModalOpen: false,
  isDiffModalOpen: false,
  diffComparison: null,
  selectedCategoryFilter: 'all',
  setSelectedCategoryFilter: (cat: string) => set({ selectedCategoryFilter: cat }),
  // Stubs for Phase 1
  addUploadedFile: () => {
    alert("File uploads are coming in Phase 2!");
  },
  folders: [],

  // Auth Actions
  checkAuth: async () => {
    set({ isAuthLoading: true, authError: null });
    try {
      const user = await authApi.getMe();
      set({ user, isAuthLoading: false });
    } catch {
      // Unauthenticated initial state is expected, not an error
      set({ user: null, isAuthLoading: false, authError: null });
    }
  },

  loginUser: async (email, password) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const user = await authApi.login(email, password);
      set({ user, isAuthLoading: false, activeTab: 'home', currentFolderId: null });
    } catch (err: any) {
      set({ user: null, isAuthLoading: false, authError: err.message || 'Login failed' });
      throw err;
    }
  },

  registerUser: async (email, password, displayName) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const user = await authApi.register(email, password, displayName);
      set({ user, isAuthLoading: false, activeTab: 'home', currentFolderId: null });
    } catch (err: any) {
      set({ user: null, isAuthLoading: false, authError: err.message || 'Registration failed' });
      throw err;
    }
  },

  logoutUser: async () => {
    set({ isAuthLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({ 
        user: null, 
        isAuthLoading: false, 
        folderNodes: [], 
        breadcrumbs: [], 
        currentFolderId: null,
        selectedFileIds: [],
        activeFile: null
      });
    }
  },

  // Node Actions
  fetchFolders: async (parentId) => {
    set({ isFoldersLoading: true, foldersError: null, selectedFileIds: [], activeFile: null });
    try {
      const res = await nodesApi.listNodes(parentId);
      set({ 
        folderNodes: res.nodes, 
        breadcrumbs: res.breadcrumbs, 
        isFoldersLoading: false,
        currentFolderId: parentId
      });
    } catch (err: any) {
      set({ isFoldersLoading: false, foldersError: err.message || 'Failed to load folders' });
    }
  },

  createFolder: async (name, parentId) => {
    try {
      const newNode = await nodesApi.createFolder(name, parentId);
      set({ folderNodes: [...get().folderNodes, newNode] });
    } catch (err: any) {
      alert(err.message || 'Failed to create folder');
    }
  },

  renameFolder: async (id, name) => {
    try {
      await nodesApi.renameNode(id, name);
      // Optimistic update
      set({
        folderNodes: get().folderNodes.map(n => n.id === id ? { ...n, name, updatedAt: new Date().toISOString() } : n)
      });
    } catch (err: any) {
      alert(err.message || 'Failed to rename folder');
    }
  },

  moveFolder: async (id, newParentId) => {
    try {
      await nodesApi.moveNode(id, newParentId);
      // Remove from current view
      set({
        folderNodes: get().folderNodes.filter(n => n.id !== id)
      });
    } catch (err: any) {
      alert(err.message || 'Failed to move folder');
    }
  },

  deleteFolder: async (id) => {
    try {
      await nodesApi.deleteNode(id);
      // Remove from current view
      set({
        folderNodes: get().folderNodes.filter(n => n.id !== id)
      });
    } catch (err: any) {
      alert(err.message || 'Failed to delete folder');
    }
  },

  // UI Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setCurrentFolderId: (folderId) => set({ currentFolderId: folderId, selectedFileIds: [], activeFile: null }),
  
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
  
  setDiffModalOpen: (open, diffData = null) => set({ isDiffModalOpen: open, diffComparison: diffData })
}));
