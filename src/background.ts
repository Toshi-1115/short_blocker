import { DEFAULT_SETTINGS, type Message, type Settings } from "./types.js";

/** ストレージから設定を取得 */
async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get("settings");
  return result.settings ?? DEFAULT_SETTINGS;
}

/** ストレージに設定を保存 */
async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ settings });
}

/** バッジにブロック総数を表示 */
async function updateBadge(settings: Settings): Promise<void> {
  const total = settings.youtube.blockedCount + settings.x.blockedCount;
  const text = total > 0 ? String(total) : "";
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: "#e53935" });
}

/** メッセージハンドラ */
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    (async () => {
      switch (message.type) {
        case "GET_SETTINGS": {
          const settings = await getSettings();
          sendResponse(settings);
          break;
        }
        case "UPDATE_SETTINGS": {
          await saveSettings(message.settings);
          await updateBadge(message.settings);
          sendResponse(true);
          break;
        }
        case "INCREMENT_BLOCKED": {
          const settings = await getSettings();
          settings[message.site].blockedCount++;
          await saveSettings(settings);
          await updateBadge(settings);
          sendResponse(settings);
          break;
        }
      }
    })();
    return true; // 非同期レスポンスを有効化
  }
);

/** 初期化時にバッジ更新 */
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  await updateBadge(settings);
});
