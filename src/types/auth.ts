export type Role = "ADMIN" | "OPERATOR";

export interface SessionPayload {
  sub: string;
  username: string;
  role: Role;
}
