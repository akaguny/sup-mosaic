"use strict";
/* ---------- рисование: один код для экрана и PDF ---------- */
function canvasPen(ctx,k){return{
  circle(x,y,r,fill,stroke,lw){ctx.beginPath();ctx.arc(x*k,y*k,r*k,0,7);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(.6,lw*k);ctx.stroke()}},
  rect(x,y,w,h,fill,stroke,lw){if(fill){ctx.fillStyle=fill;ctx.fillRect(x*k,y*k,w*k,h*k)}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(.6,lw*k);ctx.strokeRect(x*k,y*k,w*k,h*k)}},
  line(x1,y1,x2,y2,stroke,lw){ctx.beginPath();ctx.moveTo(x1*k,y1*k);ctx.lineTo(x2*k,y2*k);ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(.5,lw*k);ctx.stroke()},
  text(s,x,y,pt,color,align,bold){ctx.font=(bold?"700 ":"400 ")+(pt*.3528*k)+"px Helvetica,Arial,sans-serif";ctx.fillStyle=color;ctx.textAlign=align||"left";ctx.textBaseline="alphabetic";ctx.fillText(s,x*k,y*k)}}}
function pdfPen(doc){return{
  circle(x,y,r,fill,stroke,lw){if(fill)doc.setFillColor(...rgb(fill));if(stroke){doc.setDrawColor(...rgb(stroke));doc.setLineWidth(lw)}doc.circle(x,y,r,fill&&stroke?"FD":fill?"F":"S")},
  rect(x,y,w,h,fill,stroke,lw){if(fill)doc.setFillColor(...rgb(fill));if(stroke){doc.setDrawColor(...rgb(stroke));doc.setLineWidth(lw)}doc.rect(x,y,w,h,fill&&stroke?"FD":fill?"F":"S")},
  line(x1,y1,x2,y2,stroke,lw){doc.setDrawColor(...rgb(stroke));doc.setLineWidth(lw);doc.line(x1,y1,x2,y2)},
  text(s,x,y,pt,color,align,bold){doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(pt);doc.setTextColor(...rgb(color));doc.text(String(s),x,y,{align:align||"left"})}}}
