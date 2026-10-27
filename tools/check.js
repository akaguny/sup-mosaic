// Дымовой тест SUP-мозаики в headless Chromium.
// Запуск: python3 -m http.server 8765 -d <папка проекта> &  NODE_PATH=$(npm root -g) node tools/check.js http://localhost:8765/ [shot.png]
// Ошибки загрузки Google Fonts и jsPDF с CDN в песочнице ожидаемы и не считаются.
const {chromium}=require('playwright');
(async()=>{
  const url=process.argv[2]||'http://localhost:8765/',shot=process.argv[3]||'check.png';
  const b=await chromium.launch(),p=await b.newPage({viewport:{width:1500,height:1250}}),errs=[],warns=[];
  p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{const t=m.text()+(m.location().url||'');if(m.type()==='error'&&!/ERR_TUNNEL|fonts\.g|cdnjs|ERR_NAME|ERR_CONNECTION/.test(t))errs.push('console: '+m.text());if(m.type()==='warning')warns.push(m.text())});
  await p.goto(url);await p.waitForSelector('#lib li',{timeout:10000});
  const total=await p.$eval('#libCount',e=>e.textContent);
  // у каждой полноразмерной доски должен быть брелок
  const noKey=await p.evaluate(()=>ST.filter(s=>!s.key&&!s.keyId).map(s=>s.b+' '+s.m));
  const counts=await p.evaluate(()=>({keychains:ST.filter(s=>s.key).length,byPhoto:ST.filter(s=>s.key&&s.photo).length,auto:ST.filter(s=>s.auto).length}));
  await p.click('#brands >> text=Брелоки');await p.click('#brands >> text=По фото');await p.waitForTimeout(150);
  const shown=await p.$$eval('#lib li',l=>l.length);
  await p.click('#brands >> text=По фото');await p.click('#brands >> text=Брелоки');
  // полноразмерная доска → кнопка «Брелок» меняет её на брелок
  await p.click('#addSheet');await p.fill('#q','ONE Red');await p.waitForTimeout(150);
  await p.click('#lib li >> nth=0');await p.waitForTimeout(150);
  const before=await p.$eval('#items .item .nm',e=>e.firstChild.textContent);
  await p.click('#items .item button:text-is("Брелок")');await p.waitForTimeout(150);
  const after=await p.$eval('#items .item .nm',e=>e.firstChild.textContent);
  const roles=await p.$eval('#cwRoles',e=>e.textContent),legend=await p.$$eval('#legend .lg',l=>l.length);
  await p.screenshot({path:shot});
  if(noKey.length)errs.push('без брелока: '+noKey.join('; '));
  console.log(JSON.stringify({total,...counts,shownByPhoto:shown,swap:[before,after],roles,legendColors:legend,warnings:warns,errors:errs},null,1));
  await b.close();process.exit(errs.length?1:0)})();
