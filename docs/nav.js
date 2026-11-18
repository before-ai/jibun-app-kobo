// 共通ナビ: スマホ幅のメニュー開閉
(function () {
  const btn = document.getElementById("menuBtn");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => { if (e.target.closest("a")) { links.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav")) { links.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
})();
