function addTransaction(f){state.transactions.push({id:uid('t'),type:f.type,category:f.category,amount:Math.abs(Number(f.amount)||0),date:f.date||today(),note:f.note||''})}
function suggestedAllocations(t){if(t.type!=='income')return[];const a=[];if(state.settings.autoSuggestPaySelf&&state.settings.paySelfPercent>0)a.push({fund:'reserve',amount:Math.round(t.amount*state.settings.paySelfPercent/100),label:`${state.settings.paySelfPercent}% себе`});if(t.category==='salary'&&state.settings.businessSalary)a.push({fund:'business',amount:state.settings.businessSalary,label:'в бизнес с зарплаты'});if(t.category==='pension'&&state.settings.businessPension)a.push({fund:'business',amount:state.settings.businessPension,label:'в бизнес с пенсии'});return a.filter(x=>x.amount>0)}
function showAllocation(t){const arr=suggestedAllocations(t),total=arr.reduce((s,x)=>s+x.amount,0);if(!arr.length||total>t.amount)return;document.getElementById('app').insertAdjacentHTML('beforeend',shell('Распределить доход',`Доход ${rub(t.amount)}. Рекомендации можно принять одним нажатием.`,`<div class="card">${arr.map(x=>`<div class="row"><div class="row-main"><div class="row-title">${esc(x.label)}</div><div class="row-sub">${x.fund==='reserve'?'заначка':'бизнес'}</div></div><div class="row-amt in">${rub(x.amount)}</div></div>`).join('')}</div><button class="btn" data-act="apply-allocation" data-tx="${t.id}">РАСПРЕДЕЛИТЬ ${rub(total)}</button><button class="btn secondary" data-act="close-allocation">НЕ СЕЙЧАС</button>`))}
async function syncDown(){if(!GAS_URL)return;ui.syncing=true;render();try{const r=await fetch(GAS_URL+'?action=list'),d=await r.json();if(d.ok&&d.state){state=migrate(d.state);state.lastSync=Date.now();saveLocal();ui.syncStatus='ok'}}catch(e){ui.syncStatus='offline'}finally{ui.syncing=false;render()}}
let syncTimer;function syncUp(){if(!GAS_URL)return;clearTimeout(syncTimer);syncTimer=setTimeout(async()=>{try{ui.syncing=true;render();await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'save',state})});state.lastSync=Date.now();saveLocal();ui.syncStatus='ok'}catch(e){ui.syncStatus='offline'}finally{ui.syncing=false;render()}},700)}
function close(){ui.modal=null;render()}
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-tab]');if(tab){ui.tab=tab.dataset.tab;render();return}
 const f=e.target.closest('[data-filter]');if(f){ui.history=f.dataset.filter;render();return}
 const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
 if(act==='close-overlay'&&e.target===a)close();
 if(act==='close-allocation'){a.closest('.overlay')?.remove()}
 if(act==='add'){ui.txType='expense';ui.modal={type:'tx'};render()}
 if(act==='tx-type'){ui.txType=a.dataset.type;ui.modal={type:'tx'};render()}
 if(act==='save-tx'){
   const amount=Number(document.getElementById('txAmount').value);if(!(amount>0))return;
   const data={type:ui.txType,category:document.getElementById('txCat').value,amount,date:document.getElementById('txDate').value,note:document.getElementById('txNote').value};
   if(a.dataset.id){const t=state.transactions.find(x=>x.id===a.dataset.id);if(t)Object.assign(t,data);ui.modal=null;save()}
   else{addTransaction(data);const t=state.transactions.at(-1);ui.modal=null;save();showAllocation(t)}
 }
 if(act==='edit-tx'){const tx=state.transactions.find(x=>x.id===a.dataset.id);if(tx){ui.txType=tx.type;ui.modal={type:'tx',tx};render()}}
 if(act==='delete-tx'){state.transactions=state.transactions.filter(x=>x.id!==a.dataset.id);ui.modal=null;save()}
 if(act==='pay-plan'){const r=state.recurring.find(x=>x.id===a.dataset.id);if(r){state.paidRecurring[occurrenceKey(r,a.dataset.date)]=true;addTransaction({type:r.type,category:r.cat,amount:r.amount,date:a.dataset.date,note:r.name});save()}}
 if(act==='fund'){ui.modal={type:'fund',fund:a.dataset.fund};render()}
 if(act==='fund-mode'){document.getElementById('fundMode').value=a.dataset.mode;a.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===a))}
 if(act==='save-fund'){const amt=Math.abs(Number(document.getElementById('fundAmount').value)||0),mode=document.getElementById('fundMode').value,fun=a.dataset.fund;if(!amt)return;if(mode==='in')state.funds[fun]+=amt;else{const x=Math.min(amt,state.funds[fun]);state.funds[fun]-=x;if(fun==='reserve'&&document.getElementById('fundDebt')?.checked)state.selfDebt+=x}ui.modal=null;save()}
 if(act==='add-debt'){ui.modal={type:'debt'};render()}
 if(act==='debt-dir'){document.getElementById('debtDir').value=a.dataset.dir;a.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===a))}
 if(act==='save-debt'){const amount=Math.abs(Number(document.getElementById('debtAmount').value)||0),name=document.getElementById('debtName').value.trim();if(!amount||!name)return;state.debts.push({id:uid('d'),name,amount,direction:document.getElementById('debtDir').value,dueDate:document.getElementById('debtDate').value||null,status:'open'});ui.modal=null;save()}
 if(act==='close-debt'){const d=state.debts.find(x=>x.id===a.dataset.id);if(d){d.status='closed';save()}}
 if(act==='repay-self'){ui.modal={type:'self'};render()}
 if(act==='save-self'){state.selfDebt=Math.max(0,Number(document.getElementById('simpleValue').value)||0);ui.modal=null;save()}
 if(act==='set-balance'){ui.modal={type:'balance'};render()}
 if(act==='save-balance'){const target=Number(document.getElementById('simpleValue').value)||0,delta=target-actualBalance();if(delta!==0)addTransaction({type:delta>0?'income':'expense',category:delta>0?'other_in':'other_out',amount:Math.abs(delta),date:today(),note:'Корректировка баланса'});ui.modal=null;save()}
 if(act==='set-percent'){ui.modal={type:'percent'};render()}
 if(act==='save-percent'){state.settings.paySelfPercent=Math.max(0,Math.min(50,Number(document.getElementById('simpleValue').value)||0));ui.modal=null;save()}
 if(act==='recurring'){ui.modal={type:'recurring'};render()}
 if(act==='toggle-rec'){const r=state.recurring.find(x=>x.id===a.dataset.id);if(r){r.enabled=a.checked;save()}}
 if(act==='sync')syncDown();
 if(act==='install'&&ui.installPrompt){ui.installPrompt.prompt();ui.installPrompt.userChoice.finally(()=>{ui.installPrompt=null;render()})}
 if(act==='apply-allocation'){const tx=state.transactions.find(x=>x.id===a.dataset.tx);if(tx){suggestedAllocations(tx).forEach(x=>state.funds[x.fund]+=x.amount);save()}a.closest('.overlay')?.remove()}
 if(act==='reset'&&confirm('Удалить локальные данные CASHFLOW и начать заново?')){state=fresh();save()}
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();ui.installPrompt=e;render()});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();setTimeout(()=>syncDown(),350);
