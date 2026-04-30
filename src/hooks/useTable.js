import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTable(table, orderCol = 'created_at') {
  const { coupleId } = useAuth()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!coupleId) { setData([]); setLoading(false); return }
    const { data: rows, error } = await supabase
      .from(table)
      .select('*')
      .eq('couple_id', coupleId)
      .order(orderCol, { ascending: false })
    if (!error) setData(rows ?? [])
    else console.warn(`useTable ${table} error:`, error.message)
    setLoading(false)
  }, [table, coupleId, orderCol])

  useEffect(() => {
    if (!coupleId) { setLoading(false); return }
    fetch()
    let channel
    try {
      channel = supabase
        .channel(`${table}_${coupleId}_${Date.now()}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table,
          filter: `couple_id=eq.${coupleId}`
        }, fetch)
        .subscribe()
    } catch(e) { /* realtime opcional */ }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [table, coupleId, fetch])

  async function insert(row) {
    if (!coupleId) return { error: new Error('Sem couple_id') }
    const { data: d, error } = await supabase
      .from(table)
      .insert({ ...row, couple_id: coupleId })
      .select().single()
    if (!error && d) setData(prev => [d, ...prev])
    else if (error) console.warn(`insert ${table}:`, error.message)
    return { data: d, error }
  }

  async function update(id, updates) {
    if (!coupleId) return { error: new Error('Sem couple_id') }
    const { error } = await supabase
      .from(table).update(updates)
      .eq('id', id).eq('couple_id', coupleId)
    if (!error) setData(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    else console.warn(`update ${table}:`, error.message)
    return { error }
  }

  async function remove(id) {
    if (!coupleId) return { error: new Error('Sem couple_id') }
    const { error } = await supabase
      .from(table).delete()
      .eq('id', id).eq('couple_id', coupleId)
    if (!error) setData(prev => prev.filter(r => r.id !== id))
    else console.warn(`remove ${table}:`, error.message)
    return { error }
  }

  return { data, loading, refetch: fetch, insert, update, remove }
}
