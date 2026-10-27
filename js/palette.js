"use strict";
/* Палитры бусин. Данные — data/palettes.json.
   PAL[id] = {name, hex, code, set, odd}; id — код Artkal S («S01») или «набор:код» («hama:H01»).
   conv(id) переводит цвет каталога (Artkal S) в выбранный набор по ближайшему цвету в Lab. */
const PAL={},SETS=DATA.palettes.sets;
for(const[set,list]of Object.entries(DATA.palettes.colors))for(const[c,n,h]of list)
  PAL[set==="artkal"?c:set+":"+c]={name:n,hex:"#"+h,code:c,set,odd:set!=="artkal"&&(/Transparent|Translucent|Clear|Neon|Fluorescent|Glow|Pearl|Metallic/.test(n)||(set==="mard"&&c==="H1"))};
function labOf(hex){let[r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92);
  let x=(r*.4124+g*.3576+b*.1805)/.95047,y=r*.2126+g*.7152+b*.0722,z=(r*.0193+g*.1192+b*.9505)/1.08883;[x,y,z]=[x,y,z].map(v=>v>.008856?Math.cbrt(v):7.787*v+16/116);return[116*y-16,500*(x-y),200*(y-z)]}
const convCache={};
function conv(id){const set=S.settings.palette||"artkal";if(!PAL[id])return"S07";if(PAL[id].set===set)return id;const key=set+">"+id;if(convCache[key])return convCache[key];
  const a=labOf(PAL[id].hex);let best=null,bd=1e9;for(const k in PAL){const p=PAL[k];if(p.set!==set||p.odd)continue;const l=p.lab||(p.lab=labOf(p.hex)),d=(a[0]-l[0])**2+(a[1]-l[1])**2+(a[2]-l[2])**2;if(d<bd){bd=d;best=k}}
  return convCache[key]=best||id}
const cd=id=>PAL[id].code,nm=window.nm=id=>PAL[id].code+(PAL[id].name?" "+PAL[id].name:"");
function rgb(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
function lum(h){const[r,g,b]=rgb(h);return .299*r+.587*g+.114*b}
function mix(h,a){return"#"+rgb(h).map(v=>Math.round(255-(255-v)*a).toString(16).padStart(2,"0")).join("")}
