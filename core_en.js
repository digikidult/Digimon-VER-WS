(function(root){
 'use strict';
 const norm=x=>String(x??'').normalize('NFKC').toLowerCase().replace(/\s+/g,'');
 const match=(values,q)=>!norm(q)||values.some(v=>norm(v).includes(norm(q)));
 function score(battles,wins){return battles<15?0:wins>=12?8:wins>=10?4:wins>=6?2:0;}
 function chance(values){
  if(values.length!==4||values.some(x=>!Number.isInteger(x)||x<0))return null;
  const [a,b,c,d]=values;if(a>65535||c>65535||b>Math.min(15,a)||d>Math.min(15,c))return null;
  const rookie=score(a,b),champion=score(c,d);return {rookie,champion,total:rookie+champion,chance:Math.min(1,(rookie+champion)/16)};
 }
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hours=x=>{const m=Math.round(x*60);return `${Math.floor(m/60)}h ${m%60?`${m%60}m`:''}`;};
 const api={norm,match,chance,escape,hours};root.GuideCore=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
