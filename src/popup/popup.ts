import type { Settings } from "../types.js";

const youtubeToggle = document.getElementById("youtube-toggle") as HTMLInputElement;
const xToggle = document.getElementById("x-toggle") as HTMLInputElement;
const youtubeCount = document.getElementById("youtube-count") as HTMLElement;
const xCount = document.getElementById("x-count") as HTMLElement;
const totalCount = document.getElementById("total-count") as HTMLElement;

/** UIに設定を反映 */
function renderSettings(settings: Settings): void {
  youtubeToggle.checked = settings.youtube.enabled;
  xToggle.checked = settings.x.enabled;
  youtubeCount.textContent = `${settings.youtube.blockedCount} 件ブロック`;
  xCount.textContent = `${settings.x.blockedCount} 件ブロック`;
  totalCount.textContent = String(
    settings.youtube.blockedCount + settings.x.blockedCount
  );
}

/** 設定を保存 */
async function saveSettings(settings: Settings): Promise<void> {
  await chrome.runtime.sendMessage({
    type: "UPDATE_SETTINGS",
    settings,
  });
}

/** 初期化 */
async function init(): Promise<void> {
  const settings: Settings = await chrome.runtime.sendMessage({
    type: "GET_SETTINGS",
  });
  renderSettings(settings);

  youtubeToggle.addEventListener("change", async () => {
    settings.youtube.enabled = youtubeToggle.checked;
    await saveSettings(settings);
  });

  xToggle.addEventListener("change", async () => {
    settings.x.enabled = xToggle.checked;
    await saveSettings(settings);
  });
}

init();
