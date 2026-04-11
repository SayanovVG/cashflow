import { useState, useEffect, useRef } from "react";

const C={bg:"#1e1e1e",b2:"#262626",b3:"#2e2e2e",b4:"#363636",ac:"#c27030",gn:"#7a9a6a",rd:"#9a6a60",am:"#b8993a",tx:"#d4d0c8",t2:"#908a7a",t3:"#666058"};
const SH="4px 4px 0 #111";
const FT="system-ui,-apple-system,sans-serif";
const uid=()=>Math.random().toString(36).slice(2,9);
const fm=n=>Math.abs(n).toLocaleString("ru-RU")+" ₽";
const td=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const MR=["ЯНВАРЬ","ФЕВРАЛЬ","МАРТ","АПРЕЛЬ","МАЙ","ИЮНЬ","ИЮЛЬ","АВГУСТ","СЕНТЯБРЬ","ОКТЯБРЬ","НОЯБРЬ","ДЕКАБРЬ"];
const MS=["ЯНВ","ФЕВ","МАР","АПР","МАЙ","ИЮН","ИЮЛ","АВГ","СЕН","ОКТ","НОЯ","ДЕК"];
const WDS=["ВС","ПН","ВТ","СР","ЧТ","ПТ","СБ"];
const EC=["ПРОДУКТЫ","БЕНЗИН","СВЯЗЬ","ИНТЕРНЕТ","КРЕДИТ","ДОЛГ","АРЕНДА","КВАРТПЛАТА","АЛИМЕНТЫ","КОРМ","БЫТ.ХИМИЯ","ТРАНСПОРТ","ЗДОРОВЬЕ","ОДЕЖДА","ПРОЧЕЕ"];
const IC=["ЗАРПЛАТА","ПРЕМИЯ","ПЕНСИЯ","ПОДРАБОТКА","ФРИЛАНС","ПРОЧЕЕ"];
const SK="cf-s1";

