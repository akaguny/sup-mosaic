"use strict";
/* Профили печати (db/localStorage), PDF (downloads) и запуск. */
/* ---------- профили ---------- */
const FIELDS=["palSel","paperSel","orient","pitch","margin","cols","rows","cells","box","letters","gridOn","tint"];
function syncForm(){const s=S.settings;if(!$("palSel").childElementCount)Object.keys(SETS).forEach(k=>{const o=document.createElement("option");o.value=k;o.textContent=SETS[k].label;$("palSel").append(o)});$("palSel").value=SETS[s.palette]?s.palette:"artkal";$("paperSel").value=s.paper;$("orient").value=s.land?"l":"p";$("pitch").value=String(s.pitch);$("margin").value=s.margin;$("cols").value=s.cols;$("rows").value=s.rows;$("cells").value=s.cells==="boxes"||s.cells==="none"?s.cells:"cells";$("box").value=s.box;$("letters").checked=s.letters;$("gridOn").checked=s.grid;$("tint").checked=s.tint}
function readForm(){const s=S.settings,num=(id,a,b,d)=>{const v=parseFloat($(id).value);return isFinite(v)?Math.max(a,Math.min(b,v)):d};snap();
  s.palette=$("palSel").value;s.paper=$("paperSel").value;s.land=$("orient").value==="l";s.pitch=parseFloat($("pitch").value);s.margin=num("margin",3,25,8);s.cols=Math.round(num("cols",9,120,29));s.rows=Math.round(num("rows",9,120,29));
  s.cells=$("cells").value;s.box=Math.round(num("box",10,80,25));s.letters=$("letters").checked;s.grid=$("gridOn").checked;s.tint=$("tint").checked;render()}
FIELDS.forEach(id=>$(id).addEventListener("change",readForm));
let db=null,uid=null,downloads=null;
/* Значения из localStorage — недоверенные: проверяем перед использованием (см. SECURITY-AUDIT.md, п.3). */
const own=(o,k)=>!!o&&Object.prototype.hasOwnProperty.call(o,k);
const numIn=(v,a,b,d)=>{const n=+v;return Number.isFinite(n)?Math.max(a,Math.min(b,Math.round(n))):d};
function cleanSettings(s){const o={...DEF,...(s&&typeof s==="object"?s:{})};
  if(!own(PAPER,o.paper))o.paper=DEF.paper;
  if(![2.6,5,10].includes(+o.pitch))o.pitch=DEF.pitch;
  if(!own(SETS,o.palette))o.palette=DEF.palette;
  if(!["boxes","cells","none"].includes(o.cells))o.cells=DEF.cells;
  o.cols=numIn(o.cols,9,120,DEF.cols);o.rows=numIn(o.rows,9,120,DEF.rows);o.margin=numIn(o.margin,3,25,DEF.margin);o.box=numIn(o.box,10,80,DEF.box);
  o.land=!!o.land;o.letters=!!o.letters;o.grid=!!o.grid;o.tint=!!o.tint;return o}
const lsArr=key=>{try{const a=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(a)?a.filter(p=>p&&typeof p.id==="string"&&typeof p.name==="string"):[]}catch(e){return[]}};
function lsProfiles(){return lsArr("sup-mosaic-profiles")}
async function loadProfiles(){if(db&&uid){try{const q=await db.collection("data/users/"+uid).get(),all=q.docs.map(d=>({id:d.id,...d.data()}));profiles=all.filter(p=>p.kind==="profile");colorways=all.filter(p=>p.kind==="colorway"&&p.roles)}catch(e){profiles=lsProfiles();colorways=lsCw();db=null}}else{profiles=lsProfiles();colorways=lsCw()}
  profiles.sort((a,b)=>a.name.localeCompare(b.name));colorways.sort((a,b)=>a.name.localeCompare(b.name));renderProfiles();renderCw()}
function renderProfiles(){const sel0=$("profSel");sel0.textContent="";const og=(l,items)=>{if(!items.length)return;const g=document.createElement("optgroup");g.label=l;items.forEach(([v,t])=>{const o=document.createElement("option");o.value=v;o.textContent=t;g.append(o)});sel0.append(g)};
  og("Мои профили",profiles.map(p=>[p.id,p.name]));og("Готовые",BUILTIN.map((p,i)=>["b"+i,p.name]));sel0.value=activeProfile;if(sel0.value!==activeProfile){activeProfile="b0";sel0.value="b0"}
  $("profDel").disabled=activeProfile.startsWith("b");
  $("profWhere").textContent=db&&uid?"Профили и расцветки сохраняются в вашем аккаунте и видны только вам. В профиль входят настройки, листы и замены цветов.":"Профили и расцветки сохраняются только в этом браузере. В профиль входят настройки, листы и замены цветов."}
