# Quantumult X (iOS) 調査結果

調査日: 2026-03-12
調査対象: MITM証明書セットアップ、YouTube Shortsブロック、X(Twitter)ショート動画ブロック

---

## 1. 初期セットアップ（MITM証明書の生成・インストール・信頼）

### 1.1 アプリのUI構造

Quantumult X のメイン画面下部に**風車アイコン（齿轮/ギア）**がある。これが設定への入口。

- メイン画面: 中央に接続ボタン（風車アイコン）
- **右下角の風車アイコン** = 設定ページへのアクセス

### 1.2 MITM証明書の生成（正確なUIパス）

```
メイン画面 → 右下角の風車アイコンをタップ → 下にスクロール → 「MitM」セクション → 「生成証書」(Generate CA) をタップ
```

**ボタン名:**
- 中国語UI: 「生成证书」
- 英語UI: 「Generate CA」

### 1.3 証明書のインストール

```
MitMセクション → 「配置证书」(Install CA) をタップ → Safariが自動的に開く → 証明書のダウンロードが始まる
```

**重要:** Safariがデフォルトブラウザでないとダウンロードが失敗する場合がある。

ダウンロード後のiOS設定:

```
iOS設定アプリ → 一般 (General) → 「VPNとデバイス管理」(VPN & Device Management)
  → 「ダウンロード済みプロファイル」(Profile Downloaded) → インストール → パスコード入力 → インストール
```

### 1.4 証明書の信頼設定

```
iOS設定アプリ → 一般 (General) → 情報 (About) → 一番下までスクロール
  → 「証明書信頼設定」(Certificate Trust Settings) → 該当のCA証明書のスイッチをON
```

### 1.5 MitMとRewriteの有効化

```
Quantumult Xに戻る → 右下角の風車アイコン → 「重写」(Rewrite) セクションのスイッチをON
                                            → 「MitM」セクションのスイッチをON
```

**注意事項:**
- 証明書のインストール・信頼が完了してからMitMスイッチをONにすること
- passphrase と p12 フィールドを絶対に削除しないこと（これがMITM証明書情報）
- 他人と共有しないこと（秘密鍵のリスク）
- 証明書は1回だけ生成すればよい。再生成するとルールと証明書が不一致になる

### 1.6 リソースパーサーの設定（Surge sgmoduleの変換に必要）

`[general]` セクションに以下を追加:
```
resource_parser_url=https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js
```

これにより、Surgeの `.sgmodule` ファイルを `opt-parser=true` パラメータで自動変換できる。

---

## 2. YouTube Shortsブロック設定

### 2.1 推奨方法: ddgksf2013のYouTubeAds.conf（最も実績あり）

**リモートリソースとして追加する方法:**

```
Quantumult X → 右下角の風車 → 重写 (Rewrite) → 引用 (Resources) → 右上の＋ボタン
→ 以下のURLを追加:
https://raw.githubusercontent.com/ddgksf2013/Rewrite/refs/heads/master/AdBlock/YoutubeAds.conf
```

**このconfファイルの実際の内容（2025-03-09更新確認済み）:**

```ini
########################################
#応用名称：  Youtube Block AD
#脚本作者：  @DivineEngine, @app2smile, @Maasea, @VirgilClyne
#更新時間：  2025-03-09
########################################

hostname = -redirector*.googlevideo.com, *.googlevideo.com, www.youtube.com, s.youtube.com, youtubei.googleapis.com

# ======= 動画広告リクエスト ======= #
(^https?:\/\/[\w-]+\.googlevideo\.com\/(?!dclk_video_ads).+?)&ctier=L(&.+?),ctier,(.+) url 302 $1$2$3
^https?:\/\/[\w-]+\.googlevideo\.com\/(?!(dclk_video_ads|videoplayback\?)).+&oad url reject-200

# ======= PIP|バックグラウンド再生|フィード|検索|再生ページ|Shorts|プレロール広告 ======= #
^https?:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(browse|next|player|search|reel\/reel_watch_sequence|guide|account\/get_setting|get_watch) url script-response-body https://raw.githubusercontent.com/Maasea/sgmodule/refs/heads/master/Script/Youtube/youtube.response.js

# ======= 汎用広告リクエスト ======= #
^https?:\/\/(www|s)\.youtube\.com\/api\/stats\/ads url reject-200
^https?:\/\/(www|s)\.youtube\.com\/(pagead|ptracking) url reject-200
^https?:\/\/s\.youtube\.com\/api\/stats\/qoe\?adcontext url reject-200
```

**機能:**
- 動画広告除去
- フィード広告（瀑布流）除去
- 検索ページ広告除去
- **Shorts（短動画）除去** ← ここが重要
- プレロール広告除去
- PiP（ピクチャーインピクチャー）有効化
- バックグラウンド再生有効化

**追加設定（動画広告が残る場合）:**
`[general]` セクションに追加:
```
udp_drop_list=443
```

**注意:** UDP転送許可のノードやYouTube Premiumアカウントでは動作しない。

### 2.2 代替方法: Maasea YouTube.Enhance.sgmodule（Shorts専用パラメータあり）

