(() => {
  "use strict";

  const meta = window.ARENA_STUDENT_META || {};

  // ----- Rank × 0.7 calculator -----
  const rankInput = document.querySelector("#rank-input");
  const rankResult = document.querySelector("#rank-result");
  const rankTool = document.querySelector("#rank-tool");

  function currentLang() {
    return window.ARENA_LANGUAGE?.get?.() || document.documentElement.lang || "zh-Hant";
  }

  function updateRank() {
    if (!rankInput || !rankResult) return;
    const raw = rankInput.value.trim();
    if (!raw) {
      rankResult.textContent = "—";
      return;
    }
    const rank = Number(raw);
    if (!Number.isFinite(rank) || rank < 1) {
      rankResult.textContent = "—";
      return;
    }
    const value = rank * 0.7;
    rankResult.textContent = Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
  }

  function updateRankLanguage() {
    if (!rankTool) return;
    const ja = currentLang() === "ja";
    rankTool.querySelector("[data-rank-title]").textContent = ja ? "順位 × 0.7" : "名次 × 0.7";
    rankTool.querySelector("[data-rank-label]").textContent = ja ? "現在の順位" : "目前名次";
    rankTool.querySelector("[data-rank-output]").textContent = ja ? "× 0.7 の結果" : "× 0.7 結果";
    rankInput.placeholder = ja ? "順位を入力" : "輸入名次";
  }

  rankInput?.addEventListener("input", updateRank);
  updateRank();
  updateRankLanguage();

  // ----- Student metadata tooltip -----
  const tip = document.createElement("div");
  tip.className = "student-tooltip";
  tip.setAttribute("role", "tooltip");
  document.body.append(tip);

  let activeTarget = null;
  let lastX = 0;
  let lastY = 0;

  const zhAttack = { "爆発":"爆發", "貫通":"貫通", "神秘":"神秘", "振動":"振動", "-":"—" };
  const zhDefense = { "軽装備":"輕裝備", "重装甲":"重裝甲", "特殊装甲":"特殊裝甲", "弾力装甲":"彈力裝甲", "複合装甲":"複合裝甲", "-":"—" };
  const zhPosition = { FRONT:"前排", MIDDLE:"中排", BACK:"後排", "-":"—" };
  const zhRole = { A:"輸出", T:"坦克", SUP:"輔助", "回復":"治療", "T.S":"T.S", "例外":"特殊", "-":"—" };

  function studentTarget(node) {
    const root = node?.closest?.(".battle-char, .picker-option, .picker-selected, .avatar-tag");
    if (!root) return null;
    const holder = root.matches("[data-student-name]") ? root : root.querySelector("[data-student-name]");
    return holder?.dataset.studentName ? { root, holder, name: holder.dataset.studentName } : null;
  }

  function displayName(root, jp) {
    return root.querySelector(".picker-selected-name, .picker-option-text strong, .avatar-name, strong")?.textContent.trim() || jp;
  }

  function rowsFor(name) {
    const v = meta[name];
    if (!v) return null;
    const [cover, range, type, position, role, attack, defense] = v;
    const ja = currentLang() === "ja";
    if (ja) {
      return [
        ["攻撃タイプ", attack || "—"],
        ["防御タイプ", defense || "—"],
        ["射程", range ?? "—"],
        ["種別", type || "—"],
        ["ポジション", position || "—"],
        ["役割", role || "—"],
        ["遮蔽", cover === true ? "あり" : cover === false ? "なし" : "—"],
      ];
    }
    return [
      ["攻擊類型", zhAttack[attack] || attack || "—"],
      ["裝甲", zhDefense[defense] || defense || "—"],
      ["射程", range ?? "—"],
      ["類型", type || "—"],
      ["位置", zhPosition[position] || position || "—"],
      ["職責", zhRole[role] || role || "—"],
      ["掩體", cover === true ? "是" : cover === false ? "否" : "—"],
    ];
  }

  function renderTip(target) {
    const rows = rowsFor(target.name);
    if (!rows) return false;
    const title = displayName(target.root, target.name);
    tip.innerHTML = "";
    const head = document.createElement("div");
    head.className = "student-tooltip-name";
    head.textContent = title;
    const grid = document.createElement("div");
    grid.className = "student-tooltip-grid";
    rows.forEach(([k, v]) => {
      const a = document.createElement("span");
      const b = document.createElement("span");
      a.textContent = k;
      b.textContent = v;
      grid.append(a, b);
    });
    tip.append(head, grid);
    return true;
  }

  function placeTip(x, y) {
    const gap = 14;
    const pad = 10;
    tip.style.left = "0px";
    tip.style.top = "0px";
    const rect = tip.getBoundingClientRect();
    let left = x + gap;
    let top = y + gap;
    if (left + rect.width > window.innerWidth - pad) left = x - rect.width - gap;
    if (top + rect.height > window.innerHeight - pad) top = y - rect.height - gap;
    tip.style.left = Math.max(pad, left) + "px";
    tip.style.top = Math.max(pad, top) + "px";
  }

  function show(target, x, y) {
    if (!renderTip(target)) return;
    activeTarget = target;
    lastX = x;
    lastY = y;
    tip.classList.add("visible");
    placeTip(x, y);
  }

  function hide() {
    activeTarget = null;
    tip.classList.remove("visible");
  }

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const target = studentTarget(e.target);
    if (!target) return;
    if (activeTarget?.root === target.root) return;
    show(target, e.clientX, e.clientY);
  });

  document.addEventListener("pointermove", (e) => {
    if (!activeTarget || e.pointerType === "touch") return;
    lastX = e.clientX;
    lastY = e.clientY;
    placeTip(lastX, lastY);
  });

  document.addEventListener("pointerout", (e) => {
    if (!activeTarget) return;
    if (activeTarget.root.contains(e.relatedTarget)) return;
    const leaving = e.target.closest?.(".battle-char, .picker-option, .picker-selected, .avatar-tag");
    if (leaving === activeTarget.root) hide();
  });

  window.addEventListener("arena-language-change", () => {
    updateRankLanguage();
    if (activeTarget) {
      renderTip(activeTarget);
      placeTip(lastX, lastY);
    }
  });
})();
