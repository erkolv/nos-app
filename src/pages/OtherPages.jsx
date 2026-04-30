import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import { C, brl, daysLeft, Card, Btn, Input, Field, Modal, Tag, SubTabs, SecHead, Empty, Spinner, Icons, Grid2, Checkbox, Toggle, ListRow } from '../components/ui'
import { PageShell } from '../components/Layout'

// ─── AGENDA ──────────────────────────────────────────────────────────────────
export function AgendaPage() {
  const [tab, setTab] = useState('compromissos')
  const TABS = [
    { id: 'compromissos', label: 'Compromissos' },
    { id: 'tarefas',      label: 'Tarefas'      },
    { id: 'casamento',    label: '💍 Casamento'  },
    { id: 'viagens',      label: '✈️ Viagens'    },
    { id: 'mercado',      label: '🛒 Mercado'    },
  ]
  return (
    <PageShell>
      <SecHead title="Agenda" />
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'compromissos' && <CompromissosTab />}
      {tab === 'tarefas'      && <TarefasTab />}
      {tab === 'casamento'    && <CasamentoTab />}
      {tab === 'viagens'      && <ViagensTab />}
      {tab === 'mercado'      && <MercadoTab />}
    </PageShell>
  )
}

// ── Compromissos ──────────────────────────────────────────────────────────────
function CompromissosTab() {
  const { data, loading, insert, remove } = useTable('appointments', 'scheduled_at')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', scheduled_at: '', time: '', who: 'Ambos', category: 'Outros' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const CATS = ['Casamento','Saúde','Família','Trabalho','Outros']
  const CAT_COLOR = { Casamento:'#E8F0FE', Saúde:'#E8F5ED', Família:'#FEF0E8', Trabalho:'#F0E8FE', Outros:'rgba(14,14,12,.07)' }
  const CAT_TEXT  = { Casamento:'#2A5AC0', Saúde:'#1a7a3e', Família:'#C0603A', Trabalho:'#8A2AC0', Outros:C.muted }

  async function save() {
    if (!form.title.trim()) return
    await insert(form)
    setForm({ title: '', scheduled_at: '', time: '', who: 'Ambos', category: 'Outros' })
    setOpen(false)
  }

  const sorted = [...data].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Próximos compromissos</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Novo</Btn>
      </div>
      {loading ? <Spinner /> : sorted.length === 0 ? <Empty icon="🗓" title="Nenhum compromisso" subtitle="Adicione o primeiro" /> :
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {sorted.map(a => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:C.white, borderRadius:16, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, fontWeight:800, minWidth:36 }}>{a.time || a.scheduled_at || '—'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{a.title}</div>
                <div style={{ fontSize:11, color:C.muted }}>{a.who}</div>
              </div>
              <Tag bg={CAT_COLOR[a.category]||'rgba(14,14,12,.07)'} color={CAT_TEXT[a.category]||C.muted}>{a.category}</Tag>
              <button onClick={() => remove(a.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
            </div>
          ))}
        </div>
      }
      <Modal open={open} onClose={() => setOpen(false)} title="Novo compromisso">
        <Field label="Título"><Input value={form.title} onChange={set('title')} placeholder="Ex: Visita ao buffet" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Data"><Input value={form.scheduled_at} onChange={set('scheduled_at')} type="date" /></Field>
          <Field label="Hora"><Input value={form.time} onChange={set('time')} type="time" /></Field>
        </div>
        <Field label="Quem vai">
          <Segmented options={['Ambos','Erick','Gabi']} value={form.who} onChange={set('who')} />
        </Field>
        <Field label="Categoria">
          <Segmented options={CATS} value={form.category} onChange={set('category')} />
        </Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

// ── Tarefas ───────────────────────────────────────────────────────────────────
function TarefasTab() {
  const { data, loading, insert, update, remove } = useTable('tasks')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', responsible: 'Ambos', recurrent: false })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const RESP_C = { Erick:['#E8F0FE','#2A5AC0'], Gabi:['#F0E8FE','#8A2AC0'], Ambos:['rgba(14,14,12,.07)',C.muted] }
  const pending = data.filter(t => !t.done)
  const done    = data.filter(t =>  t.done)

  async function save() {
    if (!form.title.trim()) return
    await insert({ ...form, done: false })
    setForm({ title: '', responsible: 'Ambos', recurrent: false })
    setOpen(false)
  }

  const TaskRow = ({ t }) => {
    const [bc, tc] = RESP_C[t.responsible] || RESP_C.Ambos
    return (
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom:`1px solid ${C.border}`, background: t.done ? 'rgba(14,14,12,.02)' : C.white }}>
        <Checkbox checked={t.done} onChange={() => update(t.id, { done: !t.done })} />
        <div style={{ flex:1 }}>
          <span style={{ fontSize:13, fontWeight:600, color: t.done ? C.muted : C.black, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
          {t.recurrent && <span style={{ fontSize:10, color:C.muted, marginLeft:8 }}>↻ recorrente</span>}
        </div>
        <Tag bg={bc} color={tc}>{t.responsible}</Tag>
        <button onClick={() => remove(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
      </div>
    )
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Tarefas da casa</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Adicionar</Btn>
      </div>
      {loading ? <Spinner /> : <>
        <Card style={{ padding:0, overflow:'hidden', marginBottom:12 }}>
          {pending.length === 0
            ? <div style={{ textAlign:'center', padding:'20px 0', color:C.muted, fontSize:13 }}>Tudo em dia! 🎉</div>
            : pending.map(t => <TaskRow key={t.id} t={t} />)
          }
        </Card>
        {done.length > 0 && <>
          <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Concluídas</p>
          <Card style={{ padding:0, overflow:'hidden' }}>
            {done.map(t => <TaskRow key={t.id} t={t} />)}
          </Card>
        </>}
      </>}
      <Modal open={open} onClose={() => setOpen(false)} title="Nova Tarefa">
        <Field label="Tarefa"><Input value={form.title} onChange={set('title')} placeholder="Ex: Limpar banheiro" /></Field>
        <Field label="Responsável"><Segmented options={['Ambos','Erick','Gabi']} value={form.responsible} onChange={set('responsible')} /></Field>
        <Field label="Recorrente?">
          <Toggle checked={form.recurrent} onChange={() => set('recurrent')(!form.recurrent)} label={form.recurrent ? 'Sim, semanal' : 'Não'} />
        </Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

// ── Casamento ─────────────────────────────────────────────────────────────────
function CasamentoTab() {
  const [sub, setSub] = useState('checklist')
  const SUBS = [
    { id:'checklist',    label:'Checklist'     },
    { id:'orcamentos',   label:'Orçamentos'    },
    { id:'fornecedores', label:'Fornecedores'  },
    { id:'convidados',   label:'Convidados'    },
  ]
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>💍 Casamento</span>
        <Tag bg="#FFF4E0" color="#D4882A">some em 09/08</Tag>
      </div>
      <p style={{ fontSize:12, color:C.muted, marginBottom:12 }}>{daysLeft()} dias até o grande dia</p>
      <SubTabs tabs={SUBS} active={sub} onChange={setSub} />
      {sub === 'checklist'    && <ChecklistTab />}
      {sub === 'orcamentos'   && <OrcamentosTab />}
      {sub === 'fornecedores' && <FornecedoresTab />}
      {sub === 'convidados'   && <ConvidadosTab />}
    </div>
  )
}

function ChecklistTab() {
  const { data, loading, insert, update, remove } = useTable('checklist_items')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', group: '3 meses antes' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const GROUPS = ['12+ meses antes','6 meses antes','3 meses antes','1 mês antes','1 semana antes']
  const done  = data.filter(i => i.done).length
  const pct   = data.length > 0 ? Math.round(done / data.length * 100) : 0
  const groups = GROUPS.filter(g => data.some(i => i.group === g))

  async function save() {
    if (!form.title.trim()) return
    await insert({ ...form, done: false })
    setForm({ title: '', group: '3 meses antes' })
    setOpen(false)
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:13, fontWeight:700 }}>{done} de {data.length} concluídos · {pct}%</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Adicionar</Btn>
      </div>
      <div style={{ height:5, background:C.border, borderRadius:100, overflow:'hidden', marginBottom:16 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:C.black, borderRadius:100, transition:'width .5s' }} />
      </div>
      {loading ? <Spinner /> : data.length === 0
        ? <Empty icon="✅" title="Checklist vazio" subtitle="Adicione as tarefas do casamento" />
        : groups.map(g => {
            const items = data.filter(i => i.group === g)
            if (!items.length) return null
            const gDone = items.filter(i => i.done).length
            return (
              <div key={g} style={{ marginBottom:18 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:12 }}>{g}</span>
                  <Tag bg={gDone === items.length ? '#E8F5ED' : 'rgba(14,14,12,.07)'} color={gDone === items.length ? '#1a7a3e' : C.muted}>{gDone}/{items.length}</Tag>
                </div>
                <Card style={{ padding:0, overflow:'hidden' }}>
                  {items.map((item, idx) => (
                    <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom: idx < items.length-1 ? `1px solid ${C.border}` : 'none', background: item.done ? 'rgba(14,14,12,.02)' : C.white }}>
                      <Checkbox checked={item.done} onChange={() => update(item.id, { done: !item.done })} />
                      <span style={{ flex:1, fontSize:13, fontWeight:600, color: item.done ? C.muted : C.black, textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</span>
                      <button onClick={() => remove(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
                    </div>
                  ))}
                </Card>
              </div>
            )
          })
      }
      {/* Items sem group definido */}
      {data.filter(i => !GROUPS.includes(i.group)).length > 0 && (
        <div style={{ marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
            <span style={{ fontWeight:700, fontSize:12 }}>Geral</span>
          </div>
          <Card style={{ padding:0, overflow:'hidden' }}>
            {data.filter(i => !GROUPS.includes(i.group)).map((item, idx, arr) => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom: idx < arr.length-1 ? `1px solid ${C.border}` : 'none', background: item.done ? 'rgba(14,14,12,.02)' : C.white }}>
                <Checkbox checked={item.done} onChange={() => update(item.id, { done: !item.done })} />
                <span style={{ flex:1, fontSize:13, fontWeight:600, color: item.done ? C.muted : C.black, textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</span>
                <button onClick={() => remove(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
              </div>
            ))}
          </Card>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Novo item do checklist">
        <Field label="Fase">
          <Segmented options={GROUPS} value={form.group} onChange={set('group')} wrap />
        </Field>
        <Field label="Tarefa"><Input value={form.title} onChange={set('title')} placeholder="Ex: Contratar fotógrafo" /></Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

function OrcamentosTab() {
  const { data, loading, insert, update, remove } = useTable('budgets')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name:'', category:'Casamento', planned:0, actual:0, status:'Não iniciado', responsible:'Ambos', notes:'' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const tp = data.reduce((s,b) => s + (b.planned||0), 0)
  const ta = data.reduce((s,b) => s + (b.actual||0), 0)

  function openNew() { setForm({ name:'', category:'Casamento', planned:0, actual:0, status:'Não iniciado', responsible:'Ambos', notes:'' }); setEditId(null); setOpen(true) }
  function openEdit(b) { setForm({ ...b }); setEditId(b.id); setOpen(true) }

  async function save() {
    if (!form.name.trim()) return
    const row = { ...form, planned: Number(form.planned)||0, actual: Number(form.actual)||0 }
    if (editId) await update(editId, row)
    else await insert(row)
    setOpen(false)
  }

  const ST_C = { 'Não iniciado':['rgba(14,14,12,.07)',C.muted], 'Em andamento':['#FFF4E0','#D4882A'], 'Finalizado':['#E8F5ED','#1a7a3e'] }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Orçamentos</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus /> Novo</Btn>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
        {[['Planejado', brl(tp), C.black, '#fff'],['Gasto', brl(ta), '#FFF4E0','#D4882A'],['Saldo', brl(tp-ta), '#E8F5ED','#1a7a3e']].map(([l,v,bg,c]) => (
          <div key={l} style={{ borderRadius:16, padding:12, background:bg, border: bg===C.black?'none':`1px solid ${C.border}`, textAlign:'center' }}>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', color: bg===C.black?'rgba(255,255,255,.4)':C.muted, marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:13, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>
      {loading ? <Spinner /> : data.length === 0 ? <Empty icon="💰" title="Nenhum orçamento" subtitle="Adicione itens do seu budget" /> :
        data.map(b => {
          const [sc,stc] = ST_C[b.status] || ST_C['Não iniciado']
          const pct = b.planned > 0 ? Math.min(100, Math.round(b.actual/b.planned*100)) : 0
          return (
            <Card key={b.id} onClick={() => openEdit(b)} style={{ cursor:'pointer', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:5 }}>{b.name}</div>
                  <div style={{ display:'flex', gap:5 }}>
                    <Tag bg="#FEF0E8" color="#C0603A">{b.category}</Tag>
                    <Tag bg={sc} color={stc}>{b.status}</Tag>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:800 }}>{brl(b.actual)}</div>
                  <div style={{ fontSize:10, color:C.muted }}>de {brl(b.planned)}</div>
                </div>
              </div>
              <div style={{ height:5, background:C.border, borderRadius:100, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background: b.actual > b.planned ? '#E03A2E' : C.black, borderRadius:100 }} />
              </div>
              {b.notes ? <p style={{ fontSize:11, color:C.muted, margin:'8px 0 0' }}>{b.notes}</p> : null}
            </Card>
          )
        })
      }
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Editar orçamento' : 'Novo orçamento'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: Buffet" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Planejado (R$)"><Input value={form.planned} onChange={set('planned')} type="number" placeholder="0" /></Field>
          <Field label="Realizado (R$)"><Input value={form.actual} onChange={set('actual')} type="number" placeholder="0" /></Field>
        </div>
        <Field label="Status"><Segmented options={['Não iniciado','Em andamento','Finalizado']} value={form.status} onChange={set('status')} /></Field>
        <Field label="Responsável"><Segmented options={['Ambos','Erick','Gabi']} value={form.responsible} onChange={set('responsible')} /></Field>
        <Field label="Notas"><Input value={form.notes} onChange={set('notes')} as="textarea" placeholder="Observações..." /></Field>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
          {editId ? <Btn variant="danger" size="sm" onClick={() => { remove(editId); setOpen(false) }}>Excluir</Btn> : <span />}
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="secondary" onClick={() => setOpen(false)} style={{ padding:'9px 16px', borderRadius:12 }}>Cancelar</Btn>
            <Btn onClick={save} style={{ padding:'9px 16px', borderRadius:12 }}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

function FornecedoresTab() {
  const { data, loading, insert, update, remove } = useTable('vendors')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name:'', category:'Fotografia', status:'Pesquisando', price:0, contact:'', website:'', notes:'' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const CATS = ['Fotografia','Buffet','Decoração','Música','Vestido','Traje','Cerimonialista','Local','Convites','Outros']
  const ST_C = { Contratado:['#E8F5ED','#1a7a3e'], Negociando:['#FFF4E0','#D4882A'], Descartado:['#FEE8E2','#E03A2E'], Pesquisando:['rgba(14,14,12,.07)',C.muted] }

  function openNew() { setForm({ name:'', category:'Fotografia', status:'Pesquisando', price:0, contact:'', website:'', notes:'' }); setEditId(null); setOpen(true) }
  function openEdit(v) { setForm({ ...v }); setEditId(v.id); setOpen(true) }

  async function save() {
    if (!form.name.trim()) return
    const row = { ...form, price: Number(form.price)||0 }
    if (editId) await update(editId, row)
    else await insert(row)
    setOpen(false)
  }

  const cats = [...new Set(data.map(v => v.category))]

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Fornecedores</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus /> Adicionar</Btn>
      </div>
      {loading ? <Spinner /> : data.length === 0 ? <Empty icon="🤝" title="Nenhum fornecedor" subtitle="Adicione fotógrafos, buffets..." /> :
        cats.map(cat => (
          <div key={cat} style={{ marginBottom:16 }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>{cat}</p>
            <Card style={{ padding:0, overflow:'hidden' }}>
              {data.filter(v => v.category === cat).map((v, i, arr) => {
                const [bc,btc] = ST_C[v.status] || ST_C.Pesquisando
                return (
                  <div key={v.id} onClick={() => openEdit(v)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom: i<arr.length-1?`1px solid ${C.border}`:'none', cursor:'pointer' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{v.name}</div>
                      <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                        <Tag bg={bc} color={btc}>{v.status}</Tag>
                        {v.contact && <span style={{ fontSize:11, color:C.muted }}>{v.contact}</span>}
                      </div>
                    </div>
                    {v.price > 0 && <div style={{ fontSize:13, fontWeight:800 }}>{brl(v.price)}</div>}
                  </div>
                )
              })}
            </Card>
          </div>
        ))
      }
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Editar fornecedor' : 'Novo fornecedor'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: Studio Ícaro" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Categoria">
            <select value={form.category} onChange={e => set('category')(e.target.value)} style={SEL}>
              {CATS.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set('status')(e.target.value)} style={SEL}>
              {['Pesquisando','Negociando','Contratado','Descartado'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Valor (R$)"><Input value={form.price} onChange={set('price')} type="number" placeholder="0" /></Field>
          <Field label="Contato"><Input value={form.contact} onChange={set('contact')} placeholder="(11) 99999-9999" /></Field>
        </div>
        <Field label="Site / Instagram"><Input value={form.website} onChange={set('website')} placeholder="https://..." /></Field>
        <Field label="Notas"><Input value={form.notes} onChange={set('notes')} as="textarea" placeholder="Impressões, detalhes..." /></Field>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
          {editId ? <Btn variant="danger" size="sm" onClick={() => { remove(editId); setOpen(false) }}>Excluir</Btn> : <span />}
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="secondary" onClick={() => setOpen(false)} style={{ padding:'9px 16px', borderRadius:12 }}>Cancelar</Btn>
            <Btn onClick={save} style={{ padding:'9px 16px', borderRadius:12 }}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

function ConvidadosTab() {
  const { data, loading, insert, update, remove } = useTable('guests')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name:'', group:'', guests_count:1, status:'Aguardando' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  const confirmed = data.filter(g => g.status === 'Confirmado').reduce((s,g) => s+(g.guests_count||1), 0)
  const total     = data.reduce((s,g) => s+(g.guests_count||1), 0)

  async function save() {
    if (!form.name.trim()) return
    await insert({ ...form, guests_count: Number(form.guests_count)||1 })
    setForm({ name:'', group:'', guests_count:1, status:'Aguardando' })
    setOpen(false)
  }

  const ST_C = { Confirmado:['#E8F5ED','#1a7a3e'], Aguardando:['#FFF4E0','#D4882A'], Recusou:['#FEE8E2','#E03A2E'] }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Convidados</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Adicionar</Btn>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[['Total',total,C.black,'#fff'],['Confirmados',confirmed,'#E8F5ED','#1a7a3e'],['Aguardando',total-confirmed,'#FFF4E0','#D4882A']].map(([l,v,bg,c]) => (
          <div key={l} style={{ flex:1, borderRadius:16, padding:12, background:bg, border: bg===C.black?'none':`1px solid ${C.border}`, textAlign:'center' }}>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', color: bg===C.black?'rgba(255,255,255,.4)':C.muted, marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:18, fontWeight:900, color:c }}>{v}</div>
          </div>
        ))}
      </div>
      {loading ? <Spinner /> : data.length === 0 ? <Empty icon="👥" title="Nenhum convidado" subtitle="Adicione os convidados" /> :
        <Card style={{ padding:0, overflow:'hidden' }}>
          {data.map((g, i) => {
            const [bc,btc] = ST_C[g.status] || ST_C.Aguardando
            return (
              <div key={g.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', borderBottom: i<data.length-1?`1px solid ${C.border}`:'none' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{g.name}</div>
                  {g.group && <div style={{ fontSize:11, color:C.muted }}>{g.group}</div>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.muted }}>{g.guests_count} pessoa{g.guests_count>1?'s':''}</span>
                  <select value={g.status} onChange={e => update(g.id, { status: e.target.value })} style={{ ...SEL, width:'auto', padding:'4px 8px', fontSize:11 }}>
                    {['Aguardando','Confirmado','Recusou'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <button onClick={() => remove(g.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
                </div>
              </div>
            )
          })}
        </Card>
      }
      <Modal open={open} onClose={() => setOpen(false)} title="Novo convidado">
        <Field label="Nome / Família"><Input value={form.name} onChange={set('name')} placeholder="Ex: Família Silva" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Grupo"><Input value={form.group} onChange={set('group')} placeholder="Ex: Família da noiva" /></Field>
          <Field label="Nº pessoas"><Input value={form.guests_count} onChange={set('guests_count')} type="number" placeholder="1" /></Field>
        </div>
        <Field label="Status"><Segmented options={['Aguardando','Confirmado','Recusou']} value={form.status} onChange={set('status')} /></Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

// ── Viagens ───────────────────────────────────────────────────────────────────
function ViagensTab() {
  const { data, loading, insert, update, remove } = useTable('trips')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ destination:'', start_date:'', end_date:'', budget:0, status:'Planejando', notes:'' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.destination.trim()) return
    await insert({ ...form, budget: Number(form.budget)||0 })
    setForm({ destination:'', start_date:'', end_date:'', budget:0, status:'Planejando', notes:'' })
    setOpen(false)
  }

  const ST_C = { Planejando:'#C5E8F0', Confirmado:'#E8F5ED', Aconteceu:'#F0E8FE' }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>✈️ Viagens</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Nova viagem</Btn>
      </div>
      {loading ? <Spinner /> : data.length === 0 ? <Empty icon="✈️" title="Nenhuma viagem" subtitle="Planeje o próximo destino" /> :
        data.map(t => (
          <div key={t.id} style={{ background: ST_C[t.status]||'#C5E8F0', borderRadius:22, padding:20, marginBottom:10, cursor:'pointer' }} onClick={() => setSelected(t.id === selected ? null : t.id)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <div style={{ fontSize:20, fontWeight:900, color:C.black, letterSpacing:'-1px' }}>{t.destination}</div>
                <div style={{ fontSize:11, color:'rgba(14,14,12,.5)', marginTop:3 }}>{t.start_date} → {t.end_date}</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <Tag bg="rgba(14,14,12,.1)" color={C.black}>{t.status}</Tag>
                <button onClick={e => { e.stopPropagation(); remove(t.id) }} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:2, lineHeight:0 }}><Icons.Trash /></button>
              </div>
            </div>
            {t.budget > 0 && <div style={{ fontSize:13, fontWeight:700, color:C.black }}>{brl(t.budget)} planejado</div>}
            {t.notes && <p style={{ fontSize:12, color:'rgba(14,14,12,.5)', margin:'8px 0 0' }}>{t.notes}</p>}
          </div>
        ))
      }
      <Modal open={open} onClose={() => setOpen(false)} title="Nova viagem">
        <Field label="Destino"><Input value={form.destination} onChange={set('destination')} placeholder="Ex: Portugal 🇵🇹" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Data ida"><Input value={form.start_date} onChange={set('start_date')} type="date" /></Field>
          <Field label="Data volta"><Input value={form.end_date} onChange={set('end_date')} type="date" /></Field>
        </div>
        <Field label="Orçamento (R$)"><Input value={form.budget} onChange={set('budget')} type="number" placeholder="0" /></Field>
        <Field label="Status"><Segmented options={['Planejando','Confirmado','Aconteceu']} value={form.status} onChange={set('status')} /></Field>
        <Field label="Notas"><Input value={form.notes} onChange={set('notes')} as="textarea" placeholder="Hospedagem, roteiro..." /></Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

// ── Mercado ───────────────────────────────────────────────────────────────────
function MercadoTab() {
  const { data, loading, insert, update, remove } = useTable('market_items')
  const [input, setInput] = useState('')

  const CAT_EMOJI = { Laticínios:'🥛', Padaria:'🍞', Carnes:'🥩', Hortifruti:'🥦', Higiene:'🧴', Bebidas:'🧃', Outros:'🛒' }
  function autoCat(t) {
    const l = t.toLowerCase()
    if (['leite','queijo','iogurte','manteiga'].some(k=>l.includes(k))) return 'Laticínios'
    if (['pão','bolo','biscoito'].some(k=>l.includes(k))) return 'Padaria'
    if (['frango','carne','peixe','ovo'].some(k=>l.includes(k))) return 'Carnes'
    if (['alface','tomate','batata','cenoura','fruta','banana','maçã'].some(k=>l.includes(k))) return 'Hortifruti'
    if (['shampoo','sabonete','pasta','papel'].some(k=>l.includes(k))) return 'Higiene'
    if (['suco','água','cerveja','vinho','refrigerante'].some(k=>l.includes(k))) return 'Bebidas'
    return 'Outros'
  }
  async function add() {
    if (!input.trim()) return
    await insert({ title: input.trim(), category: autoCat(input), done: false })
    setInput('')
  }
  const pending = data.filter(i => !i.done)
  const done    = data.filter(i =>  i.done)
  const cats    = [...new Set(pending.map(i => i.category))]

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>🛒 Mercado</span>
        {done.length > 0 && <Btn variant="ghost" size="sm" onClick={() => done.forEach(i => remove(i.id))}>Limpar ✓</Btn>}
      </div>
      <Card style={{ padding:'11px 13px', marginBottom:14 }}>
        <div style={{ display:'flex', gap:8 }}>
          <Input value={input} onChange={setInput} placeholder="Adicionar item..." style={{ borderRadius:10, fontSize:12 }}
            onKeyDown={e => e.key === 'Enter' && add()} />
          <Btn onClick={add} style={{ width:38, padding:0, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icons.Plus /></Btn>
        </div>
      </Card>
      {loading ? <Spinner /> : <>
        {cats.map(cat => (
          <div key={cat} style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:C.muted, marginBottom:7 }}>{CAT_EMOJI[cat]||'•'} {cat}</div>
            <Card style={{ padding:0, overflow:'hidden' }}>
              {pending.filter(i => i.category === cat).map((item, idx, arr) => (
                <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom: idx<arr.length-1?`1px solid ${C.border}`:'none' }}>
                  <Checkbox checked={false} onChange={() => update(item.id, { done: true })} />
                  <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{item.title}</span>
                  <button onClick={() => remove(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
                </div>
              ))}
            </Card>
          </div>
        ))}
        {done.length > 0 && <>
          <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>No carrinho</p>
          <Card style={{ padding:0, overflow:'hidden' }}>
            {done.map((item,i) => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom: i<done.length-1?`1px solid ${C.border}`:'none', background:'rgba(14,14,12,.02)' }}>
                <Checkbox checked onChange={() => update(item.id, { done: false })} />
                <span style={{ flex:1, fontSize:13, fontWeight:600, color:C.muted, textDecoration:'line-through' }}>{item.title}</span>
              </div>
            ))}
          </Card>
        </>}
        {data.length === 0 && <Empty icon="🛒" title="Lista vazia" subtitle="Adicione itens acima" />}
      </>}
    </>
  )
}

// ─── OBJETIVOS ───────────────────────────────────────────────────────────────
export function ObjetivosPage() {
  const [tab, setTab] = useState('grandes')
  const TABS = [
    { id:'grandes',  label:'Grandes'  },
    { id:'medios',   label:'Médios'   },
    { id:'habitos',  label:'Hábitos'  },
    { id:'checkin',  label:'Check-in' },
    { id:'memorias', label:'Memórias' },
  ]
  return (
    <PageShell>
      <SecHead title="Objetivos" />
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'grandes'  && <GrandesTab />}
      {tab === 'medios'   && <MediosTab />}
      {tab === 'habitos'  && <HabitosTab />}
      {tab === 'checkin'  && <CheckinTab />}
      {tab === 'memorias' && <MemoriasTab />}
    </PageShell>
  )
}

function GrandesTab() {
  const { data, loading, insert, update, remove } = useTable('dreams')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [aportOpen, setAportOpen] = useState(null)
  const [aporte, setAporte] = useState('')
  const [form, setForm] = useState({ title:'', description:'', why:'', estimated_value:'', progress:0, term:'Médio', priority:'Média', type:'Meta' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  function openNew() { setForm({ title:'', description:'', why:'', estimated_value:'', progress:0, term:'Médio', priority:'Média', type:'Meta' }); setEditId(null); setOpen(true) }
  function openEdit(d) { setForm({ ...d, estimated_value: d.estimated_value||'' }); setEditId(d.id); setOpen(true) }

  async function save() {
    if (!form.title.trim()) return
    const row = { ...form, estimated_value: Number(form.estimated_value)||0, progress: Number(form.progress)||0 }
    if (editId) await update(editId, row)
    else await insert(row)
    setOpen(false)
  }

  async function registrarAporte(d) {
    const val = Number(aporte)||0
    if (!val) return
    const newProg = Math.min(100, Math.round((((d.progress||0)/100*d.estimated_value) + val) / d.estimated_value * 100))
    await update(d.id, { progress: newProg })
    setAportOpen(null); setAporte('')
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Grandes objetivos</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus /> Novo</Btn>
      </div>
      {loading ? <Spinner /> : data.length === 0 ? <Empty icon="✨" title="Nenhum objetivo ainda" subtitle="Adicione os sonhos de vocês" /> :
        data.map(d => (
          <Card key={d.id} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
                  <Tag bg="#E8F0FE" color="#2A5AC0">{d.type}</Tag>
                  <Tag bg={d.priority==='Alta'?'#FEE8E2':d.priority==='Média'?'#FFF4E0':'#E8F5ED'} color={d.priority==='Alta'?'#E03A2E':d.priority==='Média'?'#D4882A':'#1a7a3e'}>{d.priority}</Tag>
                  <Tag>{d.term} prazo</Tag>
                </div>
                <div style={{ fontSize:18, fontWeight:900, letterSpacing:'-.5px', marginBottom:2 }}>{d.title}</div>
                {d.description && <p style={{ fontSize:12, color:C.muted, margin:0 }}>{d.description}</p>}
              </div>
              <button onClick={() => openEdit(d)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Edit /></button>
            </div>
            {d.estimated_value > 0 && (
              <div style={{ display:'flex', gap:16, marginBottom:12 }}>
                <div><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:C.muted, marginBottom:2 }}>Meta</div><div style={{ fontWeight:800 }}>{brl(d.estimated_value)}</div></div>
                <div><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:C.muted, marginBottom:2 }}>Acumulado</div><div style={{ fontWeight:800, color:'#2ECC71' }}>{brl((d.progress||0)/100*(d.estimated_value||0))}</div></div>
                <div><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:C.muted, marginBottom:2 }}>Falta</div><div style={{ fontWeight:800, color:'#E03A2E' }}>{brl((1-(d.progress||0)/100)*(d.estimated_value||0))}</div></div>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:11, fontWeight:600 }}>
              <span style={{ color:C.muted }}>Progresso</span><span>{d.progress||0}%</span>
            </div>
            <div style={{ height:5, background:C.border, borderRadius:100, overflow:'hidden', marginBottom:12 }}>
              <div style={{ height:'100%', width:`${d.progress||0}%`, background:C.black, borderRadius:100, transition:'width .5s' }} />
            </div>
            {d.why && <div style={{ background:'rgba(14,14,12,.04)', borderRadius:13, padding:'11px 13px', borderLeft:'3px solid rgba(14,14,12,.12)', marginBottom:12 }}><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:C.muted, marginBottom:4 }}>Por que importa?</div><p style={{ fontSize:12, margin:0, fontStyle:'italic' }}>{d.why}</p></div>}
            <div style={{ display:'flex', gap:7 }}>
              <Btn variant="secondary" size="sm" style={{ flex:1, justifyContent:'center' }} onClick={() => { setAportOpen(d.id); setAporte('') }}>+ Registrar aporte</Btn>
              <Btn variant="danger" size="sm" onClick={() => remove(d.id)}>Excluir</Btn>
            </div>
            {aportOpen === d.id && (
              <div style={{ marginTop:12, display:'flex', gap:8 }}>
                <Input value={aporte} onChange={setAporte} type="number" placeholder="Valor do aporte (R$)" style={{ borderRadius:10 }} />
                <Btn size="sm" onClick={() => registrarAporte(d)}>OK</Btn>
                <Btn variant="secondary" size="sm" onClick={() => setAportOpen(null)}>✕</Btn>
              </div>
            )}
          </Card>
        ))
      }
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Editar objetivo' : 'Novo objetivo'}>
        <Field label="Título"><Input value={form.title} onChange={set('title')} placeholder="Ex: Casa própria" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Tipo"><Segmented options={['Meta','Sonho']} value={form.type} onChange={set('type')} /></Field>
          <Field label="Prioridade"><Segmented options={['Alta','Média','Baixa']} value={form.priority} onChange={set('priority')} /></Field>
          <Field label="Prazo"><Segmented options={['Curto','Médio','Longo']} value={form.term} onChange={set('term')} /></Field>
          <Field label="Valor meta (R$)"><Input value={form.estimated_value} onChange={set('estimated_value')} type="number" placeholder="0" /></Field>
        </div>
        <Field label="Descrição"><Input value={form.description} onChange={set('description')} as="textarea" placeholder="Descreva o objetivo..." /></Field>
        <Field label="Por que isso importa?"><Input value={form.why} onChange={set('why')} as="textarea" placeholder="Escrevam juntos o motivo..." /></Field>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
          {editId ? <Btn variant="danger" size="sm" onClick={() => { remove(editId); setOpen(false) }}>Excluir</Btn> : <span />}
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="secondary" onClick={() => setOpen(false)} style={{ padding:'9px 16px', borderRadius:12 }}>Cancelar</Btn>
            <Btn onClick={save} style={{ padding:'9px 16px', borderRadius:12 }}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

function MediosTab() {
  const { data, loading, insert, update, remove } = useTable('dreams')
  const medios = data.filter(d => d.term === 'Médio' || d.category === 'medio')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title:'', estimated_value:'', progress:0, target_date:'', term:'Médio' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) return
    await insert({ ...form, estimated_value: Number(form.estimated_value)||0, type:'Meta', priority:'Média', term:'Médio' })
    setForm({ title:'', estimated_value:'', progress:0, target_date:'', term:'Médio' })
    setOpen(false)
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Objetivos médios</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Novo</Btn>
      </div>
      {loading ? <Spinner /> : medios.length === 0 ? <Empty icon="⭐" title="Nenhum objetivo médio" subtitle="Adicione metas de médio prazo" /> :
        medios.map(d => (
          <Card key={d.id} style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ fontSize:14, fontWeight:800 }}>{d.title}</div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {d.target_date && <Tag bg="#FFF4E0" color="#D4882A">{d.target_date}</Tag>}
                <button onClick={() => remove(d.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
              </div>
            </div>
            {d.estimated_value > 0 && <div style={{ display:'flex', gap:12, fontSize:12, marginBottom:8 }}><span>Meta: <strong>{brl(d.estimated_value)}</strong></span><span>Acumulado: <strong style={{ color:'#2ECC71' }}>{brl((d.progress||0)/100*d.estimated_value)}</strong></span></div>}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:11, fontWeight:600 }}><span style={{ color:C.muted }}>Progresso</span><span>{d.progress||0}%</span></div>
            <div style={{ height:5, background:C.border, borderRadius:100, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${d.progress||0}%`, background:(d.progress||0)>=60?'#2ECC71':C.black, borderRadius:100 }} />
            </div>
          </Card>
        ))
      }
      <Modal open={open} onClose={() => setOpen(false)} title="Novo objetivo médio">
        <Field label="Título"><Input value={form.title} onChange={set('title')} placeholder="Ex: Trocar o carro" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Valor meta (R$)"><Input value={form.estimated_value} onChange={set('estimated_value')} type="number" placeholder="0" /></Field>
          <Field label="Data alvo"><Input value={form.target_date} onChange={set('target_date')} type="date" /></Field>
        </div>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

function HabitosTab() {
  const { data, loading, insert, update, remove } = useTable('habits')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title:'', subtitle:'', streak:0, responsible:'Ambos' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) return
    await insert({ ...form, streak: 0 })
    setForm({ title:'', subtitle:'', streak:0, responsible:'Ambos' })
    setOpen(false)
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Hábitos</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Novo</Btn>
      </div>
      {loading ? <Spinner /> : data.length === 0 ? <Empty icon="🔥" title="Nenhum hábito" subtitle="Adicione hábitos para acompanhar" /> :
        data.map(h => (
          <Card key={h.id} style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800 }}>{h.title}</div>
                {h.subtitle && <div style={{ fontSize:11, color:C.muted }}>{h.subtitle}</div>}
                <Tag style={{ marginTop:5 }}>{h.responsible}</Tag>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                <div style={{ fontSize:22, fontWeight:900, color:(h.streak||0)>4?'#2ECC71':'#FF9F0A' }}>{h.streak||0}🔥</div>
                <div style={{ display:'flex', gap:5 }}>
                  <Btn size="sm" onClick={() => update(h.id, { streak: (h.streak||0)+1 })}>+1</Btn>
                  <button onClick={() => remove(h.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, lineHeight:0 }}><Icons.Trash /></button>
                </div>
              </div>
            </div>
          </Card>
        ))
      }
      <Modal open={open} onClose={() => setOpen(false)} title="Novo hábito">
        <Field label="Hábito"><Input value={form.title} onChange={set('title')} placeholder="Ex: Academia 3x por semana" /></Field>
        <Field label="Descrição"><Input value={form.subtitle} onChange={set('subtitle')} placeholder="Ex: Para manter a saúde" /></Field>
        <Field label="Responsável"><Segmented options={['Ambos','Erick','Gabi']} value={form.responsible} onChange={set('responsible')} /></Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

function CheckinTab() {
  const { data, loading, insert } = useTable('checkins', 'week')
  const [answers, setAnswers] = useState({ feeling:'', bothered:'', liked:'' })
  const setA = k => v => setAnswers(p => ({ ...p, [k]: v }))

  const weekKey = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0,10) })()
  const myAnswer = data.find(c => c.week === weekKey)
  const partnerAnswer = data.filter(c => c.week === weekKey).find(c => c.id !== myAnswer?.id)
  const both = myAnswer && partnerAnswer

  const QS = [
    { id:'feeling',  label:'Como você se sentiu essa semana?',   ph:'Descreva com sinceridade...' },
    { id:'bothered', label:'Algo te incomodou?',                  ph:'Pode ser qualquer coisa...'  },
    { id:'liked',    label:'Algo que você gostou essa semana?',   ph:'Um momento, uma atitude...'  },
  ]

  async function submit() {
    if (!answers.feeling.trim()) return
    await insert({ week: weekKey, answers })
    setAnswers({ feeling:'', bothered:'', liked:'' })
  }

  return (
    <>
      <div style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>Check-in semanal</div>
      <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>3 perguntas, uma vez por semana</p>
      <Card variant="dark" style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'rgba(255,255,255,.3)', marginBottom:8 }}>Esta semana</div>
        <div style={{ display:'flex', gap:16 }}>
          {[['Você', !!myAnswer],['Parceiro(a)', !!partnerAnswer]].map(([nm,done]) => (
            <span key={nm} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color: done?'rgba(255,255,255,.7)':'rgba(255,255,255,.4)' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background: done?'#CEFF00':'rgba(255,255,255,.2)', display:'inline-block' }} />
              {nm} {done?'✓':'pendente'}
            </span>
          ))}
        </div>
      </Card>

      {both ? (
        <div>
          <div style={{ background:'#E8F5ED', borderRadius:18, padding:'12px 16px', marginBottom:14, textAlign:'center' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#1a7a3e' }}>Ambos responderam 💚 Aqui estão as respostas:</span>
          </div>
          {QS.map(q => (
            <Card key={q.id} style={{ marginBottom:10 }}>
              <p style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>{q.label}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['Você', myAnswer],['Parceiro(a)', partnerAnswer]].map(([nm,ci]) => (
                  <div key={nm} style={{ background:'rgba(14,14,12,.04)', borderRadius:12, padding:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:C.muted, marginBottom:5 }}>{nm}</div>
                    <p style={{ fontSize:13, margin:0 }}>{ci?.answers?.[q.id]||'—'}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : myAnswer ? (
        <Card variant="warm" style={{ textAlign:'center', padding:'28px 24px' }}>
          <div style={{ fontSize:28, marginBottom:10 }}>✓</div>
          <div style={{ fontSize:15, fontWeight:800, marginBottom:5 }}>Você já respondeu!</div>
          <p style={{ fontSize:12, color:C.muted, margin:0 }}>Aguardando o(a) parceiro(a). As respostas aparecem quando ambos concluírem.</p>
        </Card>
      ) : (
        <Card>
          {QS.map(q => (
            <Field key={q.id} label={q.label}>
              <Input value={answers[q.id]} onChange={setA(q.id)} as="textarea" placeholder={q.ph} style={{ minHeight:70 }} />
            </Field>
          ))}
          <Btn onClick={submit} disabled={!answers.feeling.trim()} style={{ width:'100%', justifyContent:'center', borderRadius:14, padding:13, fontSize:13, marginTop:4 }}>
            Enviar respostas
          </Btn>
        </Card>
      )}
    </>
  )
}

function MemoriasTab() {
  const { data, loading, insert, remove } = useTable('memories')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title:'', date:'', text:'', emoji:'💍' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))
  const EMOJIS = ['💍','💛','✈️','🏠','🌊','🎉','🌿','🌙','☀️','📸','🐾','🎂']

  async function save() {
    if (!form.title.trim()) return
    await insert(form)
    setForm({ title:'', date:'', text:'', emoji:'💍' })
    setOpen(false)
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:800 }}>Memórias</span>
        <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}><Icons.Plus /> Registrar</Btn>
      </div>
      {loading ? <Spinner /> : data.length === 0 ? <Empty icon="📸" title="Nenhuma memória" subtitle="Registre momentos especiais" /> :
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[...data].sort((a,b) => new Date(b.date||0)-new Date(a.date||0)).map(m => (
            <Card key={m.id} variant="warm" style={{ position:'relative' }}>
              <div style={{ fontSize:28, marginBottom:7 }}>{m.emoji}</div>
              <div style={{ fontSize:14, fontWeight:800, marginBottom:2 }}>{m.title}</div>
              {m.date && <div style={{ fontSize:10, color:C.muted, fontWeight:600, marginBottom:5 }}>{new Date(m.date+'T12:00').toLocaleDateString('pt-BR')}</div>}
              <p style={{ fontSize:11, color:C.muted, margin:0, lineHeight:1.5 }}>{m.text}</p>
              <button onClick={() => remove(m.id)} style={{ position:'absolute', top:10, right:10, background:'none', border:'none', cursor:'pointer', color:C.muted, opacity:.5, padding:2, lineHeight:0 }}><Icons.Trash /></button>
            </Card>
          ))}
        </div>
      }
      <Modal open={open} onClose={() => setOpen(false)} title="Nova Memória">
        <Field label="Título"><Input value={form.title} onChange={set('title')} placeholder="Ex: Pedido de noivado" /></Field>
        <Field label="Data"><Input value={form.date} onChange={set('date')} type="date" /></Field>
        <Field label="O que aconteceu?"><Input value={form.text} onChange={set('text')} as="textarea" placeholder="Descreva o momento..." /></Field>
        <Field label="Emoji">
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => set('emoji')(e)} style={{ width:36, height:36, borderRadius:10, border:`1.5px solid ${form.emoji===e?C.black:C.border}`, background: form.emoji===e?'rgba(14,14,12,.07)':'transparent', fontSize:18, cursor:'pointer' }}>{e}</button>
            ))}
          </div>
        </Field>
        <ModalActions onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}

// ─── SHARED HELPERS ──────────────────────────────────────────────────────────
const SEL = { width:'100%', background:'rgba(14,14,12,.05)', border:`1.5px solid rgba(14,14,12,.08)`, borderRadius:12, padding:'10px 13px', fontSize:13, fontWeight:600, color:'#0E0E0C', outline:'none', cursor:'pointer' }

function Segmented({ options, value, onChange, wrap }) {
  return (
    <div style={{ display:'flex', gap:5, flexWrap: wrap ? 'wrap' : 'nowrap' }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          padding:'7px 12px', borderRadius:100, border:`1.5px solid ${value===o?'#0E0E0C':'rgba(14,14,12,.1)'}`,
          background: value===o?'#0E0E0C':'transparent', color: value===o?'#CEFF00':'#0E0E0C',
          fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
        }}>{o}</button>
      ))}
    </div>
  )
}

function ModalActions({ onSave, onCancel, saveLabel = 'Salvar' }) {
  return (
    <div style={{ display:'flex', gap:8, marginTop:8 }}>
      <Btn onClick={onSave} style={{ flex:1, justifyContent:'center', borderRadius:14, padding:12, fontSize:13 }}>{saveLabel}</Btn>
      <Btn variant="secondary" onClick={onCancel} style={{ padding:'12px 18px', borderRadius:14 }}>Cancelar</Btn>
    </div>
  )
}
