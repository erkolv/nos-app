import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { C, Input, Btn, Field } from '../components/ui'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode]     = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm]     = useState({ email: '', password: '', name: '', code: '' })
  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  async function handle() {
    setError(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      if (!form.name.trim()) { setError('Digite seu nome.'); setLoading(false); return }
      const { error } = await signUp(form.email, form.password, form.name, form.code)
      if (error) { setError(error.message); setLoading(false); return }
    }
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-3px', color: C.black, lineHeight: 1 }}>
          nós<span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: C.lime, marginLeft: 3, marginBottom: 10 }} />
        </div>
        <div style={{ fontSize: 13, color: C.muted, fontWeight: 500, marginTop: 8 }}>O app da vida de vocês dois</div>
      </div>

      <div style={{ width: '100%', maxWidth: 400, background: C.white, borderRadius: 32, padding: '26px 22px' }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '9px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: mode === m ? C.black : 'rgba(14,14,12,0.07)',
              color: mode === m ? C.lime : C.muted,
              fontWeight: 800, fontSize: 13, transition: 'all 0.15s'
            }}>
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <Field label="Seu nome">
            <Input value={form.name} onChange={set('name')} placeholder="Ex: Erick" />
          </Field>
        )}
        <Field label="E-mail">
          <Input value={form.email} onChange={set('email')} type="email" placeholder="seu@email.com" />
        </Field>
        <Field label="Senha">
          <Input value={form.password} onChange={set('password')} type="password" placeholder="••••••••" />
        </Field>
        {mode === 'register' && (
          <Field label="Código do casal (opcional)">
            <Input value={form.code} onChange={set('code')} placeholder="Ex: ABC123 — se a Gabi já criou conta" />
            <p style={{ fontSize: 11, color: C.muted, marginTop: 5, fontWeight: 500 }}>
              Deixe em branco para criar um novo casal e gerar seu código.
            </p>
          </Field>
        )}

        {error && (
          <div style={{ background: '#FEE8E2', color: C.err, borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <Btn onClick={handle} disabled={loading} style={{ width: '100%', justifyContent: 'center', borderRadius: 14, padding: 14, fontSize: 14 }}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar →' : 'Criar conta →'}
        </Btn>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: C.muted, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
        Sync em tempo real — vocês dois veem tudo ao mesmo tempo.
      </p>
    </div>
  )
}
