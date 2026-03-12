/**
 * X（旧Twitter）ショート動画ブロック用 Content Script
 *
 * 非表示対象:
 * - タイムライン上の動画付きツイートのうち、短尺動画（縦長サムネイル）
 * - 「おすすめ動画」セクション
 * - Immersive Media Viewer（全画面縦スクロール動画フィード）
 */
(() => {

/** ショート動画を検出するセレクタ */
const SHORT_VIDEO_SELECTORS = [
  // 縦型動画ビューア（Immersive Media Viewer）
  '[data-testid="TextMediaVideoPlayer"]',
  // おすすめ動画カルーセル
  '[data-testid="videoComponent"]',
] as const;

/**
 * 動画要素が縦長（ショート動画形式）かを判定
 * アスペクト比 9:16 に近いものをショート動画と見なす
 */
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

/** ショート動画要素を非表示にする */
function hideShortVideos(): void {
  if (!enabled) return;

  let blockedInBatch = 0;

  // Immersive Media Viewer ページ自体をブロック
  if (location.pathname.includes("/i/immersive_media_viewer")) {
    const main = document.querySelector<HTMLElement>('[data-testid="primaryColumn"]');
    if (main && main.style.display !== "none") {
      main.style.display = "none";
      blockedInBatch++;
    }
  }

  // タイムライン内の縦型動画を非表示
  const selector = SHORT_VIDEO_SELECTORS.join(", ");
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (isVerticalVideo(el)) {
      const tweet = el.closest<HTMLElement>('article[data-testid="tweet"]');
      if (tweet && tweet.style.display !== "none") {
        tweet.style.display = "none";
        blockedInBatch++;
      }
    }
  });

  if (blockedInBatch > 0) {
    chrome.runtime.sendMessage({
      type: "INCREMENT_BLOCKED",
      site: "x",
    });
  }
}

/** debounce付きでhideShortVideosを呼ぶ */
function debouncedHideShortVideos(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(hideShortVideos, 200);
}

/** MutationObserverでDOM変更を監視 */
function observe(): void {
  const observer = new MutationObserver(debouncedHideShortVideos);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/** 設定を取得して初期化 */
async function init(): Promise<void> {
  const settings = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
  enabled = settings.x.enabled;

  if (enabled) {
    hideShortVideos();
    observe();
  }
}

/** 設定変更をリアルタイム反映 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    const newSettings = changes.settings.newValue;
    enabled = newSettings.x.enabled;
    if (enabled) {
      hideShortVideos();
    }
  }
});

init();

})();
