import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../db/usePlayers'
import PlayerCard from '../components/PlayerCard'
import './Home.css'

export default function Home() {
  const { players, loading } = usePlayers()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtroRuolo, setFiltroRuolo] = useState('')

  const filtered = useMemo(() => {
    return players.filter(p => {
      const matchSearch = !search ||
        `${p.nome} ${p.cognome}`.toLowerCase().includes(search.toLowerCase()) ||
        p.squadra?.toLowerCase().includes(search.toLowerCase())
      const matchRuolo = !filtroRuolo || p.ruolo === filtroRuolo
      return matchSearch && matchRuolo
    }).sort((a, b) => (b.ultimaOsservazione || '').localeCompare(a.ultimaOsservazione || ''))
  }, [players, search, filtroRuolo])

  if (loading) return <div className="home-loading">Caricamento...</div>

  return (
    <div className="home">
      <header className="home__header">
        <img src="/Logotipo_arco.svg" alt="Jaleika" className="home__logo" />
        <h1>Scout</h1>
      </header>

      <div className="home__filters">
        <input
          type="search"
          placeholder="Cerca giocatore o squadra..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="home__search"
        />
        <select value={filtroRuolo} onChange={e => setFiltroRuolo(e.target.value)}>
          <option value="">Tutti i ruoli</option>
          <option value="Portiere">Portiere</option>
          <option value="Difensore">Difensore</option>
          <option value="Centrocampista">Centrocampista</option>
          <option value="Attaccante">Attaccante</option>
        </select>
      </div>

      <div className="home__list">
        {filtered.length === 0 ? (
          <p className="home__empty">
            {players.length === 0
              ? 'Nessun giocatore osservato. Inizia con una nuova osservazione!'
              : 'Nessun risultato per i filtri selezionati.'}
          </p>
        ) : (
          filtered.map(p => <PlayerCard key={p.id} player={p} />)
        )}
      </div>

      <button className="home__fab" onClick={() => navigate('/player/new')}>
        + Nuova Osservazione
      </button>
    </div>
  )
}
