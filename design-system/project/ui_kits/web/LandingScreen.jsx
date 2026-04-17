/* global React, PrimaryButton */
const { useState } = React;

function LandingScreen({ onStart }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <main style={{
      minHeight:'100vh', background:'#0a0a0a',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'24px', textAlign:'center'
    }}>
      <div style={{maxWidth:460, width:'100%'}}>
        <h1 style={{
          fontSize:44, fontWeight:900, color:'#fff',
          letterSpacing:'-0.02em', marginBottom:12
        }}>CEO DEFENSE</h1>
        <p style={{fontSize:18, color:'#a3a3a3', marginBottom:28}}>
          Dokážeš vybudovať firmu, ktorá funguje bez teba?
        </p>

        <div style={{color:'#e5e5e5', fontSize:14, lineHeight:1.6, marginBottom:8}}>
          10 levelov biznis problémov. Ty si CEO.<br/>
          Najmi správnych ľudí — alebo ťa to prevalcuje.
        </div>
        <div style={{color:'#666', fontSize:13, marginBottom:24}}>
          Hra trvá 10–15 minút.
        </div>

        <div style={{display:'flex', justifyContent:'center', gap:16, padding:'20px 0'}}>
          <svg width="24" height="22" viewBox="0 0 32 32"><polygon points="16,4 29,27 3,27" fill="#3b82f6"/></svg>
          <svg width="24" height="24" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" fill="#ef4444" transform="rotate(45 16 16)"/></svg>
          <svg width="22" height="22" viewBox="0 0 32 32"><rect x="5" y="5" width="22" height="22" fill="#22c55e"/></svg>
          <svg width="24" height="24" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#eab308"/></svg>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onStart(); }}
              style={{display:'flex', flexDirection:'column', gap:12, marginTop:12}}>
          <input
            placeholder="Meno (nepovinné)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              padding:'13px 16px', background:'#1a1a1a',
              border:'1px solid #333', borderRadius:8, color:'#fff',
              fontSize:14, fontFamily:'inherit', outline:'none'
            }}
          />
          <input
            type="email"
            placeholder="Tvoj email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              padding:'13px 16px', background:'#1a1a1a',
              border:'1px solid #333', borderRadius:8, color:'#fff',
              fontSize:14, fontFamily:'inherit', outline:'none'
            }}
            onFocus={e => e.target.style.borderColor = '#eab308'}
            onBlur={e => e.target.style.borderColor = '#333'}
          />
          <PrimaryButton>HRAŤ →</PrimaryButton>
        </form>

        <p style={{fontSize:12, color:'#444', marginTop:24}}>
          Miliónová Evolúcia — mentoring pre podnikateľov
        </p>
      </div>
    </main>
  );
}

window.LandingScreen = LandingScreen;
