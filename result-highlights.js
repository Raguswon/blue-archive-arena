(() => {
  "use strict";

  const results = document.querySelector("#results");
  if (!results) return;

  function selectedQueryNames() {
    return [...document.querySelectorAll(".defense-picker-host .picker-selected-name")]
      .map((el) => el.textContent.trim());
  }

  function sideMode(card) {
    const text = card.querySelector(".matchup-stats")?.textContent || "";
    const attack = text.includes("符合：我方") || text.includes("一致：味方");
    const defense = text.includes("符合：敵方") || text.includes("一致：相手");
    return { attack, defense };
  }

  function applySimilarity(card) {
    const spans = [...card.querySelectorAll(".matchup-stats span")];
    const badge = spans.find((el) => /^(符合度|一致度)\s*\d+(?:\.\d+)?%$/.test(el.textContent.trim()));
    if (!badge) return;
    const m = badge.textContent.match(/([\d.]+)%/);
    if (!m) return;
    const pct = Number(m[1]);
    badge.classList.toggle("similarity-perfect", pct === 100);
    badge.classList.toggle("similarity-partial", pct !== 100);
  }

  function markTeam(teamEl, query) {
    if (!teamEl) return;
    const cards = [...teamEl.querySelectorAll(".battle-char")];
    cards.forEach((el) => el.classList.remove("position-mismatch", "character-mismatch"));

    const actual = cards.map((el) => el.querySelector("strong")?.textContent.trim() || "");
    const queryStrikers = query.slice(0, 4);
    const wantedStrikers = new Set(queryStrikers.filter(Boolean));

    // STRIKER:
    // - same character, same slot: normal
    // - same character exists in the query but is in another slot: yellow
    // - this queried slot is occupied by a different character not in the query: red
    for (let i = 0; i < 4; i++) {
      const actualName = actual[i];
      const expectedName = queryStrikers[i];
      if (!actualName) continue;
      if (expectedName && actualName === expectedName) continue;

      if (wantedStrikers.has(actualName)) {
        cards[i]?.classList.add("position-mismatch");
      } else if (expectedName) {
        cards[i]?.classList.add("character-mismatch");
      }
    }

    // SP1 / SP2 are interchangeable. Only replacement characters are red.
    const querySp = query.slice(4, 6).filter(Boolean);
    if (!querySp.length) return;

    const wantedSp = new Set(querySp);
    const actualSp = actual.slice(4, 6);
    const missingCount = querySp.filter((name) => !actualSp.includes(name)).length;
    if (!missingCount) return;

    const replacementIndexes = [4, 5].filter((i) => actual[i] && !wantedSp.has(actual[i]));
    replacementIndexes.slice(0, missingCount).forEach((i) => {
      cards[i]?.classList.add("character-mismatch");
    });
  }

  function applyCard(card) {
    applySimilarity(card);
    const query = selectedQueryNames();
    if (!query.some(Boolean)) return;
    const mode = sideMode(card);
    const teams = card.querySelectorAll(".battle-team");
    if (mode.attack) markTeam(teams[0], query);
    if (mode.defense) markTeam(teams[1], query);
  }

  function applyAll() {
    results.querySelectorAll(".matchup-card").forEach(applyCard);
  }

  const observer = new MutationObserver(() => queueMicrotask(applyAll));
  observer.observe(results, { childList: true, subtree: true, characterData: true });
  document.addEventListener("change", (e) => {
    if (e.target.closest?.("#defense-inputs")) queueMicrotask(applyAll);
  });
  window.addEventListener("arena-language-change", () => queueMicrotask(applyAll));
  applyAll();
})();
