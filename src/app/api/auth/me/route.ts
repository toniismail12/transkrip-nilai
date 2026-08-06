import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Belum login", 401);
  }

  return apiSuccess({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
