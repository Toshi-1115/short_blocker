# Short Blocker

YouTube ShortsとXのショート動画をブロックするChrome拡張機能。

ショート動画をグレーアウトし、警告メッセージを表示することで、無意識なショート動画消費を防ぎます。

## 機能

- YouTube Shortsのサムネイルをグレーアウト + 警告オーバーレイ表示
- YouTube Shortsページへのアクセスをトップページにリダイレクト
- サイドバーの「ショート」リンクを非表示
- Xの縦型ショート動画をグレーアウト + 警告オーバーレイ表示
- サイト別ON/OFF切替
- ブロック数の統計表示

## インストール

```bash
git clone https://github.com/Toshi-1115/short_blocker.git
cd short_blocker
npm install
npm run build
```

1. Chromeで `chrome://extensions` を開く
2. 「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `dist/` フォルダを選択

## 開発

```bash
npm run build    # ビルド
npm run watch    # TypeScript監視モード
npm run clean    # dist/ 削除
```

## 技術スタック

- Chrome Extension Manifest V3
- TypeScript
- CSS

---

# Short Blocker (English)

A Chrome extension that blocks short-form videos on YouTube and X (formerly Twitter).

Grays out short videos and displays warning messages to prevent mindless short video consumption.

## Features

- Grays out YouTube Shorts thumbnails with warning overlay
- Redirects YouTube Shorts pages to the home page
- Hides the "Shorts" link from the sidebar
- Grays out vertical short videos on X with warning overlay
- Per-site ON/OFF toggle
- Blocked count statistics

## Installation

```bash
git clone https://github.com/Toshi-1115/short_blocker.git
cd short_blocker
npm install
npm run build
```

1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## Development

```bash
npm run build    # Build
npm run watch    # TypeScript watch mode
npm run clean    # Remove dist/
```

## Tech Stack

- Chrome Extension Manifest V3
- TypeScript
- CSS