function drawSheet(pen,si,screen){const sh=S.sheets[si],G=geom(),st=S.settings,p=G.p,tl=tally(sh),symOf=Object.fromEntries(tl.map(t=>[t.code,t.sym]));let hasRing=false;
  pen.rect(0,0,G.W,G.H,"#ffffff");
  // шапка
  const names=sh.items.map((it,i)=>{const s=byId[it.s];return(sh.items.length>1?(i+1)+") ":"")+s.b+" "+s.m+"  "+s.sz.join(", ")});
  if(names.length===1){pen.text(byId[sh.items[0].s].b+" "+byId[sh.items[0].s].m,G.m,G.m+4,11,"#000000","left",true);pen.text(byId[sh.items[0].s].sz.join(", "),G.m,G.m+8.5,8,"#333333")}
  else{let line="",y=G.m+3.2;const max=Math.floor((G.W-2*G.m-58)/1.25);const flush=()=>{if(line&&y<G.m+G.head-1){pen.text(line,G.m,y,7,"#000000");y+=3.1}line=""};
    names.forEach(n=>{if((line+"   "+n).length>max)flush();line=line?line+"   "+n:n});flush()}
  pen.text("sheet "+(si+1)+"/"+S.sheets.length+" · "+st.cols+"x"+st.rows+" · "+String(p).replace(".",",")+" mm · "+SETS[st.palette||"artkal"].short,G.W-G.m,G.m+3.2,7,"#444444","right");
  // поле
  if(st.grid){for(let i=0;i<=st.cols;i++)pen.line(G.fx+i*p,G.fy,G.fx+i*p,G.fy+G.fh,"#c8c8c8",.1);for(let i=0;i<=st.rows;i++)pen.line(G.fx,G.fy+i*p,G.fx+G.fw,G.fy+i*p,"#c8c8c8",.1)}
  pen.rect(G.fx,G.fy,G.fw,G.fh,null,"#444444",.3);
  for(let i=29;i<st.cols;i+=29)pen.line(G.fx+i*p,G.fy,G.fx+i*p,G.fy+G.fh,"#444444",.3);
  for(let i=29;i<st.rows;i+=29)pen.line(G.fx,G.fy+i*p,G.fx+G.fw,G.fy+i*p,"#444444",.3);
  sh.items.forEach((it,i)=>{const b=box(it);
    if(screen&&i===sel)pen.rect(G.fx+it.c*p-.6,G.fy+it.r*p-.6,b.w*p+1.2,b.h*p+1.2,"#d9f1f7","#087f9e",.5);
    cellsOf(it).forEach(c=>{const code=eff(sh,c.col),h=PAL[code].hex,x=G.fx+(c.x+.5)*p,y=G.fy+(c.y+.5)*p;
      pen.circle(x,y,p/2-.05*p,h,"#404040",.12);
      if(st.letters)pen.text(symOf[code],x,y+p*.17,p*1.15,lum(h)<125?"#ffffff":"#000000","center",true);
      if(c.ring){pen.circle(x,y,p/2+.12*p,null,"#D50032",.45);hasRing=true}});
    if(sh.items.length>1&&it.r>0)pen.text(String(i+1),G.fx+(it.c+b.w/2)*p,G.fy+it.r*p-.8,7,"#000000","center",true)});
  // ячейки под бусины вне поля
  const plan=planCells(G,tl);
  if(plan.mode==="cells")plan.groups.forEach(g=>{const h=PAL[g.t.code].hex,L=g.label,dk=lum(h)<125;
    pen.circle(L[0].x,L[0].y,p/2-.05*p,h,"#404040",.15);pen.text(g.t.sym,L[0].x,L[0].y+p*.17,p*1.15,dk?"#ffffff":"#000000","center",true);
    const tx=(L[1].x+L[L.length-1].x)/2,fs=Math.min(6,p*1.15);pen.text(cd(g.t.code),tx,L[1].y-.2,fs,"#000000","center",true);pen.text("x"+g.t.n,tx,L[1].y+fs*.36,fs,"#000000","center");
    const ring=lum(h)>215?"#8a8a8a":h;g.cells.forEach(c=>pen.circle(c.x,c.y,p/2-.07*p,st.tint?mix(h,.28):null,ring,.22))});
  if(plan.mode==="boxes")plan.boxes.forEach(b=>{const h=PAL[b.t.code].hex,dk=lum(h)<125,z=b.size,fs=z<16?5:6.5;
    pen.circle(b.x+1.9,b.y-2.4,1.9,h,"#404040",.15);pen.text(b.t.sym,b.x+1.9,b.y-1.75,5,dk?"#ffffff":"#000000","center",true);
    pen.text(cd(b.t.code),b.x+4.6,b.y-1.6,fs,"#000000","left",true);pen.text("x"+b.t.n,b.x+z,b.y-1.6,fs,"#000000","right");
    pen.rect(b.x,b.y,z,z,st.tint?mix(h,.2):null,lum(h)>215?"#8a8a8a":h,.4);
    pen.text(b.t.sym,b.x+z/2,b.y+z/2+z*.16,z*1.3,st.tint?mix(h,.45):"#dddddd","center",true)});
  // контроль масштаба
  const y=G.H-G.m-1.5;pen.line(G.m,y,G.m+50,y,"#000000",.2);for(let i=0;i<=5;i++)pen.line(G.m+i*10,y,G.m+i*10,y-1.6,"#000000",.2);
  pen.text("50 mm · print at 100 %"+(hasRing?"   ·   red circle = keyring bead":""),G.m+52,y,6.5,"#000000");
  return{G,plan,tl}}

