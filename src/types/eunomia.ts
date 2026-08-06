export type ViewTab = 'home' | 'files' | 'storage' | 'graph' | 'drive' | 'trash' | 'settings';

export type DisplayMode = 'table' | 'grid';

export type ProvenanceStatus = 'VALID' | 'TAMPERED' | 'UNVERIFIED';

export interface FileVersion {
  id: string;
  version: string; // e.g. 'v1', 'v2'
  timestamp: string;
  sizeFormatted: string;
  sizeBytes: number;
  author: string;
  commitNote: string;
  hash: string;
  parentHash: string;
  contentSnippet?: string;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string;
  path: string;
  type: 'directory' | 'markdown' | 'pdf' | 'code' | 'image' | 'archive';
  extension: string;
  sizeFormatted: string;
  sizeBytes: number;
  owner: string;
  modifiedAt: string;
  hash: string;
  parentHash?: string;
  provenanceStatus: ProvenanceStatus;
  versionCount: number;
  versions: FileVersion[];
  authorSignature: string;
  opfsCached: boolean;
  contentSnippet?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  itemCount: number;
  modifiedAt: string;
}

export interface StorageCategory {
  id: string;
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  percentage: number;
  color: string;
  fileCount: number;
  description: string;
}

export interface ActivityLog {
  id: string;
  type: 'upload' | 'import' | 'version_created' | 'provenance_verified' | 'tamper_detected';
  title: string;
  description: string;
  timestamp: string;
  statusBadge: string;
  fileId?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'folder' | 'file' | 'version' | 'provenance';
  path: string;
  status: ProvenanceStatus;
  size?: string;
  parentId?: string | null;
  x?: number;
  y?: number;
  children?: string[];
  depth: number;
}
