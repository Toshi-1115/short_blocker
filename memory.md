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

## iOS対応（Quantumult X）

- Quantumult Xで YouTube Shortsブロック設定完了
- ddgksf2013/Rewrite の YoutubeAds.conf を rewrite_remote で導入
- Maasea氏のJSスクリプトがProtobufレベルでレスポンス書き換え（広告除去+Shorts除去+PiP+バックグラウンド再生）
- ローカルルール追加: `reel/` エンドポイントを `reject-dict` で遮断
- 結果: フィード・タブ・関連動画からShorts除去済み、連続再生も停止。チャンネル内の個別Shorts再生のみ残存（許容範囲）
- X（Twitter）のiOS Shortsブロックは既存スクリプトなし → Chrome拡張でカバー
- NordVPNとの同時利用不可（iOS制限）→ 手動切替で運用

## TODO

- [ ] アイコンを正式なデザインに差し替え（現在プレースホルダー）
- [ ] X側の実地動作テスト
