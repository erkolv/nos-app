import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTable(table, orderCol = 'created_at') {
  const { coupleId } = useAuth()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!coupleId) { setLoading(false); return }
    const { data: rows, error } = await supabase
      .from(table).select('*')
      .eq('couple_id', coupleId)
      .order(orderCol, { ascending: false })
    if (!error) setData(rows ?? [])
    setLoading(false)
  }, [table, coupleId, orderCol])

  useEffect(() => {
    fetch()
    if (!coupleId) return
    let channel
    try {
      channel = supabase
        .channel(`${table}_${coupleId}_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table, filter: `couple_id=eq.${coupleId}` }, fetch)
        .subscribe()
    } catch(e) { /* realtime opcional */ }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [table, coupleId, fetch])

  async function insert(row) {
    const { data: d, error } = await supabase
      .from(table)
      .insert({ ...row, couple_id: coupleId })
      .select().single()
    if (!error && d) {
      // Atualiza localmente imediatamente, sem esperar o Realtime
      setData(prev => [d, ...prev])
    }
    return { data: d, error }
  }

  async function update(id, updates) {
    const { error } = await supabase
      .from(table).update(updates)
      .eq('id', id).eq('couple_id', coupleId)
    if (!error) {
      setData(prev => prev.map(row => row.id === id ? { ...row, ...updates } : row))
    }
    return { error }
  }

  async function remove(id) {
    const { error } = await supabase
      .from(table).delete()
      .eq('id', id).eq('couple_id', coupleId)
    if (!error) {
      setData(prev => prev.filter(row => row.id !== id))
    }
    return { error }
  }

  return { data, loading, refetch: fetch, insert, update, remove }
}
