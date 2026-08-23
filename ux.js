// CASHFLOW UX patch: explicit edit affordance and correction help
(function(){
  const oldTxRow = window.txRow;
  window.txRow = function(t){
    const c=cat(t.type,t.category);
    return `<div class="row tx-row" data-act="edit-tx" data-id="${t.id}"><div class="row-icon">${c.ic}</div><div class="row-main"><div class="row-title">${esc(t.note||c.name)}</div><div class="row-sub">${fmtDate(t.date)} · ${c.name}</div></div><div class="tx-side"><div class="row-amt ${t.type==='income'?'in':'out'}">${t.type==='income'?'+':'−'}${rub(t.amount)}</div><button class="tx-more" data-act="edit-tx" data-id="${t.id}" aria-label="Изменить операцию">•••</button></div></div>`;
  };

  const oldHistory = window.history;
  window.history = function(){
    const n=parse(today()),future=occurrences(addDays(n,-1),addDays(n,60)),actual=[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date));
    let items=ui.history==='actual'?actual:ui.history==='plan'?future:[...actual,...future].sort((a,b)=>b.date.localeCompare(a.date));
    return `<main class="page"><h1 class="page-title">Деньги</h1><div class="edit-hint">Ошиблись в записи? Нажмите <b>•••</b> справа — сумму, категорию и дату можно изменить или удалить запись полностью.</div><div class="tabs"><button class="tab ${ui.history==='all'?'active':''}" data-filter="all">ВСЕ</button><button class="tab ${ui.history==='actual'?'active':''}" data-filter="actual">ФАКТ</button><button class="tab ${ui.history==='plan'?'active':''}" data-filter="plan">ПЛАН</button></div><div class="card">${items.length?items.map(x=>x.virtual?planRow(x):txRow(x)).join(''):'<div class="empty">Операций пока нет</div>'}</div></main>`;
  };

  render();
})();
