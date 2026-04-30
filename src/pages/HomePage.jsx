import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTable } from '../hooks/useTable'
import { supabase } from '../lib/supabase'
import { C, brl, daysLeft, Card, Btn, Input, Field, Modal, Tag, Checkbox, Icons, Grid2, Spinner } from '../components/ui'
import { PageShell } from '../components/Layout'
import { useState, useEffect } from 'react'

const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

function MiniChart({ period }) {
  const DATA = {
    Semanal:{ days:['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'], vals:[340,1200,580,1640,920,1380,480] },
    Mensal: { days:['S1','S2','S3','S4'],                       vals:[1200,890,1540,670] },
    Anual:  { days:['Jan','Mar','Mai','Jul','Set','Nov'],        vals:[3200,4100,2800,5200,3900,4600] },
  }
  const { days, vals } = DATA[period]
  const W=340, H=72, maxV=Math.max(...vals)
  const pts = vals.map((v,i)=>[Math.round(i*(W/(vals.length-1))),Math.round(H-6-(v/maxV)*(H-14))])
  const str = pts.map(p=>p.join(',')).join(' ')
  const last = pts[pts.length-1]
  return (
    <div style={{position:'relative'}}>
      <div style={{position:'absolute',top:0,right:44,fontSize:10,fontWeight:800,background:C.black,color:C.lime,padding:'2px 8px',borderRadius:7}}>
        R$ {vals[vals.length-1].toLocaleString('pt-BR')}
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block'}}>
        <defs><pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(14,14,12,0.18)" strokeWidth="3"/></pattern></defs>
        <polygon fill="url(#hatch)" points={`0,${H} ${str} ${W},${H}`}/>
        <polyline fill="none" stroke="rgba(14,14,12,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={str}/>
        <circle r="5" fill={C.black} cx={last[0]} cy={last[1]}/>
      </svg>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
        {days.map(d=><span key={d} style={{fontSize:9,fontWeight:600,color:'rgba(14,14,12,0.4)'}}>{d}</span>)}
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profile, partner, coupleId } = useAuth()
  const [period, setPeriod] = useState('Mensal')
  const [showWedding, setShowWedding] = useState(() => {
    try { return localStorage.getItem('nos_show_wedding') !== 'false' }
    catch { return true }
  })

  // escuta mudanças do toggle no perfil
  useEffect(() => {
    function onStorage() {
      try { setShowWedding(localStorage.getItem('nos_show_wedding') !== 'false') }
      catch {}
    }
    window.addEventListener('storage', onStorage)
    // também verifica ao montar
    try { setShowWedding(localStorage.getItem('nos_show_wedding') !== 'false') } catch {}
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const [weddingDate, setWeddingDate] = useState(null)

  // Busca data do casamento do Supabase
  useEffect(() => {
    if (!coupleId) return
    supabase.from('couples').select('wedding_date').eq('id', coupleId).single()
      .then(({ data }) => { if (data?.wedding_date) setWeddingDate(data.wedding_date) })
  }, [coupleId])

  const dl = daysLeft(weddingDate)
  const now = new Date()

  // Dados reais do Supabase
  const { data: messages, loading: mLoad, insert: mInsert, update: mUpdate, remove: mRemove } = useTable('messages')
  const { data: tasks, update: updTask } = useTable('tasks')
  const { data: appointments } = useTable('appointments', 'scheduled_at')
  const { data: checklist } = useTable('checklist_items')
  const { data: pets } = useTable('pets')
  const { data: racaoRows } = useTable('rac_data')
  const { data: petVaccines } = useTable('pet_vaccines')

  // Recados
  const [recadoOpen, setRecadoOpen] = useState(false)
  const [viewRecado, setViewRecado] = useState(null)
  const [editRecado, setEditRecado] = useState(null)
  const [recadoText, setRecadoText] = useState('')
  const [para, setPara] = useState('')

  useEffect(() => { if (partner?.name) setPara(partner.name) }, [partner?.name])

  const sortedMessages = [...messages].sort((a,b) => new Date(b.created_at)-new Date(a.created_at))

  // Tarefas
  const pending = tasks.filter(t => !t.done)
  const done    = tasks.filter(t =>  t.done)

  // Checklist
  const clDone = checklist.filter(i => i.done).length
  const clPct  = checklist.length > 0 ? Math.round(clDone/checklist.length*100) : 0

  // Compromissos de hoje
  const todayStr = now.toISOString().slice(0,10)
  const todayAppts = appointments
    .filter(a => a.scheduled_at === todayStr)
    .sort((a,b) => (a.time||'').localeCompare(b.time||''))

  const TOTALS = { Semanal:'6.540', Mensal:'4.300', Anual:'23.800' }

  async function sendRecado() {
    if (!recadoText.trim()) return
    if (editRecado) {
      await mUpdate(editRecado.id, { text: recadoText })
      setEditRecado(null)
    } else {
      await mInsert({
        text: recadoText,
        from_name: profile?.name || 'Você',
        to_name: para || partner?.name || 'Parceira'
      })
    }
    setRecadoText(''); setRecadoOpen(false)
  }

  function openEditRecado(msg) {
    setEditRecado(msg); setRecadoText(msg.text)
    setViewRecado(null); setRecadoOpen(true)
  }

  return (
    <PageShell>
      {/* Saudação */}
      <div style={{paddingTop:4,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:3}}>
          {DAYS[now.getDay()]}, {now.getDate()} de {MONTHS[now.getMonth()]}
        </div>
        <div style={{fontSize:30,fontWeight:900,letterSpacing:'-1.2px',lineHeight:1.1}}>
          Olá, {profile?.name?.split(' ')[0]||'você'}!<br/>
          <span style={{color:C.muted,fontWeight:400}}>
            {partner ? `& ${partner.name.split(' ')[0]}! 👋` : '👋'}
          </span>
        </div>
      </div>

      {/* ── RECADOS ── */}
      <Card variant="dark" style={{marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:800,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.5px'}}>
            💬 Recados
          </span>
          <Btn size="sm" onClick={() => {
            setEditRecado(null); setRecadoText('')
            setPara(partner?.name || 'Gabi'); setRecadoOpen(true)
          }}>+ Deixar recado</Btn>
        </div>
        {mLoad ? <Spinner/> : sortedMessages.length===0 ? (
          <p style={{fontSize:12,color:'rgba(255,255,255,.3)',textAlign:'center',padding:'12px 0',margin:0}}>
            Nenhum recado ainda — deixe o primeiro! 💬
          </p>
        ) : (
          sortedMessages.slice(0,5).map((msg,i) => {
            const isOwner = msg.from_name === profile?.name
            return (
              <div key={msg.id} onClick={()=>setViewRecado(msg)}
                style={{background:i===0?'rgba(255,255,255,0.09)':'rgba(255,255,255,0.05)',borderRadius:14,padding:12,marginBottom:i<Math.min(sortedMessages.length,5)-1?8:0,cursor:'pointer'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:isOwner?C.lime:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:isOwner?C.black:'#fff',flexShrink:0}}>
                    {(msg.from_name||'?')[0].toUpperCase()}
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.55)'}}>
                    {msg.from_name}
                  </span>
                  {i===0 && <span style={{marginLeft:'auto',fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:100,background:C.lime,color:C.black}}>NOVO</span>}
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.25)',marginLeft:i===0?4:'auto'}}>
                    {new Date(msg.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                  </span>
                </div>
                <p style={{fontSize:13,fontWeight:600,color:i===0?'#fff':'rgba(255,255,255,0.55)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  "{msg.text}"
                </p>
              </div>
            )
          })
        )}
      </Card>

      {/* ── CASA INTELIGENTE MINI ── */}
      <div style={{background:'linear-gradient(135deg,#1A1A18,#0E3060)',borderRadius:22,padding:16,marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,borderRadius:11,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>🏠</div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:'#fff'}}>Casa Inteligente</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>Integração futura</div>
            </div>
          </div>
          <div style={{width:8,height:8,borderRadius:'50%',background:C.lime,boxShadow:`0 0 6px ${C.lime}`}}/>
        </div>
        <div style={{display:'flex',gap:7}}>
          {[['💡','Sala','ON'],['❄️','Ar','23°C'],['🔒','Porta','✓'],['📷','Câm.','2']].map(([ic,lb,vl])=>(
            <div key={lb} style={{flex:1,background:'rgba(255,255,255,0.08)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}>
              <div style={{fontSize:13,marginBottom:2}}>{ic}</div>
              <div style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.5)'}}>{lb}</div>
              <div style={{fontSize:10,fontWeight:800,color:C.lime}}>{vl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PERÍODO + GASTOS ── */}
      <div style={{display:'flex',gap:6,marginBottom:10}}>
        {['Semanal','Mensal','Anual'].map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} style={{padding:'7px 18px',borderRadius:100,border:`1.5px solid ${period===p?C.black:C.border}`,background:period===p?C.black:'transparent',color:period===p?C.lime:C.black,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{p}</button>
        ))}
      </div>
      <Card variant="lime" style={{marginBottom:10}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.7px',textTransform:'uppercase',color:'rgba(14,14,12,.45)',marginBottom:4}}>Gastos do período</div>
            <div style={{fontSize:36,fontWeight:900,letterSpacing:'-2.5px',lineHeight:1,color:C.black}}>
              <sub style={{fontSize:13,fontWeight:700,verticalAlign:'super'}}>R$</sub>{TOTALS[period]}
            </div>
          </div>
          <button onClick={()=>navigate('/financeiro')} style={{width:34,height:34,background:C.black,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="12" height="12" fill="none" stroke={C.lime} strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
          <span style={{padding:'4px 10px',borderRadius:100,fontSize:10,fontWeight:700,background:'rgba(14,14,12,.09)',color:C.black}}>💼 Receita R$ 13.500</span>
          <span style={{padding:'4px 10px',borderRadius:100,fontSize:10,fontWeight:700,background:C.black,color:C.lime}}>💰 Saldo R$ 9.200</span>
        </div>
        <MiniChart period={period}/>
      </Card>

      {/* ── STATS ── */}
      <Grid2>
        <div style={{borderRadius:20,padding:15,background:C.black}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:'rgba(255,255,255,0.3)',marginBottom:5}}>Receita</div>
          <div style={{fontSize:18,fontWeight:900,color:'#fff',letterSpacing:'-1px'}}>R$ 13.500</div>
          <div style={{display:'inline-flex',padding:'2px 8px',borderRadius:100,fontSize:10,fontWeight:800,marginTop:7,background:'rgba(206,255,0,0.15)',color:C.lime}}>▲ +4,2%</div>
        </div>
        <div style={{borderRadius:20,padding:15,background:C.white,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:C.muted,marginBottom:5}}>Saldo livre</div>
          <div style={{fontSize:18,fontWeight:900,color:'#2ECC71',letterSpacing:'-1px'}}>R$ 9.200</div>
          <div style={{display:'inline-flex',padding:'2px 8px',borderRadius:100,fontSize:10,fontWeight:800,marginTop:7,background:'#E8F5ED',color:'#1a7a3e'}}>▲ Saudável</div>
        </div>
      </Grid2>

      {/* ── HOJE — dados reais ── */}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontSize:14,fontWeight:800}}>Hoje</span>
          <Btn variant="secondary" size="sm" onClick={()=>navigate('/agenda')}>Ver agenda</Btn>
        </div>
        {todayAppts.length === 0 ? (
          <div style={{textAlign:'center',padding:'12px 0',color:C.muted,fontSize:13}}>
            Nenhum compromisso hoje — <span style={{cursor:'pointer',textDecoration:'underline'}} onClick={()=>navigate('/agenda')}>adicionar</span>
          </div>
        ) : (
          todayAppts.map(a => {
            const catColors = { Casamento:['#E8F0FE','#2A5AC0'], Saúde:['#E8F5ED','#1a7a3e'], Família:['#FEF0E8','#C0603A'], Trabalho:['#F0E8FE','#8A2AC0'], Outros:['rgba(14,14,12,.07)',C.muted] }
            const [tbg,tc] = catColors[a.category] || catColors.Outros
            return (
              <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 12px',background:'rgba(14,14,12,.04)',borderRadius:14,marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:800,minWidth:36}}>{a.time||'—'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{a.title}</div>
                  <div style={{fontSize:11,color:C.muted}}>{a.who}</div>
                </div>
                <Tag bg={tbg} color={tc}>{a.category}</Tag>
              </div>
            )
          })
        )}
      </Card>

      {/* ── CASAMENTO + PET ── */}
      <div style={{display:'grid',gridTemplateColumns:showWedding?'1fr 1fr':'1fr',gap:10,marginBottom:10}}>
        {showWedding && (
          <Card style={{cursor:'pointer',marginBottom:0}} onClick={()=>navigate('/agenda')}>
            <div style={{fontSize:20,marginBottom:7}}>💍</div>
            <div style={{fontSize:14,fontWeight:800,marginBottom:2}}>Casamento</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}>
              {weddingDate ? `${dl} dias · ${clPct}% feito` : 'Configure a data no perfil'}
            </div>
            <div style={{height:4,background:C.border,borderRadius:100,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${clPct}%`,background:C.black,borderRadius:100}}/>
            </div>
          </Card>
        )}
        {/* Clique no pet vai para aba pet */}
        <Card style={{cursor:'pointer',marginBottom:0}} onClick={()=>navigate('/mais',{state:{tab:'pet'}})}>
          {pets.length === 0 ? (
            <>
              <div style={{fontSize:20,marginBottom:7}}>🐾</div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Nenhum pet</div>
              <span style={{fontSize:11,color:C.muted}}>Cadastre um pet →</span>
            </>
          ) : (() => {
            const pet = pets[0]
            const rac = racaoRows.find(r=>r.pet_id===pet.id)
            const daysUsed = rac?.opened_at ? Math.floor((new Date()-new Date(rac.opened_at+'T12:00'))/86400000) : 0
            const daysLeft = rac ? Math.max(0,(rac.days_estimate||25)-daysUsed) : null
            const urgentVacs = petVaccines.filter(v=>{
              if(!v.next_at||v.pet_id!==pet.id) return false
              const d = Math.floor((new Date(v.next_at+'T12:00')-new Date())/86400000)
              return d>=0&&d<=7
            })
            return (
              <>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                  <div style={{width:32,height:32,borderRadius:10,background:'#FFF4E0',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                    {pet.photo_url ? <img src={pet.photo_url} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (pet.species==='Gato'?'🐱':'🐕')}
                  </div>
                  <div style={{fontSize:14,fontWeight:800}}>{pet.name}</div>
                </div>
                {urgentVacs.length>0 && (
                  <span style={{display:'block',fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:100,background:'#FEE8E2',color:C.err,marginBottom:5,width:'fit-content'}}>
                    ⚠️ Vacina {Math.floor((new Date(urgentVacs[0].next_at+'T12:00')-new Date())/86400000)}d
                  </span>
                )}
                {daysLeft!==null&&daysLeft<=5 && (
                  <span style={{fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:100,background:'#FFF4E0',color:'#D4882A',width:'fit-content',display:'block'}}>
                    Ração ~{daysLeft} dias
                  </span>
                )}
                {urgentVacs.length===0&&(daysLeft===null||daysLeft>5) && (
                  <span style={{fontSize:10,color:C.muted,fontWeight:600}}>Tudo em dia ✓</span>
                )}
              </>
            )
          })()}
        </Card>
      </div>

      {/* ── UTILIDADES ── */}
      <div style={{fontSize:10,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',color:C.muted,marginBottom:9}}>Casa & consumo</div>
      <Grid2>
        <div style={{borderRadius:20,padding:15,background:C.dark,position:'relative',overflow:'hidden'}}>
          <span style={{position:'absolute',top:10,right:10,fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:100,background:'rgba(206,255,0,.18)',color:C.lime}}>↓ 8%</span>
          <div style={{fontSize:17,marginBottom:6}}>⚡</div>
          <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:'rgba(255,255,255,0.3)',marginBottom:2}}>Energia</div>
          <div style={{fontSize:19,fontWeight:900,color:'#fff',letterSpacing:'-.8px'}}>187<span style={{fontSize:10,opacity:.5,marginLeft:2}}>kWh</span></div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:2}}>R$ 162,40/mês</div>
          <div style={{height:3,borderRadius:100,marginTop:8,overflow:'hidden',background:'rgba(255,255,255,.1)'}}><div style={{height:'100%',width:'62%',background:C.lime,borderRadius:100}}/></div>
        </div>
        <div style={{borderRadius:20,padding:15,background:C.white,border:`1px solid ${C.border}`,position:'relative',overflow:'hidden'}}>
          <span style={{position:'absolute',top:10,right:10,fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:100,background:'#FEEEE8',color:'#C04020'}}>↑ 3%</span>
          <div style={{fontSize:17,marginBottom:6}}>💧</div>
          <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:C.muted,marginBottom:2}}>Água</div>
          <div style={{fontSize:19,fontWeight:900,color:C.black,letterSpacing:'-.8px'}}>14<span style={{fontSize:10,opacity:.5,marginLeft:2}}>m³</span></div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>R$ 48,20/mês</div>
          <div style={{height:3,borderRadius:100,marginTop:8,overflow:'hidden',background:'rgba(14,14,12,.1)'}}><div style={{height:'100%',width:'42%',background:'#5AC8FA',borderRadius:100}}/></div>
        </div>
      </Grid2>

      {/* ── COUNTDOWN ── */}
      <Card variant="dark">
        <div style={{fontSize:10,fontWeight:700,letterSpacing:'.7px',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginBottom:3}}>Contagem regressiva</div>
        {weddingDate ? (
          <>
            <div style={{fontSize:44,fontWeight:900,letterSpacing:'-3px',color:C.lime,lineHeight:1,marginBottom:2}}>{dl}</div>
            <div style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.35)',marginBottom:14}}>
              dias para o casamento · {new Date(weddingDate+'T12:00').toLocaleDateString('pt-BR')}
            </div>
            <div style={{display:'flex',gap:7}}>
              {[['Semanas',Math.floor(dl/7)],['Meses',Math.floor(dl/30)],['Pendentes',checklist.length-clDone]].map(([lbl,n])=>(
                <div key={lbl} style={{flex:1,background:lbl==='Pendentes'?'rgba(206,255,0,.1)':'rgba(255,255,255,.07)',borderRadius:13,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:18,fontWeight:900,color:lbl==='Pendentes'?C.lime:'#fff',letterSpacing:'-.8px'}}>{n}</div>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:'.7px',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginTop:2}}>{lbl}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{textAlign:'center',padding:'16px 0'}}>
            <p style={{color:'rgba(255,255,255,.4)',fontSize:13,margin:'0 0 12px'}}>Configure a data do casamento</p>
            <Btn size="sm" onClick={()=>navigate('/mais',{state:{tab:'perfil'}})}>Configurar no Perfil →</Btn>
          </div>
        )}
      </Card>

      {/* ── TAREFAS com pendentes e concluídas ── */}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <span style={{fontSize:14,fontWeight:800}}>Tarefas da casa</span>
          <span style={{background:C.black,color:C.lime,fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:100}}>
            {pending.length} pendente{pending.length!==1?'s':''}
          </span>
        </div>
        {/* Pendentes */}
        {pending.slice(0,4).map(t=>(
          <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:`1px solid ${C.border}`}}>
            <Checkbox checked={false} onChange={()=>updTask(t.id,{done:true})}/>
            <span style={{flex:1,fontSize:13,fontWeight:600}}>{t.title}</span>
            <Tag>{t.responsible}</Tag>
          </div>
        ))}
        {/* Concluídas */}
        {done.length > 0 && (
          <>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'.5px',margin:'10px 0 6px'}}>
              ✓ Concluídas ({done.length})
            </div>
            {done.slice(0,2).map(t=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'7px 0',borderBottom:`1px solid ${C.border}`,opacity:.6}}>
                <Checkbox checked onChange={()=>updTask(t.id,{done:false})}/>
                <span style={{flex:1,fontSize:12,fontWeight:500,textDecoration:'line-through',color:C.muted}}>{t.title}</span>
              </div>
            ))}
          </>
        )}
        {pending.length===0 && done.length===0 && (
          <div style={{textAlign:'center',padding:'14px 0',color:C.muted,fontSize:13}}>Nenhuma tarefa ainda 🎉</div>
        )}
        <Btn variant="secondary" size="sm" style={{marginTop:12,width:'100%',justifyContent:'center'}} onClick={()=>navigate('/agenda')}>
          Ver todas as tarefas
        </Btn>
      </Card>

      {/* ── MODAL: ver recado completo ── */}
      <Modal open={!!viewRecado} onClose={()=>setViewRecado(null)} title="💬 Recado">
        {viewRecado && (() => {
          const isOwner = viewRecado.from_name === profile?.name
          return (
            <>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,padding:'12px 14px',background:'rgba(14,14,12,.04)',borderRadius:14}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:isOwner?C.lime:C.black,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:isOwner?C.black:C.lime,flexShrink:0}}>
                  {(viewRecado.from_name||'?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:800}}>{viewRecado.from_name}</div>
                  <div style={{fontSize:11,color:C.muted}}>
                    {new Date(viewRecado.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}
                    {' às '}
                    {new Date(viewRecado.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
                {isOwner && <span style={{marginLeft:'auto',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:100,background:'rgba(14,14,12,.06)',color:C.muted}}>Seu recado</span>}
              </div>
              <div style={{background:'rgba(14,14,12,.04)',borderRadius:16,padding:'16px 18px',marginBottom:20,fontSize:15,fontWeight:500,lineHeight:1.7,minHeight:60}}>
                {viewRecado.text}
              </div>
              {isOwner ? (
                <div style={{display:'flex',gap:8}}>
                  <Btn variant="secondary" onClick={()=>openEditRecado(viewRecado)} style={{flex:1,justifyContent:'center',borderRadius:14,padding:12}}>
                    <Icons.Edit/> Editar
                  </Btn>
                  <Btn variant="danger" onClick={()=>{mRemove(viewRecado.id);setViewRecado(null)}} style={{flex:1,justifyContent:'center',borderRadius:14,padding:12}}>
                    <Icons.Trash/> Apagar
                  </Btn>
                </div>
              ) : (
                <div style={{textAlign:'center',padding:'8px 0',fontSize:12,color:C.muted}}>
                  Só {viewRecado.from_name} pode editar ou apagar este recado.
                </div>
              )}
            </>
          )
        })()}
      </Modal>

      {/* ── MODAL: novo / editar recado ── */}
      <Modal open={recadoOpen} onClose={()=>{setRecadoOpen(false);setEditRecado(null);setRecadoText('')}} title={editRecado?'✏️ Editar recado':'💬 Novo recado'}>
        {!editRecado && (
          <Field label="Para">
            <div style={{display:'flex',gap:8}}>
              {[partner?.name||'Gabi', profile?.name||'Erick'].map(p=>(
                <button key={p} onClick={()=>setPara(p)} style={{flex:1,padding:'9px',borderRadius:100,border:'none',cursor:'pointer',background:para===p?C.black:'rgba(14,14,12,.07)',color:para===p?C.lime:C.muted,fontWeight:700,fontSize:12,fontFamily:'inherit'}}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
        )}
        <Field label="Recado">
          <Input value={recadoText} onChange={setRecadoText} as="textarea" placeholder="Escreva seu recado..." style={{minHeight:100}}/>
        </Field>
        <div style={{display:'flex',gap:8,marginTop:4}}>
          <Btn onClick={sendRecado} disabled={!recadoText.trim()} style={{flex:1,justifyContent:'center',borderRadius:14,padding:12,fontSize:13}}>
            {editRecado?'Salvar alteração':'Enviar ↑'}
          </Btn>
          <Btn variant="secondary" onClick={()=>{setRecadoOpen(false);setEditRecado(null);setRecadoText('')}} style={{padding:'12px 18px',borderRadius:14}}>
            Cancelar
          </Btn>
        </div>
      </Modal>
    </PageShell>
  )
}
