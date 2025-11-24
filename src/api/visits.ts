// src/api/visits.ts
import { get, del } from "./apiClient";

/* ===============================
    1. Transcript 타입
================================ */
export interface TranscriptItem {
  id: number;
  speaker: "visitor" | "ai" | "user"; // 백엔드 speaker와 매칭
  message: string;
  created_at: string;
}

/* ===============================
    2. Visit 타입 (영상 URL 포함)
================================ */
export interface Visit {
  id: number;
  summary: string;
  device_id: number;
  visitor_photo_url: string | null;
  visitor_audio_url: string | null;
  ai_response_audio_url: string | null;
  visitor_video_url: string | null; // ⭐ 추가됨
  created_at: string;
  transcripts?: TranscriptItem[];
}

/* ===============================
    3. 방문 기록 리스트
================================ */
export async function getVisits(skip = 0, limit = 10): Promise<Visit[]> {
  const query = `?skip=${skip}&limit=${limit}`;
  return get<Visit[]>(`/visits/${query}`);
}

/* ===============================
    4. 방문 상세 (영상 URL 포함)
================================ */
export async function getVisitDetail(visitId: number): Promise<Visit> {
  return get<Visit>(`/visits/${visitId}`);
}

/* ===============================
    5. Transcript 전용 API
    (영상 URL 없음)
================================ */
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

/* ===============================
    6. 특정 기기 방문 목록
================================ */
export async function getVisitsByDeviceUid(
  deviceUid: string
): Promise<Visit[]> {
  return get<Visit[]>(`/devices/${deviceUid}/visits`);
}

/* ===============================
    7. 방문 기록 삭제
================================ */
export async function deleteVisit(visitId: number): Promise<string | null> {
  return del<string | null>(`/visits/${visitId}`);
}
