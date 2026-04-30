// ─── TOKENS ──────────────────────────────────────────────────────────────────
export const C = {
  bg:'#F5F5F0', white:'#FFFFFF', black:'#0E0E0C', lime:'#CEFF00',
  dark:'#1A1A18', mid:'#2E2E2C', muted:'rgba(14,14,12,0.42)',
  border:'rgba(14,14,12,0.08)', ok:'#2ECC71', warn:'#FF9F0A',
  err:'#E03A2E', info:'#5AC8FA', blue:'#2A5AC0',
}

export const brl = (v) =>
  'R$ ' + Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})

export const dtBR = (d) =>
  d ? new Date(d+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}) : '—'

// daysLeft agora aceita uma data opcional para o casamento
export const daysLeft = (weddingDateStr) => {
  const d = weddingDateStr ? new Date(weddingDateStr+'T12:00:00') : new Date('2025-08-09T12:00:00')
  return Math.max(0, Math.floor((d - new Date()) / 86400000))
}

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
import { useState } from 'react'

export function Card({ children, style, variant='white', onClick }) {
  const bg = {white:C.white,dark:C.black,lime:C.lime,warm:'#FAFAF6',blue:'#C5E8F0'}[variant]
  const border = (variant==='dark'||variant==='lime'||variant==='blue') ? 'none' : `1px solid ${C.border}`
  return (
    <div onClick={onClick} style={{background:bg,border,borderRadius:24,padding:18,marginBottom:10,cursor:onClick?'pointer':'default',...style}}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant='primary', size='md', style, disabled }) {
  const s = {
    primary:   {bg:C.black, color:C.lime, border:'none'},
    secondary: {bg:'#E0DDD6', color:C.black, border:'1.5px solid rgba(14,14,12,0.18)'},
    danger:    {bg:'#FEE8E2', color:C.err, border:'none'},
    ghost:     {bg:'transparent', color:C.muted, border:'none'},
    warn:      {bg:'#FFF4E0', color:'#D4882A', border:'none'},
  }[variant]
  const sz = {sm:'6px 14px', md:'10px 20px', lg:'13px 26px'}
  const fs = {sm:11, md:13, lg:14}
  return (
    <button onClick={disabled?undefined:onClick} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:sz[size], borderRadius:100, border:s.border,
      background:s.bg, color:s.color, fontWeight:800, fontSize:fs[size],
      cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1,
      whiteSpace:'nowrap', flexShrink:0, fontFamily:'inherit', ...style
    }}>{children}</button>
  )
}

export function Input({ value, onChange, placeholder, type='text', style, as:Tag='input', onKeyDown }) {
  const [focused, setFocused] = useState(false)
  return (
    <Tag
      value={value??''} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} type={type}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      onKeyDown={onKeyDown}
      style={{
        width:'100%', background:'rgba(14,14,12,0.05)',
        border:`1.5px solid ${focused?C.black:'transparent'}`,
        borderRadius:12, padding:'10px 13px',
        fontSize:13, fontWeight:500, color:C.black, outline:'none',
        resize:Tag==='textarea'?'vertical':undefined,
        minHeight:Tag==='textarea'?78:undefined, fontFamily:'inherit', ...style
      }}
    />
  )
}

export function Select({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{
      width:'100%', background:'rgba(14,14,12,0.05)',
      border:`1.5px solid ${C.border}`, borderRadius:12,
      padding:'10px 13px', fontSize:13, fontWeight:600,
      color:C.black, outline:'none', cursor:'pointer', fontFamily:'inherit', ...style
    }}>
      {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  )
}

export function Field({ label, children, style }) {
  return (
    <div style={{marginBottom:14,...style}}>
      <label style={{display:'block',fontSize:11,fontWeight:700,letterSpacing:'0.5px',textTransform:'uppercase',color:C.muted,marginBottom:5}}>{label}</label>
      {children}
    </div>
  )
}

