import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [profile, setProfile]   = useState(null)
  const [partner, setPartner]   = useState(null)
  const [coupleId, setCoupleId] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else {
        setProfile(null); setPartner(null); setCoupleId(null); setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(uid) {
    try {
      const { data: p, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle()

      if (p) {
        setProfile(p)
        setCoupleId(p.couple_id)

        if (p.couple_id) {
          const { data: pt } = await supabase
            .from('profiles')
            .select('id, name, couple_id')
            .eq('couple_id', p.couple_id)
            .neq('id', uid)
            .maybeSingle()
          setPartner(pt ?? null)
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil:', e)
    }
    setLoading(false)
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      await loadProfile(data.user.id)
    }
    return { error }
  }

  async function signUp(email, password, name, inviteCode) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }

    const uid = data.user?.id
    if (!uid) return { error: new Error('Usuário não criado') }

    // Busca ou cria casal
    let cid
    if (inviteCode?.trim()) {
      const { data: c } = await supabase
        .from('couples')
        .select('id')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .maybeSingle()
      cid = c?.id
    }

    if (!cid) {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase()
      const { data: nc, error: ce } = await supabase
        .from('couples')
        .insert({ invite_code: code })
        .select()
        .single()
      if (ce) return { error: ce }
      cid = nc.id
    }

    // Cria perfil
    const { error: pe } = await supabase
      .from('profiles')
      .insert({ id: uid, name, couple_id: cid })

    if (pe) return { error: pe }

    await loadProfile(uid)
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(updates) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (!error) setProfile(p => ({ ...p, ...updates }))
    return { error }
  }

  return (
    <Ctx.Provider value={{
      user, profile, partner, coupleId, loading,
      signIn, signUp, signOut, updateProfile
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
