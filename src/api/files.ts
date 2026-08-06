import { apiFetch, ApiError } from './client';

export async function createUploadSession(filename: string, mimeType: string, totalSize: number) {
  return apiFetch<{ sessionId: string }>('/uploads', {
    method: 'POST',
    body: JSON.stringify({ filename, mimeType, totalSize })
  });
}

export async function uploadChunk(
  sessionId: string, 
  chunk: Blob, 
  onProgress?: (loaded: number, total: number) => void
): Promise<{ bytesWritten: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/uploads/${sessionId}`);
    xhr.withCredentials = true;
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.loaded, e.total);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch {
          resolve({ bytesWritten: chunk.size });
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new ApiError(errorData.error?.message || 'Upload failed', errorData.error?.code || 'UNKNOWN'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(chunk);
  });
}

export async function completeUpload(sessionId: string, folderId: string, action?: 'replace' | 'keep_both' | 'cancel', nodeId?: string) {
  return apiFetch<{ status: string; nodeId?: string; hash?: string }>('/uploads/' + sessionId + '/complete', {
    method: 'POST',
    body: JSON.stringify({ folderId, action: action || '', nodeId })
  });
}

export async function cancelUpload(sessionId: string) {
  return apiFetch<{ status: string }>('/uploads/' + sessionId, {
    method: 'DELETE'
  });
}

export function getDownloadUrl(nodeId: string) {
  return `/api/files/${nodeId}/download`;
}

export async function downloadZip(nodeIds: string[]) {
  const response = await fetch('/api/files/download-zip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nodeIds })
  });

  if (!response.ok) {
    throw new Error('Failed to generate zip download');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'eunomia_archive.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function listVersions(nodeId: string) {
  return apiFetch<{ versions: any[] }>(`/files/${nodeId}/versions`, {
    method: 'GET'
  });
}

export async function restoreVersion(nodeId: string, versionId: string) {
  return apiFetch<{ status: string }>(`/files/${nodeId}/versions/${versionId}/restore`, {
    method: 'POST'
  });
}

export function getVersionDownloadUrl(nodeId: string, versionId: string) {
  return `/api/files/${nodeId}/versions/${versionId}/download`;
}
