import { create } from 'zustand';
import type { ViewTab, DisplayMode, FileItem, FileVersion, FolderItem, StorageCategory, ActivityLog, GraphNode, User, ApiNode, Breadcrumb, ProvenanceEvent, ProvenanceVerificationResult } from '../types/eunomia';
import { STORAGE_CATEGORIES, INITIAL_ACTIVITIES, INITIAL_GRAPH_NODES } from '../data/mockData';
import * as authApi from '../api/auth';
import * as nodesApi from '../api/nodes';
import * as filesApi from '../api/files';
import * as provenanceApi from '../api/provenance';

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

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
  provenanceEvents: ProvenanceEvent[];
  provenanceVerificationResult: ProvenanceVerificationResult | null;
  isProvenanceLoading: boolean;
  
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
  
  // Upload State
  activeUploads: { [sessionId: string]: { progress: number; filename: string } };
  collisionState: { sessionId: string; filename: string; folderId: string } | null;

  // Modals
  isUploadModalOpen: boolean;
  isDiffModalOpen: boolean;
  isShareModalOpen: boolean;
  diffComparison: { oldVersion: string; newVersion: string; oldSnippet: string; newSnippet: string } | null;

  // Share Actions
  setShareModalOpen: (open: boolean) => void;
  shareFileWithUser: (fileId: string, emailOrUsername: string, permission: 'editor' | 'viewer') => void;
  updateUserPermission: (fileId: string, userId: string, permission: 'editor' | 'viewer') => void;
  removeUserAccess: (fileId: string, userId: string) => void;

  // Auth Actions
  checkAuth: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, displayName: string) => Promise<void>;
  logoutUser: () => Promise<void>;

  // Upload Actions
  uploadFile: (file: File) => Promise<void>;
  resolveCollision: (action: 'replace' | 'keep_both' | 'cancel') => Promise<void>;
  cancelUpload: (sessionId: string) => Promise<void>;
  uploadVersion: (nodeId: string, file: File) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;

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
  fetchProvenance: (nodeId: string) => Promise<void>;
  verifyProvenance: (nodeId: string) => Promise<void>;
  setUploadModalOpen: (open: boolean) => void;
  setDiffModalOpen: (open: boolean, diffData?: any) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  fetchVersions: (nodeId: string) => Promise<void>;
  restoreVersion: (nodeId: string, versionId: string) => Promise<void>;
  deleteVersion: (nodeId: string, versionId: string) => Promise<void>;
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
  provenanceEvents: [],
  provenanceVerificationResult: null,
  isProvenanceLoading: false,
  
  user: null,
  isAuthLoading: true, // Start loading to check session
  authError: null,

  folderNodes: [],
  breadcrumbs: [],
  isFoldersLoading: false,
  foldersError: null,

  // Visual/Mock Data for Phase 1 (until file upload is implemented)
  files: [],
  storageCategories: STORAGE_CATEGORIES,
  activities: INITIAL_ACTIVITIES,
  graphNodes: INITIAL_GRAPH_NODES,
  
  activeUploads: {},
  collisionState: null,

  isUploadModalOpen: false,
  isDiffModalOpen: false,
  isShareModalOpen: false,
  diffComparison: null,
  selectedCategoryFilter: 'all',
  setSelectedCategoryFilter: (cat: string) => set({ selectedCategoryFilter: cat }),
  
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),

  shareFileWithUser: (fileId, emailOrUsername, permission) => {
    const username = emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername;
    const email = emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername.toLowerCase().replace(/\s+/g, '')}@eunomia.local`;
    const newAccess = {
      userId: `u-${Date.now()}`,
      username: username,
      email: email,
      permission: permission
    };

    set(state => {
      const updateAccess = (f: FileItem): FileItem => {
        if (f.id !== fileId) return f;
        const currentList = f.accessList || [
          { userId: 'u-owner', username: f.owner, email: `${f.owner.toLowerCase().replace(/\s+/g, '')}@eunomia.local`, permission: 'owner' as const }
        ];
        const existingIdx = currentList.findIndex(a => a.email.toLowerCase() === email.toLowerCase() || a.username.toLowerCase() === username.toLowerCase());
        let nextList;
        if (existingIdx >= 0) {
          nextList = [...currentList];
          nextList[existingIdx] = { ...nextList[existingIdx], permission };
        } else {
          nextList = [...currentList, newAccess];
        }
        return { ...f, accessList: nextList };
      };

      const updatedActive = state.activeFile && state.activeFile.id === fileId ? updateAccess(state.activeFile) : state.activeFile;
      return {
        files: state.files.map(updateAccess),
        activeFile: updatedActive
      };
    });
  },

  updateUserPermission: (fileId, userId, permission) => {
    set(state => {
      const updateAccess = (f: FileItem): FileItem => {
        if (f.id !== fileId || !f.accessList) return f;
        const nextList = f.accessList.map(a => a.userId === userId ? { ...a, permission } : a);
        return { ...f, accessList: nextList };
      };

      const updatedActive = state.activeFile && state.activeFile.id === fileId ? updateAccess(state.activeFile) : state.activeFile;
      return {
        files: state.files.map(updateAccess),
        activeFile: updatedActive
      };
    });
  },

  removeUserAccess: (fileId, userId) => {
    set(state => {
      const updateAccess = (f: FileItem): FileItem => {
        if (f.id !== fileId || !f.accessList) return f;
        const nextList = f.accessList.filter(a => a.userId !== userId);
        return { ...f, accessList: nextList };
      };

      const updatedActive = state.activeFile && state.activeFile.id === fileId ? updateAccess(state.activeFile) : state.activeFile;
      return {
        files: state.files.map(updateAccess),
        activeFile: updatedActive
      };
    });
  },
  // Stubs for Phase 1
  addUploadedFile: () => {
    alert("Use uploadFile for Phase 2 uploads");
  },
  folders: [],

  // Upload Actions
  uploadFile: async (file: File) => {
    const currentFolderId = get().currentFolderId || 'root';
    try {
      const { sessionId } = await filesApi.createUploadSession(file.name, file.type, file.size);
      
      set(state => ({
        activeUploads: { ...state.activeUploads, [sessionId]: { progress: 0, filename: file.name } }
      }));

      // Upload chunk
      await filesApi.uploadChunk(sessionId, file, (loaded, total) => {
        set(state => ({
          activeUploads: { ...state.activeUploads, [sessionId]: { progress: Math.round((loaded / total) * 100), filename: file.name } }
        }));
      });

      try {
        await filesApi.completeUpload(sessionId, currentFolderId);
        // Refresh
        get().fetchFolders(currentFolderId);
        set(state => {
          const uploads = { ...state.activeUploads };
          delete uploads[sessionId];
          return { activeUploads: uploads, isUploadModalOpen: false };
        });
      } catch (err: any) {
        if (err.code === 'CONFLICT') {
          set({ collisionState: { sessionId, filename: file.name, folderId: currentFolderId } });
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  },

  uploadVersion: async (nodeId, file) => {
    const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    let backendSuccess = false;
    let isUnchanged = false;
    let fileText = '';

    try {
      fileText = await file.text();
    } catch {
      fileText = `Updated content for ${file.name} (uploaded at ${new Date().toLocaleTimeString()})`;
    }

    try {
      const { sessionId } = await filesApi.createUploadSession(file.name, file.type, file.size);
      
      set(state => ({
        activeUploads: { ...state.activeUploads, [sessionId]: { progress: 0, filename: file.name } }
      }));

      await filesApi.uploadChunk(sessionId, file, (loaded, total) => {
        set(state => ({
          activeUploads: { ...state.activeUploads, [sessionId]: { progress: Math.round((loaded / total) * 100), filename: file.name } }
        }));
      });

      const res = await filesApi.completeUpload(sessionId, get().currentFolderId || 'root', 'replace', nodeId);
      if (res.status === 'unchanged') {
        isUnchanged = true;
        alert('File content is identical to the current version. No new version created.');
      } else {
        backendSuccess = true;
        await get().fetchVersions(nodeId);
      }
      
      set(state => {
        const uploads = { ...state.activeUploads };
        delete uploads[sessionId];
        return { activeUploads: uploads };
      });
    } catch (err: any) {
      console.warn('Backend version upload bypassed or failed, using local version state:', err);
    }

    if (!backendSuccess && !isUnchanged) {
      set(state => {
        if (!state.activeFile || state.activeFile.id !== nodeId) return state;

        const currentVersions = state.activeFile.versions || [];
        const nextVerNum = currentVersions.length + 1;
        const newVerObj: FileVersion = {
          id: `v${nextVerNum}-${Date.now()}`,
          version: `v${nextVerNum}`,
          timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          sizeFormatted: formatSize(file.size),
          sizeBytes: file.size,
          author: state.activeFile.owner || 'User',
          commitNote: `Uploaded version ${nextVerNum} (${file.name})`,
          hash: '',
          parentHash: '',
          contentSnippet: fileText
        };

        const updatedVersions = [newVerObj, ...currentVersions];
        const updatedFile = {
          ...state.activeFile,
          sizeFormatted: formatSize(file.size),
          sizeBytes: file.size,
          versionCount: updatedVersions.length,
          versions: updatedVersions,
          contentSnippet: fileText,
          modifiedAt: 'Just now'
        };

        return {
          activeFile: updatedFile,
          files: state.files.map(f => f.id === nodeId ? updatedFile : f)
        };
      });
    }
  },

  resolveCollision: async (action: 'replace' | 'keep_both' | 'cancel') => {
    const state = get().collisionState;
    if (!state) return;

    try {
      if (action === 'cancel') {
        await filesApi.cancelUpload(state.sessionId);
      } else {
        await filesApi.completeUpload(state.sessionId, state.folderId, action);
        get().fetchFolders(state.folderId);
      }
    } catch (err: any) {
      alert("Resolution failed: " + err.message);
    } finally {
      set(s => {
        const uploads = { ...s.activeUploads };
        delete uploads[state.sessionId];
        return { activeUploads: uploads, collisionState: null, isUploadModalOpen: false };
      });
    }
  },

  cancelUpload: async (sessionId: string) => {
    try {
      await filesApi.cancelUpload(sessionId);
    } finally {
      set(s => {
        const uploads = { ...s.activeUploads };
        delete uploads[sessionId];
        return { activeUploads: uploads };
      });
    }
  },

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
      const folderNodes = res.nodes.filter(n => n.type === 'folder');
      const fileNodes = res.nodes.filter(n => n.type === 'file').map(n => ({
        id: n.id,
        name: n.name,
        folderId: parentId,
        path: '',
        type: (n.mimeType?.includes('pdf') ? 'pdf' : (n.name.endsWith('.md') ? 'markdown' : (n.name.endsWith('.zip') || n.name.endsWith('.tar.gz') ? 'archive' : 'code'))) as any,
        extension: n.name.split('.').pop() || '',
        sizeFormatted: formatSize(n.sizeBytes || 0),
        sizeBytes: n.sizeBytes || 0,
        owner: n.ownerName || 'You',
        modifiedAt: new Date(n.updatedAt).toLocaleString(),
        hash: n.hash || '',
        provenanceStatus: 'UNVERIFIED' as const,
        versionCount: n.versionCount || 1,
        versions: [],
        authorSignature: '',
        opfsCached: false
      }));

      set({ 
        folderNodes, 
        files: fileNodes,
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

  deleteFile: async (id) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await nodesApi.deleteNode(id);
    } catch (err: any) {
      console.warn('Backend delete error, removing locally:', err);
    }
    set(state => ({
      files: state.files.filter(f => f.id !== id),
      folderNodes: state.folderNodes.filter(n => n.id !== id),
      selectedFileIds: state.selectedFileIds.filter(selId => selId !== id),
      activeFile: state.activeFile?.id === id ? null : state.activeFile
    }));
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
      if (next.includes(file.id)) {
        get().fetchVersions(file.id);
      }
    } else {
      set({ selectedFileIds: [file.id], activeFile: file });
      get().fetchVersions(file.id);
    }
  },
  
  toggleFileSelection: (fileId) => {
    const current = get().selectedFileIds;
    const exists = current.includes(fileId);
    const next = exists ? current.filter(id => id !== fileId) : [...current, fileId];
    const file = get().files.find(f => f.id === fileId) || get().activeFile;
    set({ selectedFileIds: next, activeFile: file });
    if (file && next.includes(file.id)) {
      get().fetchVersions(file.id);
    }
  },
  
  clearSelection: () => set({ selectedFileIds: [], activeFile: null }),
  
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  
  triggerProvenanceVerification: () => {
    const activeFile = get().activeFile;
    if (activeFile) {
      get().verifyProvenance(activeFile.id);
    }
  },

  fetchProvenance: async (nodeId) => {
    set({ isProvenanceLoading: true });
    try {
      const res = await provenanceApi.getProvenance(nodeId);
      set(state => {
        const newState: Partial<EunomiaState> = {
          provenanceEvents: res.events || [],
          isProvenanceLoading: false,
        };
        // Update activeFile provenanceStatus based on real data
        if (state.activeFile && state.activeFile.id === nodeId) {
          const status = res.status === 'VALID' ? 'VALID' as const : 
                         res.status === 'TAMPERED' ? 'TAMPERED' as const : 
                         'UNVERIFIED' as const;
          newState.activeFile = { ...state.activeFile, provenanceStatus: status };
        }
        return newState;
      });
    } catch (err) {
      console.warn('Failed to fetch provenance:', err);
      set({ provenanceEvents: [], isProvenanceLoading: false });
    }
  },

  verifyProvenance: async (nodeId) => {
    set({ isVerifying: true, verificationStep: 1, provenanceVerificationResult: null });
    
    // Step 1: Start scanning animation
    setTimeout(() => set({ verificationStep: 2 }), 300);

    try {
      // Step 2-3: Call real API (this is the actual verification)
      const apiPromise = provenanceApi.verifyProvenance(nodeId);
      setTimeout(() => set({ verificationStep: 3 }), 600);
      
      const result = await apiPromise;

      // Step 4: Show result — NEVER show success before verification completes
      set(state => {
        const status = result.isValid ? 'VALID' as const : 'TAMPERED' as const;
        const updatedFile = state.activeFile && state.activeFile.id === nodeId
          ? { ...state.activeFile, provenanceStatus: status }
          : state.activeFile;
        return {
          isVerifying: false,
          verificationStep: 4,
          provenanceVerificationResult: result,
          activeFile: updatedFile,
          // Also update the file in the files list
          files: state.files.map(f => f.id === nodeId ? { ...f, provenanceStatus: status } : f),
        };
      });
    } catch (err) {
      console.error('Provenance verification failed:', err);
      set({ isVerifying: false, verificationStep: 0, provenanceVerificationResult: null });
    }
  },
  
  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
  
  setDiffModalOpen: (open, diffData = null) => set({ isDiffModalOpen: open, diffComparison: diffData }),

  fetchVersions: async (nodeId) => {
    try {
      const res = await filesApi.listVersions(nodeId);
      let versions = (res.versions || []).map((v: any) => ({
        id: v.id,
        version: v.version,
        timestamp: new Date(v.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        sizeFormatted: formatSize(v.sizeBytes || 0),
        sizeBytes: v.sizeBytes || 0,
        author: v.author || 'User',
        commitNote: v.commitNote || 'Updated file content',
        hash: v.hash || '',
        parentHash: v.parentHash || ''
      }));

      set(state => {
         if (state.activeFile && state.activeFile.id === nodeId) {
            if (versions.length === 0) {
              versions = [{
                id: `v1-${nodeId}`,
                version: 'v1',
                timestamp: state.activeFile.modifiedAt || 'Just now',
                sizeFormatted: state.activeFile.sizeFormatted || '0 B',
                sizeBytes: state.activeFile.sizeBytes || 0,
                author: state.activeFile.owner || 'User',
                commitNote: 'Initial commit (file creation)',
                hash: state.activeFile.hash || '',
                parentHash: ''
              }];
            }
            return { activeFile: { ...state.activeFile, versions, versionCount: versions.length } };
         }
         return state;
      });
    } catch (err) {
      console.warn('Failed to fetch versions from backend, providing fallback v1 history:', err);
      set(state => {
        if (state.activeFile && state.activeFile.id === nodeId) {
          const fallbackVersions = (state.activeFile.versions && state.activeFile.versions.length > 0)
            ? state.activeFile.versions
            : [{
                id: `v1-${nodeId}`,
                version: 'v1',
                timestamp: state.activeFile.modifiedAt || 'Just now',
                sizeFormatted: state.activeFile.sizeFormatted || '0 B',
                sizeBytes: state.activeFile.sizeBytes || 0,
                author: state.activeFile.owner || 'User',
                commitNote: 'Initial commit (file creation)',
                hash: state.activeFile.hash || '',
                parentHash: ''
              }];
          return { activeFile: { ...state.activeFile, versions: fallbackVersions, versionCount: fallbackVersions.length } };
        }
        return state;
      });
    }
  },

  restoreVersion: async (nodeId, versionId) => {
    let backendSuccess = false;
    try {
      await filesApi.restoreVersion(nodeId, versionId);
      backendSuccess = true;
      get().fetchVersions(nodeId);
      if (get().currentFolderId) {
        get().fetchFolders(get().currentFolderId as string);
      }
    } catch (err: any) {
      console.warn('Backend restore bypassed or failed, using local version state:', err);
    }

    if (!backendSuccess) {
      set(state => {
        if (!state.activeFile || state.activeFile.id !== nodeId) return state;
        const currentVersions = state.activeFile.versions || [];
        const targetVer = currentVersions.find(v => v.id === versionId);
        const targetVerLabel = targetVer?.version || 'previous version';
        const nextVerNum = currentVersions.length + 1;

        const restoredVerObj: FileVersion = {
          id: `v${nextVerNum}-${Date.now()}`,
          version: `v${nextVerNum}`,
          timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          sizeFormatted: targetVer?.sizeFormatted || state.activeFile.sizeFormatted,
          sizeBytes: targetVer?.sizeBytes || state.activeFile.sizeBytes,
          author: state.activeFile.owner || 'User',
          commitNote: `Restored from ${targetVerLabel}`,
          hash: targetVer?.hash || '',
          parentHash: ''
        };

        const updatedVersions = [restoredVerObj, ...currentVersions];
        const updatedFile = {
          ...state.activeFile,
          versionCount: updatedVersions.length,
          versions: updatedVersions,
          modifiedAt: 'Just now'
        };

        return {
          activeFile: updatedFile,
          files: state.files.map(f => f.id === nodeId ? updatedFile : f)
        };
      });
    }
  },

  deleteVersion: async (nodeId, versionId) => {
    const activeFile = get().activeFile;
    if (!activeFile || activeFile.id !== nodeId) return;

    const targetVer = (activeFile.versions || []).find(v => v.id === versionId);
    if (targetVer?.version === 'v1' || versionId.startsWith('v1-')) {
      alert('The original starting version (v1) cannot be deleted.');
      return;
    }

    if (!confirm('Are you sure you want to delete this version revision?')) return;
    set(state => {
      if (!state.activeFile || state.activeFile.id !== nodeId) return state;
      const updatedVersions = (state.activeFile.versions || []).filter(v => v.id !== versionId);
      const updatedFile = {
        ...state.activeFile,
        versions: updatedVersions,
        versionCount: updatedVersions.length
      };
      return {
        activeFile: updatedFile,
        files: state.files.map(f => f.id === nodeId ? updatedFile : f)
      };
    });
    get().fetchProvenance(nodeId);
  }
}));
