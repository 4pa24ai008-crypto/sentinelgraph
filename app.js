const DATA = {
  entities:[
    {id:"p1",name:"Arun Nair",type:"Person",risk:"high",score:82,evidence:18},
    {id:"p2",name:"Maya Joseph",type:"Person",risk:"medium",score:64,evidence:11},
    {id:"p3",name:"Ravi Menon",type:"Person",risk:"high",score:86,evidence:14},
    {id:"o1",name:"Northstar Logistics",type:"Organization",risk:"medium",score:61,evidence:9},
    {id:"o2",name:"Blue River Trading",type:"Organization",risk:"high",score:79,evidence:13},
    {id:"l1",name:"Harbor District",type:"Location",risk:"medium",score:58,evidence:7},
    {id:"l2",name:"Central Junction",type:"Location",risk:"low",score:36,evidence:5},
    {id:"v1",name:"KA-05-MX-2210",type:"Vehicle",risk:"medium",score:53,evidence:6},
    {id:"ph1",name:"+91 98XX 4412",type:"Phone",risk:"high",score:72,evidence:10},
    {id:"ph2",name:"+91 97XX 2088",type:"Phone",risk:"medium",score:49,evidence:8}
  ],
  edges:[
    ["p1","o1","financial"],["p1","ph1","communication"],["p1","l1","location"],["p1","v1","location"],
    ["p2","o1","financial"],["p2","ph1","communication"],["p2","l2","location"],
    ["p3","o2","financial"],["p3","ph2","communication"],["p3","l1","location"],
    ["o1","o2","financial"],["o1","l1","location"],["o2","l2","location"],["v1","l1","location"],["ph1","ph2","communication"]
  ]
};
const $=id=>document.getElementById(id);
const entity=id=>DATA.entities.find(e=>e.id===id);
const degree=id=>DATA.edges.filter(e=>e[0]===id||e[1]===id).length;
const riskBadge=r=>`<span class="risk ${r}">${r}</span>`;

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
  const titles={dashboard:"Investigator Dashboard",network:"Criminal Network Graph",persons:"Person & Entity Search",ai:"AI Relationship & Anomaly Analysis",alerts:"Risk & Suspicious Activity",upload:"Crime Data Upload",locations:"Location-Based Analysis",database:"Database & API"};
  $("pageTitle").textContent=titles[id]||"SentinelGraph";
  window.scrollTo({top:0,behavior:"smooth"});
  if(id==="network") renderNetwork();
}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>showPage(b.dataset.section));
document.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>showPage(b.dataset.jump));

