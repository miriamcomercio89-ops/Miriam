import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const PORT = process.env.PORT || 8787
const DIST = path.join(__dirname, '..', 'dist')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'Orbis Hotels Group Save API' })
})

app.post('/api/saves', (req, res) => {
  const id = randomUUID().slice(0, 8)
  const file = path.join(DATA_DIR, `${id}.json`)
  fs.writeFileSync(file, JSON.stringify(req.body))
  res.status(201).json({ id })
})

app.put('/api/saves/:id', (req, res) => {
  const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '')
  const file = path.join(DATA_DIR, `${id}.json`)
  fs.writeFileSync(file, JSON.stringify(req.body))
  res.json({ id, ok: true })
})

app.get('/api/saves/:id', (req, res) => {
  const id = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '')
  const file = path.join(DATA_DIR, `${id}.json`)
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'not found' })
  res.type('json').send(fs.readFileSync(file, 'utf8'))
})

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Orbis save API on http://localhost:${PORT}`)
})
