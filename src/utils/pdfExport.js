import jsPDF from 'jspdf'

function loadLogoAsBase64() {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = '/Logotipo_arco.svg'
  })
}

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

const TIPSS_GIOCATORE = [
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
    key: 'personalita', label: 'Personalità',
    items: [
      { key: 'reazione', label: 'Reazione errori' },
      { key: 'spirito', label: 'Spirito competitivo' },
      { key: 'atteggiamento', label: 'Atteggiamento' },
    ]
  },
  {
    key: 'velocita', label: 'Velocità',
    items: [
      { key: 'esecuzione', label: 'Rapidità esecuzione' },
      { key: 'pura', label: 'Velocità pura' },
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

const TIPSS_PORTIERE = [
  {
    key: 'tecnica', label: 'Tecnica',
    items: [
      { key: 'presa', label: 'Presa / bloccaggio' },
      { key: 'tuffo', label: 'Tuffo / parata' },
      { key: 'uscite', label: 'Uscita alta' },
      { key: 'piedi', label: 'Gioco con i piedi' },
      { key: 'rilancio', label: 'Rilancio mani' },
    ]
  },
  {
    key: 'intelligenza', label: 'Intelligenza',
    items: [
      { key: 'posizionamento', label: 'Posizionamento' },
      { key: 'lettura', label: 'Lettura gioco' },
      { key: 'area', label: 'Gestione area' },
      { key: 'organizzazione', label: 'Org. difensiva' },
    ]
  },
  {
    key: 'personalita', label: 'Personalità',
    items: [
      { key: 'reazione', label: 'Reazione errori' },
      { key: 'coraggio', label: 'Coraggio' },
      { key: 'leadership', label: 'Leadership' },
      { key: 'concentrazione', label: 'Concentrazione' },
    ]
  },
  {
    key: 'velocita', label: 'Reattività',
    items: [
      { key: 'riflessi', label: 'Riflessi' },
      { key: 'esplosivita', label: 'Esplosività' },
      { key: 'laterali', label: 'Movimenti laterali' },
    ]
  },
  {
    key: 'struttura', label: 'Struttura',
    items: [
      { key: 'coordinazione', label: 'Coordinazione' },
      { key: 'flessibilita', label: 'Flessibilità' },
      { key: 'fisica', label: 'Struttura fisica' },
    ]
  },
]

function getTIPSS(ruolo) {
  return ruolo === 'Portiere' ? TIPSS_PORTIERE : TIPSS_GIOCATORE
}

function getDimAvg(obs, dimKey, items) {
  const votes = items.map(i => obs[`${dimKey}_${i.key}Voto`] || 0).filter(v => v > 0)
  if (votes.length === 0) return 0
  return votes.reduce((a, b) => a + b, 0) / votes.length
}

function drawRadar(doc, obs, x, y, radius, tipssConfig) {
  const dims = tipssConfig.map(d => ({
    label: d.label,
    value: getDimAvg(obs, d.key, d.items)
  }))

  const n = dims.length
  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  // Draw grid pentagons
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
    // Level number
    if (level <= 5) {
      doc.setFontSize(7)
      doc.setTextColor(...COLORS.muted)
      doc.text(String(level), x + 2, y - r + 3)
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

    const lx = x + (radius + 14) * Math.cos(angle)
    const ly = y + (radius + 14) * Math.sin(angle)
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.white)
    doc.text(dims[i].label, lx, ly, { align: 'center' })
  }

  // Draw data polygon outline
  const dataPoints = dims.map((d, i) => {
    const r = (d.value / 5) * radius
    const angle = startAngle + i * angleStep
    return [x + r * Math.cos(angle), y + r * Math.sin(angle)]
  })

  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(1.5)
  for (let i = 0; i < dataPoints.length; i++) {
    const next = (i + 1) % dataPoints.length
    doc.line(dataPoints[i][0], dataPoints[i][1], dataPoints[next][0], dataPoints[next][1])
  }

  // Draw dots and values
  dataPoints.forEach((p, i) => {
    doc.setFillColor(...COLORS.accent)
    doc.circle(p[0], p[1], 2, 'F')
    // Show value next to dot
    const val = dims[i].value
    if (val > 0) {
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.accent)
      doc.text(val.toFixed(1), p[0] + 3, p[1] - 2)
    }
  })
}

function drawBalls(doc, count, x, y) {
  const ballSize = 3
  const gap = 7
  for (let i = 0; i < 5; i++) {
    if (i < count) {
      doc.setFillColor(...COLORS.accent)
      doc.circle(x + i * gap, y, ballSize / 2, 'F')
    } else {
      doc.setDrawColor(...COLORS.muted)
      doc.setLineWidth(0.3)
      doc.circle(x + i * gap, y, ballSize / 2, 'S')
    }
  }
}

