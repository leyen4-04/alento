// src/api/devices.ts
import { get, postJson, patchJson, del } from './apiClient';

// 🔹 백엔드 명세서 기준 Device 타입
// GET /devices/me, /devices/{device_uid} 응답 예시 참고
export interface Device {
  id: number;
  name: string;
  device_uid: string;
  memo: string | null;
  user_id: number;
  api_key: string;
}

// ---------- 1. 내가 등록한 기기 목록 조회 ----------
// GET /devices/me
export async function getMyDevices(): Promise<Device[]> {
  return get<Device[]>('/devices/me');
}

// ---------- 2. 새 기기 등록 ----------
// POST /devices/register
// body: { name, device_uid, memo }
export interface RegisterDeviceRequest {
  name: string;
  device_uid: string;
  memo?: string;
}

export async function registerDevice(payload: RegisterDeviceRequest): Promise<Device> {
  return postJson<Device>('/devices/register', payload);
}

// ---------- 3. 특정 기기 상세 조회 ----------
// GET /devices/{device_uid}
export async function getDeviceByUid(deviceUid: string): Promise<Device> {
  return get<Device>(`/devices/${deviceUid}`);
}

// ---------- 4. 기기 이름 수정 ----------
// PATCH /devices/{device_uid}/name
// body: { ... } 명세가 additionalProp1 로 되어있지만
// 실제 구현에서는 { name: string } 같은 구조일 가능성이 큼.
// 여기서는 name만 보낸다는 가정으로 작성.
export interface UpdateDeviceNameRequest {
  name: string;
}

export async function updateDeviceName(
  deviceUid: string,
  payload: UpdateDeviceNameRequest
): Promise<Device> {
  return patchJson<Device>(`/devices/${deviceUid}/name`, payload);
}

// ---------- 5. 기기 메모 수정 ----------
// PATCH /devices/{device_uid}/memo
export interface UpdateDeviceMemoRequest {
  memo: string;
}

export async function updateDeviceMemo(
  deviceUid: string,
  payload: UpdateDeviceMemoRequest
): Promise<Device> {
  return patchJson<Device>(`/devices/${deviceUid}/memo`, payload);
}

// ---------- 6. 기기 삭제 ----------
// DELETE /devices/{device_uid}
export async function deleteDevice(deviceUid: string): Promise<string | null> {
  // 백엔드 응답이 "string" 이라서 반환 타입을 string | null 로 둠
  return del<string | null>(`/devices/${deviceUid}`);
}

// ---------- 7. 기기 API Key 인증 ----------
// POST /devices/verify
// 명세상 body가 { "additionalProp1": {} } 로 되어 있으니
// 여기서는 any로 열어둠. 나중에 스키마 확정되면 타입 좁히면 됨.
export async function verifyDevice(body: any): Promise<string> {
  return postJson<string>('/devices/verify', body);
}
                                   