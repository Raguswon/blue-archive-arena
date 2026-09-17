(() => {
  "use strict";

  const target = document.querySelector("#form-message");
  if (!target) return;

  const zh = "沒有完全符合的歷史紀錄，已依射程／掩體／敵方攻防剋制尋找替代陣容";

  function shorten() {
    const text = target.textContent.trim();
    if (text.startsWith(zh) && text !== zh) target.textContent = zh;
  }

  shorten();
  new MutationObserver(shorten).observe(target, { childList: true, characterData: true, subtree: true });
})();
