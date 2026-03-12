/**
 * YouTube Shorts ブロック用 Content Script
 * messages.js より後に読み込まれる前提（sbApplyOverlay がグローバルに存在）
 */
(() => {

let enabled = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastUrl = location.href;
let redirecting = false;

/** 最も近い "renderer" カスタム要素を探す */
function findRenderer(el: HTMLElement): HTMLElement | null {
  let current = el.parentElement;
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    if (tag.includes("-") && (tag.includes("renderer") || tag.includes("model"))) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/** chrome.runtime が有効か確認してからメッセージ送信 */
function safeSendMessage(msg: any): Promise<any> {
  try {
    if (!chrome.runtime?.id) return Promise.resolve(null);
    return chrome.runtime.sendMessage(msg);
  } catch {
    return Promise.resolve(null);
  }
}

/** /shorts/ リンクを持つ動画を個別にブロック */
function blockShorts(): void {
  if (!enabled || redirecting) return;

  let blockedInBatch = 0;

  document
    .querySelectorAll<HTMLAnchorElement>('a[href*="/shorts/"]')
    .forEach((a) => {
      if (a.closest("[data-sb-blocked]") || a.closest(".sb-wrapper")) return;
      if (a.closest("ytd-guide-renderer, ytd-mini-guide-renderer, #guide")) return;

      const renderer = findRenderer(a) ?? a;
      if (sbApplyOverlay(renderer)) blockedInBatch++;
    });

  if (blockedInBatch > 0) {
    safeSendMessage({ type: "INCREMENT_BLOCKED", site: "youtube" });
  }
}

/** debounce付き */
function debouncedBlock(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(blockShorts, 200);
}

/** MutationObserverでDOM変更を監視 */
function observe(): void {
  const observer = new MutationObserver(() => {
    if (redirecting) return;
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (redirectIfShortsPage()) return;
    }
    debouncedBlock();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/** Shortsページならトップにリダイレクト（1回だけ） */
function redirectIfShortsPage(): boolean {
  if (redirecting) return true;
  if (location.pathname.startsWith("/shorts/")) {
    redirecting = true;
    location.replace("https://www.youtube.com/");
    return true;
  }
  return false;
}

/** 初期化 */
async function init(): Promise<void> {
  const settings = await safeSendMessage({ type: "GET_SETTINGS" });
  if (!settings) return;
  enabled = settings.youtube.enabled;

  if (enabled) {
    if (redirectIfShortsPage()) return;
    blockShorts();
    observe();
  }
}

/** 設定変更をリアルタイム反映 */
chrome.storage.onChanged.addListener((changes) => {
  if (redirecting) return;
  if (changes.settings) {
    const newSettings = changes.settings.newValue;
    enabled = newSettings.youtube.enabled;
    if (enabled) {
      redirectIfShortsPage() || blockShorts();
    }
  }
});

init();

})();
