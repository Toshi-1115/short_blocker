# memory.md - 作業日誌

## 現在の状態

- v1.0 全機能実装完了、ビルド成功（`npm run build`で`dist/`に出力）
- Chromeへの読み込みテスト未実施

## 完了タスク

- [x] package.json / tsconfig.json セットアップ
- [x] manifest.json 作成 (`src/manifest.json:1`)
- [x] YouTube Shorts ブロック機能 (`src/content/youtube.ts:1`) - セレクタベース+MutationObserver
- [x] X ショート動画ブロック機能 (`src/content/x.ts:1`) - 縦型動画判定+MutationObserver
- [x] ポップアップUI (`src/popup/popup.html`, `src/popup/popup.ts`) - サイト別ON/OFF+統計表示
- [x] Service Worker (`src/background.ts:1`) - 設定管理+バッジ更新
- [x] 型定義 (`src/types.ts:1`)
- [x] CSS (`src/styles/youtube.css`, `src/styles/x.css`)
- [x] アイコン（プレースホルダー、赤背景）

## TODO

- [ ] Chromeで実際に読み込んで動作テスト
- [ ] セレクタの実地調整（サイトのDOM構造変更対応）
- [ ] アイコンを正式なデザインに差し替え

## 判断メモ

- Content Scriptsは非モジュールのためIIFEで囲んでスコープ分離
- X側のショート動画判定はアスペクト比(height/width > 1.2)で縦型動画を検出
- CSSによる即時非表示（ちらつき防止）+ JSによるカウント付き非表示の二重対策
