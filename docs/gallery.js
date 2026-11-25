// ギャラリーページ: みんなの作品と見本を、型と言葉で絞り込んで見せる
(function () {
  const { TEMPLATES, GALLERY, ICON, decode, encodeSample, el } = window.Jibun;
  const $ = (id) => document.getElementById(id);
  const safeColor = (c) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c : "#f57f31");

  function toItem(code, by, note, added) {
    const cfg = decode(code);
    if (!cfg) return null;
    const body = Object.values(cfg.fields || {}).join(" ");
    return { code, cfg, by, note, added, text: `${cfg.name} ${cfg.desc} ${by} ${note || ""} ${body}`.toLowerCase() };
  }

  const people = (window.JibunGallery || []).map((e) => toItem(e.code, e.by || "名無し", e.note, e.added)).filter(Boolean).reverse();
  const samples = GALLERY.map((g) => toItem(encodeSample(g), "見本"));

  let type = "all";
  let query = "";

  function card(it) {
    const { cfg } = it;
    return el("article", { class: "gcard", style: `--c:${safeColor(cfg.color)}` },
      el("div", { class: "band" }, el("span", { html: ICON[cfg.type] }), el("span", { class: "chip" }, TEMPLATES[cfg.type].name)),
      el("div", { class: "body" },
        el("h3", {}, cfg.name || "(名前なし)"),
        el("p", {}, it.note || cfg.desc || ""),
        el("div", { class: "meta" }, el("span", {}, `作: ${it.by}`), it.added ? el("span", {}, it.added) : "")),
      el("div", { class: "acts" },
        el("a", { class: "btn sm", href: `app.html#${it.code}` }, "開く"),
        el("a", { class: "btn sm ghost", href: `make.html#${it.code}` }, "まねして作る")),
    );
  }

  const match = (it) => (type === "all" || it.cfg.type === type) && (!query || it.text.includes(query));

  function render() {
    const p = people.filter(match);
    const s = samples.filter(match);
    const filtering = type !== "all" || !!query;
    $("peopleCount").textContent = `${p.length}本`;
    $("sampleCount").textContent = `${s.length}本`;
    $("peopleGrid").replaceChildren(...p.map(card));
    $("sampleGrid").replaceChildren(...s.map(card));
    $("peopleEmpty").hidden = p.length > 0;
    $("peopleEmptyText").textContent = people.length
      ? "この条件に合う作品はまだありません。"
      : "まだ1本もありません。あなたのアプリが、最初の1本になります。";
    $("sampleEmpty").hidden = s.length > 0;
    $("clearFilter").hidden = !filtering;
  }

  const options = [["all", "すべて"], ...Object.entries(TEMPLATES).map(([k, t]) => [k, t.name])];
  function renderSeg() {
    $("typeSeg").replaceChildren(...options.map(([k, label]) =>
      el("button", { type: "button", "aria-pressed": String(type === k), onclick: () => { type = k; renderSeg(); render(); } }, label)));
  }

  $("search").addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); render(); });
  $("clearFilter").addEventListener("click", () => { type = "all"; query = ""; $("search").value = ""; renderSeg(); render(); });

  renderSeg();
  render();
})();
