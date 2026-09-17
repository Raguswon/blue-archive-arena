(() => {
  "use strict";

  const el = document.querySelector("#blind-help");
  if (!el) return;

  const zh = "至少打過 5 種不同防守陣容的進攻隊伍";
  const ja = "5種類以上の異なる防御編成と対戦した攻撃編成";

  function render(lang) {
    el.textContent = lang === "ja" ? ja : zh;
  }

  render(window.ARENA_LANGUAGE?.get?.() || localStorage.getItem("arena-ui-language-v1") || "zh-Hant");
  window.addEventListener("arena-language-change", (e) => render(e.detail?.lang));
})();
