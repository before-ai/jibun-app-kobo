// じぶんアプリ工房 — できあがったアプリの本体。
// 工房ページ(make.html)・アプリページ(app.html)・書き出した単体 HTML の3か所で同じものが動く。
// runApp は外の変数に頼らない(toString() で書き出すため)。

const APP_CSS = `
.app-root{--ac:#3a5bd9;--app-bg:#fff;--app-fg:#1c2230;--app-muted:#6b7385;--app-line:#e1e5ee;font:16px/1.6 "Noto Sans JP","Hiragino Sans",-apple-system,sans-serif;color:var(--app-fg);background:var(--app-bg);min-height:100%;display:flex;flex-direction:column}
@media (prefers-color-scheme:dark){.app-root{--app-bg:#171b24;--app-fg:#e8ebf2;--app-muted:#9aa3b5;--app-line:#2e3545}}
.app-root *{box-sizing:border-box}
.app-head{background:var(--ac);color:#fff;padding:22px 18px 16px}
.app-head h1{margin:0;font:700 1.35rem/1.3 "Zen Maru Gothic","Hiragino Maru Gothic ProN","Noto Sans JP",sans-serif}
.app-head p{margin:4px 0 0;opacity:.92;font-size:.9rem}
.app-body{padding:16px 18px;display:grid;gap:14px;flex:1;align-content:start}
.app-foot{padding:12px 18px;font-size:.75rem;color:var(--app-muted);border-top:1px solid var(--app-line)}
.app-btn{font:inherit;min-height:46px;padding:10px 18px;border-radius:999px;border:2px solid var(--ac);background:var(--ac);color:#fff;font-weight:700;cursor:pointer}
.app-btn.ghost{background:transparent;color:var(--ac)}
.app-btn:disabled{opacity:.6;cursor:default}
.app-chip{font:inherit;padding:6px 12px;border-radius:999px;border:1px solid var(--app-line);background:transparent;color:var(--app-fg);cursor:pointer;min-height:36px}
.app-chip[aria-pressed="true"]{border-color:var(--ac);color:var(--ac);font-weight:700}
.app-list{list-style:none;margin:0;padding:0}
.app-list li{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--app-line)}
.app-list li:first-child{border-top:0}
.app-list label{display:flex;gap:10px;align-items:center;flex:1;cursor:pointer;min-width:0}
.app-list label.done{color:var(--app-muted);text-decoration:line-through}
.app-list input[type=checkbox]{width:22px;height:22px;accent-color:var(--ac);flex:none;margin:0}
.app-bar{height:8px;border-radius:999px;background:var(--app-line);overflow:hidden}
.app-bar i{display:block;height:100%;background:var(--ac);transition:width .3s}
.app-stat{font-size:.95rem;color:var(--app-muted)}
.app-stat strong{font-size:1.6rem;color:var(--app-fg);font-variant-numeric:tabular-nums;margin-right:4px}
.app-fields{display:grid;gap:10px}
.app-fields label{display:grid;gap:4px;font-size:.9rem;color:var(--app-muted)}
.app-root input:not([type=checkbox]){font:inherit;padding:10px 12px;border:1px solid var(--app-line);border-radius:10px;background:transparent;color:var(--app-fg);width:100%;min-height:44px}
.app-result{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding:14px 16px;border-radius:14px;background:color-mix(in srgb,var(--ac) 12%,transparent)}
.app-result strong{font-size:2rem;font-variant-numeric:tabular-nums;line-height:1.2}
.app-result-label{color:var(--app-muted)}
.app-result.big{flex-direction:column;align-items:center;text-align:center;padding:28px 16px;min-height:120px;justify-content:center}
.app-result.big strong{font-size:1.7rem;overflow-wrap:anywhere}
.app-result.big p{margin:6px 0 0;color:var(--app-muted)}
.app-q{font-size:1.25rem;font-weight:700;margin:8px 0;line-height:1.5}
.app-row{display:flex;gap:10px;flex-wrap:wrap}
.app-row .app-btn{flex:1}
.app-clock{font-size:3.6rem;font-weight:700;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:.02em;line-height:1.1}
.app-note{margin:0;font-size:.85rem;color:var(--app-muted)}
.app-empty{margin:0;padding:18px;text-align:center;color:var(--app-muted);border:1px dashed var(--app-line);border-radius:12px}
.app-x{border:0;background:transparent;color:var(--app-muted);font-size:1.2rem;cursor:pointer;padding:4px 8px;min-width:36px}
.app-date{font-size:.85rem;color:var(--app-muted);font-variant-numeric:tabular-nums;flex:none}
.app-memo{flex:1;font-size:.85rem;color:var(--app-muted);min-width:0;overflow-wrap:anywhere}
.app-spark{width:100%;height:64px;display:block}
@media (prefers-reduced-motion:reduce){.app-root *{transition:none!important}}
`;

