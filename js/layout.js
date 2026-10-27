"use strict";
/* ---------- раскладка листа, мм ---------- */
function geom(){const st=S.settings;let[W,H]=PAPER[st.paper];if(st.land)[W,H]=[H,W];const p=st.pitch,m=st.margin,head=13,foot=9;
  const fw=st.cols*p,fh=st.rows*p,fx=(W-fw)/2,fy=m+head;
  return{W,H,p,m,fx,fy,fw,fh,head,foot,fits:fx>=m-0.01&&fy+fh<=H-m-foot+0.01}}
function slots(G){const out=[],gap=3,p=G.p,add=(x0,y0,x1,y1)=>{const nc=Math.floor((x1-x0)/p),nr=Math.floor((y1-y0)/p);if(nc<1||nr<1)return;
  const ox=x0+((x1-x0)-nc*p)/2;for(let r=0;r<nr;r++){const rowS=[];for(let c=0;c<nc;c++)rowS.push({x:ox+c*p+p/2,y:y0+r*p+p/2});out.push(rowS)}};
  add(G.m,G.fy+G.fh+gap,G.W-G.m,G.H-G.m-G.foot);add(G.fx+G.fw+gap,G.fy,G.W-G.m,G.fy+G.fh);add(G.m,G.fy,G.fx-gap,G.fy+G.fh);return out}
function planCells(G,tl){const mode=S.settings.cells;if(mode==="none"||!tl.length)return{mode:"none"};
  const lab=Math.max(3,Math.ceil(11/G.p));
  const tryCells=()=>{const rows=slots(G);let ri=0,ci=0;const groups=[];
    for(const t of tl){let need=t.n,g={t,label:null,cells:[]};
      while(ri<rows.length&&rows[ri].length-ci<lab+1){ri++;ci=0}
      if(ri>=rows.length)return null;g.label=rows[ri].slice(ci,ci+lab);ci+=lab;
      while(need>0){if(ri>=rows.length)return null;if(ci>=rows[ri].length){ri++;ci=0;continue}g.cells.push(rows[ri][ci++]);need--}
      ci++;groups.push(g)}return groups};
  if(mode==="auto"||mode==="cells"){const g=tryCells();if(g)return{mode:"cells",groups:g};return{...boxesPlan(G,tl),fallback:true}}
  return boxesPlan(G,tl)}
function boxesPlan(G,tl){const gap=3,lab=5,regs=[[G.m,G.fy+G.fh+gap,G.W-G.m,G.H-G.m-G.foot],[G.fx+G.fw+gap,G.fy,G.W-G.m,G.fy+G.fh],[G.m,G.fy,G.fx-gap,G.fy+G.fh]];
  const want=Math.max(10,Math.min(80,S.settings.box||25));
  for(let size=want;size>=8;size--){const out=[];regs.forEach(([x0,y0,x1,y1])=>{const cw=size+2,ch=size+lab,nc=Math.floor((x1-x0+2)/cw),nr=Math.floor((y1-y0)/ch);if(nc<1||nr<1)return;
      const ox=x0+((x1-x0)-(nc*cw-2))/2;for(let r=0;r<nr;r++)for(let c=0;c<nc;c++)out.push({x:ox+c*cw,y:y0+r*ch+lab,size})});
    if(out.length>=tl.length)return{mode:"boxes",shrunk:size<want?size:0,boxes:tl.map((t,i)=>({t,...out[i]}))}}
  return{mode:"boxes",over:true,boxes:[]}}