export function Modal({ open, onClose, title, children, maxWidth=480 }) {
  if (!open) return null
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.42)',
      zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center'
    }}>
      <div style={{
        background:C.white, borderRadius:'28px 28px 0 0',
        padding:'22px 20px 40px', width:'100%', maxWidth, maxHeight:'92vh', overflowY:'auto'
      }}>
        <div style={{width:38,height:4,borderRadius:100,background:C.border,margin:'0 auto 18px'}}/>
        {title && <div style={{fontSize:18,fontWeight:900,letterSpacing:'-0.5px',marginBottom:18}}>{title}</div>}
        {children}
      </div>
    </div>
  )
}

export function ProgressBar({ value, max, color=C.black, style }) {
  const pct = max>0 ? Math.min(100,Math.round((value/max)*100)) : 0
  const over = value>max
  return (
    <div style={style}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:600,marginBottom:4}}>
        <span style={{color:C.muted}}>{brl(value)} de {brl(max)}</span>
        <span style={{color:over?C.err:C.muted}}>{pct}%</span>
      </div>
      <div style={{height:5,background:C.border,borderRadius:100,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:over?C.err:color,borderRadius:100,transition:'width 0.5s'}}/>
      </div>
    </div>
  )
}

export function Tag({ children, bg='rgba(14,14,12,0.07)', color=C.muted, style }) {
  return <span style={{display:'inline-block',background:bg,color,fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:100,letterSpacing:0.2,...style}}>{children}</span>
}

export function Checkbox({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width:20,height:20,borderRadius:'50%',flexShrink:0,cursor:'pointer',
      background:checked?C.black:'transparent',
      border:`1.5px solid ${checked?C.black:'rgba(14,14,12,0.22)'}`,
      display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'
    }}>
      {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke={C.lime} strokeWidth="1.8" strokeLinecap="round"/></svg>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div onClick={onChange} style={{width:44,height:24,borderRadius:100,cursor:'pointer',background:checked?C.black:'rgba(14,14,12,0.12)',position:'relative',transition:'background 0.2s',flexShrink:0}}>
        <div style={{width:18,height:18,borderRadius:'50%',background:checked?C.lime:'#fff',position:'absolute',top:3,left:checked?23:3,transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
      </div>
      {label && <span style={{fontSize:13,fontWeight:500,color:C.muted}}>{label}</span>}
    </div>
  )
}

export function Empty({ icon, title, subtitle }) {
  return (
    <div style={{textAlign:'center',padding:'40px 24px',color:C.muted}}>
      <div style={{fontSize:38,marginBottom:12}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:700,color:C.black,marginBottom:4}}>{title}</div>
      {subtitle && <div style={{fontSize:13,fontWeight:500}}>{subtitle}</div>}
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{display:'flex',justifyContent:'center',padding:40}}>
      <div style={{width:28,height:28,borderRadius:'50%',border:`3px solid ${C.border}`,borderTopColor:C.black,animation:'spin 0.7s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export function SecHead({ title, subtitle, action }) {
  return (
    <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:16}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:900,letterSpacing:'-0.8px',color:C.black,margin:0}}>{title}</h2>
        {subtitle && <p style={{fontSize:12,color:C.muted,marginTop:3,fontWeight:500,margin:0}}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{display:'flex',gap:5,marginBottom:18,overflowX:'auto',paddingBottom:2}}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding:'7px 14px',borderRadius:100,whiteSpace:'nowrap',
          fontSize:12,fontWeight:700,cursor:'pointer',
          border:`1.5px solid ${active===t.id?C.black:C.border}`,
          background:active===t.id?C.black:'transparent',
          color:active===t.id?C.lime:C.black,
          transition:'all 0.15s', fontFamily:'inherit',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

export function Grid2({ children, gap=10 }) {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap,marginBottom:10}}>{children}</div>
}

export function ListRow({ children, style }) {
  return <div style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',borderBottom:`1px solid ${C.border}`,...style}}>{children}</div>
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
export const Icons = {
  Home:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Cal:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Star:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Card:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  More:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>,
  Bell:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  SmartHome:()=> <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Plus:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>,
  Edit:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Chevron: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Clip:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
}