$("profSel").onchange=()=>{const v=$("profSel").value;activeProfile=v;snap();
  if(v.startsWith("b")){S.settings={...DEF,...BUILTIN[+v.slice(1)].settings};refit()}
  else{const p=profiles.find(x=>x.id===v);if(p){try{const d=JSON.parse(p.json);if(!d||!Array.isArray(d.sheets)||!d.sheets.length)throw new Error("нет листов");const sheets=d.sheets.filter(sh=>sh&&Array.isArray(sh.items)).map(sh=>({...sh,items:sh.items.filter(it=>it&&typeof it.s==="string")}));fixIds(sheets);sheets.forEach(sh=>sh.items=sh.items.filter(it=>own(byId,it.s)));S={settings:cleanSettings(d.settings),sheets,gswap:d.gswap&&typeof d.gswap==="object"?d.gswap:{},cur:0};$("profName").value=p.name}catch(e){toast("Профиль повреждён и не открылся")}}}
  sel=0;syncForm();renderProfiles();render()};
function refit(){S.sheets.forEach(sh=>{const items=sh.items;sh.items=[];items.forEach(it=>{if(inField(it)&&!overlaps(sh,it,-1))sh.items.push(it);else{const sp=findSpot(sh,it.s);if(sp)sh.items.push(sp)}})})}
$("profSave").onclick=async()=>{const name=$("profName").value.trim();if(!name){toast("Введите название профиля");$("profName").focus();return}
  const ex=profiles.find(p=>p.name===name),id=ex?ex.id:"p_"+Date.now().toString(36),rec={kind:"profile",name,json:JSON.stringify({settings:S.settings,sheets:S.sheets,gswap:S.gswap}),saved:new Date().toISOString()};
  try{if(db&&uid)await db.collection("data/users/"+uid).doc(id).set(rec);else{const l=lsProfiles().filter(p=>p.id!==id);l.push({id,...rec});localStorage.setItem("sup-mosaic-profiles",JSON.stringify(l))}
    activeProfile=id;await loadProfiles();toast(ex?"Профиль «"+name+"» обновлён":"Профиль «"+name+"» сохранён")}catch(e){toast("Не удалось сохранить профиль: "+(e&&e.message||"хранилище недоступно"))}};
$("profDel").onclick=async()=>{const id=activeProfile;if(id.startsWith("b"))return;const p=profiles.find(x=>x.id===id);
  try{if(db&&uid)await db.collection("data/users/"+uid).doc(id).delete();else localStorage.setItem("sup-mosaic-profiles",JSON.stringify(lsProfiles().filter(x=>x.id!==id)));
    activeProfile="b0";await loadProfiles();toast("Профиль «"+(p?p.name:"")+"» удалён. Листы на экране остались")}catch(e){toast("Не удалось удалить профиль")}};

/* ---------- PDF ---------- */
async function exportPdf(all){if(!downloads){toast("Сохранение файлов недоступно в этом просмотре");return}
  const G=geom(),doc=new jspdf.jsPDF({unit:"mm",format:[G.W,G.H],orientation:G.W>G.H?"landscape":"portrait",compress:true}),pen=pdfPen(doc);
  const idx=all?S.sheets.map((_,i)=>i):[S.cur];idx.forEach((si,n)=>{if(n)doc.addPage([G.W,G.H],G.W>G.H?"landscape":"portrait");drawSheet(pen,si,false)});
  try{await downloads.save({filename:all?"sup-mosaic-"+idx.length+"-sheets.pdf":"sup-mosaic-sheet-"+(S.cur+1)+".pdf",data:doc.output("blob")});toast("PDF готов: листов "+idx.length)}
  catch(e){toast(e&&e.code==="declined"?"Сохранение отменено":"PDF не сохранился: "+(e&&e.message||"ошибка"))}}
$("pdfOne").onclick=()=>exportPdf(false);$("pdfAll").onclick=()=>exportPdf(true);

/* ---------- запуск ---------- */
function start(){try{const d=JSON.parse(localStorage.getItem("sup-mosaic-draft-v3")||"null");
  if(d&&Array.isArray(d.sheets)){const sheets=d.sheets.filter(sh=>sh&&Array.isArray(sh.items)).map(sh=>({...sh,items:sh.items.filter(it=>it&&typeof it.s==="string")}));
    if(sheets.length){fixIds(sheets);sheets.forEach(sh=>sh.items=sh.items.filter(it=>own(byId,it.s)));S={...S,...d,settings:cleanSettings(d.settings),sheets,gswap:d.gswap&&typeof d.gswap==="object"?d.gswap:{}}}}}
  catch(e){}
  S.cur=numIn(S.cur,0,Math.max(0,S.sheets.length-1),0);syncForm();renderBrands();renderLib();renderProfiles();render();
  window.addEventListener("resize",()=>render());if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>render());
  const use=n=>window.claude&&window.claude.use?window.claude.use(n).catch(()=>null):Promise.resolve(null);
  use("downloads").then(d=>{downloads=d;if(!d){$("pdfOne").disabled=$("pdfAll").disabled=true;$("pdfNote").textContent="Сохранение PDF недоступно в этом просмотре. Откройте страницу в Claude под своим аккаунтом."}});
  Promise.all([use("db"),use("user")]).then(async([d,u])=>{try{if(d&&u){uid=await u.id();db=uid?d:null}}catch(e){db=null}loadProfiles()})}
start();
