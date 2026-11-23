// アプリページ: リンクの # に入った共有コードからアプリを組み立てて、そのまま使えるようにする
(function () {
  const { decode, remixUrl, el } = window.Jibun;
  const { runApp } = window.JibunRuntime;

  // 同じリンクなら同じ保存先になるよう、コードの文字列から鍵を作る
  function keyOf(code) {
    let h = 5381;
    for (let i = 0; i < code.length; i++) h = ((h << 5) + h + code.charCodeAt(i)) | 0;
    return `jibun-app:link-${(h >>> 0).toString(36)}`;
  }

  function showMissing() {
    document.getElementById("stage").replaceChildren(
      el("div", { class: "viewer-missing" },
        el("h2", {}, "アプリが見つかりません"),
        el("p", { class: "muted" }, "このリンクにはアプリの中身が入っていないようです。リンクが途中で切れていないか確かめるか、工房で新しく作ってください。"),
        el("a", { class: "btn", href: "make.html" }, "工房で作る"),
      ),
    );
    document.getElementById("remix").hidden = true;
  }

  // アプリごとのアイコン(アプリの色の地に、名前の最初の1文字)。ホーム画面に置いたときの絵になる
  function makeIcon(cfg) {
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 180;
      const g = c.getContext("2d");
      g.fillStyle = cfg.color || "#f57f31";
      g.fillRect(0, 0, 180, 180);
      g.fillStyle = "#fff";
      g.font = '900 104px "Noto Sans JP","Hiragino Sans",sans-serif';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(Array.from((cfg.name || "じ").trim())[0] || "じ", 90, 98);
      return c.toDataURL("image/png");
    } catch (e) { return ""; }
  }

  const isStandalone = () => window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;

  const STEPS = {
    ios: ["iPhone・iPad(Safari)", ["画面の下(または上)の共有ボタン(四角から矢印が出ている絵)を押す", "「ホーム画面に追加」をえらぶ", "右上の「追加」を押す"]],
    android: ["Android(Chrome)", ["右上の「︙」を押す", "「ホーム画面に追加」をえらぶ", "「追加」を押す"]],
    pc: ["パソコン", ["このページをブックマークに入れる(Ctrl / ⌘ + D)", "スマホで使うときは、このリンクをスマホに送って開く"]],
  };

  function setupHome(cfg) {
    const icon = makeIcon(cfg);
    const name = cfg.name || "じぶんアプリ";
    document.getElementById("appTitle").setAttribute("content", name);
    if (icon) {
      document.getElementById("touchIcon").href = icon;
      document.getElementById("favIcon").href = icon;
      document.getElementById("homeIcon").src = icon;
    }
    const btn = document.getElementById("homeBtn");
    const sheet = document.getElementById("homeSheet");
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const order = ios ? ["ios"] : /Android/.test(ua) ? ["android"] : ["ios", "android", "pc"];
    document.getElementById("homeLead").textContent = `「${name}」が、ふつうのアプリと同じようにアイコンで並びます。`;
    document.getElementById("homeSteps").replaceChildren(...order.map((k) =>
      el("section", {}, el("h3", {}, STEPS[k][0]), el("ol", {}, ...STEPS[k][1].map((t) => el("li", {}, t))))));
    const open = (on) => { sheet.classList.toggle("open", on); sheet.setAttribute("aria-hidden", on ? "false" : "true"); };
    btn.addEventListener("click", () => open(true));
    sheet.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) open(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
  }

  function boot() {
    // ホーム画面から開いたときは、サイトの帯を出さずアプリだけにする
    if (isStandalone()) document.documentElement.classList.add("standalone");
    const code = decodeURIComponent(location.hash.slice(1));
    const cfg = code.startsWith("JA1.") ? decode(code) : null;
    if (!cfg) { showMissing(); document.getElementById("homeBtn").hidden = true; return; }
    document.title = cfg.name || "じぶんアプリ";
    document.getElementById("themeColor").setAttribute("content", cfg.color || "#e4562e");
    document.getElementById("remix").href = remixUrl(cfg);
    setupHome(cfg);
    runApp(cfg, document.getElementById("app"), keyOf(code));
  }

  window.addEventListener("hashchange", () => location.reload());
  boot();
})();
