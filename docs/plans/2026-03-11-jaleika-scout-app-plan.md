# Jaleika Scout App - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a PWA tablet app for scouting young football players (8-13) using the TIPSS Jaleika evaluation method, with local storage and PDF export.

**Architecture:** React SPA with React Router for navigation (Home, PlayerForm). Dexie.js wraps IndexedDB for persistent local storage. jsPDF generates PDF reports with a custom SVG radar chart. Vite builds and vite-plugin-pwa handles service worker/manifest for offline support.

**Tech Stack:** React 18, Vite, React Router v6, Dexie.js, jsPDF, vite-plugin-pwa

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/index.css`
- Create: `public/Logotipo_arco.svg` (copy from user's path)

**Step 1: Initialize Vite + React project**

Run:
```bash
cd "C:/Users/Valerio/Desktop/App Osservazione"
npm create vite@latest . -- --template react
```

If directory not empty, say yes to overwrite.

**Step 2: Install dependencies**

Run:
```bash
npm install react-router-dom dexie jspdf
npm install -D vite-plugin-pwa
```

**Step 3: Copy logo into public/**

Run:
```bash
cp "/c/Users/Valerio/Pictures/Saved Pictures/Logotipo_arco.svg" public/Logotipo_arco.svg
```

**Step 4: Configure Vite with PWA plugin**

Replace `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jaleika Scout',
        short_name: 'Scout',
        description: 'App osservazione calcistica - Jaleika Player Lab',
        theme_color: '#1b202e',
        background_color: '#1b202e',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

**Step 5: Set up global CSS with Jaleika brand colors**

Replace `src/index.css`:

```css
:root {
  --bg-primary: #1b202e;
  --bg-secondary: #242938;
  --bg-card: #2a3040;
  --accent: #f3e606;
  --accent-dark: #d1b00d;
  --text-primary: #ffffff;
  --text-secondary: #a4b7c5;
  --text-muted: #6b7b8a;
  --success: #4caf50;
  --warning: #ff9800;
  --danger: #f44336;
  --radius: 12px;
  --radius-sm: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-size: inherit;
}

input, textarea, select {
  font-family: inherit;
  font-size: 16px;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--text-muted);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  width: 100%;
  outline: none;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--accent);
}

textarea {
  resize: vertical;
  min-height: 80px;
}
```

**Step 6: Set up App.jsx with React Router**

Replace `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PlayerForm from './pages/PlayerForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player/new" element={<PlayerForm />} />
        <Route path="/player/:id" element={<PlayerForm />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 7: Create placeholder pages**

Create `src/pages/Home.jsx`:
```jsx
export default function Home() {
  return <div style={{ padding: 24 }}>
    <h1>Jaleika Scout</h1>
    <p>Home - Lista giocatori</p>
  </div>
}
```

Create `src/pages/PlayerForm.jsx`:
```jsx
export default function PlayerForm() {
  return <div style={{ padding: 24 }}>
    <h1>Scheda Giocatore</h1>
  </div>
}
```

**Step 8: Update main.jsx**

Replace `src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Step 9: Verify dev server starts**

Run: `npm run dev`
Expected: App loads at localhost:5173 showing "Jaleika Scout" heading on dark background.

**Step 10: Commit**

```bash
git init
echo "node_modules\ndist\n.DS_Store" > .gitignore
git add -A
git commit -m "feat: scaffold Vite + React project with PWA, router, and Jaleika branding"
```

---

### Task 2: Database Layer (Dexie.js)

**Files:**
- Create: `src/db/database.js`
- Create: `src/db/usePlayer.js`
- Create: `src/db/usePlayers.js`

**Step 1: Create database schema**

Create `src/db/database.js`:

