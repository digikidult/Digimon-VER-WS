/* Shared collection progress for both language editions on this browser. */
(()=>{'use strict';
 const key='digikidult-ver-ws-unlocked-v1',ids=new Set(window.GUIDE_DATA.species.map(x=>x.id));
 let unlocked=new Set(),persistent=true,filter='all',message='';
 function load(value){try{const data=JSON.parse(value||'[]');return new Set(Array.isArray(data)?data.filter(id=>ids.has(id)):[]);}catch{return new Set();}}
 try{unlocked=load(localStorage.getItem(key));}catch{persistent=false;}
 const english=document.documentElement.lang==='en';
 const note=()=>persistent?(english?'Saved in this browser · shared with the Chinese guide':'進度儲存在此瀏覽器，與英文版共用'):(english?'Progress cannot be saved in this browser session.':'此瀏覽器目前無法儲存進度。');
 const refresh=()=>window.dispatchEvent(new Event('collectionchange'));
 function save(){try{localStorage.setItem(key,JSON.stringify([...unlocked]));persistent=true;}catch{persistent=false;}}
 function backup(){return {format:'digikidult-ver-ws-collection',version:1,unlocked:[...unlocked].sort((a,b)=>a-b)};}
 function importBackup(text){
  const data=JSON.parse(text);
  if(!data||data.format!=='digikidult-ver-ws-collection'||data.version!==1||!Array.isArray(data.unlocked)||data.unlocked.some(id=>!Number.isInteger(id)||!ids.has(id)))throw Error('Invalid backup');
  if(persistent)try{unlocked=load(localStorage.getItem(key));}catch{persistent=false;}
  for(const id of data.unlocked)unlocked.add(id);
  save();message=english?'Backup imported. Existing ticks have been kept.':'已匯入備份，原有勾選已保留。';
 }
 function update(){
  const count=unlocked.size,total=ids.size,percent=Math.round(count/total*100);
  document.querySelectorAll('[data-collection-count]').forEach(el=>{el.textContent=`${count} / ${total} · ${percent}%`;});
  document.querySelectorAll('[data-collection-progress]').forEach(el=>{el.value=count;});
  document.querySelectorAll('[data-collection-note]').forEach(el=>{el.textContent=note();});
  document.querySelectorAll('[data-unlock]').forEach(el=>{el.checked=unlocked.has(Number(el.dataset.unlock));el.closest('.collection-card').classList.toggle('is-unlocked',el.checked);});
 }
 window.GuideCollection={
  summary(){return `<section class="collection-summary" aria-labelledby="collection-title"><div class="collection-heading"><h3 id="collection-title">${english?'My Digimon collection':'我的數碼暴龍收集進度'}</h3><strong data-collection-count role="status">${unlocked.size} / ${ids.size} · ${Math.round(unlocked.size/ids.size*100)}%</strong></div><progress data-collection-progress max="${ids.size}" value="${unlocked.size}" aria-labelledby="collection-title"></progress><p data-collection-note>${note()}</p><div class="collection-tools"><div class="pills" role="group" aria-label="${english?'Collection status':'收集狀態'}">${[['all',english?'All':'全部'],['unlocked',english?'Unlocked':'已解鎖'],['missing',english?'Missing':'未解鎖']].map(([value,label])=>`<button class="pill ${filter===value?'active':''}" data-collection-filter="${value}" aria-pressed="${filter===value}">${label}</button>`).join('')}</div><div class="collection-backup"><button class="pill" data-collection-export>${english?'Export progress':'匯出進度'}</button><button class="pill" data-collection-import>${english?'Import progress':'匯入進度'}</button><input type="file" id="collection-import" accept=".json,application/json" hidden></div></div><p>${english?'Import adds unlocked Digimon without clearing your existing ticks.':'匯入會合併已解鎖的數碼暴龍，不會清除原有勾選。'}</p><p class="collection-message" role="status">${window.GuideCore.escape(message)}</p></section>`;},
  checkbox(x){return `<label class="unlock-label"><input type="checkbox" data-unlock="${x.id}"${unlocked.has(x.id)?' checked':''} aria-label="${window.GuideCore.escape(x.zh)} — ${english?'Unlocked':'已解鎖'}"><span>${english?'Unlocked':'已解鎖'}</span></label>`;},
  has(id){return unlocked.has(id);},
  matches(id){return filter==='all'||(filter==='unlocked'?unlocked.has(id):!unlocked.has(id));},
  backup,importBackup
 };
 document.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.hasAttribute('data-reset'))filter='all';
  if(el.hasAttribute('data-collection-filter')){filter=el.dataset.collectionFilter;refresh();document.querySelector(`[data-collection-filter="${filter}"]`)?.focus();}
  if(el.hasAttribute('data-collection-export')){
   const url=URL.createObjectURL(new Blob([JSON.stringify(backup(),null,2)],{type:'application/json'}));
   const link=document.createElement('a');link.href=url;link.download='DigiKidult-Ver-WS-collection.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  if(el.hasAttribute('data-collection-import'))document.querySelector('#collection-import').click();
 });
 document.addEventListener('change',async event=>{
  const el=event.target;
  if(el.id==='collection-import'){
   const file=el.files?.[0];if(!file)return;
   try{if(file.size>100000)throw Error('Too large');importBackup(await file.text());}catch{message=english?'Could not import this file. Choose a valid DigiKidult Ver.WS collection backup.':'無法匯入此檔案，請選擇有效的 DigiKidult Ver.WS 收集進度備份。';}
   refresh();return;
  }
  if(!el.matches('[data-unlock]'))return;
  const id=Number(el.dataset.unlock);if(!ids.has(id))return;
  // Merge with the latest saved set so another open tab's ticks are retained.
  if(persistent)try{unlocked=load(localStorage.getItem(key));}catch{persistent=false;}
  if(el.checked)unlocked.add(id);else unlocked.delete(id);
  save();
  update();
  if(filter!=='all')refresh();
 });
 window.addEventListener('storage',event=>{if(event.storageArea===localStorage&&(event.key===key||event.key===null)){unlocked=load(event.newValue);update();refresh();}});
})();
