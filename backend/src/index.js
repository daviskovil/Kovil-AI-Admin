import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { apiLimiter } from './middleware/rateLimit.js'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import leadsRoutes from './routes/leads.js'
import applicationsRoutes from './routes/applications.js'
import contentRoutes from './routes/content.js'
import seoRoutes from './routes/agents/seo.js'
import aeoRoutes from './routes/agents/aeo.js'
import keywordsRoutes from './routes/agents/keywords.js'
import competitorsRoutes from './routes/agents/competitors.js'
import outreachRoutes from './routes/agents/outreach.js'
import gscRoutes from './routes/agents/gsc.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5174', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/leads', leadsRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/agents/seo', seoRoutes)
app.use('/api/agents/aeo', aeoRoutes)
app.use('/api/agents/keywords', keywordsRoutes)
app.use('/api/agents/competitors', competitorsRoutes)
app.use('/api/agents/outreach', outreachRoutes)
app.use('/api/agents/gsc', gscRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.listen(PORT, () => console.log(`Kovil Admin API running on port ${PORT}`))