```js
import Dexie from 'dexie'

export const db = new Dexie('JaleikaScoutDB')

db.version(1).stores({
  players: '++id, nome, cognome, dataNascita, squadra, ruolo, piedePreferito, foto, createdAt, updatedAt',
  observations: '++id, playerId, dataOsservazione, squadraCasa, squadraOspite, competizione, tecnica_controlloVoto, tecnica_controlloNota, tecnica_passaggioVoto, tecnica_passaggioNota, tecnica_dribblingVoto, tecnica_dribblingNota, tecnica_tiroVoto, tecnica_tiroNota, tecnica_commento, intelligenza_letturaVoto, intelligenza_letturaNota, intelligenza_posizionamentoVoto, intelligenza_posizionamentoNota, intelligenza_decisioniVoto, intelligenza_decisioniNota, intelligenza_commento, personalita_reazioneVoto, personalita_reazioneNota, personalita_spiritoVoto, personalita_spiritoNota, personalita_atteggiamentoVoto, personalita_atteggiamentoNota, personalita_commento, velocita_esecuzioneVoto, velocita_esecuzioneNota, velocita_puraVoto, velocita_puraNota, velocita_commento, struttura_coordinazioneVoto, struttura_coordinazioneNota, struttura_resistenzaVoto, struttura_resistenzaNota, struttura_commento, ambienteFamiliare, notePersona, noteGenerali, valutazioneSintetica, createdAt, updatedAt'
})
```

Note: Dexie only indexes the fields listed, but all fields on stored objects are persisted. Only index fields you query by.

Simplify to only indexed fields:

```js
import Dexie from 'dexie'

export const db = new Dexie('JaleikaScoutDB')

db.version(1).stores({
  players: '++id, cognome, squadra, ruolo, dataNascita',
  observations: '++id, playerId, dataOsservazione, valutazioneSintetica'
})
```

**Step 2: Create usePlayer hook**

Create `src/db/usePlayer.js`:

```js
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

  return { player, observations, loading, savePlayer, saveObservation, deleteObservation }
}
```

**Step 3: Create usePlayers hook**

Create `src/db/usePlayers.js`:

```js
import { useState, useEffect } from 'react'
import { db } from './database'

export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const all = await db.players.toArray()
    // Attach latest observation info to each player
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
```

**Step 4: Verify database works**

Add temporary test in Home.jsx - import db, add a test player on mount, verify in browser DevTools > Application > IndexedDB.

**Step 5: Commit**

```bash
git add src/db/
git commit -m "feat: add Dexie.js database layer with player and observation hooks"
```

---

### Task 3: Home Page - Player List

**Files:**
- Modify: `src/pages/Home.jsx`
- Create: `src/pages/Home.css`
- Create: `src/components/PlayerCard.jsx`
- Create: `src/components/PlayerCard.css`

**Step 1: Build PlayerCard component**

Create `src/components/PlayerCard.jsx`:

```jsx
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
```

Create `src/components/PlayerCard.css`:

```css
.player-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.player-card:active {
  background: var(--bg-secondary);
}

.player-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
  overflow: hidden;
}

.player-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-card__info {
  flex: 1;
  min-width: 0;
}

.player-card__info h3 {
  font-size: 18px;
  margin-bottom: 2px;
}

.player-card__info p {
  color: var(--text-secondary);
  font-size: 14px;
}

.player-card__meta {
  color: var(--text-muted) !important;
  font-size: 13px !important;
}

.player-card__badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  color: #fff;
  white-space: nowrap;
}
```

**Step 2: Build Home page**

Replace `src/pages/Home.jsx`:

```jsx
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
```

Create `src/pages/Home.css`:

```css
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: 100px;
}

.home__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.home__logo {
  height: 40px;
  width: auto;
}

.home__header h1 {
  font-size: 24px;
  color: var(--accent);
}

.home__filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.home__search {
  flex: 1;
}

.home__filters select {
  width: auto;
  min-width: 160px;
}

.home__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home__empty {
  text-align: center;
  color: var(--text-muted);
  padding: 60px 20px;
  font-size: 18px;
}

.home__fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--accent);
  color: var(--bg-primary);
  font-size: 16px;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(243, 230, 6, 0.3);
  z-index: 100;
}

.home__fab:active {
  transform: scale(0.96);
}

.home-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--text-muted);
}
```

**Step 3: Verify**

Run: `npm run dev`
Expected: Home page shows with Jaleika logo, search bar, filter, empty state message, and yellow FAB button.

**Step 4: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.css src/components/
git commit -m "feat: add Home page with player list, search, filters, and player card"
```

---

### Task 4: Player Form - Anagrafica & Match Info

**Files:**
- Modify: `src/pages/PlayerForm.jsx`
- Create: `src/pages/PlayerForm.css`
- Create: `src/components/FormSection.jsx`
- Create: `src/components/FormSection.css`

**Step 1: Create FormSection wrapper component**

Create `src/components/FormSection.jsx`:

```jsx
import { useState } from 'react'
import './FormSection.css'

