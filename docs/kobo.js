// 工房ページの動き: じぶんのアプリ → 3ステップ(型 / 書きかえ / できあがり) → プレビュー・共有
(function () {
  const { TEMPLATES, COLORS, ICON, GALLERY, makeApp, encode, decode, appUrl, standaloneHtml, el, toast, copyText, download, store } = window.Jibun;
  const { runApp } = window.JibunRuntime;
  const $ = (id) => document.getElementById(id);

  // ---- 状態 ----
  let state = store.load();
  if (!Array.isArray(state.apps) || !state.apps.length) {
    const seeds = GALLERY.slice(0, 3).map((g) => makeApp(g.type, g));
    state = { apps: seeds, currentId: seeds[0].id };
    store.save(state);
  }
  let step = 1;
  let sheetOpen = false;
  const current = () => state.apps.find((a) => a.id === state.currentId) || state.apps[0];
  function persist() { store.save(state); flashSaved(); }

  let savedTimer;
  function flashSaved() {
    const s = $("autosave");
    s.textContent = "保存しました";
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => (s.textContent = "自動で保存されます"), 1800);
  }

  // URL の # で指示があれば先に処理(見本のリミックス・型を指定した新規)
  (function handleHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    if (h.startsWith("JA1.")) {
      const a = decode(h);
      if (!a) { toast("リンクの中身が読めませんでした"); return; }
      state.apps.push(a); state.currentId = a.id; store.save(state); step = 2;
      toast(`「${a.name}」を手元にコピーしました。自由に書きかえてください`);
    } else if (h.startsWith("new-") && TEMPLATES[h.slice(4)]) {
      const a = makeApp(h.slice(4));
      state.apps.push(a); state.currentId = a.id; store.save(state); step = 2;
    }
    history.replaceState(null, "", location.pathname);
  })();

  // ---- じぶんのアプリ ----
  function renderMyApps() {
    const cur = current();
    $("myapps").replaceChildren(
      ...state.apps.map((a) => el("button", { class: "tab", "aria-pressed": String(a.id === cur.id), onclick: () => { state.currentId = a.id; store.save(state); renderAll(); } },
        el("i", { style: `background:${a.color}` }), a.name || "(名前なし)")),
      el("button", { class: "tab new", onclick: () => newApp() }, "+ 新しく作る"),
    );
  }
  function newApp(type) {
    const a = makeApp(type || current().type);
    state.apps.push(a); state.currentId = a.id; store.save(state);
    go(type ? 2 : 1);
    toast("新しいアプリを用意しました");
  }

  // ---- ステップ ----
  function go(n) {
    step = n;
    renderAll();
    if (window.matchMedia("(max-width: 900px)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function renderStepper() {
    const cur = current();
    [...$("stepper").querySelectorAll("button")].forEach((b) => {
      const n = Number(b.dataset.step);
      b.toggleAttribute("aria-current", n === step);
      if (n === step) b.setAttribute("aria-current", "step");
      b.classList.toggle("done", n < step);
      b.onclick = () => go(n);
    });
    $("st1").textContent = TEMPLATES[cur.type].name;
    $("st2").textContent = cur.name || "名前を決める";
    [1, 2, 3].forEach((n) => ($(`pane${n}`).hidden = n !== step));
    // モバイル用のバーと「見る」ボタン
    $("mBack").disabled = step === 1;
    $("mBack").textContent = step === 1 ? "戻る" : "戻る";
    $("mNext").textContent = step === 1 ? "次へ: 書きかえる" : step === 2 ? "次へ: できあがり" : "もうひとつ作る";
    $("fab").hidden = step === 3;
  }

  // ---- 1. 型 ----
  function renderTypes() {
    const cur = current();
    $("tgrid").replaceChildren(...Object.entries(TEMPLATES).map(([key, t]) =>
      el("button", { class: "tbtn", "aria-pressed": String(cur.type === key), onclick: () => {
        if (cur.type !== key) {
          cur.type = key;
          const fields = {};
          for (const fd of t.fields) fields[fd.key] = cur.fields[fd.key] ?? t.sample[fd.key] ?? "";
          cur.fields = fields;
          persist();
        }
        renderTypes(); renderStepper(); renderPreview();
      } },
        el("span", { class: "ico", html: ICON[key] }), el("b", {}, t.name), el("span", {}, t.blurb), el("span", {}, `例: ${t.eg}`))));
  }

  // ---- 2. 書きかえ ----
  let previewTimer;
  function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 160); }

  function renderForm() {
    const cur = current(); const t = TEMPLATES[cur.type];
    const bind = (node, apply) => { node.addEventListener("input", () => { apply(node.value); persist(); schedulePreview(); renderMyApps(); $("st2").textContent = cur.name || "名前を決める"; }); return node; };
    const kids = [
      el("label", { class: "field" }, el("span", {}, "アプリの名前"), bind(el("input", { type: "text", id: "f-name", value: cur.name, maxlength: "40", placeholder: "例: 割り勘けいさん" }), (v) => (cur.name = v))),
      el("label", { class: "field" }, el("span", {}, "ひとこと説明", el("span", { class: "hint" }, "なくてもOK")), bind(el("input", { type: "text", id: "f-desc", value: cur.desc, maxlength: "60", placeholder: "例: 合計と人数を入れるだけ" }), (v) => (cur.desc = v))),
      el("div", { class: "field" }, el("span", {}, "色"), el("div", { class: "swatches" }, ...COLORS.map(([c, label]) =>
        el("button", { class: "sw", type: "button", style: `background:${c}`, "aria-label": label, title: label, "aria-pressed": String(cur.color === c), onclick: () => { cur.color = c; persist(); renderForm(); renderPreview(); renderMyApps(); } })))),
    ];
    for (const fd of t.fields) {
      let input;
      if (fd.kind === "textarea") input = el("textarea", { id: `f-${fd.key}`, rows: String(fd.rows || 6), value: cur.fields[fd.key] || "" });
      else if (fd.kind === "select") { input = el("select", { id: `f-${fd.key}` }, ...fd.options.map(([v, l]) => el("option", { value: v }, l))); input.value = cur.fields[fd.key] || fd.options[0][0]; }
      else input = el("input", { type: "text", id: `f-${fd.key}`, value: cur.fields[fd.key] || "" });
      bind(input, (v) => (cur.fields[fd.key] = v));
      if (fd.kind === "select") input.addEventListener("change", () => { cur.fields[fd.key] = input.value; persist(); renderPreview(); });
      kids.push(el("label", { class: "field" }, el("span", {}, fd.label, fd.hint ? el("span", { class: "hint" }, fd.hint) : ""), input));
    }
    $("form").replaceChildren(...kids);
  }

  // ---- 3. できあがり ----
  function renderShare() {
    const cur = current();
    const url = appUrl(cur);
    $("linkUrl").value = url;
    $("openLink").href = url;
    $("codeText").value = encode(cur);
    $("applyResult").hidden = true; // 中身が変わったら作り直してもらう
  }

  // ---- プレビュー(見えている枠にだけ描く) ----
  // 見えなくなった枠のタイマーやアニメは止める(止めないと隠れたまま鳴る)
  function stopPreview(root) { if (root.__cleanup) { try { root.__cleanup(); } catch (e) {} root.__cleanup = null; } }
  function renderPreview() {
    const cur = current();
    const key = `jibun-app:${cur.id}`;
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const show = { pv: !mobile, pv3: mobile && step === 3, pv2: sheetOpen };
    for (const id of ["pv", "pv3", "pv2"]) {
      if (show[id]) runApp(cur, $(id), key); else stopPreview($(id));
    }
    if (step === 3) renderShare();
  }

  // 削除の確認は「いま選んでいるアプリ」に結びつける。切り替えや再描画で解除する
  let armTimer;
  function disarmDelete() { const btn = $("del"); btn.dataset.armed = ""; btn.textContent = "消す"; }
  function renderAll() { disarmDelete(); renderMyApps(); renderStepper(); renderTypes(); renderForm(); renderPreview(); }

  // ---- ボタン ----
  $("to2").onclick = () => go(2);
  $("to3").onclick = () => go(3);
  $("back1").onclick = () => go(1);
  $("back2").onclick = () => go(2);
  $("newFrom3").onclick = () => newApp();
  $("mBack").onclick = () => go(Math.max(1, step - 1));
  $("mNext").onclick = () => (step === 3 ? newApp() : go(step + 1));

  $("copyLink").onclick = async () => { if (!(await copyText($("linkUrl").value, "リンク"))) { $("linkUrl").focus(); $("linkUrl").select(); } };
  $("copyCode").onclick = async () => { if (!(await copyText($("codeText").value, "共有コード"))) { $("codeText").focus(); $("codeText").select(); } };
  $("saveHtml").onclick = () => { const cur = current(); download(`${(cur.name || "じぶんアプリ").replace(/[\\/:*?"<>|]/g, "_")}.html`, standaloneHtml(cur)); toast("HTML を保存しました"); };
  $("importBtn").onclick = () => {
    const a = decode($("importText").value);
    if (!a) { toast("共有コードが読めませんでした。JA1. で始まる文字列を貼ってください"); return; }
    state.apps.push(a); state.currentId = a.id; store.save(state); $("importText").value = "";
    go(2); toast(`「${a.name}」を読み込みました`);
  };
  $("applyBtn").onclick = () => {
    if (!$("applyOk").checked) { toast("確認のチェックを入れてください"); $("applyOk").focus(); return; }
    const cur = current();
    const line = (s) => s.replace(/\s+/g, " ").trim();
    $("applyText").value = [
      "【じぶんアプリ工房 掲載申し込み】",
      `アプリ: ${line(cur.name || "(名前なし)")}`,
      `作者: ${line($("applyBy").value) || "名無し"}`,
      `ひとこと: ${line($("applyNote").value)}`,
      `リンク: ${appUrl(cur)}`,
    ].join("\n");
    $("applyResult").hidden = false;
    $("applyShare").hidden = !navigator.share;
  };
  $("applyCopy").onclick = async () => { if (!(await copyText($("applyText").value, "申し込み文"))) { $("applyText").focus(); $("applyText").select(); } };
  $("applyShare").onclick = async () => { try { await navigator.share({ text: $("applyText").value }); } catch (e) { if (e.name !== "AbortError") toast("送れませんでした。コピーして送ってください"); } };
  $("dup").onclick = () => {
    const cur = current();
    const a = { ...cur, id: window.Jibun.uid(), name: `${cur.name} のコピー`, fields: { ...cur.fields }, created: window.Jibun.today() };
    state.apps.push(a); state.currentId = a.id; store.save(state); go(2); toast("複製しました");
  };
  $("del").onclick = () => {
    const btn = $("del");
    const cur = current();
    if (btn.dataset.armed !== cur.id) { btn.dataset.armed = cur.id; btn.textContent = "本当に消す(もう一度押す)"; clearTimeout(armTimer); armTimer = setTimeout(disarmDelete, 3000); return; }
    clearTimeout(armTimer);
    try { localStorage.removeItem(`jibun-app:${cur.id}`); } catch (e) {}
    state.apps = state.apps.filter((a) => a.id !== cur.id);
    if (!state.apps.length) state.apps.push(makeApp("checklist"));
    state.currentId = state.apps[0].id;
    btn.dataset.armed = ""; btn.textContent = "消す";
    store.save(state); go(1); toast("消しました");
  };

  // ---- モバイル: できあがりシート ----
  function openSheet() { sheetOpen = true; $("sheet").classList.add("open"); renderPreview(); document.body.style.overflow = "hidden"; }
  function closeSheet() { sheetOpen = false; $("sheet").classList.remove("open"); document.body.style.overflow = ""; stopPreview($("pv2")); }
  $("fab").onclick = openSheet;
  $("sheetDim").onclick = closeSheet;
  $("sheetClose").onclick = closeSheet;
  window.matchMedia("(max-width: 900px)").addEventListener("change", () => { closeSheet(); renderPreview(); });

  renderAll();
})();