Maaseaのモジュールには `blockShorts` パラメータがある。

**sgmoduleの完全な内容:**

```ini
#!name=Youtube (Music) Enhance
#!desc=適用於 Youtube & Youtube Music
#!arguments=屏蔽上传按钮:true,屏蔽选段按钮:true,屏蔽Shorts按钮:false,字幕翻译语言:off,歌词翻译语言:off,启用调试模式:false

[Rule]
AND,((DOMAIN-SUFFIX,googlevideo.com), (PROTOCOL,UDP)),REJECT
AND,((DOMAIN,youtubei.googleapis.com), (PROTOCOL,UDP)),REJECT

[Script]
youtube.response = type=http-response,pattern=^https:\/\/youtubei\.googleapis\.com\/(youtubei\/v1\/(browse|next|player|search|reel\/reel_watch_sequence|guide|account\/get_setting|get_watch))(\?(.*))?$,requires-body=1,max-size=-1,binary-body-mode=1,script-path=https://raw.githubusercontent.com/Maasea/sgmodule/master/Script/Youtube/youtube.response.js,argument="{"lyricLang":"{{{歌词翻译语言}}}","captionLang":"{{{字幕翻译语言}}}","blockUpload":{{{屏蔽上传按钮}}},"blockImmersive":{{{屏蔽选段按钮}}},"blockShorts":{{{屏蔽Shorts按钮}}},"debug":{{{启用调试模式}}}}"

[Map Local]
^https?:\/\/[\w-]+\.googlevideo\.com\/initplayback.+&oad data-type=text data="" status-code=200

[MITM]
hostname = %APPEND% *.googlevideo.com, youtubei.googleapis.com
```

**Quantumult Xで使うには:**

これはSurge形式なので、Quantumult Xで使うには:

**方法A: resource parserを使う**
```
[rewrite_remote]
https://raw.githubusercontent.com/Maasea/sgmodule/master/YouTube.Enhance.sgmodule, tag=YouTube Enhance, update-interval=172800, opt-parser=true, enabled=true
```

**方法B: 手動でQX形式に変換して[rewrite_local]に記述**
```ini
[rewrite_local]
# YouTube応答書き換え（広告除去+Shorts除去）
^https?:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(browse|next|player|search|reel\/reel_watch_sequence|guide|account\/get_setting|get_watch) url script-response-body https://raw.githubusercontent.com/Maasea/sgmodule/master/Script/Youtube/youtube.response.js

# 初期化再生ブロック
^https?:\/\/[\w-]+\.googlevideo\.com\/initplayback.+&oad url reject-200

[mitm]
hostname = *.googlevideo.com, youtubei.googleapis.com
```

### 2.3 Ender-Wang版（ddgksf2013フォーク、翻訳機能なし）

```ini
[rewrite_local]
# リクエスト書き換え
^https?:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(browse|next|player|reel\/reel_watch_sequence|get_watch) url script-request-body https://raw.githubusercontent.com/Ender-Wang/YouTubeAds-PiP-BackgroundPlay/main/youtube.request.preview.js

# レスポンス書き換え
^https?:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(browse|next|player|search|reel\/reel_watch_sequence|guide|account\/get_setting|get_watch) url script-response-body https://raw.githubusercontent.com/Ender-Wang/YouTubeAds-PiP-BackgroundPlay/main/youtube.response.preview.js

[mitm]
hostname = youtubei.googleapis.com
```

### 2.4 技術的な仕組み

スクリプト（youtube.response.js）は以下のYouTube APIエンドポイントをインターセプト:

| エンドポイント | 用途 |
|---|---|
| `browse` | ホーム・チャンネル・Shortsタブのフィード |
| `next` | 動画再生ページの関連動画 |
| `player` | 動画プレーヤー（広告挿入点） |
| `search` | 検索結果 |
| `reel/reel_watch_sequence` | Shorts再生シーケンス |
| `guide` | サイドバー・ナビゲーション |
| `get_watch` | ウォッチページ |

レスポンスはProtobuf形式のバイナリデータ。スクリプトがこれをデコードし、Shorts関連のレンダラーやコンテンツを除去してから再エンコードする。`binary-body-mode=1` が必要。

### 2.5 MITM必須ホスト名

```
hostname = *.googlevideo.com, youtubei.googleapis.com
```

YouTube Premiumの場合、再生問題を防ぐため:
```
hostname = -*.googlevideo.com
```
（マイナスプレフィックスで除外）

---

## 3. X（Twitter）ショート動画ブロック設定

### 3.1 現状の調査結果

**結論: X(Twitter)のショート動画に特化したQuantumult Xスクリプト/モジュールは、主要なリポジトリに存在しない。**

調査したリポジトリ:
- ddgksf2013/Rewrite/AdBlock/ → Twitter/X用confなし（23ファイル中該当なし）
- NobyDa/Script/QuantumultX/ → Twitter関連なし
- fmz200/wool_scripts → Twitter関連rewriteなし
- Maasea/sgmodule → YouTube専用
- limbopro/Script → Twitter専用なし
- blackmatrix7/ios_rule_script → フィルタルール（分流）のみ、rewriteなし

