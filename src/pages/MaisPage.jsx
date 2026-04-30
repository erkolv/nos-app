import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTable } from '../hooks/useTable'
import { supabase } from '../lib/supabase'
import { C, brl, Card, Btn, Input, Field, Modal, Tag, SubTabs, SecHead, Empty, Spinner, Icons, Toggle } from '../components/ui'
import { PageShell } from '../components/Layout'

export default function MaisPage() {
  const location = useLocation()
  // permite navegação direta para aba via state
  const initialTab = location.state?.tab || 'cameras'
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    if (location.state?.tab) setTab(location.state.tab)
  }, [location.state?.tab])

  const TABS = [
    { id:'cameras', label:'📷 Câmeras' },
    { id:'pet',     label:'🐾 Pet'     },
    { id:'docs',    label:'Documentos' },
    { id:'notas',   label:'Notas'      },
    { id:'perfil',  label:'⚙️ Perfil'  },
  ]
  return (
    <PageShell>
      <SecHead title="Mais"/>
      <SubTabs tabs={TABS} active={tab} onChange={setTab}/>
      {tab==='cameras' && <CamerasTab/>}
      {tab==='pet'     && <PetTab/>}
      {tab==='docs'    && <DocsTab/>}
      {tab==='notas'   && <NotasTab/>}
      {tab==='perfil'  && <PerfilTab/>}
    </PageShell>
  )
}

const SEL = { width:'100%', background:'rgba(14,14,12,.05)', border:`1.5px solid rgba(14,14,12,.08)`, borderRadius:12, padding:'10px 13px', fontSize:13, fontWeight:600, color:'#0E0E0C', outline:'none', cursor:'pointer', fontFamily:'inherit' }

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

