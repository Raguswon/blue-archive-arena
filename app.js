(() => {
  const data = window.ARENA_DATA;
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

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const els = {
    missingHost: $("#missing-picker"),
    missingTags: $("#missing-tags"),
    clearMissing: $("#clear-missing"),
    clearDefense: $("#clear-defense"),
    defenseInputs: $("#defense-inputs"),
    searchBtn: $("#search-btn"),
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
    positionPriority: $("#position-priority"),
    exactOnly: $("#exact-only"),
  };

  const norm = s => String(s || "").normalize("NFKC").toLowerCase().replace(/[\s・･]/g, "").replace(/[()（）]/g, "");

  const freqST = new Map(), freqSP = new Map(), freqAll = new Map();
  const positionFreq = Array.from({length: 6}, () => new Map());
  data.matches.forEach(m => {
    [...m.a, ...m.d].forEach(n => n && freqAll.set(n, (freqAll.get(n) || 0) + 1));
    [...m.a.slice(0,4), ...m.d.slice(0,4)].forEach(n => n && freqST.set(n, (freqST.get(n) || 0) + 1));
    [...m.a.slice(4,6), ...m.d.slice(4,6)].forEach(n => n && freqSP.set(n, (freqSP.get(n) || 0) + 1));
    for (let i=0;i<6;i++) [m.a[i],m.d[i]].forEach(n => n && positionFreq[i].set(n,(positionFreq[i].get(n)||0)+1));
  });
  const byFreq = (a,b,map=freqAll) => (map.get(b)||0)-(map.get(a)||0) || a.localeCompare(b,"ja");
  const stChars = [...freqST.keys()].sort((a,b)=>byFreq(a,b,freqST));
  const spChars = [...freqSP.keys()].sort((a,b)=>byFreq(a,b,freqSP));
  const allChars = [...new Set([...stChars,...spChars])].sort((a,b)=>byFreq(a,b,freqAll));
  // Position 1~4 pools combine A1/D1, A2/D2, etc., sorted by appearance at that exact position.
  const lineupPools = [0,1,2,3].map(i => [...positionFreq[i].keys()].sort((a,b)=>byFreq(a,b,positionFreq[i])));
  lineupPools.push(spChars, spChars);

  // Bundled Traditional-Chinese aliases for every character appearing in this S11 dataset.
  // This keeps Chinese search/display working even when the remote metadata request is blocked.
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
    "応援団":"應援團","アイドル":"偶像","幼女":"幼女","マジカル":"魔法少女","アルバイト":"打工","チーパオ":"旗袍","溫泉":"溫泉",
    "体操服":"體操服","正月":"正月","攻撃":"攻擊","防御":"防禦","私服":"私服"
  };
  function bundledTw(name) {
    if (!name) return name;
    if (name === "シロコ＊テラー") return "白子＊Terror";
    const m = String(name).match(/^(.+?)（(.+)）$/);
    if (!m) return TW_BASE[name] || name;
    const base = TW_BASE[m[1]] || m[1];
    const suffix = TW_SUFFIX[m[2]] || m[2];
    return `${base}(${suffix})`;
  }
  allChars.forEach(jp => {
    const tw = bundledTw(jp);
    if (tw && tw !== jp) state.aliases.set(norm(tw), jp);
  });


  function parseStudentYaml(text) {
    let cur = null, section = "";
    for (const raw of text.split(/\r?\n/)) {
      const idm = raw.match(/^- id:\s*(\d+)/);
      if (idm) { if (cur) commit(cur); cur={id:+idm[1], jp:"", tw:"", cn:"", en:""}; section=""; continue; }
      if (!cur) continue;
      if (/^  name:\s*$/.test(raw)) { section="name"; continue; }
      if (/^  [a-zA-Z].*:\s*$/.test(raw) && !/^  name:/.test(raw)) section="";
      if (section === "name") {
        const m = raw.match(/^    (jp|tw|cn|en):\s*(.*)$/);
        if (m) cur[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
      }
    }
    if (cur) commit(cur);
    function commit(x) {
      if (!x.jp) return;
      state.meta.set(x.jp, x);
      [x.jp,x.tw,x.cn,x.en].filter(Boolean).forEach(alias => state.aliases.set(norm(alias), x.jp));
    }
  }

  async function loadMeta() {
    try {
      const r = await fetch(RAW_STUDENTS, {cache:"force-cache"});
      if (r.ok) parseStudentYaml(await r.text());
    } catch (_) {}
    buildPickers();
    renderMissing();
  }

  function iconUrl(name) {
    const local = window.ARENA_AVATARS?.[name];
    if (local) return local;
    const m=state.meta.get(name);
    return m?.id ? `${ICON_BASE}${m.id}.webp` : "";
  }
  function twName(name) { const tw=state.meta.get(name)?.tw; return tw || bundledTw(name) || name; }
  function aliasesFor(name) {
    const m=state.meta.get(name); return [name,bundledTw(name),m?.tw,m?.cn,m?.en].filter(Boolean).map(norm);
  }
  function matchesQuery(name,q) {
    const nq=norm(q); if(!nq) return true;
    return aliasesFor(name).some(a=>a.includes(nq));
  }

  function avatar(name, cls="") {
    const wrap=document.createElement("div"); wrap.className=`char-avatar ${cls}`;
    const url=iconUrl(name);
    if(url){ const img=new Image(); img.src=url; img.alt=name; img.loading="lazy"; img.onerror=()=>{img.remove();wrap.textContent=name.slice(0,1)}; wrap.appendChild(img); }
    else wrap.textContent=name.slice(0,1);
    return wrap;
  }

  function makePicker(host, pool, opts={}) {
    host.innerHTML="";
    const root=document.createElement("div"); root.className="picker";
    const selected=document.createElement("button"); selected.type="button"; selected.className="picker-selected";
    const placeholder=opts.placeholder || "選擇角色";
    const menu=document.createElement("div"); menu.className="picker-menu";
    const search=document.createElement("input"); search.className="picker-search"; search.placeholder="搜尋日文 / 中文";
    const list=document.createElement("div"); list.className="picker-list";
    menu.append(search,list); root.append(selected,menu); host.append(root);
    let value="";
    function paintSelected(){
      selected.innerHTML="";
      if(!value){ selected.innerHTML=`<span class="picker-placeholder">${placeholder}</span><span class="picker-chevron">⌄</span>`; }
      else { selected.append(avatar(value,"mini")); const t=document.createElement("span"); t.className="picker-selected-name"; t.textContent=twName(value); selected.append(t); const x=document.createElement("span"); x.className="picker-chevron"; x.textContent="×"; selected.append(x); }
    }
    function paintList(){
      list.innerHTML=""; const q=search.value;
      const excluded = opts.excludedNames ? opts.excludedNames() : new Set();
      const filtered=pool.filter(n=>!excluded.has(n)&&matchesQuery(n,q)).slice(0,80);
      filtered.forEach(n=>{
        const b=document.createElement("button"); b.type="button"; b.className="picker-option";
        b.append(avatar(n,"option-avatar"));
        const tx=document.createElement("span"); tx.className="picker-option-text";
        const main=document.createElement("strong"); main.textContent=twName(n);
        const sub=document.createElement("small");
        const countMap = opts.frequencyMap || freqAll;
        const count = countMap.get(n) || 0;
        sub.textContent=n===twName(n)?`${count} 次`: `${n} · ${count} 次`;
        tx.append(main,sub); b.append(tx);
        b.onclick=()=>{ value=n; paintSelected(); root.classList.remove("open"); opts.onChange?.(n); };
        list.append(b);
      });
      if(!filtered.length){const e=document.createElement("div");e.className="picker-empty";e.textContent="找不到角色";list.append(e)}
    }
    selected.onclick=()=>{
      if(value && root.classList.contains("open")===false && opts.clearOnSelectedClick){ value="";paintSelected();opts.onChange?.("");return; }
      root.classList.toggle("open"); if(root.classList.contains("open")){search.value="";paintList();setTimeout(()=>search.focus(),0)}
    };
    search.oninput=paintList;
    document.addEventListener("click",e=>{if(!root.contains(e.target))root.classList.remove("open")});
    root.getValue=()=>value; root.setValue=v=>{value=v||"";paintSelected()}; root.clear=()=>{value="";paintSelected()};
    paintSelected(); return root;
  }

  let missingPicker, defensePickers=[];
  function buildPickers(){
    missingPicker=makePicker(els.missingHost, allChars, {placeholder:"搜尋要排除的角色", excludedNames:()=>new Set(state.unavailable), onChange:n=>{if(n){state.unavailable.add(n);saveMissing();renderMissing();missingPicker.clear();updateEligibleCount();if(getLineup().some(Boolean))search();}}});
    defensePickers=[];
    $$(".defense-picker-host").forEach((host,i)=>{
      const pool=lineupPools[i];
      const frequencyMap = i < 4 ? positionFreq[i] : freqSP;
      defensePickers.push(makePicker(host,pool,{
        placeholder:i<4?`位置 ${i+1}`:`SP${i-3}`,
        clearOnSelectedClick:true,
        frequencyMap,
        excludedNames:()=>new Set(defensePickers.map(p=>p?.getValue()).filter(Boolean)),
        onChange:()=>search()
      }));
    });
  }

  function saveMissing(){localStorage.setItem(STORAGE_KEY,JSON.stringify([...state.unavailable]));}
  function renderMissing(){
    els.missingTags.innerHTML=""; const names=[...state.unavailable].filter(n=>freqAll.has(n)).sort((a,b)=>byFreq(a,b));
    if(!names.length){els.missingTags.innerHTML='<span class="avatar-tag-empty">目前沒有排除角色</span>';return;}
    names.forEach(name=>{
      const tag=document.createElement("div");tag.className="avatar-tag";tag.append(avatar(name,"tag-avatar"));
      const label=document.createElement("div");label.className="avatar-name";label.textContent=twName(name);
      const rm=document.createElement("button");rm.className="avatar-remove";rm.type="button";rm.textContent="×";rm.onclick=()=>{state.unavailable.delete(name);saveMissing();renderMissing();updateEligibleCount();if(getLineup().some(Boolean))search()};
      tag.append(label,rm);els.missingTags.append(tag);
    });
  }

  function getLineup(){return defensePickers.map(p=>p.getValue());}
  function eligible(m){return !m.a.some(n=>state.unavailable.has(n));}
  function updateEligibleCount(){els.statEligible.textContent=data.matches.filter(eligible).length.toLocaleString();}

  function compareLineup(actual, query) {
    const known=query.map((n,i)=>({n,i})).filter(x=>x.n); if(!known.length)return null;
    let exact=0;
    known.forEach(({n,i})=>{ if(i<4 && actual[i]===n) exact++; else if(i>=4 && actual.slice(4,6).includes(n)) exact++; });
    const actualSet=new Set(actual.filter(Boolean));
    const sameChars=known.filter(({n})=>actualSet.has(n)).length;
    const similarity=exact/known.length;
    if(els.exactOnly.checked && exact<known.length)return null;
    return {exact,known:known.length,sameChars,similarity};
  }

  function teamKey(a,d){return `${a.join("|")}>>${d.join("|")}`;}
  function wilson(w,n,z=1.96){if(!n)return 0;const p=w/n,z2=z*z,den=1+z2/n,center=p+z2/(2*n),margin=z*Math.sqrt((p*(1-p)+z2/(4*n))/n);return(center-margin)/den;}

  function search(){
    const query=getLineup();
    if(!query.some(Boolean)){els.formMessage.textContent="至少選 1 個角色。";return;}
    els.formMessage.textContent="";
    const rows=[];let eligibleCount=0,matchedCount=0;
    for(const m of data.matches){
      if(!eligible(m))continue; eligibleCount++;
      const attackMatch=compareLineup(m.a,query), defenseMatch=compareLineup(m.d,query);
      if(!attackMatch && !defenseMatch)continue;
      matchedCount++;
      const querySide=attackMatch && defenseMatch ? (attackMatch.similarity>=defenseMatch.similarity?"attack":"defense") : (attackMatch?"attack":"defense");
      rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});
    }
    const groups=new Map();
    rows.forEach(r=>{
      const k=teamKey(r.a,r.d);
      if(!groups.has(k))groups.set(k,{a:r.a,d:r.d,wins:0,losses:0,samples:0,best:r.match,querySides:new Set()});
      const g=groups.get(k);g.samples++;r.w?g.wins++:g.losses++;g.querySides.add(r.querySide);
      if(r.match.similarity>g.best.similarity)g.best=r.match;
    });
    state.lastResults=[...groups.values()].map(g=>({...g,winRate:g.wins/g.samples,wilson:wilson(g.wins,g.samples),score:g.best.similarity*100+wilson(g.wins,g.samples)*30+Math.log1p(g.samples)*3}));
    els.statEligible.textContent=eligibleCount.toLocaleString();els.statMatched.textContent=matchedCount.toLocaleString();els.statTeams.textContent=state.lastResults.length.toLocaleString();
    renderResults();
  }

  function renderTeam(team, side){
    const box=document.createElement("div");box.className=`battle-team ${side}`;
    team.forEach((name,i)=>{
      const c=document.createElement("div");c.className="battle-char";c.append(avatar(name,"battle-avatar"));
      const pos=document.createElement("span");pos.className="battle-pos";pos.textContent=i<4?`${side==='attack'?'A':'D'}${i+1}`:`SP${i-3}`;
      const nm=document.createElement("strong");nm.textContent=twName(name);c.append(pos,nm);box.append(c);
    });return box;
  }
  function renderResults(){
    let items=[...state.lastResults];
    const sideRank=g=>{
      const a=g.querySides.has("attack"), d=g.querySides.has("defense");
      if(a&&d)return 0;
      return state.sidePriority==="attack" ? (a?0:1) : (d?0:1);
    };
    const metricCmp=(a,b)=>{
      if(state.sort==="winrate")return b.winRate-a.winRate||b.samples-a.samples;
      if(state.sort==="samples")return b.samples-a.samples||b.winRate-a.winRate;
      if(state.sort==="similarity")return b.best.similarity-a.best.similarity||b.score-a.score;
      return b.score-a.score;
    };
    items.sort((a,b)=>sideRank(a)-sideRank(b)||metricCmp(a,b));
    els.results.innerHTML="";
    if(!items.length){els.results.innerHTML='<div class="empty-state"><strong>沒有找到符合條件的對戰紀錄</strong><span>可以少指定幾個位置再搜尋。</span></div>';return;}
    items.slice(0,100).forEach((g,idx)=>{
      const card=document.createElement("article");card.className="result-card matchup-card"+(g.winRate<0.5?" result-card-fail":"");
      const head=document.createElement("div");head.className="matchup-head";
      const sideLabel=g.querySides.has("attack")&&g.querySides.has("defense")?"符合：我方 / 敵方":g.querySides.has("attack")?"符合：我方":"符合：敵方";
      head.innerHTML=`<span class="rank-badge">#${idx+1}</span><div class="matchup-stats"><b>勝率 ${Math.round(g.winRate*1000)/10}%</b><span>${g.wins}勝 ${g.losses}敗</span><span>${g.samples} 場</span><span>符合度 ${Math.round(g.best.similarity*100)}%</span><span>${sideLabel}</span></div>`;
      const body=document.createElement("div");body.className="matchup-body";
      const left=document.createElement("div");left.className="team-side";left.innerHTML='<div class="team-side-title">我方進攻</div>';left.append(renderTeam(g.a,"attack"));
      const vs=document.createElement("div");vs.className="versus";vs.textContent="VS";
      const right=document.createElement("div");right.className="team-side";right.innerHTML='<div class="team-side-title">敵方防守</div>';right.append(renderTeam(g.d,"defense"));
      body.append(left,vs,right);card.append(head,body);els.results.append(card);
    });
  }

  els.clearMissing.onclick=()=>{state.unavailable.clear();saveMissing();renderMissing();updateEligibleCount();if(getLineup().some(Boolean))search()};
  els.clearDefense.onclick=()=>{defensePickers.forEach(p=>p.clear());els.results.innerHTML='<div class="empty-state"><strong>先輸入查詢陣容</strong><span>選擇任一角色後會自動顯示結果。</span></div>';els.statMatched.textContent="—";els.statTeams.textContent="—";els.formMessage.textContent="選擇角色後會自動更新結果"};
  if(els.searchBtn) els.searchBtn.onclick=search;
  els.sortSelect.onchange=e=>{state.sort=e.target.value;renderResults()};
  const setSidePriority=side=>{
    state.sidePriority=side;
    els.attackPriority?.classList.toggle("active",side==="attack");
    els.defensePriority?.classList.toggle("active",side==="defense");
    renderResults();
  };
  els.attackPriority?.addEventListener("click",()=>setSidePriority("attack"));
  els.defensePriority?.addEventListener("click",()=>setSidePriority("defense"));
  els.positionPriority.onchange=()=>{if(getLineup().some(Boolean))search()};
  els.exactOnly.onchange=()=>{if(getLineup().some(Boolean))search()};
  els.datasetPill.textContent=`${data.total.toLocaleString()} 場 · ${data.characters.length} 角色`;
  els.footerVersion.textContent=`資料快照 ${data.version}`;
  els.statTotal.textContent=data.total.toLocaleString();updateEligibleCount();
  loadMeta();
})();
