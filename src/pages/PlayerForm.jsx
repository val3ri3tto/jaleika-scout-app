import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../db/usePlayer'
import FormSection from '../components/FormSection'
import BallRating from '../components/BallRating'
import { exportPDF } from '../utils/pdfExport'
import './PlayerForm.css'

const RUOLI = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante']
const PIEDI = ['Destro', 'Sinistro', 'Entrambi']
const VALUTAZIONI = [
  { value: 'Da rivedere', desc: 'Serve un\'altra osservazione', color: '#6b7b8a' },
  { value: 'Interessante', desc: 'Potenziale ma tecnica da migliorare', color: '#ff9800' },
  { value: 'Alto potenziale', desc: 'Ottima tecnica ma testa da indirizzare', color: '#2196f3' },
  { value: 'Top', desc: 'Pronto per allenamenti top', color: '#4caf50' },
]

const TIPSS_GIOCATORE = [
  {
    key: 'tecnica', label: 'T - Tecnica',
    items: [
      { key: 'controllo', label: 'Controllo palla / primo tocco' },
      { key: 'passaggio', label: 'Passaggio' },
      { key: 'dribbling', label: 'Dribbling / 1v1' },
      { key: 'tiro', label: 'Tiro' },
    ]
  },
  {
    key: 'intelligenza', label: 'I - Intelligenza',
    items: [
      { key: 'lettura', label: 'Lettura del gioco' },
      { key: 'posizionamento', label: 'Posizionamento' },
      { key: 'decisioni', label: 'Decisioni' },
    ]
  },
  {
    key: 'personalita', label: 'P - Personalità',
    items: [
      { key: 'reazione', label: 'Reazione agli errori' },
      { key: 'spirito', label: 'Spirito competitivo' },
      { key: 'atteggiamento', label: 'Atteggiamento con compagni e avversari' },
    ]
  },
  {
    key: 'velocita', label: 'S - Velocità',
    items: [
      { key: 'esecuzione', label: 'Rapidità di esecuzione' },
      { key: 'pura', label: 'Velocità pura' },
    ]
  },
  {
    key: 'struttura', label: 'S - Struttura',
    items: [
      { key: 'coordinazione', label: 'Coordinazione motoria' },
      { key: 'resistenza', label: 'Resistenza / tenuta nella partita' },
    ]
  },
]

const TIPSS_PORTIERE = [
  {
    key: 'tecnica', label: 'T - Tecnica',
    items: [
      { key: 'presa', label: 'Presa e bloccaggio' },
      { key: 'tuffo', label: 'Tuffo e parata' },
      { key: 'uscite', label: 'Uscita alta / presa aerea' },
      { key: 'piedi', label: 'Rinvio e gioco con i piedi' },
      { key: 'rilancio', label: 'Rilancio con le mani' },
    ]
  },
  {
    key: 'intelligenza', label: 'I - Intelligenza Tattica',
    items: [
      { key: 'posizionamento', label: 'Posizionamento e angolazione' },
      { key: 'lettura', label: 'Lettura del gioco / anticipo' },
      { key: 'area', label: 'Gestione dell\'area' },
      { key: 'organizzazione', label: 'Organizzazione difensiva / comunicazione' },
    ]
  },
  {
    key: 'personalita', label: 'P - Personalità',
    items: [
      { key: 'reazione', label: 'Reazione agli errori' },
      { key: 'coraggio', label: 'Coraggio e determinazione' },
      { key: 'leadership', label: 'Leadership e comunicazione' },
      { key: 'concentrazione', label: 'Concentrazione' },
    ]
  },
  {
    key: 'velocita', label: 'S - Reattività',
    items: [
      { key: 'riflessi', label: 'Riflessi' },
      { key: 'esplosivita', label: 'Esplosività' },
      { key: 'laterali', label: 'Rapidità nei movimenti laterali' },
    ]
  },
  {
    key: 'struttura', label: 'S - Struttura',
    items: [
      { key: 'coordinazione', label: 'Coordinazione motoria' },
      { key: 'flessibilita', label: 'Flessibilità e agilità' },
      { key: 'fisica', label: 'Struttura fisica / potenziale altezza' },
    ]
  },
]

function getTIPSS(ruolo) {
  return ruolo === 'Portiere' ? TIPSS_PORTIERE : TIPSS_GIOCATORE
}

function emptyObservation(playerId, ruolo) {
  const obs = {
    playerId,
    dataOsservazione: new Date().toISOString().split('T')[0],
    squadraCasa: '',
    squadraOspite: '',
    competizione: '',
    ambienteFamiliare: '',
    notePersona: '',
    noteGenerali: '',
    valutazioneSintetica: '',
  }
  // Initialize fields for BOTH configs so data is never lost if role changes
  const allConfigs = [TIPSS_GIOCATORE, TIPSS_PORTIERE]
  allConfigs.forEach(config => {
    config.forEach(dim => {
      obs[`${dim.key}_commento`] = obs[`${dim.key}_commento`] || ''
      dim.items.forEach(item => {
        const votoKey = `${dim.key}_${item.key}Voto`
        const notaKey = `${dim.key}_${item.key}Nota`
        if (!(votoKey in obs)) obs[votoKey] = 0
        if (!(notaKey in obs)) obs[notaKey] = ''
      })
    })
  })
  return obs
}

