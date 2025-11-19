// src/api/visits.ts
import { get, del } from './apiClient';

// 🔹 Transcript(대화 한 줄) 타입 (GET /visits/{visit_id}/transcript 참고)
export interface TranscriptItem {
  id: number;
  speaker: string;    // "visitor" | "ai" | "user" 로 매핑해서 쓸 수 있음
  message: string;
  created_at: string;
}

// 🔹 Visit 기본 타입 (GET /visits/, /visits/{id}, /devices/{device_uid}/visits 공통)
export interface Visit {
  id: number;
  summary: string;
  device_id: number;
  visitor_photo_url: string | null;
  visitor_audio_url: string | null;
  ai_response_audio_url: string | null;
  created_at: string;
  transcripts?: TranscriptItem[];  // 일부 엔드포인트에서는 포함될 수 있음
}

// ---------- 1. 방문 기록 리스트 ----------
// GET /visits/?skip=&limit=
export async function getVisits(skip = 0, limit = 10): Promise<Visit[]> {
  const query = `?skip=${skip}&limit=${limit}`;
  return get<Visit[]>(`/visits/${query}`);
}

// ---------- 2. 특정 방문 상세 ----------
// GET /visits/{visit_id}
export async function getVisitDetail(visitId: number): Promise<Visit> {
  return get<Visit>(`/visits/${visitId}`);
}

// ---------- 3. 특정 방문 transcript ----------
// GET /visits/{visit_id}/transcript
export interface VisitTranscriptResponse {
  visit_id: number;
  summary: string;
  created_at: string;
  transcripts: TranscriptItem[];
}

export async function getVisitTranscript(
  visitId: number
): Promise<VisitTranscriptResponse> {
  return get<VisitTranscriptResponse>(`/visits/${visitId}/transcript`);
}

// ---------- 4. 기기별 방문 기록 리스트 ----------
// GET /devices/{device_uid}/visits
export async function getVisitsByDeviceUid(
  deviceUid: string
): Promise<Visit[]> {
  return get<Visit[]>(`/devices/${deviceUid}/visits`);
}

// ---------- 5. 방문 기록 삭제 ----------
// DELETE /visits/{visit_id}
export async function deleteVisit(visitId: number): Promise<string | null> {
  return del<string | null>(`/visits/${visitId}`);
}
