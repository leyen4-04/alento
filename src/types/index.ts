// src/types/index.ts

// 1. 사용자 정보
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_home: boolean;
  return_time: string | null;
  memo: string | null;
}

// 2. 기기 정보
export interface Device {
  id: number;
  name: string;
  device_uid: string;
  memo?: string | null;
  user_id: number;
  // api_key는 기기 등록 직후 응답에만 포함될 수 있음
  api_key?: string; 
}

// 3. 방문 기록
export interface Visit {
  id: number;
  summary: string;
  device_id: number;
  visitor_photo_url?: string | null;
  visitor_audio_url?: string | null;
  ai_response_audio_url?: string | null;
  created_at: string;
  transcripts?: Transcript[];
}

// 4. 대화 내용 (Transcript)
export interface Transcript {
  id: number;
  speaker: string; // 'visitor', 'ai', 'user'
  message: string;
  created_at: string;
}

// 5. 일정 (Appointment)
export interface Appointment {
  id: number;
  title: string;
  start_time: string; // ISO 8601 string
  end_time: string | null;
  status: string; // 'SCHEDULED' 등
  user_id: number;
  visit_id: number | null;
}