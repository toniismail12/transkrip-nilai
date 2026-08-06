import {
  activityLogRepository,
  type ActivityLogCreateData,
} from "@/repositories/activity-log.repository";

/** Action codes are plain strings (not a DB enum) so new features can add their own
 *  without requiring a migration. Convention: ENTITY_ACTION in upper snake case. */
export const ACTIVITY_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  CREATE_MAHASISWA: "CREATE_MAHASISWA",
  UPDATE_MAHASISWA: "UPDATE_MAHASISWA",
  DELETE_MAHASISWA: "DELETE_MAHASISWA",
  IMPORT_MAHASISWA: "IMPORT_MAHASISWA",
  CREATE_FAKULTAS: "CREATE_FAKULTAS",
  UPDATE_FAKULTAS: "UPDATE_FAKULTAS",
  DELETE_FAKULTAS: "DELETE_FAKULTAS",
  CREATE_PROGRAM_STUDI: "CREATE_PROGRAM_STUDI",
  UPDATE_PROGRAM_STUDI: "UPDATE_PROGRAM_STUDI",
  DELETE_PROGRAM_STUDI: "DELETE_PROGRAM_STUDI",
  CREATE_AKREDITASI: "CREATE_AKREDITASI",
  UPDATE_AKREDITASI: "UPDATE_AKREDITASI",
  DELETE_AKREDITASI: "DELETE_AKREDITASI",
  ACTIVATE_AKREDITASI: "ACTIVATE_AKREDITASI",
  GENERATE_TRANSKRIP: "GENERATE_TRANSKRIP",
  VOID_TRANSKRIP: "VOID_TRANSKRIP",
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  TOGGLE_USER_ACTIVE: "TOGGLE_USER_ACTIVE",
  UPDATE_SETTING: "UPDATE_SETTING",
  CHANGE_PASSWORD: "CHANGE_PASSWORD",
  UPDATE_PROFILE: "UPDATE_PROFILE",
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

export interface LogActivityInput {
  userId?: number | null;
  userNama?: string | null;
  action: ActivityAction;
  entityType?: string | null;
  entityId?: number | null;
  description: string;
  metadata?: ActivityLogCreateData["metadata"];
}

/**
 * Records an audit entry. Deliberately never throws: an audit write must not be able
 * to fail the business operation that triggered it — a lost log line is preferable to
 * a rolled-back transcript.
 */
export async function logActivity(input: LogActivityInput) {
  try {
    await activityLogRepository.create({
      userId: input.userId ?? null,
      userNama: input.userNama ?? null,
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      description: input.description,
      metadata: input.metadata,
    });
  } catch (error) {
    console.error("Gagal menulis activity log:", error);
  }
}

export async function listRecentActivity(limit = 5) {
  return activityLogRepository.findRecent(limit);
}