function runApp(config, root, storeKey) {
  const f = config.fields || {};
  const lines = (s) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const st = {
    load() { try { return JSON.parse(localStorage.getItem(storeKey)) || {}; } catch (e) { return {}; } },
    save(o) { try { localStorage.setItem(storeKey, JSON.stringify(o)); } catch (e) {} },
  };
  function h(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") n.className = v;
      else if (k === "value") n.value = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const k of kids) if (k !== "" && k != null) n.append(k);
    return n;
  }
  const fmtNum = (n) => (!isFinite(n) ? "計算できません" : (Math.round(n * 100) / 100).toLocaleString("ja-JP"));
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

  if (root.__cleanup) { try { root.__cleanup(); } catch (e) {} }
  root.__cleanup = null;
  root.classList.add("app-root");
  root.style.setProperty("--ac", config.color || "#3a5bd9");

  function frame(...body) {
    root.replaceChildren(
      h("header", { class: "app-head" }, h("h1", {}, config.name || "名前のないアプリ"), config.desc ? h("p", {}, config.desc) : ""),
      h("main", { class: "app-body" }, ...body),
      h("footer", { class: "app-foot" }, "じぶんアプリ工房で作成 · 記録はこの端末の中だけに残ります"),
    );
  }

  const views = {
    checklist() {
      const items = lines(f.items);
      // 行番号で記録する(同じ文の行が複数あっても別々に扱う)。古い記録(文で保存)は行番号に読み替える
      const done = new Set((st.load().done || []).map((d) => (typeof d === "number" ? d : items.indexOf(d))).filter((i) => i >= 0 && i < items.length));
      const draw = () => {
        const n = items.filter((_, i) => done.has(i)).length;
        frame(
          h("div", { class: "app-stat" }, h("strong", {}, `${n} / ${items.length}`), "できた"),
          h("div", { class: "app-bar" }, h("i", { style: `width:${items.length ? (n / items.length) * 100 : 0}%` })),
          items.length
            ? h("ul", { class: "app-list" }, ...items.map((it, idx) => {
                const cb = h("input", { type: "checkbox" });
                cb.checked = done.has(idx);
                cb.addEventListener("change", () => { cb.checked ? done.add(idx) : done.delete(idx); st.save({ done: [...done] }); draw(); });
                return h("li", {}, h("label", { class: done.has(idx) ? "done" : "" }, cb, h("span", {}, it)));
              }))
            : h("p", { class: "app-empty" }, "項目がまだありません。左の欄に1行ずつ書いてください。"),
          items.length ? h("button", { class: "app-btn ghost", onclick: () => { done.clear(); st.save({ done: [] }); draw(); } }, "全部もどす") : "",
        );
      };
      draw();
    },

    calc() {
      const inputs = lines(f.inputs);
      // 以前は名前で記録していた。数字だけの名前は番号の記録とぶつかるので読み替えない
      const legacy = (name) => !/^\d+$/.test(name);
      const op = f.op || "sum";
      const vals = st.load().vals || {};
      const opName = { sum: "すべて足します", avg: "平均を出します", mul: "すべて掛けます", div: "上から順に割ります", sub: "上から順に引きます" };
      const fields = inputs.map((name, i) => {
        const inp = h("input", { type: "number", inputmode: "decimal", placeholder: "0", value: vals[i] ?? (legacy(name) ? vals[name] : undefined) ?? "" });
        inp.addEventListener("input", () => { vals[i] = inp.value; if (legacy(name)) delete vals[name]; st.save({ vals }); update(); });
        return { name, inp };
      });
      const out = h("div", { class: "app-result" });
      function compute() {
        const nums = fields.map((x) => parseFloat(x.inp.value));
        if (!nums.length || nums.some((n) => isNaN(n))) return null;
        if (op === "avg") return nums.reduce((a, b) => a + b, 0) / nums.length;
        if (op === "mul") return nums.reduce((a, b) => a * b, 1);
        if (op === "div") return nums.slice(1).reduce((a, b) => (b === 0 ? NaN : a / b), nums[0]);
        if (op === "sub") return nums.slice(1).reduce((a, b) => a - b, nums[0]);
        return nums.reduce((a, b) => a + b, 0);
      }
      function update() {
        const r = compute();
        out.replaceChildren(
          h("span", { class: "app-result-label" }, f.resultLabel || "結果"),
          h("strong", {}, r === null ? "—" : fmtNum(r)),
          h("span", { class: "app-result-label" }, r === null ? "" : f.unit || ""),
        );
      }
      frame(
        fields.length
          ? h("div", { class: "app-fields" }, ...fields.map((x) => h("label", {}, h("span", {}, x.name), x.inp)))
          : h("p", { class: "app-empty" }, "入れる数がまだありません。"),
        h("p", { class: "app-note" }, opName[op] || ""),
        out,
        h("button", { class: "app-btn ghost", onclick: () => { fields.forEach((x) => (x.inp.value = "")); Object.keys(vals).forEach((k) => delete vals[k]); st.save({ vals }); update(); } }, "クリア"),
      );
      update();
    },

    quiz() {
      const qs = lines(f.questions);
      const res = lines(f.results).map((l) => { const [t, ...d] = l.split("|"); return { title: t.trim(), desc: d.join("|").trim() }; });
      let i = 0, score = 0;
      function draw() {
        if (!qs.length) { frame(h("p", { class: "app-empty" }, "質問がまだありません。")); return; }
        if (i >= qs.length) {
          const idx = Math.min(res.length - 1, Math.floor((score / qs.length) * res.length));
          const r = res[idx] || { title: `「はい」が ${score} 個`, desc: "" };
          frame(
            h("p", { class: "app-note" }, `「はい」が ${score} / ${qs.length}`),
            h("div", { class: "app-result big" }, h("strong", {}, r.title), r.desc ? h("p", {}, r.desc) : ""),
            h("button", { class: "app-btn", onclick: () => { i = 0; score = 0; draw(); } }, "もう一度"),
          );
          return;
        }
        frame(
          h("p", { class: "app-note" }, `${i + 1} / ${qs.length}`),
          h("div", { class: "app-bar" }, h("i", { style: `width:${(i / qs.length) * 100}%` })),
          h("p", { class: "app-q" }, qs[i]),
          h("div", { class: "app-row" },
            h("button", { class: "app-btn", onclick: () => { score++; i++; draw(); } }, "はい"),
            h("button", { class: "app-btn ghost", onclick: () => { i++; draw(); } }, "いいえ")),
        );
      }
      draw();
    },

    log() {
      const label = f.valueLabel || "値";
      const unit = f.unit || "";
      const rows = st.load().rows || [];
      function spark() {
        const pts = rows.slice(0, 14).reverse();
        if (pts.length < 2) return "";
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 300 64"); svg.setAttribute("class", "app-spark"); svg.setAttribute("aria-hidden", "true");
        const vs = pts.map((r) => r.v); const min = Math.min(...vs), max = Math.max(...vs); const span = max - min || 1;
        const xy = pts.map((r, k) => [8 + (k / (pts.length - 1)) * 284, 54 - ((r.v - min) / span) * 44]);
        const area = document.createElementNS(ns, "path");
        area.setAttribute("d", `M${xy[0][0]},60 ` + xy.map((p) => `L${p[0]},${p[1]}`).join(" ") + ` L${xy[xy.length - 1][0]},60 Z`);
        area.setAttribute("fill", "var(--ac)"); area.setAttribute("opacity", "0.15");
        const line = document.createElementNS(ns, "polyline");
        line.setAttribute("points", xy.map((p) => p.join(",")).join(" ")); line.setAttribute("fill", "none"); line.setAttribute("stroke", "var(--ac)"); line.setAttribute("stroke-width", "2.5"); line.setAttribute("stroke-linejoin", "round");
        const dot = document.createElementNS(ns, "circle");
        const last = xy[xy.length - 1]; dot.setAttribute("cx", last[0]); dot.setAttribute("cy", last[1]); dot.setAttribute("r", "4"); dot.setAttribute("fill", "var(--ac)");
        svg.append(area, line, dot);
        return svg;
      }
      function draw() {
        const date = h("input", { type: "date", value: today() });
        const val = h("input", { type: "number", inputmode: "decimal", placeholder: label });
        const memo = h("input", { type: "text", placeholder: "ひとこと(なくてもOK)" });
        const nums = rows.map((r) => r.v);
        const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
        frame(
          h("div", { class: "app-fields" },
            h("label", {}, h("span", {}, "日付"), date),
            h("label", {}, h("span", {}, unit ? `${label}(${unit})` : label), val),
            h("label", {}, h("span", {}, "メモ"), memo)),
          h("button", { class: "app-btn", onclick: () => { const v = parseFloat(val.value); if (isNaN(v)) { val.focus(); return; } rows.unshift({ d: date.value || today(), v, m: memo.value.trim() }); st.save({ rows }); draw(); } }, "記録する"),
          rows.length
            ? h("div", { class: "app-stat" }, `${rows.length} 件 · 平均 `, h("strong", {}, fmtNum(avg)), unit)
            : h("p", { class: "app-empty" }, "まだ記録がありません。最初の1件をどうぞ。"),
          spark(),
          h("ul", { class: "app-list" }, ...rows.slice(0, 30).map((r, idx) =>
            h("li", {}, h("span", { class: "app-date" }, r.d), h("strong", {}, `${fmtNum(r.v)}${unit}`), h("span", { class: "app-memo" }, r.m || ""),
              h("button", { class: "app-x", title: "この記録を消す", onclick: () => { rows.splice(idx, 1); st.save({ rows }); draw(); } }, "×")))),
        );
      }
      draw();
    },

    timer() {
      const parseSec = (s) => {
        s = String(s || "").trim();
        if (/^\d+$/.test(s)) return parseInt(s, 10);
        let t = 0; const m = s.match(/(\d+)\s*分/); const sec = s.match(/(\d+)\s*秒/);
        if (m) t += parseInt(m[1], 10) * 60; if (sec) t += parseInt(sec[1], 10);
        return t;
      };
      const presets = lines(f.presets).map((l) => { const [n, s] = l.split("|"); return { name: (n || "").trim(), sec: parseSec(s ?? n) }; }).filter((p) => p.sec > 0);
      let total = presets[0] ? presets[0].sec : 60, left = total, tick = null, running = false, cur = 0;
      const fmtT = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      // iOS Safari などは利用者の操作中に作った音声コンテキストしか鳴らない。スタート時に作って終了時に使い回す
      let audio = null;
      function unlockAudio() {
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!Ctx) return;
          if (!audio) audio = new Ctx();
          if (audio.state === "suspended") audio.resume().catch(() => {});
        } catch (e) {}
      }
      function beep() {
        try {
          const ctx = audio; if (!ctx) return;
          [0, 0.25, 0.5].forEach((at) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = 0.15; o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.18); });
        } catch (e) {}
      }
      const disp = h("div", { class: "app-clock" });
      const bar = h("i", {});
      const status = h("p", { class: "app-note", style: "text-align:center;min-height:1.4em" });
      const chips = presets.map((p, k) => h("button", { class: "app-chip", onclick: () => { stop(); cur = k; total = p.sec; left = total; update(); } }, `${p.name} ${fmtT(p.sec)}`));
      function update() {
        disp.textContent = fmtT(left);
        bar.style.width = `${total ? (1 - left / total) * 100 : 0}%`;
        startBtn.textContent = running ? "一時停止" : left === total ? "スタート" : left === 0 ? "もう一度" : "再開";
        status.textContent = left === 0 ? "時間です!" : running ? "計測中" : "";
        chips.forEach((c, k) => c.setAttribute("aria-pressed", String(k === cur)));
      }
      function stop() { clearInterval(tick); tick = null; running = false; }
      function start() {
        if (left <= 0) left = total;
        running = true;
        const end = Date.now() + left * 1000;
        tick = setInterval(() => { left = Math.max(0, Math.round((end - Date.now()) / 1000)); if (left === 0) { stop(); beep(); } update(); }, 250);
        update();
      }
      const startBtn = h("button", { class: "app-btn", onclick: () => { if (running) { stop(); update(); } else { unlockAudio(); start(); } } });
      const resetBtn = h("button", { class: "app-btn ghost", onclick: () => { stop(); left = total; update(); } }, "リセット");
      root.__cleanup = stop;
      frame(
        presets.length ? h("div", { class: "app-row" }, ...chips) : h("p", { class: "app-note" }, "時間の候補がないので 1 分で動きます。"),
        disp,
        h("div", { class: "app-bar" }, bar),
        status,
        h("div", { class: "app-row" }, startBtn, resetBtn),
      );
      update();
    },

    lottery() {
      const items = lines(f.items);
      const exclude = f.exclude === "yes";
      // 引いた候補は番号で記録する(同じ文字の候補も別々のくじ)。以前の文字での記録は番号に読み替える
      const saved = st.load();
      let drawn = Array.isArray(saved.drawnIdx)
        ? saved.drawnIdx.filter((i) => Number.isInteger(i) && i >= 0 && i < items.length)
        : (saved.drawn || []).reduce((acc, label) => { const i = items.findIndex((x, j) => x === label && !acc.includes(j)); if (i >= 0) acc.push(i); return acc; }, []);
      const out = h("div", { class: "app-result big" }, h("strong", {}, "?"));
      const note = h("p", { class: "app-note", style: "text-align:center" });
      const all = items.map((x, i) => i);
      function remain() { return all.filter((i) => !drawn.includes(i)); }
      function drawNote() { note.textContent = exclude ? `残り ${remain().length} / ${items.length}` : `${items.length} 個の中からひとつ`; }
      let spin = null;
      root.__cleanup = () => { clearInterval(spin); spin = null; };
      const btn = h("button", { class: "app-btn", onclick: () => {
        const pool = exclude ? remain() : all;
        if (!pool.length) { out.replaceChildren(h("strong", {}, items.length ? "全部引きました" : "候補がありません")); return; }
        if (spin) return;
        btn.disabled = true; let n = 0;
        spin = setInterval(() => {
          out.replaceChildren(h("strong", {}, items[pool[Math.floor(Math.random() * pool.length)]]));
          if (++n >= 12) {
            clearInterval(spin); spin = null;
            const pick = pool[Math.floor(Math.random() * pool.length)];
            out.replaceChildren(h("strong", {}, items[pick]));
            if (exclude) { drawn.push(pick); st.save({ drawnIdx: drawn }); }
            btn.disabled = false; drawNote();
          }
        }, 70);
      } }, "引く!");
      frame(
        out, btn, note,
        exclude ? h("button", { class: "app-btn ghost", onclick: () => { clearInterval(spin); spin = null; btn.disabled = false; drawn = []; st.save({ drawnIdx: drawn }); out.replaceChildren(h("strong", {}, "?")); drawNote(); } }, "最初から") : "",
      );
      drawNote();
    },
  };
  (views[config.type] || views.checklist)();
}


// ページ側にもアプリ用の見た目を当てる
(function () {
  const s = document.createElement("style");
  s.id = "jibun-runtime-css";
  s.textContent = APP_CSS;
  document.head.append(s);
})();

window.JibunRuntime = { runApp, APP_CSS };
