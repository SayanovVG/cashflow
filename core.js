'use strict';

const GAS_URL='https://script.google.com/macros/s/AKfycbzBLRn7Lzotuwj-F3EqyM89lgIq9JUlfGpt4XRL_nQf4KO19vYsysq1AFdsjxL2LhzL/exec';
const STORAGE_KEY='cashflow.v2';
const VERSION=3;
const rub=n=>`${Math.round(Number(n)||0).toLocaleString('ru-RU')} ₽`;
const signed=n=>(n>=0?'+':'−')+rub(Math.abs(n));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>ymd(new Date());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const uid=(p='x')=>`${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=s=>parse(s).toLocaleDateString('ru-RU',{day:'2-digit',month:'short'}).replace('.','');

const CATS={
 income:[['salary','Зарплата','💼'],['pension','Пенсия','🏛️'],['bonus','Премия','🎯'],['business_in','Бизнес','🟢'],['other_in','Другое','＋']],
 expense:[['food','Питание','🥚'],['alimony','Алименты','👧'],['utilities','ЖКУ','🏠'],['phone','МТС','📱'],['internet','Интернет','🌐'],['dog','Собака','🐕'],['sport','Спорт','🥋'],['transport','Авто','🚗'],['subscriptions','Подписки','◉'],['health','Здоровье','✚'],['other_out','Другое','…']]
};
const cat=(type,id)=>{const x=CATS[type].find(c=>c[0]===id);return x?{id:x[0],name:x[1],ic:x[2]}:{id,name:id,ic:'•'}};

const DEFAULT_RECURRING=[
 {id:'r_salary',name:'Зарплата',type:'income',cat:'salary',amount:14000,freq:'weekly',weekday:5,enabled:true},
 {id:'r_pension',name:'Пенсия',type:'income',cat:'pension',amount:23000,freq:'monthly',day:4,enabled:true},
 {id:'r_bonus',name:'Выплата 20-го',type:'income',cat:'bonus',amount:22000,freq:'monthly',day:20,enabled:true},
 {id:'r_food',name:'Продукты',type:'expense',cat:'food',amount:7000,freq:'weekly',weekday:5,enabled:true},
 {id:'r_alimony',name:'Алименты',type:'expense',cat:'alimony',amount:25000,freq:'monthly',day:31,enabled:true},
 {id:'r_utilities',name:'Квартира / ЖКУ',type:'expense',cat:'utilities',amount:5000,freq:'monthly',day:5,enabled:true},
 {id:'r_phone',name:'МТС',type:'expense',cat:'phone',amount:1400,freq:'monthly',day:10,enabled:true},
 {id:'r_internet',name:'Интернет',type:'expense',cat:'internet',amount:1000,freq:'monthly',day:5,enabled:true},
 {id:'r_dog1',name:'Корм собаке',type:'expense',cat:'dog',amount:1000,freq:'monthly',day:1,enabled:true},
 {id:'r_dog2',name:'Корм собаке',type:'expense',cat:'dog',amount:1000,freq:'monthly',day:11,enabled:true},
 {id:'r_dog3',name:'Корм собаке',type:'expense',cat:'dog',amount:1000,freq:'monthly',day:21,enabled:true},
 {id:'r_sber',name:'СберПрайм',type:'expense',cat:'subscriptions',amount:500,freq:'monthly',day:1,enabled:true},
 {id:'r_vpn',name:'VPN',type:'expense',cat:'subscriptions',amount:180,freq:'monthly',day:1,enabled:true},
 {id:'r_mma',name:'MMA',type:'expense',cat:'sport',amount:4000,freq:'monthly',day:10,enabled:true}
];

function fresh(){return{
 version:VERSION,startBalance:0,startDate:today(),transactions:[],paidRecurring:{},debts:[],
 recurring:structuredClone(DEFAULT_RECURRING),funds:{reserve:0,business:0},selfDebt:0,
 settings:{paySelfPercent:10,autoSuggestPaySelf:true,businessSalary:2000,businessPension:10000},lastSync:null
}}
function migrate(raw){
 const d={...fresh(),...(raw||{})};
 d.settings={...fresh().settings,...(raw?.settings||{})};d.funds={...fresh().funds,...(raw?.funds||{})};
 d.debts=Array.isArray(raw?.debts)?raw.debts:[];d.transactions=Array.isArray(raw?.transactions)?raw.transactions:[];d.paidRecurring=raw?.paidRecurring||{};
 if(!raw||!raw.version||raw.version<VERSION){
   const legacy=Array.isArray(raw?.recurring)?raw.recurring:[];
   const disabled=new Set(legacy.filter(x=>x.disabled||x.enabled===false).map(x=>x.id));
   d.recurring=structuredClone(DEFAULT_RECURRING).map(x=>({...x,enabled:!disabled.has(x.id)}));d.version=VERSION;
 }
 return d;
}
function load(){try{return migrate(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'))}catch{return fresh()}}
let state=load();
let ui={tab:'home',modal:null,txType:'expense',history:'all',syncing:false,syncStatus:'',installPrompt:null};
function saveLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function save(){saveLocal();syncUp();render()}

function occurrenceKey(r,date){return `${r.id}-${date}`}
function occurrences(from,to){
 const out=[];const start=parse(state.startDate||'2020-01-01');let a=from>start?from:start;
 for(const r of state.recurring||[]){if(r.enabled===false||r.disabled)continue;
   if(r.freq==='weekly'){
     let d=new Date(a);d.setDate(d.getDate()+((r.weekday-d.getDay()+7)%7));
     while(d<=to){const ds=ymd(d);if(!state.paidRecurring[occurrenceKey(r,ds)])out.push({...r,date:ds,virtual:true});d=addDays(d,7)}
   }else{
     let cur=new Date(a.getFullYear(),a.getMonth(),1),endM=new Date(to.getFullYear(),to.getMonth(),1);
     while(cur<=endM){const last=new Date(cur.getFullYear(),cur.getMonth()+1,0).getDate(),ds=ymd(new Date(cur.getFullYear(),cur.getMonth(),Math.min(r.day||1,last))),dd=parse(ds);if(dd>=a&&dd<=to&&!state.paidRecurring[occurrenceKey(r,ds)])out.push({...r,date:ds,virtual:true});cur.setMonth(cur.getMonth()+1)}
   }
 }
 return out.sort((x,y)=>x.date.localeCompare(y.date)||(x.type==='income'?-1:1));
}
function actualBalance(){let b=Number(state.startBalance)||0;for(const t of state.transactions)b+=(t.type==='income'?1:-1)*(Number(t.amount)||0);return b}
function nextIncome(){const now=parse(today());return occurrences(now,addDays(now,45)).find(x=>x.type==='income')||null}
function obligationsBeforeNextIncome(){const now=parse(today()),ni=nextIncome();if(!ni)return 0;return occurrences(now,parse(ni.date)).filter(x=>x.type==='expense'&&x.date<ni.date).reduce((s,x)=>s+x.amount,0)}
function available(){return actualBalance()-obligationsBeforeNextIncome()-(state.funds.reserve||0)-(state.funds.business||0)}
function openSelfDebt(){return Number(state.selfDebt)||0}
function debtTotals(){const open=state.debts.filter(d=>d.status!=='closed');return{owe:open.filter(d=>d.direction==='owe').reduce((s,d)=>s+d.amount,0),owed:open.filter(d=>d.direction==='owed').reduce((s,d)=>s+d.amount,0)}}
function monthSummary(){const n=new Date(),a=ymd(new Date(n.getFullYear(),n.getMonth(),1)),b=ymd(new Date(n.getFullYear(),n.getMonth()+1,0)),tx=state.transactions.filter(t=>t.date>=a&&t.date<=b);return{income:tx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),expense:tx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)}}
function forecast(days=30){const n=parse(today()),plans=occurrences(n,addDays(n,days));let bal=actualBalance();const points=[{date:today(),bal}];for(let i=1;i<=days;i++){const ds=ymd(addDays(n,i));for(const p of plans.filter(x=>x.date===ds))bal+=(p.type==='income'?1:-1)*p.amount;points.push({date:ds,bal})}return points}
function forecastSvg(){const pts=forecast(30),vals=pts.map(x=>x.bal),min=Math.min(...vals),max=Math.max(...vals),range=Math.max(1,max-min),w=420,h=124,p=10,xy=pts.map((x,i)=>[p+i*(w-2*p)/(pts.length-1),p+(max-x.bal)*(h-2*p)/range]),path=xy.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');return `<svg viewBox="0 0 ${w} ${h}"><line class="chart-grid" x1="${p}" y1="${h/2}" x2="${w-p}" y2="${h/2}"/><path class="chart-line" d="${path}"/><circle class="chart-dot" cx="${xy.at(-1)[0]}" cy="${xy.at(-1)[1]}" r="4"/><text class="chart-label" x="${p}" y="${h-1}">сегодня</text><text class="chart-label" x="${w-p-42}" y="${h-1}">30 дней</text></svg>`}
