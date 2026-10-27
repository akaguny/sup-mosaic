"use strict";
/* Интерфейс: лист на экране, список досок, легенда, замена цветов, расцветки, каталог, листы, перетаскивание. */
/* ---------- экран ---------- */
function render(){const cv=$("paper"),G=geom(),wrapW=Math.max(260,cv.parentElement.clientWidth-28),cssW=Math.min(wrapW,G.W*3.2),dpr=window.devicePixelRatio||1;
  cv.style.width=cssW+"px";cv.width=Math.round(cssW*dpr);cv.height=Math.round(cssW*G.H/G.W*dpr);
  const k=cv.width/G.W,ctx=cv.getContext("2d"),res=drawSheet(canvasPen(ctx,k),S.cur,true);render.k=cssW/G.W;render.G=G;
  $("pageN").textContent=(S.cur+1)+" / "+S.sheets.length;$("prev").disabled=S.cur===0;$("next").disabled=S.cur>=S.sheets.length-1;
  $("delSheet").disabled=S.sheets.length<2;$("undo").disabled=!undoStack.length;
  const w=[];if(!G.fits)w.push("Поле "+S.settings.cols+"×"+S.settings.rows+" не помещается на лист: уменьшите поле, шаг или поля листа.");
  if(sheet().items.some(it=>!inField(it)))w.push("Часть трафаретов выходит за поле.");
  if(sheet().items.some((it,i)=>overlaps(sheet(),it,i)))w.push("Доски накладываются друг на друга.");
  if(res.plan.over)w.push("Квадраты под коробочки не помещаются даже по 8 мм: уберите часть досок с листа.");
  else if(res.plan.shrunk)w.push("Квадраты "+S.settings.box+" мм не помещаются, уменьшены до "+res.plan.shrunk+" мм.");
  if(res.plan.fallback&&!res.plan.over)w.push("Кружки по одной на бусину не помещаются, нарисованы квадраты под коробочки.");
  $("sheetWarn").hidden=!w.length;$("sheetWarn").textContent=w.join(" ");
  renderItems();renderCw();renderLegend(res.tl);saveDraft()}
function renderItems(){const box0=$("items");box0.textContent="";const sh=sheet();
  if(!sh.items.length){const d=document.createElement("div");d.className="note";d.textContent="Лист пуст. Кликните трафарет в каталоге, чтобы положить его на поле.";box0.append(d)}
  sh.items.forEach((it,i)=>{const s=byId[it.s],d=document.createElement("div");d.className="item"+(i===sel?" sel":"");
    const nm=document.createElement("div");nm.className="nm";nm.textContent=(sh.items.length>1?(i+1)+". ":"")+s.b+" "+s.m;
    const sm=document.createElement("small");sm.textContent=(s.y?"коллекция "+s.y+" · ":"")+s.sz.join(", ")+" · "+s.n+"×"+s.w+" · "+KIND[s.k]+(s.photo?" · рисунок по фото":s.auto?" · типовой рисунок":"")+" · "+CF[s.cf]+(s.cnote?" ("+s.cnote+")":"");nm.append(sm);
    const r=document.createElement("div");r.className="row";
    const btn=(t,l,f,cls)=>{const b=document.createElement("button");b.textContent=t;b.setAttribute("aria-label",l);b.title=l;if(cls)b.className=cls;b.onclick=e=>{e.stopPropagation();f()};r.append(b)};
    btn("Заменить","Заменить трафарет",()=>{sel=i;replaceIdx=i;$("replaceBanner").hidden=false;render()});
    if(s.keyId)btn("Брелок","Заменить на брелок этой доски",()=>{sel=i;replaceIdx=i;pick(byId[s.keyId])});
    btn("↻ 90°","Повернуть на 90°",()=>rotate(i),"ico");
    btn("←","Влево",()=>nudge(i,-1,0),"ico");btn("↑","Вверх",()=>nudge(i,0,-1),"ico");btn("↓","Вниз",()=>nudge(i,0,1),"ico");btn("→","Вправо",()=>nudge(i,1,0),"ico");
    btn("✕","Убрать с листа",()=>{snap();sh.items.splice(i,1);sel=0;render()},"ico");
    d.append(nm,r);d.onclick=()=>{sel=i;render()};box0.append(d)})}
