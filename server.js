const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database(path.join(__dirname, "g8bakery.sqlite"));
app.use(cors());
app.use(express.json({ limit: "3mb" }));

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    festival TEXT NOT NULL,
    pickup_date TEXT NOT NULL,
    pickup_time TEXT NOT NULL,
    cake_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmed',
    created_at TEXT NOT NULL
  )
`);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "G8 Bakery API" }));
app.get("/api/bookings", (_req, res) => {
  const rows = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
  res.json(rows.map(row => ({
    id: row.id, name: row.name, festival: row.festival,
    date: row.pickup_date, time: row.pickup_time,
    cake: JSON.parse(row.cake_json), status: row.status, createdAt: row.created_at
  })));
});
app.post("/api/bookings", (req, res) => {
  const { id, name, festival, date, time, cake } = req.body || {};
  if (!name || !festival || !date || !time || !cake) {
    return res.status(400).json({ error: "Missing booking fields." });
  }
  const count = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE pickup_date=? AND status!='Cancelled'").get(date).count;
  if (count >= 25) return res.status(409).json({ error: "This date has reached its 25-cake capacity." });
  const bookingId = String(id || Date.now());
  db.prepare(`INSERT INTO bookings(id,name,festival,pickup_date,pickup_time,cake_json,status,created_at)
    VALUES(?,?,?,?,?,?,?,?)`).run(bookingId, name, festival, date, time, JSON.stringify(cake), "Confirmed", new Date().toISOString());
  res.status(201).json({ id: bookingId, message: "Booking saved." });
});
app.patch("/api/bookings/:id/status", (req, res) => {
  const allowed = ["Confirmed", "Accepted", "Completed", "Cancelled"];
  const { status } = req.body || {};
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status." });
  const result = db.prepare("UPDATE bookings SET status=? WHERE id=?").run(status, String(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Booking not found." });
  res.json({ ok: true });
});
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "FSD.html"));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`G8 Bakery API running at http://localhost:${PORT}`));
