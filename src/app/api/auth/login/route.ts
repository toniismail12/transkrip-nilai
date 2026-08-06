import { NextRequest } from "next/server";
import { loginSchema } from "@/validators/auth.validator";
import { login } from "@/services/auth.service";
import { apiSuccess, apiError } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

const EIGHT_HOURS_IN_SECONDS = 60 * 60 * 8;
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

const LOGIN_ATTEMPT_LIMIT = 8;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const rateLimitKey = `login:${getClientIp(request)}`;

  try {
    const { allowed, retryAfterSeconds } = checkRateLimit(
      rateLimitKey,
      LOGIN_ATTEMPT_LIMIT,
      LOGIN_WINDOW_MS,
    );
    if (!allowed) {
      return apiError(
        `Terlalu banyak percobaan login. Coba lagi dalam ${retryAfterSeconds} detik.`,
        429,
      );
    }

    const body = await request.json();
    const input = loginSchema.parse(body);
    const result = await login(input);

    // Successful login clears the attempt counter so a legitimate user who
    // mistyped a few times isn't left throttled.
    resetRateLimit(rateLimitKey);

    const response = apiSuccess({ user: result.user }, "Login berhasil");
    response.cookies.set(SESSION_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: result.expiresIn === "30d" ? THIRTY_DAYS_IN_SECONDS : EIGHT_HOURS_IN_SECONDS,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