function nudge(i,dx,dy){const sh=sheet(),it={...sh.items[i],c:sh.items[i].c+dx,r:sh.items[i].r+dy};sel=i;
  if(!inField(it)||overlaps(sh,it,i)){toast("Сюда не встаёт: край поля или соседняя доска");return render()}snap();sh.items[i]=it;render()}
function rotate(i){const sh=sheet(),st=S.settings,it={...sh.items[i],rot:((sh.items[i].rot||0)+1)%4};sel=i;const b=box(it);
  it.c=Math.max(0,Math.min(st.cols-b.w,it.c));it.r=Math.max(0,Math.min(st.rows-b.h,it.r));
  if(overlaps(sh,it,i)){const sp=findSpotRot(sh,it,i);if(sp)Object.assign(it,sp);else toast("Повёрнуто, но доска накладывается на соседнюю: подвиньте её")}snap();sh.items[i]=it;render()}
function findSpotRot(sh,it,skip){const st=S.settings,b=box(it);for(let r=0;r+b.h<=st.rows;r++)for(let c=0;c+b.w<=st.cols;c++){const t={...it,c,r};if(!overlaps(sh,t,skip))return{c,r}}return null}
function renderLegend(tl){const L=$("legend");L.textContent="";const sh=sheet();
  if(!tl.length){const d=document.createElement("div");d.className="note";d.textContent="Цвета появятся, когда на листе будет трафарет.";L.append(d)}
  const back={};sh.items.forEach(it=>cellsOf(it).forEach(c=>{const e=eff(sh,c.col);(back[e]=back[e]||new Set()).add(c.col)}));
  tl.forEach(t=>{const row=document.createElement("div");row.className="lg";const h=PAL[t.code].hex;
    const dot=document.createElement("span");dot.className="dot";dot.style.background=h;dot.style.color=lum(h)<125?"#fff":"#000";dot.textContent=t.sym;
    const nm=document.createElement("span");nm.className="nm2";nm.textContent=window.nm(t.code);const sw0=[...(back[t.code]||[])].filter(o=>sh.swap[o]||S.gswap[o]);
    if(sw0.length){const s=document.createElement("s");s.textContent=" вместо "+sw0.map(o=>cd(conv(o))).join(", ");nm.append(s)}
    const cnt=document.createElement("span");cnt.className="cnt";cnt.textContent=t.n+" шт.";
    const b=document.createElement("button");b.textContent="Заменить";b.onclick=()=>openPicker(t.code,back[t.code]);
    row.append(dot,nm,cnt,b);L.append(row)});
  const tot=document.createElement("div");tot.className="note";tot.textContent=tl.length?"Всего на листе: "+tl.reduce((a,t)=>a+t.n,0)+" бусин, цветов: "+tl.length:"";L.append(tot)}
function openPicker(code,origs,role){pickColor={code,origs:origs?[...origs]:[code],role};document.querySelectorAll('#picker .row')[0].hidden=!!role;$('pkReset').hidden=!!role;$("picker").hidden=false;$("pkTitle").textContent=role?ROLE[role]+": выберите цвет вместо "+nm(code):"Чем заменить "+nm(code)+"?";
  const sw=$("swatches"),cur=S.settings.palette||"artkal";if(sw.dataset.set!==cur){sw.textContent="";sw.dataset.set=cur}if(!sw.childElementCount)Object.keys(PAL).filter(c=>PAL[c].set===cur).forEach(c=>{const b=document.createElement("button");b.className="sw";b.style.background=PAL[c].hex;b.title=nm(c);b.setAttribute("aria-label",nm(c));b.onclick=()=>applySwap(c);sw.append(b)});
  $("picker").scrollIntoView({block:"nearest",behavior:"smooth"})}
function applySwap(to){if(!pickColor)return;snap();if(pickColor.role){const it=sheet().items[sel];if(it){it.cw={...rolesOf(it),[pickColor.role]:to};toast(ROLE[pickColor.role]+": "+nm(to))}pickColor=null;$("picker").hidden=true;return render()}const tgt=$("scAll").checked?S.gswap:sheet().swap;
  pickColor.origs.forEach(o=>{if(o===to)delete tgt[o];else tgt[o]=to});toast(cd(pickColor.code)+" → "+nm(to));pickColor=null;$("picker").hidden=true;render()}