function renderOverview(){
  $("mEntities").textContent=DATA.entities.length;
  $("mRelationships").textContent=DATA.edges.length;
  $("mHighRisk").textContent=DATA.entities.filter(e=>e.risk==="high").length;
  $("mEvidence").textContent=DATA.entities.reduce((s,e)=>s+e.evidence,0);
  const top=[...DATA.entities].sort((a,b)=>degree(b.id)-degree(a.id)).slice(0,5);
  $("priorityList").innerHTML=top.map(e=>`<div class="row-item"><span><strong>${e.name}</strong><small>${e.type} · ${degree(e.id)} connections · evidence ${e.evidence}</small></span>${riskBadge(e.risk)}</div>`).join("");
  const signals=[
    ["Cross-organization financial link","Northstar Logistics ↔ Blue River Trading","high"],
    ["Shared communication channel","Arun Nair ↔ +91 98XX 4412","medium"],
    ["Location convergence","Arun Nair / Ravi Menon / Harbor District","medium"],
    ["Repeated vehicle association","KA-05-MX-2210 ↔ Harbor District","low"]
  ];
  $("signalList").innerHTML=signals.map(s=>`<div class="row-item"><span><strong>${s[0]}</strong><small>${s[1]}</small></span>${riskBadge(s[2])}</div>`).join("");
}
function positions(){
  const w=900,h=560;
  const map={p1:[18,42],p2:[42,20],p3:[67,31],o1:[83,58],o2:[70,74],l1:[43,83],l2:[88,82],v1:[62,60],ph1:[21,77],ph2:[47,58]};
  return Object.fromEntries(Object.entries(map).map(([id,[x,y]])=>[id,{x:x/100*w,y:y/100*h}]));
}
function renderNetwork(){
  const filter=$("networkFilter").value;
  const links=DATA.edges.filter(e=>filter==="all"||e[2]===filter);
  const pos=positions(),w=900,h=560;
  const colors={Person:"#d66a78",Organization:"#9c7bea",Vehicle:"#c79a47",Phone:"#55aaa2",Location:"#678dd1"};
  let svg=`<svg viewBox="0 0 ${w} ${h}">`;
  links.forEach(e=>{const a=pos[e[0]],b=pos[e[1]];svg+=`<line class="network-edge ${e[2]}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;});
  DATA.entities.forEach(e=>{const p=pos[e.id],r=10+Math.min(9,degree(e.id)*1.5);svg+=`<g class="graph-node" data-id="${e.id}"><circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${colors[e.type]}"/><text x="${p.x}" y="${p.y+r+17}">${e.name}</text></g>`});
  svg+="</svg>";$("networkCanvas").innerHTML=svg;
  document.querySelectorAll(".graph-node").forEach(n=>n.onclick=()=>inspectEntity(n.dataset.id));
}
function inspectEntity(id){
  const e=entity(id); if(!e)return;
  const connected=DATA.edges.filter(x=>x[0]===id||x[1]===id).map(x=>({e:entity(x[0]===id?x[1]:x[0]),rel:x[2]}));
  $("networkInspector").innerHTML=`<div class="eyebrow">ENTITY PROFILE</div><h2>${e.name}</h2><p style="color:#7890a7">${e.type} · Risk signal ${e.score}/100</p>${riskBadge(e.risk)}
  <div class="detail-grid"><div class="detail-box">Connections<strong>${degree(id)}</strong></div><div class="detail-box">Evidence<strong>${e.evidence}</strong></div><div class="detail-box">Risk score<strong>${e.score}</strong></div><div class="detail-box">Review<strong>Required</strong></div></div>
  <h3>Connected entities</h3>${connected.map(c=>`<div class="connection"><b>${c.e.name}</b><span>${c.e.type} · ${c.rel} relationship</span></div>`).join("")}`;
}
$("networkFilter").onchange=renderNetwork;
$("resetGraph").onclick=()=>{ $("networkFilter").value="all"; $("networkInspector").innerHTML=`<div class="empty-state"><div class="empty-icon">⌁</div><h3>Select an entity</h3><p>Click any node in the network to inspect its connections, risk signal and supporting evidence.</p></div>`; renderNetwork(); };

function personSearch(name){
  const q=(name||"").trim().toLowerCase();
  const e=DATA.entities.find(x=>x.name.toLowerCase()===q) || DATA.entities.find(x=>x.name.toLowerCase().includes(q));
  if(!e){$("personResult").innerHTML=`<article class="card"><h3>No entity found</h3><p style="color:#8296aa">Try one of the example searches above.</p></article>`;return;}
  const con=DATA.edges.filter(x=>x[0]===e.id||x[1]===e.id).map(x=>({e:entity(x[0]===e.id?x[1]:x[0]),rel:x[2]}));
  $("personResult").innerHTML=`<div class="person-card"><article class="card profile-main"><div class="eyebrow">MATCHED ENTITY</div><h2>${e.name}</h2>${riskBadge(e.risk)}<p><b>${e.type}</b> with ${con.length} direct relationships and ${e.evidence} linked evidence references. The network view shows how this entity connects to people, organizations, assets and locations.</p><div class="detail-grid"><div class="detail-box">Risk signal<strong>${e.score}/100</strong></div><div class="detail-box">Connections<strong>${con.length}</strong></div></div><button class="primary-btn" onclick="showPage('network');setTimeout(()=>inspectEntity('${e.id}'),50)">Open in Network →</button></article><article class="card"><div class="eyebrow">DIRECT CONNECTIONS</div><h3>Relationship evidence</h3><div class="connections-grid">${con.map(c=>`<div class="connection-card"><span><b>${c.e.name}</b><br>${c.e.type}</span><strong>${c.rel}</strong></div>`).join("")}</div></article></div>`;
}
$("personSearch").oninput=e=>personSearch(e.target.value);
document.querySelectorAll("[data-person]").forEach(b=>b.onclick=()=>{$("personSearch").value=b.dataset.person;personSearch(b.dataset.person)});

function runAI(){
  const name=$("aiEntity").value;
  const e=DATA.entities.find(x=>x.name===name)||DATA.entities[0];
  const d=degree(e.id);
  const financial=DATA.edges.filter(x=>(x[0]===e.id||x[1]===e.id)&&x[2]==="financial").length;
  const comm=DATA.edges.filter(x=>(x[0]===e.id||x[1]===e.id)&&x[2]==="communication").length;
  const loc=DATA.edges.filter(x=>(x[0]===e.id||x[1]===e.id)&&x[2]==="location").length;
  const score=Math.min(100,Math.round(e.score*.55+d*7+financial*6+comm*4+loc*3));
  const mode=$("aiMode").value;
  $("aiOutput").innerHTML=`<div class="ai-main"><article class="score-card"><div class="eyebrow">AI SIGNAL SCORE</div><div class="score">${score}</div><div class="score-label">0–100 demonstration signal</div><div style="margin-top:15px">${riskBadge(score>=75?"high":score>=50?"medium":"low")}</div></article><article class="card ai-text"><div class="eyebrow">EXPLAINABLE SUMMARY</div><h3>${e.name}: relationship & anomaly assessment</h3><p>The system identifies <b>${d} direct relationships</b>, including <b>${financial} financial</b>, <b>${comm} communication</b> and <b>${loc} location</b> links. The signal increases when multiple relationship types converge around the same entity.</p><p><b>Why it was flagged:</b> repeated connections, cross-source relationship overlap and network position indicate that this entity should be reviewed together with the supporting records rather than as an isolated record.</p></article></div><div class="signal-grid"><article class="signal-card"><b>Relationship strength</b><p>${d} direct connections create a measurable network footprint.</p></article><article class="signal-card"><b>Cross-source overlap</b><p>${financial+comm+loc} relationship signals span multiple evidence categories.</p></article><article class="signal-card"><b>Anomaly explanation</b><p>Unusual combinations are surfaced with reasons instead of an unexplained score.</p></article></div>`;
}
$("runAI").onclick=runAI;

const ALERTS=[
 ["Suspicious transaction path","A cross-organization financial relationship creates a short path between high-interest entities.","high","Financial records"],
 ["Shared communication channel","A phone identifier is connected to multiple monitored entities.","high","CDR analysis"],
 ["Location convergence","Multiple high-interest entities appear around Harbor District.","medium","Surveillance reports"],
 ["Vehicle association","A vehicle is linked to a person and repeated location activity.","medium","Surveillance + vehicle data"]
];
function renderAlerts(){
  $("alertCards").innerHTML=ALERTS.map(a=>`<article class="alert-card ${a[2]}">${riskBadge(a[2])}<h3>${a[0]}</h3><p>${a[1]}</p><div class="alert-source">Evidence source: ${a[3]}</div></article>`).join("");
  $("highCount").textContent=ALERTS.filter(a=>a[2]==="high").length;$("mediumCount").textContent=ALERTS.filter(a=>a[2]==="medium").length;$("totalCount").textContent=ALERTS.length;
}
$("clearAlerts").onclick=()=>{ALERTS.length=0;renderAlerts()};

function parseCSV(text){
  const lines=text.trim().split(/\r?\n/); if(!lines.length)return [];
  const headers=lines.shift().split(",").map(x=>x.trim().toLowerCase());
  return lines.map(line=>{const a=line.split(",");const o={};headers.forEach((h,i)=>o[h]=(a[i]||"").trim());return o}).filter(r=>r.case_id||r.person);
}
function showUpload(rows){
  $("uploadPreview").hidden=false;$("uploadMeta").textContent=`${rows.length} records loaded`;
  $("uploadTable").innerHTML=rows.slice(0,50).map(r=>`<tr><td>${r.case_id||""}</td><td>${r.date||""}</td><td>${r.crime_type||""}</td><td>${r.person||""}</td><td>${r.location||""}</td><td>${r.description||""}</td></tr>`).join("");
  $("uploadStatus").textContent=`✓ Loaded ${rows.length} crime records. Ready for analysis.`;
  sessionStorage.setItem("sentinelCrimeRows",JSON.stringify(rows));
}
$("crimeFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>showUpload(parseCSV(r.result));r.readAsText(f)};
$("dropZone").ondragover=e=>{e.preventDefault();$("dropZone").style.borderColor="#55bff5"};
$("dropZone").ondragleave=()=>{$("dropZone").style.borderColor=""};
$("dropZone").ondrop=e=>{e.preventDefault();$("dropZone").style.borderColor="";const f=e.dataTransfer.files[0];if(!f)return;const r=new FileReader();r.onload=()=>showUpload(parseCSV(r.result));r.readAsText(f)};
$("downloadTemplate").onclick=()=>{const csv="case_id,date,crime_type,person,location,description\\nCR-001,2026-09-24,Financial Fraud,Arun Nair,Harbor District,Repeated transaction pattern\\n";const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="sentinelgraph_crime_data_template.csv";a.click()};

const LOCATIONS=[
 {name:"Harbor District",cases:7,entities:["Arun Nair","Ravi Menon","Northstar Logistics","KA-05-MX-2210"],score:78,summary:"High concentration of people, organization and vehicle relationships. The location is connected to both financial and location-based signals and should be reviewed with the underlying records."},
 {name:"Central Junction",cases:4,entities:["Maya Joseph","Blue River Trading"],score:54,summary:"Moderate activity with organization and location overlap. Additional records would help determine whether the pattern is persistent."},
 {name:"All locations",cases:11,entities:["Arun Nair","Maya Joseph","Ravi Menon","Northstar Logistics","Blue River Trading"],score:68,summary:"The combined view shows recurring relationships across people, organizations, phones, vehicles and locations. Graph analysis helps investigators trace these links back to supporting evidence."}
];
function renderLocations(){
  const chosen=$("locationSelect").value;const x=LOCATIONS.find(l=>l.name===chosen)||LOCATIONS[2];
  $("locationCards").innerHTML=LOCATIONS.filter(l=>l.name!=="All locations").map(l=>`<article class="location-card"><div class="eyebrow">MONITORED LOCATION</div><h3>${l.name}</h3><div class="location-score">${l.score}<small style="font-size:10px;color:#71879d">/100</small></div><p>${l.cases} activity records · ${l.entities.length} connected entities</p></article>`).join("");
  $("locationTitle").textContent=x.name;$("locationScore").textContent=`Signal ${x.score}/100`;$("locationInsight").innerHTML=`<b>Investigator insight:</b> ${x.summary}<br><br><span style="color:#647c93">Connected entities: ${x.entities.join(" · ")}</span>`;
}
$("locationSelect").onchange=renderLocations;

async function checkBackend(){
  try{const r=await fetch("http://localhost:3000/api/health");const d=await r.json();$("backendStatus").textContent=`Backend online · SQLite · ${d.records} records`;$("dbOnline").innerHTML=`<i></i> Connected · ${d.records} stored records`;$("dbText").textContent="Node.js/Express API is running and the SQLite database is reachable."}
  catch(e){$("backendStatus").textContent="Demo mode · backend offline";$("dbOnline").innerHTML=`<i style="background:#f3b84b"></i> Demo mode`;$("dbText").textContent="The dashboard is running independently with synthetic data. Start the backend to enable persistent SQLite storage and API services."}
}

renderOverview();renderNetwork();renderAlerts();renderLocations();checkBackend();