export default function PlayerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const { player, observations, loading, savePlayer, saveObservation, deletePlayer } = usePlayer(isNew ? null : id)

  const [playerData, setPlayerData] = useState({
    nome: '', cognome: '', dataNascita: '', squadra: '', ruolo: '', piedePreferito: '', foto: ''
  })
  const [currentObs, setCurrentObs] = useState(null)
  const [selectedObsIndex, setSelectedObsIndex] = useState(0)
  const [saved, setSaved] = useState(false)

  const saveTimeout = useRef(null)

  useEffect(() => {
    if (player) {
      setPlayerData(player)
    }
  }, [player])

  useEffect(() => {
    if (!isNew && observations.length > 0) {
      setCurrentObs(observations[selectedObsIndex] || observations[0])
    }
  }, [observations, selectedObsIndex, isNew])

  const autoSave = useCallback((pData, obsData) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      if (pData.nome || pData.cognome) {
        const pId = await savePlayer(pData)
        if (obsData && pId) {
          await saveObservation({ ...obsData, playerId: pId })
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      }
    }, 800)
  }, [savePlayer, saveObservation])

  const updatePlayer = (field, value) => {
    const updated = { ...playerData, [field]: value }
    setPlayerData(updated)
    autoSave(updated, currentObs)
  }

  const updateObs = (field, value) => {
    const updated = { ...currentObs, [field]: value }
    setCurrentObs(updated)
    autoSave(playerData, updated)
  }

  const handleNewObservation = async () => {
    if (!playerData.id && (playerData.nome || playerData.cognome)) {
      const pId = await savePlayer(playerData)
      const obs = emptyObservation(pId, playerData.ruolo)
      const obsId = await saveObservation(obs)
      setCurrentObs({ ...obs, id: obsId })
      setPlayerData(prev => ({ ...prev, id: pId }))
    } else if (playerData.id) {
      const obs = emptyObservation(playerData.id, playerData.ruolo)
      const obsId = await saveObservation(obs)
      setCurrentObs({ ...obs, id: obsId })
    }
  }

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => updatePlayer('foto', reader.result)
    reader.readAsDataURL(file)
  }

  if (loading) return <div className="home-loading">Caricamento...</div>

  return (
    <div className="player-form">
      <header className="player-form__header">
        <button className="player-form__back" onClick={() => navigate('/')}>
          &#8592; Lista
        </button>
        <h1>{isNew ? 'Nuovo Giocatore' : `${playerData.nome} ${playerData.cognome}`}</h1>
        {saved && <span className="player-form__saved">Salvato</span>}
      </header>

      {/* ANAGRAFICA */}
      <FormSection title="Anagrafica">
        <div className="form-row">
          <div className="form-field">
            <label>Nome</label>
            <input value={playerData.nome} onChange={e => updatePlayer('nome', e.target.value)} placeholder="Nome" />
          </div>
          <div className="form-field">
            <label>Cognome</label>
            <input value={playerData.cognome} onChange={e => updatePlayer('cognome', e.target.value)} placeholder="Cognome" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Data di nascita</label>
            <input type="date" value={playerData.dataNascita} onChange={e => updatePlayer('dataNascita', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Squadra</label>
            <input value={playerData.squadra} onChange={e => updatePlayer('squadra', e.target.value)} placeholder="Squadra" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Ruolo</label>
            <select value={playerData.ruolo} onChange={e => updatePlayer('ruolo', e.target.value)}>
              <option value="">Seleziona ruolo</option>
              {RUOLI.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Piede preferito</label>
            <select value={playerData.piedePreferito} onChange={e => updatePlayer('piedePreferito', e.target.value)}>
              <option value="">Seleziona</option>
              {PIEDI.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-field">
          <label>Foto (opzionale)</label>
          <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} />
        </div>
      </FormSection>

      {/* OBSERVATION SELECTOR */}
      {!isNew && observations.length > 0 && (
        <div className="obs-selector">
          <span>Osservazione:</span>
          <select value={selectedObsIndex} onChange={e => setSelectedObsIndex(Number(e.target.value))}>
            {observations.map((obs, i) => (
              <option key={obs.id} value={i}>{obs.dataOsservazione} - {obs.competizione || 'Partita'}</option>
            ))}
          </select>
          <button className="obs-selector__new" onClick={handleNewObservation}>+ Nuova</button>
        </div>
      )}

      {/* Create observation when none exists */}
      {!currentObs && (
        <div className="obs-start">
          <button className="obs-start__btn" onClick={handleNewObservation}>
            Inizia Osservazione
          </button>
          <p>{isNew ? 'Compila l\'anagrafica e premi per iniziare la valutazione' : 'Aggiungi una nuova osservazione per questo giocatore'}</p>
        </div>
      )}

      {currentObs && (
        <>
          {/* INFO PARTITA */}
          <FormSection title="Info Partita">
            <div className="form-row">
              <div className="form-field">
                <label>Data osservazione</label>
                <input type="date" value={currentObs.dataOsservazione} onChange={e => updateObs('dataOsservazione', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Competizione / Torneo</label>
                <input value={currentObs.competizione} onChange={e => updateObs('competizione', e.target.value)} placeholder="Es. Campionato Esordienti" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Squadra casa</label>
                <input value={currentObs.squadraCasa} onChange={e => updateObs('squadraCasa', e.target.value)} placeholder="Squadra casa" />
              </div>
              <div className="form-field">
                <label>Squadra ospite</label>
                <input value={currentObs.squadraOspite} onChange={e => updateObs('squadraOspite', e.target.value)} placeholder="Squadra ospite" />
              </div>
            </div>
          </FormSection>

          {/* TIPSS */}
          {getTIPSS(playerData.ruolo).map(dim => (
            <FormSection key={dim.key} title={dim.label} defaultOpen={false}>
              {dim.items.map(item => (
                <div key={item.key} className="tipss-item">
                  <div className="tipss-item__header">
                    <span>{item.label}</span>
                    <BallRating
                      value={currentObs[`${dim.key}_${item.key}Voto`] || 0}
                      onChange={v => updateObs(`${dim.key}_${item.key}Voto`, v)}
                    />
                  </div>
                  <input
                    className="tipss-item__note"
                    placeholder="Nota (opzionale)"
                    value={currentObs[`${dim.key}_${item.key}Nota`] || ''}
                    onChange={e => updateObs(`${dim.key}_${item.key}Nota`, e.target.value)}
                  />
                </div>
              ))}
              <div className="form-field">
                <label>Commento generale - {dim.label}</label>
                <textarea
                  value={currentObs[`${dim.key}_commento`] || ''}
                  onChange={e => updateObs(`${dim.key}_commento`, e.target.value)}
                  placeholder="Impressioni generali su questa dimensione..."
                />
              </div>
            </FormSection>
          ))}

          {/* EXTRA CAMPO */}
          <FormSection title="Extra-campo" defaultOpen={false}>
            <div className="form-field">
              <label>Ambiente familiare</label>
              <textarea
                value={currentObs.ambienteFamiliare || ''}
                onChange={e => updateObs('ambienteFamiliare', e.target.value)}
                placeholder="Es. genitori presenti, padre molto coinvolto ma rispettoso..."
              />
            </div>
            <div className="form-field">
              <label>Note sulla persona</label>
              <textarea
                value={currentObs.notePersona || ''}
                onChange={e => updateObs('notePersona', e.target.value)}
                placeholder="Es. ragazzino timido ma concentratissimo..."
              />
            </div>
          </FormSection>

          {/* NOTE GENERALI */}
          <FormSection title="Note Generali" defaultOpen={false}>
            <div className="form-field">
              <textarea
                value={currentObs.noteGenerali || ''}
                onChange={e => updateObs('noteGenerali', e.target.value)}
                placeholder="Momenti chiave, impressioni d'insieme, potenziale percepito..."
                style={{ minHeight: 120 }}
              />
            </div>
          </FormSection>

          {/* VALUTAZIONE SINTETICA */}
          <FormSection title="Valutazione Sintetica">
            <div className="valutazione-grid">
              {VALUTAZIONI.map(v => (
                <button
                  key={v.value}
                  className={`valutazione-btn ${currentObs.valutazioneSintetica === v.value ? 'active' : ''}`}
                  style={currentObs.valutazioneSintetica === v.value ? { backgroundColor: v.color, borderColor: v.color } : {}}
                  onClick={() => updateObs('valutazioneSintetica', v.value)}
                >
                  <strong>{v.value}</strong>
                  <span>{v.desc}</span>
                </button>
              ))}
            </div>
          </FormSection>

          {/* EXPORT PDF */}
          <button className="export-btn" onClick={() => exportPDF(playerData, currentObs)}>
            Esporta PDF
          </button>
        </>
      )}

      {/* DELETE PLAYER */}
      {!isNew && playerData.id && (
        <button
          className="delete-player-btn"
          onClick={async () => {
            if (window.confirm(`Vuoi davvero eliminare ${playerData.nome} ${playerData.cognome} e tutte le sue osservazioni?`)) {
              await deletePlayer(playerData.id)
              navigate('/')
            }
          }}
        >
          Elimina giocatore
        </button>
      )}
    </div>
  )
}
