(() => {
  "use strict";

  const data = window.ARENA_DATA;
  const root = document.querySelector("#blind-results");
  if (!data?.matches || !root) return;

  const STORAGE_KEY = "arena-search-missing-v3";
  const MIN_DEFENSES = 5;
  const LIMIT = 10;
  const RAW_STUDENTS = "https://raw.githubusercontent.com/ba-archive/blue-archive/main/apps/blue-archive-story-viewer/public/config/yaml/students.yaml";
  const twNames = new Map();

  function unavailable() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); }
    catch (_) { return new Set(); }
  }

  // A1-A4 keep their numbered positions. SP1/SP2 are treated as interchangeable.
  function normalizeTeam(team) {
    const sp = team.slice(4, 6).slice().sort((a, b) => a.localeCompare(b, "ja"));
    return [...team.slice(0, 4), ...sp];
  }

  function teamKey(team) {
    return normalizeTeam(team).join("|");
  }

  function avatar(name) {
    const wrap = document.createElement("div");
    wrap.className = "char-avatar battle-avatar";
    const url = window.ARENA_AVATARS?.[name];
    if (url) {
      const img = new Image();
      img.src = url;
      img.alt = name;
      img.loading = "lazy";
      img.onerror = () => { img.remove(); wrap.textContent = name.slice(0, 1); };
      wrap.append(img);
    } else {
      wrap.textContent = name.slice(0, 1);
    }
    return wrap;
  }

  function displayName(name) {
    return twNames.get(name) || name;
  }

  function renderTeam(team) {
    const box = document.createElement("div");
    box.className = "battle-team attack";
    team.forEach((name, i) => {
      const char = document.createElement("div");
      char.className = "battle-char";
      char.append(avatar(name));
      const pos = document.createElement("span");
      pos.className = "battle-pos";
      pos.textContent = i < 4 ? `A${i + 1}` : `SP${i - 3}`;
      const label = document.createElement("strong");
      label.textContent = displayName(name);
      char.append(pos, label);
      box.append(char);
    });
    return box;
  }

  function render() {
    const blocked = unavailable();
    const groups = new Map();

    // First group by attacking lineup, then by DISTINCT defending lineup.
    // Repeated games against the same defense do not increase that defense's weight.
    for (const match of data.matches) {
      if (match.a.some((name) => blocked.has(name))) continue;

      const attackTeam = normalizeTeam(match.a);
      const attackKey = teamKey(attackTeam);
      if (!groups.has(attackKey)) {
        groups.set(attackKey, { team: attackTeam, defenses: new Map(), rawGames: 0 });
      }

      const group = groups.get(attackKey);
      const defenseTeam = normalizeTeam(match.d);
      const defenseKey = teamKey(defenseTeam);
      if (!group.defenses.has(defenseKey)) {
        group.defenses.set(defenseKey, { wins: 0, losses: 0, games: 0 });
      }

      const matchup = group.defenses.get(defenseKey);
      matchup.games++;
      group.rawGames++;
      match.w ? matchup.wins++ : matchup.losses++;
    }

    const ranked = [...groups.values()]
      .map((g) => {
        const matchups = [...g.defenses.values()];
        const defenseCount = matchups.length;
        // Each distinct defense gets equal weight. If it was played repeatedly,
        // those repeats only estimate that one matchup's win rate.
        const blindRate = defenseCount
          ? matchups.reduce((sum, m) => sum + m.wins / m.games, 0) / defenseCount
          : 0;
        return { ...g, defenseCount, blindRate };
      })
      .filter((g) => g.defenseCount >= MIN_DEFENSES)
      .sort((a, b) => b.blindRate - a.blindRate || b.defenseCount - a.defenseCount || b.rawGames - a.rawGames)
      .slice(0, LIMIT);

    root.innerHTML = "";
    if (!ranked.length) {
      root.innerHTML = '<div class="empty-state"><strong>目前沒有打過至少 5 種不同防守陣容的隊伍</strong></div>';
      return;
    }

    ranked.forEach((g, idx) => {
      const card = document.createElement("article");
      card.className = "result-card matchup-card";
      const head = document.createElement("div");
      head.className = "matchup-head";
      const pct = Math.round(g.blindRate * 1000) / 10;
      head.innerHTML = `<span class="rank-badge">#${idx + 1}</span><div class="matchup-stats"><b>盲打勝率 ${pct}%</b><span>${g.defenseCount} 種不同防守</span><span>原始 ${g.rawGames} 場</span></div>`;
      card.append(head, renderTeam(g.team));
      root.append(card);
    });
  }

  function parseNames(text) {
    let cur = null;
    let inName = false;
    const commit = () => {
      if (cur?.jp && cur?.tw) twNames.set(cur.jp, cur.tw);
    };
    for (const raw of text.split(/\r?\n/)) {
      const id = raw.match(/^- id:\s*(\d+)/);
      if (id) {
        commit();
        cur = { jp: "", tw: "" };
        inName = false;
        continue;
      }
      if (!cur) continue;
      if (/^  name:\s*$/.test(raw)) { inName = true; continue; }
      if (/^  [a-zA-Z].*:\s*$/.test(raw) && !/^  name:/.test(raw)) inName = false;
      if (!inName) continue;
      const m = raw.match(/^    (jp|tw):\s*(.*)$/);
      if (m) cur[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
    }
    commit();
  }

  render();

  const missingTags = document.querySelector("#missing-tags");
  if (missingTags) new MutationObserver(render).observe(missingTags, { childList: true, subtree: true });

  fetch(RAW_STUDENTS, { cache: "force-cache" })
    .then((r) => r.ok ? r.text() : "")
    .then((text) => { if (text) { parseNames(text); render(); } })
    .catch(() => {});
})();
