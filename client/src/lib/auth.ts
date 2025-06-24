import { apiRequest } from './queryClient';

export interface User {
  id: number;
  teamId: string;
  teamName: string;
  isAdmin: boolean;
  totalScore: number;
  currentRank: number;
}

export interface LoginCredentials {
  teamId: string;
  accessToken: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiRequest('GET', '/api/auth/me');
  return response.json();
}

export function getStoredToken(): string | null {
  return localStorage.getItem('ctf_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('ctf_token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('ctf_token');
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
