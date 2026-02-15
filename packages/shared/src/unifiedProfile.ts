import { Platform } from "./platform.js";

export type UnifiedDSAProfile = {
  platform: Platform;
  username: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  total_solved: number;
  rating?: number;
  contests_count?: number;
  last_synced_at: Date;
};
