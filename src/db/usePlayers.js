import { useState, useEffect } from 'react'
import { db } from './database'

export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const all = await db.players.toArray()
    const enriched = await Promise.all(all.map(async (p) => {
      const obs = await db.observations
        .where('playerId').equals(p.id)
        .reverse().sortBy('dataOsservazione')
      const latest = obs[0] || null
      return {
        ...p,
        ultimaOsservazione: latest?.dataOsservazione || null,
        valutazioneSintetica: latest?.valutazioneSintetica || null,
        numOsservazioni: obs.length
      }
    }))
    setPlayers(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return { players, loading, reload: load }
}
