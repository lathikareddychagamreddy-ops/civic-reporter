const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query, get, run } = require('../db');

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `proof-${Date.now()}${path.extname(file.originalname) || '.jpg'}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const getDept = (cat) => cat === 'STREETLIGHT' ? 'ELECTRICITY' : cat === 'GARBAGE' ? 'SANITATION' : cat === 'WATER_LEAKAGE' ? 'WATER_BOARD' : 'PUBLIC_WORKS';

// GET all reports
router.get('/', async (req, res) => {
  try {
    const { category, status, department, search } = req.query;
    let sql = `SELECT r.*, d.name as department_name, d.sla_hours FROM reports r JOIN departments d ON r.department_code = d.code WHERE 1=1`;
    const params = [];

    if (category && category !== 'ALL') { sql += ` AND r.category = ?`; params.push(category); }
    if (status && status !== 'ALL') { sql += ` AND r.status = ?`; params.push(status); }
    if (department && department !== 'ALL') { sql += ` AND r.department_code = ?`; params.push(department); }
    if (search) { sql += ` AND (r.title LIKE ? OR r.address LIKE ? OR r.id LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    sql += ` ORDER BY r.created_at DESC`;
    const reports = await query(sql, params);
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single report with history
router.get('/:id', async (req, res) => {
  try {
    const report = await get(`SELECT r.*, d.name as department_name, d.sla_hours, d.contact_email FROM reports r JOIN departments d ON r.department_code = d.code WHERE r.id = ?`, [req.params.id]);
    if (!report) return res.status(404).json({ success: false, error: 'Not found' });

    const history = await query(`SELECT * FROM status_history WHERE report_id = ? ORDER BY created_at ASC`, [req.params.id]);
    res.json({ success: true, data: { ...report, history } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new report with photo
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { title, category, description, latitude, longitude, address, landmark, severity, citizen_name, citizen_phone } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : (req.body.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80');
    const ticketId = `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const dept = getDept(category);

    await run(`INSERT INTO reports (id, title, category, description, photo_url, latitude, longitude, address, landmark, severity, status, department_code, citizen_name, citizen_phone, upvotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REPORTED', ?, ?, ?, 1)`,
      [ticketId, title, category, description, photo_url, parseFloat(latitude), parseFloat(longitude), address, landmark || '', severity || 'MEDIUM', dept, citizen_name || 'Citizen', citizen_phone || '']);

    await run(`INSERT INTO status_history (report_id, status, notes, updated_by) VALUES (?, 'REPORTED', 'Ticket submitted with photo proof.', 'Citizen')`, [ticketId]);

    const created = await get(`SELECT * FROM reports WHERE id = ?`, [ticketId]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH status
router.patch('/:id/status', upload.single('resolution_photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officer_notes, updated_by } = req.body;
    const existing = await get(`SELECT * FROM reports WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

    let resolution_photo_url = existing.resolution_photo_url;
    if (req.file) resolution_photo_url = `/uploads/${req.file.filename}`;

    await run(`UPDATE reports SET status = ?, officer_notes = ?, resolution_photo_url = ?, updated_at = datetime('now') WHERE id = ?`,
      [status || existing.status, officer_notes || existing.officer_notes, resolution_photo_url, id]);

    await run(`INSERT INTO status_history (report_id, status, notes, photo_url, updated_by) VALUES (?, ?, ?, ?, ?)`,
      [id, status || existing.status, officer_notes || 'Status updated', resolution_photo_url, updated_by || 'Officer']);

    const updated = await get(`SELECT * FROM reports WHERE id = ?`, [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST upvote
router.post('/:id/upvote', async (req, res) => {
  try {
    await run(`UPDATE reports SET upvotes = upvotes + 1 WHERE id = ?`, [req.params.id]);
    const report = await get(`SELECT id, upvotes FROM reports WHERE id = ?`, [req.params.id]);
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;