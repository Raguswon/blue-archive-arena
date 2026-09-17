// Restore the full v16 application, keep strict character matching, and add
// metadata-based substitute search when no exact-character lineup exists.
(async () => {
  const sourceUrl = "https://raw.githubusercontent.com/e34106052/blue-archive-arena/470b3cb6da134765b9c791037c320df8d4147977/app.js";
  const response = await fetch(sourceUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load application source: ${response.status}`);
  let source = await response.text();

  // 1) Normal search must contain every selected character.
  const oldCompare = `    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  const newCompare = `    if(sameChars < known.length)return null;\n    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  if (!source.includes(oldCompare)) throw new Error("Expected compareLineup block was not found");
  source = source.replace(oldCompare, newCompare);

  // 2) Load role/range/type/position/attack/defense metadata from the source sheet.
  const normAnchor = `  const norm = s => String(s || "").normalize("NFKC").toLowerCase().replace(/[\\s・･]/g, "").replace(/[()（）]/g, "");`;
  const metadataCode = `

  const SHEET_META_URL = "https://docs.google.com/spreadsheets/d/1iraJlLyIuWF1qebyY4XkaMkwXHhJcK1IqaQGnMIRJHQ/gviz/tq?tqx=out:csv&sheet=%E7%94%9F%E5%BE%92%E5%90%8D%E7%B0%BF";
  const studentMeta = new Map();
  function parseCsv(text) {
    const rows=[]; let row=[], cell="", quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(ch==='"'){
        if(quoted && text[i+1]==='"'){cell+='"';i++;} else quoted=!quoted;
      } else if(ch===',' && !quoted){row.push(cell);cell="";}
      else if((ch==='\\n'||ch==='\\r') && !quoted){
        if(ch==='\\r'&&text[i+1]==='\\n')i++;
        row.push(cell); if(row.some(v=>v!==""))rows.push(row); row=[];cell="";
      } else cell+=ch;
    }
    if(cell||row.length){row.push(cell);rows.push(row);}
    return rows;
  }
  const sheetMetaReady = fetch(SHEET_META_URL,{cache:"no-store"}).then(r=>{
    if(!r.ok)throw new Error("student metadata HTTP "+r.status);
    return r.text();
  }).then(text=>{
    const rows=parseCsv(text);
    rows.slice(1).forEach(r=>{
      const name=r[0]; if(!name)return;
      studentMeta.set(name,{
        special:r[2]==="TRUE", cover:r[3]==="TRUE",
        range:Number(String(r[4]||"").replace(/,/g,""))||0,
        type:r[5]||"", position:r[6]||"", role:r[7]||"",
        attack:r[8]||"", defense:r[9]||""
      });
    });
    console.info("Loaded student metadata:",studentMeta.size);
  }).catch(err=>console.warn("Student metadata unavailable",err));

  function substituteScore(wanted,candidate){
    if(wanted===candidate)return {score:1,exact:true};
    const a=studentMeta.get(wanted), b=studentMeta.get(candidate);
    if(!a||!b||!a.type||a.type!==b.type)return null;
    let pts=0, max=0;
    const add=(weight,ok)=>{max+=weight;if(ok)pts+=weight;};
    add(5,a.role===b.role);             // role is the strongest signal
    add(4,a.attack===b.attack);         // attack attribute
    add(2,a.position===b.position);     // FRONT/MIDDLE/BACK
    add(1,a.defense===b.defense);       // armor
    max+=3;                             // range similarity
    if(a.range&&b.range){
      const diff=Math.abs(a.range-b.range);
      pts+=diff===0?3:diff<=100?2:diff<=200?1:0;
    }
    // Cover behavior is useful but secondary.
    add(1,a.cover===b.cover);
    const score=max?pts/max:0;
    return score>=0.55?{score,exact:false}:null;
  }

  function compareLineupSubstitute(actual,query){
    const known=query.map((n,i)=>({n,i})).filter(x=>x.n); if(!known.length)return null;
    const used=new Set(); const replacements=[]; let total=0, exact=0;
    for(const {n,i} of known){
      let candidates;
      if(i<4)candidates=[i];
      else candidates=[4,5];
      let best=null;
      for(const j of candidates){
        if(used.has(j)||!actual[j])continue;
        const s=substituteScore(n,actual[j]);
        if(s&&(!best||s.score>best.score))best={...s,j,name:actual[j]};
      }
      if(!best)return null;
      used.add(best.j); total+=best.score; if(best.exact)exact++;
      else replacements.push({from:n,to:best.name,score:best.score});
    }
    if(!replacements.length)return null;
    return {exact,known:known.length,sameChars:exact,similarity:total/known.length,substitute:true,replacements};
  }
`;
  if (!source.includes(normAnchor)) throw new Error("Expected norm anchor was not found");
  source = source.replace(normAnchor, normAnchor + metadataCode);

  // 3) Exact search first. Only if it yields zero rows do we enable substitute matching.
  const oldSearch = `  function search(){\n    const query=getLineup();\n    if(!query.some(Boolean)){els.formMessage.textContent="至少選 1 個角色。";return;}\n    els.formMessage.textContent="";\n    const rows=[];let eligibleCount=0,matchedCount=0;\n    for(const m of data.matches){\n      if(!eligible(m))continue; eligibleCount++;\n      const attackMatch=compareLineup(m.a,query), defenseMatch=compareLineup(m.d,query);\n      if(!attackMatch && !defenseMatch)continue;\n      matchedCount++;\n      const querySide=attackMatch && defenseMatch ? (attackMatch.similarity>=defenseMatch.similarity?"attack":"defense") : (attackMatch?"attack":"defense");\n      rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});\n    }`;
  const newSearch = `  async function search(){\n    const query=getLineup();\n    if(!query.some(Boolean)){els.formMessage.textContent="至少選 1 個角色。";return;}\n    els.formMessage.textContent="";\n    let rows=[];let eligibleCount=0,matchedCount=0;\n    for(const m of data.matches){\n      if(!eligible(m))continue; eligibleCount++;\n      const attackMatch=compareLineup(m.a,query), defenseMatch=compareLineup(m.d,query);\n      if(!attackMatch && !defenseMatch)continue;\n      matchedCount++;\n      const querySide=attackMatch && defenseMatch ? (attackMatch.similarity>=defenseMatch.similarity?"attack":"defense") : (attackMatch?"attack":"defense");\n      rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});\n    }\n    if(!rows.length && !els.exactOnly.checked){\n      await sheetMetaReady;\n      for(const m of data.matches){\n        if(!eligible(m))continue;\n        const attackMatch=compareLineupSubstitute(m.a,query), defenseMatch=compareLineupSubstitute(m.d,query);\n        if(!attackMatch && !defenseMatch)continue;\n        matchedCount++;\n        const querySide=attackMatch && defenseMatch ? (attackMatch.similarity>=defenseMatch.similarity?"attack":"defense") : (attackMatch?"attack":"defense");\n        rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});\n      }\n      if(rows.length){\n        const examples=[];\n        rows.forEach(r=>(r.match.replacements||[]).forEach(x=>{const k=x.from+">"+x.to;if(!examples.some(e=>e.k===k))examples.push({k,...x});}));\n        const label=examples.slice(0,3).map(x=>twName(x.from)+" → "+twName(x.to)).join("、");\n        els.formMessage.textContent="沒有完全符合的歷史紀錄，已用角色定位／攻擊屬性／射程等條件尋找替代陣容"+(label?"（例如 "+label+"）":"")+"。";\n      }\n    }`;
  if (!source.includes(oldSearch)) throw new Error("Expected search block was not found");
  source = source.replace(oldSearch, newSearch);

  // Make substitute results visibly identifiable in each result card.
  const oldSideLabel = `      const sideLabel=g.querySides.has("attack")&&g.querySides.has("defense")?"符合：我方 / 敵方":g.querySides.has("attack")?"符合：我方":"符合：敵方";`;
  const newSideLabel = `      const sideLabel=(g.best.substitute?"替代搜尋 · ":"")+(g.querySides.has("attack")&&g.querySides.has("defense")?"符合：我方 / 敵方":g.querySides.has("attack")?"符合：我方":"符合：敵方");`;
  if (source.includes(oldSideLabel)) source = source.replace(oldSideLabel,newSideLabel);

  (0, eval)(source);
})().catch(err => {
  console.error(err);
  const message = document.querySelector("#form-message");
  if (message) message.textContent = "網站程式載入失敗，請重新整理頁面。";
});
