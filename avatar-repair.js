(() => {
  "use strict";

  const RAW_STUDENTS = "https://raw.githubusercontent.com/ba-archive/blue-archive/main/apps/blue-archive-story-viewer/public/config/yaml/students.yaml";
  const ICON_BASE = "https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/icon/";
  const byJp = new Map();
  const byTw = new Map();

  // Known characters that are present in the current PvP dataset but are not bundled in avatar-map.js.
  // Seed them immediately so the UI does not wait for the remote metadata YAML before showing an icon.
  const STATIC_STUDENTS = [
    { id: 10095, jp: "ジュリ（アルバイト）", tw: "茱莉(打工)" },
  ];
  STATIC_STUDENTS.forEach((student) => {
    byJp.set(student.jp, student.id);
    if (student.tw) byTw.set(student.tw, { jp: student.jp, id: student.id });
  });

  let ready = byJp.size > 0;

  function parseYaml(text) {
    let cur = null;
    let inName = false;
    const commit = () => {
      if (!cur?.id || !cur.jp) return;
      byJp.set(cur.jp, cur.id);
      if (cur.tw) byTw.set(cur.tw, { jp: cur.jp, id: cur.id });
    };
    for (const raw of text.split(/\r?\n/)) {
      const idm = raw.match(/^- id:\s*(\d+)/);
      if (idm) {
        commit();
        cur = { id: Number(idm[1]), jp: "", tw: "" };
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
    ready = true;
  }

  function inferName(box) {
    const img = box.querySelector("img[alt]");
    if (img?.alt && byJp.has(img.alt)) return img.alt;

    const small = box.querySelector("small")?.textContent?.trim() || "";
    const jpFromSmall = small.split(" · ")[0].trim();
    if (jpFromSmall && byJp.has(jpFromSmall)) return jpFromSmall;

    const visible = box.querySelector(".picker-selected-name, .avatar-name, .battle-char strong, strong")?.textContent?.trim() || "";
    if (byJp.has(visible)) return visible;
    return byTw.get(visible)?.jp || "";
  }

  function repairBox(box) {
    if (!ready || !box) return;
    const avatar = box.matches(".char-avatar") ? box : box.querySelector(".char-avatar");
    if (!avatar) return;
    const name = inferName(box) || inferName(avatar.parentElement || box);
    const id = byJp.get(name);
    if (!id) return;

    const current = avatar.querySelector("img");
    const remote = `${ICON_BASE}${id}.webp`;

    if (current) {
      if (current.dataset.remoteRepair === "1") return;
      const useRemote = () => {
        if (current.dataset.remoteRepair === "1") return;
        current.dataset.remoteRepair = "1";
        current.src = remote;
      };
      current.addEventListener("error", useRemote, { once: true });
      if (current.complete && current.naturalWidth === 0) useRemote();
      return;
    }

    const image = new Image();
    image.alt = name;
    image.loading = "lazy";
    image.dataset.remoteRepair = "1";
    image.src = remote;
    image.addEventListener("load", () => {
      avatar.textContent = "";
      avatar.appendChild(image);
    }, { once: true });
  }

  function repairAll(root = document) {
    root.querySelectorAll?.(".picker-option, .picker-selected, .avatar-tag, .battle-char, .blind-card .battle-char").forEach(repairBox);
  }

  const observer = new MutationObserver((mutations) => {
    if (!ready) return;
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches?.(".picker-option, .picker-selected, .avatar-tag, .battle-char")) repairBox(node);
        repairAll(node);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Repair known gaps immediately, then expand coverage from the public metadata in the background.
  repairAll();

  fetch(RAW_STUDENTS, { cache: "force-cache" })
    .then((r) => r.ok ? r.text() : "")
    .then((text) => {
      if (!text) return;
      parseYaml(text);
      repairAll();
    })
    .catch(() => {});
})();
