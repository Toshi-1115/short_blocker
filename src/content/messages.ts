/**
 * 共通: グレーアウト + 規制通知オーバーレイ
 * manifest.json でサイト別スクリプトより先に読み込まれる
 */

/** 管理番号の生成 */
function sbCaseId(): string {
  const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, "0");
  return "SB-" + hex;
}

const SB_REASONS = [
  // ライバルとの差
  "今ライバルは積み上げてる。お前は？",
  "これ見てる間に差が開いてる",
  "同世代はもう次のステージにいる",
  "サボった分だけ追い抜かれてる",

  // 時間の無駄
  "30秒後、何も残らない",
  "年間60時間、ゴミに捨ててる",
  "見終わった後の虚無、知ってるだろ",
  "明日も同じこと繰り返すのか",

  // 搾取の構造
  "お前の30秒で他人が稼いでる",
  "お前はただの再生数",
  "養分やめろ",
  "お前の注意力、今売られてる",

  // 脳の破壊
  "集中力、不可逆的に壊れていく",
  "ギャンブル依存と同じ脳の壊れ方",
  "短い刺激に慣れた脳は長い思考ができなくなる",
  "報酬系、もう壊れかけてる",

  // 自分への問い
  "これ入れたの、お前自身だろ",
  "5年後もこれ見てるつもりか",
  "お前の尊敬する人間はこれ見てない",
  "スクリーンタイム、直視できるか？",

  // 行動を促す
  "今閉じろ。それだけでいい",
  "作る側に回れ",
  "その30秒、コード1行書ける",
  "画面閉じて手を動かせ",

  // 残酷な事実
  "才能の差じゃない。この時間の差",
  "死んだ魚の目、してるぞ",
  "この動画、明日には忘れる",
  "お前が怠けた今日は、もう戻らない",

  // 自己嫌悪を刺す
  "また見ようとしてる自分に気づけ",
  "意志が弱い自分を許すな",
  "「ちょっとだけ」で済んだことある？",
  "自分で自分を裏切るな",

  // 現実を突きつける
  "あの返信、まだしてないだろ",
  "締め切り、近いの知ってるだろ",
  "やるべきこと、今頭に浮かんだだろ",
  "逃げるな。戻れ",

  // 存在を問う
  "消費するだけの人間で終わるのか",
  "何も生み出さない時間に価値はない",
  "お前が死んでもこの動画は再生される",
  "走馬灯にこのサムネ、流したいか？",
];

/** 目のSVGアイコン（太線シンプル） */
const SB_EYE_SVG = '<svg class="sb-icon" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">'
  + '<path d="M5,30 Q50,-15 95,30 Q50,75 5,30 Z" fill="none" stroke="#ff1744" stroke-width="6" stroke-linejoin="round"/>'
  + '<circle cx="50" cy="30" r="17" fill="none" stroke="#ff1744" stroke-width="5"/>'
  + '<circle cx="50" cy="30" r="8" fill="#ff1744"/>'
  + '</svg>';

/**
 * 対象要素にグレーアウト + 規制通知オーバーレイを追加。処理済みならfalse。
 */
function sbApplyOverlay(el: HTMLElement): boolean {
  if (el.dataset.sbBlocked) return false;
  el.dataset.sbBlocked = "true";

  // ラッパーで元要素を囲む
  const wrapper = document.createElement("div");
  wrapper.className = "sb-wrapper";
  el.parentNode!.insertBefore(wrapper, el);
  wrapper.appendChild(el);

  // 元要素をグレーアウト
  el.classList.add("sb-blocked");

  // 規制通知オーバーレイ
  const reason = SB_REASONS[Math.floor(Math.random() * SB_REASONS.length)];
  const caseId = sbCaseId();
  const overlay = document.createElement("div");
  overlay.className = "sb-overlay";
  overlay.innerHTML =
    '<div class="sb-stamp">BLOCKED</div>' +
    SB_EYE_SVG +
    '<div class="sb-msg">' + reason + "</div>" +
    '<div class="sb-case">' + caseId + "</div>";
  wrapper.appendChild(overlay);

  return true;
}
