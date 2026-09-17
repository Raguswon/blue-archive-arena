// Fast bootstrap: role/range metadata is bundled locally; remote name metadata never blocks the UI.
(async()=>{
  const sourceUrl="https://raw.githubusercontent.com/e34106052/blue-archive-arena/470b3cb6da134765b9c791037c320df8d4147977/app.js";
  const response=await fetch(sourceUrl,{cache:"force-cache"});
  if(!response.ok)throw new Error(`Failed to load application source: ${response.status}`);
  let source=await response.text();

  const oldCompare=`    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  const newCompare=`    if(sameChars < known.length)return null;\n    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  if(!source.includes(oldCompare))throw new Error("compareLineup anchor missing");
  source=source.replace(oldCompare,newCompare);

  // Do not wait for the large remote multilingual YAML before showing controls.
  const oldLoad=`  async function loadMeta() {\n    try {\n      const r = await fetch(RAW_STUDENTS, {cache:"force-cache"});\n      if (r.ok) parseStudentYaml(await r.text());\n    } catch (_) {}\n    buildPickers();\n    renderMissing();\n  }`;
  const newLoad=`  function loadMeta() {\n    buildPickers();\n    renderMissing();\n    fetch(RAW_STUDENTS,{cache:"force-cache"}).then(r=>r.ok?r.text():"").then(t=>{if(t)parseStudentYaml(t)}).catch(()=>{});\n  }`;
  if(source.includes(oldLoad))source=source.replace(oldLoad,newLoad);

  const normAnchor=`  const norm = s => String(s || "").normalize("NFKC").toLowerCase().replace(/[\\s・･]/g, "").replace(/[()（）]/g, "");`;
  const metadataCode=`\n  const studentMeta=new Map(Object.entries(window.ARENA_STUDENT_META||{}).map(([name,v])=>[name,{cover:v[0],range:v[1],type:v[2],position:v[3],role:v[4],attack:v[5],defense:v[6]}]));\n  function substituteScore(wanted,candidate){\n    if(wanted===candidate)return {score:1,exact:true};\n    const a=studentMeta.get(wanted),b=studentMeta.get(candidate);if(!a||!b||!a.type||a.type!==b.type)return null;\n    let pts=0,max=0;const add=(w,ok)=>{max+=w;if(ok)pts+=w};\n    add(5,a.role===b.role);add(4,a.attack===b.attack);add(2,a.position===b.position);add(1,a.defense===b.defense);max+=3;\n    if(a.range&&b.range){const d=Math.abs(a.range-b.range);pts+=d===0?3:d<=100?2:d<=200?1:0}add(1,a.cover===b.cover);\n    const score=max?pts/max:0;return score>=.55?{score,exact:false}:null;\n  }\n  function compareLineupSubstitute(actual,query){\n    const known=query.map((n,i)=>({n,i})).filter(x=>x.n);if(!known.length)return null;const used=new Set(),replacements=[];let total=0,exact=0;\n    for(const {n,i} of known){const candidates=i<4?[i]:[4,5];let best=null;for(const j of candidates){if(used.has(j)||!actual[j])continue;const s=substituteScore(n,actual[j]);if(s&&(!best||s.score>best.score))best={...s,j,name:actual[j]}}if(!best)return null;used.add(best.j);total+=best.score;if(best.exact)exact++;else replacements.push({from:n,to:best.name,score:best.score})}\n    if(!replacements.length)return null;return {exact,known:known.length,sameChars:exact,similarity:total/known.length,substitute:true,replacements};\n  }\n`;
  if(!source.includes(normAnchor))throw new Error("norm anchor missing");
  source=source.replace(normAnchor,normAnchor+metadataCode);

  const oldSearch=`  function search(){\n    const query=getLineup();\n    if(!query.some(Boolean)){els.formMessage.textContent="至少選 1 個角色。";return;}\n    els.formMessage.textContent="";\n    const rows=[];let eligibleCount=0,matchedCount=0;\n    for(const m of data.matches){\n      if(!eligible(m))continue; eligibleCount++;\n      const attackMatch=compareLineup(m.a,query), defenseMatch=compareLineup(m.d,query);\n      if(!attackMatch && !defenseMatch)continue;\n      matchedCount++;\n      const querySide=attackMatch && defenseMatch ? (attackMatch.similarity>=defenseMatch.similarity?"attack":"defense") : (attackMatch?"attack":"defense");\n      rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});\n    }`;
  const newSearch=`  function search(){\n    const query=getLineup();if(!query.some(Boolean)){els.formMessage.textContent="至少選 1 個角色。";return;}els.formMessage.textContent="";\n    let rows=[];let eligibleCount=0,matchedCount=0;\n    for(const m of data.matches){if(!eligible(m))continue;eligibleCount++;const attackMatch=compareLineup(m.a,query),defenseMatch=compareLineup(m.d,query);if(!attackMatch&&!defenseMatch)continue;matchedCount++;const querySide=attackMatch&&defenseMatch?(attackMatch.similarity>=defenseMatch.similarity?"attack":"defense"):(attackMatch?"attack":"defense");rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});}\n    if(!rows.length&&!els.exactOnly.checked){for(const m of data.matches){if(!eligible(m))continue;const attackMatch=compareLineupSubstitute(m.a,query),defenseMatch=compareLineupSubstitute(m.d,query);if(!attackMatch&&!defenseMatch)continue;matchedCount++;const querySide=attackMatch&&defenseMatch?(attackMatch.similarity>=defenseMatch.similarity?"attack":"defense"):(attackMatch?"attack":"defense");rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});}\n      if(rows.length){const examples=[];rows.forEach(r=>(r.match.replacements||[]).forEach(x=>{const k=x.from+">"+x.to;if(!examples.some(e=>e.k===k))examples.push({k,...x})}));const label=examples.slice(0,3).map(x=>twName(x.from)+" → "+twName(x.to)).join("、");els.formMessage.textContent="沒有完全符合的歷史紀錄，已用角色定位／攻擊屬性／射程等條件尋找替代陣容"+(label?"（例如 "+label+"）":"")+"。";}\n    }`;
  if(!source.includes(oldSearch))throw new Error("search anchor missing");
  source=source.replace(oldSearch,newSearch);

  const oldSide=`      const sideLabel=g.querySides.has("attack")&&g.querySides.has("defense")?"符合：我方 / 敵方":g.querySides.has("attack")?"符合：我方":"符合：敵方";`;
  const newSide=`      const sideLabel=(g.best.substitute?"替代搜尋 · ":"")+(g.querySides.has("attack")&&g.querySides.has("defense")?"符合：我方 / 敵方":g.querySides.has("attack")?"符合：我方":"符合：敵方");`;
  if(source.includes(oldSide))source=source.replace(oldSide,newSide);
  (0,eval)(source);
})().catch(err=>{console.error(err);const m=document.querySelector("#form-message");if(m)m.textContent="網站程式載入失敗，請重新整理頁面。"});
