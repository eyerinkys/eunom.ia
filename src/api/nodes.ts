import { apiFetch } from './client';
import type { ApiNode, Breadcrumb } from '../types/eunomia';

export interface NodeListResponse {
  nodes: ApiNode[];
  breadcrumbs: Breadcrumb[];
}

export async function listNodes(parentId: string): Promise<NodeListResponse> {
  return apiFetch<NodeListResponse>(`/nodes?parent_id=${encodeURIComponent(parentId)}`, {
    method: 'GET'
  });
}

export async function createFolder(name: string, parentId: string): Promise<ApiNode> {
  return apiFetch<ApiNode>('/nodes', {
    method: 'POST',
    body: JSON.stringify({ name, parentId })
  });
}

export async function renameNode(id: string, name: string): Promise<{status: string}> {
  return apiFetch<{status: string}>(`/nodes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  });
}

export async function moveNode(id: string, parentId: string): Promise<{status: string}> {
  return apiFetch<{status: string}>(`/nodes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ parentId })
  });
}

export async function deleteNode(id: string): Promise<{status: string}> {
  return apiFetch<{status: string}>(`/nodes/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}
