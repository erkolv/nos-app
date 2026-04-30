import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { C, Icons, Modal, Field, Input, Btn, Select } from './ui'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
const NAV = [
  { path: '/',           Icon: Icons.Home,  label: 'Início'      },
  { path: '/agenda',     Icon: Icons.Cal,   label: 'Agenda'      },
  { path: '/objetivos',  Icon: Icons.Star,  label: 'Objetivos'   },
  { path: '/financeiro', Icon: Icons.Card,  label: 'Financeiro'  },
  { path: '/mais',       Icon: Icons.More,  label: 'Mais'        },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500,
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      padding: 0,
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex', gap: 3,
        background: 'rgba(245,245,240,0.72)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: 100, padding: '6px 8px',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 8px 32px rgba(14,14,12,0.14)',
      }}>
        {NAV.map(({ path, Icon, label }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={label}
              style={{
                width: 46, height: 46, borderRadius: '50%', border: 'none',
                cursor: 'pointer', background: active ? C.black : 'transparent',
                color: active ? C.lime : C.black,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.18s',
              }}
            >
              <Icon />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────
export function TopBar() {
  const { profile, partner } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [smartOpen, setSmartOpen]   = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 400,
        background: 'rgba(245,245,240,0.96)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid rgba(14,14,12,0.08)`,
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Avatars */}
        <div style={{ display: 'flex' }}>
          <Avatar name={profile?.name} bg={C.lime} color={C.black} />
          {partner && <Avatar name={partner.name} bg={C.black} color={C.lime} ml={-8} />}
        </div>

        {/* Logo centered */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontSize: 19, fontWeight: 900, letterSpacing: '-0.8px', color: C.black,
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          nós<span style={{ width: 5, height: 5, borderRadius: '50%', background: C.lime, marginBottom: 8, display: 'inline-block' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {/* Notifs */}
          <div style={{ position: 'relative' }}>
            <IconBtn onClick={() => setNotifsOpen(true)}><Icons.Bell /></IconBtn>
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 8, height: 8, borderRadius: '50%', background: C.err,
              border: `2px solid ${C.bg}`,
            }} />
          </div>
          <IconBtn onClick={() => setSearchOpen(true)}><Icons.Search /></IconBtn>
          {/* Smart Home btn */}
          <IconBtn
            onClick={() => setSmartOpen(true)}
            style={{ background: 'linear-gradient(135deg,#1A1A18,#0E3060)' }}
          >
            <span style={{ color: C.lime }}><Icons.SmartHome /></span>
          </IconBtn>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SmartModal  open={smartOpen}  onClose={() => setSmartOpen(false)} />
      <NotifModal  open={notifsOpen} onClose={() => setNotifsOpen(false)} />
    </>
  )
}

// ─── PAGE SHELL ──────────────────────────────────────────────────────────────
export function PageShell({ children }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 18px 100px' }}>
      {children}
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Avatar({ name, bg, color, ml = 0 }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 800, flexShrink: 0,
      marginLeft: ml, border: ml ? `2px solid ${C.bg}` : 'none',
    }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  )
}

function IconBtn({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'white', border: `1px solid rgba(14,14,12,0.09)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', outline: 'none', flexShrink: 0, ...style
    }}>
      {children}
    </button>
  )
}

// ─── SEARCH MODAL ────────────────────────────────────────────────────────────
function SearchModal({ open, onClose }) {
  const [area, setArea]   = useState('Tudo')
  const [from, setFrom]   = useState('')
  const [to, setTo]       = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  async function search() {
    if (!from || !to) return
    setLoading(true)
    // em produção: query nas tabelas reais com range de datas
    await new Promise(r => setTimeout(r, 400))
    setResults([
      { title: 'Visita ao salão de festas', type: 'Compromisso', date: from },
      { title: 'Sinal fotógrafo', type: 'Gasto · R$ 2.000', date: from },
    ])
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="🔍 Buscar por data">
      <Field label="Buscar em">
        <Select value={area} onChange={setArea} options={['Tudo','Compromissos','Tarefas','Gastos','Viagens','Pet','Contas']} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Data inicial"><Input value={from} onChange={setFrom} type="date" /></Field>
        <Field label="Data final"><Input value={to} onChange={setTo} type="date" /></Field>
      </div>
      <Btn onClick={search} disabled={!from || !to || loading} style={{ width: '100%', justifyContent: 'center', borderRadius: 14, padding: 13, fontSize: 13 }}>
        {loading ? 'Buscando...' : 'Buscar'}
      </Btn>
      {results && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </div>
          {results.map((r, i) => (
            <div key={i} style={{ background: 'rgba(14,14,12,0.04)', borderRadius: 14, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{r.type} · {r.date}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

// ─── SMART HOME MODAL ────────────────────────────────────────────────────────
function SmartModal({ open, onClose }) {
  const [sala, setSala]   = useState(true)
  const [ar, setAr]       = useState(true)

  return (
    <Modal open={open} onClose={onClose} title="🏠 Casa Inteligente">
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Controle integrado — visualize e controle de dentro do nós</p>
      <div style={{
        background: 'linear-gradient(135deg,#1A1A18,#0E3060)',
        borderRadius: 20, padding: 18, marginBottom: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Status da casa</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Gabi em casa 🏠</div>
          </div>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.lime, boxShadow: `0 0 8px ${C.lime}` }} />
        </div>
        {[
          { icon: '💡', label: 'Sala',    val: sala ? 'ON' : 'OFF',    toggle: () => setSala(v => !v), on: sala },
          { icon: '❄️', label: 'Ar',      val: ar   ? '23°C' : 'OFF',  toggle: () => setAr(v => !v),   on: ar   },
          { icon: '🔒', label: 'Porta',   val: 'Fechada ✓',             on: true  },
          { icon: '📷', label: 'Câmeras', val: '2 online',              on: true  },
        ].map(d => (
          <div key={d.label} onClick={d.toggle} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', background: 'rgba(255,255,255,0.07)',
            borderRadius: 12, marginBottom: 7, cursor: d.toggle ? 'pointer' : 'default'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{d.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.label}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: d.on ? C.lime : 'rgba(255,255,255,0.3)' }}>{d.val}</span>
          </div>
        ))}
      </div>
      <Btn style={{ width: '100%', justifyContent: 'center', borderRadius: 14, padding: 13, fontSize: 13 }}>
        Abrir app completo →
      </Btn>
    </Modal>
  )
}

// ─── NOTIF MODAL ─────────────────────────────────────────────────────────────
const NOTIFS = [
  { icon: '🐾', bg: '#FFF4E0', title: 'Vacina do Bolt vence em 5 dias', sub: 'Vacina V10 · vence 03/05/2025' },
  { icon: '🥣', bg: '#E8F5ED', title: 'Ração do Bolt acaba em ~4 dias', sub: 'Último pacote aberto há 21 dias' },
  { icon: '💳', bg: '#FEE8E2', title: 'Conta de luz vence amanhã',       sub: 'R$ 162,40 · vence 29/04' },
  { icon: '💍', bg: '#E8F0FE', title: '102 dias para o casamento',        sub: 'Checklist: 40% concluído' },
  { icon: '💬', bg: C.lime,   title: 'Recado da Gabi',                   sub: '"Lembra de ligar pro buffet!"' },
  { icon: '🏠', bg: '#0E3060', title: 'Casa — Sala desbloqueada',         sub: 'Gabi chegou às 18:32' },
]

function NotifModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="🔔 Notificações">
      {NOTIFS.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < NOTIFS.length - 1 ? `1px solid rgba(14,14,12,0.08)` : 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{n.title}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{n.sub}</div>
          </div>
        </div>
      ))}
    </Modal>
  )
}
