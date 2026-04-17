/* global React, RoleToken, CeoDisc, Eyebrow, CategoryBar, PrimaryButton */
const { useState } = React;

const ROLE_CATALOG = [
  { role:'va', label:'Virtuálna asistentka', desc:'Rieši všetko po troche — pomalšia, flexibilná.', cost:60,  monthly:30,  cat:'gen' },
  { role:'sales', label:'Obchodník', desc:'Uzatvára dealy, prináša tržby.', cost:120, monthly:60, cat:'mkt' },
  { role:'marketing', label:'Marketingový špecialista', desc:'Buduje značku, prináša zákazníkov.', cost:140, monthly:70, cat:'mkt' },
  { role:'accountant', label:'Účtovník', desc:'Kontroluje faktúry, dane, cashflow.', cost:100, monthly:50, cat:'fin' },
  { role:'cfo', label:'Finančný kontrolór', desc:'Strategické financie — optimalizuje ziskovosť.', cost:200, monthly:100, cat:'fin' },
  { role:'operations', label:'Operations Manager', desc:'Nastavuje procesy, rieši logistiku.', cost:160, monthly:80, cat:'ops' },
  { role:'coo', label:'COO (Pravá ruka)', desc:'Operácie aj financie — škáluje kapacitu.', cost:300, monthly:150, cat:'ops' },
];

const CAT_COLOR = { mkt:'#3b82f6', fin:'#ef4444', ops:'#22c55e', gen:'#eab308' };

const FOCUS_OPTIONS = [
  { id:'product',  label:'Vylepšiť produkt & marketing', desc:'+30% obrat z marketingu', color:'#3b82f6' },
  { id:'sales',    label:'Agresívny predaj',              desc:'+20% celkový obrat',       color:'#eab308' },
  { id:'optimize', label:'Optimalizovať procesy',         desc:'+15% efektivita',          color:'#22c55e' },
  { id:'cashflow', label:'Stabilizovať financie',         desc:'+10% obrat, menej finančných problémov', color:'#ef4444' },
];

function PnlSummary({ revenue, profit, teamCount, monthlyCosts }) {
  const profitColor = profit >= 0 ? '#22c55e' : '#ef4444';
  const sign = profit >= 0 ? '+' : '-';
  return (
    <div style={{
      background:'#111', border:'1px solid #333', borderRadius:8,
      padding:14, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16
    }}>
      {[
        { v:`€${revenue}k`, k:'Obrat', color:'#eab308' },
        { v:`${sign}€${Math.abs(profit)}k`, k:'Zisk', color:profitColor },
        { v:teamCount, k:'Tím', color:'#fff' },
        { v:`€${monthlyCosts}k`, k:'Náklady/mes', color:'#ef4444' },
      ].map((c, i) => (
        <div key={i} style={{textAlign:'center'}}>
          <div style={{fontSize:14, fontWeight:800, color:c.color}}>{c.v}</div>
          <div style={{fontSize:9, color:'#666', marginTop:4}}>{c.k}</div>
        </div>
      ))}
    </div>
  );
}

function FocusOption({ focus, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(focus.id)}
      style={{
        background: selected ? '#1a1a1a' : '#111',
        border: `1px solid ${selected ? focus.color : '#222'}`,
        borderRadius:6, padding:'10px 12px',
        display:'flex', alignItems:'center', gap:10, cursor:'pointer',
        transition:'all 180ms cubic-bezier(0.22,1,0.36,1)'
      }}
    >
      <div style={{
        width:14, height:14, borderRadius:'50%',
        border: `2px solid ${selected ? focus.color : '#555'}`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
      }}>
        <div style={{
          width:6, height:6, borderRadius:'50%',
          background: selected ? focus.color : 'transparent'
        }}/>
      </div>
      <div>
        <div style={{fontSize:11, fontWeight:600, color: selected ? '#fff' : '#ccc'}}>{focus.label}</div>
        <div style={{fontSize:9, color: selected ? '#aaa' : '#555', marginTop:2}}>{focus.desc}</div>
      </div>
    </div>
  );
}

function HireRow({ r, canAfford, onHire }) {
  const color = CAT_COLOR[r.cat];
  return (
    <div style={{
      position:'relative', background:'#1a1a1a',
      border:`1px solid ${canAfford ? 'rgba(255,255,255,0.08)' : '#222'}`,
      borderRadius:6, padding:'10px 12px',
      display:'flex', alignItems:'center', gap:12, opacity:canAfford ? 1 : 0.4,
      marginBottom:6
    }}>
      <div style={{
        position:'absolute', left:0, top:0, bottom:0, width:4,
        background: `${color}59`, borderRadius:'6px 0 0 6px'
      }}/>
      <RoleToken role={r.role} size={22}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:11, fontWeight:700, color:'#fff'}}>{r.label}</div>
        <div style={{fontSize:9, color:'#777', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.desc}</div>
      </div>
      <div style={{textAlign:'right'}}>
        <div style={{fontSize:13, fontWeight:800, color: canAfford ? '#eab308' : '#555'}}>€{r.cost}</div>
        <div style={{fontSize:8, color:'#888', marginTop:2}}>+€{r.monthly}k/mes</div>
      </div>
      {canAfford && (
        <button
          onClick={() => onHire(r)}
          style={{
            background:'#333', color:'#eab308', fontWeight:800, fontSize:9,
            padding:'6px 12px', borderRadius:4, border:'none', cursor:'pointer',
            fontFamily:'inherit', letterSpacing:'.04em'
          }}
        >NAJAT</button>
      )}
    </div>
  );
}

