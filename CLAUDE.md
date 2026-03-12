# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

YouTubeとX（旧Twitter）のショート動画（YouTube Shorts、Xの短尺動画）を非表示・無効化するChrome拡張機能。

## 技術スタック

- Chrome Extension Manifest V3
- TypeScript
- バンドラ: なし（小規模のためtscのみ）
- スタイル: CSS（content scripts用）

## アーキテクチャ

```
src/
  manifest.json        # Manifest V3 定義
  content/
    youtube.ts         # YouTube Shorts 非表示ロジック
    x.ts               # X ショート動画 非表示ロジック
  styles/
    youtube.css        # YouTube Shorts 非表示CSS
    x.css              # X ショート動画 非表示CSS
  popup/
    popup.html         # 設定ポップアップUI
    popup.ts           # ポップアップロジック（ON/OFF切替）
  background.ts        # Service Worker（状態管理）
  types.ts             # 共通型定義
dist/                  # ビルド出力（.gitignore対象）
```

### 動作方式

- **Content Scripts**: 対象サイトのDOMを監視し、ショート動画要素を非表示にする
- **MutationObserver**: SPAのDOM変更を検知して動的に対応
- **chrome.storage**: ユーザー設定（サイトごとのON/OFF）を永続化
- **Service Worker**: 拡張機能の状態管理、アイコンバッジ更新

## コマンド

```bash
# ビルド
npx tsc

# 開発時（ファイル変更監視）
npx tsc --watch

# Chromeへの読み込み
# chrome://extensions → デベロッパーモード → 「パッケージ化されていない拡張機能を読み込む」→ dist/ を選択
```

## 開発ルール

- Manifest V3準拠（Manifest V2のAPIは使わない）
- content scriptでは最小限のDOM操作に留める（パフォーマンス重視）
- MutationObserverのコールバックではdebounce/throttleを適用
- `chrome.storage.sync` を使用（デバイス間同期のため）
- セレクタはサイトのDOM構造変更に備えて `data-*` 属性優先、クラス名は最終手段