export async function exportPDF(player, obs) {
  const TIPSS_CONFIG = getTIPSS(player.ruolo)
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  let y = 15

  // Background
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, 210, 297, 'F')

  // Logo
  const logoData = await loadLogoAsBase64()
  if (logoData) {
    doc.addImage(logoData, 'PNG', 15, y - 5, 40, 20)
  }

  // Header
  doc.setTextColor(...COLORS.accent)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('JALEIKA PLAYER LAB', 60, y + 4)
  y += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text('Report Osservazione', 60, y)
  y += 12

  // Divider
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.5)
  doc.line(15, y, pageW - 15, y)
  y += 10

  // Anagrafica
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.accent)
  doc.text('Anagrafica', 15, y)
  y += 8

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.white)
  doc.text(`${player.nome} ${player.cognome}`, 15, y)
  y += 7
  doc.setFont('helvetica', 'normal')
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

  // Divider
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.5)
  doc.line(15, y, pageW - 15, y)
  y += 8

  // Radar title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.accent)
  doc.text('TIPSS', 15, y)
  y += 4

  // Radar chart
  drawRadar(doc, obs, pageW / 2, y + 40, 30, TIPSS_CONFIG)
  y += 88

  // TIPSS detail
  TIPSS_CONFIG.forEach(dim => {
    if (y > 250) {
      doc.addPage()
      doc.setFillColor(...COLORS.bg)
      doc.rect(0, 0, 210, 297, 'F')
      y = 20
    }

    const avg = getDimAvg(obs, dim.key, dim.items)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.accent)
    doc.text(`${dim.label}`, 15, y)
    if (avg > 0) {
      doc.setFontSize(10)
      doc.setTextColor(...COLORS.accentDark)
      doc.text(`  (media: ${avg.toFixed(1)})`, 15 + doc.getTextWidth(dim.label) + 2, y)
    }
    y += 7

    dim.items.forEach(item => {
      const voto = obs[`${dim.key}_${item.key}Voto`] || 0
      const nota = obs[`${dim.key}_${item.key}Nota`] || ''
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.white)
      doc.text(`${item.label}:`, 20, y)
      drawBalls(doc, voto, 75, y - 1)
      if (nota) {
        doc.setTextColor(...COLORS.gray)
        doc.setFontSize(9)
        doc.text(nota, 115, y)
      }
      y += 6
    })

    const commento = obs[`${dim.key}_commento`]
    if (commento) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...COLORS.gray)
      const lines = doc.splitTextToSize(commento, pageW - 40)
      doc.text(lines, 20, y)
      y += lines.length * 4 + 2
    }
    y += 5
  })

  // Extra-campo
  if (obs.ambienteFamiliare || obs.notePersona) {
    if (y > 240) {
      doc.addPage()
      doc.setFillColor(...COLORS.bg)
      doc.rect(0, 0, 210, 297, 'F')
      y = 20
    }
    doc.setDrawColor(...COLORS.accent)
    doc.setLineWidth(0.3)
    doc.line(15, y, pageW - 15, y)
    y += 8
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.accent)
    doc.text('Extra-campo', 15, y)
    y += 8
    if (obs.ambienteFamiliare) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.gray)
      doc.text('Ambiente familiare:', 15, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.white)
      const lines = doc.splitTextToSize(obs.ambienteFamiliare, pageW - 30)
      doc.text(lines, 20, y)
      y += lines.length * 5 + 3
    }
    if (obs.notePersona) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.gray)
      doc.text('Note sulla persona:', 15, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.white)
      const lines = doc.splitTextToSize(obs.notePersona, pageW - 30)
      doc.text(lines, 20, y)
      y += lines.length * 5 + 3
    }
  }

  // Note generali
  if (obs.noteGenerali) {
    if (y > 240) {
      doc.addPage()
      doc.setFillColor(...COLORS.bg)
      doc.rect(0, 0, 210, 297, 'F')
      y = 20
    }
    doc.setDrawColor(...COLORS.accent)
    doc.setLineWidth(0.3)
    doc.line(15, y, pageW - 15, y)
    y += 8
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.accent)
    doc.text('Note Generali', 15, y)
    y += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.white)
    const lines = doc.splitTextToSize(obs.noteGenerali, pageW - 30)
    doc.text(lines, 15, y)
    y += lines.length * 5 + 5
  }

  // Valutazione sintetica
  if (obs.valutazioneSintetica) {
    if (y > 260) {
      doc.addPage()
      doc.setFillColor(...COLORS.bg)
      doc.rect(0, 0, 210, 297, 'F')
      y = 20
    }
    doc.setDrawColor(...COLORS.accent)
    doc.setLineWidth(0.5)
    doc.line(15, y, pageW - 15, y)
    y += 10
    const color = VALUTAZIONE_COLORS[obs.valutazioneSintetica] || COLORS.white
    doc.setFillColor(...color)
    doc.roundedRect(15, y - 5, pageW - 30, 16, 4, 4, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(obs.valutazioneSintetica, pageW / 2, y + 5, { align: 'center' })
    y += 20
  }

  // Footer
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.muted)
  doc.text('Osservazione a cura di Valerio - Jaleika Player Lab', pageW / 2, 287, { align: 'center' })

  // Save
  const fileName = `Jaleika_${player.cognome || 'giocatore'}_${player.nome || ''}_${obs.dataOsservazione || 'report'}.pdf`
  doc.save(fileName)
}
