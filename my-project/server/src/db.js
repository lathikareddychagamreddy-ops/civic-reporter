const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../civic_pulse.db');
const db = new sqlite3.Database(dbPath);

const query = (sql, params = []) => new Promise((res, rej) => {
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows));
});

const get = (sql, params = []) => new Promise((res, rej) => {
  db.get(sql, params, (err, row) => err ? rej(err) : res(row));
});

const run = (sql, params = []) => new Promise((res, rej) => {
  db.run(sql, params, function (err) {
    err ? rej(err) : res({ id: this.lastID, changes: this.changes });
  });
});

const initDB = async () => {
  await run(`PRAGMA foreign_keys = ON;`);

  await run(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      sla_hours INTEGER DEFAULT 48,
      contact_email TEXT
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      photo_url TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT NOT NULL,
      landmark TEXT,
      severity TEXT NOT NULL DEFAULT 'MEDIUM',
      status TEXT NOT NULL DEFAULT 'REPORTED',
      department_code TEXT NOT NULL,
      citizen_name TEXT DEFAULT 'Citizen',
      citizen_phone TEXT,
      upvotes INTEGER DEFAULT 1,
      resolution_photo_url TEXT,
      officer_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      photo_url TEXT,
      updated_by TEXT DEFAULT 'Municipal Desk',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const deptsCount = await get(`SELECT COUNT(*) as c FROM departments`);
  if (deptsCount.c === 0) {
    await run(`INSERT INTO departments (code, name, sla_hours, contact_email) VALUES 
      ('ELECTRICITY', 'City Electricity & Streetlight Board', 24, 'electricity@city.org'),
      ('SANITATION', 'Solid Waste & Sanitation Board', 12, 'sanitation@city.org'),
      ('WATER_BOARD', 'Water Supply & Sewerage Board', 18, 'water@city.org'),
      ('PUBLIC_WORKS', 'Public Works Department (PWD)', 72, 'pwd@city.org')`);
  }

  const reportsCount = await get(`SELECT COUNT(*) as c FROM reports`);
  if (reportsCount.c === 0) {
    const seed = [
      ['CP-2026-1041', 'Flickering & Dead Streetlights on 80ft Road', 'STREETLIGHT', 'Two streetlights completely dark near bus stop.', 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80', 12.9716, 77.5946, '80ft Road, 4th Block', 'Near Metro Pillar 42', 'HIGH', 'IN_PROGRESS', 'ELECTRICITY', 'Aditya Sharma', 14, 'Cherry-picker truck dispatched to change 90W LED.'],
      ['CP-2026-1042', 'Severe Garbage Dump Overflowing onto Sidewalk', 'GARBAGE', 'Community container not cleared for 4 days. Waste spilled on road.', 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80', 12.9352, 77.6245, '5th Cross, 6th Block', 'Opposite Park Gate', 'CRITICAL', 'REPORTED', 'SANITATION', 'Priya N.', 28, null],
      ['CP-2026-1043', 'Clean Drinking Water Pipe Burst', 'WATER_LEAKAGE', 'Potable water line cracked. Water flooding street.', 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80', 12.9820, 77.6432, '100ft Road Junction', 'Near Health Center', 'CRITICAL', 'UNDER_REVIEW', 'WATER_BOARD', 'Rajesh K.', 35, 'Valve isolation in progress.']
    ];

    for (const r of seed) {
      await run(`INSERT INTO reports (id, title, category, description, photo_url, latitude, longitude, address, landmark, severity, status, department_code, citizen_name, upvotes, officer_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, r);
      await run(`INSERT INTO status_history (report_id, status, notes, updated_by) VALUES (?, ?, 'Ticket registered via app.', 'Citizen')`, [r[0], r[10]]);
    }
  }
};

module.exports = { db, query, get, run, initDB };