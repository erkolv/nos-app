import { useState, useMemo } from 'react'
import { useTable } from '../hooks/useTable'
import { useAuth } from '../context/AuthContext'
import { C, brl, Card, Btn, Input, Field, Modal, Tag, SubTabs, SecHead, Empty, Spinner, Icons, Grid2, Toggle } from '../components/ui'
import { PageShell } from '../components/Layout'

export default function FinanceiroPage() {
  const [tab, setTab] = useState('gastos')
  const TABS = [
    { id:'gastos',     label:'Gastos'      },
    { id:'salarios',   label:'Salários'    },
    { id:'contas',     label:'Contas fixas'},
    { id:'consumos',   label:'Consumos'    },
    { id:'orcamentos', label:'Orçamentos'  },
  ]
  return (
    <PageShell>
      <SecHead title="Financeiro"/>
      <SubTabs tabs={TABS} active={tab} onChange={setTab}/>
      {tab==='gastos'     && <GastosTab/>}
      {tab==='salarios'   && <SalariosTab/>}
      {tab==='contas'     && <ContasTab/>}
      {tab==='consumos'   && <ConsumosTab/>}
      {tab==='orcamentos' && <OrcamentosTab/>}
    </PageShell>
  )
}

const CAT_IC = { Alimentação:'🛒', Assinaturas:'📱', Casamento:'💍', Lazer:'🎉', Casa:'🏠', Saúde:'❤️', Pet:'🐾', Outros:'•' }
const CAT_BG = { Alimentação:'#E8F5ED', Assinaturas:'#E8F0FE', Casamento:'#FEF0E8', Lazer:'#FFF4E0', Casa:'#F0E8FE', Saúde:'#FEF0F0', Pet:'#FFF4E0', Outros:'rgba(14,14,12,.05)' }
const CATS   = Object.keys(CAT_IC)
const SEL    = { width:'100%', background:'rgba(14,14,12,.05)', border:`1.5px solid rgba(14,14,12,.08)`, borderRadius:12, padding:'10px 13px', fontSize:13, fontWeight:600, color:'#0E0E0C', outline:'none', cursor:'pointer', fontFamily:'inherit' }

function ModalActions({ onSave, onCancel, saveLabel='Salvar', editId, onDelete }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
      {editId&&onDelete ? <Btn variant="danger" size="sm" onClick={onDelete}><Icons.Trash/> Excluir</Btn> : <span/>}
      <div style={{display:'flex',gap:8}}>
        <Btn variant="secondary" onClick={onCancel} style={{padding:'9px 16px',borderRadius:12}}>Cancelar</Btn>
        <Btn onClick={onSave} style={{padding:'9px 16px',borderRadius:12}}>{saveLabel}</Btn>
      </div>
    </div>
  )
}

