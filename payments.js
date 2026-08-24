// Planned payment UX: partial payments, prior-paid marks, date-first rows
(function(){
  function paidAmount(r,date){
    const v=state.paidRecurring?.[occurrenceKey(r,date)];
    if(v===true)return Number(r.amount)||0;
    return Math.max(0,Number(v)||0);
  }

  window.occurrences=function(from,to){
    const out=[];const start=parse(state.startDate||'2020-01-01');let a=from>start?from:start;
    for(const r of state.recurring||[]){if(r.enabled===false||r.disabled)continue;
      const pushOccurrence=(ds)=>{
        const paid=paidAmount(r,ds),total=Number(r.amount)||0,remaining=Math.max(0,total-paid);
        if(remaining>0)out.push({...r,date:ds,virtual:true,totalAmount:total,paidAmount:paid,amount:remaining});
      };
      if(r.freq==='weekly'){
        let d=new Date(a);d.setDate(d.getDate()+((r.weekday-d.getDay()+7)%7));
        while(d<=to){pushOccurrence(ymd(d));d=addDays(d,7)}
      }else{
        let cur=new Date(a.getFullYear(),a.getMonth(),1),endM=new Date(to.getFullYear(),to.getMonth(),1);
        while(cur<=endM){
          const last=new Date(cur.getFullYear(),cur.getMonth()+1,0).getDate();
          const ds=ymd(new Date(cur.getFullYear(),cur.getMonth(),Math.min(r.day||1,last))),dd=parse(ds);
          if(dd>=a&&dd<=to)pushOccurrence(ds);
          cur.setMonth(cur.getMonth()+1)
        }
      }
    }
    return out.sort((x,y)=>x.date.localeCompare(y.date)||(x.type==='income'?-1:1));
  };

  window.planRow=function(x){
    const c=cat(x.type,x.cat),paid=Number(x.paidAmount)||0,total=Number(x.totalAmount)||Number(x.amount)||0;
    const progress=paid>0?` · оплачено ${rub(paid)} из ${rub(total)}`:'';
    return `<button class="row plan-row" data-act="plan-payment" data-id="${x.id}" data-date="${x.date}">
      <div class="plan-date"><div class="plan-day">${parse(x.date).getDate()}</div><div class="plan-month">${parse(x.date).toLocaleDateString('ru-RU',{month:'short'}).replace('.','')}</div></div>
      <div class="row-main"><div class="plan-main-amt">${x.type==='income'?'+':'−'}${rub(x.amount)}</div><div class="row-sub">${esc(x.name)}${progress}</div></div>
      <div class="plan-chevron">›</div>
    </button>`;
  };

  const baseModal=window.modal;
  window.modal=function(){
    if(ui.modal?.type==='planpay'){
      const m=ui.modal,r=state.recurring.find(x=>x.id===m.id);if(!r)return'';
      const paid=paidAmount(r,m.date),remaining=Math.max(0,(Number(r.amount)||0)-paid);
      const title=r.type==='income'?'Поступление':'Платёж';
      const nowLabel=r.type==='income'?'ПОЛУЧИЛ СЕЙЧАС':'ОПЛАТИЛ СЕЙЧАС';
      const priorLabel=r.type==='income'?'ПОЛУЧЕНО РАНЬШЕ':'ОПЛАЧЕНО РАНЬШЕ';
      return shell(title,`${fmtDate(m.date)} · ${r.name} · осталось ${rub(remaining)}`,
        `<div class="field"><div class="label">Сумма</div><input id="planAmount" class="input amount-input" inputmode="decimal" value="${remaining}"></div>
         ${paid>0?`<div class="notice">Уже учтено: <b>${rub(paid)}</b> из ${rub(r.amount)}</div>`:''}
         <button class="btn" data-act="save-plan-payment" data-mode="now" data-id="${r.id}" data-date="${m.date}">${nowLabel}</button>
         <button class="btn secondary" data-act="save-plan-payment" data-mode="prior" data-id="${r.id}" data-date="${m.date}">${priorLabel}</button>
         <div class="sheet-sub" style="margin-top:10px">«Сейчас» изменит фактический баланс. «Раньше» только уменьшит остаток по обязательству — удобно после сверки баланса.</div>`);
    }
    return baseModal();
  };

  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-act]');if(!a)return;
    if(a.dataset.act==='plan-payment'){
      e.preventDefault();ui.modal={type:'planpay',id:a.dataset.id,date:a.dataset.date};render();return;
    }
    if(a.dataset.act==='save-plan-payment'){
      e.preventDefault();
      const r=state.recurring.find(x=>x.id===a.dataset.id);if(!r)return;
      const oldPaid=paidAmount(r,a.dataset.date),remain=Math.max(0,(Number(r.amount)||0)-oldPaid);
      const amt=Math.min(remain,Math.max(0,Number(document.getElementById('planAmount')?.value)||0));if(!amt)return;
      state.paidRecurring[occurrenceKey(r,a.dataset.date)]=oldPaid+amt;
      if(a.dataset.mode==='now')addTransaction({type:r.type,category:r.cat,amount:amt,date:today(),note:r.name});
      ui.modal=null;save();
    }
  },true);

  render();
})();