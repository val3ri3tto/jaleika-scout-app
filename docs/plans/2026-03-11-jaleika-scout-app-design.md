# Jaleika Scout App - Design Document

## Obiettivo
App per tablet (PWA) per osservazione calcistica di giovani calciatori (8-13 anni).
Uso sul campo durante le partite, singolo utente, dati locali, export PDF.

## Utente
Valerio - osservatore per Jaleika Player Lab.
Osserva ragazzi nelle categorie Pulcini (8-10), Esordienti (10-12), Giovanissimi (12-13).

## Stack tecnologico
- **Framework**: React + Vite
- **Tipo**: PWA (Progressive Web App) - installabile su tablet, funziona offline
- **Storage**: IndexedDB (tramite libreria idb o Dexie.js) - tutto locale
- **PDF**: jsPDF + grafico radar per TIPSS
- **Hosting**: Vercel o GitHub Pages (gratuito)
- **Costo**: 0

## Schermate

### 1. Home - Lista Giocatori
- Lista di tutti i giocatori osservati
- Ricerca per nome
- Filtri: anno di nascita, ruolo, squadra, data osservazione
- Card giocatore: nome, anno, ruolo, squadra, data ultima osservazione, valutazione sintetica (badge colorato)
- Bottone "+ Nuova Osservazione" prominente

### 2. Scheda Giocatore (creazione e modifica)
Divisa in sezioni scrollabili, salvataggio automatico ad ogni modifica.
Il giocatore puo avere multiple osservazioni (date diverse).

#### Anagrafica
- Nome e cognome
- Data di nascita
- Squadra
- Ruolo (Portiere, Difensore, Centrocampista, Attaccante)
- Piede preferito (Destro, Sinistro, Entrambi)
- Foto (opzionale, da fotocamera tablet)

#### Info Partita
- Data osservazione
- Squadre in campo (casa vs ospite)
- Competizione / torneo

#### TIPSS Jaleika (valutazione snella)
Ogni sotto-voce: voto 1-5 (palloni tappabili) + nota opzionale.
Ogni dimensione: commento generale libero.

**T - Tecnica**
- Controllo palla / primo tocco
- Passaggio
- Dribbling / 1v1
- Tiro

**I - Intelligenza**
- Lettura del gioco
- Posizionamento
- Decisioni (quando passare/dribblare/tirare)

**P - Personalita**
- Reazione agli errori
- Spirito competitivo
- Atteggiamento con compagni e avversari

**S - Velocita**
- Rapidita di esecuzione (tecnica + pensiero)
- Velocita pura

**S - Struttura**
- Coordinazione motoria
- Resistenza / tenuta nella partita

#### Extra-campo
- Ambiente familiare (testo libero)
- Note sulla persona (testo libero)

#### Note generali
- Campo libero per momenti chiave, impressioni, potenziale percepito

#### Valutazione sintetica
4 opzioni mutualmente esclusive:
- **Da rivedere** - serve un'altra osservazione
- **Interessante** - potenziale ma tecnica da migliorare
- **Alto potenziale** - ottima tecnica ma testa da indirizzare
- **Top** - pronto per allenamenti top

### 3. Export PDF
- Bottone "Esporta PDF" dal profilo giocatore
- Header: logo Jaleika + "Report Osservazione"
- Anagrafica giocatore
- Info partita
- Grafico radar TIPSS (pentagono con i 5 punteggi medi)
- Dettaglio dimensioni con voti e note
- Extra-campo
- Note generali
- Valutazione sintetica evidenziata
- Footer: "Osservazione a cura di Valerio - Jaleika Player Lab"

## Design visivo
- **Dark mode** di default (meno riflesso all'aperto)
- Colori brand Jaleika:
  - Blu scuro: #1b202e (sfondo)
  - Giallo: #f3e606 (accenti, bottoni, CTA)
  - Oro scuro: #d1b00d (dettagli secondari)
  - Bianco: #fff (testo)
- Font grandi e leggibili per tablet
- Bottoni larghi e tappabili
- Layout ottimizzato per tablet (possibili layout a due colonne)
- Salvataggio automatico

## Asset
- Logo SVG: `public/Logotipo_arco.svg`