$("pkReset").onclick=()=>{if(!pickColor)return;snap();pickColor.origs.forEach(o=>{delete sheet().swap[o];delete S.gswap[o]});pickColor=null;$("picker").hidden=true;render()};
$("pkClose").onclick=()=>{pickColor=null;$("picker").hidden=true};

/* ---------- расцветки ---------- */
const ROLE={rail:"Кант",deck:"Дека",pad:"Пэд",acc:"Акцент",acc2:"Акцент 2"};
let colorways=[];
function seriesOf(s){return s.b+" "+s.m}
function renderCw(){const it=sheet().items[sel],box0=$("cwRoles");box0.textContent="";
  ["cwApply","cwApplyAll","cwSave"].forEach(id=>$(id).disabled=!it);
  if(!it){$("cwFor").textContent="Выберите доску на листе."}else{const s=byId[it.s],ro=rolesOf(it);$("cwFor").textContent=seriesOf(s)+(it.cw?" · своя расцветка":" · расцветка из каталога");
    Object.keys(ROLE).filter(r=>s.used.has(r)).forEach(r=>{const b=document.createElement("button"),d=document.createElement("span");d.className="dot";d.style.background=PAL[conv(ro[r])].hex;d.style.display="inline-grid";d.style.verticalAlign="middle";d.style.marginRight="6px";
      b.append(d,document.createTextNode(ROLE[r]+" "+cd(conv(ro[r]))));b.title="Сменить цвет: "+ROLE[r];b.onclick=()=>openPicker(conv(ro[r]),null,r);box0.append(b)})}
  const sl=$("cwSel"),keep=sl.value;sl.textContent="";const o0=document.createElement("option");o0.value="";o0.textContent="Из каталога";sl.append(o0);
  colorways.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.name;sl.append(o)});sl.value=keep;if(sl.value!==keep)sl.value="";
  $("cwDel").disabled=!sl.value}
function cwPicked(){const id=$("cwSel").value;if(!id)return null;const c=colorways.find(x=>x.id===id);return c?{...c.roles}:null}
$("cwSel").onchange=()=>{const c=colorways.find(x=>x.id===$("cwSel").value);$("cwName").value=c?c.name:"";$("cwDel").disabled=!c};
$("cwApply").onclick=()=>{const it=sheet().items[sel];if(!it)return;snap();const r=cwPicked();if(r)it.cw=r;else delete it.cw;render();toast("Расцветка применена к доске")};
$("cwApplyAll").onclick=()=>{const it=sheet().items[sel];if(!it)return;snap();const key=seriesOf(byId[it.s]),r=cwPicked();let n=0;
  S.sheets.forEach(sh=>sh.items.forEach(x=>{if(seriesOf(byId[x.s])===key){if(r)x.cw={...r};else delete x.cw;n++}}));render();toast("Расцветка применена: досок "+n+" («"+key+"», все листы)")};
function lsCw(){try{return JSON.parse(localStorage.getItem("sup-mosaic-colorways")||"[]")}catch(e){return[]}}
$("cwSave").onclick=async()=>{const it=sheet().items[sel],name=$("cwName").value.trim();if(!it)return;if(!name){toast("Введите название расцветки");$("cwName").focus();return}
  const ex=colorways.find(c=>c.name===name),id=ex?ex.id:"c_"+Date.now().toString(36),rec={kind:"colorway",name,roles:{...rolesOf(it)},saved:new Date().toISOString()};
  try{if(db&&uid)await db.collection("data/users/"+uid).doc(id).set(rec);else{const l=lsCw().filter(c=>c.id!==id);l.push({id,...rec});localStorage.setItem("sup-mosaic-colorways",JSON.stringify(l))}
    await loadProfiles();$("cwSel").value=id;$("cwDel").disabled=false;toast(ex?"Расцветка «"+name+"» обновлена":"Расцветка «"+name+"» сохранена")}catch(e){toast("Не удалось сохранить расцветку: "+(e&&e.message||"хранилище недоступно"))}};
