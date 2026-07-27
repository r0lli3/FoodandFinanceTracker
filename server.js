const express = require('express');
const { neon } = require('@neondatabase/serverless');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  return neon(process.env.DATABASE_URL);
}

async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS logs (
      date TEXT NOT NULL,
      meal_name TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (date, meal_name)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS weight (
      date TEXT PRIMARY KEY,
      kg NUMERIC(5,1) NOT NULL
    )
  `;
  await ensureTargetsTable();
}

// initDb only runs under `node server.js`; on Vercel this module is imported,
// so require.main !== module and it never fires. The targets table therefore
// creates itself lazily, memoised per instance.
let targetsTableReady = null;
function ensureTargetsTable() {
  if (!targetsTableReady) {
    const sql = getDb();
    targetsTableReady = sql`
      CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY,
        protein NUMERIC(6,1) NOT NULL,
        carbs   NUMERIC(6,1) NOT NULL,
        fat     NUMERIC(6,1) NOT NULL,
        fiber   NUMERIC(6,1) NOT NULL,
        cals    NUMERIC(6,0) NOT NULL
      )
    `.catch((e) => { targetsTableReady = null; throw e; });
  }
  return targetsTableReady;
}

const TARGET_FIELDS = ['protein', 'carbs', 'fat', 'fiber', 'cals'];
const rowToTargets = (r) => r ? {
  protein: parseFloat(r.protein),
  carbs:   parseFloat(r.carbs),
  fat:     parseFloat(r.fat),
  fiber:   parseFloat(r.fiber),
  cals:    parseFloat(r.cals),
} : null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/log?date=YYYY-MM-DD
app.get('/api/log', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const sql = getDb();
    const rows = await sql`SELECT meal_name, count FROM logs WHERE date = ${date}`;
    const result = {};
    for (const row of rows) result[row.meal_name] = row.count;
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/log  body: { date, meal_name, count }
app.post('/api/log', async (req, res) => {
  const { date, meal_name, count } = req.body;
  if (!date || !meal_name || count == null) return res.status(400).json({ error: 'date, meal_name, count required' });
  try {
    const sql = getDb();
    await sql`
      INSERT INTO logs (date, meal_name, count) VALUES (${date}, ${meal_name}, ${count})
      ON CONFLICT (date, meal_name) DO UPDATE SET count = EXCLUDED.count
    `;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/weight?date=YYYY-MM-DD
app.get('/api/weight', async (req, res) => {
  const { date } = req.query;
  try {
    const sql = getDb();
    if (date) {
      const rows = await sql`SELECT kg FROM weight WHERE date = ${date}`;
      res.json({ kg: rows.length ? parseFloat(rows[0].kg) : null });
    } else {
      const rows = await sql`SELECT date, kg FROM weight ORDER BY date DESC`;
      res.json(rows.map(r => ({ date: r.date, kg: parseFloat(r.kg) })));
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/weight  body: { date, kg }
app.post('/api/weight', async (req, res) => {
  const { date, kg } = req.body;
  if (!date || kg == null) return res.status(400).json({ error: 'date and kg required' });
  const val = parseFloat(parseFloat(kg).toFixed(1));
  if (isNaN(val)) return res.status(400).json({ error: 'invalid kg value' });
  try {
    const sql = getDb();
    await sql`
      INSERT INTO weight (date, kg) VALUES (${date}, ${val})
      ON CONFLICT (date) DO UPDATE SET kg = EXCLUDED.kg
    `;
    res.json({ ok: true, date, kg: val });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/log  body: { date }
app.delete('/api/log', async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const sql = getDb();
    await sql`DELETE FROM logs WHERE date = ${date}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/weight  body: { date }
app.delete('/api/weight', async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const sql = getDb();
    await sql`DELETE FROM weight WHERE date = ${date}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/targets — the single active target row (null if never set)
app.get('/api/targets', async (req, res) => {
  try {
    await ensureTargetsTable();
    const sql = getDb();
    const rows = await sql`SELECT * FROM targets WHERE id = 1`;
    res.json(rowToTargets(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/targets  body: { protein, carbs, fat, fiber, cals }
app.post('/api/targets', async (req, res) => {
  const body = req.body || {};
  for (const k of TARGET_FIELDS) {
    const v = body[k];
    if (typeof v !== 'number' || !isFinite(v) || v < 0) {
      return res.status(400).json({ error: `${k} must be a non-negative number` });
    }
  }
  const { protein, carbs, fat, fiber, cals } = body;
  try {
    await ensureTargetsTable();
    const sql = getDb();
    await sql`
      INSERT INTO targets (id, protein, carbs, fat, fiber, cals)
      VALUES (1, ${protein}, ${carbs}, ${fat}, ${fiber}, ${cals})
      ON CONFLICT (id) DO UPDATE SET
        protein = EXCLUDED.protein, carbs = EXCLUDED.carbs,
        fat = EXCLUDED.fat, fiber = EXCLUDED.fiber, cals = EXCLUDED.cals
    `;
    res.json({ ok: true, protein, carbs, fat, fiber, cals });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/history — all days that have been logged (food + weight)
app.get('/api/history', async (req, res) => {
  try {
    const sql = getDb();
    const rows = await sql`SELECT DISTINCT date FROM logs ORDER BY date DESC`;
    res.json(rows.map(r => r.date));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/history/summary — all logs + weights in one query
app.get('/api/history/summary', async (req, res) => {
  try {
    await ensureTargetsTable();
    const sql = getDb();
    const [logs, weights, targets] = await Promise.all([
      sql`SELECT date, meal_name, count FROM logs WHERE count > 0 ORDER BY date DESC`,
      sql`SELECT date, kg FROM weight ORDER BY date DESC`,
      sql`SELECT * FROM targets WHERE id = 1`
    ]);
    res.json({
      logs,
      weights: weights.map(r => ({ date: r.date, kg: parseFloat(r.kg) })),
      targets: rowToTargets(targets[0]),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

if (require.main === module) {
  initDb()
    .then(() => app.listen(PORT, () => console.log(`Food and Finance Tracker running at http://localhost:${PORT}`)))
    .catch(console.error);
}

module.exports = app;
