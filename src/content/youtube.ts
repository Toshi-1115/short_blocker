/**
 * YouTube Shorts ブロック用 Content Script
 *
 * 非表示対象:
 * - トップページ・検索結果のShortsシェルフ（横スクロール一覧）
 * - サイドバーの「ショート」ナビゲーションリンク
 * - 動画の横に表示されるShortsサムネイル
 * - Shortsタブ内のコンテンツ
 */
(() => {

/** Shorts要素を検出するセレクタ一覧 */
const SHORTS_SELECTORS = [
  // Shortsシェルフ（トップ・検索結果）
  "ytd-rich-shelf-renderer[is-shorts]",
  "ytd-reel-shelf-renderer",
  // サイドバーのShortsリンク
  'ytd-guide-entry-renderer a[title="ショート"]',
  'ytd-mini-guide-entry-renderer a[title="ショート"]',
  // Shorts個別サムネイル
  'ytd-grid-video-renderer a[href*="/shorts/"]',
  'ytd-video-renderer a[href*="/shorts/"]',
  'ytd-rich-item-renderer:has(a[href*="/shorts/"])',
  // 検索結果内のShortsセクション
  "ytd-reel-shelf-renderer",
] as const;

let enabled = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Shorts要素を非表示にする */
function hideShorts(): void {
  if (!enabled) return;

  let blockedInBatch = 0;
  const selector = SHORTS_SELECTORS.join(", ");

  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (el.style.display !== "none") {
      el.style.display = "none";
      blockedInBatch++;
    }
  });

  // /shorts/ URLへの直リンクを持つ要素の親を非表示
  document
    .querySelectorAll<HTMLAnchorElement>('a[href*="/shorts/"]')
    .forEach((a) => {
      const renderer =
        a.closest("ytd-rich-item-renderer") ??
        a.closest("ytd-grid-video-renderer") ??
        a.closest("ytd-video-renderer") ??
        a.closest("ytd-compact-video-renderer");
      if (renderer && (renderer as HTMLElement).style.display !== "none") {
        (renderer as HTMLElement).style.display = "none";
        blockedInBatch++;
      }
    });

  if (blockedInBatch > 0) {
    chrome.runtime.sendMessage({
      type: "INCREMENT_BLOCKED",
      site: "youtube",
    });
  }
}

/** debounce付きでhideShortsを呼ぶ */
function debouncedHideShorts(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(hideShorts, 200);
}

/** MutationObserverでDOM変更を監視 */
function observe(): void {
  const observer = new MutationObserver(debouncedHideShorts);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/** 設定を取得して初期化 */
async function init(): Promise<void> {
  const settings = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
  enabled = settings.youtube.enabled;

  if (enabled) {
    hideShorts();
    observe();
  }
}

/** 設定変更をリアルタイム反映 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    const newSettings = changes.settings.newValue;
    enabled = newSettings.youtube.enabled;
    if (enabled) {
      hideShorts();
    }
  }
});

init();

})();