// ── CÂMERAS ───────────────────────────────────────────────────────────────────
function CamerasTab() {
  const { data, loading, insert, update, remove } = useTable('cameras')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { name:'', location:'', stream_url:'', status:'Online', notes:'' }
  const [form, setForm] = useState(blank)
  const set = k => v => setForm(p=>({...p,[k]:v}))

  function openNew()   { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(c) { setForm({...c}); setEditId(c.id); setOpen(true) }
  async function save() {
    if (!form.name.trim()) return
    if (editId) await update(editId, form); else await insert(form)
    setOpen(false)
  }

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <span style={{fontSize:15,fontWeight:800}}>📷 Câmeras</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Adicionar</Btn>
      </div>
      <div style={{background:'linear-gradient(135deg,#1A1A18,#0E3060)',borderRadius:20,padding:16,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',marginBottom:8}}>Integração futura com Casa Inteligente</div>
        <div style={{display:'flex',gap:8}}>
          {[['📷','Entrada','Online'],['📷','Garagem','Offline'],['📷','Fundos','Online']].map(([ic,nm,st])=>(
            <div key={nm} style={{flex:1,background:'rgba(255,255,255,.08)',borderRadius:12,padding:12,textAlign:'center'}}>
              <div style={{fontSize:14,marginBottom:4}}>{ic}</div>
              <div style={{fontSize:11,fontWeight:700,color:'#fff'}}>{nm}</div>
              <div style={{fontSize:10,fontWeight:800,color:st==='Online'?C.lime:'#FF4D4D'}}>● {st}</div>
            </div>
          ))}
        </div>
      </div>
      {loading ? <Spinner/> : data.length===0 ? <Empty icon="📷" title="Nenhuma câmera" subtitle="Cadastre câmeras de segurança"/> :
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {data.map(cam=>(
            <Card key={cam.id}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:10,background:'rgba(14,14,12,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <Tag bg={cam.status==='Online'?'#E8F5ED':'#FEE8E2'} color={cam.status==='Online'?'#1a7a3e':C.err}>{cam.status}</Tag>
              </div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{cam.name}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{cam.location}</div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>openEdit(cam)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Edit/></button>
                <button onClick={()=>remove(cam.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Trash/></button>
              </div>
            </Card>
          ))}
        </div>
      }
      <Modal open={open} onClose={()=>setOpen(false)} title={editId?'Editar câmera':'Nova câmera'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: Entrada principal"/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Localização"><Input value={form.location} onChange={set('location')} placeholder="Porta da frente"/></Field>
          <Field label="Status"><select value={form.status} onChange={e=>set('status')(e.target.value)} style={SEL}>{['Online','Offline','Manutenção'].map(o=><option key={o}>{o}</option>)}</select></Field>
        </div>
        <Field label="URL do stream (opcional)"><Input value={form.stream_url} onChange={set('stream_url')} placeholder="rtsp://..."/></Field>
        <Field label="Notas"><Input value={form.notes} onChange={set('notes')} as="textarea" placeholder="Modelo, senha WiFi..."/></Field>
        <ModalActions onSave={save} onCancel={()=>setOpen(false)} editId={editId} onDelete={()=>{remove(editId);setOpen(false)}}/>
      </Modal>
    </>
  )
}

// ── PET ───────────────────────────────────────────────────────────────────────
function PetTab() {
  const { coupleId } = useAuth()
  const { data: pets, loading: pLoad, insert: pInsert, update: pUpdate, remove: pRemove } = useTable('pets')
  const { data: vaccines, insert: vInsert, update: vUpdate, remove: vRemove } = useTable('pet_vaccines')
  const { data: petExpenses, insert: peInsert, remove: peRemove } = useTable('pet_expenses')
  const { data: racaoRows, insert: rInsert, update: rUpdate } = useTable('rac_data')

  const [petOpen, setPetOpen]     = useState(false)
  const [petEditId, setPetEditId] = useState(null)
  const [vacOpen, setVacOpen]     = useState(false)
  const [vacEditId, setVacEditId] = useState(null)
  const [expOpen, setExpOpen]     = useState(false)
  const [racOpen, setRacOpen]     = useState(false)
  const [activePetId, setActivePetId] = useState(null)
  const fileRef = useRef()

  const blankPet = { name:'', species:'Cachorro', breed:'', birthdate:'', photo_url:'' }
  const [petForm, setPetForm] = useState(blankPet)
  const setPF = k => v => setPetForm(p=>({...p,[k]:v}))

  const blankVac = { name:'', applied_at:'', next_at:'', vet:'', cost:'', pet_id:'' }
  const [vacForm, setVacForm] = useState(blankVac)
  const setV = k => v => setVacForm(p=>({...p,[k]:v}))

  const [expForm, setExpForm] = useState({ description:'', amount:'', pet_id:'' })
  const setE = k => v => setExpForm(p=>({...p,[k]:v}))

  const [racForm, setRacForm] = useState({ brand:'', opened_at:'', days_estimate:'25', pet_id:'' })
  const setR = k => v => setRacForm(p=>({...p,[k]:v}))

  // pet ativo
  const currentPetId = activePetId || pets[0]?.id

  // ração do pet ativo
  const currentRac = racaoRows.find(r=>r.pet_id===currentPetId) || null
  const daysUsed = currentRac?.opened_at ? Math.floor((new Date()-new Date(currentRac.opened_at+'T12:00'))/86400000) : 0
  const daysLeftRac = currentRac ? Math.max(0,(currentRac.days_estimate||25)-daysUsed) : null
  const pctLeft = currentRac ? Math.max(0,Math.min(100,Math.round(daysLeftRac/(currentRac.days_estimate||25)*100))) : 0

  function isUrgent(next_at) {
    if (!next_at) return false
    const days = Math.floor((new Date(next_at+'T12:00')-new Date())/86400000)
    return days<=7 && days>=0
  }

  // upload foto pet
  async function uploadPetPhoto(file, petId) {
    const ext = file.name.split('.').pop()
    const path = `pets/${coupleId}/${petId}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await pUpdate(petId, { photo_url: data.publicUrl })
    }
  }

  function openNewPet()  { setPetForm(blankPet); setPetEditId(null); setPetOpen(true) }
  function openEditPet(p){ setPetForm({...p}); setPetEditId(p.id); setPetOpen(true) }
  async function savePet() {
    if (!petForm.name.trim()) return
    if (petEditId) await pUpdate(petEditId, petForm)
    else await pInsert(petForm)
    setPetOpen(false)
  }

  function openNewVac(petId) { setVacForm({...blankVac, pet_id:petId}); setVacEditId(null); setVacOpen(true) }
  function openEditVac(v)    { setVacForm({...v, cost:String(v.cost||'')}); setVacEditId(v.id); setVacOpen(true) }
  async function saveVac() {
    if (!vacForm.name.trim()) return
    const row = {...vacForm, cost:Number(vacForm.cost)||0}
    if (vacEditId) await vUpdate(vacEditId, row); else await vInsert(row)
    setVacOpen(false)
  }

  function openNewExp(petId) { setExpForm({description:'',amount:'',pet_id:petId}); setExpOpen(true) }
  async function saveExp() {
    if (!expForm.description||!expForm.amount) return
    await peInsert({...expForm, amount:Number(expForm.amount)})
    setExpOpen(false)
  }

  function openRac(petId) {
    const ex = racaoRows.find(r=>r.pet_id===petId)
    setRacForm({ brand:ex?.brand||'', opened_at:ex?.opened_at||'', days_estimate:String(ex?.days_estimate||25), pet_id:petId })
    setRacOpen(true)
  }
  async function saveRac() {
    const row = {...racForm, days_estimate:Number(racForm.days_estimate)||25}
    const ex = racaoRows.find(r=>r.pet_id===racForm.pet_id)
    if (ex) await rUpdate(ex.id, row); else await rInsert(row)
    setRacOpen(false)
  }

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <span style={{fontSize:15,fontWeight:800}}>🐾 Pets</span>
        <Btn variant="secondary" size="sm" onClick={openNewPet}><Icons.Plus/> Cadastrar pet</Btn>
      </div>

      {pLoad ? <Spinner/> : pets.length===0
        ? <Empty icon="🐾" title="Nenhum pet cadastrado" subtitle="Adicione seu primeiro companheiro"/>
        : pets.map(pet => {
          const pvacs  = vaccines.filter(v=>v.pet_id===pet.id)
          const pexp   = petExpenses.filter(e=>e.pet_id===pet.id)
          const prac   = racaoRows.find(r=>r.pet_id===pet.id)
          const pdu    = prac?.opened_at ? Math.floor((new Date()-new Date(prac.opened_at+'T12:00'))/86400000) : 0
          const pdl    = prac ? Math.max(0,(prac.days_estimate||25)-pdu) : null
          const urgentVacs = pvacs.filter(v=>isUrgent(v.next_at))
          const totalExp   = pexp.reduce((s,e)=>s+(e.amount||0),0)

          return (
            <Card key={pet.id} style={{marginBottom:12}}>
              {/* Header */}
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
                {/* Foto */}
                <div style={{position:'relative',flexShrink:0}}>
                  <div
                    onClick={() => { setPetEditId(pet.id); fileRef.current?.click() }}
                    style={{width:56,height:56,borderRadius:18,background:'#FFF4E0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,cursor:'pointer',overflow:'hidden',border:`2px solid ${C.border}`}}
                  >
                    {pet.photo_url
                      ? <img src={pet.photo_url} alt={pet.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      : (pet.species==='Gato'?'🐱':'🐕')
                    }
                  </div>
                  <div style={{position:'absolute',bottom:-2,right:-2,width:18,height:18,borderRadius:'50%',background:C.black,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
                    onClick={() => { setPetEditId(pet.id); fileRef.current?.click() }}>
                    <Icons.Edit/>
                  </div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:18,fontWeight:900,letterSpacing:'-.5px'}}>{pet.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{pet.breed} · {pet.species}</div>
                  {pet.birthdate && <div style={{fontSize:11,color:C.muted}}>Nascido em {new Date(pet.birthdate+'T12:00').toLocaleDateString('pt-BR')}</div>}
                </div>
                <div style={{display:'flex',gap:5}}>
                  <button onClick={()=>openEditPet(pet)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Edit/></button>
                  <button onClick={()=>pRemove(pet.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,lineHeight:0}}><Icons.Trash/></button>
                </div>
              </div>

              {/* Alertas */}
              {urgentVacs.map(v=>{
                const days = Math.floor((new Date(v.next_at+'T12:00')-new Date())/86400000)
                return (
                  <div key={v.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:'#FEE8E2',borderRadius:12,marginBottom:8,border:'1px solid rgba(224,58,46,.15)'}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700}}>⚠️ {v.name} vence em {days} dia{days!==1?'s':''}</div>
                      <div style={{fontSize:10,color:C.err,fontWeight:600}}>{new Date(v.next_at+'T12:00').toLocaleDateString('pt-BR')}</div>
                    </div>
                    <Tag bg={C.err} color="#fff">Urgente</Tag>
                  </div>
                )
              })}
              {pdl!==null&&pdl<=5&&(
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:'#FFF4E0',borderRadius:12,marginBottom:8}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700}}>Ração acaba em ~{pdl} dia{pdl!==1?'s':''}</div>
                    <div style={{fontSize:10,color:'#D4882A',fontWeight:600}}>{prac?.brand}</div>
                  </div>
                  <Btn variant="warn" size="sm" onClick={()=>openRac(pet.id)}>Registrar novo</Btn>
                </div>
              )}

              {/* Vacinas */}
              <div style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:700}}>💉 Vacinas</span>
                  <Btn variant="secondary" size="sm" onClick={()=>openNewVac(pet.id)}><Icons.Plus/> Nova</Btn>
                </div>
                {pvacs.length===0
                  ? <p style={{fontSize:12,color:C.muted,margin:0}}>Nenhuma vacina cadastrada</p>
                  : pvacs.map(v=>{
                    const urgent = isUrgent(v.next_at)
                    const days = v.next_at ? Math.floor((new Date(v.next_at+'T12:00')-new Date())/86400000) : null
                    return (
                      <div key={v.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:urgent?'#FEE8E2':'rgba(14,14,12,.04)',borderRadius:12,marginBottom:5}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:700}}>{v.name}</div>
                          <div style={{fontSize:10,color:urgent?C.err:C.muted}}>
                            {v.next_at?`Vence ${new Date(v.next_at+'T12:00').toLocaleDateString('pt-BR')}${days!==null?` · ${days}d`:''}`:'Sem data definida'}
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <Tag bg={urgent?'#FEE8E2':'#E8F5ED'} color={urgent?C.err:'#1a7a3e'}>{urgent?'Urgente':'Em dia'}</Tag>
                          <button onClick={()=>openEditVac(v)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:3,lineHeight:0}}><Icons.Edit/></button>
                          <button onClick={()=>vRemove(v.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:3,lineHeight:0}}><Icons.Trash/></button>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              {/* Ração */}
              <div style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                  <span style={{fontSize:12,fontWeight:700}}>🥣 Ração</span>
                  <Btn variant="secondary" size="sm" onClick={()=>openRac(pet.id)}>{prac?'Atualizar':'Cadastrar'}</Btn>
                </div>
                {prac ? (
                  <div style={{background:'#FFF4E0',borderRadius:14,padding:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700}}>{prac.brand}</div>
                        <div style={{fontSize:10,color:C.muted}}>Aberto há {pdu} dias · dura ~{prac.days_estimate} dias</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:15,fontWeight:900,color:pdl<=5?'#D4882A':'#2ECC71'}}>~{pdl} dias</div>
                        <div style={{fontSize:10,color:C.muted}}>restantes</div>
                      </div>
                    </div>
                    <div style={{height:5,background:'rgba(14,14,12,.12)',borderRadius:100,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${Math.max(0,Math.min(100,Math.round(pdl/(prac.days_estimate||25)*100)))}%`,background:pdl<=5?'#D4882A':'#2ECC71',borderRadius:100}}/>
                    </div>
                  </div>
                ) : <p style={{fontSize:12,color:C.muted,margin:0}}>Nenhuma ração cadastrada</p>}
              </div>

              {/* Despesas */}
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:12,fontWeight:700}}>💰 Despesas</span>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {totalExp>0&&<span style={{fontSize:12,fontWeight:800,color:C.black}}>{brl(totalExp)}/mês</span>}
                    <Btn variant="secondary" size="sm" onClick={()=>openNewExp(pet.id)}><Icons.Plus/> Adicionar</Btn>
                  </div>
                </div>
                {pexp.length===0
                  ? <p style={{fontSize:12,color:C.muted,margin:0}}>Nenhuma despesa registrada</p>
                  : pexp.map(e=>(
                    <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'rgba(14,14,12,.04)',borderRadius:10,marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:600}}>{e.description}</span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:12,fontWeight:800}}>{brl(e.amount)}</span>
                        <button onClick={()=>peRemove(e.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:2,lineHeight:0}}><Icons.Trash/></button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </Card>
          )
        })
      }

      {/* input file escondido para foto */}
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={async e => {
          const f = e.target.files[0]
          if (f && petEditId) { await uploadPetPhoto(f, petEditId) }
          e.target.value=''
        }}/>

      {/* Modal pet */}
      <Modal open={petOpen} onClose={()=>setPetOpen(false)} title={petEditId?'Editar pet':'Cadastrar pet'}>
        <Field label="Nome do pet"><Input value={petForm.name} onChange={setPF('name')} placeholder="Ex: Bolt"/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Espécie">
            <select value={petForm.species} onChange={e=>setPF('species')(e.target.value)} style={SEL}>{['Cachorro','Gato','Pássaro','Outro'].map(o=><option key={o}>{o}</option>)}</select>
          </Field>
          <Field label="Raça"><Input value={petForm.breed} onChange={setPF('breed')} placeholder="Ex: Golden Retriever"/></Field>
        </div>
        <Field label="Data de nascimento"><Input value={petForm.birthdate} onChange={setPF('birthdate')} type="date"/></Field>
        <ModalActions onSave={savePet} onCancel={()=>setPetOpen(false)} editId={petEditId} onDelete={()=>{pRemove(petEditId);setPetOpen(false)}} saveLabel={petEditId?'Salvar':'Cadastrar'}/>
      </Modal>

      {/* Modal vacina */}
      <Modal open={vacOpen} onClose={()=>setVacOpen(false)} title={vacEditId?'Editar vacina':'Nova vacina'}>
        <Field label="Vacina"><Input value={vacForm.name} onChange={setV('name')} placeholder="Ex: V10, Antirrábica..."/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Data aplicação"><Input value={vacForm.applied_at} onChange={setV('applied_at')} type="date"/></Field>
          <Field label="Próxima dose"><Input value={vacForm.next_at} onChange={setV('next_at')} type="date"/></Field>
          <Field label="Veterinário"><Input value={vacForm.vet} onChange={setV('vet')} placeholder="Dr. Marcos"/></Field>
          <Field label="Custo (R$)"><Input value={vacForm.cost} onChange={setV('cost')} type="number" placeholder="0"/></Field>
        </div>
        <ModalActions onSave={saveVac} onCancel={()=>setVacOpen(false)} editId={vacEditId} onDelete={()=>{vRemove(vacEditId);setVacOpen(false)}}/>
      </Modal>

      {/* Modal despesa */}
      <Modal open={expOpen} onClose={()=>setExpOpen(false)} title="Nova despesa do pet">
        <Field label="Descrição"><Input value={expForm.description} onChange={setE('description')} placeholder="Ex: Ração, Veterinário..."/></Field>
        <Field label="Valor (R$)"><Input value={expForm.amount} onChange={setE('amount')} type="number" placeholder="0"/></Field>
        <ModalActions onSave={saveExp} onCancel={()=>setExpOpen(false)}/>
      </Modal>

      {/* Modal ração */}
      <Modal open={racOpen} onClose={()=>setRacOpen(false)} title="Dados da ração">
        <Field label="Marca / Tipo"><Input value={racForm.brand} onChange={setR('brand')} placeholder="Ex: Golden Fórmula 15kg"/></Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Field label="Data de abertura"><Input value={racForm.opened_at} onChange={setR('opened_at')} type="date"/></Field>
          <Field label="Dura ~quantos dias"><Input value={racForm.days_estimate} onChange={setR('days_estimate')} type="number" placeholder="25"/></Field>
        </div>
        <p style={{fontSize:11,color:C.muted,marginTop:-8,marginBottom:14}}>O app avisa automaticamente 5 dias antes de acabar.</p>
        <ModalActions onSave={saveRac} onCancel={()=>setRacOpen(false)}/>
      </Modal>
    </>
  )

}  // end PetTab