### 3.2 理由の考察

TwitterアプリのAPIは:
1. **Certificate Pinning（証明書ピニング）** を使っている可能性が高い → MITMが困難
2. APIレスポンスが頻繁に変更される → スクリプトのメンテナンスコストが高い
3. YouTubeと異なり、Protobufではなく独自のJSON構造を使用

### 3.3 可能なアプローチ（実験的）

Twitter APIのタイムラインレスポンスを書き換える場合、理論的には:

```ini
[rewrite_local]
# Twitterタイムライン応答を書き換え（実験的・動作未保証）
^https?:\/\/api\.x\.com\/2\/timeline\/ url script-response-body twitter-filter.js
^https?:\/\/api\.twitter\.com\/2\/timeline\/ url script-response-body twitter-filter.js

[mitm]
hostname = api.x.com, api.twitter.com
```

ただし:
- Twitterアプリがcertificate pinningしている場合、MITMは機能しない
- アプリが検出してブロックする可能性がある
- 実際に動作確認されたスクリプトは発見できなかった

### 3.4 代替案

1. **Webブラウザ経由でアクセス** → このプロジェクトのChrome拡張機能を使う方がはるかに確実
2. **DNSベースのブロック** → Shortsだけを選択的にブロックすることは不可能（ドメイン単位のため）
3. **サードパーティTwitterクライアント** → API制限のため多くが利用不可に

---

## 4. Quantumult X設定ファイルの構文リファレンス

### 4.1 rewrite_local の書式

```
^URL正規表現パターン url アクション [パラメータ]
```

**アクション一覧:**

| アクション | 機能 |
|---|---|
| `reject` | HTTP 404を返す（コンテンツなし） |
| `reject-200` | HTTP 200を返す（コンテンツなし） |
| `reject-img` | HTTP 200 + 1pxのGIF画像 |
| `reject-dict` | HTTP 200 + 空のJSONオブジェクト `{}` |
| `reject-array` | HTTP 200 + 空のJSON配列 `[]` |
| `302` | URLリダイレクト（302） |
| `307` | URLリダイレクト（307） |
| `request-header` | リクエストヘッダー書き換え |
| `request-body` | リクエストボディ書き換え |
| `response-header` | レスポンスヘッダー書き換え |
| `response-body` | レスポンスボディ書き換え |
| `script-request-header` | JSでリクエストヘッダー処理 |
| `script-request-body` | JSでリクエストボディ処理 |
| `script-response-header` | JSでレスポンスヘッダー処理 |
| `script-response-body` | JSでレスポンスボディ処理 |

### 4.2 JSスクリプトで利用可能なオブジェクト

```javascript
$request.url       // リクエストURL
$request.headers   // リクエストヘッダー
$request.body      // リクエストボディ
$response.status   // レスポンスステータスコード
$response.headers  // レスポンスヘッダー
$response.body     // レスポンスボディ
$notify(title, subtitle, body)  // 通知送信
$done({body: modifiedBody})     // 処理完了+レスポンス返却
console.log()      // ログ出力
```

### 4.3 MITM hostnameの書式

```ini
[mitm]
hostname = domain1.com, *.wildcard.com, -excluded.com
```

- `*` ワイルドカード使用可
- `-` プレフィックスで除外
- `%APPEND%` で既存のホスト名に追記（sgmodule用）

### 4.4 rewrite_remoteの書式

```ini
[rewrite_remote]
https://example.com/rewrite.conf, tag=表示名, update-interval=172800, opt-parser=false, enabled=true
```

- `opt-parser=true`: resource parserを通して変換（sgmodule → QX変換時に必要）
- `update-interval`: 更新間隔（秒）
- `enabled`: 有効/無効

---

## 5. 調査ソース一覧

### チュートリアル・ガイド
1. https://iapplec.com/quantumult-x-installation-guide/ - 英語インストールガイド
2. https://isedu.top/index.php/archives/49/ - 中国語詳細使用ステップ（UIパス確認）
3. https://agkjvip.github.io/posts/sixth_post/ - 中国語小白教程
4. https://limbopro.com/archives/12727.html - YouTube去広告教程（毒奶）
5. https://deepwiki.com/crossutility/Quantumult-X - DeepWiki技術文書

### GitHub リポジトリ
6. https://github.com/crossutility/Quantumult-X - 公式リポジトリ（sample.conf）
7. https://github.com/ddgksf2013/Rewrite - 墨鱼去広告（YoutubeAds.conf）
8. https://github.com/Maasea/sgmodule - YouTube.Enhance.sgmodule（blockShortsパラメータ）
9. https://github.com/Ender-Wang/YouTubeAds-PiP-BackgroundPlay - YouTube広告除去フォーク
10. https://github.com/KOP-XIAO/QuantumultX - resource-parser.js
11. https://github.com/Script-Hub-Org/Script-Hub - sgmodule変換ツール
12. https://github.com/NobyDa/Script - QuantumultXスクリプト集

### Apple公式
13. https://support.apple.com/en-us/102390 - iOS証明書信頼設定