function TeamMemberRow({ m, onFire }) {
  const color = CAT_COLOR[m.cat];
  return (
    <div style={{
      position:'relative', background:'#1a1a1a',
      border:'1px solid #333', borderRadius:6, padding:'8px 12px',
      display:'flex', alignItems:'center', gap:12, marginBottom:6
    }}>
      <div style={{position:'absolute', left:0, top:0, bottom:0, width:4, background:`${color}40`, borderRadius:'6px 0 0 6px'}}/>
      <RoleToken role={m.role} size={20}/>
      <div style={{flex:1}}>
        <div style={{fontSize:11, fontWeight:600, color:'#fff'}}>{m.label} <span style={{color:'#888', fontWeight:400}}>[{m.level === 'senior' ? 'Senior' : 'Junior'}]</span></div>
        <div style={{fontSize:9, color:'#888', marginTop:2}}>€{m.monthly}k/mes</div>
      </div>
      <button onClick={() => onFire(m.id)} style={{
        background:'#2a1515', color:'#ef4444', fontWeight:700, fontSize:9,
        padding:'4px 10px', borderRadius:4, border:'none', cursor:'pointer',
        fontFamily:'inherit'
      }}>Prepustiť</button>
    </div>
  );
}

function PlanningScreen({ state, onContinue, onHire, onFire, onSetFocus }) {
  return (
    <div style={{
      minHeight:'100vh', background:'#0a0a0a', padding:'24px 20px',
      maxWidth:460, margin:'0 auto'
    }}>
      <div style={{textAlign:'center', marginBottom:28}}>
        <div style={{fontSize:12, fontWeight:700, color:'#22c55e', marginBottom:6, letterSpacing:'.1em'}}>
          VLNA {state.wave} PREŽITÁ
        </div>
        <div style={{fontSize:26, fontWeight:900, color:'#fff'}}>Plánovacia fáza</div>
      </div>

      <PnlSummary revenue={state.revenue} profit={state.profit} teamCount={state.team.length} monthlyCosts={state.monthlyCosts}/>

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:24}}>
        <div>
          <div style={{fontSize:22, fontWeight:800, color:'#eab308'}}>€{state.budget}</div>
          <div style={{fontSize:10, color:'#666'}}>K dispozícii</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:22, fontWeight:700, color:'#e5e5e5'}}>{state.countdown}s</div>
          <div style={{fontSize:10, color:'#666'}}>Auto-start</div>
        </div>
      </div>

      <Eyebrow>Čo ťa zabilo</Eyebrow>
      <CategoryBar label="Marketing" pct={state.missed.mkt} color="#3b82f6"/>
      <CategoryBar label="Financie"  pct={state.missed.fin} color="#ef4444"/>
      <CategoryBar label="Operácie"  pct={state.missed.ops} color="#22c55e"/>
      <CategoryBar label="Ostatné"   pct={state.missed.gen} color="#eab308"/>

      <div style={{marginTop:20}}/>
      <Eyebrow>Čo budeš riešiť</Eyebrow>
      <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:20}}>
        {FOCUS_OPTIONS.map(f => (
          <FocusOption key={f.id} focus={f} selected={state.focus === f.id} onSelect={onSetFocus}/>
        ))}
      </div>

      <Eyebrow>Najmi do tímu</Eyebrow>
      {ROLE_CATALOG.map(r => (
        <HireRow key={r.role} r={r} canAfford={state.budget >= r.cost} onHire={onHire}/>
      ))}

      {state.team.length > 0 && (
        <>
          <div style={{marginTop:20}}/>
          <Eyebrow>Tvoj tím</Eyebrow>
          {state.team.map(m => <TeamMemberRow key={m.id} m={m} onFire={onFire}/>)}
        </>
      )}

      <div style={{marginTop:24}}/>
      <PrimaryButton onClick={onContinue}>POKRAČOVAŤ →</PrimaryButton>
    </div>
  );
}

window.PlanningScreen = PlanningScreen;
window.ROLE_CATALOG = ROLE_CATALOG;
window.CAT_COLOR = CAT_COLOR;
