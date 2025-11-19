// src/api/users.ts
import { get, postJson, patchJson, postForm } from './apiClient';

// 🔹 백엔드 User 스키마에 맞춰 타입 정의
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_home: boolean;
  return_time: string | null;
  memo: string | null;
}

// 🔹 회원가입 요청 바디
export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
}

// 🔹 로그인 응답
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ---------- 1. 회원가입 ----------
// POST /users/signup
export async function signUpUser(payload: SignUpRequest): Promise<User> {
  return postJson<User>('/users/signup', payload);
}

// ---------- 2. 로그인 ----------
// POST /token  (x-www-form-urlencoded)
export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams();
  // 명세서: username, password 필드
  form.append('username', email);
  form.append('password', password);

  return postForm<TokenResponse>('/token', form);
}

// ---------- 3. 내 정보 조회 ----------
// GET /users/me
export async function getMe(): Promise<User> {
  return get<User>('/users/me');
}

// ---------- 4. 내 기본 정보 수정 ----------
// PATCH /users/me
export interface UpdateMeRequest {
  full_name?: string;
  email?: string;
  memo?: string;
}

export async function updateMe(payload: UpdateMeRequest): Promise<User> {
  return patchJson<User>('/users/me', payload);
}

// ---------- 5. 내 상태(is_home 등) 수정 ----------
// PATCH /users/me/status
export interface UpdateStatusRequest {
  is_home?: boolean;
  return_time?: string;
  memo?: string;
}

export async function updateStatus(payload: UpdateStatusRequest): Promise<User> {
  return patchJson<User>('/users/me/status', payload);
}