// Default entries: repeat=monthly means recurring
const DEF=[
  {id:"s1",type:"income",amount:60000,cat:"ЗАРПЛАТА",desc:"Зарплата",date:"2025-12-10",repeat:"monthly"},
  {id:"s2",type:"income",amount:23000,cat:"ПЕНСИЯ",desc:"Пенсия",date:"2025-12-03",repeat:"monthly"},
  {id:"s3",type:"income",amount:25000,cat:"ПРЕМИЯ",desc:"Премия",date:"2025-12-15",repeat:"monthly"},
  {id:"s4",type:"expense",amount:23000,cat:"АРЕНДА",desc:"Аренда квартиры",date:"2025-12-01",repeat:"monthly"},
  {id:"s5",type:"expense",amount:25000,cat:"АЛИМЕНТЫ",desc:"Алименты",date:"2025-12-05",repeat:"monthly"},
  {id:"s6",type:"expense",amount:7000,cat:"КВАРТПЛАТА",desc:"Квартплата",date:"2025-12-10",repeat:"monthly"},
  {id:"s7",type:"expense",amount:1000,cat:"ИНТЕРНЕТ",desc:"Интернет",date:"2025-12-15",repeat:"monthly"},
  {id:"s8",type:"expense",amount:1200,cat:"СВЯЗЬ",desc:"Связь МТС",date:"2025-12-12",repeat:"monthly"},
  {id:"s9",type:"expense",amount:2000,cat:"КОРМ",desc:"Корм собаке",date:"2025-12-01",repeat:"monthly"},
  {id:"s10",type:"expense",amount:2000,cat:"БЫТ.ХИМИЯ",desc:"Быт.химия",date:"2025-12-01",repeat:"monthly"},
  {id:"s11",type:"expense",amount:2000,cat:"БЕНЗИН",desc:"Бензин",date:"2025-12-01",repeat:"monthly"},
  // Fact operations
  {id:"i1",type:"income",amount:14000,cat:"ЗАРПЛАТА",desc:"Зарплата",date:"2025-12-12",repeat:"once"},
  {id:"i2",type:"income",amount:25000,cat:"ПРЕМИЯ",desc:"Премия",date:"2025-12-17",repeat:"once"},
  {id:"e1",type:"expense",amount:7000,cat:"ДОЛГ",desc:"Долг брату",date:"2025-12-12",repeat:"once"},
  {id:"e2",type:"expense",amount:1250,cat:"КРЕДИТ",desc:"Кредит",date:"2025-12-12",repeat:"once"},
  {id:"e3",type:"expense",amount:1573,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-12",repeat:"once"},
  {id:"e4",type:"expense",amount:285,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-12",repeat:"once"},
  {id:"e5",type:"expense",amount:40,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-12",repeat:"once"},
  {id:"e6",type:"expense",amount:1220,cat:"СВЯЗЬ",desc:"МТС",date:"2025-12-12",repeat:"once"},
  {id:"e7",type:"expense",amount:1000,cat:"БЕНЗИН",desc:"Бензин",date:"2025-12-13",repeat:"once"},
  {id:"e8",type:"expense",amount:273,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-13",repeat:"once"},
  {id:"e9",type:"expense",amount:239,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-13",repeat:"once"},
  {id:"e10",type:"expense",amount:945,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-14",repeat:"once"},
  {id:"e11",type:"expense",amount:3000,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-14",repeat:"once"},
  {id:"e12",type:"expense",amount:1140,cat:"ИНТЕРНЕТ",desc:"Интернет",date:"2025-12-17",repeat:"once"},
  {id:"e13",type:"expense",amount:160,cat:"ПРОЧЕЕ",desc:"VPN",date:"2025-12-17",repeat:"once"},
  {id:"e14",type:"expense",amount:10000,cat:"ДОЛГ",desc:"Долг Олегу",date:"2025-12-17",repeat:"once"},
  {id:"e15",type:"expense",amount:1000,cat:"ПРОДУКТЫ",desc:"Продукты",date:"2025-12-17",repeat:"once"},
  {id:"e16",type:"expense",amount:5029,cat:"КРЕДИТ",desc:"Кредит",date:"2025-12-17",repeat:"once"},
  {id:"e17",type:"expense",amount:42,cat:"ПРОЧЕЕ",desc:"Авито",date:"2025-12-17",repeat:"once"},
  {id:"e18",type:"expense",amount:1072,cat:"ПРОЧЕЕ",desc:"Помпа",date:"2025-12-17",repeat:"once"},
  // Future debts as future expenses
  {id:"d1",type:"expense",amount:5000,cat:"КРЕДИТ",desc:"Кредит 1/3",date:"2026-01-20",repeat:"once"},
  {id:"d2",type:"expense",amount:5000,cat:"КРЕДИТ",desc:"Кредит 2/3",date:"2026-02-03",repeat:"once"},
  {id:"d3",type:"expense",amount:5000,cat:"КРЕДИТ",desc:"Кредит 3/3",date:"2026-02-17",repeat:"once"},
  {id:"d4",type:"expense",amount:1000,cat:"ДОЛГ",desc:"Долг Жека",date:"2026-01-25",repeat:"once"},
  {id:"d5",type:"expense",amount:7000,cat:"ПРОЧЕЕ",desc:"Налог ИП",date:"2025-12-28",repeat:"once"},
  {id:"d6",type:"expense",amount:15000,cat:"ПРОЧЕЕ",desc:"Ноутбук",date:"2026-06-01",repeat:"once"},
];
const DGOAL={name:"ПОДУШКА БЕЗОПАСНОСТИ",target:100000,current:0,rate:10};

// Styles
const card=b=>({background:C.b2,padding:"12px 14px",marginBottom:8,boxShadow:SH,borderLeft:`3px solid ${b||C.ac}`});
const inp={fontFamily:FT,background:C.b3,color:C.tx,border:`2px solid #3a3630`,padding:"10px 12px",fontSize:15,width:"100%",borderRadius:0,boxSizing:"border-box"};
const lab={display:"block",fontSize:10,fontWeight:700,letterSpacing:1,color:C.t2,marginBottom:4,textTransform:"uppercase"};
const cbtn=a=>({padding:"8px 12px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",margin:"0 4px 4px 0",background:a?C.ac:C.b4,color:a?"#1a1a1a":C.t2,boxShadow:a?"2px 2px 0 #111":"none"});
const mbtn=p=>({display:"block",width:"100%",padding:14,fontSize:13,fontWeight:900,letterSpacing:2,textTransform:"uppercase",border:"none",cursor:"pointer",marginTop:8,background:p?C.ac:C.b3,color:p?"#1a1a1a":C.tx,boxShadow:SH,fontFamily:FT});

// Modal
function Mdl({children,onClose}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:20,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div style={{background:C.b2,width:"100%",maxWidth:500,maxHeight:"85vh",overflowY:"auto",padding:20,borderTop:`3px solid ${C.ac}`}}>{children}</div></div>;
}

// Add form
function AddForm({type,onAdd,onClose}){
  const [amt,sA]=useState("");
  const [date,sD]=useState(td());
  const cats=type==="income"?IC:EC;
  const [cat,sC]=useState(cats[0]);
  const [desc,sDe]=useState("");
  const [rep,sR]=useState("once");
  const col=type==="income"?C.gn:C.rd;
  return <Mdl onClose={onClose}>
    <div style={{fontSize:18,fontWeight:900,letterSpacing:3,marginBottom:16,color:col}}>{type==="income"?"＋ ДОХОД":"－ РАСХОД"}</div>
    <div style={{marginBottom:14}}><div style={lab}>сумма</div>
      <input style={{...inp,fontSize:26,fontWeight:900,textAlign:"center",padding:"14px",borderColor:col}} type="number" inputMode="numeric" placeholder="0" value={amt} onChange={e=>sA(e.target.value)} autoFocus/></div>
    <div style={{marginBottom:14}}><div style={lab}>категория</div>
      <div style={{display:"flex",flexWrap:"wrap"}}>{cats.map(c=><button key={c} style={cbtn(cat===c)} onClick={()=>sC(c)}>{c}</button>)}</div></div>
    <div style={{marginBottom:14}}><div style={lab}>описание</div><input style={inp} placeholder="Что именно?" value={desc} onChange={e=>sDe(e.target.value)}/></div>
    <div style={{marginBottom:14}}><div style={lab}>дата</div><input style={inp} type="date" value={date} onChange={e=>sD(e.target.value)}/></div>
    <div style={{marginBottom:14}}><div style={lab}>повторять</div>
      <div style={{display:"flex",gap:0}}>
        {[["once","РАЗОВО"],["monthly","ЕЖЕМЕСЯЧНО"],["weekly","ЕЖЕНЕДЕЛЬНО"]].map(([v,l])=>
          <button key={v} style={{...cbtn(rep===v),flex:1,margin:0,textAlign:"center"}} onClick={()=>sR(v)}>{l}</button>)}
      </div></div>
    <button style={mbtn(true)} onClick={()=>{const v=parseInt(amt);if(!v||v<=0)return;onAdd({id:uid(),type,amount:v,cat,desc:desc||cat,date,repeat:rep})}}>ДОБАВИТЬ</button>
    <button style={mbtn(false)} onClick={onClose}>ОТМЕНА</button>
  </Mdl>;
}

// Settings
function Settings({goal,onGoal,onExport,onReset,onClose}){
  const [n,sN]=useState(goal.name);const [t,sT]=useState(String(goal.target));const [cu,sCu]=useState(String(goal.current));const [r,sRa]=useState(String(goal.rate));
  return <Mdl onClose={onClose}>
    <div style={{fontSize:16,fontWeight:900,letterSpacing:3,marginBottom:16,color:C.ac}}>⚙ НАСТРОЙКИ</div>
    <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.t2,marginBottom:8,borderBottom:`1px solid ${C.b4}`,paddingBottom:6}}>ЦЕЛЬ НАКОПЛЕНИЯ</div>
    <div style={{marginBottom:10}}><div style={lab}>название</div><input style={inp} value={n} onChange={e=>sN(e.target.value)}/></div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <div style={{flex:1}}><div style={lab}>цель ₽</div><input style={inp} type="number" inputMode="numeric" value={t} onChange={e=>sT(e.target.value)}/></div>
      <div style={{flex:1}}><div style={lab}>накоплено ₽</div><input style={inp} type="number" inputMode="numeric" value={cu} onChange={e=>sCu(e.target.value)}/></div>
    </div>
    <div style={{marginBottom:14}}><div style={lab}>% заплати себе</div><input style={{...inp,width:80}} type="number" min="0" max="50" value={r} onChange={e=>sRa(e.target.value)}/></div>
    <button style={mbtn(true)} onClick={()=>onGoal({name:n.toUpperCase(),target:parseInt(t)||0,current:parseInt(cu)||0,rate:parseInt(r)||10})}>СОХРАНИТЬ</button>
    <div style={{marginTop:20,fontSize:11,fontWeight:700,letterSpacing:2,color:C.t2,marginBottom:8,borderBottom:`1px solid ${C.b4}`,paddingBottom:6}}>ДЕЙСТВИЯ</div>
    <button style={mbtn(false)} onClick={()=>{onExport();onClose()}}>📄 ЭКСПОРТ CSV</button>
    <button style={{...mbtn(false),color:C.rd,marginTop:12}} onClick={()=>{if(confirm("СБРОСИТЬ ВСЕ?"))onReset()}}>СБРОС ДАННЫХ</button>
  </Mdl>;
}

export default function App(){
  const [items,setItems]=useState(DEF);
  const [goal,setGoal]=useState(DGOAL);
  const [vm,setVm]=useState(11);
  const [vy,setVy]=useState(2025);
  const [mod,setMod]=useState(null);
  const [sv,setSv]=useState(false);
  const sc=useRef(0);

  // Load
  useEffect(()=>{
    (async()=>{try{if(window.storage){const r=await window.storage.get(SK);if(r?.value){const d=JSON.parse(r.value);if(d.items)setItems(d.items);if(d.goal)setGoal(d.goal)}}}catch(e){}})();
  },[]);

  // Save
  useEffect(()=>{
    sc.current++;if(sc.current<=2)return;
    const t=setTimeout(async()=>{try{if(window.storage){await window.storage.set(SK,JSON.stringify({items,goal}));setSv(true);setTimeout(()=>setSv(false),1200)}}catch(e){}},500);
    return()=>clearTimeout(t);
  },[items,goal]);

  // Build visible events for current month
  const buildDays=()=>{
    const days={};
    const dim=new Date(vy,vm+1,0).getDate();
    const add=(day,ev)=>{const k=day;if(!days[k])days[k]=[];days[k].push(ev)};

    items.forEach(it=>{
      const d=new Date(it.date);
      const origDay=d.getDate();
      if(it.repeat==="monthly"){
        // Show in every month
        const showDay=Math.min(origDay,dim);
        add(showDay,{...it,src:"plan"});
      } else if(it.repeat==="weekly"){
        // Show on matching weekday
        const wd=d.getDay();
        for(let dd=1;dd<=dim;dd++){if(new Date(vy,vm,dd).getDay()===wd)add(dd,{...it,src:"plan"})}
      } else {
        // Once — show only in matching month
        if(d.getMonth()===vm&&d.getFullYear()===vy) add(origDay,{...it,src:"fact"});
      }
    });
    return days;
  };

  const days=buildDays();
  const now=new Date(),isCur=now.getMonth()===vm&&now.getFullYear()===vy,tday=now.getDate();

  // Totals from visible events
  let totalInc=0,totalExp=0;
  Object.values(days).forEach(evts=>evts.forEach(e=>{if(e.type==="income")totalInc+=e.amount;else totalExp+=e.amount}));
  const bal=totalInc-totalExp;
  const payself=Math.round(totalInc*goal.rate/100);
  const gPct=goal.target?Math.min(Math.round(goal.current/goal.target*100),100):0;

  const chM=dir=>{let m=vm+dir,y=vy;if(m>11){m=0;y++}if(m<0){m=11;y--}setVm(m);setVy(y)};

  const exportCSV=()=>{
    const rows=[["День","Тип","Категория","Описание","Сумма","Повтор"]];
    const dim=new Date(vy,vm+1,0).getDate();
    for(let d=1;d<=dim;d++){const evts=days[d];if(!evts)continue;evts.forEach(e=>rows.push([d+" "+MS[vm],e.type==="income"?"ДОХОД":"РАСХОД",e.cat,e.desc,e.type==="income"?e.amount:-e.amount,e.repeat==="once"?"разово":"план"]))}
    rows.push([],["","","","ДОХОД",totalInc],["","","","РАСХОД",totalExp],["","","","БАЛАНС",bal]);
    const blob=new Blob(["\uFEFF"+rows.map(r=>r.join(";")).join("\n")],{type:"text/csv"});
    const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=`cashflow_${MR[vm]}_${vy}.csv`;a.click();URL.revokeObjectURL(u);
  };

  const dim=new Date(vy,vm+1,0).getDate();

  return <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:900,margin:"0 auto",fontFamily:FT,background:C.bg,color:C.tx,overflow:"hidden"}}>

    {/* HEADER */}
    <div style={{background:C.b2,padding:"12px 16px",borderBottom:`3px solid ${C.ac}`,boxShadow:`0 4px 0 #111`,flexShrink:0,zIndex:2}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><div style={{fontSize:18,fontWeight:900,letterSpacing:5}}>CASHFLOW</div><div style={{fontSize:9,color:C.gn,opacity:sv?1:0,transition:"opacity .4s",letterSpacing:2,marginTop:2}}>СОХРАНЕНО ✓</div></div>
        <div style={{display:"flex",gap:6}}>
          <button style={{width:36,height:36,background:C.b3,border:"none",color:C.t2,fontSize:16,cursor:"pointer",boxShadow:SH,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{
            // Build analysis text
            const catMap={};let plInc=0,plExp=0;
            Object.values(days).forEach(evts=>evts.forEach(e=>{if(e.type==="expense"){catMap[e.cat]=(catMap[e.cat]||0)+e.amount}if(e.src==="plan"){if(e.type==="income")plInc+=e.amount;else plExp+=e.amount}else{/* fact counted in totals */}}));
            const catLines=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([c,a])=>`${c}: ${fm(a)} (${totalExp?Math.round(a/totalExp*100):0}%)`).join("\n");
            const factInc=items.filter(i=>i.repeat==="once"&&i.type==="income").filter(i=>{const d=new Date(i.date);return d.getMonth()===vm&&d.getFullYear()===vy}).reduce((s,i)=>s+i.amount,0);
            const factExp=items.filter(i=>i.repeat==="once"&&i.type==="expense").filter(i=>{const d=new Date(i.date);return d.getMonth()===vm&&d.getFullYear()===vy}).reduce((s,i)=>s+i.amount,0);
            const upcoming=[];const nw=new Date();
            if(nw.getMonth()===vm&&nw.getFullYear()===vy){const td2=nw.getDate();for(let d=td2;d<=td2+7&&d<=dim;d++){const ev=days[d];if(ev)ev.filter(e=>e.type==="expense").forEach(e=>upcoming.push(`${d} ${MS[vm]}: ${e.desc} -${fm(e.amount)} ${e.src==="plan"?"(план)":""}`.trim()))}}
            const futureDebts=items.filter(i=>i.repeat==="once"&&i.type==="expense"&&new Date(i.date)>new Date()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10).map(i=>`${new Date(i.date).getDate()} ${MS[new Date(i.date).getMonth()]} ${new Date(i.date).getFullYear()}: ${i.desc} -${fm(i.amount)}`);
            const txt=`CASHFLOW ${MR[vm]} ${vy}\n\nДоход: ${fm(totalInc)}\nРасход: ${fm(totalExp)}\nБаланс: ${bal>=0?"+":""}${fm(bal)}\nЗаплати себе (${goal.rate}%): ${fm(payself)}\n\nРАСХОДЫ ПО КАТЕГОРИЯМ:\n${catLines}\n\nПЛАН vs ФАКТ:\nПлан доход: ${fm(plInc)} | Факт доход: ${fm(factInc)}\nПлан расход: ${fm(plExp)} | Факт расход: ${fm(factExp)}\n${upcoming.length?"\nБЛИЖАЙШИЕ 7 ДНЕЙ:\n"+upcoming.join("\n"):""}\n${futureDebts.length?"\nПРЕДСТОЯЩИЕ ДОЛГИ/ПЛАТЕЖИ:\n"+futureDebts.join("\n"):""}\n\nЦЕЛЬ: ${goal.name}\n${fm(goal.current)} из ${fm(goal.target)} (${gPct}%)\n\nМакс, проанализируй мои финансы и дай рекомендации.`;
            navigator.clipboard.writeText(txt).then(()=>alert("Скопировано! Вставь в чат Максу")).catch(()=>{const ta=document.createElement("textarea");ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);alert("Скопировано! Вставь в чат Максу")});
          }}>📊</button>
          <button style={{width:36,height:36,background:C.b3,border:"none",color:C.t2,fontSize:16,cursor:"pointer",boxShadow:SH,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setMod("set")}>⚙</button>
        </div>
      </div>
      {/* Summary cards */}
      <div style={{display:"flex",gap:6}}>
        <div style={{flex:1,background:C.b3,padding:"8px 10px"}}><div style={{fontSize:9,color:C.t2,fontWeight:700,letterSpacing:1}}>ДОХОД</div><div style={{fontSize:16,fontWeight:900,color:C.gn,marginTop:2}}>{fm(totalInc)}</div></div>
        <div style={{flex:1,background:C.b3,padding:"8px 10px"}}><div style={{fontSize:9,color:C.t2,fontWeight:700,letterSpacing:1}}>РАСХОД</div><div style={{fontSize:16,fontWeight:900,color:C.rd,marginTop:2}}>{fm(totalExp)}</div></div>
        <div style={{flex:1,background:C.b3,padding:"8px 10px"}}><div style={{fontSize:9,color:C.t2,fontWeight:700,letterSpacing:1}}>БАЛАНС</div><div style={{fontSize:16,fontWeight:900,color:bal>=0?C.gn:C.rd,marginTop:2}}>{bal>=0?"+":""}{fm(bal)}</div></div>
      </div>
      {/* Pay yourself + Goal */}
      <div style={{display:"flex",gap:6,marginTop:6}}>
        <div style={{flex:1,background:"linear-gradient(135deg,#2a2218,#262626)",border:`1px solid ${C.ac}30`,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:C.ac,fontWeight:700,letterSpacing:1}}>ЗАПЛАТИ СЕБЕ {goal.rate}%</div>
          <div style={{fontSize:16,fontWeight:900,color:C.ac,marginTop:2}}>{fm(payself)}</div>
        </div>
        <div style={{flex:1,background:"linear-gradient(135deg,#2a2818,#262626)",border:`1px solid ${C.am}30`,padding:"8px 10px",cursor:"pointer"}} onClick={()=>setMod("set")}>
          <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:9,color:C.am,fontWeight:700,letterSpacing:1}}>ЦЕЛЬ</div><div style={{fontSize:9,color:C.am,fontWeight:700}}>{gPct}%</div></div>
          <div style={{height:4,background:C.bg,marginTop:4}}><div style={{height:"100%",width:`${gPct}%`,background:C.am}}/></div>
          <div style={{fontSize:11,color:C.t2,marginTop:3}}>{fm(goal.current)} / {fm(goal.target)}</div>
        </div>
      </div>
    </div>

    {/* MONTH NAV */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px",background:C.b2,flexShrink:0,borderBottom:`1px solid #3a3630`}}>
      <button style={{width:36,height:36,background:C.b3,border:"none",color:C.tx,fontSize:16,cursor:"pointer",boxShadow:SH,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>chM(-1)}>◀</button>
      <div style={{fontSize:15,fontWeight:900,letterSpacing:3}}>{MR[vm]} {vy}</div>
      <button style={{width:36,height:36,background:C.b3,border:"none",color:C.tx,fontSize:16,cursor:"pointer",boxShadow:SH,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>chM(1)}>▶</button>
    </div>

    {/* ADD BUTTONS */}
    <div style={{display:"flex",gap:8,padding:"8px 16px",background:C.bg,flexShrink:0}}>
      <button style={{flex:1,padding:"12px 0",fontSize:14,fontWeight:900,letterSpacing:3,border:"none",cursor:"pointer",background:C.gn,color:"#1a1a1a",boxShadow:SH,fontFamily:FT}} onClick={()=>setMod("inc")}>＋ ДОХОД</button>
      <button style={{flex:1,padding:"12px 0",fontSize:14,fontWeight:900,letterSpacing:3,border:"none",cursor:"pointer",background:C.rd,color:"#1a1a1a",boxShadow:SH,fontFamily:FT}} onClick={()=>setMod("exp")}>－ РАСХОД</button>
    </div>

    {/* FEED */}
    <div style={{flex:1,overflowY:"auto",padding:"8px 16px 20px",WebkitOverflowScrolling:"touch"}}>
      {Array.from({length:dim},(_,i)=>i+1).map(day=>{
        const evts=days[day];
        if(!evts?.length)return null;
        const hi=isCur&&day===tday;
        const soon=isCur&&day>tday&&day<=tday+3;
        const di=evts.filter(e=>e.type==="income").reduce((a,e)=>a+e.amount,0);
        const de=evts.filter(e=>e.type!=="income").reduce((a,e)=>a+e.amount,0);
        const wd=WDS[new Date(vy,vm,day).getDay()];
        const borderColor=hi?C.ac:soon?C.am:"transparent";

        return <div key={day} style={{background:C.b2,marginBottom:6,boxShadow:"2px 2px 0 #111",border:`2px solid ${borderColor}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:hi?C.b3:soon?"rgba(184,153,58,.06)":C.b2}}>
            <div style={{fontSize:13,fontWeight:900,color:hi?C.ac:soon?C.am:C.tx}}>{day} {MS[vm]} <span style={{color:C.t2,fontWeight:400,fontSize:11}}>{wd}</span>
              {hi&&<span style={{fontSize:9,color:C.ac,marginLeft:6,fontWeight:700}}>СЕГОДНЯ</span>}
              {soon&&<span style={{fontSize:9,color:C.am,marginLeft:6,fontWeight:700}}>СКОРО</span>}
            </div>
            <div style={{fontSize:11,fontWeight:700}}>
              {di>0&&<span style={{color:C.gn}}>+{fm(di)}</span>}
              {di>0&&de>0&&<span style={{color:C.t3}}> / </span>}
              {de>0&&<span style={{color:C.rd}}>-{fm(de)}</span>}
            </div>
          </div>
          {evts.sort((a,b)=>a.type==="income"?-1:1).map((ev,i)=>{
            const col=ev.type==="income"?C.gn:C.rd;
            const isPlan=ev.src==="plan";
            return <div key={i} style={{display:"flex",alignItems:"center",padding:"5px 12px 5px 18px",borderLeft:`3px solid ${col}`,background:C.bg}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {isPlan&&<span style={{fontSize:7,fontWeight:700,letterSpacing:1,padding:"1px 5px",background:ev.type==="income"?"rgba(122,154,106,.12)":"rgba(154,106,96,.12)",color:col}}>ПЛАН</span>}
                  <span style={{fontSize:13,color:C.tx}}>{ev.desc}</span>
                </div>
                <div style={{fontSize:10,color:C.t2,marginTop:1}}>{ev.cat}{isPlan?ev.repeat==="monthly"?" · ежемес.":" · еженед.":""}</div>
              </div>
              <div style={{fontSize:14,fontWeight:900,color:col,whiteSpace:"nowrap",marginLeft:8}}>{ev.type==="income"?"+":"-"}{fm(ev.amount)}</div>
              <button style={{color:C.t3,fontSize:16,background:"none",border:"none",cursor:"pointer",marginLeft:6,padding:"0 4px"}} onClick={()=>setItems(items.filter(x=>x.id!==ev.id))}>×</button>
            </div>;
          })}
        </div>;
      })}
      {Object.keys(days).length===0&&<div style={{textAlign:"center",color:C.t2,padding:40,fontSize:13}}>ПУСТО</div>}
    </div>

    {/* MODALS */}
    {mod==="inc"&&<AddForm type="income" onAdd={it=>{setItems([...items,it]);setMod(null)}} onClose={()=>setMod(null)}/>}
    {mod==="exp"&&<AddForm type="expense" onAdd={it=>{setItems([...items,it]);setMod(null)}} onClose={()=>setMod(null)}/>}
    {mod==="set"&&<Settings goal={goal} onGoal={g=>{setGoal(g);setMod(null)}} onExport={exportCSV} onReset={async()=>{setItems(DEF);setGoal(DGOAL);try{if(window.storage)await window.storage.delete(SK)}catch(e){}setMod(null)}} onClose={()=>setMod(null)}/>}
  </div>;
}
