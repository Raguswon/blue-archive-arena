// Fast bootstrap: local PvP metadata, strict exact matching first, role-aware fallback search.
(async()=>{
  const sourceUrl="https://raw.githubusercontent.com/e34106052/blue-archive-arena/470b3cb6da134765b9c791037c320df8d4147977/app.js";
  const response=await fetch(sourceUrl,{cache:"force-cache"});
  if(!response.ok)throw new Error(`Failed to load application source: ${response.status}`);
  let source=await response.text();

  const oldCompare=`    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  const newCompare=`    if(sameChars < known.length)return null;\n    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  if(!source.includes(oldCompare))throw new Error("compareLineup anchor missing");
  source=source.replace(oldCompare,newCompare);

  // Do not block the controls on the large remote multilingual-name YAML.
  const oldLoad=`  async function loadMeta() {\n    try {\n      const r = await fetch(RAW_STUDENTS, {cache:"force-cache"});\n      if (r.ok) parseStudentYaml(await r.text());\n    } catch (_) {}\n    buildPickers();\n    renderMissing();\n  }`;
  const newLoad=`  function loadMeta() {\n    buildPickers();\n    renderMissing();\n    fetch(RAW_STUDENTS,{cache:"force-cache"}).then(r=>r.ok?r.text():"").then(t=>{if(t)parseStudentYaml(t)}).catch(()=>{});\n  }`;
  if(source.includes(oldLoad))source=source.replace(oldLoad,newLoad);

  const normAnchor=`  const norm = s => String(s || "").normalize("NFKC").toLowerCase().replace(/[\\s・･]/g, "").replace(/[()（）]/g, "");`;
  const metadataCode=`
  const studentMeta=new Map(Object.entries(window.ARENA_STUDENT_META||{}).map(([name,v])=>[name,{cover:v[0],range:v[1],type:v[2],position:v[3],role:v[4],attack:v[5],defense:v[6]}]));

  // PvP attribute interaction used only as a relative fallback-search signal.
  function attackEffect(attack,defense){
    if(!attack||!defense||attack==='-'||defense==='-')return .5;
    const strong={爆発:'軽装備',貫通:'重装甲',神秘:'特殊装甲',振動:'弾力装甲'};
    const weak={爆発:'特殊装甲',貫通:'特殊装甲',神秘:'重装甲'};
    if(strong[attack]===defense)return 1;
    if(weak[attack]===defense)return .2;
    if(defense==='複合装甲')return .55;
    return .55;
  }
  function avg(arr){return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:.5}
  function opponentTankDefenses(team){
    const tanks=(team||[]).map(n=>studentMeta.get(n)).filter(m=>m&&m.type==='STRIKER'&&m.role==='T'&&m.defense);
    if(tanks.length)return tanks.map(m=>m.defense);
    return (team||[]).map(n=>studentMeta.get(n)).filter(m=>m&&m.type==='STRIKER'&&m.defense).map(m=>m.defense);
  }
  function opponentAttackTypes(team){
    let attackers=(team||[]).map(n=>studentMeta.get(n)).filter(m=>m&&m.role==='A'&&m.attack);
    if(!attackers.length)attackers=(team||[]).map(n=>studentMeta.get(n)).filter(m=>m&&m.attack&&m.attack!=='-');
    return attackers.map(m=>m.attack);
  }
  function offensiveFit(attack,opponentTeam){
    const defs=opponentTankDefenses(opponentTeam);return defs.length?avg(defs.map(d=>attackEffect(attack,d))):.5;
  }
  function defensiveFit(defense,opponentTeam){
    const attacks=opponentAttackTypes(opponentTeam);return attacks.length?1-avg(attacks.map(a=>attackEffect(a,defense)))*.75:.5;
  }
  function rangeFit(a,b){
    if(!a||!b)return .5;const d=Math.abs(a-b);return d===0?1:d<=100?.8:d<=200?.45:d<=300?.2:0;
  }
  function roleCompatibility(a,b){
    if(!a.role||!b.role)return {ok:false,mismatch:false};
    if(a.role===b.role)return {ok:true,mismatch:false};
    // In PvP, a SPECIAL T.S can occupy an offensive SP slot similarly to a SPECIAL attacker.
    // Allow this functional mismatch, but only one such mismatch per fallback lineup.
    const outputPair=a.type==='SPECIAL'&&b.type==='SPECIAL'&&new Set([a.role,b.role]).size===2&&[a.role,b.role].every(r=>r==='A'||r==='T.S');
    return {ok:outputPair,mismatch:outputPair};
  }

  function substituteScore(wanted,candidate,opponentTeam,wantedIndex,candidateIndex){
    if(wanted===candidate)return {score:1,exact:true,roleMismatch:false};
    const a=studentMeta.get(wanted),b=studentMeta.get(candidate);
    if(!a||!b||!a.type||a.type!==b.type)return null;
    const roleFit=roleCompatibility(a,b);
    if(!roleFit.ok)return null;

    // SPECIAL units are off-field: ignore range, FRONT/MIDDLE/BACK, cover and own armor.
    if(a.type==='SPECIAL'){
      let score=.70;
      if(roleFit.mismatch){
        // A <-> T.S: both fill an offensive SP slot, but penalize the role change.
        score=.48+.32*offensiveFit(b.attack,opponentTeam)+(a.attack===b.attack?.08:0);
      }else if(a.role==='A'){
        score=.55+.35*offensiveFit(b.attack,opponentTeam)+(a.attack===b.attack?.10:0);
      }else if(a.role==='T.S'){
        score=.76+(a.attack===b.attack?.10:0);
      }else{
        score=.72+(a.attack===b.attack?.08:0);
      }
      return {score:Math.min(1,score),exact:false,roleMismatch:roleFit.mismatch};
    }

    // STRIKER role changes remain disallowed because they alter frontline geometry and function too much.
    if(roleFit.mismatch)return null;

    let pts=0,max=0;
    const add=(w,val)=>{max+=w;pts+=w*Math.max(0,Math.min(1,val));};
    const samePos=a.position===b.position?1:0;
    const sameCover=a.cover===b.cover?1:0;
    const sameAttack=a.attack===b.attack?1:0;
    const sameDefense=a.defense===b.defense?1:0;
    const slotFit=(!els.positionPriority.checked||wantedIndex===candidateIndex)?1:0;

    if(a.role==='A'){
      // STRIKER attacker: countering enemy armor + actual movement geometry matter most.
      add(5,offensiveFit(b.attack,opponentTeam));
      add(4,rangeFit(a.range,b.range));
      add(2,sameCover);
      add(2,defensiveFit(b.defense,opponentTeam));
      add(1,samePos);
      add(1,sameAttack);
      add(1,slotFit);
    }else if(a.role==='T'){
      // Tank: surviving the opponent and preserving frontline geometry dominate; own attack type is irrelevant.
      add(5,defensiveFit(b.defense,opponentTeam));
      add(4,rangeFit(a.range,b.range));
      add(2,sameCover);
      add(1.5,sameDefense);
      add(1,samePos);
      add(1,slotFit);
    }else if(a.role==='SUP'||a.role==='回復'){
      // On-field support/healer: preserve where the unit stands and whether it uses cover.
      add(4,rangeFit(a.range,b.range));
      add(3,sameCover);
      add(2,defensiveFit(b.defense,opponentTeam));
      add(1,samePos);
      add(.5,sameAttack);
      add(1,slotFit);
    }else{
      // Special-behavior STRIKERs: metadata cannot model skills, so stay conservative.
      add(4,rangeFit(a.range,b.range));
      add(2,sameCover);
      add(1.5,defensiveFit(b.defense,opponentTeam));
      add(1,samePos);
      add(1,sameAttack);
      add(1,slotFit);
    }
    const score=max?pts/max:0;
    return score>=.42?{score,exact:false,roleMismatch:false}:null;
  }

  function compareLineupSubstitute(actual,query,opponentTeam){
    const known=query.map((n,i)=>({n,i})).filter(x=>x.n);if(!known.length)return null;
    const used=new Set(),replacements=[];let total=0,exact=0,roleMismatches=0;
    for(const {n,i} of known){
      const wantedMeta=studentMeta.get(n);
      const candidates=i>=4?[4,5]:[0,1,2,3];
      let best=null;
      for(const j of candidates){
        if(used.has(j)||!actual[j])continue;
        const candidateMeta=studentMeta.get(actual[j]);
        if(wantedMeta&&candidateMeta&&wantedMeta.type!==candidateMeta.type)continue;
        const s=substituteScore(n,actual[j],opponentTeam,i,j);
        if(!s)continue;
        if(s.roleMismatch&&roleMismatches>=1)continue;
        // Always prefer a same-role candidate over consuming the one allowed role mismatch.
        if(!best||((best.roleMismatch&&!s.roleMismatch)||(best.roleMismatch===s.roleMismatch&&s.score>best.score)))best={...s,j,name:actual[j]};
      }
      if(!best)return null;
      used.add(best.j);total+=best.score;if(best.exact)exact++;else replacements.push({from:n,to:best.name,score:best.score,roleMismatch:!!best.roleMismatch});
      if(best.roleMismatch)roleMismatches++;
    }
    if(!replacements.length)return null;
    return {exact,known:known.length,sameChars:exact,similarity:total/known.length,substitute:true,replacements,roleMismatches};
  }
`;
  if(!source.includes(normAnchor))throw new Error("norm anchor missing");
  source=source.replace(normAnchor,normAnchor+metadataCode);

  const oldSearch=`  function search(){\n    const query=getLineup();\n    if(!query.some(Boolean)){els.formMessage.textContent="至少選 1 個角色。";return;}\n    els.formMessage.textContent="";\n    const rows=[];let eligibleCount=0,matchedCount=0;\n    for(const m of data.matches){\n      if(!eligible(m))continue; eligibleCount++;\n      const attackMatch=compareLineup(m.a,query), defenseMatch=compareLineup(m.d,query);\n      if(!attackMatch && !defenseMatch)continue;\n      matchedCount++;\n      const querySide=attackMatch && defenseMatch ? (attackMatch.similarity>=defenseMatch.similarity?"attack":"defense") : (attackMatch?"attack":"defense");\n      rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});\n    }`;
  const newSearch=`  function search(){\n    const query=getLineup();if(!query.some(Boolean)){els.formMessage.textContent="至少選 1 個角色。";return;}els.formMessage.textContent="";\n    let rows=[];let eligibleCount=0,matchedCount=0;\n    for(const m of data.matches){if(!eligible(m))continue;eligibleCount++;const attackMatch=compareLineup(m.a,query),defenseMatch=compareLineup(m.d,query);if(!attackMatch&&!defenseMatch)continue;matchedCount++;const querySide=attackMatch&&defenseMatch?(attackMatch.similarity>=defenseMatch.similarity?"attack":"defense"):(attackMatch?"attack":"defense");rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});}\n    if(!rows.length&&!els.exactOnly.checked){for(const m of data.matches){if(!eligible(m))continue;const attackMatch=compareLineupSubstitute(m.a,query,m.d),defenseMatch=compareLineupSubstitute(m.d,query,m.a);if(!attackMatch&&!defenseMatch)continue;matchedCount++;const querySide=attackMatch&&defenseMatch?(attackMatch.similarity>=defenseMatch.similarity?"attack":"defense"):(attackMatch?"attack":"defense");rows.push({...m,match:querySide==="attack"?attackMatch:defenseMatch,querySide});}\n      if(rows.length){const examples=[];rows.forEach(r=>(r.match.replacements||[]).forEach(x=>{const k=x.from+">"+x.to;if(!examples.some(e=>e.k===k))examples.push({k,...x})}));const label=examples.slice(0,3).map(x=>twName(x.from)+" → "+twName(x.to)).join("、");const hasRoleFlex=rows.some(r=>r.match.roleMismatches>0);els.formMessage.textContent="沒有完全符合的歷史紀錄，已依射程／掩體／敵方攻防剋制尋找替代陣容"+(hasRoleFlex?"；最多允許 1 隻 SPECIAL 輸出位在 Attacker / T.S 間功能替代":"")+(label?"（例如 "+label+"）":"")+"。";}\n    }`;
  if(!source.includes(oldSearch))throw new Error("search anchor missing");
  source=source.replace(oldSearch,newSearch);

  const oldSide=`      const sideLabel=g.querySides.has("attack")&&g.querySides.has("defense")?"符合：我方 / 敵方":g.querySides.has("attack")?"符合：我方":"符合：敵方";`;
  const newSide=`      const sideLabel=(g.best.substitute?(g.best.roleMismatches?"替代搜尋（1 位功能近似） · ":"替代搜尋 · "):"")+(g.querySides.has("attack")&&g.querySides.has("defense")?"符合：我方 / 敵方":g.querySides.has("attack")?"符合：我方":"符合：敵方");`;
  if(source.includes(oldSide))source=source.replace(oldSide,newSide);

  (0,eval)(source);
})().catch(err=>{console.error(err);const m=document.querySelector("#form-message");if(m)m.textContent="網站程式載入失敗，請重新整理頁面。"});
