import { apiSuccess } from "@/lib/api/response";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  const response = apiSuccess(null, "Logout berhasil");
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
