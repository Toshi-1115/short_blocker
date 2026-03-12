/** サイトごとの設定 */
export interface SiteConfig {
  enabled: boolean;
  blockedCount: number;
}

/** 全体の設定 */
export interface Settings {
  youtube: SiteConfig;
  x: SiteConfig;
}

/** バックグラウンドへのメッセージ */
export type Message =
  | { type: "GET_SETTINGS" }
  | { type: "UPDATE_SETTINGS"; settings: Settings }
  | { type: "INCREMENT_BLOCKED"; site: keyof Settings };

/** デフォルト設定 */
export const DEFAULT_SETTINGS: Settings = {
  youtube: { enabled: true, blockedCount: 0 },
  x: { enabled: true, blockedCount: 0 },
};
