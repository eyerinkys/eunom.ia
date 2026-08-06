import { apiFetch } from './client';
import type { ProvenanceEvent, ProvenanceVerificationResult } from '../types/eunomia';

export interface ProvenanceListResponse {
  events: ProvenanceEvent[];
  status: string;
  isValid: boolean;
  eventsCount: number;
  headHash: string;
  verifiedAt: string;
}

export async function getProvenance(nodeId: string): Promise<ProvenanceListResponse> {
  return apiFetch<ProvenanceListResponse>(`/provenance/${nodeId}`, {
    method: 'GET',
  });
}

export async function verifyProvenance(nodeId: string): Promise<ProvenanceVerificationResult> {
  return apiFetch<ProvenanceVerificationResult>(`/provenance/${nodeId}/verify`, {
    method: 'POST',
  });
}
