import { NextResponse } from "next/server";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export function apiSuccess<T>(data: T, message = "Berhasil", status = 200) {
  return NextResponse.json<ApiEnvelope<T>>({ success: true, message, data }, { status });
}

export function apiError(message: string, status = 400, data: unknown = null) {
  return NextResponse.json<ApiEnvelope<unknown>>({ success: false, message, data }, { status });
}
