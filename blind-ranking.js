(() => {
  "use strict";

  const data = window.ARENA_DATA;
  const root = document.querySelector("#blind-results");
  if (!data?.matches || !root) return;

  const STORAGE_KEY = "arena-search-missing-v3";
  const MIN_DEFENSES = 5;
  const LIMIT = 10;
  const RAW_STUDENTS = "https://raw.githubusercontent.com/ba-archive/blue-archive/main/apps/blue-archive-story-viewer/public/config/yaml/students.yaml";
  const ICON_BASE = "https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/icon/";
  const twNames = new Map();
  const studentIds = new Map();

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

  function displayName(name) {
    return twNames.get(name) || bundledTw(name) || name;
  }

  function remoteAvatarUrl(name) {
    const id = studentIds.get(name);
    return id ? `${ICON_BASE}${id}.webp` : "";
  }

  function avatar(name) {
    const wrap = document.createElement("div");
    wrap.className = "char-avatar battle-avatar";

    const localUrl = window.ARENA_AVATARS?.[name] || "";
    const remoteUrl = remoteAvatarUrl(name);
    if (!localUrl && !remoteUrl) {
      wrap.textContent = displayName(name).slice(0, 1) || name.slice(0, 1);
      return wrap;
    }

    const img = new Image();
    img.alt = displayName(name);
    img.loading = "lazy";
    let triedRemote = !localUrl;

    img.onerror = () => {
      const fallback = remoteAvatarUrl(name);
      if (!triedRemote && fallback) {
        triedRemote = true;
        img.src = fallback;
        return;
      }
      img.remove();
      wrap.textContent = displayName(name).slice(0, 1) || name.slice(0, 1);
    };

    img.src = localUrl || remoteUrl;
    wrap.append(img);
    return wrap;
  }

  function renderTeam(team) {
    const box = document.createElement("div");
    box.className = "battle-team blind-team attack";
    team.forEach((name, i) => {
      const char = document.createElement("div");
      char.className = "battle-char";
      char.append(avatar(name));
      const pos = document.createElement("span");
      pos.className = "battle-pos";
      pos.textContent = i < 4 ? `A${i + 1}` : `SP${i - 3}`;
      const label = document.createElement("strong");
      label.textContent = displayName(name);
      label.title = displayName(name);
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
      card.className = "result-card matchup-card blind-card";
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
      if (!cur?.jp) return;
      if (cur.tw) twNames.set(cur.jp, cur.tw);
      if (cur.id) studentIds.set(cur.jp, cur.id);
    };

    for (const raw of text.split(/\r?\n/)) {
      const id = raw.match(/^- id:\s*(\d+)/);
      if (id) {
        commit();
        cur = { id: Number(id[1]), jp: "", tw: "" };
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
    .then((text) => {
      if (!text) return;
      parseNames(text);
      render();
    })
    .catch(() => {});
})();