// ── DOCUMENTOS ────────────────────────────────────────────────────────────────
function DocsTab() {
  const { data, loading, insert, update, remove } = useTable('documents')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const blank = { name:'', category:'Pessoal', url:'', notes:'' }
  const [form, setForm] = useState(blank)
  const set = k => v => setForm(p=>({...p,[k]:v}))
  const CATS = ['Pessoal','Casa','Financeiro','Casamento','Médico','Outros']

  function openNew()   { setForm(blank); setEditId(null); setOpen(true) }
  function openEdit(d) { setForm({...d}); setEditId(d.id); setOpen(true) }
  async function save() {
    if (!form.name.trim()) return
    if (editId) await update(editId,form); else await insert(form)
    setOpen(false)
  }
  const activeCats = CATS.filter(c=>data.some(d=>d.category===c))

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontSize:15,fontWeight:800}}>📄 Documentos</span>
        <Btn variant="secondary" size="sm" onClick={openNew}><Icons.Plus/> Adicionar</Btn>
      </div>
      {loading ? <Spinner/> : data.length===0
        ? <Empty icon="📄" title="Nenhum documento" subtitle="Salve links de documentos importantes"/>
        : activeCats.map(cat=>(
          <div key={cat} style={{marginBottom:14}}>
            <p style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:7}}>{cat}</p>
            <Card style={{padding:0,overflow:'hidden'}}>
              {data.filter(d=>d.category===cat).map((doc,i,arr)=>(
                <div key={doc.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<arr.length-1?`1px solid ${C.border}`:'none'}}>
                  <div style={{width:28,height:28,borderRadius:9,background:'rgba(14,14,12,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>📄</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600}}>{doc.name}</div>
                    {doc.notes&&<div style={{fontSize:10,color:C.muted}}>{doc.notes}</div>}
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {doc.url&&<a href={doc.url} target="_blank" rel="noopener noreferrer" style={{width:28,height:28,borderRadius:9,background:'rgba(14,14,12,.06)',display:'flex',alignItems:'center',justifyContent:'center',color:C.black,textDecoration:'none',flexShrink:0,fontSize:14}}>↗</a>}
                    <button onClick={()=>openEdit(doc)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:3,lineHeight:0}}><Icons.Edit/></button>
                    <button onClick={()=>remove(doc.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:3,lineHeight:0}}><Icons.Trash/></button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))
      }
      <Modal open={open} onClose={()=>setOpen(false)} title={editId?'Editar documento':'Novo documento'}>
        <Field label="Nome"><Input value={form.name} onChange={set('name')} placeholder="Ex: RG e CPF"/></Field>
        <Field label="Categoria"><select value={form.category} onChange={e=>set('category')(e.target.value)} style={SEL}>{CATS.map(o=><option key={o}>{o}</option>)}</select></Field>
        <Field label="Link"><Input value={form.url} onChange={set('url')} placeholder="https://..."/></Field>
        <Field label="Notas"><Input value={form.notes} onChange={set('notes')} placeholder="Obs..."/></Field>
        <ModalActions onSave={save} onCancel={()=>setOpen(false)} editId={editId} onDelete={()=>{remove(editId);setOpen(false)}}/>
      </Modal>
    </>
  )
}

