(() => {
  "use strict";

  const link = document.querySelector(".data-source-link");
  if (!link) return;

  function render(lang) {
    link.textContent = lang === "ja"
      ? "データ出典：対抗戦シートS11（屋外戦）"
      : "資料來源：対抗戦シートS11（屋外戦）";
  }

  render(window.ARENA_LANGUAGE?.get?.() || document.documentElement.lang);
  window.addEventListener("arena-language-change", (event) => {
    render(event.detail?.lang || window.ARENA_LANGUAGE?.get?.() || "zh-Hant");
  });
})();
