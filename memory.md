# memory.md - 作業日誌

## 現在の状態

- v1.0 完成、動作確認済み
- GitHub push済み

## アーキテクチャ

- `messages.ts`: 共通オーバーレイ処理（sbApplyOverlay）+ 警告メッセージ40種 + 目SVG
- `youtube.ts`: IIFE、findRenderer()で汎用レンダラー検索、/shorts/リダイレクト
- `x.ts`: IIFE、縦型動画判定（aspect ratio > 1.2）
- `overlay.css`: BLOCKEDスタンプ + グレーアウト + 管理番号
- content scriptsは非モジュール（IIFEで囲む）、`export {}`問題に注意
- `safeSendMessage`: Extension context invalidated対策
- `redirecting`フラグ: リダイレクトループ防止

## 解決済みの問題

- popup.js `export {}` → import type削除で解消
- リダイレクト無限ループ → redirectingフラグで1回に制限
- Extension context invalidated → chrome.runtime.id存在確認+try-catch
- サイドバー「ショート」表示 → CSS :has()セレクタ + JS除外
- タイトルへの二重オーバーレイ → .sb-wrapper除外チェック

## TODO

- [ ] アイコンを正式なデザインに差し替え（現在プレースホルダー）
- [ ] X側の実地動作テスト
