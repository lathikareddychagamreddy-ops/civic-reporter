const express = require('express');
const router = express.Router();
const { query, get } = require('../db');

router.get('/stats', async (req, res) => {
  try {
    const total = (await get(`SELECT COUNT(*) as c FROM reports`)).c || 0;
    const resolved = (await get(`SELECT COUNT(*) as c FROM reports WHERE status = 'RESOLVED'`)).c || 0;
    const inProg = (await get(`SELECT COUNT(*) as c FROM reports WHERE status = 'IN_PROGRESS'`)).c || 0;
    const pending = (await get(`SELECT COUNT(*) as c FROM reports WHERE status = 'REPORTED'`)).c || 0;
    const critical = (await get(`SELECT COUNT(*) as c FROM reports WHERE severity = 'CRITICAL' AND status != 'RESOLVED'`)).c || 0;
    const upvotes = (await get(`SELECT SUM(upvotes) as c FROM reports`)).c || 0;

    const categoryBreakdown = await query(`SELECT category, COUNT(*) as count FROM reports GROUP BY category`);
    const departmentBreakdown = await query(`SELECT d.name, d.code, COUNT(r.id) as total, SUM(CASE WHEN r.status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved FROM departments d LEFT JOIN reports r ON d.code = r.department_code GROUP BY d.code`);

    res.json({
      success: true,
      data: {
        totalReports: total,
        resolvedReports: resolved,
        inProgressReports: inProg,
        pendingReports: pending,
        criticalOpenIssues: critical,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        totalCommunityUpvotes: upvotes,
        categoryBreakdown,
        departmentBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;