import { useNavigate } from 'react-router-dom'
import './PlayerCard.css'

const VALUTAZIONE_COLORS = {
  'Da rivedere': '#6b7b8a',
  'Interessante': '#ff9800',
  'Alto potenziale': '#2196f3',
  'Top': '#4caf50'
}

export default function PlayerCard({ player }) {
  const navigate = useNavigate()
  const badgeColor = VALUTAZIONE_COLORS[player.valutazioneSintetica] || 'transparent'

  return (
    <div className="player-card" onClick={() => navigate(`/player/${player.id}`)}>
      <div className="player-card__avatar">
        {player.foto
          ? <img src={player.foto} alt={player.nome} />
          : <span>{(player.nome?.[0] || '') + (player.cognome?.[0] || '')}</span>
        }
      </div>
      <div className="player-card__info">
        <h3>{player.nome} {player.cognome}</h3>
        <p>{player.ruolo} &middot; {player.squadra}</p>
        <p className="player-card__meta">
          Nato: {player.dataNascita} &middot; Oss: {player.numOsservazioni || 0}
        </p>
      </div>
      {player.valutazioneSintetica && (
        <div className="player-card__badge" style={{ backgroundColor: badgeColor }}>
          {player.valutazioneSintetica}
        </div>
      )}
    </div>
  )
}
