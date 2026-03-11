import Dexie from 'dexie'

export const db = new Dexie('JaleikaScoutDB')

db.version(1).stores({
  players: '++id, cognome, squadra, ruolo, dataNascita',
  observations: '++id, playerId, dataOsservazione, valutazioneSintetica'
})
