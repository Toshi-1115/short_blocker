# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

YouTubeとX（旧Twitter）のショート動画をグレーアウト+警告オーバーレイで無効化するChrome拡張機能。

### 仕様

- **対象サイト**: YouTube + X の2サイトのみ
- **ブロック方式**: グレーアウト（grayscale+暗転）+ BLOCKEDスタンプ + 目SVG + 警告メッセージ + 管理番号
- **Shortsページ**: トップにリダイレクト（YouTube）
- **ポップアップUI**: サイト別ON/OFF切替 + ブロック数の統計表示
- **UI言語**: 日本語のみ

## 技術スタック

- Chrome Extension Manifest V3
- TypeScript（tscのみ、バンドラなし）
- CSS（content scripts用）

## コマンド

```bash
npm run build    # tsc + アセットコピー
npm run watch    # tsc --watch（アセットは手動でbuild）
npm run clean    # dist/ 削除
```

## 開発ルール

- Content Scriptsは非モジュール（IIFEで囲む）。`import` を書くと `export {}` が出力されてエラーになる
- `chrome.runtime.sendMessage` は `safeSendMessage` ラッパー経由で呼ぶ（Extension context invalidated対策）
- リダイレクトにはフラグで1回制限をかける（MutationObserverループ防止）
- MutationObserverのコールバックではdebounceを適用
- `chrome.storage.sync` を使用
