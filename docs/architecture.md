# アーキテクチャ

## コンポーネント図

```
┌─────────────────────────────────────────────────────┐
│                    Chrome Browser                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐    chrome.runtime     ┌────────┐ │
│  │  Popup UI    │◄────────────────────►│Service │ │
│  │  popup.html  │    sendMessage        │Worker  │ │
│  │  popup.js    │                       │back-   │ │
│  └──────────────┘                       │ground  │ │
│                                         │.js     │ │
│  ┌──────────────────────────────┐       │        │ │
│  │     Content Scripts          │       │        │ │
│  │                              │       │        │ │
│  │  ┌────────────────────────┐  │       │        │ │
│  │  │    messages.js         │  │       │        │ │
│  │  │  ・警告メッセージ40種   │  │       │        │ │
│  │  │  ・目SVGアイコン       │  │       │        │ │
│  │  │  ・sbApplyOverlay()    │  │       │        │ │
│  │  │  ・管理番号生成        │  │       │        │ │
│  │  └────────┬───────────────┘  │       │        │ │
│  │           │ グローバル関数    │       │        │ │
│  │  ┌────────▼──┐ ┌──────────┐  │       │        │ │
│  │  │youtube.js │ │  x.js    │  │       │        │ │
│  │  │           │ │          │──┼──────►│        │ │
│  │  │・renderer │ │・縦型判定│  │ send  │        │ │
│  │  │ 汎用検索  │ │・tweet   │  │ Message│       │ │
│  │  │・redirect │ │ ブロック │  │       │        │ │
│  │  └───────────┘ └──────────┘  │       └───┬────┘ │
│  │                              │           │      │
│  └──────────────────────────────┘           │      │
│                                             ▼      │
│                                    ┌──────────────┐│
│                                    │chrome.storage││
│                                    │   .sync      ││
│                                    │ ・enabled    ││
│                                    │ ・blockCount ││
│                                    └──────────────┘│
└─────────────────────────────────────────────────────┘
```

## ファイル構成

```
src/
├── manifest.json          Manifest V3定義
├── background.ts          Service Worker（設定管理・バッジ更新）
├── types.ts               共通型定義（Settings, Message, DEFAULT_SETTINGS）
├── content/
│   ├── messages.ts        共通: オーバーレイ処理・メッセージ・SVG
│   ├── youtube.ts         YouTube: レンダラー検索・リダイレクト
│   └── x.ts              X: 縦型動画判定・ブロック
├── styles/
│   ├── overlay.css        共通: グレーアウト・スタンプ・メッセージ
│   ├── youtube.css        YouTube: サイドバー非表示
│   └── x.css             X: （予約）
├── popup/
│   ├── popup.html         ポップアップUI
│   └── popup.ts           ポップアップロジック
└── icons/
    ├── icon16.png         プレースホルダー
    ├── icon48.png
    └── icon128.png
```

## データフロー

```
1. ページ読み込み
   messages.js (グローバル関数定義)
        ↓
   youtube.js / x.js (IIFE実行)
        ↓
   safeSendMessage({ type: "GET_SETTINGS" })
        ↓
   background.js → chrome.storage.sync.get()
        ↓
   settings返却 → enabled判定

2. ブロック処理
   MutationObserver (DOM変更検知)
        ↓ debounce 200ms
   blockShorts() / blockShortVideos()
        ↓
   a[href*="/shorts/"] 走査 → findRenderer() でレンダラー特定
        ↓
   sbApplyOverlay(renderer)
     ├── wrapper div 挿入
     ├── .sb-blocked クラス追加 (grayscale + pointer-events:none)
     ├── BLOCKED スタンプ
     ├── 目SVG
     ├── ランダム警告メッセージ
     └── 管理番号 (SB-XXXXXX)
        ↓
   safeSendMessage({ type: "INCREMENT_BLOCKED" })
        ↓
   background.js → blockedCount++ → バッジ更新

3. 設定変更
   popup.js → UPDATE_SETTINGS → background.js → chrome.storage.sync.set()
        ↓
   chrome.storage.onChanged → content scripts → enabled更新
```

## オーバーレイDOM構造

```html
<!-- sbApplyOverlay() が生成する構造 -->
<div class="sb-wrapper">                    <!-- position: relative -->

  <ytd-rich-item-renderer class="sb-blocked" data-sb-blocked="true">
    <!-- 元の要素（grayscale + 暗転 + クリック無効） -->
  </ytd-rich-item-renderer>

  <div class="sb-overlay">                  <!-- position: absolute, inset: 0 -->
    <div class="sb-stamp">BLOCKED</div>     <!-- 斜めスタンプ -->
    <svg class="sb-icon">...</svg>          <!-- 目のアイコン（脈動アニメーション） -->
    <div class="sb-msg">養分やめろ</div>     <!-- ランダム警告 -->
    <div class="sb-case">SB-A3F21C</div>    <!-- 管理番号 -->
  </div>

</div>
```

## 注意事項

- Content Scriptsに `import` を書くとTypeScriptが `export {}` を出力しブラウザでエラーになる → 必ずIIFE + グローバル関数
- `chrome.runtime.sendMessage` はページ遷移後にコンテキストが無効化される → `safeSendMessage` で防御
- `location.replace` はMutationObserverのループ内から呼ばれるため `redirecting` フラグで1回制限
- YouTubeのレンダラー名はページによって異なる → `findRenderer()` でタグ名に "renderer" or "model" を含むカスタム要素を汎用検索
