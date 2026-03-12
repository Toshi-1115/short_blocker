/**
 * X（旧Twitter）ショート動画ブロック用 Content Script
 * messages.js より後に読み込まれる前提（sbApplyOverlay がグローバルに存在）
 */
(() => {

/** ショート動画を検出するセレクタ */
const SHORT_VIDEO_SELECTORS = [
  '[data-testid="TextMediaVideoPlayer"]',
  '[data-testid="videoComponent"]',
] as const;

/** 動画要素が縦長（ショート動画形式）かを判定 */
function isVerticalVideo(el: HTMLElement): boolean {
  const video = el.querySelector("video");
  if (!video) return false;
  const width = video.videoWidth || el.clientWidth;
  const height = video.videoHeight || el.clientHeight;
  if (width === 0 || height === 0) return false;
  return height / width > 1.2;
}

let enabled = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** chrome.runtime が有効か確認してからメッセージ送信 */
function safeSendMessage(msg: any): Promise<any> {
  try {
    if (!chrome.runtime?.id) return Promise.resolve(null);
    return chrome.runtime.sendMessage(msg);
  } catch {
    return Promise.resolve(null);
  }
}

/** ショート動画要素にオーバーレイを適用 */
function blockShortVideos(): void {
  if (!enabled) return;

  let blockedInBatch = 0;

  if (location.pathname.includes("/i/immersive_media_viewer")) {
    const main = document.querySelector<HTMLElement>('[data-testid="primaryColumn"]');
    if (main && sbApplyOverlay(main)) blockedInBatch++;
  }

  const selector = SHORT_VIDEO_SELECTORS.join(", ");
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (isVerticalVideo(el)) {
      const tweet = el.closest<HTMLElement>('article[data-testid="tweet"]');
      if (tweet && sbApplyOverlay(tweet)) blockedInBatch++;
    }
  });

  if (blockedInBatch > 0) {
    safeSendMessage({ type: "INCREMENT_BLOCKED", site: "x" });
  }
}

/** debounce付き */
function debouncedBlock(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(blockShortVideos, 200);
}

/** MutationObserverでDOM変更を監視 */
function observe(): void {
  const observer = new MutationObserver(debouncedBlock);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/** 初期化 */
async function init(): Promise<void> {
  const settings = await safeSendMessage({ type: "GET_SETTINGS" });
  if (!settings) return;
  enabled = settings.x.enabled;

  if (enabled) {
    blockShortVideos();
    observe();
  }
}

/** 設定変更をリアルタイム反映 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    const newSettings = changes.settings.newValue;
    enabled = newSettings.x.enabled;
    if (enabled) {
      blockShortVideos();
    }
  }
});

init();

})();
