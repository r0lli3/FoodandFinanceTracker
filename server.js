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
    targetsTableReady = setUpTargetHistory()
      .catch((e) => { targetsTableReady = null; throw e; });
  }
  return targetsTableReady;
}

// target_history is append-only: one row per change, keyed by the date the
// targets took effect. The active targets are the newest row; a given day's
// targets are the newest row on or before that day. The old single-row
// `targets` table is left untouched as a fallback — nothing writes to it.
async function setUpTargetHistory() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS target_history (
      effective_from DATE PRIMARY KEY,
      protein NUMERIC(6,1) NOT NULL,
      carbs   NUMERIC(6,1) NOT NULL,
      fat     NUMERIC(6,1) NOT NULL,
      fiber   NUMERIC(6,1) NOT NULL,
      cals    NUMERIC(6,0) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await backfillFromLegacyTargets(sql);
}

// One-time seed of target_history from the legacy `targets` row. The date the
// old targets were actually set was never recorded, so they're backdated to the
// earliest logged day — the only choice that leaves no historical day without
// targets. Runs only while target_history is empty, so it can't double-apply.
async function backfillFromLegacyTargets(sql) {
  const seeded = await sql`SELECT 1 FROM target_history LIMIT 1`;
  if (seeded.length) return;

  const [{ present }] = await sql`
    SELECT to_regclass('public.targets') IS NOT NULL AS present
  `;
  if (!present) return;

  const legacy = await sql`SELECT protein, carbs, fat, fiber, cals FROM targets WHERE id = 1`;
  if (!legacy.length) return;

  // LEAST skips NULLs, so this works when only one of the two tables has rows.
  const [{ earliest }] = await sql`
    SELECT LEAST(
      (SELECT MIN(date) FROM logs),
      (SELECT MIN(date) FROM weight)
    ) AS earliest
  `;
  const from = earliest || new Date().toISOString().slice(0, 10);
  const t = legacy[0];
  await sql`
    INSERT INTO target_history (effective_from, protein, carbs, fat, fiber, cals)
    VALUES (${from}, ${t.protein}, ${t.carbs}, ${t.fat}, ${t.fiber}, ${t.cals})
    ON CONFLICT (effective_from) DO NOTHING
  `;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TARGET_FIELDS = ['protein', 'carbs', 'fat', 'fiber', 'cals'];
const rowToTargets = (r) => r ? {
  protein: parseFloat(r.protein),
  carbs:   parseFloat(r.carbs),
  fat:     parseFloat(r.fat),
  fiber:   parseFloat(r.fiber),
  cals:    parseFloat(r.cals),
  effective_from: r.effective_from,
  created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
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

// GET /api/targets            — the currently active targets (null if never set)
// GET /api/targets?date=D     — the targets that were in force on day D
app.get('/api/targets', async (req, res) => {
  const { date } = req.query;
  if (date && !ISO_DATE.test(date)) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  }
  try {
    await ensureTargetsTable();
    const sql = getDb();
    const rows = date
      ? await sql`
          SELECT to_char(effective_from, 'YYYY-MM-DD') AS effective_from,
                 protein, carbs, fat, fiber, cals, created_at
          FROM target_history
          WHERE effective_from <= ${date}
          ORDER BY effective_from DESC LIMIT 1
        `
      : await sql`
          SELECT to_char(effective_from, 'YYYY-MM-DD') AS effective_from,
                 protein, carbs, fat, fiber, cals, created_at
          FROM target_history
          ORDER BY effective_from DESC LIMIT 1
        `;
    res.json(rowToTargets(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/targets/history — every change, newest first
app.get('/api/targets/history', async (req, res) => {
  try {
    await ensureTargetsTable();
    const sql = getDb();
    const rows = await sql`
      SELECT to_char(effective_from, 'YYYY-MM-DD') AS effective_from,
             protein, carbs, fat, fiber, cals, created_at
      FROM target_history ORDER BY effective_from DESC
    `;
    res.json(rows.map(rowToTargets));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/targets  body: { protein, carbs, fat, fiber, cals, effective_from? }
// Appends a new history row. effective_from defaults to the server's today,
// but the client sends its own local date — same as it does for logs.
// Re-saving on a day that already has a row replaces it rather than stacking.
app.post('/api/targets', async (req, res) => {
  const body = req.body || {};
  for (const k of TARGET_FIELDS) {
    const v = body[k];
    if (typeof v !== 'number' || !isFinite(v) || v < 0) {
      return res.status(400).json({ error: `${k} must be a non-negative number` });
    }
  }
  const from = body.effective_from ?? null;
  if (from !== null && !ISO_DATE.test(from)) {
    return res.status(400).json({ error: 'effective_from must be YYYY-MM-DD' });
  }
  const { protein, carbs, fat, fiber, cals } = body;
  try {
    await ensureTargetsTable();
    const sql = getDb();
    const rows = await sql`
      INSERT INTO target_history (effective_from, protein, carbs, fat, fiber, cals)
      VALUES (COALESCE(${from}::date, CURRENT_DATE), ${protein}, ${carbs}, ${fat}, ${fiber}, ${cals})
      ON CONFLICT (effective_from) DO UPDATE SET
        protein = EXCLUDED.protein, carbs = EXCLUDED.carbs,
        fat = EXCLUDED.fat, fiber = EXCLUDED.fiber, cals = EXCLUDED.cals,
        created_at = now()
      RETURNING to_char(effective_from, 'YYYY-MM-DD') AS effective_from,
                protein, carbs, fat, fiber, cals, created_at
    `;
    res.json({ ok: true, ...rowToTargets(rows[0]) });
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
    const [logs, weights, history] = await Promise.all([
      sql`SELECT date, meal_name, count FROM logs WHERE count > 0 ORDER BY date DESC`,
      sql`SELECT date, kg FROM weight ORDER BY date DESC`,
      sql`
        SELECT to_char(effective_from, 'YYYY-MM-DD') AS effective_from,
               protein, carbs, fat, fiber, cals, created_at
        FROM target_history ORDER BY effective_from DESC
      `
    ]);
    res.json({
      logs,
      weights: weights.map(r => ({ date: r.date, kg: parseFloat(r.kg) })),
      // Newest row is the active one — kept as `targets` so the client's boot
      // path is unchanged; `targetHistory` is what scores past days.
      targets: rowToTargets(history[0]),
      targetHistory: history.map(rowToTargets),
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
