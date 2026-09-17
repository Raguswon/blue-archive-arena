(() => {
  "use strict";

  const data = window.ARENA_DATA;
  const root = document.querySelector("#blind-results");
  if (!data?.matches || !root) return;

  const STORAGE_KEY = "arena-search-missing-v3";
  const MIN_SAMPLES = 5;
  const LIMIT = 10;
  const RAW_STUDENTS = "https://raw.githubusercontent.com/ba-archive/blue-archive/main/apps/blue-archive-story-viewer/public/config/yaml/students.yaml";
  const twNames = new Map();

  function unavailable() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); }
    catch (_) { return new Set(); }
  }

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

    for (const match of data.matches) {
      if (match.a.some((name) => blocked.has(name))) continue;
      const team = normalizeTeam(match.a);
      const key = teamKey(team);
      if (!groups.has(key)) groups.set(key, { team, wins: 0, losses: 0, samples: 0 });
      const g = groups.get(key);
      g.samples++;
      match.w ? g.wins++ : g.losses++;
    }

    const ranked = [...groups.values()]
      .filter((g) => g.samples >= MIN_SAMPLES)
      .map((g) => ({ ...g, winRate: g.wins / g.samples }))
      .sort((a, b) => b.winRate - a.winRate || b.samples - a.samples)
      .slice(0, LIMIT);

    root.innerHTML = "";
    if (!ranked.length) {
      root.innerHTML = '<div class="empty-state"><strong>目前沒有足夠樣本的盲打隊伍</strong></div>';
      return;
    }

    ranked.forEach((g, idx) => {
      const card = document.createElement("article");
      card.className = "result-card matchup-card";
      const head = document.createElement("div");
      head.className = "matchup-head";
      const pct = Math.round(g.winRate * 1000) / 10;
      head.innerHTML = `<span class="rank-badge">#${idx + 1}</span><div class="matchup-stats"><b>盲打勝率 ${pct}%</b><span>${g.wins}勝 ${g.losses}敗</span><span>${g.samples} 場</span></div>`;
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
