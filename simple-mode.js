// CASHFLOW simple mode: stash stays outside the app.
// Only actual accounts/cash + business fund are tracked. Borrowing from stash is recorded as selfDebt.

available = function(){
  return actualBalance()-obligationsBeforeNextIncome()-(state.funds.business||0);
};

suggestedAllocations = function(t){
  if(t.type!=='income')return[];
  const a=[];
  if(t.category==='salary'&&state.settings.businessSalary)a.push({fund:'business',amount:state.settings.businessSalary,label:'в бизнес с зарплаты'});
  if(t.category==='pension'&&state.settings.businessPension)a.push({fund:'business',amount:state.settings.businessPension,label:'в бизнес с пенсии'});
  return a.filter(x=>x.amount>0);
};

const _home = home;
home = function(){
  let s=_home();
  s=s.replace(`+ (state.funds.reserve||0)`,``);
  s=s.replace(/<div class="metric blue"><div class="lab">Заначка<\/div><div class="val">[\s\S]*?<\/div><div class="hint">не тратить<\/div><\/div>/,'');
  s=s.replace('grid-template-columns:1fr 1fr','grid-template-columns:1fr 1fr');
  return s;
};

funds = function(){
  return `<main class="page"><h1 class="page-title">Фонды</h1><div class="fund-grid" style="grid-template-columns:1fr"><div class="fund business" data-act="fund" data-fund="business"><div class="fund-icon">🚀</div><div class="fund-name">Бизнес</div><div class="fund-value">${rub(state.funds.business)}</div></div></div><section class="section"><div class="notice green">Заначку CASHFLOW не учитывает. Если берёшь из неё деньги — просто укажи сумму как «Долг себе» в разделе долгов. Пока не брал — долг себе 0 ₽.</div></section><section class="section"><div class="card"><div class="setting"><div class="setting-title">С зарплаты → бизнес</div><div class="setting-sub">${rub(state.settings.businessSalary)} с каждой пятничной выплаты</div></div><div class="setting"><div class="setting-title">С пенсии → бизнес</div><div class="setting-sub">${rub(state.settings.businessPension)}</div></div></div></section></main>`;
};

const _settings=settings;
settings=function(){
  let s=_settings();
  s=s.replace(/<div class="setting"><div class="setting-row"><div><div class="setting-title">Заплати себе<\/div>[\s\S]*?<\/div><\/div><\/div>/,'');
  return s;
};

render();