// ── NOTAS ─────────────────────────────────────────────────────────────────────
function NotasTab() {
  const { data, loading, insert, update, remove } = useTable('notes')
  const [editId, setEditId] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [form, setForm] = useState({ title:'', content:'' })

  async function addQuick() {
    if (!newTitle.trim()) return
    await insert({ title:newTitle, content:'', pinned:false })
    setNewTitle('')
  }
  function openEdit(n) { setForm({ title:n.title, content:n.content||'' }); setEditId(n.id) }
  async function save() { await update(editId, form); setEditId(null) }

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontSize:15,fontWeight:800}}>📝 Notas</span>
      </div>
      <Card style={{padding:'11px 13px',marginBottom:14}}>
        <div style={{display:'flex',gap:8}}>
          <Input value={newTitle} onChange={setNewTitle} placeholder="Nova nota rápida... (Enter)"
            style={{borderRadius:10,fontSize:12}} onKeyDown={e=>e.key==='Enter'&&addQuick()}/>
          <Btn onClick={addQuick} style={{width:38,padding:0,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icons.Plus/></Btn>
        </div>
      </Card>
      {loading ? <Spinner/> : data.length===0
        ? <Empty icon="📝" title="Nenhuma nota" subtitle="Adicione notas compartilhadas"/>
        : <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {data.map(n=>(
              <Card key={n.id} style={{cursor:'pointer',minHeight:90,position:'relative'}} onClick={()=>openEdit(n)}>
                {n.pinned&&<span style={{position:'absolute',top:10,right:10,fontSize:12}}>📌</span>}
                <div style={{fontSize:13,fontWeight:700,marginBottom:5,paddingRight:n.pinned?20:0}}>{n.title}</div>
                <p style={{fontSize:11,color:C.muted,margin:0,lineHeight:1.5}}>{n.content?.slice(0,60)}{n.content?.length>60?'...':''}</p>
              </Card>
            ))}
          </div>
      }
      <Modal open={!!editId} onClose={()=>setEditId(null)} title="Editar nota">
        <Field label="Título"><Input value={form.title} onChange={v=>setForm(p=>({...p,title:v}))}/></Field>
        <Field label="Conteúdo"><Input value={form.content} onChange={v=>setForm(p=>({...p,content:v}))} as="textarea" style={{minHeight:120}} placeholder="Escreva aqui..."/></Field>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
          <Btn variant="danger" size="sm" onClick={()=>{remove(editId);setEditId(null)}}><Icons.Trash/> Excluir</Btn>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="secondary" onClick={()=>setEditId(null)} style={{padding:'9px 16px',borderRadius:12}}>Cancelar</Btn>
            <Btn onClick={save} style={{padding:'9px 16px',borderRadius:12}}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── PERFIL ────────────────────────────────────────────────────────────────────
function PerfilTab() {
  const { profile, partner, coupleId, signOut, updateProfile } = useAuth()
  const fileRefE = useRef()
  const fileRefG = useRef()
  const [coupleCode, setCoupleCode] = useState(null)
  const [weddingDate, setWeddingDate] = useState('')
  const [copied, setCopied]   = useState(false)
  const [editName, setEditName] = useState(false)
  const [name, setName]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [togCas, setTogCas] = useState(() => {
    try { return localStorage.getItem('nos_show_wedding') !== 'false' }
    catch { return true }
  })
  const [togPet, setTogPet]   = useState(true)
  const [togContas, setTogContas] = useState(true)
  const [profiles, setProfiles] = useState([])

  // carrega dados
  useEffect(() => {
    if (!coupleId) return
    supabase.from('couples').select('invite_code,wedding_date').eq('id',coupleId).single()
      .then(({data}) => {
        if (data) { setCoupleCode(data.invite_code); if(data.wedding_date) setWeddingDate(data.wedding_date) }
      })
    supabase.from('profiles').select('*').eq('couple_id',coupleId)
      .then(({data}) => { if(data) setProfiles(data) })
  }, [coupleId])

  useEffect(() => { if(profile?.name) setName(profile.name) }, [profile?.name])

  async function saveName() {
    if (!name.trim()) return
    setSaving(true)
    await updateProfile({ name: name.trim() })
    setSaving(false); setEditName(false)
  }

  async function saveWedding() {
    if (!weddingDate||!coupleId) return
    const { error } = await supabase.from('couples').update({ wedding_date: weddingDate }).eq('id', coupleId)
    if (!error) alert('✓ Data do casamento salva! Volte à home para ver a contagem regressiva atualizada.')
    else alert('Erro ao salvar: ' + error.message)
  }

  async function uploadAvatar(file, userId) {
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${userId}.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
      // atualiza local
      setProfiles(ps => ps.map(p => p.id===userId ? {...p, avatar_url: data.publicUrl} : p))
      if (userId === profile?.id) await updateProfile({ avatar_url: data.publicUrl })
    } catch(e) { alert('Erro no upload: ' + e.message) }
  }

  function copy() {
    navigator.clipboard.writeText(coupleCode||'')
      .then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000) })
  }

  const me      = profiles.find(p=>p.id===profile?.id) || profile
  const partnerP = profiles.find(p=>p.id!==profile?.id)

  return (
    <>
      <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>⚙️ Perfil & Configurações</div>

      {/* Perfis com foto */}
      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:C.muted,marginBottom:8}}>Perfis</div>
      <Card style={{marginBottom:12}}>
        {[
          { p: me,       isMe: true,  ref: fileRefE },
          { p: partnerP, isMe: false, ref: fileRefG },
        ].filter(({p})=>p).map(({p,isMe,ref},i)=>(
          <div key={p.id} style={{display:'flex',alignItems:'center',gap:13,paddingBottom:i===0&&partnerP?14:0,marginBottom:i===0&&partnerP?14:0,borderBottom:i===0&&partnerP?`1px solid ${C.border}`:'none'}}>
            {/* Avatar com troca de foto */}
            <div style={{position:'relative',flexShrink:0}}>
              <div
                onClick={()=>isMe&&ref.current?.click()}
                style={{width:52,height:52,borderRadius:18,background:isMe?C.lime:C.black,overflow:'hidden',cursor:isMe?'pointer':'default',border:`2px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}
              >
                {p.avatar_url
                  ? <img src={p.avatar_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <span style={{fontSize:20,fontWeight:800,color:isMe?C.black:C.lime}}>{(p.name||'?')[0].toUpperCase()}</span>
                }
              </div>
              {isMe && (
                <div style={{position:'absolute',bottom:-3,right:-3,width:18,height:18,borderRadius:'50%',background:C.black,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
                  onClick={()=>ref.current?.click()}>
                  <Icons.Edit/>
                </div>
              )}
            </div>
            <div style={{flex:1}}>
              {isMe && editName ? (
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <Input value={name} onChange={setName} placeholder="Seu nome" style={{fontSize:13}}
                    onKeyDown={e=>e.key==='Enter'&&saveName()}/>
                  <Btn size="sm" onClick={saveName} disabled={saving}>{saving?'...':'OK'}</Btn>
                  <Btn variant="secondary" size="sm" onClick={()=>setEditName(false)}>✕</Btn>
                </div>
              ) : (
                <>
                  <div style={{fontSize:15,fontWeight:800}}>{p.name}</div>
                  <div style={{fontSize:11,color:isMe?C.muted:'#2ECC71',fontWeight:isMe?400:600}}>
                    {isMe ? 'Você' : '✓ Parceiro(a) conectado'}
                  </div>
                </>
              )}
            </div>
            {isMe&&!editName&&<Btn variant="secondary" size="sm" onClick={()=>{setName(me?.name||'');setEditName(true)}}>Editar</Btn>}
          </div>
        ))}
        {/* inputs file escondidos */}
        <input ref={fileRefE} type="file" accept="image/*" style={{display:'none'}}
          onChange={e=>{const f=e.target.files[0];if(f&&me?.id){uploadAvatar(f,me.id)};e.target.value=''}}/>
        <input ref={fileRefG} type="file" accept="image/*" style={{display:'none'}}
          onChange={e=>{const f=e.target.files[0];if(f&&partnerP?.id){uploadAvatar(f,partnerP.id)};e.target.value=''}}/>
      </Card>

      {/* Casal */}
      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:C.muted,marginBottom:8}}>Casal</div>
      <Card style={{marginBottom:12}}>
        <div style={{padding:12,background:'rgba(14,14,12,.04)',borderRadius:14,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',color:C.muted,marginBottom:2}}>Código do casal</div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:4}}>{coupleCode||'......'}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Compartilhe com sua parceira para conectar</div>
          </div>
          <Btn variant="secondary" size="sm" onClick={copy}><Icons.Edit/> {copied?'Copiado!':'Copiar'}</Btn>
        </div>
        <Field label="Data do casamento">
          <div style={{display:'flex',gap:8}}>
            <Input type="date" value={weddingDate} onChange={setWeddingDate} style={{fontSize:12}}/>
            <Btn onClick={saveWedding} disabled={!weddingDate} style={{padding:'9px 14px',fontSize:12,flexShrink:0}}>Salvar</Btn>
          </div>
        </Field>
        <p style={{fontSize:11,color:C.muted,marginTop:-8}}>Usada na contagem regressiva da home.</p>
      </Card>

      {/* Config */}
      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:C.muted,marginBottom:8}}>Configurações</div>
      <Card style={{marginBottom:12}}>
        {[
          ['Módulo Casamento','Visível no app e home',togCas,()=>{
            const next = !togCas
            setTogCas(next)
            try {
              localStorage.setItem('nos_show_wedding', String(next))
              window.dispatchEvent(new Event('storage'))
            } catch {}
          }],
          ['Notificações pets','Vacinas, ração, consultas',togPet,()=>setTogPet(v=>!v)],
          ['Notificações de contas','3 dias antes do vencimento',togContas,()=>setTogContas(v=>!v)],
        ].map(([nm,sub,val,fn],i,arr)=>(
          <div key={nm} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:i<arr.length-1?`1px solid ${C.border}`:'none'}}>
            <div><div style={{fontSize:13,fontWeight:600}}>{nm}</div><div style={{fontSize:11,color:C.muted}}>{sub}</div></div>
            <Toggle checked={val} onChange={fn}/>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0'}}>
          <div><div style={{fontSize:13,fontWeight:600}}>Casa Inteligente</div><div style={{fontSize:11,color:C.muted}}>Integração futura</div></div>
          <Tag bg="#E8F0FE" color="#2A5AC0">Em breve</Tag>
        </div>
      </Card>

      <Card style={{marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:13,fontWeight:600}}>Versão</span>
          <span style={{fontSize:13,color:C.muted}}>nós v1.0.0</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0'}}>
          <span style={{fontSize:13,fontWeight:600}}>Sync</span>
          <span style={{fontSize:13,fontWeight:700,color:'#2ECC71'}}>● Tempo real ativo</span>
        </div>
      </Card>

      <Btn variant="danger" onClick={signOut} style={{width:'100%',justifyContent:'center',borderRadius:14,padding:14,fontSize:13}}>
        Sair da conta
      </Btn>
    </>
  )
}
