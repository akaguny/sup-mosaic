"use strict";
/* Состояние: настройки, листы, размещение досок на поле, подсчёт бусин. Черновик — localStorage «sup-mosaic-draft-v3». */
/* ---------- состояние ---------- */
const PAPER={A4:[210,297],A3:[297,420],Letter:[215.9,279.4]};
const DEF={paper:"A4",land:false,margin:8,pitch:5,cols:29,rows:29,cells:"boxes",box:25,palette:"artkal",letters:true,grid:true,tint:true};
const BUILTIN=[
 {name:"A4 · поле 29×29 · midi 5 мм",settings:{...DEF}},
 {name:"A4 · поле 29×29 · mini 2,6 мм",settings:{...DEF,pitch:2.6}},
 {name:"A3 · два поля 58×29 · midi 5 мм",settings:{...DEF,paper:"A3",land:true,cols:58,rows:29}}];
let S={settings:{...DEF},sheets:ST.map(s=>({items:[place0(s)],swap:{}})),gswap:{},cur:0};
let sel=0,replaceIdx=-1,pickColor=null,undoStack=[],profiles=[],activeProfile="b0";
function place0(s,cols=29,rows=29){return{s:s.id,c:Math.max(0,Math.floor((cols-s.w)/2)),r:Math.max(0,Math.floor((rows-s.n)/2)),rot:0}}
const $=id=>document.getElementById(id);
function toast(t){const e=$("toast");e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,2600)}
function snap(){undoStack.push(JSON.stringify(S));if(undoStack.length>30)undoStack.shift()}
function saveDraft(){try{localStorage.setItem("sup-mosaic-draft-v3",JSON.stringify(S))}catch(e){}}
function sheet(){return S.sheets[S.cur]}
function box(it){const s=byId[it.s];return it.rot%2?{w:s.n,h:s.w}:{w:s.w,h:s.n}}
function rolesOf(it){return it.cw?{...byId[it.s].roles,...it.cw}:byId[it.s].roles}
function cellsOf(it){const s=byId[it.s],out=[],ro=rolesOf(it),q=it.rot||0;s.g.forEach((row,i)=>{const off=(s.w-row.length)/2;row.forEach((role,j)=>{if(!role)return;const a=off+j,col=ro[roleKey(role)],ring=role==="ring";
  out.push(q===0?{x:it.c+a,y:it.r+i,col,ring}:q===1?{x:it.c+s.n-1-i,y:it.r+a,col,ring}:q===2?{x:it.c+s.w-1-a,y:it.r+s.n-1-i,col,ring}:{x:it.c+i,y:it.r+s.w-1-a,col,ring})})});return out}
function eff(sh,c){return conv(sh.swap[c]||S.gswap[c]||c)}
function overlaps(sh,it,skip){const a=box(it);return sh.items.some((o,i)=>{if(i===skip)return false;const b=box(o);
  return it.c<o.c+b.w+1&&o.c<it.c+a.w+1&&it.r<o.r+b.h&&o.r<it.r+a.h})}
function inField(it){const b=box(it);return it.c>=0&&it.r>=0&&it.c+b.w<=S.settings.cols&&it.r+b.h<=S.settings.rows}
function findSpot(sh,sid,skip=-1){const st=S.settings;for(const rot of[0,1]){const it={s:sid,c:0,r:0,rot},b=box(it);
  if(b.w>st.cols||b.h>st.rows)continue;const r0=Math.floor((st.rows-b.h)/2);
  for(const r of[r0,...Array.from({length:st.rows-b.h+1},(_,i)=>i)])for(let c=0;c+b.w<=st.cols;c++){it.c=c;it.r=r;if(!overlaps(sh,it,skip))return{...it}}}return null}
function tally(sh){const m=new Map();sh.items.forEach(it=>cellsOf(it).forEach(c=>{const k=eff(sh,c.col);m.set(k,(m.get(k)||0)+1)}));
  return[...m.entries()].sort((a,b)=>b[1]-a[1]).map(([code,n],i)=>({code,n,sym:String.fromCharCode(65+i%26)+(i>25?"'":"")}))}

