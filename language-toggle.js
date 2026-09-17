(() => {
  "use strict";

  const STORAGE_KEY = "arena-ui-language-v1";
  const RAW_STUDENTS = "https://raw.githubusercontent.com/ba-archive/blue-archive/main/apps/blue-archive-story-viewer/public/config/yaml/students.yaml";
  const supported = new Set(["zh-Hant", "ja"]);
  let lang = localStorage.getItem(STORAGE_KEY) || "zh-Hant";
  if (!supported.has(lang)) lang = "zh-Hant";

  const textOriginals = new WeakMap();
  const nameOriginals = new WeakMap();
  const twToJp = new Map();
  const idToJp = new Map();
  const avatarToJp = new Map();

  Object.entries(window.ARENA_AVATARS || {}).forEach(([jp, path]) => {
    avatarToJp.set(String(path).replace(/^\.\//, ""), jp);
  });

  const exact = new Map([
    ["對抗戰陣容搜尋", "戦術対抗戦 編成検索"],
    ["讀取資料中", "データ読込中"],
    ["資料快照", "データスナップショット"],
    ["沒有的角色", "未所持の生徒"],
    ["搜尋或從下拉選單選角色，加入後會自動排除含該角色的進攻隊。", "検索またはプルダウンから生徒を選ぶと、その生徒を含む攻撃編成を自動で除外します。"],
    ["全部清除", "すべて解除"],
    ["查詢陣容", "編成検索"],
    ["可輸入我方或敵方陣容；不知道的位置可留空。系統會同時搜尋進攻方與防守方紀錄。", "味方・敵方どちらの編成でも入力できます。不明な枠は空欄のままで、攻撃側・防御側の両方を検索します。"],
    ["清空", "クリア"],
    ["只看已知位置完全相同", "指定した配置が完全一致するものだけ表示"],
    ["結果", "検索結果"],
    ["排序", "並び順"],
    ["綜合推薦", "総合おすすめ"],
    ["勝率", "勝率"],
    ["進攻優先", "攻撃優先"],
    ["防守優先", "防御優先"],
    ["歷史對戰", "全対戦"],
    ["排除缺角後", "未所持除外後"],
    ["符合紀錄", "該当記録"],
    ["對戰組合", "対戦組合"],
    ["先輸入查詢陣容", "検索する編成を入力してください"],
    ["盲打勝率", "初見攻撃勝率"],
    ["同一防守重複刷不增加權重；至少打過 5 種不同防守陣容，SP1 / SP2 合併統計。", "同じ防御編成への連戦は重みを増やしません。5種類以上の異なる防御編成と対戦した攻撃編成を集計し、SP1 / SP2 は同一枠として扱います。"],
    ["角色頭像資料來源：SchaleDB", "生徒アイコン：SchaleDB"],
    ["歷史統計僅供配隊參考，不代表單場必勝。", "過去データは編成の参考用であり、単戦の勝利を保証するものではありません。"],
    ["複製隊伍", "編成をコピー"],
    ["推薦進攻隊", "おすすめ攻撃編成"],
    ["搜尋日文 / 中文", "日本語 / 中国語で検索"],
    ["選擇角色", "生徒を選択"],
    ["找不到角色", "該当する生徒が見つかりません"],
    ["搜尋要排除的角色", "除外する生徒を検索"],
    ["目前沒有排除角色", "現在、除外中の生徒はいません"],
    ["至少選 1 個角色。", "生徒を1人以上選択してください。"],
    ["我方進攻", "味方攻撃"],
    ["敵方防守", "相手防御"],
    ["可以少指定幾個位置再搜尋。", "指定する枠を減らして再検索してください。"],
    ["沒有找到符合條件的對戰紀錄", "条件に一致する対戦記録が見つかりません"],
    ["選擇任一角色後會自動顯示結果。", "生徒を選択すると自動で結果を表示します。"],
    ["選擇角色後會自動更新結果", "生徒を選択すると自動で結果を更新します"],
    ["目前沒有打過至少 5 種不同防守陣容的隊伍", "5種類以上の異なる防御編成と対戦した攻撃編成がありません"],
  ]);

  function translateDynamic(s) {
    if (exact.has(s)) return exact.get(s);
    let m;
    if ((m = s.match(/^位置 (\d+)$/))) return `配置 ${m[1]}`;
    if ((m = s.match(/^(\d+) 次$/))) return `${m[1]} 回`;
    if ((m = s.match(/^(.+) · (\d+) 次$/))) return `${m[1]} · ${m[2]} 回`;
    if ((m = s.match(/^(\d[\d,]*) 場 · (\d+) 角色$/))) return `${m[1]} 戦 · ${m[2]} 生徒`;
    if ((m = s.match(/^資料快照 (.+)$/))) return `データ ${m[1]}`;
    if ((m = s.match(/^進攻方勝率 ([\d.]+)%$/))) return `攻撃側勝率 ${m[1]}%`;
    if ((m = s.match(/^(\d+)勝 (\d+)敗$/))) return `${m[1]}勝 ${m[2]}敗`;
    if ((m = s.match(/^(\d+) 場$/))) return `${m[1]} 戦`;
    if ((m = s.match(/^符合度 (\d+)%$/))) return `一致度 ${m[1]}%`;
    if (s === "符合：我方 / 敵方") return "一致：味方 / 相手";
    if (s === "符合：我方") return "一致：味方";
    if (s === "符合：敵方") return "一致：相手";
    if (s === "替代搜尋 ·") return "代替検索 ·";
    if (s === "替代搜尋（1 位功能近似） ·") return "代替検索（機能近似 1枠） ·";
    if ((m = s.match(/^盲打勝率 ([\d.]+)%$/))) return `初見攻撃勝率 ${m[1]}%`;
    if ((m = s.match(/^(\d+) 種不同防守$/))) return `異なる防御 ${m[1]} 種`;
    if ((m = s.match(/^原始 (\d+) 場$/))) return `元データ ${m[1]} 戦`;
    if (s.startsWith("沒有完全符合的歷史紀錄，已依射程／掩體／敵方攻防剋制尋找替代陣容")) {
      let out = "完全一致する履歴がないため、射程・遮蔽・相手の攻防相性から代替編成を検索しました";
      if (s.includes("最多允許 1 隻 SPECIAL 輸出位在 Attacker / T.S 間功能替代")) out += "。SPECIALの出力枠は Attacker / T.S 間で最大1枠まで機能代替を許可しています";
      const ex = s.match(/（例如 (.+)）/);
      if (ex) out += `（例：${ex[1]}）`;
      return out + "。";
    }
    return s;
  }

  function isNameElement(el) {
    return el?.matches?.(".picker-selected-name, .picker-option strong, .avatar-name, .battle-char strong");
  }

  function inferJp(el, zh) {
    const box = el.closest(".picker-selected, .picker-option, .avatar-tag, .battle-char") || el.parentElement;
    const img = box?.querySelector?.("img");
    const alt = img?.getAttribute("alt") || "";
    if (alt && (window.ARENA_AVATARS?.[alt] || /[ァ-ヶー]/.test(alt))) return alt;
    const src = (img?.getAttribute("src") || "").replace(/^\.\//, "");
    for (const [path, jp] of avatarToJp) {
      if (src.endsWith(path)) return jp;
    }
    const idm = src.match(/\/icon\/(\d+)\.webp/i);
    if (idm && idToJp.has(Number(idm[1]))) return idToJp.get(Number(idm[1]));
    return twToJp.get(zh) || zh;
  }

  function translateNameElement(el) {
    const current = el.textContent.trim();
    if (lang === "ja") {
      const previousZh = nameOriginals.get(el);
      const previousJa = previousZh ? inferJp(el, previousZh) : "";
      if (!previousZh || current !== previousJa) nameOriginals.set(el, current);
      const zh = nameOriginals.get(el) || current;
      const jp = inferJp(el, zh);
      if (el.textContent !== jp) el.textContent = jp;
      if (el.hasAttribute("title")) el.title = jp;
    } else {
      const zh = nameOriginals.get(el);
      if (zh != null && el.textContent !== zh) el.textContent = zh;
      if (zh != null && el.hasAttribute("title")) el.title = zh;
    }
  }

  function translateTextNode(node) {
    if (!node.nodeValue || !node.nodeValue.trim()) return;
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style") || isNameElement(parent)) return;
    if (lang === "ja") {
      const current = node.nodeValue;
      const old = textOriginals.get(node);
      const expected = old != null ? preserveSpace(current, translateDynamic(old.trim())) : null;
      if (old == null || current !== expected) textOriginals.set(node, current);
      const source = textOriginals.get(node);
      const translated = preserveSpace(source, translateDynamic(source.trim()));
      if (node.nodeValue !== translated) node.nodeValue = translated;
    } else {
      const original = textOriginals.get(node);
      if (original != null && node.nodeValue !== original) node.nodeValue = original;
    }
  }

  function preserveSpace(source, replacement) {
    const lead = source.match(/^\s*/)?.[0] || "";
    const trail = source.match(/\s*$/)?.[0] || "";
    return lead + replacement + trail;
  }

  function translateInputs(root = document) {
    root.querySelectorAll?.("input[placeholder]").forEach((input) => {
      if (!input.dataset.zhPlaceholder) input.dataset.zhPlaceholder = input.placeholder;
      input.placeholder = lang === "ja" ? translateDynamic(input.dataset.zhPlaceholder) : input.dataset.zhPlaceholder;
    });
  }

  function translateSubtree(root = document.body) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && isNameElement(root)) translateNameElement(root);
    root.querySelectorAll?.(".picker-selected-name, .picker-option strong, .avatar-name, .battle-char strong").forEach(translateNameElement);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
    translateInputs(root.nodeType === Node.DOCUMENT_NODE ? root : root);
  }

  function updateButtons() {
    document.querySelectorAll("[data-lang-choice]").forEach((btn) => {
      const active = btn.dataset.langChoice === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    document.documentElement.lang = lang === "ja" ? "ja" : "zh-Hant";
    document.title = lang === "ja" ? "S11 戦術対抗戦 編成検索" : "S11 對抗戰陣容搜尋";
  }

  function setLanguage(next) {
    if (!supported.has(next)) return;
    lang = next;
    localStorage.setItem(STORAGE_KEY, lang);
    updateButtons();
    translateSubtree(document.body);
    window.dispatchEvent(new CustomEvent("arena-language-change", { detail: { lang } }));
  }

  document.querySelectorAll("[data-lang-choice]").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.langChoice));
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") translateTextNode(mutation.target);
      mutation.addedNodes.forEach((node) => translateSubtree(node));
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });

  function parseStudentYaml(text) {
    let cur = null;
    let inName = false;
    const commit = () => {
      if (!cur?.jp) return;
      if (cur.tw) twToJp.set(cur.tw, cur.jp);
      if (cur.id) idToJp.set(cur.id, cur.jp);
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

  updateButtons();
  translateSubtree(document.body);

  fetch(RAW_STUDENTS, { cache: "force-cache" })
    .then((r) => r.ok ? r.text() : "")
    .then((text) => {
      if (!text) return;
      parseStudentYaml(text);
      if (lang === "ja") translateSubtree(document.body);
    })
    .catch(() => {});

  window.ARENA_LANGUAGE = {
    get: () => lang,
    set: setLanguage,
  };
})();
