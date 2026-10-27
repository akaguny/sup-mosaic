"use strict";
/* Каталог трафаретов. Данные — data/colors.json (K), data/art.json (ART), data/catalog.json, data/rename.json.
   Запись каталога: {brand, model, kind, sizes:[[длина, ширина″]], colors:{rail,deck,pad,acc,acc2?}, style, year}.
   style — набор признаков типового трафарета ("band bungee", "band spine", …) или "art:<ключ ART>" для рисунка по фото.
   ART[ключ] = {photo, only?, fallback?, grids:{"NxW":[строки от носа к хвосту]}}; символы: r кант, d дека, p пэд,
   a акцент, b акцент 2, o бусина под кольцо, . пусто. only — брелок со своей сеткой и подписью размера. */
const K=DATA.colors,ART=DATA.art,RENAME=DATA.rename;
const kc=x=>K[x]||x;  /* цвет в каталоге: короткий ключ K или код Artkal S */
/* старые id трафаретов → новые, чтобы сохранённые листы и профили открывались после переименования */
function alias(id){for(const[a,b]of RENAME)if(id&&id.startsWith(a))return b+id.slice(a.length);return id}
function fixIds(sheets){(sheets||[]).forEach(sh=>(sh.items||[]).forEach(it=>it.s=alias(it.s)))}

const PROF={allround:[.30,.60,.72,.62],touring:[.42,.85,.68,.50],race:[.40,.95,.60,.50],surf:[.36,.80,.55,.15],yoga:[.20,.50,.80,.75],fishing:[.28,.55,.75,.78]};
const KIND={allround:"прогулочная",touring:"туринг",race:"гоночная",surf:"сёрф",yoga:"йога",fishing:"рыбалка"};
function inches(s){const[f,i]=s.split("'");return +f*12+(+i||0)}
function dims(L,W){const Li=inches(L),n=Math.min(29,Math.max(14,Math.round(Li/5.8)));return[n,Math.min(9,Math.max(3,Math.floor(W/(Li/n)+.5)))]}
function shape(kind,n,w){const[tn,p,tt,tf]=PROF[kind],rows=[];for(let i=0;i<n;i++){const t=(i+.5)/n;let f=1;
  if(t<tn)f=Math.pow(Math.sin(Math.PI/2*t/tn),p);else if(t>tt)f=1-(1-tf)*Math.pow((t-tt)/(1-tt),2);
  rows.push(Math.max(w-2*Math.floor((w-w*f)/2+.5),w%2?1:2))}return rows}
function makeGrid(kind,n,w,st){const rows=shape(kind,n,w),g=[],ps=Math.floor(n*.40),pe=Math.floor(n*.88),has=s=>st.includes(s);
  rows.forEach((c,i)=>{const row=[];for(let j=0;j<c;j++){let col;const edge=j===0||j===c-1||i===0||i===n-1;
    if(c>2&&edge||c<=2&&(i<2||i>n-2))col="rail";else if(c<=2)col="deck";else{
      col=i>=ps&&i<pe?"pad":"deck";const mid=c%2?j===(c-1)/2:(j===c/2-1||j===c/2);
      if(has("band")&&i===ps-1)col="acc";if(has("band2")&&(i===ps-1||i===pe))col="acc";
      if(has("center")&&mid&&i>=ps&&i<pe)col="acc";if(has("spine")&&mid)col="acc";
      if(has("dots")&&i<ps-1&&(i+j)%2===0)col="acc";if(has("bungee")&&(i===ps-5||i===ps-3))col="acc"}
    row.push(col)}g.push(row)});return g}
