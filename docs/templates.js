// じぶんアプリ工房 — 型(テンプレート)・色・見本アプリ・共有コードの共通部品。
// どのページでも window.Jibun から使う。

(function () {
  const ICON = {
    checklist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 12l3 3 5-6"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 13h3M13 13h3M8 17h3M13 17h3"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7"/><path d="M12 17h.01"/></svg>',
    log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
    timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg>',
    lottery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/></svg>',
  };

  const TEMPLATES = {
    checklist: {
      name: "チェックリスト", blurb: "持ち物・手順・やることを一つずつ消す", eg: "旅行の持ち物、開店前の手順",
      fields: [{ key: "items", label: "項目", hint: "1行に1つ", kind: "textarea" }],
      sample: { name: "出かける前チェック", desc: "玄関で確認", items: "鍵\n財布\nスマホ\n充電器\n傘" },
    },
    calc: {
      name: "計算機", blurb: "数を入れると答えが出る", eg: "割り勘、燃費、値引き後の値段",
      fields: [
        { key: "inputs", label: "入れる数の名前", hint: "1行に1つ", kind: "textarea", rows: 4 },
        { key: "op", label: "計算の仕方", kind: "select", options: [["sum", "すべて足す"], ["avg", "平均を出す"], ["mul", "すべて掛ける"], ["div", "上から順に割る"], ["sub", "上から順に引く"]] },
        { key: "resultLabel", label: "答えの名前", kind: "text" },
        { key: "unit", label: "単位", kind: "text" },
      ],
      sample: { name: "割り勘けいさん", desc: "合計と人数を入れるだけ", inputs: "金額(円)\n人数", op: "div", resultLabel: "ひとり", unit: "円" },
    },
    quiz: {
      name: "診断", blurb: "はい・いいえで答えると結果が出る", eg: "性格診断、向いている過ごし方",
      fields: [
        { key: "questions", label: "質問", hint: "1行に1つ。「はい」が多いほど下の結果に近づく", kind: "textarea" },
        { key: "results", label: "結果", hint: "1行に1つ、上から「はい」が少ない順。「見出し|説明」で書く", kind: "textarea", rows: 4 },
      ],
      sample: { name: "休日タイプ診断", desc: "5問で分かる", questions: "朝、自然に目が覚める\n休みの日は外に出たい\n計画を立ててから動く\n人と話すと元気が出る\n新しい店をすぐ試す", results: "じっくり派|家でゆっくりが向いています。\nバランス派|その日の気分で動けるタイプ。\n行動派|思い立ったらすぐ出発。" },
    },
    log: {
      name: "記録帳", blurb: "日付と数をためて折れ線で見る", eg: "体重、釣れた数、売上",
      fields: [{ key: "valueLabel", label: "記録する数の名前", kind: "text" }, { key: "unit", label: "単位", kind: "text" }],
      sample: { name: "体重メモ", desc: "朝いちで測る", valueLabel: "体重", unit: "kg" },
    },
    timer: {
      name: "タイマー", blurb: "決めた時間を測って知らせる", eg: "料理、勉強、筋トレ",
      fields: [{ key: "presets", label: "時間の候補", hint: "1行に1つ。「名前|3分」「名前|90秒」「名前|180」", kind: "textarea", rows: 5 }],
      sample: { name: "台所タイマー", desc: "よく使う時間をボタンに", presets: "カップ麺|3分\nゆで卵(半熟)|7分\n煮込み|20分\n休憩|5分" },
    },
    lottery: {
      name: "くじ引き", blurb: "候補からひとつ選ぶ", eg: "晩ごはん、順番決め、行き先",
      fields: [
        { key: "items", label: "候補", hint: "1行に1つ", kind: "textarea" },
        { key: "exclude", label: "一度出たものは", kind: "select", options: [["no", "また出る"], ["yes", "出ないようにする(全部出たら最初から)"]] },
      ],
      sample: { name: "今晩のおかずくじ", desc: "迷ったら引く", items: "ゴーヤーチャンプルー\nカレー\n焼き魚\n餃子\n沖縄そば\n唐揚げ\n鍋", exclude: "yes" },
    },
  };

  const COLORS = [
    ["#2f5bd9", "青"], ["#0e8a6f", "緑"], ["#d9482b", "赤"], ["#b07a0b", "からし"],
    ["#7b3fb3", "紫"], ["#d0407f", "ピンク"], ["#1a8fb5", "水色"], ["#2b2f3a", "墨"],
  ];

  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

  // 型と元ネタから、工房で扱うアプリ1件分の設定を作る
  function makeApp(type, from) {
    const t = TEMPLATES[type];
    const src = from || t.sample;
    const fields = {};
    for (const fd of t.fields) fields[fd.key] = src[fd.key] ?? "";
    return { id: uid(), type, name: src.name || t.name, desc: src.desc || "", color: src.color || COLORS[0][0], fields, created: today() };
  }

  // 見本(トップの作品例・工房の初期アプリ)。これが将来「みんなのアプリ」になる場所
  const GALLERY = [
    { type: "calc", color: "#2f5bd9", name: "割り勘けいさん", desc: "合計と人数を入れるだけ", inputs: "金額(円)\n人数", op: "div", resultLabel: "ひとり", unit: "円", by: "見本" },
    { type: "checklist", color: "#0e8a6f", name: "釣り出発チェック", desc: "忘れ物ゼロで港へ", items: "竿とリール\n仕掛け・オモリ\nエサ\nライフジャケット\n飲み物\nクーラーボックス\n帽子・日焼け止め", by: "見本" },
    { type: "lottery", color: "#d9482b", name: "今晩のおかずくじ", desc: "迷ったら引く", items: "ゴーヤーチャンプルー\nカレー\n焼き魚\n餃子\n沖縄そば\n唐揚げ\n鍋", exclude: "yes", by: "見本" },
    { type: "quiz", color: "#7b3fb3", name: "休日タイプ診断", desc: "5問で分かる", questions: TEMPLATES.quiz.sample.questions, results: TEMPLATES.quiz.sample.results, by: "見本" },
    { type: "timer", color: "#b07a0b", name: "台所タイマー", desc: "よく使う時間をボタンに", presets: "カップ麺|3分\nゆで卵(半熟)|7分\n煮込み|20分\n休憩|5分", by: "見本" },
    { type: "log", color: "#1a8fb5", name: "体重メモ", desc: "朝いちで測る", valueLabel: "体重", unit: "kg", by: "見本" },
    { type: "calc", color: "#2b2f3a", name: "燃費けいさん", desc: "給油のたびに", inputs: "走った距離(km)\n入れたガソリン(L)", op: "div", resultLabel: "燃費", unit: "km/L", by: "見本" },
    { type: "checklist", color: "#d0407f", name: "開店前チェック", desc: "毎朝おなじ順番で", items: "看板を出す\nレジの釣り銭\n冷蔵庫の温度\nトイレの確認\n予約の確認\nBGM をかける", by: "見本" },
  ];

  // ----- 共有コード(JA1. + base64 の設定 JSON)。URL の # に入れてリンクにする -----
  const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));

  function encode(cfg) {
    const { id, created, by, ...rest } = cfg;
    return "JA1." + b64(JSON.stringify(rest));
  }
  function decode(text) {
    const m = String(text || "").match(/JA1\.([A-Za-z0-9_\-+/=]+)/);
    if (!m) return null;
    try {
      const o = JSON.parse(unb64(m[1]));
      if (!TEMPLATES[o.type]) return null;
      return makeApp(o.type, { ...(o.fields || {}), name: o.name, desc: o.desc, color: o.color });
    } catch (e) { return null; }
  }
  // 見本(GALLERY の形)を共有コードに
  const encodeSample = (g) => encode(makeApp(g.type, g));

  const siteBase = () => location.href.replace(/[^/]*$/, "");
  const appUrl = (cfg) => `${siteBase()}app.html#${encode(cfg)}`;
  const remixUrl = (cfg) => `${siteBase()}make.html#${encode(cfg)}`;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // このページがなくても単体で動く HTML
  function standaloneHtml(cfg) {
    const { runApp, APP_CSS } = window.JibunRuntime;
    const json = JSON.stringify(cfg).replace(/<\//g, "<\\/");
    return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="${esc(cfg.color || "#2f5bd9")}">
<title>${esc(cfg.name || "じぶんアプリ")}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Zen+Maru+Gothic:wght@700&display=swap">
<style>
html,body{margin:0;min-height:100%;background:#eceff4}
@media (prefers-color-scheme:dark){html,body{background:#0f1218}}
#app{max-width:520px;margin:0 auto;min-height:100vh}
${APP_CSS}
</style>
</head>
<body>
<div id="app" class="app-root"></div>
<script>
const CONFIG = ${json};
${runApp.toString()}
runApp(CONFIG, document.getElementById("app"), "jibun-app:" + CONFIG.id);
<\/script>
</body>
</html>
`;
  }

  // 小さな DOM 作成ヘルパー
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "value") node.value = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of children) if (c !== "" && c != null) node.append(c);
    return node;
  }

  let toastTimer;
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = el("div", { id: "toast", class: "toast", role: "status" }); document.body.append(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function copyText(text, label) {
    try { await navigator.clipboard.writeText(text); toast(`${label}をコピーしました`); return true; }
    catch (e) { toast("コピーできませんでした。表示した文字を選んでコピーしてください"); return false; }
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/html;charset=utf-8" });
    const a = el("a", { href: URL.createObjectURL(blob), download: filename });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // 見本アプリを「○○のコピー」ではなく手元のアプリとして登録するときの保存先(工房ページと同じ鍵)
  const store = {
    key: "jibun-app-kobo:v1",
    load() { try { return JSON.parse(localStorage.getItem(this.key)) ?? {}; } catch (e) { return {}; } },
    save(obj) { try { localStorage.setItem(this.key, JSON.stringify(obj)); } catch (e) {} },
  };

  window.Jibun = { ICON, TEMPLATES, COLORS, GALLERY, makeApp, encode, decode, encodeSample, appUrl, remixUrl, standaloneHtml, el, toast, copyText, download, store, uid, today, esc };
})();
