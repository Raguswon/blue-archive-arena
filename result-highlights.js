(() => {
  "use strict";

  const results = document.querySelector("#results");
  if (!results) return;

  function selectedQueryNames() {
    return [...document.querySelectorAll("#defense-inputs .defense-picker-host")]
      .map((host) => host.querySelector(".picker-selected-name")?.textContent.trim() || "");
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
    const actualStrikers = actual.slice(0, 4);

    // STRIKER highlighting is character-based, not slot-based:
    // 1. A queried character present in its requested slot -> normal.
    // 2. A queried character present in another STRIKER slot -> mark THAT
    //    character yellow. This includes moving into an unspecified slot.
    // 3. A queried character absent from the result -> mark the character
    //    occupying its requested slot red, unless that occupant is itself a
    //    queried character (which is a position mismatch and stays yellow).
    // 4. Unspecified slots are otherwise neutral.
    for (let expectedIndex = 0; expectedIndex < 4; expectedIndex++) {
      const wanted = queryStrikers[expectedIndex];
      if (!wanted) continue;

      const actualIndex = actualStrikers.indexOf(wanted);
      if (actualIndex === expectedIndex) continue;

      if (actualIndex >= 0) {
        cards[actualIndex]?.classList.add("position-mismatch");
        continue;
      }

      const occupant = actualStrikers[expectedIndex];
      if (!occupant) continue;
      const occupantQueryIndex = queryStrikers.indexOf(occupant);
      if (occupantQueryIndex >= 0) {
        cards[expectedIndex]?.classList.add("position-mismatch");
      } else {
        cards[expectedIndex]?.classList.add("character-mismatch");
      }
    }

    // SP1 / SP2 are interchangeable. Only explicitly queried SP characters
    // matter; unspecified SP capacity is neutral.
    const querySp = query.slice(4, 6).filter(Boolean);
    if (!querySp.length) return;

    const wantedSp = new Set(querySp);
    const actualSp = actual.slice(4, 6);
    const missing = querySp.filter((name) => !actualSp.includes(name));
    if (!missing.length) return;

    const replacementIndexes = [4, 5].filter((i) => actual[i] && !wantedSp.has(actual[i]));
    replacementIndexes.slice(0, missing.length).forEach((i) => {
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
