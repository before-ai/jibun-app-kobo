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

  function boot() {
    const code = decodeURIComponent(location.hash.slice(1));
    const cfg = code.startsWith("JA1.") ? decode(code) : null;
    if (!cfg) { showMissing(); return; }
    document.title = cfg.name || "じぶんアプリ";
    document.getElementById("themeColor").setAttribute("content", cfg.color || "#e4562e");
    document.getElementById("remix").href = remixUrl(cfg);
    runApp(cfg, document.getElementById("app"), keyOf(code));
  }

  window.addEventListener("hashchange", () => location.reload());
  boot();
})();
