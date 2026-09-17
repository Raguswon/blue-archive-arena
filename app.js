(() => {
  "use strict";

  const data = window.ARENA_DATA;
  if (!data?.matches) throw new Error("ARENA_DATA is missing");

  const STORAGE_KEY = "arena-search-missing-v3";
  const RAW_STUDENTS = "https://raw.githubusercontent.com/ba-archive/blue-archive/main/apps/blue-archive-story-viewer/public/config/yaml/students.yaml";
  const ICON_BASE = "https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/icon/";

  const state = {
    unavailable: new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")),
    meta: new Map(),
    aliases: new Map(),
    lastResults: [],
    sort: "recommended",
    sidePriority: "attack",
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const els = {
    missingHost: $("#missing-picker"),
    missingTags: $("#missing-tags"),
    clearMissing: $("#clear-missing"),
    clearDefense: $("#clear-defense"),
    formMessage: $("#form-message"),
    results: $("#results"),
    sortSelect: $("#sort-select"),
    attackPriority: $("#attack-priority"),
    defensePriority: $("#defense-priority"),
    statTotal: $("#stat-total"),
    statEligible: $("#stat-eligible"),
    statMatched: $("#stat-matched"),
    statTeams: $("#stat-teams"),
    datasetPill: $("#dataset-pill"),
    footerVersion: $("#footer-version"),
    exactOnly: $("#exact-only"),
  };

  const norm = (s) => String(s || "").normalize("NFKC").toLowerCase().replace(/[\s・･]/g, "").replace(/[()（）]/g, "");

  const freqST = new Map();
  const freqSP = new Map();
  const freqAll = new Map();
  const positionFreq = Array.from({ length: 6 }, () => new Map());

  data.matches.forEach((m) => {
    [...m.a, ...m.d].forEach((n) => n && freqAll.set(n, (freqAll.get(n) || 0) + 1));
    [...m.a.slice(0, 4), ...m.d.slice(0, 4)].forEach((n) => n && freqST.set(n, (freqST.get(n) || 0) + 1));
    [...m.a.slice(4, 6), ...m.d.slice(4, 6)].forEach((n) => n && freqSP.set(n, (freqSP.get(n) || 0) + 1));
    for (let i = 0; i < 6; i++) {
      [m.a[i], m.d[i]].forEach((n) => n && positionFreq[i].set(n, (positionFreq[i].get(n) || 0) + 1));
    }
  });

  const byFreq = (a, b, map = freqAll) => (map.get(b) || 0) - (map.get(a) || 0) || a.localeCompare(b, "ja");
  const stChars = [...freqST.keys()].sort((a, b) => byFreq(a, b, freqST));
  const spChars = [...freqSP.keys()].sort((a, b) => byFreq(a, b, freqSP));
  const allChars = [...new Set([...stChars, ...spChars])].sort((a, b) => byFreq(a, b, freqAll));
  const lineupPools = [0, 1, 2, 3].map((i) => [...positionFreq[i].keys()].sort((a, b) => byFreq(a, b, positionFreq[i])));
  lineupPools.push(spChars, spChars);

  const TW_BASE = {
    "アオバ":"青葉","アカネ":"茜","アコ":"亞子","アズサ":"梓","アツコ":"敦子","アヤネ":"綾音","アリス":"愛麗絲","アル":"亞瑠",
    "イオリ":"伊織","イチカ":"一花","イブキ":"伊吹","イロハ":"伊呂波","ウタハ":"詠葉","エイミ":"英美","オトギ":"音葵",
    "カスミ":"霞","カノエ":"鹿江","カヨコ":"佳代子","カリン":"花凜","カンナ":"康娜","キサキ":"妃咲","キリノ":"桐乃","クルミ":"胡桃","ケイ":"Kei",
    "ココナ":"心奈","ココロ":"心","コタマ":"小玉","コトネ":"琴音","コトリ":"小鳥","コノカ":"木乃香","コハル":"小春",
    "サオリ":"紗織","サキ":"咲希","サクラコ":"櫻子","サツキ":"皋月","サヤ":"沙耶","シュエリン":"旬(幼女)","シュン":"旬","シロコ":"白子",
    "ジュリ":"茱莉","ジュンコ":"淳子","スズミ":"鈴美","スミレ":"堇","セリカ":"芹香","セリナ":"芹奈","チェリノ":"潔莉諾","チナツ":"千夏",
    "ツクヨ":"月夜","ツバキ":"椿","ツルギ":"弦生","トキ":"時","トモエ":"巴","ナギサ":"渚","ナグサ":"名草","ナツ":"夏","ネル":"寧瑠",
    "ノゾミ":"望","ノドカ":"和香","ノノミ":"野乃美","ハスミ":"蓮實","ハナコ":"花子","ハルカ":"遙香","ハルナ":"羽留奈","ヒカリ":"光",
    "ヒナ":"陽奈","ヒナタ":"日向","ヒビキ":"響","ヒフミ":"日步美","ヒマリ":"日鞠","ヒヨリ":"日和","フウカ":"風香","フブキ":"吹雪",
    "ペロロ":"佩洛洛","ホシノ":"星野","マキ":"真紀","マコト":"真琴","マシロ":"真白","マリナ":"瑪麗娜","マリー":"瑪麗","ミカ":"彌香",
    "ミサキ":"美咲","ミチル":"滿","ミドリ":"綠","ミナ":"美奈","ミネ":"美禰","ミヤコ":"都子","ミユ":"美遊","ミヨ":"美代",
    "ムツキ":"無月","メグ":"惠","モエ":"萌繪","モミジ":"紅葉","モモイ":"桃井","ヤクモ":"八雲","ユウカ":"優香","ユズ":"柚子",
    "リオ":"莉音","レイサ":"玲紗","ワカモ":"若藻","御坂美琴":"御坂美琴"
  };
  const TW_SUFFIX = {
    "水着":"泳裝","ドレス":"禮服","メイド":"女僕","臨戦":"臨戰","バニーガール":"兔女郎","制服":"制服","キャンプ":"露營",
    "応援団":"應援團","アイドル":"偶像","幼女":"幼女","マジカル":"魔法少女","アルバイト":"打工","チーパオ":"旗袍","温泉":"溫泉","溫泉":"溫泉",
    "体操服":"體操服","正月":"正月","攻撃":"攻擊","防御":"防禦","私服":"私服"
  };

  function bundledTw(name) {
    if (!name) return name;
    if (name === "シロコ＊テラー") return "白子＊Terror";
    const m = String(name).match(/^(.+?)（(.+)）$/);
    if (!m) return TW_BASE[name] || name;
    return `${TW_BASE[m[1]] || m[1]}(${TW_SUFFIX[m[2]] || m[2]})`;
  }

  allChars.forEach((jp) => {
    const tw = bundledTw(jp);
    if (tw && tw !== jp) state.aliases.set(norm(tw), jp);
  });

  function parseStudentYaml(text) {
    let cur = null;
    let section = "";
    const commit = (x) => {
      if (!x?.jp) return;
      state.meta.set(x.jp, x);
      [x.jp, x.tw, x.cn, x.en].filter(Boolean).forEach((alias) => state.aliases.set(norm(alias), x.jp));
    };
    for (const raw of text.split(/\r?\n/)) {
      const idm = raw.match(/^- id:\s*(\d+)/);
      if (idm) {
        if (cur) commit(cur);
        cur = { id: +idm[1], jp: "", tw: "", cn: "", en: "" };
        section = "";
        continue;
      }
      if (!cur) continue;
      if (/^  name:\s*$/.test(raw)) {
        section = "name";
        continue;
      }
      if (/^  [a-zA-Z].*:\s*$/.test(raw) && !/^  name:/.test(raw)) section = "";
      if (section === "name") {
        const m = raw.match(/^    (jp|tw|cn|en):\s*(.*)$/);
        if (m) cur[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
      }
    }
    if (cur) commit(cur);
  }

  function loadMeta() {
    buildPickers();
    renderMissing();
    fetch(RAW_STUDENTS, { cache: "force-cache" })
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => { if (text) parseStudentYaml(text); })
      .catch(() => {});
  }

  function iconUrl(name) {
    const local = window.ARENA_AVATARS?.[name];
    if (local) return local;
    const meta = state.meta.get(name);
    return meta?.id ? `${ICON_BASE}${meta.id}.webp` : "";
  }

  function twName(name) {
    return state.meta.get(name)?.tw || bundledTw(name) || name;
  }

  function aliasesFor(name) {
    const m = state.meta.get(name);
    return [name, bundledTw(name), m?.tw, m?.cn, m?.en].filter(Boolean).map(norm);
  }

  function matchesQuery(name, q) {
    const nq = norm(q);
    return !nq || aliasesFor(name).some((a) => a.includes(nq));
  }

  function avatar(name, cls = "") {
    const wrap = document.createElement("div");
    wrap.className = `char-avatar ${cls}`;
    const url = iconUrl(name);
    if (url) {
      const img = new Image();
      img.src = url;
      img.alt = name;
      img.loading = "lazy";
      img.onerror = () => { img.remove(); wrap.textContent = name.slice(0, 1); };
      wrap.appendChild(img);
    } else {
      wrap.textContent = name.slice(0, 1);
    }
    return wrap;
  }

  function makePicker(host, pool, opts = {}) {
    host.innerHTML = "";
    const root = document.createElement("div");
    root.className = "picker";
    const selected = document.createElement("button");
    selected.type = "button";
    selected.className = "picker-selected";
    const menu = document.createElement("div");
    menu.className = "picker-menu";
    const searchBox = document.createElement("input");
    searchBox.className = "picker-search";
    searchBox.placeholder = "搜尋日文 / 中文";
    const list = document.createElement("div");
    list.className = "picker-list";
    menu.append(searchBox, list);
    root.append(selected, menu);
    host.append(root);

    const placeholder = opts.placeholder || "選擇角色";
    let value = "";

    function paintSelected() {
      selected.innerHTML = "";
      if (!value) {
        selected.innerHTML = `<span class="picker-placeholder">${placeholder}</span><span class="picker-chevron">⌄</span>`;
        return;
      }
      selected.append(avatar(value, "mini"));
      const text = document.createElement("span");
      text.className = "picker-selected-name";
      text.textContent = twName(value);
      const clear = document.createElement("span");
      clear.className = "picker-chevron";
      clear.textContent = "×";
      selected.append(text, clear);
    }

    function paintList() {
      list.innerHTML = "";
      const excluded = opts.excludedNames ? opts.excludedNames() : new Set();
      const filtered = pool.filter((n) => !excluded.has(n) && matchesQuery(n, searchBox.value)).slice(0, 80);
      filtered.forEach((name) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "picker-option";
        button.append(avatar(name, "option-avatar"));
        const tx = document.createElement("span");
        tx.className = "picker-option-text";
        const main = document.createElement("strong");
        main.textContent = twName(name);
        const sub = document.createElement("small");
        const count = (opts.frequencyMap || freqAll).get(name) || 0;
        sub.textContent = name === twName(name) ? `${count} 次` : `${name} · ${count} 次`;
        tx.append(main, sub);
        button.append(tx);
        button.onclick = () => {
          value = name;
          paintSelected();
          root.classList.remove("open");
          opts.onChange?.(name);
        };
        list.append(button);
      });
      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "picker-empty";
        empty.textContent = "找不到角色";
        list.append(empty);
      }
    }

    selected.onclick = () => {
      if (value && !root.classList.contains("open") && opts.clearOnSelectedClick) {
        value = "";
        paintSelected();
        opts.onChange?.("");
        return;
      }
      root.classList.toggle("open");
      if (root.classList.contains("open")) {
        searchBox.value = "";
        paintList();
        setTimeout(() => searchBox.focus(), 0);
      }
    };
    searchBox.oninput = paintList;
    document.addEventListener("click", (e) => { if (!root.contains(e.target)) root.classList.remove("open"); });
    root.getValue = () => value;
    root.clear = () => { value = ""; paintSelected(); };
    paintSelected();
    return root;
  }

  let missingPicker;
  let defensePickers = [];

  function buildPickers() {
    missingPicker = makePicker(els.missingHost, allChars, {
      placeholder: "搜尋要排除的角色",
      excludedNames: () => new Set(state.unavailable),
      onChange: (name) => {
        if (!name) return;
        state.unavailable.add(name);
        saveMissing();
        renderMissing();
        missingPicker.clear();
        updateEligibleCount();
        if (getLineup().some(Boolean)) search();
      },
    });

    defensePickers = [];
    $$(".defense-picker-host").forEach((host, i) => {
      defensePickers.push(makePicker(host, lineupPools[i], {
        placeholder: i < 4 ? `位置 ${i + 1}` : `SP${i - 3}`,
        clearOnSelectedClick: true,
        frequencyMap: i < 4 ? positionFreq[i] : freqSP,
        excludedNames: () => new Set(defensePickers.map((p) => p?.getValue()).filter(Boolean)),
        onChange: () => search(),
      }));
    });
  }

  function saveMissing() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.unavailable]));
  }

  function renderMissing() {
    els.missingTags.innerHTML = "";
    const names = [...state.unavailable].filter((n) => freqAll.has(n)).sort((a, b) => byFreq(a, b));
    if (!names.length) {
      els.missingTags.innerHTML = '<span class="avatar-tag-empty">目前沒有排除角色</span>';
      return;
    }
    names.forEach((name) => {
      const tag = document.createElement("div");
      tag.className = "avatar-tag";
      tag.append(avatar(name, "tag-avatar"));
      const label = document.createElement("div");
      label.className = "avatar-name";
      label.textContent = twName(name);
      const remove = document.createElement("button");
      remove.className = "avatar-remove";
      remove.type = "button";
      remove.textContent = "×";
      remove.onclick = () => {
        state.unavailable.delete(name);
        saveMissing();
        renderMissing();
        updateEligibleCount();
        if (getLineup().some(Boolean)) search();
      };
      tag.append(label, remove);
      els.missingTags.append(tag);
    });
  }

  const studentMeta = new Map(
    Object.entries(window.ARENA_STUDENT_META || {}).map(([name, v]) => [name, {
      cover: v[0], range: v[1], type: v[2], position: v[3], role: v[4], attack: v[5], defense: v[6],
    }]),
  );

  function attackEffect(attack, defense) {
    if (!attack || !defense || attack === "-" || defense === "-") return 0.5;
    const strong = { 爆発: "軽装備", 貫通: "重装甲", 神秘: "特殊装甲", 振動: "弾力装甲" };
    const weak = { 爆発: "特殊装甲", 貫通: "特殊装甲", 神秘: "重装甲" };
    if (strong[attack] === defense) return 1;
    if (weak[attack] === defense) return 0.2;
    return 0.55;
  }

  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0.5;

  function opponentTankDefenses(team) {
    const tanks = (team || []).map((n) => studentMeta.get(n)).filter((m) => m?.type === "STRIKER" && m.role === "T" && m.defense);
    if (tanks.length) return tanks.map((m) => m.defense);
    return (team || []).map((n) => studentMeta.get(n)).filter((m) => m?.type === "STRIKER" && m.defense).map((m) => m.defense);
  }

  function opponentAttackTypes(team) {
    let attackers = (team || []).map((n) => studentMeta.get(n)).filter((m) => m?.role === "A" && m.attack);
    if (!attackers.length) attackers = (team || []).map((n) => studentMeta.get(n)).filter((m) => m?.attack && m.attack !== "-");
    return attackers.map((m) => m.attack);
  }

  function offensiveFit(attack, opponentTeam) {
    const defenses = opponentTankDefenses(opponentTeam);
    return defenses.length ? avg(defenses.map((d) => attackEffect(attack, d))) : 0.5;
  }

  function defensiveFit(defense, opponentTeam) {
    const attacks = opponentAttackTypes(opponentTeam);
    return attacks.length ? 1 - avg(attacks.map((a) => attackEffect(a, defense))) * 0.75 : 0.5;
  }

  function rangeFit(a, b) {
    if (!a || !b) return 0.5;
    const d = Math.abs(a - b);
    return d === 0 ? 1 : d <= 100 ? 0.8 : d <= 200 ? 0.45 : d <= 300 ? 0.2 : 0;
  }

  function roleCompatibility(a, b) {
    if (!a?.role || !b?.role) return { ok: false, mismatch: false };
    if (a.role === b.role) return { ok: true, mismatch: false };
    const outputPair = a.type === "SPECIAL" && b.type === "SPECIAL" && [a.role, b.role].every((r) => r === "A" || r === "T.S");
    return { ok: outputPair, mismatch: outputPair };
  }

  function substituteScore(wanted, candidate, opponentTeam, wantedIndex, candidateIndex) {
    if (wanted === candidate) return { score: 1, exact: true, roleMismatch: false };
    const a = studentMeta.get(wanted);
    const b = studentMeta.get(candidate);
    if (!a || !b || !a.type || a.type !== b.type) return null;

    const roleFit = roleCompatibility(a, b);
    if (!roleFit.ok) return null;

    if (a.type === "SPECIAL") {
      let score;
      if (roleFit.mismatch) score = 0.48 + 0.32 * offensiveFit(b.attack, opponentTeam) + (a.attack === b.attack ? 0.08 : 0);
      else if (a.role === "A") score = 0.55 + 0.35 * offensiveFit(b.attack, opponentTeam) + (a.attack === b.attack ? 0.10 : 0);
      else if (a.role === "T.S") score = 0.76 + (a.attack === b.attack ? 0.10 : 0);
      else score = 0.72 + (a.attack === b.attack ? 0.08 : 0);
      return { score: Math.min(1, score), exact: false, roleMismatch: roleFit.mismatch };
    }

    if (roleFit.mismatch) return null;

    let points = 0;
    let max = 0;
    const add = (weight, value) => {
      max += weight;
      points += weight * Math.max(0, Math.min(1, value));
    };
    const samePos = a.position === b.position ? 1 : 0;
    const sameCover = a.cover === b.cover ? 1 : 0;
    const sameAttack = a.attack === b.attack ? 1 : 0;
    const sameDefense = a.defense === b.defense ? 1 : 0;
    const slotFit = wantedIndex === candidateIndex ? 1 : 0;

    if (a.role === "A") {
      add(5, offensiveFit(b.attack, opponentTeam));
      add(4, rangeFit(a.range, b.range));
      add(2, sameCover);
      add(2, defensiveFit(b.defense, opponentTeam));
      add(1, samePos);
      add(1, sameAttack);
      add(1, slotFit);
    } else if (a.role === "T") {
      add(5, defensiveFit(b.defense, opponentTeam));
      add(4, rangeFit(a.range, b.range));
      add(2, sameCover);
      add(1.5, sameDefense);
      add(1, samePos);
      add(1, slotFit);
    } else if (a.role === "SUP" || a.role === "回復") {
      add(4, rangeFit(a.range, b.range));
      add(3, sameCover);
      add(2, defensiveFit(b.defense, opponentTeam));
      add(1, samePos);
      add(0.5, sameAttack);
      add(1, slotFit);
    } else {
      add(4, rangeFit(a.range, b.range));
      add(2, sameCover);
      add(1.5, defensiveFit(b.defense, opponentTeam));
      add(1, samePos);
      add(1, sameAttack);
      add(1, slotFit);
    }

    const score = max ? points / max : 0;
    return score >= 0.42 ? { score, exact: false, roleMismatch: false } : null;
  }

  function compareLineup(actual, query) {
    const known = query.map((n, i) => ({ n, i })).filter((x) => x.n);
    if (!known.length) return null;
    let exact = 0;
    known.forEach(({ n, i }) => {
      if (i < 4 && actual[i] === n) exact++;
      else if (i >= 4 && actual.slice(4, 6).includes(n)) exact++;
    });
    const actualSet = new Set(actual.filter(Boolean));
    const sameChars = known.filter(({ n }) => actualSet.has(n)).length;
    if (sameChars < known.length) return null;
    if (els.exactOnly.checked && exact < known.length) return null;
    return { exact, known: known.length, sameChars, similarity: exact / known.length, substitute: false, roleMismatches: 0 };
  }

  function compareLineupSubstitute(actual, query, opponentTeam) {
    const known = query.map((n, i) => ({ n, i })).filter((x) => x.n);
    if (!known.length) return null;

    const options = known.map(({ n, i }) => {
      const candidates = i >= 4 ? [4, 5] : [0, 1, 2, 3];
      return candidates.flatMap((j) => {
        if (!actual[j]) return [];
        const score = substituteScore(n, actual[j], opponentTeam, i, j);
        return score ? [{ ...score, j, from: n, to: actual[j] }] : [];
      });
    });
    if (options.some((x) => !x.length)) return null;

    let best = null;
    const chosen = [];
    const used = new Set();

    function dfs(k, total, exact, roleMismatches) {
      if (roleMismatches > 1) return;
      if (k === known.length) {
        const replacements = chosen.filter((x) => !x.exact).map((x) => ({
          from: x.from, to: x.to, score: x.score, roleMismatch: !!x.roleMismatch,
        }));
        if (!replacements.length) return;
        const candidate = {
          exact,
          known: known.length,
          sameChars: exact,
          similarity: total / known.length,
          substitute: true,
          replacements,
          roleMismatches,
        };
        if (!best || candidate.similarity > best.similarity ||
            (candidate.similarity === best.similarity && candidate.roleMismatches < best.roleMismatches)) best = candidate;
        return;
      }

      const ordered = [...options[k]].sort((a, b) => {
        if (a.roleMismatch !== b.roleMismatch) return Number(a.roleMismatch) - Number(b.roleMismatch);
        return b.score - a.score;
      });
      for (const opt of ordered) {
        if (used.has(opt.j)) continue;
        used.add(opt.j);
        chosen.push(opt);
        dfs(k + 1, total + opt.score, exact + (opt.exact ? 1 : 0), roleMismatches + (opt.roleMismatch ? 1 : 0));
        chosen.pop();
        used.delete(opt.j);
      }
    }

    dfs(0, 0, 0, 0);
    return best;
  }

  function getLineup() {
    return defensePickers.map((p) => p.getValue());
  }

  function eligible(match) {
    return !match.a.some((name) => state.unavailable.has(name));
  }

  function updateEligibleCount() {
    els.statEligible.textContent = data.matches.filter(eligible).length.toLocaleString();
  }

  function teamKey(a, d) {
    return `${a.join("|")}>>${d.join("|")}`;
  }

  function wilson(w, n, z = 1.96) {
    if (!n) return 0;
    const p = w / n;
    const z2 = z * z;
    const den = 1 + z2 / n;
    const center = p + z2 / (2 * n);
    const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
    return (center - margin) / den;
  }

  function search() {
    const query = getLineup();
    if (!query.some(Boolean)) {
      els.formMessage.textContent = "至少選 1 個角色。";
      return;
    }
    els.formMessage.textContent = "";

    let rows = [];
    let eligibleCount = 0;
    let matchedCount = 0;

    for (const m of data.matches) {
      if (!eligible(m)) continue;
      eligibleCount++;
      const attackMatch = compareLineup(m.a, query);
      const defenseMatch = compareLineup(m.d, query);
      if (!attackMatch && !defenseMatch) continue;
      matchedCount++;
      const querySide = attackMatch && defenseMatch
        ? (attackMatch.similarity >= defenseMatch.similarity ? "attack" : "defense")
        : (attackMatch ? "attack" : "defense");
      rows.push({ ...m, match: querySide === "attack" ? attackMatch : defenseMatch, querySide });
    }

    if (!rows.length && !els.exactOnly.checked) {
      for (const m of data.matches) {
        if (!eligible(m)) continue;
        const attackMatch = compareLineupSubstitute(m.a, query, m.d);
        const defenseMatch = compareLineupSubstitute(m.d, query, m.a);
        if (!attackMatch && !defenseMatch) continue;
        matchedCount++;
        const querySide = attackMatch && defenseMatch
          ? (attackMatch.similarity >= defenseMatch.similarity ? "attack" : "defense")
          : (attackMatch ? "attack" : "defense");
        rows.push({ ...m, match: querySide === "attack" ? attackMatch : defenseMatch, querySide });
      }

      if (rows.length) {
        const examples = [];
        const seen = new Set();
        rows.forEach((r) => (r.match.replacements || []).forEach((x) => {
          const key = `${x.from}>${x.to}`;
          if (!seen.has(key)) {
            seen.add(key);
            examples.push(x);
          }
        }));
        const label = examples.slice(0, 3).map((x) => `${twName(x.from)} → ${twName(x.to)}`).join("、");
        const hasRoleFlex = rows.some((r) => r.match.roleMismatches > 0);
        els.formMessage.textContent = "沒有完全符合的歷史紀錄，已依射程／掩體／敵方攻防剋制尋找替代陣容" +
          (hasRoleFlex ? "；最多允許 1 隻 SPECIAL 輸出位在 Attacker / T.S 間功能替代" : "") +
          (label ? `（例如 ${label}）` : "") + "。";
      }
    }

    const groups = new Map();
    rows.forEach((r) => {
      const key = teamKey(r.a, r.d);
      if (!groups.has(key)) groups.set(key, { a: r.a, d: r.d, wins: 0, losses: 0, samples: 0, best: r.match, querySides: new Set() });
      const g = groups.get(key);
      g.samples++;
      r.w ? g.wins++ : g.losses++;
      g.querySides.add(r.querySide);
      if (r.match.similarity > g.best.similarity) g.best = r.match;
    });

    state.lastResults = [...groups.values()].map((g) => ({
      ...g,
      winRate: g.wins / g.samples,
      wilson: wilson(g.wins, g.samples),
      score: g.best.similarity * 100 + wilson(g.wins, g.samples) * 30 + Math.log1p(g.samples) * 3,
    }));

    els.statEligible.textContent = eligibleCount.toLocaleString();
    els.statMatched.textContent = matchedCount.toLocaleString();
    els.statTeams.textContent = state.lastResults.length.toLocaleString();
    renderResults();
  }

  function renderTeam(team, side) {
    const box = document.createElement("div");
    box.className = `battle-team ${side}`;
    team.forEach((name, i) => {
      const char = document.createElement("div");
      char.className = "battle-char";
      char.append(avatar(name, "battle-avatar"));
      const pos = document.createElement("span");
      pos.className = "battle-pos";
      pos.textContent = i < 4 ? `${side === "attack" ? "A" : "D"}${i + 1}` : `SP${i - 3}`;
      const label = document.createElement("strong");
      label.textContent = twName(name);
      char.append(pos, label);
      box.append(char);
    });
    return box;
  }

  function renderResults() {
    const items = [...state.lastResults];
    const sideRank = (g) => {
      const a = g.querySides.has("attack");
      const d = g.querySides.has("defense");
      if (a && d) return 0;
      return state.sidePriority === "attack" ? (a ? 0 : 1) : (d ? 0 : 1);
    };
    const metricCmp = (a, b) => {
      if (state.sort === "winrate") return b.winRate - a.winRate || b.samples - a.samples;
      if (state.sort === "samples") return b.samples - a.samples || b.winRate - a.winRate;
      if (state.sort === "similarity") return b.best.similarity - a.best.similarity || b.score - a.score;
      return b.score - a.score;
    };
    items.sort((a, b) => sideRank(a) - sideRank(b) || metricCmp(a, b));

    els.results.innerHTML = "";
    if (!items.length) {
      els.results.innerHTML = '<div class="empty-state"><strong>沒有找到符合條件的對戰紀錄</strong><span>可以少指定幾個位置再搜尋。</span></div>';
      return;
    }

    items.slice(0, 100).forEach((g, idx) => {
      const card = document.createElement("article");
      card.className = "result-card matchup-card" + (g.winRate < 0.5 ? " result-card-fail" : "");
      const head = document.createElement("div");
      head.className = "matchup-head";
      const sideText = g.querySides.has("attack") && g.querySides.has("defense") ? "符合：我方 / 敵方" : g.querySides.has("attack") ? "符合：我方" : "符合：敵方";
      const prefix = g.best.substitute ? (g.best.roleMismatches ? "替代搜尋（1 位功能近似） · " : "替代搜尋 · ") : "";
      head.innerHTML = `<span class="rank-badge">#${idx + 1}</span><div class="matchup-stats"><b>進攻方勝率 ${Math.round(g.winRate * 1000) / 10}%</b><span>${g.wins}勝 ${g.losses}敗</span><span>${g.samples} 場</span><span>符合度 ${Math.round(g.best.similarity * 100)}%</span><span>${prefix}${sideText}</span></div>`;
      const body = document.createElement("div");
      body.className = "matchup-body";
      const left = document.createElement("div");
      left.className = "team-side";
      left.innerHTML = '<div class="team-side-title">我方進攻</div>';
      left.append(renderTeam(g.a, "attack"));
      const vs = document.createElement("div");
      vs.className = "versus";
      vs.textContent = "VS";
      const right = document.createElement("div");
      right.className = "team-side";
      right.innerHTML = '<div class="team-side-title">敵方防守</div>';
      right.append(renderTeam(g.d, "defense"));
      body.append(left, vs, right);
      card.append(head, body);
      els.results.append(card);
    });
  }

  els.clearMissing.onclick = () => {
    state.unavailable.clear();
    saveMissing();
    renderMissing();
    updateEligibleCount();
    if (getLineup().some(Boolean)) search();
  };

  els.clearDefense.onclick = () => {
    defensePickers.forEach((p) => p.clear());
    state.lastResults = [];
    els.results.innerHTML = '<div class="empty-state"><strong>先輸入查詢陣容</strong><span>選擇任一角色後會自動顯示結果。</span></div>';
    els.statMatched.textContent = "—";
    els.statTeams.textContent = "—";
    els.formMessage.textContent = "選擇角色後會自動更新結果";
  };

  els.sortSelect.onchange = (e) => {
    state.sort = e.target.value;
    renderResults();
  };

  function setSidePriority(side) {
    state.sidePriority = side;
    els.attackPriority?.classList.toggle("active", side === "attack");
    els.defensePriority?.classList.toggle("active", side === "defense");
    renderResults();
  }

  els.attackPriority?.addEventListener("click", () => setSidePriority("attack"));
  els.defensePriority?.addEventListener("click", () => setSidePriority("defense"));
  els.exactOnly.onchange = () => { if (getLineup().some(Boolean)) search(); };

  els.datasetPill.textContent = `${data.total.toLocaleString()} 場 · ${data.characters.length} 角色`;
  els.footerVersion.textContent = `資料快照 ${data.version}`;
  els.statTotal.textContent = data.total.toLocaleString();
  updateEligibleCount();
  loadMeta();
})();
