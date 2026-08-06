import { settingRepository } from "@/repositories/setting.repository";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { InputJsonValue } from "@prisma/client/runtime/client";

interface Actor {
  id: number;
  name: string;
}

export interface PredikatThreshold {
  label: string;
  minIpk: number;
  maxIpk: number;
}

const DEFAULT_PREDIKAT_THRESHOLDS: PredikatThreshold[] = [
  { label: "Dengan Pujian", minIpk: 3.51, maxIpk: 4.0 },
  { label: "Sangat Memuaskan", minIpk: 3.01, maxIpk: 3.5 },
  { label: "Memuaskan", minIpk: 2.76, maxIpk: 3.0 },
  { label: "Cukup", minIpk: 0, maxIpk: 2.75 },
];

export async function listAllSettings() {
  return settingRepository.findAll();
}

export async function getSettingValue<T>(key: string, fallback: T): Promise<T> {
  const setting = await settingRepository.findByKey(key);
  if (!setting) return fallback;
  return setting.value as T;
}

export async function setSettingValue(key: string, value: InputJsonValue, description?: string) {
  return settingRepository.upsert(key, value, description);
}

export async function getSimakadBaseUrl() {
  return getSettingValue<string>("simakad_base_url", "https://simakad.um-palembang.ac.id");
}

export async function getScrapeTimeoutMs() {
  return getSettingValue<number>("scrape_timeout_ms", 15000);
}

export async function getPredikatThresholds(): Promise<PredikatThreshold[]> {
  return getSettingValue<PredikatThreshold[]>("predikat_thresholds", DEFAULT_PREDIKAT_THRESHOLDS);
}

export async function getInstitutionName() {
  return getSettingValue<string>("institution_name", "Universitas Contoh Palembang");
}

export async function getPrintSettings() {
  const [paperSize, topMarginCm, font] = await Promise.all([
    getSettingValue<string>("print_paper_size", "F4"),
    getSettingValue<number>("print_top_margin_cm", 4.5),
    getSettingValue<string>("print_font", "Courier New"),
  ]);
  return { paperSize, topMarginCm, font };
}

export interface EditableSettings {
  institution_name: string;
  institution_address: string;
  simakad_base_url: string;
  scrape_timeout_ms: number;
  predikat_thresholds: PredikatThreshold[];
}

export async function getEditableSettings(): Promise<EditableSettings> {
  const [institutionName, institutionAddress, simakadBaseUrl, scrapeTimeoutMs, thresholds] =
    await Promise.all([
      getInstitutionName(),
      getSettingValue<string>("institution_address", ""),
      getSimakadBaseUrl(),
      getScrapeTimeoutMs(),
      getPredikatThresholds(),
    ]);

  return {
    institution_name: institutionName,
    institution_address: institutionAddress,
    simakad_base_url: simakadBaseUrl,
    scrape_timeout_ms: scrapeTimeoutMs,
    predikat_thresholds: thresholds,
  };
}

const SETTING_DESCRIPTIONS: Record<keyof EditableSettings, string> = {
  institution_name: "Nama institusi, ditampilkan di header transkrip",
  institution_address: "Alamat institusi",
  simakad_base_url: "Base URL sistem SIMAKAD eksternal, sumber data nilai/IPK live",
  scrape_timeout_ms: "Timeout (ms) saat mengambil data dari SIMAKAD",
  predikat_thresholds: "Ambang batas IPK untuk menghitung predikat kelulusan (urut menurun)",
};

export async function updateEditableSettings(input: EditableSettings, actor: Actor) {
  const entries: [keyof EditableSettings, InputJsonValue][] = [
    ["institution_name", input.institution_name],
    ["institution_address", input.institution_address],
    ["simakad_base_url", input.simakad_base_url],
    ["scrape_timeout_ms", input.scrape_timeout_ms],
    ["predikat_thresholds", input.predikat_thresholds as unknown as InputJsonValue],
  ];

  for (const [key, value] of entries) {
    await setSettingValue(key, value, SETTING_DESCRIPTIONS[key]);
  }

  const settings = await getEditableSettings();

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.UPDATE_SETTING,
    entityType: "Setting",
    entityId: null,
    description: "Memperbarui pengaturan sistem",
  });

  return settings;
}
