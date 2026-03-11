import { useState, useEffect, useCallback } from 'react'
import { db } from './database'

export function usePlayer(id) {
  const [player, setPlayer] = useState(null)
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false)
      return
    }
    const numId = Number(id)
    Promise.all([
      db.players.get(numId),
      db.observations.where('playerId').equals(numId).reverse().sortBy('dataOsservazione')
    ]).then(([p, obs]) => {
      setPlayer(p || null)
      setObservations(obs || [])
      setLoading(false)
    })
  }, [id])

  const savePlayer = useCallback(async (data) => {
    const now = new Date().toISOString()
    if (data.id) {
      await db.players.update(data.id, { ...data, updatedAt: now })
      setPlayer({ ...data, updatedAt: now })
      return data.id
    } else {
      const newId = await db.players.add({ ...data, createdAt: now, updatedAt: now })
      const saved = { ...data, id: newId, createdAt: now, updatedAt: now }
      setPlayer(saved)
      return newId
    }
  }, [])

  const saveObservation = useCallback(async (data) => {
    const now = new Date().toISOString()
    if (data.id) {
      await db.observations.update(data.id, { ...data, updatedAt: now })
    } else {
      const newId = await db.observations.add({ ...data, createdAt: now, updatedAt: now })
      data.id = newId
    }
    const obs = await db.observations.where('playerId').equals(data.playerId).reverse().sortBy('dataOsservazione')
    setObservations(obs)
    return data.id
  }, [])

  const deleteObservation = useCallback(async (obsId) => {
    await db.observations.delete(obsId)
    setObservations(prev => prev.filter(o => o.id !== obsId))
  }, [])

  const deletePlayer = useCallback(async (playerId) => {
    const pid = Number(playerId)
    await db.observations.where('playerId').equals(pid).delete()
    await db.players.delete(pid)
  }, [])

  return { player, observations, loading, savePlayer, saveObservation, deleteObservation, deletePlayer }
}