export default function FormSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="form-section">
      <h2 className="form-section__title" onClick={() => setOpen(!open)}>
        {title}
        <span className={`form-section__arrow ${open ? 'open' : ''}`}>&#9662;</span>
      </h2>
      {open && <div className="form-section__content">{children}</div>}
    </section>
  )
}
```

Create `src/components/FormSection.css`:

```css
.form-section {
  background: var(--bg-card);
  border-radius: var(--radius);
  margin-bottom: 16px;
  overflow: hidden;
}

.form-section__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  padding: 16px 20px;
  cursor: pointer;
  color: var(--accent);
  user-select: none;
}

.form-section__arrow {
  font-size: 14px;
  transition: transform 0.2s;
}

.form-section__arrow.open {
  transform: rotate(180deg);
}

.form-section__content {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

**Step 2: Build PlayerForm with Anagrafica and Info Partita**

Replace `src/pages/PlayerForm.jsx`:

```jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../db/usePlayer'
import FormSection from '../components/FormSection'
import BallRating from '../components/BallRating'
import './PlayerForm.css'

const RUOLI = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante']
const PIEDI = ['Destro', 'Sinistro', 'Entrambi']
const VALUTAZIONI = [
  { value: 'Da rivedere', desc: 'Serve un\'altra osservazione', color: '#6b7b8a' },
  { value: 'Interessante', desc: 'Potenziale ma tecnica da migliorare', color: '#ff9800' },
  { value: 'Alto potenziale', desc: 'Ottima tecnica ma testa da indirizzare', color: '#2196f3' },
  { value: 'Top', desc: 'Pronto per allenamenti top', color: '#4caf50' },
]

const TIPSS = [
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
    key: 'personalita', label: 'P - Personalita',
    items: [
      { key: 'reazione', label: 'Reazione agli errori' },
      { key: 'spirito', label: 'Spirito competitivo' },
      { key: 'atteggiamento', label: 'Atteggiamento con compagni e avversari' },
    ]
  },
  {
    key: 'velocita', label: 'S - Velocita',
    items: [
      { key: 'esecuzione', label: 'Rapidita di esecuzione' },
      { key: 'pura', label: 'Velocita pura' },
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

function emptyObservation(playerId) {
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
  TIPSS.forEach(dim => {
    obs[`${dim.key}_commento`] = ''
    dim.items.forEach(item => {
      obs[`${dim.key}_${item.key}Voto`] = 0
      obs[`${dim.key}_${item.key}Nota`] = ''
    })
  })
  return obs
}

export default function PlayerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const { player, observations, loading, savePlayer, saveObservation, deleteObservation } = usePlayer(isNew ? null : id)

  const [playerData, setPlayerData] = useState({
    nome: '', cognome: '', dataNascita: '', squadra: '', ruolo: '', piedePreferito: '', foto: ''
  })
  const [currentObs, setCurrentObs] = useState(null)
  const [selectedObsIndex, setSelectedObsIndex] = useState(0)
  const [saved, setSaved] = useState(false)

  const saveTimeout = useRef(null)

  // Load player data when available
  useEffect(() => {
    if (player) {
      setPlayerData(player)
    }
  }, [player])

  // Load or create observation
  useEffect(() => {
    if (!isNew && observations.length > 0) {
      setCurrentObs(observations[selectedObsIndex] || observations[0])
    }
  }, [observations, selectedObsIndex, isNew])

  // Auto-save with debounce
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
      const obs = emptyObservation(pId)
      const obsId = await saveObservation(obs)
      setCurrentObs({ ...obs, id: obsId })
    } else if (playerData.id) {
      const obs = emptyObservation(playerData.id)
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

  // For new players, auto-create first observation context
  if (isNew && !currentObs) {
    // We'll create the observation after the player is first saved
  }

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

      {/* Create first observation for new player */}
      {isNew && !currentObs && (
        <div className="obs-start">
          <button className="obs-start__btn" onClick={handleNewObservation}>
            Inizia Osservazione
          </button>
          <p>Compila l'anagrafica e premi per iniziare la valutazione</p>
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
          {TIPSS.map(dim => (
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
          <button className="export-btn" onClick={() => {/* Task 6 */}}>
            Esporta PDF
          </button>
        </>
      )}
    </div>
  )
}
```

**Step 3: Create PlayerForm CSS**

Create `src/pages/PlayerForm.css`:

```css
.player-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: 100px;
}

.player-form__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.player-form__back {
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 16px;
}

.player-form__header h1 {
  flex: 1;
  font-size: 22px;
}

.player-form__saved {
  color: var(--success);
  font-size: 14px;
  font-weight: 600;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

/* TIPSS items */
.tipss-item {
  border-bottom: 1px solid var(--bg-secondary);
  padding-bottom: 12px;
}

.tipss-item:last-of-type {
  border-bottom: none;
}

.tipss-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 16px;
}

.tipss-item__note {
  font-size: 14px !important;
  padding: 8px 12px !important;
  background: var(--bg-secondary) !important;
  border: none !important;
}

/* Observation selector */
.obs-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 12px 20px;
  margin-bottom: 16px;
  font-size: 15px;
  color: var(--text-secondary);
}

.obs-selector select {
  flex: 1;
}

.obs-selector__new {
  background: var(--accent);
  color: var(--bg-primary);
  font-weight: 700;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.obs-start {
  text-align: center;
  padding: 40px 20px;
}

.obs-start__btn {
  background: var(--accent);
  color: var(--bg-primary);
  font-size: 18px;
  font-weight: 700;
  padding: 16px 40px;
  border-radius: var(--radius);
  margin-bottom: 12px;
}

.obs-start p {
  color: var(--text-muted);
}

/* Valutazione */
.valutazione-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.valutazione-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--text-muted);
  border-radius: var(--radius);
  color: var(--text-primary);
  text-align: center;
  transition: all 0.2s;
}

.valutazione-btn.active {
  color: #fff;
}

.valutazione-btn strong {
  font-size: 16px;
}

.valutazione-btn span {
  font-size: 12px;
  opacity: 0.8;
}

/* Export */
.export-btn {
  display: block;
  width: 100%;
  background: var(--accent);
  color: var(--bg-primary);
  font-size: 18px;
  font-weight: 700;
  padding: 18px;
  border-radius: var(--radius);
  margin-top: 8px;
}
```

**Step 4: Verify**

Run: `npm run dev`
Expected: Navigate to /player/new, see anagrafica form with two-column layout. All fields render correctly on tablet-width viewport.

**Step 5: Commit**

```bash
git add src/pages/PlayerForm.jsx src/pages/PlayerForm.css src/components/FormSection.jsx src/components/FormSection.css
git commit -m "feat: add PlayerForm with anagrafica, match info, TIPSS, and valutazione"
```

---

### Task 5: BallRating Component

**Files:**
- Create: `src/components/BallRating.jsx`
- Create: `src/components/BallRating.css`

**Step 1: Build BallRating component (5 tappable soccer balls)**

Create `src/components/BallRating.jsx`:

```jsx
import './BallRating.css'

export default function BallRating({ value = 0, onChange }) {
  return (
    <div className="ball-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`ball-rating__ball ${n <= value ? 'active' : ''}`}
          onClick={() => onChange(n === value ? 0 : n)}
          type="button"
          aria-label={`Voto ${n}`}
        >
          ⚽
        </button>
      ))}
    </div>
  )
}
```

Create `src/components/BallRating.css`:

```css
.ball-rating {
  display: flex;
  gap: 4px;
}

.ball-rating__ball {
  font-size: 24px;
  background: none;
  padding: 4px;
  border-radius: 50%;
  opacity: 0.25;
  filter: grayscale(1);
  transition: all 0.15s;
}

.ball-rating__ball.active {
  opacity: 1;
  filter: grayscale(0);
}

.ball-rating__ball:active {
  transform: scale(1.2);
}
```

**Step 2: Verify**

Run: `npm run dev`
Navigate to /player/new, create observation, open a TIPSS section. Soccer balls should appear, tapping activates/deactivates them. Tapping same value again resets to 0.

**Step 3: Commit**

```bash
git add src/components/BallRating.jsx src/components/BallRating.css
git commit -m "feat: add BallRating component with tappable soccer balls"
```

---

### Task 6: PDF Export

**Files:**
- Create: `src/utils/pdfExport.js`
- Modify: `src/pages/PlayerForm.jsx` (wire up export button)

**Step 1: Create PDF export utility**

Create `src/utils/pdfExport.js`:

```js
import jsPDF from 'jspdf'

const COLORS = {
  bg: [27, 32, 46],
  accent: [243, 230, 6],
  accentDark: [209, 176, 13],
  white: [255, 255, 255],
  gray: [164, 183, 197],
  muted: [107, 123, 138],
}

const VALUTAZIONE_COLORS = {
  'Da rivedere': [107, 123, 138],
  'Interessante': [255, 152, 0],
  'Alto potenziale': [33, 150, 243],
  'Top': [76, 175, 80],
}

const TIPSS_CONFIG = [
  {
    key: 'tecnica', label: 'Tecnica',
    items: [
      { key: 'controllo', label: 'Controllo palla' },
      { key: 'passaggio', label: 'Passaggio' },
      { key: 'dribbling', label: 'Dribbling / 1v1' },
      { key: 'tiro', label: 'Tiro' },
    ]
  },
  {
    key: 'intelligenza', label: 'Intelligenza',
    items: [
      { key: 'lettura', label: 'Lettura del gioco' },
      { key: 'posizionamento', label: 'Posizionamento' },
      { key: 'decisioni', label: 'Decisioni' },
    ]
  },
  {
    key: 'personalita', label: 'Personalita',
    items: [
      { key: 'reazione', label: 'Reazione errori' },
      { key: 'spirito', label: 'Spirito competitivo' },
      { key: 'atteggiamento', label: 'Atteggiamento' },
    ]
  },
  {
    key: 'velocita', label: 'Velocita',
    items: [
      { key: 'esecuzione', label: 'Rapidita esecuzione' },
      { key: 'pura', label: 'Velocita pura' },
    ]
  },
  {
    key: 'struttura', label: 'Struttura',
    items: [
      { key: 'coordinazione', label: 'Coordinazione' },
      { key: 'resistenza', label: 'Resistenza' },
    ]
  },
]

function getDimAvg(obs, dimKey, items) {
  const votes = items.map(i => obs[`${dimKey}_${i.key}Voto`] || 0).filter(v => v > 0)
  if (votes.length === 0) return 0
  return votes.reduce((a, b) => a + b, 0) / votes.length
}

function drawRadar(doc, obs, x, y, radius) {
  const dims = TIPSS_CONFIG.map(d => ({
    label: d.label.charAt(0),
    fullLabel: d.label,
    value: getDimAvg(obs, d.key, d.items)
  }))

  const n = dims.length
  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  // Draw grid circles
  for (let level = 1; level <= 5; level++) {
    const r = (level / 5) * radius
    doc.setDrawColor(...COLORS.muted)
    doc.setLineWidth(0.3)
    const points = []
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep
      points.push([x + r * Math.cos(angle), y + r * Math.sin(angle)])
    }
    for (let i = 0; i < n; i++) {
      doc.line(points[i][0], points[i][1], points[(i + 1) % n][0], points[(i + 1) % n][1])
    }
  }

  // Draw axes and labels
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep
    const ex = x + radius * Math.cos(angle)
    const ey = y + radius * Math.sin(angle)
    doc.setDrawColor(...COLORS.muted)
    doc.setLineWidth(0.3)
    doc.line(x, y, ex, ey)

    const lx = x + (radius + 12) * Math.cos(angle)
    const ly = y + (radius + 12) * Math.sin(angle)
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.white)
    doc.text(dims[i].fullLabel, lx, ly, { align: 'center' })
  }

  // Draw data polygon
  const dataPoints = dims.map((d, i) => {
    const r = (d.value / 5) * radius
    const angle = startAngle + i * angleStep
    return [x + r * Math.cos(angle), y + r * Math.sin(angle)]
  })

  doc.setFillColor(...COLORS.accent)
  doc.setGState(new doc.GState({ opacity: 0.3 }))
  // Draw filled polygon manually
  const path = dataPoints.map((p, i) => (i === 0 ? `${p[0]} ${p[1]} m` : `${p[0]} ${p[1]} l`)).join(' ')
  // Use lines instead for simplicity
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(1.5)
  doc.setGState(new doc.GState({ opacity: 1 }))
  for (let i = 0; i < dataPoints.length; i++) {
    const next = (i + 1) % dataPoints.length
    doc.line(dataPoints[i][0], dataPoints[i][1], dataPoints[next][0], dataPoints[next][1])
  }

  // Draw dots
  dataPoints.forEach(p => {
    doc.setFillColor(...COLORS.accent)
    doc.circle(p[0], p[1], 2, 'F')
  })
}

export function exportPDF(player, obs) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  let y = 20

  // Background
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, 210, 297, 'F')

  // Header
  doc.setTextColor(...COLORS.accent)
  doc.setFontSize(22)
  doc.text('JALEIKA PLAYER LAB', 15, y)
  y += 6
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.gray)
  doc.text('Report Osservazione', 15, y)
  y += 12

  // Divider
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.5)
  doc.line(15, y, pageW - 15, y)
  y += 10

  // Anagrafica
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.accent)
  doc.text('Anagrafica', 15, y)
  y += 8

  doc.setFontSize(11)
  doc.setTextColor(...COLORS.white)
  doc.text(`${player.nome} ${player.cognome}`, 15, y)
  y += 6
  doc.setTextColor(...COLORS.gray)
  doc.setFontSize(10)
  const infoLine = [
    player.dataNascita ? `Nato: ${player.dataNascita}` : '',
    player.squadra ? `Squadra: ${player.squadra}` : '',
    player.ruolo || '',
    player.piedePreferito ? `Piede: ${player.piedePreferito}` : '',
  ].filter(Boolean).join('  |  ')
  doc.text(infoLine, 15, y)
  y += 8

  // Match info
  if (obs.squadraCasa || obs.competizione) {
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.gray)
    const matchLine = [
      obs.dataOsservazione ? `Data: ${obs.dataOsservazione}` : '',
      obs.squadraCasa && obs.squadraOspite ? `${obs.squadraCasa} vs ${obs.squadraOspite}` : '',
      obs.competizione || '',
    ].filter(Boolean).join('  |  ')
    doc.text(matchLine, 15, y)
    y += 10
  }

  // Radar chart
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.5)
  doc.line(15, y, pageW - 15, y)
  y += 8

  doc.setFontSize(14)
  doc.setTextColor(...COLORS.accent)
  doc.text('TIPSS', 15, y)
  y += 4

  drawRadar(doc, obs, pageW / 2, y + 40, 30)
  y += 85

  // TIPSS detail
  TIPSS_CONFIG.forEach(dim => {
    if (y > 250) { doc.addPage(); doc.setFillColor(...COLORS.bg); doc.rect(0, 0, 210, 297, 'F'); y = 20 }

    doc.setFontSize(12)
    doc.setTextColor(...COLORS.accent)
    doc.text(dim.label, 15, y)
    y += 6

    dim.items.forEach(item => {
      const voto = obs[`${dim.key}_${item.key}Voto`] || 0
      const nota = obs[`${dim.key}_${item.key}Nota`] || ''
      doc.setFontSize(10)
      doc.setTextColor(...COLORS.white)
      doc.text(`${item.label}: ${voto > 0 ? '⚽'.repeat(voto) : '-'}`, 20, y)
      if (nota) {
        doc.setTextColor(...COLORS.gray)
        doc.setFontSize(9)
        doc.text(nota, 25, y + 4)
        y += 4
      }
      y += 6
    })

    const commento = obs[`${dim.key}_commento`]
    if (commento) {
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.gray)
      const lines = doc.splitTextToSize(commento, pageW - 40)
      doc.text(lines, 20, y)
      y += lines.length * 4 + 2
    }
    y += 4
  })

  // Extra-campo
  if (obs.ambienteFamiliare || obs.notePersona) {
    if (y > 240) { doc.addPage(); doc.setFillColor(...COLORS.bg); doc.rect(0, 0, 210, 297, 'F'); y = 20 }
    doc.setFontSize(12)
    doc.setTextColor(...COLORS.accent)
    doc.text('Extra-campo', 15, y)
    y += 7
    if (obs.ambienteFamiliare) {
      doc.setFontSize(10)
      doc.setTextColor(...COLORS.gray)
      doc.text('Ambiente familiare:', 15, y); y += 5
      doc.setTextColor(...COLORS.white)
      const lines = doc.splitTextToSize(obs.ambienteFamiliare, pageW - 30)
      doc.text(lines, 20, y); y += lines.length * 5 + 2
    }
    if (obs.notePersona) {
      doc.setFontSize(10)
      doc.setTextColor(...COLORS.gray)
      doc.text('Note sulla persona:', 15, y); y += 5
      doc.setTextColor(...COLORS.white)
      const lines = doc.splitTextToSize(obs.notePersona, pageW - 30)
      doc.text(lines, 20, y); y += lines.length * 5 + 2
    }
  }

  // Note generali
  if (obs.noteGenerali) {
    if (y > 240) { doc.addPage(); doc.setFillColor(...COLORS.bg); doc.rect(0, 0, 210, 297, 'F'); y = 20 }
    doc.setFontSize(12)
    doc.setTextColor(...COLORS.accent)
    doc.text('Note Generali', 15, y)
    y += 7
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.white)
    const lines = doc.splitTextToSize(obs.noteGenerali, pageW - 30)
    doc.text(lines, 15, y)
    y += lines.length * 5 + 4
  }

  // Valutazione sintetica
  if (obs.valutazioneSintetica) {
    if (y > 260) { doc.addPage(); doc.setFillColor(...COLORS.bg); doc.rect(0, 0, 210, 297, 'F'); y = 20 }
    doc.setDrawColor(...COLORS.accent)
    doc.setLineWidth(0.5)
    doc.line(15, y, pageW - 15, y)
    y += 10
    const color = VALUTAZIONE_COLORS[obs.valutazioneSintetica] || COLORS.white
    doc.setFillColor(...color)
    doc.roundedRect(15, y - 5, pageW - 30, 16, 4, 4, 'F')
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(obs.valutazioneSintetica, pageW / 2, y + 5, { align: 'center' })
    y += 20
  }

  // Footer
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text('Osservazione a cura di Valerio - Jaleika Player Lab', pageW / 2, 287, { align: 'center' })

  // Save
  const fileName = `Jaleika_${player.cognome}_${player.nome}_${obs.dataOsservazione}.pdf`
  doc.save(fileName)
}
```

**Step 2: Wire export button in PlayerForm.jsx**

Add import at top of PlayerForm.jsx:
```js
import { exportPDF } from '../utils/pdfExport'
```

Replace the export button onClick:
```jsx
<button className="export-btn" onClick={() => exportPDF(playerData, currentObs)}>
  Esporta PDF
</button>
```

**Step 3: Verify**

Run: `npm run dev`
Create a player, fill in some TIPSS values, click "Esporta PDF". A PDF should download with dark background, radar chart, all data, and footer.

**Step 4: Commit**

```bash
git add src/utils/pdfExport.js src/pages/PlayerForm.jsx
git commit -m "feat: add PDF export with radar chart and Jaleika branding"
```

---

### Task 7: PWA Icons & Final Polish

**Files:**
- Create: `public/icon-192.png` (generate from logo)
- Create: `public/icon-512.png` (generate from logo)
- Modify: `index.html` (meta tags)
- Verify PWA install works

**Step 1: Update index.html with meta tags**

```html
<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#1b202e" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>Jaleika Scout</title>
    <link rel="icon" href="/Logotipo_arco.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 2: Generate PWA icons**

Use a simple canvas script or online tool to create 192x192 and 512x512 PNG icons from the SVG logo. As a fallback, use a solid #1b202e background with the yellow "J" letter.

**Step 3: Build and test**

Run:
```bash
npm run build
npm run preview
```

Expected: App loads from built files, service worker registers, "Install app" prompt appears in browser.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add PWA icons, meta tags, and final polish"
```

---

### Task 8: Deploy to Vercel (Free)

**Step 1: Install Vercel CLI**

Run: `npm i -g vercel`

**Step 2: Deploy**

Run: `vercel --prod`

Follow prompts (login, project name). The app will be deployed to a free .vercel.app URL.

**Step 3: Test on tablet**

Open the Vercel URL on the tablet browser, tap "Add to Home Screen" to install as PWA.

**Step 4: Commit deploy config if generated**

```bash
git add -A
git commit -m "chore: add Vercel deployment config"
```
