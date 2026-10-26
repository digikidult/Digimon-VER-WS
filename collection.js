/* Shared collection progress for both language editions on this browser. */
(()=>{'use strict';
 const key='digikidult-ver-ws-unlocked-v1',ids=new Set(window.GUIDE_DATA.species.map(x=>x.id));
 let unlocked=new Set(),persistent=true;
 function load(value){try{const data=JSON.parse(value||'[]');return new Set(Array.isArray(data)?data.filter(id=>ids.has(id)):[]);}catch{return new Set();}}
 try{unlocked=load(localStorage.getItem(key));}catch{persistent=false;}
 const english=document.documentElement.lang==='en';
 const note=()=>persistent?(english?'Saved in this browser · shared with the Chinese guide':'進度儲存在此瀏覽器，與英文版共用'):(english?'Progress cannot be saved in this browser session.':'此瀏覽器目前無法儲存進度。');
 function update(){
  const count=unlocked.size,total=ids.size,percent=Math.round(count/total*100);
  document.querySelectorAll('[data-collection-count]').forEach(el=>{el.textContent=`${count} / ${total} · ${percent}%`;});
  document.querySelectorAll('[data-collection-progress]').forEach(el=>{el.value=count;});
  document.querySelectorAll('[data-collection-note]').forEach(el=>{el.textContent=note();});
  document.querySelectorAll('[data-unlock]').forEach(el=>{el.checked=unlocked.has(Number(el.dataset.unlock));el.closest('.collection-card').classList.toggle('is-unlocked',el.checked);});
 }
 window.GuideCollection={
  summary(){return `<section class="collection-summary" aria-labelledby="collection-title"><div class="collection-heading"><h3 id="collection-title">${english?'My Digimon collection':'我的數碼暴龍收集進度'}</h3><strong data-collection-count role="status">${unlocked.size} / ${ids.size} · ${Math.round(unlocked.size/ids.size*100)}%</strong></div><progress data-collection-progress max="${ids.size}" value="${unlocked.size}" aria-labelledby="collection-title"></progress><p data-collection-note>${note()}</p></section>`;},
  checkbox(x){return `<label class="unlock-label"><input type="checkbox" data-unlock="${x.id}"${unlocked.has(x.id)?' checked':''} aria-label="${window.GuideCore.escape(x.zh)} — ${english?'Unlocked':'已解鎖'}"><span>${english?'Unlocked':'已解鎖'}</span></label>`;},
  has(id){return unlocked.has(id);}
 };
 document.addEventListener('change',event=>{
  const el=event.target;if(!el.matches('[data-unlock]'))return;
  const id=Number(el.dataset.unlock);if(!ids.has(id))return;
  // Merge with the latest saved set so another open tab's ticks are retained.
  if(persistent)try{unlocked=load(localStorage.getItem(key));}catch{persistent=false;}
  if(el.checked)unlocked.add(id);else unlocked.delete(id);
  try{localStorage.setItem(key,JSON.stringify([...unlocked]));persistent=true;}catch{persistent=false;}
  update();
 });
 window.addEventListener('storage',event=>{if(event.storageArea===localStorage&&(event.key===key||event.key===null)){unlocked=load(event.newValue);update();}});
})();