$("cwDel").onclick=async()=>{const id=$("cwSel").value;if(!id)return;
  try{if(db&&uid)await db.collection("data/users/"+uid).doc(id).delete();else localStorage.setItem("sup-mosaic-colorways",JSON.stringify(lsCw().filter(c=>c.id!==id)));
    $("cwName").value="";await loadProfiles();toast("Расцветка удалена. Доски на листах не изменились")}catch(e){toast("Не удалось удалить расцветку")}};

/* ---------- каталог ---------- */
let brand="",year="",onlyKey=false,onlyPhoto=false;
function thumb(s){const k=3,TW=Math.max(9,s.w),c=document.createElement("canvas");c.width=TW*k+4;c.height=29*k+4;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
  s.g.forEach((row,i)=>{const off=(TW-row.length)/2;row.forEach((role,j)=>{if(!role)return;const col=s.roles[roleKey(role)];x.fillStyle=PAL[col].hex;x.beginPath();x.arc(2+(off+j+.5)*k,2+(Math.floor((29-s.n)/2)+i+.5)*k,k/2,0,7);x.fill();
    if(lum(PAL[col].hex)>225){x.strokeStyle="#999";x.lineWidth=.5;x.stroke()}})});c.style.width=(c.width)+"px";return c}
function renderLib(){const q=$("q").value.trim().toLowerCase(),ul=$("lib");ul.textContent="";
  const list=ST.filter(s=>(!onlyKey||s.key)&&(!onlyPhoto||s.photo)&&(!brand||s.b===brand)&&(!year||s.y===year)&&(!q||(s.b+" "+s.m+" "+s.y+" "+s.sz.join(" ")+" "+KIND[s.k]).toLowerCase().includes(q)));
  $("libCount").textContent=list.length+" из "+ST.length;
  list.forEach(s=>{const li=document.createElement("li");li.tabIndex=0;li.setAttribute("role","button");li.title="Положить на лист";
    const t=document.createElement("div");t.className="t";const b=document.createElement("b");b.textContent=s.b;const m=document.createTextNode(s.m);const sp=document.createElement("span");sp.textContent=" "+s.n+"×"+s.w+(s.y&&!s.m.includes(s.y)?" · "+s.y:"")+(s.photo?" · по фото":s.auto?" · типовой":"")+(s.cf==="approx"||s.cf==="photo?"?" · ≈ цвета":"");
    t.append(b,m,sp);li.append(thumb(s),t);const go=()=>pick(s);li.onclick=go;li.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}};ul.append(li)});
  renderLib.list=list}
function pick(s){const sh=sheet();
  if(replaceIdx>=0&&sh.items[replaceIdx]){const old=sh.items[replaceIdx];let it={...old,s:s.id};
    if(!inField(it)||overlaps(sh,it,replaceIdx)){const sp=findSpot(sh,s.id,replaceIdx);if(!sp){toast("Этот трафарет не помещается на место прежнего");return}it=sp}
    snap();sh.items[replaceIdx]=it;sel=replaceIdx;replaceIdx=-1;$("replaceBanner").hidden=true;toast("Заменено: "+s.b+" "+s.m);return render()}
  const sp=findSpot(sh,s.id);snap();
  if(sp){sh.items.push(sp);sel=sh.items.length-1}
  else{const ns={items:[],swap:{}};const p2=findSpot(ns,s.id);if(!p2){undoStack.pop();toast("Трафарет больше поля: увеличьте поле в профиле");return}
    ns.items.push(p2);S.sheets.splice(S.cur+1,0,ns);S.cur++;sel=0;toast("На листе нет места, добавлен новый лист")}
  render()}
