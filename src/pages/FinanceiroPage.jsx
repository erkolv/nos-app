import { useState } from 'react'
import { useTable } from '../hooks/useTable'
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
const CATS = Object.keys(CAT_IC)

// ── GASTOS ────────────────────────────────────────────────────────────────────
function GastosTab() {
  const { data, loading, insert, update, remove } = useTable('expenses')
  const [open, setOpen]   = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { description:'', amount:'', who:'Erick', category:'Alimentação', date: new Date().toISOString().slice(0,10) }
  const [form, setForm]   = useState(blank)
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const total = data.reduce((s,e) => s+(e.amount||0), 0)
  const byE   = data.filter(e=>e.who==='Erick').reduce((s,e)=>s+e.amount,0)
  const byG   = data.filter(e=>e.who==='Gabi').reduce((s,e)=>s+e.amount,0)

  function openNew() { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(e) { setForm({ ...e, amount: String(e.amount) }); setEditId(e.id); setOpen(true) }

  async function save() {
    if (!form.description || !form.amount) return
    const row = { ...form, amount: Number(form.amount) }
    if (editId) await update(editId, row)
    else await insert(row)
    setOpen(false)
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Gastos de abril</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Registrar</Btn>
      </div>
      <Grid2>
        <div style={{ borderRadius:20, padding:15, background:C.black }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'rgba(255,255,255,.3)', marginBottom:5 }}>Total</div>
          <div style={{ fontSize:19, fontWeight:900, color:'#fff', letterSpacing:'-1px' }}>{brl(total)}</div>
        </div>
        <div style={{ borderRadius:20, padding:15, background:C.white, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:C.muted, marginBottom:5 }}>Saldo livre</div>
          <div style={{ fontSize:17, fontWeight:900, color:'#2ECC71', letterSpacing:'-1px' }}>R$ 9.200</div>
        </div>
      </Grid2>
      <Card variant="warm" style={{ marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:800, marginBottom:10 }}>Divisão do mês</div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          {[['Erick',byE,'59%'],['Gabi',byG,'41%']].map(([nm,vl,pct]) => (
            <div key={nm} style={{ flex:1, background:C.white, borderRadius:14, padding:11, textAlign:'center', border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.muted, marginBottom:3 }}>{nm} pagou</div>
              <div style={{ fontSize:15, fontWeight:900 }}>{brl(vl)}</div>
              <div style={{ fontSize:10, color:C.muted }}>{pct}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', fontSize:12, fontWeight:700, color:'#2ECC71' }}>✓ Divisão proporcional aos salários</div>
      </Card>
      {loading ? <Spinner/> : data.length===0 ? <Empty icon="💳" title="Nenhum gasto" subtitle="Registre o primeiro gasto"/> :
        data.map((e,i) => (
          <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom: i<data.length-1?`1px solid ${C.border}`:'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
              <div style={{ width:33, height:33, borderRadius:11, background:CAT_BG[e.category]||'rgba(14,14,12,.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{CAT_IC[e.category]||'•'}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{e.description}</div>
                <div style={{ fontSize:11, color:C.muted }}>{e.who} · {e.date} · {e.category}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:13, fontWeight:800 }}>{brl(e.amount)}</div>
              <button onClick={() => openEdit(e)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Edit/></button>
              <button onClick={() => remove(e.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash/></button>
            </div>
          </div>
        ))
      }
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Editar gasto' : 'Novo gasto'}>
        <Field label="Descrição"><Input value={form.description} onChange={set('description')} placeholder="Ex: Supermercado"/></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Valor (R$)"><Input value={form.amount} onChange={set('amount')} type="number" placeholder="0"/></Field>
          <Field label="Quem pagou">
            <select value={form.who} onChange={e=>set('who')(e.target.value)} style={SEL}>{['Erick','Gabi'].map(o=><option key={o}>{o}</option>)}</select>
          </Field>
          <Field label="Categoria" style={{ gridColumn:'1/-1' }}>
            <select value={form.category} onChange={e=>set('category')(e.target.value)} style={SEL}>{CATS.map(o=><option key={o}>{o}</option>)}</select>
          </Field>
          <Field label="Data" style={{ gridColumn:'1/-1' }}><Input value={form.date} onChange={set('date')} type="date"/></Field>
        </div>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} saveLabel={editId?'Salvar':'Registrar'} editId={editId} onDelete={() => { remove(editId); setOpen(false) }}/>
      </Modal>
    </>
  )
}

// ── SALÁRIOS ──────────────────────────────────────────────────────────────────
function SalariosTab() {
  const [erick, setErick] = useState('8000')
  const [gabi,  setGabi]  = useState('5500')
  const total = Number(erick||0) + Number(gabi||0)
  const pctE  = total > 0 ? Math.round(Number(erick)/total*100) : 0
  const pctG  = total > 0 ? 100-pctE : 0

  return (
    <>
      <div style={{ fontSize:15, fontWeight:800, marginBottom:14 }}>Salários do casal</div>
      <Card variant="lime">
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(14,14,12,.55)', marginBottom:12 }}>A divisão dos gastos é calculada automaticamente com base nos salários.</div>
        <div style={{ background:'rgba(14,14,12,.09)', borderRadius:14, padding:14 }}>
          {[['Erick',erick,setErick],['Gabi',gabi,setGabi]].map(([nm,vl,set],i) => (
            <div key={nm} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: i===0?10:0, paddingBottom: i===0?10:0, borderBottom: i===0?'1px solid rgba(14,14,12,.12)':'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:C.black, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:C.lime }}>{nm[0]}</div>
                <span style={{ fontSize:14, fontWeight:700 }}>{nm}</span>
              </div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:12, fontWeight:700, color:C.black }}>R$</span>
                <input type="number" value={vl} onChange={e=>set(e.target.value)} style={{ width:120, paddingLeft:30, background:'rgba(14,14,12,.07)', border:'none', borderRadius:10, padding:'7px 10px 7px 30px', fontSize:15, fontWeight:900, color:C.black, outline:'none' }}/>
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid rgba(14,14,12,.15)', paddingTop:12, marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, fontWeight:700 }}>Total familiar</span>
            <span style={{ fontSize:17, fontWeight:900 }}>{brl(total)}/mês</span>
          </div>
        </div>
        <div style={{ marginTop:12, display:'flex', gap:8 }}>
          {[['Erick paga',pctE],['Gabi paga',pctG]].map(([l,p]) => (
            <div key={l} style={{ flex:1, background:'rgba(14,14,12,.09)', borderRadius:12, padding:10, textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(14,14,12,.5)' }}>{l}</div>
              <div style={{ fontSize:16, fontWeight:900 }}>{p}%</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

// ── CONTAS ────────────────────────────────────────────────────────────────────
function ContasTab() {
  const { data, loading, insert, update, remove } = useTable('fixed_bills')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { name:'', amount:0, due_day:1, paid:false, category:'Casa' }
  const [form, setForm] = useState(blank)
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  function openNew() { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(c) { setForm({ ...c, amount: String(c.amount) }); setEditId(c.id); setOpen(true) }
  async function save() {
    if (!form.name) return
    const row = { ...form, amount: Number(form.amount)||0, due_day: Number(form.due_day)||1 }
    if (editId) await update(editId, row)
    else await insert(row)
    setOpen(false)
  }

  const paid   = data.filter(c => c.paid).reduce((s,c) => s+(c.amount||0), 0)
  const unpaid = data.filter(c => !c.paid).reduce((s,c) => s+(c.amount||0), 0)

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Contas fixas</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Adicionar</Btn>
      </div>
      {data.length > 0 && (
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <div style={{ flex:1, borderRadius:16, padding:12, background:'#E8F5ED', textAlign:'center' }}>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', color:'#1a7a3e', marginBottom:3 }}>Pago</div>
            <div style={{ fontSize:14, fontWeight:800, color:'#1a7a3e' }}>{brl(paid)}</div>
          </div>
          <div style={{ flex:1, borderRadius:16, padding:12, background:'#FFF4E0', textAlign:'center' }}>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', color:'#D4882A', marginBottom:3 }}>Pendente</div>
            <div style={{ fontSize:14, fontWeight:800, color:'#D4882A' }}>{brl(unpaid)}</div>
          </div>
        </div>
      )}
      {loading ? <Spinner/> : data.length===0 ? <Empty icon="📋" title="Nenhuma conta fixa" subtitle="Adicione aluguel, internet, etc."/> :
        <Card style={{ padding:0, overflow:'hidden' }}>
          {[...data].sort((a,b)=>a.due_day-b.due_day).map((c,i) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom: i<data.length-1?`1px solid ${C.border}`:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div onClick={() => update(c.id, { paid: !c.paid })} style={{ width:8, height:8, borderRadius:'50%', background: c.paid?'#2ECC71':'#FF9F0A', flexShrink:0, cursor:'pointer' }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>Dia {c.due_day}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ fontSize:13, fontWeight:800 }}>{brl(c.amount)}</div>
                <Tag bg={c.paid?'#E8F5ED':'#FFF4E0'} color={c.paid?'#1a7a3e':'#D4882A'}>{c.paid?'Pago':'Pendente'}</Tag>
                <button onClick={() => openEdit(c)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Edit/></button>
                <button onClick={() => remove(c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash/></button>
              </div>
            </div>
          ))}
        </Card>
      }
      <Modal open={open} onClose={() => setOpen(false)} title={editId?'Editar conta':'Nova conta fixa'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: Aluguel"/></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Valor (R$)"><Input value={form.amount} onChange={set('amount')} type="number" placeholder="0"/></Field>
          <Field label="Dia vencimento"><Input value={form.due_day} onChange={set('due_day')} type="number" placeholder="5"/></Field>
        </div>
        <Field label="Já pago este mês?">
          <Toggle checked={!!form.paid} onChange={() => set('paid')(!form.paid)} label={form.paid?'Sim':'Não'}/>
        </Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} editId={editId} onDelete={() => { remove(editId); setOpen(false) }}/>
      </Modal>
    </>
  )
}

// ── CONSUMOS ──────────────────────────────────────────────────────────────────
function ConsumosTab() {
  const { data, loading, insert, update, remove } = useTable('utility_readings')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { type:'Energia', value:0, amount:0, month: new Date().toISOString().slice(0,7) }
  const [form, setForm] = useState(blank)
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  function openNew() { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(r) { setForm({ ...r, value:String(r.value), amount:String(r.amount) }); setEditId(r.id); setOpen(true) }
  async function save() {
    const row = { ...form, value: Number(form.value)||0, amount: Number(form.amount)||0 }
    if (editId) await update(editId, row)
    else await insert(row)
    setOpen(false)
  }

  const UTIL_CONFIG = {
    Energia:  { ic:'⚡', unit:'kWh', bg:C.dark,  textColor:'#fff', badgeC:'rgba(206,255,0,.18)', badgeT:C.lime, barC:C.lime },
    Água:     { ic:'💧', unit:'m³',  bg:C.white, textColor:C.black, badgeC:'#FEEEE8', badgeT:'#C04020', barC:'#5AC8FA' },
    Internet: { ic:'🌐', unit:'Mb',  bg:C.lime,  textColor:C.black, badgeC:'rgba(14,14,12,.1)', badgeT:C.black, barC:C.black },
    Gás:      { ic:'🔥', unit:'%',   bg:C.mid,   textColor:'#fff', badgeC:'rgba(255,159,10,.2)', badgeT:'#FF9F0A', barC:'#FF9F0A' },
  }
  const types = ['Energia','Água','Internet','Gás']
  const last = (type) => data.filter(d=>d.type===type).sort((a,b)=>b.month.localeCompare(a.month))[0]

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Consumos da casa</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Registrar</Btn>
      </div>
      {loading ? <Spinner/> : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {types.map(type => {
            const cfg = UTIL_CONFIG[type]
            const rec = last(type)
            const isDark = cfg.bg === C.dark || cfg.bg === C.mid
            const isLime = cfg.bg === C.lime
            return (
              <div key={type} style={{ borderRadius:20, padding:15, background:cfg.bg, border: cfg.bg===C.white?`1px solid ${C.border}`:'none', position:'relative', overflow:'hidden' }}>
                {rec && <span style={{ position:'absolute', top:10, right:10, fontSize:9, fontWeight:800, padding:'1px 6px', borderRadius:100, background:cfg.badgeC, color:cfg.badgeT }}>{rec.month}</span>}
                <div style={{ fontSize:17, marginBottom:6 }}>{cfg.ic}</div>
                <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color: isDark?'rgba(255,255,255,.3)':C.muted, marginBottom:2 }}>{type}</div>
                <div style={{ fontSize:19, fontWeight:900, color:cfg.textColor, letterSpacing:'-.8px' }}>
                  {rec ? rec.value : '—'}<span style={{ fontSize:10, opacity:.5, marginLeft:2 }}>{cfg.unit}</span>
                </div>
                <div style={{ fontSize:10, color: isDark?'rgba(255,255,255,.3)':C.muted, marginTop:2 }}>
                  {rec ? brl(rec.amount)+'/mês' : 'Sem registro'}
                </div>
                <div style={{ height:3, borderRadius:100, marginTop:8, overflow:'hidden', background: isDark?'rgba(255,255,255,.1)':'rgba(14,14,12,.1)' }}>
                  <div style={{ height:'100%', width: rec?'60%':'0%', background:cfg.barC, borderRadius:100 }}/>
                </div>
                <div style={{ display:'flex', gap:5, marginTop:8 }}>
                  <Btn size="sm" onClick={openNew} style={{ flex:1, justifyContent:'center', borderRadius:10, fontSize:10, padding:'6px 8px', background: isLime?C.black:'rgba(255,255,255,.15)', color: isLime?C.lime:'#fff', border:'none' }}>+ Registrar</Btn>
                  {rec && <button onClick={() => openEdit(rec)} style={{ background:'rgba(255,255,255,.1)', border:'none', borderRadius:10, cursor:'pointer', padding:'6px 8px', color: isDark||isLime?'rgba(255,255,255,.7)':C.muted, lineHeight:0 }}><Icons.Edit/></button>}
                  {rec && <button onClick={() => remove(rec.id)} style={{ background:'rgba(255,255,255,.1)', border:'none', borderRadius:10, cursor:'pointer', padding:'6px 8px', color: isDark||isLime?'rgba(255,255,255,.7)':C.muted, lineHeight:0 }}><Icons.Trash/></button>}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editId?'Editar consumo':'Registrar consumo'}>
        <Field label="Tipo">
          <select value={form.type} onChange={e=>set('type')(e.target.value)} style={SEL}>{types.map(o=><option key={o}>{o}</option>)}</select>
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Mês de referência"><Input value={form.month} onChange={set('month')} type="month"/></Field>
          <Field label="Valor conta (R$)"><Input value={form.amount} onChange={set('amount')} type="number" placeholder="0"/></Field>
        </div>
        <Field label={`Consumo (${UTIL_CONFIG[form.type]?.unit||''})`}><Input value={form.value} onChange={set('value')} type="number" placeholder="0"/></Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} editId={editId} onDelete={() => { remove(editId); setOpen(false) }}/>
      </Modal>
    </>
  )
}

// ── ORÇAMENTOS ────────────────────────────────────────────────────────────────
function OrcamentosTab() {
  const { data, loading, insert, update, remove } = useTable('budgets')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { name:'', category:'Casamento', planned:0, actual:0, status:'Não iniciado', responsible:'Ambos', notes:'' }
  const [form, setForm] = useState(blank)
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const tp = data.reduce((s,b)=>s+(b.planned||0),0)
  const ta = data.reduce((s,b)=>s+(b.actual||0),0)

  function openNew() { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(b) { setForm({ ...b, planned:String(b.planned), actual:String(b.actual) }); setEditId(b.id); setOpen(true) }
  async function save() {
    if (!form.name.trim()) return
    const row = { ...form, planned:Number(form.planned)||0, actual:Number(form.actual)||0 }
    if (editId) await update(editId, row)
    else await insert(row)
    setOpen(false)
  }

  const ST_C = { 'Não iniciado':['rgba(14,14,12,.07)',C.muted], 'Em andamento':['#FFF4E0','#D4882A'], 'Finalizado':['#E8F5ED','#1a7a3e'] }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Orçamentos</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Novo</Btn>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
        {[['Planejado',brl(tp),C.black,'#fff'],['Gasto',brl(ta),'#FFF4E0','#D4882A'],['Saldo',brl(tp-ta),'#E8F5ED','#1a7a3e']].map(([l,v,bg,c]) => (
          <div key={l} style={{ borderRadius:16, padding:12, background:bg, border: bg===C.black?'none':`1px solid ${C.border}`, textAlign:'center' }}>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', color: bg===C.black?'rgba(255,255,255,.4)':C.muted, marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:13, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>
      {loading ? <Spinner/> : data.length===0 ? <Empty icon="💰" title="Nenhum orçamento" subtitle="Adicione itens do seu budget"/> :
        data.map(b => {
          const [sc,stc] = ST_C[b.status]||ST_C['Não iniciado']
          const pct = b.planned>0 ? Math.min(100,Math.round(b.actual/b.planned*100)) : 0
          return (
            <Card key={b.id} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:5 }}>{b.name}</div>
                  <div style={{ display:'flex', gap:5 }}>
                    <Tag bg="#FEF0E8" color="#C0603A">{b.category}</Tag>
                    <Tag bg={sc} color={stc}>{b.status}</Tag>
                    <Tag>{b.responsible}</Tag>
                  </div>
                </div>
                <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                  <div style={{ fontSize:13, fontWeight:800 }}>{brl(b.actual)}</div>
                  <div style={{ fontSize:10, color:C.muted }}>de {brl(b.planned)}</div>
                  <div style={{ display:'flex', gap:5 }}>
                    <button onClick={() => openEdit(b)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:2, lineHeight:0 }}><Icons.Edit/></button>
                    <button onClick={() => remove(b.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:2, lineHeight:0 }}><Icons.Trash/></button>
                  </div>
                </div>
              </div>
              <div style={{ height:5, background:C.border, borderRadius:100, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background: b.actual>b.planned?'#E03A2E':C.black, borderRadius:100 }}/>
              </div>
              {b.notes ? <p style={{ fontSize:11, color:C.muted, margin:'8px 0 0' }}>{b.notes}</p> : null}
            </Card>
          )
        })
      }
      <Modal open={open} onClose={() => setOpen(false)} title={editId?'Editar orçamento':'Novo orçamento'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: Buffet"/></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Planejado (R$)"><Input value={form.planned} onChange={set('planned')} type="number" placeholder="0"/></Field>
          <Field label="Realizado (R$)"><Input value={form.actual} onChange={set('actual')} type="number" placeholder="0"/></Field>
        </div>
        <Field label="Status">
          <select value={form.status} onChange={e=>set('status')(e.target.value)} style={SEL}>{['Não iniciado','Em andamento','Finalizado'].map(o=><option key={o}>{o}</option>)}</select>
        </Field>
        <Field label="Responsável">
          <select value={form.responsible} onChange={e=>set('responsible')(e.target.value)} style={SEL}>{['Ambos','Erick','Gabi'].map(o=><option key={o}>{o}</option>)}</select>
        </Field>
        <Field label="Notas"><Input value={form.notes} onChange={set('notes')} as="textarea" placeholder="Observações..."/></Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} editId={editId} onDelete={() => { remove(editId); setOpen(false) }}/>
      </Modal>
    </>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const SEL = { width:'100%', background:'rgba(14,14,12,.05)', border:`1.5px solid rgba(14,14,12,.08)`, borderRadius:12, padding:'10px 13px', fontSize:13, fontWeight:600, color:'#0E0E0C', outline:'none', cursor:'pointer' }

function ModalActions({ onSave, onCancel, saveLabel='Salvar', editId, onDelete }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
      {editId && onDelete ? <Btn variant="danger" size="sm" onClick={onDelete}><Icons.Trash/> Excluir</Btn> : <span/>}
      <div style={{ display:'flex', gap:8 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ padding:'9px 16px', borderRadius:12 }}>Cancelar</Btn>
        <Btn onClick={onSave} style={{ padding:'9px 16px', borderRadius:12 }}>{saveLabel}</Btn>
      </div>
    </div>
  )
}
