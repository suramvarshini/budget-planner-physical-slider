require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express   = require('express');
const cors      = require('cors');
const config    = require('./config');
const { apiLimiter }    = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const healthRouter    = require('./routes/health');
const dashboardRouter = require('./routes/dashboard');
const budgetRouter    = require('./routes/budget');
const expensesRouter  = require('./routes/expenses');
const deviceRouter    = require('./routes/device');
const historyRouter   = require('./routes/history');
const reportsRouter   = require('./routes/reports');
const productsRouter  = require('./routes/products');

// Initialize DB on startup
require('./db/database').getDB();

const app = express();

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

app.use('/api/health',    healthRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/budget',    budgetRouter);
app.use('/api/expenses',  expensesRouter);
app.use('/api/device',    deviceRouter);
app.use('/api/history',   historyRouter);
app.use('/api/reports',   reportsRouter);
app.use('/api/products',  productsRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = config.PORT;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║  Budget Planner API  •  SIMULATION MODE       ║
║  http://localhost:${PORT}/api/health             ║
╚═══════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