$("replaceCancel").onclick=()=>{replaceIdx=-1;$("replaceBanner").hidden=true};
function renderBrands(){const box0=$("brands");box0.textContent="";["",...new Set(ST.map(s=>s.b))].forEach(b=>{const e=document.createElement("button");e.className="chip";e.textContent=b||"Все";e.setAttribute("aria-pressed",String(brand===b));
  e.onclick=()=>{brand=b;year="";renderBrands();renderLib()};box0.append(e)});
  const kb=document.createElement("button");kb.className="chip";kb.textContent="Брелоки";kb.title="Только брелоки";kb.setAttribute("aria-pressed",String(onlyKey));kb.onclick=()=>{onlyKey=!onlyKey;renderBrands();renderLib()};box0.append(kb);
  const pb=document.createElement("button");pb.className="chip";pb.textContent="По фото";pb.title="Только трафареты, нарисованные по фото карточки";pb.setAttribute("aria-pressed",String(onlyPhoto));pb.onclick=()=>{onlyPhoto=!onlyPhoto;renderBrands();renderLib()};box0.append(pb);
  const yb=$("years");yb.textContent="";const ys=[...new Set(ST.filter(s=>(!brand||s.b===brand)&&s.y).map(s=>s.y))].sort();yb.hidden=ys.length<2;
  if(ys.length>1)["",...ys].forEach(y=>{const e=document.createElement("button");e.className="chip";e.textContent=y||"Все годы";e.setAttribute("aria-pressed",String(year===y));e.onclick=()=>{year=y;renderBrands();renderLib()};yb.append(e)})}
$("q").oninput=renderLib;

/* ---------- листы ---------- */
$("prev").onclick=()=>{if(S.cur>0){S.cur--;sel=0;render()}};
$("next").onclick=()=>{if(S.cur<S.sheets.length-1){S.cur++;sel=0;render()}};
$("addSheet").onclick=()=>{snap();S.sheets.splice(S.cur+1,0,{items:[],swap:{}});S.cur++;sel=0;render()};
$("delSheet").onclick=()=>{if(S.sheets.length<2)return;snap();S.sheets.splice(S.cur,1);S.cur=Math.min(S.cur,S.sheets.length-1);sel=0;render();toast("Лист удалён. «Отменить» вернёт его")};
$("onePer").onclick=()=>{const list=renderLib.list||ST;if(!list.length)return;snap();const st=S.settings;
  S.sheets=list.map(s=>{const sh={items:[],swap:{}};const sp=findSpot(sh,s.id);sh.items.push(sp||place0(s,st.cols,st.rows));return sh});S.cur=0;sel=0;render();toast("Листов: "+S.sheets.length+", по одному трафарету на каждом")};
$("undo").onclick=()=>{const j=undoStack.pop();if(!j)return;S=JSON.parse(j);sel=0;syncForm();render()};
window.addEventListener("keydown",e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
  if(d&&sheet().items[sel]&&document.activeElement===$("paper")){e.preventDefault();nudge(sel,d[0],d[1])}});

/* перетаскивание мышью */
(()=>{const cv=$("paper");cv.tabIndex=0;let drag=null;
  const pos=e=>{const r=cv.getBoundingClientRect(),G=render.G,k=render.k;return{c:((e.clientX-r.left)/k-G.fx)/G.p,r:((e.clientY-r.top)/k-G.fy)/G.p}};
  cv.addEventListener("pointerdown",e=>{const p=pos(e),sh=sheet();const i=sh.items.findIndex(it=>{const b=box(it);return p.c>=it.c&&p.c<it.c+b.w&&p.r>=it.r&&p.r<it.r+b.h});
    if(i<0)return;sel=i;if(e.pointerType==="touch"){render();return}drag={i,dc:p.c-sh.items[i].c,dr:p.r-sh.items[i].r,orig:{...sh.items[i]},moved:false};cv.setPointerCapture(e.pointerId);render()});
  cv.addEventListener("pointermove",e=>{if(!drag)return;const p=pos(e),sh=sheet(),it=sh.items[drag.i],b=box(it),st=S.settings;
    const c=Math.max(0,Math.min(st.cols-b.w,Math.round(p.c-drag.dc))),r=Math.max(0,Math.min(st.rows-b.h,Math.round(p.r-drag.dr)));
    if(c!==it.c||r!==it.r){if(!drag.moved){snap();drag.moved=true}it.c=c;it.r=r;render()}});
  const end=()=>{if(!drag)return;const sh=sheet();if(drag.moved&&overlaps(sh,sh.items[drag.i],drag.i)){sh.items[drag.i]=drag.orig;undoStack.pop();toast("Доски не должны накладываться")}drag=null;render()};
  cv.addEventListener("pointerup",end);cv.addEventListener("pointercancel",end)})();

