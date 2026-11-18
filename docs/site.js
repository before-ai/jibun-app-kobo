// トップページの動き: ヒーローの見本・Point の絵・型の一覧・作品例
(function () {
  const { TEMPLATES, GALLERY, ICON, makeApp, appUrl, remixUrl, el } = window.Jibun;
  const { runApp } = window.JibunRuntime;
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

  // ---- ヒーローの見本(本物が動く) ----
  const demoIdx = [0, 1, 2];
  const seg = document.getElementById("demoSeg");
  const demoRoot = document.getElementById("demo");
  function showDemo(i) {
    const g = GALLERY[i];
    runApp(makeApp(g.type, g), demoRoot, `jibun-demo:${i}`);
    [...seg.children].forEach((b, k) => b.setAttribute("aria-pressed", String(demoIdx[k] === i)));
  }
  seg.replaceChildren(...demoIdx.map((i) => el("button", { role: "tab", "aria-pressed": "false", onclick: () => showDemo(i) }, GALLERY[i].name)));
  showDemo(0);

  // ---- Point の絵(型のタイルと、動いているスマホ) ----
  document.getElementById("tilesArt").replaceChildren(
    ...Object.entries(TEMPLATES).map(([key, t], i) =>
      el("div", { class: `t${i === 2 ? " on" : ""}` }, el("span", { html: ICON[key] }), el("span", {}, t.name))),
  );
  const p2 = GALLERY[2], p3 = GALLERY[3];
  runApp(makeApp(p2.type, p2), document.getElementById("pt2"), "jibun-demo:p2");
  runApp(makeApp(p3.type, p3), document.getElementById("pt3"), "jibun-demo:p3");

  // ---- 型の一覧 ----
  document.getElementById("types-grid").replaceChildren(
    ...Object.entries(TEMPLATES).map(([key, t]) =>
      el("a", { class: "tcard", href: `make.html#new-${key}` },
        el("div", { class: "ico", html: ICON[key] }),
        el("span", { class: "go", html: ARROW }),
        el("h3", {}, t.name),
        el("p", {}, t.blurb),
        el("div", { class: "eg" }, "たとえば ", el("b", {}, t.eg)),
      )),
  );

  // ---- 作品例 ----
  document.getElementById("gallery-grid").replaceChildren(
    ...GALLERY.map((g) => {
      const cfg = makeApp(g.type, g);
      return el("article", { class: "gcard", style: `--c:${g.color}` },
        el("div", { class: "band" }, el("span", { html: ICON[g.type] }), el("span", { class: "chip" }, TEMPLATES[g.type].name)),
        el("div", { class: "body" },
          el("h3", {}, g.name),
          el("p", {}, g.desc),
          el("div", { class: "meta" }, el("span", {}, `作: ${g.by}`))),
        el("div", { class: "acts" },
          el("a", { class: "btn sm", href: appUrl(cfg) }, "開く"),
          el("a", { class: "btn sm ghost", href: remixUrl(cfg) }, "まねして作る")),
      );
    }),
  );

  document.getElementById("updated").textContent = "更新: 2026-11-07";
})();
