/* global React, WaveTracker, RoleToken, CeoDisc, PrimaryButton, GhostButton */

const PROFILE_DATA = {
  'lone-wolf':       { label:'LONE WOLF',       desc:'Všetko si riešil sám. Tvoja firma stojí a padá s tebou.' },
  'micromanager':    { label:'MICROMANAGER',    desc:'Máš tím, ale stále hasíš požiare sám. Nedôveruješ im.' },
  'generalist-trap': { label:'GENERALIST TRAP', desc:'Máš ľudí, ale žiadnych špecialistov. Všetci robia všetko, nikto nič poriadne.' },
  'delegator':       { label:'DELEGÁTOR',       desc:'Rozpoznal si, čo ťa brzdí, a najal si správnych ľudí. Tvoja firma rastie.' },
  'strategist':      { label:'STRATÉG',         desc:'Postavil si systém, ktorý funguje bez teba. Toto je škálovateľný biznis.' },
};

function milestone(r) {
  if (r >= 3000) return 'Exit ready';
  if (r >= 1500) return 'Milionár';
  if (r >= 800) return 'Na ceste k miliónu';
  if (r >= 400) return 'Stredná firma';
  if (r >= 150) return 'Rastúci biznis';
  if (r >= 50) return 'Malý podnikateľ';
  return 'Živnostník';
}

function fmtMoney(k) {
  if (k >= 1000) return `€${(k/1000).toFixed(1).replace('.', ',')}M`;
  return `€${k.toLocaleString('sk-SK')}k`;
}

function ResultsScreen({ results, onReplay }) {
  const p = PROFILE_DATA[results.profile] || PROFILE_DATA['lone-wolf'];
  const profitColor = results.profit >= 0 ? '#22c55e' : '#ef4444';
  const profitSign = results.profit >= 0 ? '+' : '-';

  return (
    <main style={{
      minHeight:'100vh', background:'#0a0a0a',
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'48px 24px', gap:32
    }}>
      {/* Results card */}
      <div style={{
        background:'#111', border:'1px solid #333', borderRadius:16,
        padding:32, maxWidth:440, width:'100%'
      }}>
        <h2 style={{fontSize:22, fontWeight:800, color:'#fff', marginBottom:24, letterSpacing:'-0.01em'}}>
          CEO DEFENSE
        </h2>

        <div style={{marginBottom:24}}>
          <div style={{fontSize:13, color:'#a3a3a3', marginBottom:8}}>Prežil som</div>
          <WaveTracker current={results.waves}/>
          <div style={{fontSize:11, color:'#666', marginTop:8}}>{results.waves}/10 vĺn</div>
        </div>

        <div style={{marginBottom:24}}>
          <div style={{fontSize:30, fontWeight:700, color:'#fff', marginBottom:8, lineHeight:1}}>{p.label}</div>
          <p style={{fontSize:13, color:'#a3a3a3', lineHeight:1.6}}>{p.desc}</p>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:26, fontWeight:800, color:'#eab308', marginBottom:4}}>{fmtMoney(results.revenue)}</div>
          <div style={{fontSize:11, color:'#a3a3a3'}}>{milestone(results.revenue)}</div>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:18, fontWeight:800, color:profitColor, marginBottom:4}}>
            {profitSign}{fmtMoney(Math.abs(results.profit))}
          </div>
          <div style={{fontSize:11, color:'#a3a3a3'}}>
            {results.profit >= 0 ? `Tvoja firma zarába ${fmtMoney(results.profit)} mesačne` : `Tvoja firma je v strate`}
          </div>
        </div>

        <div style={{fontSize:16, color:'#e5e5e5', marginBottom:20}}>
          Score: <span style={{color:'#fff', fontWeight:700}}>{results.score.toLocaleString()}</span>
        </div>

        <div>
          <div style={{fontSize:13, color:'#a3a3a3', marginBottom:10}}>Tvoj tím:</div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <CeoDisc size={28}/>
            {results.team.map((m, i) => (
              <RoleToken key={i} role={m.role} level={m.level}/>
            ))}
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div style={{display:'flex', flexDirection:'column', gap:12, maxWidth:440, width:'100%'}}>
        <button style={{
          padding:'13px', background:'#0a66c2', color:'#fff',
          border:'none', borderRadius:8, fontWeight:700, fontSize:14,
          cursor:'pointer', fontFamily:'inherit'
        }}>Zdieľať na LinkedIn</button>
        <button style={{
          padding:'13px', background:'#1a1a1a', color:'#e5e5e5',
          border:'1px solid #333', borderRadius:8, fontWeight:700, fontSize:14,
          cursor:'pointer', fontFamily:'inherit'
        }}>Kopírovať odkaz</button>
        <button style={{
          padding:'13px', background:'#1a1a1a', color:'#e5e5e5',
          border:'1px solid #333', borderRadius:8, fontWeight:700, fontSize:14,
          cursor:'pointer', fontFamily:'inherit'
        }}>Stiahnuť kartičku</button>
      </div>

      {/* CTA */}
      <div style={{
        background:'#1a1a1a', border:'1px solid #333', borderRadius:16,
        padding:32, maxWidth:440, width:'100%', textAlign:'center'
      }}>
        <h3 style={{fontSize:18, fontWeight:700, color:'#fff', marginBottom:12, lineHeight:1.35}}>
          Chceš reálne vybudovať firmu, ktorá funguje bez teba?
        </h3>
        <p style={{fontSize:13, color:'#a3a3a3', lineHeight:1.6, marginBottom:20}}>
          Miliónová Evolúcia — 5-fázový systém pre podnikateľov s obratom €100k–€1M+
        </p>
        <button style={{
          width:'100%', padding:'14px', background:'#eab308',
          color:'#0a0a0a', border:'none', borderRadius:8,
          fontWeight:900, fontSize:15, cursor:'pointer', fontFamily:'inherit'
        }}>Zisti viac</button>
      </div>

      <GhostButton onClick={onReplay}>Hrať znova</GhostButton>
    </main>
  );
}

window.ResultsScreen = ResultsScreen;
