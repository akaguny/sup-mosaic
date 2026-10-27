"use strict";
/* Загрузчик. Читает data/*.json в window.DATA и по порядку подключает модули приложения.
   Модули — обычные скрипты с общей глобальной областью: порядок важен (palette → catalog → state → layout → draw → ui → app). */
(async()=>{
  const files=["palettes","colors","art","catalog","rename"];
  try{
    const res=await Promise.all(files.map(f=>fetch("data/"+f+".json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("data/"+f+".json: "+r.status);return r.json()})));
    window.DATA=Object.fromEntries(files.map((f,i)=>[f,res[i]]));
  }catch(e){const d=document.createElement("div");d.className="banner";d.textContent="Не удалось загрузить данные каталога: "+e.message;document.querySelector(".wrap").prepend(d);return}
  for(const m of["palette","catalog","state","layout","draw","ui","app"])
    await new Promise((ok,fail)=>{const s=document.createElement("script");s.src="js/"+m+".js";s.onload=ok;s.onerror=()=>fail(new Error("js/"+m+".js"));document.body.append(s)});
})();
