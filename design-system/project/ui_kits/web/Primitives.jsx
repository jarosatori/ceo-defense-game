/* global React */
const { useState } = React;

function WaveTracker({ current, total = 10 }) {
  return (
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
      {Array.from({length: total}, (_, i) => i + 1).map(w => (
        <div key={w} style={{
          width:32, height:32, borderRadius:6,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:800,
          background: w <= current ? '#22c55e' : '#1a1a1a',
          color: w <= current ? '#0a0a0a' : '#444'
        }}>{w}</div>
      ))}
    </div>
  );
}

function ShapeGlyph({ kind, size = 18, color }) {
  const s = size;
  if (kind === 'triangle') {
    return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 29,27 3,27" fill={color}/></svg>;
  }
  if (kind === 'diamond') {
    return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" fill={color} transform="rotate(45 16 16)"/></svg>;
  }
  if (kind === 'square') {
    return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="5" y="5" width="22" height="22" fill={color}/></svg>;
  }
  return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill={color}/></svg>;
}

function RoleToken({ role, level = 'junior', size }) {
  const colors = {
    va:'#eab308', sales:'#3b82f6', marketing:'#3b82f6', product:'#3b82f6',
    support:'#22c55e', accountant:'#ef4444', cfo:'#ef4444', hr:'#eab308',
    operations:'#22c55e', coo:'#22c55e'
  };
  const labels = {
    va:'VA', sales:'SAL', marketing:'MKT', product:'PRD', support:'SUP',
    accountant:'ACC', cfo:'CFO', hr:'HR', operations:'OPS', coo:'COO'
  };
  const d = size || (level === 'senior' ? 36 : 28);
  return (
    <div style={{
      width:d, height:d, borderRadius:'50%',
      background: colors[role], color:'#0a0a0a',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:7, fontWeight:800, flexShrink:0
    }}>{labels[role]}</div>
  );
}

function CeoDisc({ size = 36 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:'#ffffff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:8, fontWeight:800, color:'#0a0a0a', flexShrink:0
    }}>CEO</div>
  );
}

function PrimaryButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'14px', border:'none', borderRadius:10,
      background:'#eab308', color:'#0a0a0a', fontWeight:900,
      fontSize:15, letterSpacing:'.02em', cursor:'pointer',
      fontFamily:'inherit', ...style
    }}>{children}</button>
  );
}

function GhostButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding:'12px 20px', borderRadius:8,
      background:'#1a1a1a', color:'#e5e5e5',
      border:'1px solid #333', fontWeight:700, fontSize:14,
      cursor:'pointer', fontFamily:'inherit', ...style
    }}>{children}</button>
  );
}

function CategoryBar({ label, pct, color }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'90px 1fr 40px', gap:12, alignItems:'center', marginBottom:10}}>
      <div style={{fontSize:11, color:'#ccc'}}>{label}</div>
      <div style={{height:8, background:'#222', borderRadius:4, overflow:'hidden'}}>
        <div style={{height:'100%', width:`${pct}%`, background:color, borderRadius:4}}/>
      </div>
      <div style={{fontSize:10, color:'#888', textAlign:'right', fontFamily:'ui-monospace,monospace'}}>{pct}%</div>
    </div>
  );
}

function Eyebrow({ children, color = '#666' }) {
  return (
    <div style={{
      fontSize:10, fontWeight:700, letterSpacing:'.18em',
      textTransform:'uppercase', color, marginBottom:10
    }}>{children}</div>
  );
}

Object.assign(window, {
  WaveTracker, ShapeGlyph, RoleToken, CeoDisc,
  PrimaryButton, GhostButton, CategoryBar, Eyebrow
});