// ── helpers de data ────────────────────────────────────────────────────────────
function currentMonth() { return new Date().toISOString().slice(0,7) } // "2026-04"
function monthLabel(m)  {
  if (!m) return ''
  const [y,mo] = m.split('-')
  const names = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${names[parseInt(mo,10)-1]} ${y}`
}

// ── GASTOS ────────────────────────────────────────────────────────────────────
function GastosTab() {
  const { profile } = useAuth()
  const { data: salaries } = useTable('salaries')
  const { data, loading, insert, update, remove } = useTable('expenses')
  const [open, setOpen]     = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterMonth, setFilterMonth] = useState(currentMonth())
  const blank = { description:'', amount:'', who: profile?.name||'', category:'Alimentação', date: new Date().toISOString().slice(0,10) }
  const [form, setForm] = useState(blank)
  const set = k => v => setForm(p=>({...p,[k]:v}))

  // filtra pelo mês selecionado
  const filtered = data.filter(e => (e.date||'').slice(0,7) === filterMonth)
  const total    = filtered.reduce((s,e)=>s+(e.amount||0),0)

  // salários do casal
  const salTotal = salaries.reduce((s,r)=>s+(r.amount||0),0)
  const saldo    = salTotal - total

  // divisão proporcional
  const myName   = profile?.name || ''
  const mySal    = salaries.find(s=>s.name===myName)?.amount || 0
  const partSal  = salaries.find(s=>s.name!==myName)?.amount || 0
  const myPct    = salTotal>0 ? Math.round(mySal/salTotal*100) : 50
  const partPct  = 100-myPct
  const mySpent  = filtered.filter(e=>e.who===myName).reduce((s,e)=>s+(e.amount||0),0)
  const partSpent= total - mySpent

  // meses disponíveis para filtro
  const months = [...new Set(data.map(e=>(e.date||'').slice(0,7)).filter(Boolean))].sort((a,b)=>b.localeCompare(a))
  if (!months.includes(filterMonth)) months.unshift(filterMonth)

  function openNew()   { setForm({...blank, who: myName}); setEditId(null); setOpen(true) }
  function openEdit(e) { setForm({...e, amount:String(e.amount)}); setEditId(e.id); setOpen(true) }
  async function save() {
    if (!form.description||!form.amount) return
    const row = {...form, amount:Number(form.amount)}
    if (editId) await update(editId,row); else await insert(row)
    setOpen(false)
  }

  return (
    <>
      {/* Filtro de mês */}
      <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:2}}>
        {months.slice(0,6).map(m=>(
          <button key={m} onClick={()=>setFilterMonth(m)} style={{
            padding:'6px 14px',borderRadius:100,whiteSpace:'nowrap',
            fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
            border:`1.5px solid ${filterMonth===m?C.black:C.border}`,
            background:filterMonth===m?C.black:'transparent',
            color:filterMonth===m?C.lime:C.black,
          }}>{monthLabel(m)}</button>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontSize:15,fontWeight:800}}>Gastos de {monthLabel(filterMonth)}</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Registrar</Btn>
      </div>

      {/* Totais */}
      <Grid2>
        <div style={{borderRadius:20,padding:15,background:C.black}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:'rgba(255,255,255,.3)',marginBottom:5}}>Gastos</div>
          <div style={{fontSize:19,fontWeight:900,color:'#fff',letterSpacing:'-1px'}}>{brl(total)}</div>
          {salTotal>0&&<div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:4}}>{Math.round(total/salTotal*100)}% da receita</div>}
        </div>
        <div style={{borderRadius:20,padding:15,background:C.white,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:C.muted,marginBottom:5}}>Saldo livre</div>
          <div style={{fontSize:17,fontWeight:900,color:saldo>=0?'#2ECC71':C.err,letterSpacing:'-1px'}}>{brl(Math.abs(saldo))}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>{saldo>=0?'disponível':'acima do orçamento'}</div>
        </div>
      </Grid2>

      {/* Divisão proporcional */}
      {salTotal>0 && (
        <Card variant="warm" style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>Divisão proporcional</div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            {salaries.map(s=>{
              const spent  = filtered.filter(e=>e.who===s.name).reduce((x,e)=>x+(e.amount||0),0)
              const pct    = salTotal>0?Math.round(s.amount/salTotal*100):50
              const ideal  = total * pct/100
              const diff   = spent - ideal
              return (
                <div key={s.name} style={{flex:1,background:C.white,borderRadius:14,padding:11,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:3}}>{s.name} ({pct}%)</div>
                  <div style={{fontSize:15,fontWeight:900}}>{brl(spent)}</div>
                  <div style={{fontSize:10,color:Math.abs(diff)<50?'#2ECC71':diff>0?C.err:'#2ECC71',marginTop:3,fontWeight:600}}>
                    {Math.abs(diff)<50 ? '✓ Em dia' : diff>0 ? `↑ ${brl(diff)} a mais` : `↓ ${brl(Math.abs(diff))} a menos`}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{textAlign:'center',fontSize:11,fontWeight:700,color:C.muted}}>
            Ideal: {salaries.map(s=>`${s.name} paga ${Math.round(s.amount/salTotal*100)}%`).join(' · ')}
          </div>
        </Card>
      )}

      {/* Lista de gastos */}
      {loading ? <Spinner/> : filtered.length===0
        ? <Empty icon="💳" title="Nenhum gasto neste mês" subtitle="Registre o primeiro"/>
        : filtered.map((e,i)=>(
          <div key={e.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:i<filtered.length-1?`1px solid ${C.border}`:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:11}}>
              <div style={{width:33,height:33,borderRadius:11,background:CAT_BG[e.category]||'rgba(14,14,12,.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{CAT_IC[e.category]||'•'}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{e.description}</div>
                <div style={{fontSize:11,color:C.muted}}>{e.who} · {e.date} · {e.category}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{fontSize:13,fontWeight:800}}>{brl(e.amount)}</div>
              <button onClick={()=>openEdit(e)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Edit/></button>
              <button onClick={()=>remove(e.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Trash/></button>
            </div>
          </div>
        ))
      }

      <Modal open={open} onClose={()=>setOpen(false)} title={editId?'Editar gasto':'Novo gasto'}>
        <Field label="Descrição"><Input value={form.description} onChange={set('description')} placeholder="Ex: Supermercado"/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Valor (R$)"><Input value={form.amount} onChange={set('amount')} type="number" placeholder="0"/></Field>
          <Field label="Quem pagou">
            <select value={form.who} onChange={e=>set('who')(e.target.value)} style={SEL}>
              {salaries.length>0
                ? salaries.map(s=><option key={s.name} value={s.name}>{s.name}</option>)
                : [myName,'Parceira'].filter(Boolean).map(n=><option key={n} value={n}>{n}</option>)
              }
            </select>
          </Field>
          <Field label="Categoria" style={{gridColumn:'1/-1'}}>
            <select value={form.category} onChange={e=>set('category')(e.target.value)} style={SEL}>{CATS.map(o=><option key={o}>{o}</option>)}</select>
          </Field>
          <Field label="Data" style={{gridColumn:'1/-1'}}><Input value={form.date} onChange={set('date')} type="date"/></Field>
        </div>
        <ModalActions onSave={save} onCancel={()=>setOpen(false)} saveLabel={editId?'Salvar':'Registrar'} editId={editId} onDelete={()=>{remove(editId);setOpen(false)}}/>
      </Modal>
    </>
  )
}

// ── SALÁRIOS ──────────────────────────────────────────────────────────────────
function SalariosTab() {
  const { profile, partner } = useAuth()
  const { data: salaries, insert, update, loading } = useTable('salaries')
  const [editing, setEditing] = useState(null) // name being edited
  const [tempVal, setTempVal] = useState('')

  const people = [
    { name: profile?.name||'Você', key:'me'      },
    { name: partner?.name||'Parceira', key:'partner' },
  ].filter(p=>p.name)

  function getSalary(name) {
    return salaries.find(s=>s.name===name)?.amount || 0
  }
  function getRecord(name) {
    return salaries.find(s=>s.name===name)
  }

  async function saveSalary(name) {
    const val = Number(tempVal)
    if (!val || val <= 0) { setEditing(null); return }
    const rec = getRecord(name)
    if (rec) {
      const { error } = await update(rec.id, { amount: val })
      if (error) console.error('update salary error:', error)
    } else {
      const { error } = await insert({ name, amount: val })
      if (error) console.error('insert salary error:', error)
    }
    setEditing(null)
  }

  const total = people.reduce((s,p)=>s+getSalary(p.name),0)

  return (
    <>
      <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>Salários do casal</div>
      <Card variant="lime">
        <div style={{fontSize:12,fontWeight:600,color:'rgba(14,14,12,.55)',marginBottom:12}}>
          A divisão dos gastos é calculada automaticamente com base nos salários.
        </div>
        <div style={{background:'rgba(14,14,12,.09)',borderRadius:14,padding:14}}>
          {loading ? <Spinner/> : people.map((p,i)=>{
            const sal  = getSalary(p.name)
            const pct  = total>0?Math.round(sal/total*100):0
            const isEd = editing===p.name
            return (
              <div key={p.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:i<people.length-1?12:0,marginBottom:i<people.length-1?12:0,borderBottom:i<people.length-1?'1px solid rgba(14,14,12,.12)':'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:C.black,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:C.lime,flexShrink:0}}>{(p.name||'?')[0].toUpperCase()}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>{p.name}</div>
                    {total>0&&<div style={{fontSize:10,color:'rgba(14,14,12,.5)'}}>paga {pct}% das despesas</div>}
                  </div>
                </div>
                {isEd ? (
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{position:'relative'}}>
                      <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',fontSize:11,fontWeight:700,color:C.black}}>R$</span>
                      <input
                        autoFocus
                        type="number"
                        value={tempVal}
                        onChange={e=>setTempVal(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&saveSalary(p.name)}
                        style={{width:110,paddingLeft:28,background:'rgba(14,14,12,.07)',border:'none',borderRadius:10,padding:'7px 10px 7px 28px',fontSize:14,fontWeight:900,color:C.black,outline:'none',fontFamily:'inherit'}}
                      />
                    </div>
                    <Btn size="sm" onClick={()=>saveSalary(p.name)}>OK</Btn>
                    <Btn variant="secondary" size="sm" onClick={()=>setEditing(null)}>✕</Btn>
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:18,fontWeight:900,color:C.black}}>{sal>0?brl(sal):'—'}</span>
                    <button onClick={()=>{setEditing(p.name);setTempVal(sal>0?String(sal):'')} } style={{background:'none',border:'none',cursor:'pointer',color:'rgba(14,14,12,.4)',padding:4,lineHeight:0}}><Icons.Edit/></button>
                  </div>
                )}
              </div>
            )
          })}
          {total>0&&(
            <div style={{borderTop:'1px solid rgba(14,14,12,.15)',paddingTop:12,marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,fontWeight:700}}>Total familiar</span>
              <span style={{fontSize:17,fontWeight:900}}>{brl(total)}/mês</span>
            </div>
          )}
        </div>
        {total>0&&(
          <div style={{marginTop:12,display:'flex',gap:8}}>
            {people.map(p=>{
              const pct = total>0?Math.round(getSalary(p.name)/total*100):0
              return (
                <div key={p.name} style={{flex:1,background:'rgba(14,14,12,.09)',borderRadius:12,padding:10,textAlign:'center'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'rgba(14,14,12,.5)'}}>{p.name} paga</div>
                  <div style={{fontSize:18,fontWeight:900}}>{pct}%</div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )
}

// ── CONTAS FIXAS ──────────────────────────────────────────────────────────────
function ContasTab() {
  const { data, loading, insert, update, remove } = useTable('fixed_bills')
  const [open, setOpen]     = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { name:'', amount:0, due_day:1, paid:false, category:'Casa' }
  const [form, setForm]     = useState(blank)
  const set = k => v => setForm(p=>({...p,[k]:v}))

  function openNew()   { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(c) { setForm({...c, amount:String(c.amount)}); setEditId(c.id); setOpen(true) }
  async function save() {
    if (!form.name) return
    const row = {...form, amount:Number(form.amount)||0, due_day:Number(form.due_day)||1}
    if (editId) await update(editId,row); else await insert(row)
    setOpen(false)
  }

  const paid   = data.filter(c=>c.paid).reduce((s,c)=>s+(c.amount||0),0)
  const unpaid = data.filter(c=>!c.paid).reduce((s,c)=>s+(c.amount||0),0)
  const total  = paid+unpaid

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontSize:15,fontWeight:800}}>Contas fixas</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Adicionar</Btn>
      </div>
      {data.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
          {[['Total',brl(total),C.black,'#fff'],['Pago',brl(paid),'#E8F5ED','#1a7a3e'],['Pendente',brl(unpaid),'#FFF4E0','#D4882A']].map(([l,v,bg,c])=>(
            <div key={l} style={{borderRadius:16,padding:'10px 12px',background:bg,border:bg===C.black?'none':`1px solid ${C.border}`,textAlign:'center'}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',color:bg===C.black?'rgba(255,255,255,.4)':C.muted,marginBottom:3}}>{l}</div>
              <div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {loading ? <Spinner/> : data.length===0
        ? <Empty icon="📋" title="Nenhuma conta fixa" subtitle="Adicione aluguel, internet, etc."/>
        : <Card style={{padding:0,overflow:'hidden'}}>
            {[...data].sort((a,b)=>a.due_day-b.due_day).map((c,i)=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:i<data.length-1?`1px solid ${C.border}`:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div onClick={()=>update(c.id,{paid:!c.paid})} style={{width:8,height:8,borderRadius:'50%',background:c.paid?'#2ECC71':'#FF9F0A',flexShrink:0,cursor:'pointer'}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{c.name}</div>
                    <div style={{fontSize:11,color:C.muted}}>Dia {c.due_day}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{fontSize:13,fontWeight:800}}>{brl(c.amount)}</div>
                  <Tag bg={c.paid?'#E8F5ED':'#FFF4E0'} color={c.paid?'#1a7a3e':'#D4882A'}>{c.paid?'Pago':'Pendente'}</Tag>
                  <button onClick={()=>openEdit(c)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Edit/></button>
                  <button onClick={()=>remove(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Trash/></button>
                </div>
              </div>
            ))}
          </Card>
      }
      <Modal open={open} onClose={()=>setOpen(false)} title={editId?'Editar conta':'Nova conta fixa'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: Aluguel"/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Valor (R$)"><Input value={form.amount} onChange={set('amount')} type="number" placeholder="0"/></Field>
          <Field label="Dia vencimento"><Input value={form.due_day} onChange={set('due_day')} type="number" placeholder="5"/></Field>
        </div>
        <Field label="Já pago este mês?">
          <Toggle checked={!!form.paid} onChange={()=>set('paid')(!form.paid)} label={form.paid?'Sim':'Não'}/>
        </Field>
        <ModalActions onSave={save} onCancel={()=>setOpen(false)} editId={editId} onDelete={()=>{remove(editId);setOpen(false)}}/>
      </Modal>
    </>
  )
}

// ── CONSUMOS ──────────────────────────────────────────────────────────────────
function ConsumosTab() {
  const { data, loading, insert, update, remove } = useTable('utility_readings')
  const [open, setOpen]     = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { type:'Energia', value:0, amount:0, month: new Date().toISOString().slice(0,7) }
  const [form, setForm]     = useState(blank)
  const set = k => v => setForm(p=>({...p,[k]:v}))

  function openNew()   { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(r) { setForm({...r, value:String(r.value), amount:String(r.amount)}); setEditId(r.id); setOpen(true) }
  async function save() {
    const row = {...form, value:Number(form.value)||0, amount:Number(form.amount)||0}
    if (editId) await update(editId,row); else await insert(row)
    setOpen(false)
  }

  const UTIL_CFG = {
    Energia:  {ic:'⚡',unit:'kWh',bg:'#1A1A18',textC:'#fff',barC:'#CEFF00',mutedC:'rgba(255,255,255,.3)'},
    Água:     {ic:'💧',unit:'m³', bg:'#fff',   textC:'#0E0E0C',barC:'#5AC8FA',mutedC:'rgba(14,14,12,.42)',border:true},
    Internet: {ic:'🌐',unit:'Mb', bg:'#CEFF00',textC:'#0E0E0C',barC:'#0E0E0C',mutedC:'rgba(14,14,12,.45)'},
    Gás:      {ic:'🔥',unit:'%',  bg:'#2E2E2C',textC:'#fff',  barC:'#FF9F0A',mutedC:'rgba(255,255,255,.3)'},
  }
  const types = ['Energia','Água','Internet','Gás']

  function last(type) {
    return data.filter(r=>r.type===type).sort((a,b)=>b.month?.localeCompare(a.month||'')||0)[0]||null
  }
  function trend(type) {
    const sorted = data.filter(r=>r.type===type).sort((a,b)=>b.month?.localeCompare(a.month||'')||0)
    if (sorted.length<2) return null
    const diff = sorted[0].value - sorted[1].value
    const pct  = sorted[1].value>0 ? Math.round(Math.abs(diff)/sorted[1].value*100) : 0
    return {up:diff>0,pct}
  }
  function history(type) {
    return data.filter(r=>r.type===type).sort((a,b)=>a.month?.localeCompare(b.month||'')||0).slice(-4)
  }

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontSize:15,fontWeight:800}}>Consumos da casa</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Registrar</Btn>
      </div>
      {loading ? <Spinner/> : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {types.map(type=>{
            const cfg = UTIL_CFG[type]
            const rec = last(type)
            const tr  = trend(type)
            const hist= history(type)
            const isDark = cfg.bg!=='#fff'&&cfg.bg!=='#CEFF00'
            const isLime = cfg.bg==='#CEFF00'
            const maxV = Math.max(...data.filter(r=>r.type===type).map(r=>r.value||0),1)
            const barPct = rec?Math.round((rec.value||0)/maxV*100):0

            return (
              <div key={type} style={{borderRadius:20,padding:15,background:cfg.bg,border:cfg.border?`1px solid ${C.border}`:'none',position:'relative',overflow:'hidden'}}>
                {tr&&<span style={{position:'absolute',top:10,right:10,fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:100,background:isDark?(tr.up?'rgba(224,58,46,.2)':'rgba(206,255,0,.18)'):(tr.up?'#FEEEE8':'#E8F5ED'),color:isDark?(tr.up?'#FF6B6B':'#CEFF00'):(tr.up?'#C04020':'#1a7a3e')}}>{tr.up?'↑':'↓'} {tr.pct}%</span>}
                {!rec&&<span style={{position:'absolute',top:10,right:10,fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:100,background:'rgba(14,14,12,.1)',color:cfg.mutedC}}>Sem dados</span>}
                <div style={{fontSize:17,marginBottom:6}}>{cfg.ic}</div>
                <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:cfg.mutedC,marginBottom:2}}>{type}</div>
                {rec ? (
                  <>
                    <div style={{fontSize:19,fontWeight:900,color:cfg.textC,letterSpacing:'-.8px'}}>{rec.value}<span style={{fontSize:10,opacity:.5,marginLeft:2}}>{cfg.unit}</span></div>
                    <div style={{fontSize:10,color:cfg.mutedC,marginTop:2}}>{brl(rec.amount)}/mês · {monthLabel(rec.month)}</div>
                  </>
                ) : <div style={{fontSize:14,fontWeight:700,color:cfg.mutedC,marginTop:4}}>—</div>}
                <div style={{height:3,borderRadius:100,marginTop:8,overflow:'hidden',background:isDark?'rgba(255,255,255,.1)':'rgba(14,14,12,.1)'}}>
                  <div style={{height:'100%',width:`${rec?barPct:0}%`,background:cfg.barC,borderRadius:100}}/>
                </div>
                {/* mini sparkline histórico */}
                {hist.length>1&&(
                  <div style={{display:'flex',gap:2,alignItems:'flex-end',marginTop:8,height:20}}>
                    {hist.map((h,i)=>{
                      const hMax = Math.max(...hist.map(x=>x.value||0),1)
                      const hPct = Math.round((h.value||0)/hMax*100)
                      return <div key={i} style={{flex:1,borderRadius:3,background:isDark?'rgba(255,255,255,.2)':isLime?'rgba(14,14,12,.2)':'rgba(14,14,12,.15)',height:`${Math.max(20,hPct)}%`}}/>
                    })}
                  </div>
                )}
                <div style={{display:'flex',gap:5,marginTop:8}}>
                  <Btn size="sm" onClick={()=>{setForm({type,value:0,amount:0,month:new Date().toISOString().slice(0,7)});setEditId(null);setOpen(true)}} style={{flex:1,justifyContent:'center',borderRadius:10,fontSize:10,padding:'6px 8px',background:isLime?C.black:isDark?'rgba(255,255,255,.15)':'rgba(14,14,12,.08)',color:isLime?C.lime:isDark?'#fff':C.black,border:'none'}}>+ Novo</Btn>
                  {rec&&<button onClick={()=>openEdit(rec)} style={{background:isLime?'rgba(14,14,12,.1)':isDark?'rgba(255,255,255,.1)':'rgba(14,14,12,.07)',border:'none',borderRadius:10,cursor:'pointer',padding:'6px 8px',color:isDark||isLime?cfg.mutedC:C.muted,lineHeight:0}}><Icons.Edit/></button>}
                  {rec&&<button onClick={()=>remove(rec.id)} style={{background:isLime?'rgba(14,14,12,.1)':isDark?'rgba(255,255,255,.1)':'rgba(14,14,12,.07)',border:'none',borderRadius:10,cursor:'pointer',padding:'6px 8px',color:isDark||isLime?cfg.mutedC:C.muted,lineHeight:0}}><Icons.Trash/></button>}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Modal open={open} onClose={()=>setOpen(false)} title={editId?'Editar consumo':'Registrar consumo'}>
        <Field label="Tipo"><select value={form.type} onChange={e=>set('type')(e.target.value)} style={SEL}>{types.map(o=><option key={o}>{o}</option>)}</select></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Mês de referência"><Input value={form.month} onChange={set('month')} type="month"/></Field>
          <Field label="Valor conta (R$)"><Input value={form.amount} onChange={set('amount')} type="number" placeholder="0"/></Field>
        </div>
        <Field label={`Consumo (${UTIL_CFG[form.type]?.unit||''})`}><Input value={form.value} onChange={set('value')} type="number" placeholder="0"/></Field>
        <ModalActions onSave={save} onCancel={()=>setOpen(false)} editId={editId} onDelete={()=>{remove(editId);setOpen(false)}}/>
      </Modal>
    </>
  )
}

// ── ORÇAMENTOS ────────────────────────────────────────────────────────────────
function OrcamentosTab() {
  const { data, loading, insert, update, remove } = useTable('budgets')
  const [open, setOpen]     = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { name:'', category:'Casamento', planned:0, actual:0, status:'Não iniciado', responsible:'Ambos', notes:'' }
  const [form, setForm]     = useState(blank)
  const set = k => v => setForm(p=>({...p,[k]:v}))

  const tp = data.reduce((s,b)=>s+(b.planned||0),0)
  const ta = data.reduce((s,b)=>s+(b.actual||0),0)

  function openNew()   { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(b) { setForm({...b, planned:String(b.planned), actual:String(b.actual)}); setEditId(b.id); setOpen(true) }
  async function save() {
    if (!form.name.trim()) return
    const row = {...form, planned:Number(form.planned)||0, actual:Number(form.actual)||0}
    if (editId) await update(editId,row); else await insert(row)
    setOpen(false)
  }
  const ST_C = {'Não iniciado':['rgba(14,14,12,.07)',C.muted],'Em andamento':['#FFF4E0','#D4882A'],'Finalizado':['#E8F5ED','#1a7a3e']}

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontSize:15,fontWeight:800}}>Orçamentos</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Novo</Btn>
      </div>
      {tp>0&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
          {[['Planejado',brl(tp),C.black,'#fff'],['Gasto',brl(ta),'#FFF4E0','#D4882A'],['Saldo',brl(tp-ta),tp-ta>=0?'#E8F5ED':'#FEE8E2',tp-ta>=0?'#1a7a3e':C.err]].map(([l,v,bg,c])=>(
            <div key={l} style={{borderRadius:16,padding:12,background:bg,border:bg===C.black?'none':`1px solid ${C.border}`,textAlign:'center'}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',color:bg===C.black?'rgba(255,255,255,.4)':C.muted,marginBottom:3}}>{l}</div>
              <div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {loading ? <Spinner/> : data.length===0
        ? <Empty icon="💰" title="Nenhum orçamento" subtitle="Adicione itens do seu budget"/>
        : data.map(b=>{
          const [sc,stc] = ST_C[b.status]||ST_C['Não iniciado']
          const pct = b.planned>0?Math.min(100,Math.round(b.actual/b.planned*100)):0
          return (
            <Card key={b.id} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:5}}>{b.name}</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    <Tag bg="#FEF0E8" color="#C0603A">{b.category}</Tag>
                    <Tag bg={sc} color={stc}>{b.status}</Tag>
                    <Tag>{b.responsible}</Tag>
                  </div>
                </div>
                <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5}}>
                  <div style={{fontSize:13,fontWeight:800}}>{brl(b.actual)}</div>
                  <div style={{fontSize:10,color:C.muted}}>de {brl(b.planned)}</div>
                  <div style={{display:'flex',gap:5}}>
                    <button onClick={()=>openEdit(b)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:2,lineHeight:0}}><Icons.Edit/></button>
                    <button onClick={()=>remove(b.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:2,lineHeight:0}}><Icons.Trash/></button>
                  </div>
                </div>
              </div>
              <div style={{height:5,background:C.border,borderRadius:100,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:b.actual>b.planned?C.err:C.black,borderRadius:100}}/>
              </div>
              {b.notes&&<p style={{fontSize:11,color:C.muted,margin:'8px 0 0'}}>{b.notes}</p>}
            </Card>
          )
        })
      }
      <Modal open={open} onClose={()=>setOpen(false)} title={editId?'Editar orçamento':'Novo orçamento'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: Buffet"/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Planejado (R$)"><Input value={form.planned} onChange={set('planned')} type="number" placeholder="0"/></Field>
          <Field label="Realizado (R$)"><Input value={form.actual} onChange={set('actual')} type="number" placeholder="0"/></Field>
        </div>
        <Field label="Status"><select value={form.status} onChange={e=>set('status')(e.target.value)} style={SEL}>{['Não iniciado','Em andamento','Finalizado'].map(o=><option key={o}>{o}</option>)}</select></Field>
        <Field label="Responsável"><select value={form.responsible} onChange={e=>set('responsible')(e.target.value)} style={SEL}>{['Ambos','Erick','Gabi'].map(o=><option key={o}>{o}</option>)}</select></Field>
        <Field label="Notas"><Input value={form.notes} onChange={set('notes')} as="textarea" placeholder="Observações..."/></Field>
        <ModalActions onSave={save} onCancel={()=>setOpen(false)} editId={editId} onDelete={()=>{remove(editId);setOpen(false)}}/>
      </Modal>
    </>
  )
}
