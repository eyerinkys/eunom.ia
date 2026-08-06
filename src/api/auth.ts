import { apiFetch } from './client';
import type { User } from '../types/eunomia';

export async function register(email: string, password: string, displayName: string): Promise<User> {
  return apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName })
  });
}

export async function login(email: string, password: string): Promise<User> {
  return apiFetch<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function logout(): Promise<{status: string}> {
  return apiFetch<{status: string}>('/auth/logout', {
    method: 'POST'
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me', {
    method: 'GET'
  });
}