const ARTROLE={r:"rail",d:"deck",p:"pad",a:"acc",b:"acc2",o:"ring"};
function artGrid(rows){return(Array.isArray(rows)?rows:rows.split("|")).map(row=>[...row].map(ch=>ARTROLE[ch]||null))}
const roleKey=r=>r==="ring"?"rail":r;
const ST=[];
for(const e of DATA.catalog){const{brand:b,model:m,kind:k,sizes=[],colors:c,style:sty="band",year:y}=e,seen=new Map();
  sizes.forEach(([L,W])=>{const key=dims(L,W).join("x");if(!seen.has(key))seen.set(key,[]);seen.get(key).push(L+'"x'+W+'"')});
  const art=sty.startsWith("art:")?ART[sty.slice(4)]:null;
  if(sty.startsWith("art:")&&!art)console.warn("SUP-мозаика: нет рисунка "+sty+" для "+b+" "+m);
  if(art&&art.only)Object.entries(art.only).forEach(([key,label])=>seen.set(key,[label]));
  seen.forEach((sz,key)=>{const[n,w]=key.split("x").map(Number),pic=art&&art.grids&&art.grids[key];
    const g=pic?artGrid(pic):makeGrid(k,n,w,(art?art.fallback||"band":sty).split(" "));
    ST.push({id:(b+"|"+m+"|"+key).replace(/\s+/g,"_"),b,m,k,n,w,sz,y:y||"",photo:!!pic,key:!!(art&&art.only),cf:e.colorsFrom||"approx",cnote:e.colorsNote||"",
      roles:{rail:kc(c.rail),deck:kc(c.deck),pad:kc(c.pad),acc:kc(c.acc),acc2:kc(c.acc2||c.acc)},used:new Set(g.flat().filter(Boolean).map(roleKey)),g})})}
/* Брелок у каждой доски. Поле keychain в записи каталога — модель брелока по фото того же бренда.
   Если его нет, строится типовой брелок: ширина по ширине доски (до 26″ — 5, 27–29″ — 7, 30–32″ — 9, от 33″ — 11 бусин),
   длина по типу (race 21, touring 19, allround 17), узор — те же признаки style, что у полноразмерного трафарета.
   Происхождение цветов (colorsFrom): photo — с фото карточки, keychain — как у брелока по фото, photo? — фото неполное, approx — фото нет. */
const CF={photo:"цвета по фото",keychain:"цвета по фото (как у брелока)","photo?":"цвета по неполному фото",approx:"цвета приблизительные — нет фото"};
const KEY_ROWS={race:21,touring:19,allround:17,surf:15,yoga:17,fishing:17};
const keyWidth=W=>W<=26?5:W<=29?7:W<=32?9:11,cm=v=>String(v*.5).replace(".",",");
for(const e of DATA.catalog){if(!e.sizes||!e.sizes.length||e.keychain)continue;
  const ws=e.sizes.map(s=>s[1]).sort((a,b)=>a-b),W=ws[(ws.length-1)>>1],w=keyWidth(W),n=KEY_ROWS[e.kind]||17;
  const st=(e.style||"band").startsWith("art:")?((ART[e.style.slice(4)]||{}).fallback||"band"):(e.style||"band");
  const g=makeGrid(e.kind,n,w,st.split(" ")),last=g[n-1];last[(last.length-1)>>1]="ring";
  const c=e.colors,m=e.model+" · брелок";
  ST.push({id:(e.brand+"|"+m+"|"+n+"x"+w).replace(/\s+/g,"_"),b:e.brand,m,k:e.kind,n,w,sz:["типовой · "+W+"″ → "+cm(n)+"×"+cm(w)+" см на midi"],y:e.year||"",
    photo:false,key:true,auto:true,full:e.model,cf:e.colorsFrom||"approx",cnote:e.colorsNote||"",roles:{rail:kc(c.rail),deck:kc(c.deck),pad:kc(c.pad),acc:kc(c.acc),acc2:kc(c.acc2||c.acc)},used:new Set(g.flat().filter(Boolean).map(roleKey)),g})}
/* у полноразмерного трафарета — ссылка на его брелок (кнопка «Брелок» на листе) */
const CAT=Object.fromEntries(DATA.catalog.map(e=>[e.brand+"|"+e.model,e]));
ST.forEach(s=>{if(s.key)return;const e=CAT[s.b+"|"+s.m];if(!e)return;
  const t=e.keychain?ST.find(x=>x.key&&x.b===s.b&&x.m===e.keychain):ST.find(x=>x.auto&&x.b===s.b&&x.full===s.m);if(t)s.keyId=t.id});
/* Словарь без прототипа: id вида "__proto__"/"constructor" не должны находить унаследованные свойства. */
const byId=Object.assign(Object.create(null),Object.fromEntries(ST.map(s=>[s.id,s])));
